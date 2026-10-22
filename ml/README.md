# LegalSathi AI — Indian Legal Corpus Dataset Pipeline

Reproducible pipeline that builds a section-level corpus of Indian statutes from
**India Code** (https://indiacode.gov.in — the Government of India's official
statute repository, operated as a DSpace 9.1 instance), for use in RAG indexing
and instruction-dataset construction.

**Source honesty guarantees built into the pipeline:**

- Every chunk's text is retrieved verbatim from India Code; nothing is generated
  or paraphrased by this pipeline.
- Every chunk carries full citation metadata: act title, act number, section
  number, India Code handle/URL, ministry, retrieval timestamp.
- Raw API responses are cached under `ml/data/raw/` so a build can be replayed
  offline and audited byte-for-byte.
- The build refuses to emit a dataset that fails schema validation.

## Quick start

```bash
# from the repository root
python -m ml build                      # full build (all acts in the manifest)
python -m ml build --acts bns_2023      # one act only
python -m ml build --offline            # replay from cache, no network
python -m ml validate                   # re-validate ml/data/processed/sections.jsonl
python -m ml stats                      # summary statistics
python -m unittest ml.tests.test_pipeline   # unit tests (no network needed)
```

Requires Python ≥ 3.9 and `requests`-free stdlib only (the fetcher uses
`urllib`). No ML dependencies are needed until training/RAG stages.

## How it works

```
manifest (ml/configs/corpus_manifest.json)
   │  list of acts: key, exact India Code title, expected_min_sections, tags
   ▼
indiacode.py  — resolve exact CENTRAL act item → enumerate every section via
                DSpace discover API (act_id-filtered, paged, cached, retried)
   ▼
clean.py      — HTML → plain text (verbatim wording; whitespace normalised)
   ▼
chunk.py      — one section = one chunk; long sections split at subsection
                boundaries (1)(2)(3)… with overlap; id IC:<act>:s<section>[#pN]
   ▼
dedup.py      — exact-dup removal + minhash-LSH near-dup clustering (union-find)
   ▼
split.py      — leakage-guarded 80/10/10 split: assignment by sha256(cluster
                root), so near-duplicate sections can never span train/val/test
   ▼
schema.py     — validation (ids, text, citation metadata, source whitelist);
                build ABORTS on any violation
   ▼
outputs: ml/data/processed/{sections,train,val,test}.jsonl,
         corpus_manifest.json (counts + sha256 of every output),
         report.md (human-readable build report)
```

## Record format

```json
{
  "id": "IC:bns_2023:s14",
  "text": "Nothing is an offence which is done by a person who is, or who ...",
  "meta": {
    "source": "indiacode.gov.in",
    "act_key": "bns_2023",
    "act_title": "The Bharatiya Nyaya Sanhita, 2023",
    "act_number": "45",
    "act_year": "2023",
    "section_number": "14",
    "section_title": "Act done by a person bound, or by mistake of fact ...",
    "part": 1, "total_parts": 1,
    "handle": "123456789/545506",
    "ministry": "Ministry of Home Affairs",
    "repealed": false,
    "retrieved_at": "2026-10-22T05:02:03+00:00",
    "tags": ["criminal", "police", "ipc-replacement"],
    "citation": "The Bharatiya Nyaya Sanhita, 2023, s.14 (India Code, handle 123456789/545506)",
    "cluster": "IC:bns_2023:s14",
    "split": "train"
  }
}
```

`citation` strings are what downstream RAG and the eval harness use to verify
that no answer invents a provision.

## Corpus coverage (manifest)

Covers the nine assistant domains plus procedure/evidence backbone:
BNS, BNSS, BSA (2023 replacements), IPC/CrPC/Evidence Act (legacy, still
governs older cases), CPC, Contract Act, PWDVA, Dowry Prohibition, POSH,
DPDP Act, IT Act, Consumer Protection Act, Senior Citizens Act, Juvenile
Justice Act, POCSO, Copyright Act, Legal Services Authorities Act, RTI Act.

Notes:

- India Code stores the same act once per state; the pipeline always selects the
  **CENTRAL** copy (act_id prefix `AC_CEN_`), the authoritative national text.
- The legacy trio (IPC 1860 / CrPC 1973 / Evidence Act 1872) is **not
  ingestible**: India Code repealed the central copies when BNS/BNSS/BSA took
  effect (1 July 2024) and keeps only repeal tombstones and empty state stubs —
  no section text. The assistant must never quote legacy section text it does
  not have; for pre-2024 conduct it should say so and point to professional
  review. BNS/BNSS/BSA largely carry the same substantive law forward.
- `expected_min_sections` in the manifest is a silent-failure tripwire: the
  build logs a WARN if an act comes back with fewer sections than expected.
- If an act cannot be resolved it is reported under `fetch_errors` in the
  report — the build does not pretend the act was ingested.

## Adding an act

1. Find its exact title on https://indiacode.gov.in (search by name).
2. Add an entry to `ml/configs/corpus_manifest.json` with `key`, `title`,
   a conservative `expected_min_sections`, and domain `tags`.
3. Run `python -m ml build --acts <key>` and check the printed report.

## Data retention

`ml/data/raw/` and `ml/data/processed/*.jsonl` are **gitignored** (regenerable);
`corpus_manifest.json` and `report.md` are committed so every build is
attributable and auditable. Re-run the pipeline to reproduce the corpus.
