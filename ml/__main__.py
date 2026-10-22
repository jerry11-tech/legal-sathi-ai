"""CLI for the dataset pipeline:  python -m ml <command>

Commands:
    build      fetch + clean + chunk + dedup + split + validate + emit
    validate   re-validate an existing sections.jsonl
    stats      print summary stats for a sections.jsonl
"""
from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path

from . import config, schema


def _cmd_build(args: argparse.Namespace) -> int:
    from .build import build

    report = build(
        manifest_path=Path(args.manifest),
        out_dir=Path(args.out),
        acts_filter=args.acts.split(",") if args.acts else None,
        limit_sections=args.limit_sections,
        offline=args.offline,
        verbose=not args.quiet,
    )
    print(json.dumps({
        "acts_fetched": report["acts_fetched"],
        "chunks_total": report["chunks_total"],
        "split": {k: report["split"][k] for k in ("train", "val", "test")},
        "leakage": report["split"]["cross_split_leakage_clusters"],
        "validation": report["validation"]["valid"],
    }, indent=2))
    return 0


def _cmd_validate(args: argparse.Namespace) -> int:
    records = schema.read_jsonl(Path(args.file))
    valid, report = schema.validate_records(records)
    print(json.dumps(report, indent=2))
    return 0 if valid else 1


def _cmd_stats(args: argparse.Namespace) -> int:
    records = schema.read_jsonl(Path(args.file))
    acts = Counter(r["meta"].get("act_key", "?") for r in records)
    splits = Counter(r["meta"].get("split", "?") for r in records)
    lens = sorted(len(r["text"]) for r in records)
    print(json.dumps({
        "records": len(records),
        "acts": dict(sorted(acts.items())),
        "splits": dict(sorted(splits.items())),
        "text_len_min": lens[0] if lens else 0,
        "text_len_median": lens[len(lens) // 2] if lens else 0,
        "text_len_max": lens[-1] if lens else 0,
    }, indent=2))
    return 0


def _cmd_instruct(args: argparse.Namespace) -> int:
    from .instruct import generate

    report = generate(
        corpus_path=Path(args.corpus),
        out_dir=Path(args.out),
        verbose=not args.quiet,
    )
    print(json.dumps({
        "examples": report["examples"],
        "categories": report["categories"],
        "synthetic_flagged_for_review": report["synthetic_flagged_for_review"],
        "splits": report["splits"],
        "validation": report["validation"]["valid"],
        "citation_check": report["citation_check"]["valid"],
    }, indent=2))
    return 0


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(prog="python -m ml", description="LegalSathi dataset pipeline")
    sub = parser.add_subparsers(dest="command", required=True)

    p_build = sub.add_parser("build", help="build the corpus from India Code")
    p_build.add_argument("--manifest", default=str(config.DEFAULT_MANIFEST))
    p_build.add_argument("--out", default=str(config.PROCESSED_DIR))
    p_build.add_argument("--acts", default=None, help="comma-separated act keys (default: all in manifest)")
    p_build.add_argument("--limit-sections", type=int, default=None, help="debug: cap sections per act")
    p_build.add_argument("--offline", action="store_true", help="use cached raw payloads only")
    p_build.add_argument("--quiet", action="store_true")
    p_build.set_defaults(func=_cmd_build)

    p_val = sub.add_parser("validate", help="validate a sections.jsonl")
    p_val.add_argument("--file", default=str(config.PROCESSED_DIR / "sections.jsonl"))
    p_val.set_defaults(func=_cmd_validate)

    p_stats = sub.add_parser("stats", help="summary stats for a sections.jsonl")
    p_stats.add_argument("--file", default=str(config.PROCESSED_DIR / "sections.jsonl"))
    p_stats.set_defaults(func=_cmd_stats)

    p_instruct = sub.add_parser("instruct", help="build the instruction-tuning dataset")
    p_instruct.add_argument("--corpus", default=str(config.PROCESSED_DIR / "sections.jsonl"))
    p_instruct.add_argument("--out", default=str(config.PROCESSED_DIR / "instruct"))
    p_instruct.add_argument("--quiet", action="store_true")
    p_instruct.set_defaults(func=_cmd_instruct)

    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
