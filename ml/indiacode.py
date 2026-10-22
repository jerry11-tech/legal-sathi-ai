"""India Code source client.

India Code (https://indiacode.gov.in) is a DSpace 9.1 repository whose REST API
exposes Indian statutes. Verified structure (2026-10-22):

* An ACT is an item whose metadata contains ``dc.identifier.collection == "ACT"``
  plus identifiers (act_id, act_number, act_year, enforcement_date, ...).
* Each SECTION of an act is a separate item with metadata:
  - ``dc.identifier.act_id``  — links back to the parent act
  - ``dc.identifier.section_number`` / ``dc.identifier.order_number``
  - ``dc.identifier.section_page_note`` — the section's operative text as HTML
  - ``dc.title`` — the section heading ("Wrongful restraint.")
* Discovery: GET /server/api/discover/search/objects?query=<q>&size=&page=
  returns full item metadata inline, so sections are fetched page-wise
  (PAGE_SIZE at a time) without extra per-item requests.

Everything written here is a faithful client of that API; nothing is invented.
Raw responses are cached on disk for reproducibility.
"""
from __future__ import annotations

import http.client
import json
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from . import config


class IndiaCodeError(RuntimeError):
    """Raised when the upstream API cannot be used."""


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


@dataclass
class FetchedAct:
    """One act resolved from India Code plus its sections (raw metadata)."""

    key: str
    act_id: str
    title: str
    handle: Optional[str]
    act_number: Optional[str]
    act_year: Optional[str]
    enforced_on: Optional[str]
    ministry: Optional[str]
    no_of_sections_meta: Optional[str]
    state: Optional[str] = None
    sections: List[Dict[str, Any]] = field(default_factory=list)
    retrieved_at: str = ""
    source: str = "indiacode.gov.in"


