"""Unit tests for the instruction dataset generator (stdlib unittest; no network).

Run from the repo root:
    python -m unittest ml.tests.test_instruct -v
"""
from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from ml import instruct, schema


def _mk_corpus_chunk(cid: str, act_key: str, act_title: str, sec: str,
                     title: str, text: str) -> dict:
    return {
        "id": cid,
        "text": text,
        "meta": {
            "source": "indiacode.gov.in",
            "act_key": act_key,
            "act_title": act_title,
            "act_number": "1",
            "act_year": "2024",
            "section_number": sec,
            "section_title": title,
            "part": 1,
            "total_parts": 1,
            "handle": f"123456789/{abs(hash(cid)) % 10**6}",
            "ministry": "Ministry of Test",
            "repealed": False,
            "retrieved_at": "2026-10-22T00:00:00+00:00",
            "tags": ["test"],
            "citation": f"{act_title}, s.{sec} (India Code, handle 123456789/x)",
            "cluster": cid,
            "split": "train",
        },
    }


TEXT_A = ("Whoever commits robbery shall be punished with rigorous imprisonment "
          "for a term which may extend to ten years, and shall also be liable to "
          "fine. Robbery is theft or extortation accompanied with violence.")
TEXT_B = ("Whoever commits dacoity shall be punished with rigorous imprisonment "
          "for life or with rigorous imprisonment for a term which may extend "
          "to ten years, and shall also be liable to fine. Dacoity is robbery "
          "by five or more persons.")
TEXT_C = ("The police officer in charge of a police station shall reduce the "
          "substance of the information to writing and shall read over the same "
          "to the informant free of cost. Such information is the first "
          "information report.")


def _mk_corpus() -> list:
    chunks = []
    for i in range(15):
        chunks.append(_mk_corpus_chunk(
            f"IC:test_act:s{i}", "test_act", "The Test Act, 2024", str(i),
            "Robbery offense definition.", TEXT_A))
    for i in range(15, 30):
        chunks.append(_mk_corpus_chunk(
            f"IC:test_act:s{i}", "test_act", "The Test Act, 2024", str(i),
            "Robbery attempt punishment.", TEXT_A))
    chunks.append(_mk_corpus_chunk(
        "IC:dacoity_act:s1", "dacoity_act", "The Dacoity Act, 2024", "1",
        "Punishment for dacoity.", TEXT_B))
    chunks.append(_mk_corpus_chunk(
        "IC:procedure_act:s173", "procedure_act", "The Procedure Act, 2024", "173",
        "Procedure for registration of information.", TEXT_C))
    chunks.append(_mk_corpus_chunk(
        "IC:lsa_1987:s12", "lsa_1987", "The Legal Services Authorities Act, 1987",
        "12", "Powers and functions of District Authority.",
        "The District Authority shall exercise the powers and perform the "
        "functions of the District Legal Services Authority."))
    return chunks


