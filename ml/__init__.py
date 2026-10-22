"""LegalSathi AI — Indian legal corpus dataset pipeline.

Package layout:
    indiacode.py  — India Code (DSpace 9.1 REST) source client with disk cache
    clean.py      — HTML -> plain text normalisation
    chunk.py      — section-level chunking with long-section splitting
    dedup.py      — exact + near-duplicate detection (minhash LSH, union-find)
    split.py      — leakage-guarded train/val/test split by cluster
    schema.py     — chunk record schema + JSONL validator
    build.py      — orchestrator (fetch -> clean -> chunk -> dedup -> split -> validate)
    __main__.py   — CLI entry point (python -m ml.build / python -m ml ...)

Run from the repository root:
    python -m ml build --manifest ml/configs/corpus_manifest.json
"""

__version__ = "0.1.0"
