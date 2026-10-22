"""Central paths and constants for the dataset pipeline."""
from __future__ import annotations

import os
from pathlib import Path

# ml/ package root (this file lives at ml/config.py)
ML_ROOT = Path(__file__).resolve().parent
# repository root
REPO_ROOT = ML_ROOT.parent

DATA_DIR = Path(os.environ.get("ML_DATA_DIR", ML_ROOT / "data"))
RAW_DIR = DATA_DIR / "raw" / "indiacode"
PROCESSED_DIR = DATA_DIR / "processed"
CONFIGS_DIR = ML_ROOT / "configs"

DEFAULT_MANIFEST = CONFIGS_DIR / "corpus_manifest.json"

# India Code DSpace 9.1 REST base (verified 2026-10-22; old indiacode.nic.in redirects here)
INDIACODE_API = "https://indiacode.gov.in/server/api"
INDIACODE_UI = "https://indiacode.gov.in"

# Networking: polite + resilient (gov sites + transient DNS failures observed)
HTTP_TIMEOUT_SEC = 40
HTTP_RETRIES = 4
HTTP_BACKOFF_SEC = 2.0
REQUEST_PAUSE_SEC = 0.35  # pause between upstream API calls
PAGE_SIZE = 100  # DSpace discover page size

# Chunking defaults (chars; ~1 token ~ 4 chars English legal text)
CHUNK_MIN_CHARS = 40
CHUNK_MAX_CHARS = 3600
CHUNK_OVERLAP_CHARS = 150

# Dedup / split
NEAR_DUP_JACCARD = 0.80  # clusters formed at this similarity
MINHASH_PERMS = 64
MINHASH_BANDS = 16  # 16 bands x 4 rows
SPLIT_TRAIN = 0.80
SPLIT_VAL = 0.10  # test = remainder
