from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

class LocalEmbeddings:
    def __init__(self, model_name="sentence-transformers/all-MiniLM-L6-v2"):
        self.embeddings = HuggingFaceEmbeddings(model_name=model_name)
    
    def get_embeddings(self):
        return self.embeddings

def get_vector_store(persist_directory="../chroma"):
    embeddings = LocalEmbeddings().get_embeddings()
    return Chroma(persist_directory=persist_directory, embedding_function=embeddings)
