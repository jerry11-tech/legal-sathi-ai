from rag.legal_engine import get_engine


class RAGPipeline:
    def __init__(self):
        self.engine = get_engine()

    def ask(self, query: str, language: str = "en") -> dict:
        return self.engine.build_response(query, language=language)


pipeline = RAGPipeline()
