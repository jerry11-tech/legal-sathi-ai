"""Dataset build orchestrator.

Pipeline: manifest -> fetch (India Code, cached) -> clean -> chunk -> dedup
-> leakage-guarded split -> validate -> emit JSONL + manifest + report.

Deterministic given the same raw cache; re-running with ``--offline`` replays
the cache without network access.
"""
from __future__ import annotations

import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional

from . import chunk as chunk_mod
from . import clean as clean_mod
from . import config
from . import dedup as dedup_mod
from . import schema as schema_mod
from . import split as split_mod
from .indiacode import FetchedAct, IndiaCodeClient, IndiaCodeError


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def load_manifest(path: Path) -> Dict:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict) or "acts" not in data:
        raise ValueError(f"manifest {path} must be an object with an 'acts' array")
    return data


def _sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for block in iter(lambda: fh.read(65536), b""):
            h.update(block)
    return h.hexdigest()


def build(
    manifest_path: Path,
    out_dir: Path,
    acts_filter: Optional[List[str]] = None,
    limit_sections: Optional[int] = None,
    offline: bool = False,
    verbose: bool = True,
) -> Dict:
    """Run the full pipeline; returns the run report dict (also written to disk)."""
    def log(msg: str) -> None:
        if verbose:
            print(f"[build] {msg}", flush=True)

    manifest = load_manifest(manifest_path)
    client = IndiaCodeClient(config.RAW_DIR, offline=offline, verbose=verbose)
    out_dir.mkdir(parents=True, exist_ok=True)

    acts_spec = manifest["acts"]
    if acts_filter:
        wanted = set(acts_filter)
        acts_spec = [a for a in acts_spec if a["key"] in wanted]
        missing = wanted - {a["key"] for a in acts_spec}
        if missing:
            raise ValueError(f"unknown act keys in --acts: {sorted(missing)}")

    fetched: List[FetchedAct] = []
    fetch_errors: List[Dict] = []
    for spec in acts_spec:
        try:
            act = client.fetch_act(spec["key"], spec["title"])
        except IndiaCodeError as exc:
            log(f"SKIP act {spec['key']}: {exc}")
            fetch_errors.append({"key": spec["key"], "title": spec["title"], "error": str(exc)})
            continue
        if limit_sections is not None:
            act.sections = act.sections[:limit_sections]
        expected_min = spec.get("expected_min_sections")
        if expected_min and len(act.sections) < expected_min:
            log(f"WARN act {spec['key']}: {len(act.sections)} sections < expected_min {expected_min}")
        log(f"fetched {spec['key']}: {len(act.sections)} sections")
        fetched.append(act)

    if not fetched:
        raise IndiaCodeError("no acts could be fetched; nothing to build")

    # ------------------------------------------------------------- clean+chunk
    all_chunks: List[Dict] = []
    per_act: Dict[str, Dict] = {}
    for act in fetched:
        tag_map = next((a.get("tags", []) for a in manifest["acts"] if a["key"] == act.key), [])
        cleaned = 0
        dropped_short = 0
        made_chunks = 0
        ordered_sections = sorted(
            act.sections,
            key=lambda s: (
                int(s["order_number"]) if str(s.get("order_number") or "").isdigit() else 10**9,
                str(s.get("section_number") or ""),
            ),
        )
        for sec in ordered_sections:
            text = clean_mod.html_to_text(sec.get("note_html") or "")
            if not clean_mod.looks_like_legal_text(text):
                dropped_short += 1
                continue
            cleaned += 1
            chunks = chunk_mod.chunk_section(act.key, sec, text)
            for c in chunks:
                c["meta"]["retrieved_at"] = act.retrieved_at
                c["meta"]["tags"] = tag_map
                c["meta"]["citation"] = (
                    f"{act.title}, s.{c['meta']['section_number']} "
                    f"(India Code, handle {sec.get('handle') or 'n/a'})"
                )
            all_chunks.extend(chunks)
            made_chunks += len(chunks)
        per_act[act.key] = {
            "title": act.title,
            "act_id": act.act_id,
            "sections_fetched": len(act.sections),
            "sections_with_text": cleaned,
            "sections_dropped_empty": dropped_short,
            "chunks": made_chunks,
            "retrieved_at": act.retrieved_at,
            "act_number": act.act_number,
            "enforced_on": act.enforced_on,
        }
        log(f"cleaned {act.key}: {cleaned} sections -> {made_chunks} chunks (dropped {dropped_short} empty)")

    # ------------------------------------------------------ dedup + split
    unique_chunks, dedup_report = dedup_mod.deduplicate(all_chunks)
    log(f"dedup: {dedup_report['input_chunks']} -> {dedup_report['output_chunks']} chunks "
        f"({dedup_report['exact_duplicates_removed']} exact dups removed, "
        f"{dedup_report['near_duplicate_pairs']} near-dup pairs clustered)")
    splits, split_report = split_mod.split_chunks(unique_chunks)
    log(f"split: train={split_report['train']} val={split_report['val']} test={split_report['test']} "
        f"(leakage clusters: {split_report['cross_split_leakage_clusters']})")

    # ------------------------------------------------------ validate + emit
    valid, validation = schema_mod.validate_records(unique_chunks)
    if not valid:
        for e in validation["errors"]:
            log(f"VALIDATION ERROR: {e}")
        raise SystemExit("schema validation failed — refusing to emit dataset")

    sections_path = out_dir / "sections.jsonl"
    schema_mod.write_jsonl(sections_path, unique_chunks)
    split_paths = {}
    for name in ("train", "val", "test"):
        p = out_dir / f"{name}.jsonl"
        schema_mod.write_jsonl(p, splits[name])
        split_paths[name] = p

    report = {
        "generated_at": _utc_now_iso(),
        "manifest": str(manifest_path.name),
        "manifest_version": manifest.get("version"),
        "source": manifest.get("source"),
        "acts_requested": len(acts_spec),
        "acts_fetched": len(fetched),
        "fetch_errors": fetch_errors,
        "per_act": per_act,
        "dedup": dedup_report,
        "split": split_report,
        "validation": validation,
        "outputs": {
            "sections_jsonl": str(sections_path),
            "sections_sha256": _sha256_file(sections_path),
            "train_sha256": _sha256_file(split_paths["train"]),
            "val_sha256": _sha256_file(split_paths["val"]),
            "test_sha256": _sha256_file(split_paths["test"]),
        },
        "chunks_total": len(unique_chunks),
        "pipeline_version": "0.1.0",
    }
    (out_dir / "corpus_manifest.json").write_text(
        json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    _write_report_md(out_dir / "report.md", report)
    log(f"wrote {len(unique_chunks)} chunks to {out_dir}")
    return report


def _write_report_md(path: Path, report: Dict) -> None:
    lines = [
        "# Legal corpus build report",
        "",
        f"- generated_at: `{report['generated_at']}`",
        f"- source: `{report.get('source')}` (retrieved live; raw responses cached under `ml/data/raw/`)",
        f"- acts fetched: **{report['acts_fetched']}** / requested {report['acts_requested']}",
        f"- chunks: **{report['chunks_total']}**",
        f"- exact duplicates removed: {report['dedup']['exact_duplicates_removed']}",
        f"- near-duplicate pairs clustered: {report['dedup']['near_duplicate_pairs']}",
        f"- split: train={report['split']['train']} / val={report['split']['val']} / test={report['split']['test']}",
        f"- cross-split leakage clusters: **{report['split']['cross_split_leakage_clusters']}**",
        f"- validation: {'PASS' if report['validation']['valid'] else 'FAIL'}",
        "",
        "## Per-act counts",
        "",
        "| act_key | title | sections | with text | chunks |",
        "|---|---|---:|---:|---:|",
    ]
    for key, info in report["per_act"].items():
        lines.append(
            f"| {key} | {info['title']} | {info['sections_fetched']} | "
            f"{info['sections_with_text']} | {info['chunks']} |"
        )
    if report["fetch_errors"]:
        lines += ["", "## Fetch errors", ""]
        for e in report["fetch_errors"]:
            lines.append(f"- `{e['key']}` ({e['title']}): {e['error']}")
    lines += [
        "",
        "## Reproduce",
        "",
        "```",
        "python -m ml build --manifest ml/configs/corpus_manifest.json",
        "python -m ml build --offline   # rebuild from cached raw payloads only",
        "```",
        "",
    ]
    path.write_text("\n".join(lines), encoding="utf-8")
