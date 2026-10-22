from rag.real_rag import rag_engine

class RAGPipeline:
    def __init__(self):
        self.engine = rag_engine

    def ask(self, query: str, language: str = "en") -> dict:
        return self.engine.ask(query)

pipeline = RAGPipeline()
