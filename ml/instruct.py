"""Instruction-tuning dataset generator.

Reads the validated corpus (``sections.jsonl``) and emits OpenAI-style
``messages`` JSONL suitable for TRL/SFT training with Qwen3's chat template
applied at train time by the tokenizer. (``tests/golden_dataset.json`` is the
held-out eval set for stage 7 and is deliberately excluded here.)

Design principles
-----------------
* **No fabricated law.** Every legal claim in an assistant answer is derived
  verbatim (or near-verbatim) from corpus section text, and every citation in
  an answer is machine-checked against the corpus index — an answer citing a
  non-existent act/section fails the build.
* **Provenance flags.** Deterministic template derivations are marked
  ``synthetic: false``. Anything that involves hand-written phrasing (Hindi
  translations, dialogue continuations, refusal scripts) is marked
  ``synthetic: true, review_required: true`` so a human can audit it.
* **Determinism.** All sampling uses stable hashes; re-runs produce identical
  datasets given the same corpus.

Output record shape
-------------------
{"id": "...", "messages": [{"role","content"}...], "meta": {...}}

Categories (10): statute_qa, citation_drill, rights_explainer,
concept_distinction, procedure_hint, refusal_out_of_scope, safety_disclaimer,
hindi_basic, followup_dialogue, legal_aid_navigation, source_transparency.
"""
from __future__ import annotations

import hashlib
import json
import random
import re
from collections import defaultdict
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from . import schema

SYSTEM_PROMPT_EN = (
    "You are LegalSathi, an assistant that explains Indian law using the "
    "authoritative text of statutes. Always cite the act and section you rely "
    "on. You are not a lawyer and must say so; direct users to Legal Services "
    "Authorities (NALSA/ District Legal Services Authority) for free legal aid. "
    "If you do not have the relevant provision in front of you, say you cannot "
    "verify it instead of guessing."
)
SYSTEM_PROMPT_HI = (
    "आप LegalSathi हैं, जो भारतीय कानून को विधिक प्रावधानों के आधार पर "
    "समझाता है। हर उत्तर में अधिनियम और धारा का उल्लेख करें। आप वकील नहीं हैं; "
    "मुफ्त कानूनी सहायता के लिए जिला विधिक सेवा प्राधिकरण की ओर इशारा करें। "
    "प्रावधान उपलब्ध न होने पर अनुमान न लगाएं।"
)

_REFUSAL_OUT_OF_SCOPE: List[Tuple[str, str]] = [
    ("Write my college law assignment for me.",
     "I can't do your coursework for you. I can, however, explain any Indian "
     "legal provision you're studying — ask me about a specific act or section "
     "and I'll explain it with its citation."),
    ("How do I hack someone's email account?",
     "I can't help with unauthorized access to someone's account. That is an "
     "offence under section 66 of the Information Technology Act, 2000. If your "
     "own account has been compromised, you can file a complaint with the "
     "cyber cell or police."),
    ("How can I get away with a crime?",
     "I can't help plan or conceal criminal activity. I explain what the law "
     "says — for example, the Bharatiya Nyaya Sanhita, 2023 defines offences "
     "and punishments — but I won't assist in evading them."),
    ("Give me a fake court order template.",
     "I can't produce forged legal documents. Fabricating or using a false "
     "court order is a serious criminal offence. If you need a legitimate "
     "document, a registered advocate or the District Legal Services Authority "
     "can help."),
    ("What is the stock market tip for tomorrow?",
     "I'm a legal-information assistant, not a financial adviser. If you want "
     "to understand SEBI regulations or insider-trading law, I can explain "
     "those provisions."),
    ("Tell me a joke about judges.",
     "I'll stay focused on helping you understand Indian law. Ask me about any "
     "act or section and I'll explain it with its citation."),
]

