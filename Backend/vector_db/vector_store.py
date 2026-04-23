from datetime import datetime
from typing import Any, Dict, List, Optional

import chromadb

class VectorStore:
    DB_PATH = "./chroma_db"

    def __init__(self, collection_name: str = "database"):
        self.client = chromadb.PersistentClient(path=self.DB_PATH)
        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            metadata={"created_at": datetime.now().isoformat()}
        )

    def add(self, documents: list, ids: list, metadatas: list = None, batch_size: int = 100):
        if not documents or not ids:
            raise ValueError("'documents' and 'ids' are required")
        if len(documents) != len(ids):
            raise ValueError("documents and ids must have same length")

        metadatas = metadatas or [{} for _ in documents]

        for i in range(0, len(documents), batch_size):
            end = i + batch_size
            self.collection.add(
                documents=documents[i:end],
                metadatas=metadatas[i:end],
                ids=ids[i:end],
            )
