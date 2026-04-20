import chromadb
from datetime import datetime
from typing import List, Dict

def populate_db(documents: List[str], metadatas: List[Dict], ids: List[str]):
    client = chromadb.PersistentClient(path="./chroma_db")
    collection = client.create_collection(
        name="my_knowledge",
        metadata={"created_at": datetime.now().isoformat()}
    )
    total_docs = len(documents)
    batch_size = 100

    for i in range(0, total_docs, batch_size):
        batch_end = min(i + batch_size, total_docs)

        collection.add(
            documents=documents[i:batch_end],
            metadatas=metadatas[i:batch_end],
            ids=ids[i:batch_end]
        )
    return collection

def main():
    # Simple test data
    documents = [
        "Wen Zhe is cute",
        "Collin is cute",
        "Gilbert is cute"
    ]

    metadatas = [
        {"topic": "wz"},
        {"topic": "cl"},
        {"topic": "gb"}
    ]

    ids = ["doc_1", "doc_2", "doc_3"]

    collection = populate_db(documents, metadatas, ids)

    # Test queries
    print("\n Test 1: query for \"cute\"")
    results = collection.query(
        query_texts=["wenzhe"],
        n_results=2
    )

    for i, doc in enumerate(results['documents'][0], 1):
        print(f"{i}. {doc}")


if __name__ == "__main__":
    main()