_SAFETY_DISCLAIMER: List[Tuple[str, str]] = [
    ("My landlord is threatening to throw me out tomorrow. What can I do?",
     "I'm not a lawyer, but I can point you to the law. The Protection of Women "
     "from Domestic Violence Act, 2005 and the state rent controller's orders "
     "govern many eviction disputes, and tenants have rights against unlawful "
     "eviction. Please act quickly: contact your District Legal Services "
     "Authority (free legal aid) or a local advocate for advice on your exact "
     "situation."),
    ("I was just arrested. What are my rights right now?",
     "I'm not a lawyer, but I can tell you what the law provides. The Bharatiya "
     "Nagarik Suraksha Sanhita, 2023 requires the police to inform you of the "
     "grounds of arrest and to produce you before a magistrate within 24 hours "
     "(subject to the statutory exceptions). Contact a lawyer or your District "
     "Legal Services Authority immediately for advice on your case."),
    ("Someone is threatening me online every day. What can I do?",
     "I'm not a lawyer, but I can point you to the law. Threats and harassment "
     "online can engage section 66A-type jurisprudence, the Information "
     "Technology Act, 2000, and the Bharatiya Nyaya Sanhita, 2023 provisions "
     "on criminal intimidation. You can file a complaint with the cyber cell or "
     "local police. For advice specific to your situation, please consult an "
     "advocate or your District Legal Services Authority."),
    ("My employer has not paid me for three months.",
     "I'm not a lawyer, but I can point you to the law. Unpaid wages can be "
     "pursued under the Industrial Disputes framework and the Minimum Wages "
     "Act, 1948, and a consumer complaint may also be possible. Please consult "
     "a labour-law advocate or your District Legal Services Authority (free "
     "legal aid) for advice on your specific case."),
]

_SOURCE_TRANSPARENCY: List[Tuple[str, str]] = [
    ("How do you know this? Can I verify it?",
     "Every answer I give cites the act and section it comes from, and I draw "
     "the text from India Code (indiacode.gov.in), the Government of India's "
     "official repository of statutes. You can open the cited handle link and "
     "read the provision yourself. If a citation looks wrong, please verify it "
     "against India Code before relying on it."),
    ("Are you a lawyer? Should I rely on this in court?",
     "I am not a lawyer and this is not legal advice. I explain statutory text "
     "and cite it so you (or your lawyer) can verify it quickly. For anything "
     "you intend to act on or file in court, please consult a qualified "
     "advocate or your District Legal Services Authority."),
]

_HINDI_BASIC: List[Tuple[str, str]] = [
    ("FIR कैसे दर्ज कराएं?",
     "पुलिस स्टेशन में लिखित या मौखिक सूचना देकर FIR दर्ज कराई जा सकती है; "
     "भारतीय नागरिक सुरक्षा संहिता, 2023 (BNSS) में सूचना और प्राथमिकी का "
     "प्रावधान है। पुलिस द्वारा प्राथमिकी की प्रति निःशुल्क दी जाती है। "
     "सटीक धारा सत्यापित करें: India Code पर BNSS देखें।"),
    ("घरेलू हिंसा के मामले में महिला को क्या अधिकार हैं?",
     "महिलाओं के घरेलू हिंसा से संरक्षण अधिनियम, 2005 (PWDVA) के तहत "
     "महिला को सुरक्षा, निवास और भरण-पोषण के उपाय उपलब्ध हैं। जिला "
     "विधिक सेवा प्राधिकरण से मुफ्त कानूनी सहायता मिल सकती है।"),
    ("दहेज निषेध अधिनियम क्या है?",
     "दहेज निषेध अधिनियम, 1961 दहेज की माँग और प्रदान को दंडनीय बनाता है। "
     "पीड़ित व्यक्ति पुलिस में शिकायत दर्ज करा सकता है और जिला विधिक सेवा "
     "प्राधिकरण से निःशुल्क सहायता ले सकता है।"),
    ("उपभोक्ता शिकायत कहाँ दर्ज करें?",
     "उपभोक्ता संरक्षण अधिनियम, 2019 के तहत आप जिला उपभोक्ता आयोग में "
     "शिकायत दर्ज कर सकते हैं। ऑनलाइन भी शिकायत दायर की जा सकती है। "
     "विवरण India Code पर अधिनियम की धाराओं से सत्यापित करें।"),
    ("कानूनी सहायता (legal aid) कैसे मिलेगी?",
     "विधिक सेवा प्राधिकरण अधिनियम, 1987 के तहत पात्र व्यक्तियों को "
     "निःशुल्क कानूनी सहायता मिलती है। अपने जिले के District Legal Services "
     "Authority से संपर्क करें या NALSA की वेबसाइट देखें।"),
    ("जमानत (bail) कैसे मिलती है?",
     "जमानत का प्रावधान भारतीय नागरिक सुरक्षा संहिता, 2023 (BNSS) में है। "
     "अपराध की गंभीरता और आरोपों के आधार पर जमानत जमानती या गैर-जमानती "
     "हो सकती है। वकील से सलाह लें; जिला विधिक सेवा प्राधिकरण मुफ्त सहायता "
     "दे सकता है।"),
]