class TestBuilders(unittest.TestCase):
    def test_statute_qa_structure_and_grounding(self):
        corpus = _mk_corpus()
        out = instruct.build_statute_qa(corpus, cap=10)
        self.assertGreater(len(out), 0)
        ex = out[0]
        roles = [m["role"] for m in ex["messages"]]
        self.assertEqual(roles, ["system", "user", "assistant"])
        self.assertFalse(ex["meta"]["synthetic"])
        # grounded: quoted chunk text must appear in the answer
        cid = ex["meta"]["cited_chunk_ids"][0]
        chunk = next(c for c in corpus if c["id"] == cid)
        self.assertIn(chunk["text"].split()[0], ex["messages"][-1]["content"])
        self.assertIn("not legal advice", ex["messages"][-1]["content"])

    def test_statute_qa_deterministic(self):
        corpus = _mk_corpus()
        a = instruct.build_statute_qa(corpus, cap=10)
        b = instruct.build_statute_qa(corpus, cap=10)
        self.assertEqual([e["id"] for e in a], [e["id"] for e in b])

    def test_citation_drill_names_real_section(self):
        corpus = _mk_corpus()
        out = instruct.build_citation_drill(corpus, cap=50)
        self.assertGreater(len(out), 0)
        ex = out[0]
        self.assertIn("section", ex["messages"][1]["content"].lower())
        self.assertIn("Source:", ex["messages"][-1]["content"])

    def test_concept_distinction_pairs_share_noun(self):
        corpus = _mk_corpus()
        out = instruct.build_concept_distinction(corpus, cap=10)
        # "Robbery and dacoity explained." sections share head nouns -> pairs
        self.assertGreater(len(out), 0)
        self.assertIn("difference between", out[0]["messages"][1]["content"])

    def test_fixed_sets_flagged_for_review(self):
        out = instruct.build_fixed_sets(_mk_corpus())
        cats = {e["meta"]["category"] for e in out}
        self.assertIn("refusal_out_of_scope", cats)
        self.assertIn("hindi_basic", cats)
        self.assertIn("legal_aid_navigation", cats)  # lsa chunk present
        for e in out:
            self.assertTrue(e["meta"]["synthetic"])
            self.assertTrue(e["meta"]["review_required"])

    def test_hindi_has_devanagari(self):
        out = instruct.build_fixed_sets(_mk_corpus())
        hindi = [e for e in out if e["meta"]["category"] == "hindi_basic"]
        self.assertGreater(len(hindi), 0)
        devanagari = sum(1 for ch in hindi[0]["messages"][-1]["content"] if "ऀ" <= ch <= "ॿ")
        self.assertGreater(devanagari, 20)


class TestValidation(unittest.TestCase):
    def test_examples_pass(self):
        corpus = _mk_corpus()
        stat = instruct.build_statute_qa(corpus, cap=5)
        pairs = instruct._citation_pairs(corpus)
        ok, report = instruct.validate_examples(stat, pairs)
        self.assertTrue(ok, report)

    def test_bad_roles_rejected(self):
        ex = instruct._mk("statute_qa",
                          [{"role": "user", "content": "q"},
                           {"role": "assistant", "content": "a" * 50}],
                          {}, False, False)
        ok, report = instruct.validate_examples([ex], set())
        self.assertFalse(ok)

    def test_citation_existence_check(self):
        corpus = _mk_corpus()
        stat = instruct.build_statute_qa(corpus, cap=5)
        stat[0]["meta"]["cited_chunk_ids"] = ["IC:nonexistent:s999"]
        report = instruct.validate_citations_exist(stat, corpus)
        self.assertFalse(report["valid"])
        self.assertEqual(report["missing_citations"], 1)

    def test_duplicate_payload_rejected(self):
        corpus = _mk_corpus()
        stat = instruct.build_statute_qa(corpus, cap=3)
        dup = dict(stat[0])
        dup["id"] = "IN:somewhere:else"
        ok, report = instruct.validate_examples(stat + [dup], set())
        self.assertFalse(ok)


class TestSplit(unittest.TestCase):
    def test_split_covers_all_and_is_deterministic(self):
        corpus = _mk_corpus()
        stat = instruct.build_statute_qa(corpus, cap=20)
        s1 = instruct.split_examples(stat)
        s2 = instruct.split_examples(stat)
        total = sum(len(v) for v in s1.values())
        self.assertEqual(total, len(stat))
        self.assertEqual(
            {k: [e["id"] for e in v] for k, v in s1.items()},
            {k: [e["id"] for e in v] for k, v in s2.items()})


class TestEndToEnd(unittest.TestCase):
    def test_generate_writes_files(self):
        corpus = _mk_corpus()
        with tempfile.TemporaryDirectory() as td:
            corpus_path = Path(td) / "sections.jsonl"
            schema.write_jsonl(corpus_path, corpus)
            out_dir = Path(td) / "instruct"
            report = instruct.generate(corpus_path, out_dir, verbose=False)
            self.assertTrue(report["validation"]["valid"])
            self.assertTrue(report["citation_check"]["valid"])
            self.assertGreater(report["examples"], 20)
            self.assertTrue((out_dir / "instruct.jsonl").exists())
            self.assertTrue((out_dir / "instruct_train.jsonl").exists())
            self.assertTrue((out_dir / "instruct_report.json").exists())


if __name__ == "__main__":
    unittest.main()
