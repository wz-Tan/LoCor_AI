import chromadb
from chromadb.errors import NotFoundError


class VectorRetriever:
    DISTANCE_THRESHOLD = 1.8
    DB_PATH = "./chroma_db"

    def __init__(self, collection_name: str):
        client = chromadb.PersistentClient(path=self.DB_PATH)
        try:
            self.collection = client.get_collection(name=collection_name)
        except NotFoundError:
            raise ValueError(f"Collection '{collection_name}' not found.")

    def query(self, queries: list[str]) -> dict:
        if not queries:
            raise ValueError("No queries provided.")
        all_results = self.collection.query(query_texts=queries, n_results=3)
        return self._filter(all_results)

    def _filter(self, all_results) -> dict:
        filtered = {"ids": [], "documents": [], "distances": [], "metadatas": []}
        for i, distances in enumerate(all_results["distances"]):
            row = {k: [] for k in filtered}
            for j, dist in enumerate(distances):
                if dist < self.DISTANCE_THRESHOLD:
                    row["ids"].append(all_results["ids"][i][j])
                    row["documents"].append(all_results["documents"][i][j])
                    row["distances"].append(dist)
                    row["metadatas"].append(all_results["metadatas"][i][j])
            for k in filtered:
                filtered[k].append(row[k])
        return filtered

