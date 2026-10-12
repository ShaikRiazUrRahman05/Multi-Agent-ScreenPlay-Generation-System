from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma

class VectorMemory:
    def __init__(self, persist_dir="memory_store"):
        self.embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
        self.store = Chroma(collection_name="script_memory",
                            embedding_function=self.embeddings,
                            persist_directory=persist_dir)

    def save(self, key: str, content: str):
        """Save agent outputs with a semantic key"""
        self.store.add_texts([content], metadatas=[{"key": key}])

    def recall(self, query: str, k: int = 3) -> str:
        """Retrieve the most relevant past outputs"""
        results = self.store.similarity_search(query, k=k)
        return "\n".join([r.page_content for r in results]) if results else ""
