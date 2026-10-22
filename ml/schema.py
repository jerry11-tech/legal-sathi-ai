"""Chunk record schema + JSONL validation.

Every emitted record must be self-describing and citation-traceable: the
metadata carries the act title, section number and the India Code handle/URL so
downstream RAG can cite and the eval harness can verify citations against the
authoritative source. Records that fail validation abort the build.
"""
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Dict, List, Tuple
from urllib.parse import urlparse

ALLOWED_SOURCE_HOSTS = {"indiacode.gov.in"}

_ID_RE = re.compile(r"^IC:[a-z0-9_]+:s[0-9A-Za-z.\-]+(#p\d+)?$")

REQUIRED_META_KEYS = (
    "source", "act_key", "act_title", "section_number", "section_title",
    "cluster", "split", "retrieved_at",
)


def record_url(meta: Dict) -> str:
    handle = meta.get("handle")
    if handle:
        return f"https://indiacode.gov.in/handle/{handle}"
    return ""


def validate_record(rec: Dict, index: int) -> List[str]:
    """Return a list of error strings (empty == valid)."""
    errs: List[str] = []
    if not isinstance(rec, dict):
        return [f"record {index}: not an object"]
    rid = rec.get("id")
    if not rid or not isinstance(rid, str) or not _ID_RE.match(rid):
        errs.append(f"record {index}: bad or missing id: {rid!r}")
    text = rec.get("text")
    if not isinstance(text, str) or len(text.strip()) < 40:
        errs.append(f"record {index}: text missing or too short")
    elif sum(1 for ch in text if ch.isalpha()) < 10:
        errs.append(f"record {index}: text has too few letters (likely garbage)")
    meta = rec.get("meta")
    if not isinstance(meta, dict):
        errs.append(f"record {index}: meta missing")
        return errs
    for k in REQUIRED_META_KEYS:
        if k not in meta or meta[k] in (None, ""):
            errs.append(f"record {index}: meta.{k} missing/empty")
    src = str(meta.get("source", ""))
    host = urlparse("https://" + src if src and "://" not in src else src).netloc
    if src and host not in ALLOWED_SOURCE_HOSTS:
        errs.append(f"record {index}: source host not allowed: {src!r}")
    url = record_url(meta)
    if url and "indiacode.gov.in/handle/" not in url:
        errs.append(f"record {index}: bad citation url: {url}")
    return errs


def validate_records(records: List[Dict], max_errors: int = 20) -> Tuple[bool, Dict]:
    errors: List[str] = []
    ids = set()
    dup_ids = 0
    for i, rec in enumerate(records):
        if isinstance(rec, dict):
            rid = rec.get("id")
            if rid in ids:
                dup_ids += 1
            ids.add(rid)
        errs = validate_record(rec, i)
        if errs:
            errors.extend(errs)
            if len(errors) >= max_errors:
                break
    report = {
        "records": len(records),
        "unique_ids": len(ids),
        "duplicate_ids": dup_ids,
        "error_count": len(errors),
        "errors": errors[:max_errors],
        "valid": not errors and dup_ids == 0,
    }
    return report["valid"], report


def write_jsonl(path: Path, records: List[Dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as fh:
        for rec in records:
            fh.write(json.dumps(rec, ensure_ascii=False) + "\n")


def read_jsonl(path: Path) -> List[Dict]:
    out: List[Dict] = []
    with path.open("r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line:
                out.append(json.loads(line))
    return out
