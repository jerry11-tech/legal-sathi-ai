"""HTML -> plain text cleaning for section text from India Code.

The upstream ``dc.identifier.section_page_note`` field contains light HTML:
inline ``<span>`` (indentation artifacts), ``<br/>``, ``<hr/>``, and occasional
``<p>``/``<div>``/``<sup>``. We convert it to deterministic plain text without
altering the legal wording.
"""
from __future__ import annotations

import html
import re
import unicodedata
from html.parser import HTMLParser

_BLOCK_TAGS = {
    "p", "div", "li", "tr", "table", "ul", "ol",
    "h1", "h2", "h3", "h4", "h5", "h6", "section", "article",
}
_VOID_TAGS = {"br", "hr"}
_SKIP_TAGS = {"script", "style"}


class _TextExtractor(HTMLParser):
    """Collects text with newlines at block boundaries; skips script/style."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list = []
        self._skip_depth = 0

    def handle_starttag(self, tag, attrs):
        if tag in _SKIP_TAGS:
            self._skip_depth += 1
            return
        if tag == "br":
            self.parts.append("\n")
        elif tag == "hr":
            self.parts.append("\n\n")

    def handle_endtag(self, tag):
        if tag in _SKIP_TAGS:
            self._skip_depth = max(0, self._skip_depth - 1)
            return
        if tag in _BLOCK_TAGS:
            self.parts.append("\n")

    def handle_data(self, data):
        if self._skip_depth == 0 and data:
            self.parts.append(data)


def html_to_text(raw_html: str) -> str:
    """Convert an HTML fragment to plain text (single newlines = lines)."""
    if not raw_html:
        return ""
    parser = _TextExtractor()
    try:
        parser.feed(raw_html)
        parser.close()
        text = "".join(parser.parts)
    except Exception:  # malformed upstream HTML — fall back to tag-strip
        text = re.sub(r"<[^>]+>", " ", raw_html)
    text = html.unescape(text)
    return normalize_text(text)


def normalize_text(text: str) -> str:
    """Whitespace/unicode normalisation. Wording is preserved verbatim."""
    if not text:
        return ""
    text = unicodedata.normalize("NFKC", text)
    text = text.replace("\xa0", " ").replace("​", "")
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # tab -> space, collapse horizontal runs
    text = re.sub(r"[ \t\f\v]+", " ", text)
    # strip per-line trailing spaces, drop spaces-only lines to empty
    lines = [ln.strip() for ln in text.split("\n")]
    # collapse 3+ blank lines into one blank line
    out_lines: list = []
    blank_run = 0
    for ln in lines:
        if ln == "":
            blank_run += 1
            if blank_run <= 1:
                out_lines.append("")
        else:
            blank_run = 0
            out_lines.append(ln)
    return "\n".join(out_lines).strip()


def normalize_for_hash(text: str) -> str:
    """Aggressive normalisation used for exact-duplicate detection."""
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def looks_like_legal_text(text: str) -> bool:
    """Sanity gate: chunk must contain letters and be mostly printable."""
    if not text or len(text.strip()) < 20:
        return False
    letters = sum(1 for c in text if c.isalpha())
    return letters >= 10 and letters / max(1, len(text)) > 0.4
