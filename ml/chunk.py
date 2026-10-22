"""Section-level chunking.

A section of an act is the natural legal unit and becomes one chunk. Very long
sections are split at subsection boundaries ``(1) (2) ...`` with character
overlap so that no single training/index record exceeds CHUNK_MAX_CHARS.
"""
from __future__ import annotations

import re
from typing import Dict, List

from . import config

# boundary: a line starting with "(1)", "(2)", ... (subsection marker)
_SUBSECTION_RE = re.compile(r"\n(?=\(\d{1,3}\)\s)")


def _split_positions(text: str) -> List[int]:
    """Start offsets where a hard split is legal (subsection markers)."""
    return [m.start() for m in _SUBSECTION_RE.finditer(text)]


def split_long_text(text: str, max_chars: int, overlap: int) -> List[str]:
    """Split text into pieces <= max_chars, preferring subsection boundaries."""
    if len(text) <= max_chars:
        return [text]
    pieces: List[str] = []
    starts = _split_positions(text)
    if not starts or starts[0] != 0:
        starts = [0] + starts
    # add a final anchor at the end so the loop terminates cleanly
    bounds = starts + [len(text)]
    current = ""
    for i in range(len(bounds) - 1):
        segment = text[bounds[i]:bounds[i + 1]].strip()
        if not segment:
            continue
        if not current:
            current = segment
        elif len(current) + 1 + len(segment) <= max_chars:
            current = current + "\n" + segment
        else:
            pieces.append(current)
            # overlap: tail of the previous piece for context continuity
            if overlap > 0 and len(current) > overlap:
                tail = current[-overlap:]
                # start tail at a word boundary
                sp = tail.find(" ")
                if 0 < sp < 40:
                    tail = tail[sp + 1:]
                current = tail + "\n" + segment
            else:
                current = segment
    if current:
        pieces.append(current)
    # pathological case: a single subsection still exceeds max_chars -> hard cut
    final: List[str] = []
    for p in pieces:
        if len(p) <= max_chars:
            final.append(p)
        else:
            for j in range(0, len(p), max_chars - overlap):
                final.append(p[j:j + max_chars])
    return final


def build_chunk_id(act_key: str, section_number: str, part_index: int, total_parts: int) -> str:
    base = f"IC:{act_key}:s{section_number}"
    if total_parts > 1:
        return f"{base}#p{part_index + 1}"
    return base


def chunk_section(
    act_key: str,
    section: Dict,
    text: str,
    max_chars: int = config.CHUNK_MAX_CHARS,
    min_chars: int = config.CHUNK_MIN_CHARS,
    overlap: int = config.CHUNK_OVERLAP_CHARS,
) -> List[Dict]:
    """Turn one cleaned section text into one or more chunk dicts."""
    if len(text.strip()) < min_chars:
        return []
    parts = split_long_text(text, max_chars=max_chars, overlap=overlap)
    parts = [p for p in parts if len(p.strip()) >= min_chars]
    sec_no = str(section.get("section_number") or "?").strip()
    out: List[Dict] = []
    for i, part in enumerate(parts):
        out.append({
            "id": build_chunk_id(act_key, sec_no, i, len(parts)),
            "text": part.strip(),
            "meta": {
                "source": "indiacode.gov.in",
                "act_key": act_key,
                "act_title": section.get("act_name") or "",
                "act_number": section.get("act_number"),
                "act_year": section.get("act_year"),
                "section_number": sec_no,
                "section_title": (section.get("title") or "").strip(),
                "part": i + 1,
                "total_parts": len(parts),
                "handle": section.get("handle"),
                "ministry": section.get("ministry"),
                "repealed": str(section.get("repealed")).lower() == "true",
            },
        })
    return out
