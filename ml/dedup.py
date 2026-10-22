"""Exact + near-duplicate detection.

* Exact dups: aggressive normalisation (lowercase, punctuation stripped) then
  hash — first occurrence by sort order wins.
* Near dups: minhash LSH (word 5-gram shingles, banded signatures) to propose
  candidate pairs, then exact Jaccard verification. Union-find merges clusters
  so the splitter can keep near-duplicates inside a single split (leakage guard).

Everything is deterministic (fixed seeds derived from text, no global RNG state).
"""
from __future__ import annotations

import hashlib
import re
from typing import Dict, Iterable, List, Sequence, Tuple

from . import config
from .clean import normalize_for_hash

_WORD_RE = re.compile(r"[a-z0-9]+")

# fixed minhash parameters (a, b, prime) — deterministic, seeded at import time
_P = (1 << 61) - 1
_A = [int.from_bytes(hashlib.sha256(f"a{i}".encode()).digest()[:8], "big") % (_P - 1) + 1
      for i in range(config.MINHASH_PERMS)]
_B = [int.from_bytes(hashlib.sha256(f"b{i}".encode()).digest()[:8], "big") % (_P - 1)
      for i in range(config.MINHASH_PERMS)]


def shingle_hashes(text: str, k: int = 5) -> List[int]:
    """Hash set of word k-grams (stable across runs)."""
    words = _WORD_RE.findall(text.lower())
    if not words:
        return []
    if len(words) < k:
        joined = " ".join(words)
        return [int.from_bytes(hashlib.blake2b(joined.encode(), digest_size=8).digest(), "big")]
    hashes = []
    for i in range(len(words) - k + 1):
        gram = " ".join(words[i:i + k])
        hashes.append(int.from_bytes(hashlib.blake2b(gram.encode(), digest_size=8).digest(), "big"))
    return hashes


def minhash_signature(hashes: Sequence[int]) -> Tuple[int, ...]:
    if not hashes:
        return tuple([0] * config.MINHASH_PERMS)
    sig = []
    for a, b in zip(_A, _B):
        sig.append(min((a * h + b) % _P for h in hashes))
    return tuple(sig)


def _bands(sig: Sequence[int]) -> List[Tuple[int, Tuple[int, ...]]]:
    rows = config.MINHASH_PERMS // config.MINHASH_BANDS
    out = []
    for band in range(config.MINHASH_BANDS):
        chunk = tuple(sig[band * rows:(band + 1) * rows])
        out.append((band, chunk))
    return out


class UnionFind:
    def __init__(self) -> None:
        self.parent: Dict[str, str] = {}

    def find(self, x: str) -> str:
        self.parent.setdefault(x, x)
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x

    def union(self, a: str, b: str) -> None:
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            # deterministic attach: lexicographically smaller root wins
            lo, hi = (ra, rb) if ra < rb else (rb, ra)
            self.parent[hi] = lo


def jaccard(h1: Iterable[int], h2: Iterable[int]) -> float:
    s1, s2 = set(h1), set(h2)
    if not s1 and not s2:
        return 1.0
    if not s1 or not s2:
        return 0.0
    inter = len(s1 & s2)
    return inter / float(len(s1) + len(s2) - inter)


def deduplicate(chunks: List[Dict]) -> Tuple[List[Dict], Dict]:
    """Remove exact duplicates; cluster near-duplicates.

    Returns (kept_chunks, report) where each kept chunk gains a stable
    ``meta['cluster']`` id (root chunk id of its near-dup cluster).
    """
    report: Dict = {
        "input_chunks": len(chunks),
        "exact_duplicates_removed": 0,
        "near_duplicate_pairs": 0,
        "clusters": 0,
    }

    # stable order: id ascending — makes "first wins" reproducible
    ordered = sorted(chunks, key=lambda c: c["id"])

    seen_hash: Dict[str, str] = {}
    unique: List[Dict] = []
    for c in ordered:
        h = normalize_for_hash(c["text"])
        digest = hashlib.blake2b(h.encode("utf-8"), digest_size=16).hexdigest()
        if digest in seen_hash:
            report["exact_duplicates_removed"] += 1
            continue
        seen_hash[digest] = c["id"]
        unique.append(c)

    # near-dup clustering via LSH
    sigs: Dict[str, Tuple[int, ...]] = {}
    shingle_sets: Dict[str, List[int]] = {}
    buckets: Dict[Tuple[int, Tuple[int, ...]], List[str]] = {}
    for c in unique:
        sh = shingle_hashes(c["text"])
        shingle_sets[c["id"]] = sh
        sig = minhash_signature(sh)
        sigs[c["id"]] = sig
        for band, key in _bands(sig):
            buckets.setdefault((band, key), []).append(c["id"])

    uf = UnionFind()
    for c in unique:
        uf.find(c["id"])  # ensure every id is its own cluster root initially
    verified_pairs = 0
    checked_pairs = set()
    for ids in buckets.values():
        if len(ids) < 2:
            continue
        for i in range(len(ids)):
            for j in range(i + 1, len(ids)):
                a, b = sorted((ids[i], ids[j]))
                if (a, b) in checked_pairs:
                    continue
                checked_pairs.add((a, b))
                sim = jaccard(shingle_sets[a], shingle_sets[b])
                if sim >= config.NEAR_DUP_JACCARD:
                    uf.union(a, b)
                    verified_pairs += 1

    for c in unique:
        c["meta"]["cluster"] = uf.find(c["id"])

    roots = {c["meta"]["cluster"] for c in unique}
    report["near_duplicate_pairs"] = verified_pairs
    report["clusters"] = len(roots)
    report["output_chunks"] = len(unique)
    return unique, report