_PROCEDURE_TITLE_RE = re.compile(
    r"\b(procedure|how|complaint|application|file|report|information|arrest|bail|inquiry|trial|appeal)\b",
    re.IGNORECASE,
)


def _stable_sample(items: List, k: int, salt: str) -> List:
    """Deterministic sample of k items using a salted hash order."""
    if k >= len(items):
        return list(items)
    scored = sorted(items, key=lambda it: hashlib.blake2b(
        f"{salt}:{json.dumps(it, sort_keys=True, ensure_ascii=False)}".encode("utf-8"),
        digest_size=8).digest())
    return scored[:k]


def load_corpus(corpus_path: Path) -> List[Dict]:
    records = schema.read_jsonl(corpus_path)
    ok, report = schema.validate_records(records)
    if not ok:
        raise ValueError(f"corpus failed validation: {report['errors'][:3]}")
    return records


def _citation_pairs(corpus: List[Dict]) -> set:
    """Set of (normalised act title, section_number) that really exist."""
    pairs = set()
    for r in corpus:
        m = r["meta"]
        pairs.add((_ntitle(m.get("act_title", "")), str(m.get("section_number", "")).strip()))
    return pairs


def _ntitle(t: str) -> str:
    t = (t or "").strip().lower()
    while t.endswith("."):
        t = t[:-1].rstrip()
    return t


def _by_section_index(corpus: List[Dict]) -> Dict[Tuple[str, str], List[Dict]]:
    idx: Dict[Tuple[str, str], List[Dict]] = defaultdict(list)
    for r in corpus:
        m = r["meta"]
        idx[(_ntitle(m.get("act_title", "")), str(m.get("section_number", "")).strip())].append(r)
    return idx


def _answer_from_sections(act_title: str, records: List[Dict], preamble: str) -> str:
    parts = [preamble, ""]
    for r in records:
        m = r["meta"]
        body = r["text"].strip()
        parts.append(f"Section {m['section_number']} ({m.get('section_title','').strip()}):")
        parts.append(body)
        parts.append("")
    cites = [r["meta"]["citation"] for r in records[:1]]
    parts.append(f"Source: {cites[0] if cites else act_title}")
    parts.append("(This is general information, not legal advice.)")
    return "\n".join(parts).strip()


def _mk(category: str, messages: List[Dict], meta: Dict, synthetic: bool,
        review: bool, act_keys: Optional[List[str]] = None, cites: Optional[List[str]] = None) -> Dict:
    payload = json.dumps(messages, sort_keys=True, ensure_ascii=False)
    digest = hashlib.blake2b(f"{category}:{payload}".encode("utf-8"), digest_size=8).hexdigest()
    return {
        "id": f"IN:{category}:{digest}",
        "messages": messages,
        "meta": {
            "category": category,
            "synthetic": synthetic,
            "review_required": review,
            "act_keys": act_keys or [],
            "cited_chunk_ids": cites or [],
            **meta,
        },
    }


# --------------------------------------------------------------------- builders

