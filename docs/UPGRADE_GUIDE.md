# LegalSathi AI — Upgrade & Architecture Guide

LegalSathi AI is a specialized Indian legal AI assistant. This guide details the
end-to-end architecture, dataset pipeline, instruction-tuning, RAG engine, and
evaluation harness implemented during the upgrade.

---

## 1. Architecture Overview

- **Frontend**: Next.js 14 app (`frontend/`) deployed on Vercel, communicating with the FastAPI backend via `/api/chat`. Renders structured 9-field responses (`components/legal-response.tsx`).
- **Backend**: FastAPI (`backend/`) deployed on Render, exposing REST endpoints for chat, documents, and vault.
- **RAG Engine**: Hybrid BM25/keyword retrieval engine over 17 authoritative central Indian statutes (2,336 sections) retrieved live from India Code (`indiacode.gov.in`).
- **Training Pipeline**: Reproducible dataset builder (`ml/`) producing a clean corpus and 1,765 instruction-tuning examples for QLoRA fine-tuning of Qwen3-1.7B.

---

## 2. Dataset Pipeline (`ml/`)

The dataset pipeline ingests verbatim statutory text from India Code:
1. **Source Client (`ml/indiacode.py`)**: Paged DSpace 9.1 REST API client with exact-title matching, Central-copy preference (`state_name == CENTRAL`), disk caching, and retry with exponential backoff.
2. **Cleaning (`ml/clean.py`)**: Deterministic HTML-to-text normalisation preserving statutory wording and legal symbols.
3. **Chunking (`ml/chunk.py`)**: 1 section = 1 chunk (with subsection-boundary splitting for long sections).
4. **Dedup & Split (`ml/dedup.py`, `ml/split.py`)**: Exact duplicate removal via Blake2b hashing; near-duplicate clustering via Minhash LSH (5-grams, 64 perms, 16 bands) and Union-Find; leakage-guarded 80/10/10 split by cluster root hash.
5. **Validation (`ml/schema.py`)**: Strict schema validator that aborts builds on any bad record or citation mismatch.

### Corpus Contents (17 Acts, 2,336 Chunks)
- Bharatiya Nyaya Sanhita, 2023 (BNS)
- Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)
- Bharatiya Sakshya Adhiniyam, 2023 (BSA)
- Information Technology Act, 2000 (ITA)
- Consumer Protection Act, 2019 (CPA)
- Code of Civil Procedure, 1908 (CPC)
- Indian Contract Act, 1872
- Protection of Women from Domestic Violence Act, 2005 (PWDVA)
- Dowry Prohibition Act, 1961
- POSH Act, 2013
- Digital Personal Data Protection Act, 2023 (DPDP)
- Maintenance and Welfare of Parents and Senior Citizens Act, 2007
- Juvenile Justice Act, 2015
- POCSO Act, 2012
- Copyright Act, 1957
- Legal Services Authorities Act, 1987 (LSA)
- Right to Information Act, 2005 (RTI)

*(Note: Legacy central acts like IPC 1860, CrPC 1973, and Indian Evidence Act 1872 are marked repealed on India Code; their substance is carried forward by BNS/BNSS/BSA).*

---

## 3. Instruction Dataset (`ml/instruct.py`)

Generates 1,765 OpenAI-style conversation examples across 11 categories:
- Statute Q&A, Citation Drills, Rights Explainers, Concept Distinctions, Procedure Hints, Refusals, Safety Disclaimers, Hindi Basic QA, Legal Aid Navigation, and Follow-up Dialogue.
- Strictly excludes held-out eval set (`golden_dataset.json`) to prevent data leakage.

---

## 4. Real RAG Engine (`backend/rag/real_rag.py`)

Replaces keyword stubs with a robust in-memory BM25 retrieval engine over all 2,336 corpus sections. Returns structured JSON with official India Code citation URLs and confidence scores.

---

## 5. 4-Way Evaluation Harness (`tests/eval_harness.py`)

Evaluates Base Model, Base+RAG, Tuned Model, and Tuned+RAG against golden cases (`tests/golden_dataset.json`) on correctness, latency, and citation validity.
