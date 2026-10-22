"""Unit tests for the dataset pipeline (stdlib unittest; no network).

Run from the repo root:
    python -m unittest discover -s ml/tests -v
"""
from __future__ import annotations

import unittest

from ml import chunk, clean, config, dedup, schema, split


def _mk_chunk(cid: str, text: str, split_name: str = "train") -> dict:
    return {
        "id": cid,
        "text": text,
        "meta": {
            "source": "indiacode.gov.in",
            "act_key": "test_act",
            "act_title": "The Test Act, 2024",
            "act_number": "1",
            "act_year": "2024",
            "section_number": "1",
            "section_title": "Test section.",
            "part": 1,
            "total_parts": 1,
            "handle": "123456789/1",
            "ministry": "Test Ministry",
            "repealed": False,
            "retrieved_at": "2026-10-22T00:00:00+00:00",
            "tags": ["test"],
            "citation": "The Test Act, 2024, s.1 (India Code, handle 123456789/1)",
            "cluster": cid,
            "split": split_name,
        },
    }


LONG_SECTION_TEXT = (
    "Whoever commits an offence shall be punished. (1) The punishment for this "
    "offence shall be imprisonment for a term which may extend to three years. "
    "(2) Whoever, being bound by law to report an offence, fails to do so, shall "
    "be punished with fine. (3) Nothing in this section shall apply to acts done "
    "in good faith. " + "Additional operative words follow. " * 80
)


class TestClean(unittest.TestCase):
    def test_html_to_text_basic(self):
        html = '<span style="margin-left: 15px;"></span>No person shall be punished.<br/><hr/>Exception.'
        text = clean.html_to_text(html)
        self.assertIn("No person shall be punished.", text)
        self.assertIn("Exception.", text)
        self.assertNotIn("<", text)

    def test_html_entities_and_nbsp(self):
        text = clean.html_to_text("A &amp; B&nbsp;C")
        self.assertEqual(text, "A & B C")

    def test_block_tags_newlines(self):
        text = clean.html_to_text("<p>First line</p><p>Second line</p>")
        self.assertEqual(text, "First line\nSecond line")

    def test_normalize_collapses_blank_runs(self):
        text = clean.normalize_text("a\n\n\n\n\nb")
        self.assertEqual(text, "a\n\nb")

    def test_looks_like_legal_text(self):
        self.assertTrue(clean.looks_like_legal_text("Whoever commits robbery is guilty of an offence."))
        self.assertFalse(clean.looks_like_legal_text("1234"))
        self.assertFalse(clean.looks_like_legal_text(""))


class TestChunk(unittest.TestCase):
    def test_short_section_single_chunk(self):
        sec = {"section_number": "5", "title": "T", "act_name": "A", "act_number": "1", "act_year": "2024"}
        out = chunk.chunk_section("act_x", sec, "A short but perfectly valid legal text passage here.")
        self.assertEqual(len(out), 1)
        self.assertEqual(out[0]["id"], "IC:act_x:s5")

    def test_long_section_splits_at_subsections(self):
        sec = {"section_number": "9", "title": "T", "act_name": "A", "act_number": "1", "act_year": "2024"}
        out = chunk.chunk_section("act_x", sec, LONG_SECTION_TEXT, max_chars=500, min_chars=20, overlap=50)
        self.assertGreater(len(out), 1)
        for c in out:
            self.assertLessEqual(len(c["text"]), 500)
        self.assertEqual(out[0]["id"], "IC:act_x:s9#p1")
        self.assertEqual(out[1]["id"], "IC:act_x:s9#p2")

    def test_too_short_dropped(self):
        sec = {"section_number": "3", "title": "T", "act_name": "A"}
        self.assertEqual(chunk.chunk_section("act_x", sec, "tiny", min_chars=40), [])