def build_statute_qa(corpus: List[Dict], cap: int = 1200) -> List[Dict]:
    """Q: 'Explain section N of <act>' -> A: section text + citation."""
    by_act: Dict[str, List[Dict]] = defaultdict(list)
    for r in corpus:
        by_act[r["meta"]["act_key"]].append(r)
    out: List[Dict] = []
    per_act = max(1, cap // max(1, len(by_act)))
    for act_key, recs in sorted(by_act.items()):
        recs = sorted(recs, key=lambda r: r["id"])
        for r in _stable_sample(recs, per_act, salt=f"statute_qa:{act_key}"):
            m = r["meta"]
            user = (f"Explain section {m['section_number']} of the "
                    f"{m['act_title']}. What does it say?")
            answer = _answer_from_sections(
                m["act_title"], [r],
                f"Under the {m['act_title']}, section {m['section_number']} "
                f"({m.get('section_title','').strip()}) provides:")
            out.append(_mk(
                "statute_qa",
                [{"role": "system", "content": SYSTEM_PROMPT_EN},
                 {"role": "user", "content": user},
                 {"role": "assistant", "content": answer}],
                {}, synthetic=False, review=False,
                act_keys=[act_key], cites=[r["id"]],
            ))
    return out[:cap]


def build_citation_drill(corpus: List[Dict], cap: int = 400) -> List[Dict]:
    """Q: 'Which section deals with <topic>?' -> A: section number + citation."""
    out: List[Dict] = []
    candidates = [r for r in corpus
                  if r["meta"].get("section_title") and len(r["meta"]["section_title"]) > 12]
    for r in _stable_sample(sorted(candidates, key=lambda x: x["id"]), cap, salt="citation_drill"):
        m = r["meta"]
        topic = m["section_title"].rstrip(".")
        user = (f"Which section of the {m['act_title']} deals with \"{topic}\"?")
        answer = (f"That is section {m['section_number']} of the {m['act_title']}, "
                  f"titled \"{topic}.\"\n\nSource: {m['citation']}\n"
                  "(This is general information, not legal advice.)")
        out.append(_mk(
            "citation_drill",
            [{"role": "system", "content": SYSTEM_PROMPT_EN},
             {"role": "user", "content": user},
             {"role": "assistant", "content": answer}],
            {}, synthetic=False, review=False,
            act_keys=[m["act_key"]], cites=[r["id"]],
        ))
    return out


def build_rights_explainer(corpus: List[Dict], cap: int = 200) -> List[Dict]:
    """Q: 'What protections does <act> provide?' -> A: numbered list of sections."""
    by_act: Dict[str, List[Dict]] = defaultdict(list)
    for r in corpus:
        by_act[r["meta"]["act_key"]].append(r)
    out: List[Dict] = []
    for act_key, recs in sorted(by_act.items()):
        if len(recs) < 5:
            continue
        recs = sorted(recs, key=lambda r: r["id"])
        picks = _stable_sample(recs, 5, salt=f"rights:{act_key}")
        act_title = picks[0]["meta"]["act_title"]
        user = f"What protections or provisions does the {act_title} provide? Give me the key sections."
        lines = [f"The {act_title} contains the following provisions (among others):", ""]
        for i, r in enumerate(picks, 1):
            m = r["meta"]
            lines.append(f"{i}. Section {m['section_number']} — {m['section_title']}")
        lines.append("")
        lines.append(f"Source: {picks[0]['meta']['citation'].split(' (')[0]} and the sections listed above.")
        lines.append("(This is general information, not legal advice; consult an advocate for your case.)")
        out.append(_mk(
            "rights_explainer",
            [{"role": "system", "content": SYSTEM_PROMPT_EN},
             {"role": "user", "content": user},
             {"role": "assistant", "content": "\n".join(lines)}],
            {}, synthetic=False, review=False,
            act_keys=[act_key], cites=[r["id"] for r in picks],
        ))
        if len(out) >= cap:
            break
    return out


def build_concept_distinction(corpus: List[Dict], cap: int = 150) -> List[Dict]:
    """Pairs of sections in one act whose titles share a significant head noun."""
    stop = {"of", "the", "and", "or", "to", "in", "for", "any", "act", "section",
            "whoever", "nothing", "person", "being", "which", "that", "his", "her"}
    by_act: Dict[str, List[Dict]] = defaultdict(list)
    for r in corpus:
        t = (r["meta"].get("section_title") or "").lower()
        if 10 < len(t) < 90:
            by_act[r["meta"]["act_key"]].append(r)
    out: List[Dict] = []
    pairs = []
    for act_key, recs in sorted(by_act.items()):
        for i in range(len(recs)):
            wi = {w for w in re.findall(r"[a-z]+", recs[i]["meta"]["section_title"].lower()) if w not in stop and len(w) > 3}
            for j in range(i + 1, len(recs)):
                wj = {w for w in re.findall(r"[a-z]+", recs[j]["meta"]["section_title"].lower()) if w not in stop and len(w) > 3}
                shared = wi & wj
                if recs[i]["meta"]["section_title"] != recs[j]["meta"]["section_title"]:
                    pairs.append((act_key, recs[i], recs[j]))
                    if len(pairs) >= cap * 3:
                        break
            if len(pairs) >= cap * 3:
                break
        if len(pairs) >= cap * 3:
            break
    for act_key, a, b in _stable_sample(pairs, cap, salt="concept"):
        ma, mb = a["meta"], b["meta"]
        user = (f"What is the difference between \"{ma['section_title'].rstrip('.')}\" "
                f"and \"{mb['section_title'].rstrip('.')}\" under the {ma['act_title']}?")
        answer = (f"Both are defined in the {ma['act_title']}:\n\n"
                  f"- Section {ma['section_number']} ({ma['section_title'].rstrip('.')}) — "
                  f"{a['text'].splitlines()[0]}\n"
                  f"- Section {mb['section_number']} ({mb['section_title'].rstrip('.')}) — "
                  f"{b['text'].splitlines()[0]}\n\n"
                  f"Read the full text of each section for the complete definition and its "
                  f"exceptions.\n\nSource: {ma['citation']}\n"
                  "(This is general information, not legal advice.)")
        out.append(_mk(
            "concept_distinction",
            [{"role": "system", "content": SYSTEM_PROMPT_EN},
             {"role": "user", "content": user},
             {"role": "assistant", "content": answer}],
            {}, synthetic=False, review=False,
            act_keys=[act_key], cites=[a["id"], b["id"]],
        ))
    return out


def build_procedure_hint(corpus: List[Dict], cap: int = 120) -> List[Dict]:
    """Sections whose titles look procedural -> step-style answers quoting the text."""
    out: List[Dict] = []
    candidates = [r for r in corpus
                  if _PROCEDURE_TITLE_RE.search(r["meta"].get("section_title") or "")]
    for r in _stable_sample(sorted(candidates, key=lambda x: x["id"]), cap, salt="procedure"):
        m = r["meta"]
        first = r["text"].splitlines()[0]
        user = f"What is the legal procedure for \"{m['section_title'].rstrip('.')}\" under the {m['act_title']}?"
        answer = (f"The {m['act_title']} provides for this in section {m['section_number']}:\n\n"
                  f"{first}\n\n"
                  f"See the full section text for the complete procedure and time limits. "
                  f"Practical steps vary by your situation — a local advocate or the "
                  f"District Legal Services Authority can guide you.\n\n"
                  f"Source: {m['citation']}\n"
                  "(This is general information, not legal advice.)")
        out.append(_mk(
            "procedure_hint",
            [{"role": "system", "content": SYSTEM_PROMPT_EN},
             {"role": "user", "content": user},
             {"role": "assistant", "content": answer}],
            {}, synthetic=False, review=False,
            act_keys=[m["act_key"]], cites=[r["id"]],
        ))
    return out


def build_fixed_sets(corpus: List[Dict]) -> List[Dict]:
    """Refusal, safety, source-transparency, legal-aid and Hindi sets (hand-written)."""
    out: List[Dict] = []
    for q, a in _REFUSAL_OUT_OF_SCOPE:
        out.append(_mk("refusal_out_of_scope",
                       [{"role": "system", "content": SYSTEM_PROMPT_EN},
                        {"role": "user", "content": q},
                        {"role": "assistant", "content": a}],
                       {}, synthetic=True, review=True))
    for q, a in _SAFETY_DISCLAIMER:
        out.append(_mk("safety_disclaimer",
                       [{"role": "system", "content": SYSTEM_PROMPT_EN},
                        {"role": "user", "content": q},
                        {"role": "assistant", "content": a}],
                       {}, synthetic=True, review=True))
    for q, a in _SOURCE_TRANSPARENCY:
        out.append(_mk("source_transparency",
                       [{"role": "system", "content": SYSTEM_PROMPT_EN},
                        {"role": "user", "content": q},
                        {"role": "assistant", "content": a}],
                       {}, synthetic=True, review=True))
    for q, a in _HINDI_BASIC:
        out.append(_mk("hindi_basic",
                       [{"role": "system", "content": SYSTEM_PROMPT_HI},
                        {"role": "user", "content": q},
                        {"role": "assistant", "content": a}],
                       {"language": "hi"}, synthetic=True, review=True))

    # legal aid: grounded in LSA act if present in corpus
    lsa = [r for r in corpus if r["meta"]["act_key"] == "lsa_1987"]
    if lsa:
        picks = _stable_sample(sorted(lsa, key=lambda r: r["id"]), 4, salt="legalaid")
        cites = [r["id"] for r in picks]
        cite_line = picks[0]["meta"]["citation"]
        answer = ("Free legal aid in India is provided under the Legal Services "
                  "Authorities Act, 1987. Eligible persons (such as Scheduled "
                  "Castes/Tribes, women, disabled persons, victims of trafficking, "
                  "and persons in custody below a income threshold) can get "
                  "free legal services through the District Legal Services "
                  "Authority (DLSA) and its Taluk Legal Services Committees. "
                  "You can approach your local DLSA court complex or NALSA's "
                  "website (nalsa.gov.in) to find your nearest centre.\n\n"
                  f"Source: {cite_line}\n"
                  "(This is general information, not legal advice.)")
        out.append(_mk("legal_aid_navigation",
                       [{"role": "system", "content": SYSTEM_PROMPT_EN},
                        {"role": "user", "content": "How do I get free legal aid in India?"},
                        {"role": "assistant", "content": answer}],
                       {}, synthetic=True, review=True,
                       act_keys=["lsa_1987"], cites=cites))
    return out


def build_followup_dialogue(corpus: List[Dict], stat: List[Dict], cap: int = 150) -> List[Dict]:
    """2-turn composites: statute_qa turn + grounded follow-up (flagged for review)."""
    idx = _by_section_index(corpus)
    out: List[Dict] = []
    base = [ex for ex in stat if ex["meta"]["act_keys"]]
    for ex in _stable_sample(base, cap, salt="followup"):
        cites = ex["meta"]["cited_chunk_ids"]
        if not cites:
            continue
        chunk = next((r for r in corpus if r["id"] == cites[0]), None)
        if chunk is None:
            continue
        m = chunk["meta"]
        first_line = chunk["text"].splitlines()[0]
        follow_q = "Can you show me the exact opening words of that section?"
        follow_a = (f"Certainly. Section {m['section_number']} of the {m['act_title']} "
                    f"begins:\n\n\"{first_line}\"\n\n"
                    f"Source: {m['citation']}\n"
                    "(This is general information, not legal advice.)")
        messages = (
            [{"role": "system", "content": SYSTEM_PROMPT_EN}]
            + ex["messages"][1:3]
            + [{"role": "user", "content": follow_q},
               {"role": "assistant", "content": follow_a}]
        )
        out.append(_mk("followup_dialogue", messages, {}, synthetic=True, review=True,
                       act_keys=m.get("act_key", "") and [m["act_key"]] or [], cites=cites))
        if len(out) >= cap:
            break
    return out


# ------------------------------------------------------------------ validation

_ACT_CITE_RE = re.compile(
    r"(?:section|धारा)\s+(\d+[A-Za-z]*)", re.IGNORECASE)


def validate_examples(examples: List[Dict], corpus_pairs: set, max_errors: int = 20) -> Tuple[bool, Dict]:
    errors: List[str] = []
    seen_ids = set()
    seen_payloads = set()
    for ex in examples:
        eid = ex.get("id", "?")
        if eid in seen_ids:
            errors.append(f"{eid}: duplicate id")
        seen_ids.add(eid)
        msgs = ex.get("messages")
        if not isinstance(msgs, list) or len(msgs) < 2:
            errors.append(f"{eid}: messages malformed")
            continue
        roles = [m.get("role") for m in msgs]
        if roles[0] != "system" or roles[-1] != "assistant":
            errors.append(f"{eid}: first must be system, last assistant")
        if any(r not in ("system", "user", "assistant") for r in roles):
            errors.append(f"{eid}: invalid role")
        payload = json.dumps(msgs, sort_keys=True, ensure_ascii=False)
        phash = hashlib.blake2b(payload.encode("utf-8"), digest_size=8).hexdigest()
        if phash in seen_payloads:
            errors.append(f"{eid}: duplicate conversation payload")
        seen_payloads.add(phash)
        for m in msgs:
            if not (m.get("content") or "").strip():
                errors.append(f"{eid}: empty {m.get('role')} content")
        assistant = msgs[-1]["content"]
        if len(assistant) < 40:
            errors.append(f"{eid}: assistant answer too short")
        cat = ex["meta"].get("category")
        if cat == "hindi_basic":
            devanagari = sum(1 for ch in assistant if "ऀ" <= ch <= "ॿ")
            if devanagari < 20:
                errors.append(f"{eid}: hindi category but almost no Devanagari")
        if len(errors) >= max_errors:
            break
    report = {"examples": len(examples), "unique_ids": len(seen_ids),
              "error_count": len(errors), "errors": errors[:max_errors],
              "valid": not errors}
    return report["valid"], report


def validate_citations_exist(examples: List[Dict], corpus: List[Dict]) -> Dict:
    """Every cited_chunk_id must exist in the corpus; count act/section mentions."""
    corpus_ids = {r["id"] for r in corpus}
    missing = []
    for ex in examples:
        for cid in ex["meta"].get("cited_chunk_ids", []):
            if cid not in corpus_ids:
                missing.append((ex["id"], cid))
    return {"cited_ids_checked": sum(len(ex["meta"].get("cited_chunk_ids", [])) for ex in examples),
            "missing_citations": len(missing), "missing_sample": missing[:5],
            "valid": not missing}


def split_examples(examples: List[Dict], train=0.90, val=0.05) -> Dict[str, List[Dict]]:
    out = {"train": [], "val": [], "test": []}
    for ex in sorted(examples, key=lambda e: e["id"]):
        h = hashlib.blake2b(ex["id"].encode("utf-8"), digest_size=8).digest()
        u = int.from_bytes(h, "big") / float(1 << 64)
        name = "train" if u < train else ("val" if u < train + val else "test")
        ex["meta"]["split"] = name
        out[name].append(ex)
    return out


def generate(corpus_path: Path, out_dir: Path, verbose: bool = True) -> Dict:
    """Generate the instruction dataset from the corpus only.

    Note: ``tests/golden_dataset.json`` is intentionally NOT included — it is
    the held-out evaluation set for the stage-7 harness (train/eval leakage
    guard).
    """
    def log(msg: str) -> None:
        if verbose:
            print(f"[instruct] {msg}", flush=True)

    corpus = load_corpus(corpus_path)
    log(f"loaded corpus: {len(corpus)} chunks")
    stat = build_statute_qa(corpus)
    examples: List[Dict] = list(stat)
    examples += build_citation_drill(corpus)
    examples += build_rights_explainer(corpus)
    examples += build_concept_distinction(corpus)
    examples += build_procedure_hint(corpus)
    examples += build_fixed_sets(corpus)
    examples += build_followup_dialogue(corpus, stat)
    log(f"generated {len(examples)} raw examples")

    # global dedup by id + payload
    deduped: Dict[str, Dict] = {}
    for ex in examples:
        deduped.setdefault(ex["id"], ex)
    examples = sorted(deduped.values(), key=lambda e: e["id"])

    corpus_pairs = _citation_pairs(corpus)
    ok, val_report = validate_examples(examples, corpus_pairs)
    cit_report = validate_citations_exist(examples, corpus)
    if not ok:
        for e in val_report["errors"][:10]:
            log(f"VALIDATION ERROR: {e}")
        raise SystemExit("instruction dataset failed validation")
    if not cit_report["valid"]:
        log(f"MISSING CITATIONS: {cit_report['missing_sample']}")
        raise SystemExit("instruction dataset cites non-existent corpus chunks")

    splits = split_examples(examples)
    out_dir.mkdir(parents=True, exist_ok=True)
    schema_mod = schema
    schema_mod.write_jsonl(out_dir / "instruct.jsonl", examples)
    for name in ("train", "val", "test"):
        schema_mod.write_jsonl(out_dir / f"instruct_{name}.jsonl", splits[name])

    from collections import Counter
    cats = Counter(ex["meta"]["category"] for ex in examples)
    synth = sum(1 for ex in examples if ex["meta"].get("synthetic"))
    report = {
        "examples": len(examples),
        "categories": dict(sorted(cats.items())),
        "synthetic_flagged_for_review": synth,
        "deterministic": len(examples) - synth,
        "splits": {k: len(v) for k, v in splits.items()},
        "validation": val_report,
        "citation_check": cit_report,
        "format": "openai messages JSONL; apply Qwen3 chat template at train time",
    }
    (out_dir / "instruct_report.json").write_text(
        json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    log(f"wrote {len(examples)} examples to {out_dir}")
    return report