class IndiaCodeClient:
    """Minimal, polite client for the India Code DSpace REST API with disk cache."""

    def __init__(self, cache_dir: Path, offline: bool = False, verbose: bool = True):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.offline = offline
        self.verbose = verbose
        self._session_opener = urllib.request.build_opener()
        self._session_opener.addheaders = [
            ("User-Agent", "LegalSathi-AI-DatasetPipeline/0.1 (research; contact: repo owner)"),
            ("Accept", "application/json"),
        ]

    # ------------------------------------------------------------------ utils
    def _log(self, msg: str) -> None:
        if self.verbose:
            print(f"[indiacode] {msg}", flush=True)

    def _cache_path(self, name: str) -> Path:
        safe = "".join(c if c.isalnum() or c in "-_." else "_" for c in name)
        return self.cache_dir / f"{safe}.json"

    def _http_get_json(self, url: str) -> Dict[str, Any]:
        last_err: Optional[Exception] = None
        for attempt in range(1, config.HTTP_RETRIES + 1):
            try:
                with self._session_opener.open(url, timeout=config.HTTP_TIMEOUT_SEC) as resp:
                    body = resp.read().decode("utf-8", errors="replace")
                    return json.loads(body)
            except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError,
                    json.JSONDecodeError, OSError, http.client.HTTPException) as exc:
                # OSError/HTTPException cover transient drops (RemoteDisconnected etc.)
                last_err = exc
                wait = config.HTTP_BACKOFF_SEC * attempt
                self._log(f"request failed (attempt {attempt}/{config.HTTP_RETRIES}): {exc}; retrying in {wait:.1f}s")
                time.sleep(wait)
        raise IndiaCodeError(f"GET {url} failed after {config.HTTP_RETRIES} attempts: {last_err}")

    # ------------------------------------------------------------ discovery
    def search(self, query: str, page: int = 0, size: int = config.PAGE_SIZE) -> Dict[str, Any]:
        """Raw discover-search call. Uses cache keyed by url when offline."""
        qs = urllib.parse.urlencode({"query": query, "size": size, "page": page})
        url = f"{config.INDIACODE_API}/discover/search/objects?{qs}"
        cache = self._cache_path("search_" + urllib.parse.quote_plus(query) + f"_p{page}_s{size}")
        if self.offline:
            if cache.exists():
                return json.loads(cache.read_text(encoding="utf-8"))
            raise IndiaCodeError(f"offline mode and no cache for query={query!r} page={page}")
        data = self._http_get_json(url)
        cache.write_text(json.dumps(data), encoding="utf-8")
        time.sleep(config.REQUEST_PAUSE_SEC)
        return data

    @staticmethod
    def _iter_objects(search_json: Dict[str, Any]) -> List[Dict[str, Any]]:
        try:
            objects = search_json["_embedded"]["searchResult"]["_embedded"]["objects"]
        except KeyError:
            return []
        out = []
        for o in objects or []:
            item = (o or {}).get("_embedded", {}).get("indexableObject")
            if item:
                out.append(item)
        return out

    @staticmethod
    def _total(search_json: Dict[str, Any]) -> int:
        try:
            return int(search_json["_embedded"]["searchResult"]["page"]["totalElements"])
        except (KeyError, TypeError, ValueError):
            return 0

    @staticmethod
    def _meta(item: Dict[str, Any], key: str) -> Optional[str]:
        vals = (item.get("metadata") or {}).get(key) or []
        if vals:
            v = vals[0].get("value")
            return str(v) if v is not None else None
        return None

    @staticmethod
    def _norm_title(title: Optional[str]) -> str:
        """Case/whitespace/trailing-period insensitive title comparison key."""
        t = (title or "").strip().lower()
        while t.endswith("."):
            t = t[:-1].rstrip()
        return t

    @staticmethod
    def _is_central(item: Dict[str, Any]) -> bool:
        state = (IndiaCodeClient._meta(item, "dc.identifier.state_name") or "").strip().upper()
        act_id = IndiaCodeClient._meta(item, "dc.identifier.act_id") or ""
        return state == "CENTRAL" or act_id.startswith("AC_CEN_")

    def find_act(self, title: str, prefer_state: str = "CENTRAL") -> Dict[str, Any]:
        """Resolve an exact act title to its India Code item metadata.

        India Code stores the same statute once per state (e.g. BNSS exists for
        Maharashtra, Rajasthan, Chandigarh, ... plus the national copy). The
        national copy (state_name == CENTRAL, act_id prefix AC_CEN_) is the
        authoritative one and is preferred.
        """
        query = f'dc.title:"{title}"'
        seen: List[Dict[str, Any]] = []
        page = 0
        while page < 5:  # acts should appear on page 1; guard against runaway paging
            data = self.search(query, page=page, size=config.PAGE_SIZE)
            objs = self._iter_objects(data)
            if not objs:
                break
            seen.extend(objs)
            if len(seen) >= self._total(data):
                break
            page += 1
        want = self._norm_title(title)
        exact = [
            it for it in seen
            if self._norm_title(self._meta(it, "dc.title") or it.get("name")) == want
            and self._meta(it, "dc.identifier.collection") == "ACT"
        ]
        if not exact:
            # fall back: any item with exact title that has act identifiers (some acts lack collection tag)
            exact = [
                it for it in seen
                if self._norm_title(self._meta(it, "dc.title")) == want
                and self._meta(it, "dc.identifier.act_id")
                and not self._meta(it, "dc.identifier.section_number")
            ]
        if not exact:
            sample = [it.get("name") for it in seen[:5]]
            raise IndiaCodeError(f"act not found by exact title {title!r}; sample hits: {sample}")
        if prefer_state.upper() == "CENTRAL":
            central = [it for it in exact if self._is_central(it)]
            if central:
                exact = central
        item = exact[0]
        return {
            "id": item.get("id"),
            "handle": item.get("handle"),
            "title": self._meta(item, "dc.title") or item.get("name"),
            "act_id": self._meta(item, "dc.identifier.act_id"),
            "act_number": self._meta(item, "dc.identifier.act_number"),
            "act_year": self._meta(item, "dc.date.act_year") or self._meta(item, "dc.date.issued",),
            "enforced_on": self._meta(item, "dc.date.enforcement_date"),
            "ministry": self._meta(item, "dc.identifier.ministry_name"),
            "no_of_sections_meta": self._meta(item, "dc.identifier.no_of_section"),
            "state": self._meta(item, "dc.identifier.state_name"),
        }

    def fetch_sections(self, act_id: str) -> List[Dict[str, Any]]:
        """Fetch every section item of an act via paged, act_id-filtered discovery."""
        query = f'dc.identifier.act_id:"{act_id}"'
        first = self.search(query, page=0, size=config.PAGE_SIZE)
        total = self._total(first)
        pages = max(1, -(-total // config.PAGE_SIZE)) if total else 1
        self._log(f"act_id={act_id}: {total} sections across {pages} page(s)")
        sections: List[Dict[str, Any]] = []
        data = first
        for page in range(pages):
            if page > 0:
                data = self.search(query, page=page, size=config.PAGE_SIZE)
            for item in self._iter_objects(data):
                meta = item.get("metadata") or {}
                if "dc.identifier.section_number" not in meta and "dc.identifier.section_page_note" not in meta:
                    continue  # not a section-shaped item
                sections.append({
                    "item_id": item.get("id"),
                    "handle": item.get("handle"),
                    "title": item.get("name") or self._meta(item, "dc.title"),
                    "act_id": self._meta(item, "dc.identifier.act_id"),
                    "act_name": self._meta(item, "dc.identifier.act_name"),
                    "act_number": self._meta(item, "dc.identifier.act_number"),
                    "act_year": self._meta(item, "dc.date.act_year"),
                    "section_number": self._meta(item, "dc.identifier.section_number"),
                    "order_number": self._meta(item, "dc.identifier.order_number"),
                    "note_html": self._meta(item, "dc.identifier.section_page_note") or "",
                    "ministry": self._meta(item, "dc.identifier.ministry_name"),
                    "state_name": self._meta(item, "dc.identifier.state_name"),
                    "repealed": self._meta(item, "dc.identifier.act_repealed"),
                })
        return sections

    def fetch_act(self, key: str, title: str) -> FetchedAct:
        """Full fetch for one act: metadata + all sections (cache-backed)."""
        cache = self._cache_path(f"act_{key}")
        if cache.exists():
            payload = json.loads(cache.read_text(encoding="utf-8"))
            self._log(f"act '{key}': using cached raw payload ({len(payload.get('sections', []))} sections)")
            return FetchedAct(**payload)
        self._log(f"act '{key}': resolving title {title!r}")
        act = self.find_act(title)
        if not act.get("act_id"):
            raise IndiaCodeError(f"act '{key}' resolved but has no dc.identifier.act_id")
        sections = self.fetch_sections(act["act_id"])
        fetched = FetchedAct(
            key=key,
            act_id=act["act_id"],
            title=act["title"],
            handle=act.get("handle"),
            act_number=act.get("act_number"),
            act_year=act.get("act_year"),
            enforced_on=act.get("enforced_on"),
            ministry=act.get("ministry"),
            no_of_sections_meta=act.get("no_of_sections_meta"),
            state=act.get("state"),
            sections=sections,
            retrieved_at=_utc_now_iso(),
        )
        cache.write_text(json.dumps(fetched.__dict__, ensure_ascii=False), encoding="utf-8")
        return fetched