class TestDedup(unittest.TestCase):
    def test_exact_duplicate_removed(self):
        a = _mk_chunk("IC:a:s1", "Whoever commits robbery shall be punished with imprisonment.")
        b = _mk_chunk("IC:a:s2", "Whoever commits robbery shall be punished with imprisonment!")
        kept, report = dedup.deduplicate([a, b])
        self.assertEqual(report["exact_duplicates_removed"], 1)
        self.assertEqual(len(kept), 1)

    def test_near_duplicate_clustered(self):
        base = (
            "Whoever commits robbery shall be punished with rigorous imprisonment "
            "for a term which may extend to ten years and shall also be liable to fine. "
            "Theft is criminal misappropriation of property with dishonest intention "
            "to take it out of the possession of any person without that person's consent. "
            "Criminal breach of trust occurs when a person entrusted with property "
            "dishonestly converts it to their own use or otherwise disposes of it. "
        )
        a = _mk_chunk("IC:a:s1", base)
        b = _mk_chunk("IC:a:s2", base + " A further explanatory clause follows here.")
        kept, report = dedup.deduplicate([a, b])
        self.assertEqual(len(kept), 2)  # both kept, but same cluster
        clusters = {c["meta"]["cluster"] for c in kept}
        self.assertEqual(len(clusters), 1)
        self.assertGreaterEqual(report["near_duplicate_pairs"], 1)

    def test_deterministic(self):
        a = _mk_chunk("IC:a:s1", "Text alpha bravo charlie delta echo foxtrot golf hotel india juliet.")
        b = _mk_chunk("IC:a:s2", "Unrelated text about contractual remedies and damages. " * 3)
        k1, r1 = dedup.deduplicate([a, b])
        k2, r2 = dedup.deduplicate([dict(b), dict(a)])  # reversed input order
        self.assertEqual(r1, r2)
        self.assertEqual([c["id"] for c in k1], [c["id"] for c in k2])


class TestSplit(unittest.TestCase):
    def test_no_cluster_spans_splits(self):
        chunks = []
        for i in range(200):
            c = _mk_chunk(f"IC:a:s{i}", f"Unique legal text number {i} with sufficient length to pass validation.")
            c["meta"]["cluster"] = f"cluster_{i % 40}"  # 40 clusters, 5 members each
            chunks.append(c)
        out, report = split.split_chunks(chunks)
        self.assertEqual(report["cross_split_leakage_clusters"], 0)
        self.assertEqual(sum(report[k] for k in ("train", "val", "test")), 200)

    def test_deterministic_assignment(self):
        self.assertEqual(split.assign_split("cluster_1"), split.assign_split("cluster_1"))

    def test_distribution_roughly_expected(self):
        counts = {"train": 0, "val": 0, "test": 0}
        for i in range(2000):
            counts[split.assign_split(f"c{i}")] += 1
        self.assertGreater(counts["train"], 1400)
        self.assertGreater(counts["val"], 100)
        self.assertGreater(counts["test"], 100)


class TestSchema(unittest.TestCase):
    def test_valid_record_passes(self):
        c = _mk_chunk("IC:test_act:s1", "Whoever commits robbery shall be punished with rigorous imprisonment.")
        ok, report = schema.validate_records([c])
        self.assertTrue(ok, report)

    def test_bad_id_rejected(self):
        c = _mk_chunk("garbage-id", "Whoever commits robbery shall be punished with rigorous imprisonment.")
        ok, report = schema.validate_records([c])
        self.assertFalse(ok)

    def test_short_text_rejected(self):
        c = _mk_chunk("IC:test_act:s2", "short")
        ok, report = schema.validate_records([c])
        self.assertFalse(ok)

    def test_duplicate_ids_rejected(self):
        c1 = _mk_chunk("IC:test_act:s1", "Whoever commits robbery shall be punished with rigorous imprisonment.")
        c2 = _mk_chunk("IC:test_act:s1", "Another equally long text for the same identifier record.")
        ok, report = schema.validate_records([c1, c2])
        self.assertFalse(ok)


if __name__ == "__main__":
    unittest.main()
