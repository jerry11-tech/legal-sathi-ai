import unittest
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from rag.legal_engine import LegalEngine

class TestLegalEngine(unittest.TestCase):
    def setUp(self):
        self.engine = LegalEngine()
        self.engine.load()

    def test_regression_a_constitutional_law(self):
        query = "Can the government restrict my freedom of speech, and what does Article 19 of the Indian Constitution say?"
        response = self.engine.build_response(query)
        self.assertIn("Constitution", response["applicable_law"] + response["summary"] + response["explanation"])
        self.assertGreater(response["confidence_score"], 0.5)

    def test_regression_b_employment_law(self):
        query = "My employer has not paid my salary for two months. What legal steps can I take?"
        response = self.engine.build_response(query)
        self.assertIn("salary", (response["summary"] + response["explanation"] + response["next_steps"]).lower())
        self.assertIn("notice", response["next_steps"].lower() + response["explanation"].lower())

    def test_regression_c_contract_law(self):
        query = "Can I sue someone for breach of a verbal agreement in India?"
        response = self.engine.build_response(query)
        self.assertIn("agreement", (response["summary"] + response["explanation"]).lower())

    def test_regression_d_harassment_query(self):
        query = "Someone is harassing me. What should I do?"
        response = self.engine.build_response(query)
        self.assertIsNotNone(response["summary"])
        self.assertIsNotNone(response["next_steps"])

    def test_regression_e_non_legal_query(self):
        query = "What is the capital of France?"
        response = self.engine.build_response(query)
        self.assertIn("LegalSathi AI", response["summary"])
        self.assertIn("capital of France", response["summary"])

if __name__ == "__main__":
    unittest.main()
