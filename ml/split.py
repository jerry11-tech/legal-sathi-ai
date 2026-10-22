"""Leakage-guarded train/val/test split.

Chunks are assigned by hashing their cluster root (not the chunk itself), so
every member of a near-duplicate cluster lands in the same split. Hashing keeps
the split deterministic across runs and machines, with no RNG dependency.
"""
from __future__ import annotations

import hashlib
from typing import Dict, List, Tuple

from . import config


def _unit_bucket(key: str) -> float:
    digest = hashlib.blake2b(key.encode("utf-8"), digest_size=8).digest()
    return int.from_bytes(digest, "big") / float(1 << 64)


def assign_split(cluster_key: str,
                 train: float = config.SPLIT_TRAIN,
                 val: float = config.SPLIT_VAL) -> str:
    u = _unit_bucket("split:" + cluster_key)
    if u < train:
        return "train"
    if u < train + val:
        return "val"
    return "test"


def split_chunks(chunks: List[Dict]) -> Tuple[Dict[str, List[Dict]], Dict]:
    """Split clustered chunks into {'train': [...], 'val': [...], 'test': [...]}."""
    out: Dict[str, List[Dict]] = {"train": [], "val": [], "test": []}
    for c in sorted(chunks, key=lambda x: x["id"]):
        cluster = c["meta"].get("cluster") or c["id"]
        name = assign_split(cluster)
        c["meta"]["split"] = name
        out[name].append(c)

    # leakage verification: no cluster may span splits
    cluster_splits: Dict[str, set] = {}
    for name, items in out.items():
        for c in items:
            cluster_splits.setdefault(c["meta"]["cluster"], set()).add(name)
    spanning = sorted(k for k, v in cluster_splits.items() if len(v) > 1)

    report = {
        "train": len(out["train"]),
        "val": len(out["val"]),
        "test": len(out["test"]),
        "clusters": len(cluster_splits),
        "cross_split_leakage_clusters": len(spanning),
        "leakage_sample": spanning[:5],
        "method": f"sha256(cluster_root) -> buckets train<{config.SPLIT_TRAIN}<=val<{config.SPLIT_TRAIN + config.SPLIT_VAL}<=test",
    }
    return out, report
