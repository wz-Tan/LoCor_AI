from typing import List, Dict, Optional, Any
from datetime import datetime
import chromadb

def populate_db(documents, ids, metadatas=None, collection_name="database",
                batch_size=100, **extra_metadata):
    """
    Usage:
        - See main for example :)
        - https://docs.trychroma.com/docs/querying-collections/query-and-get
    """
    if not documents or not ids:
        raise ValueError("Error: 'documents' and 'ids' are required")
    if len(documents) != len(ids):
        raise ValueError(f"Error: documents ({len(documents)}) and ids ({len(ids)}) must have same length")
    total_docs = len(documents)

    client = chromadb.PersistentClient(path="./chroma_db")

    if metadatas is None:
        if extra_metadata:
            metadatas = [extra_metadata.copy() for _ in range(total_docs)]
        else:
            metadatas = [{} for _ in range(total_docs)]
    else:
        if extra_metadata:
            metadatas = [{**meta, **extra_metadata} for meta in metadatas]

    if len(metadatas) != total_docs:
        raise ValueError(f"metadatas ({len(metadatas)}) must match documents ({total_docs})")

    collection = client.get_or_create_collection(
        name=collection_name,
        metadata={"created_at": datetime.now().isoformat()}
    )

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
        "joe is 20 years old",
        "Colin is 21 years old",
        "Gilbert is 20 years old",
        "Nathan is 20 years old",
        "Jayci is 21 years old"
    ]
    ids = ["doc_1", "doc_2", "doc_3", "doc_4", "doc_5"]
    metadatas = [
        {"topic": "joe", "age": 20},
        {"topic": "colin", "age": 21},
        {"topic": "gilbert", "age": 20},
        {"topic": "nathan", "age": 20},
        {"topic": "jayci", "age": 21}
    ]
    """
        Parameters:
            1. documents(compulsory)
            2. ids(compulsory)
            3. metadatas - list of dict
            4. collection_name - default is "database"
            5. batch_size - default 100
            6. extra metadatas - will be appended to metadatas
    """
    collection = populate_db(
        documents=documents,
        ids=ids,
        metadatas=metadatas,
        collection_name="database",
        batch_size=100,
        gender="unknown"
    )

    # Tests
    print("Test 1: query for '20 years old'")
    results2 = collection.query(
        query_texts=["21"],
        n_results=2,
        where={"age":20},
        include=["documents", "metadatas"]
    )
    for i in range(len(results2['documents'][0])):
           print(f"Document: {results2['documents'][0][i]}")
           print(f"ID: {results2['ids'][0][i]}")
           print(f"Metadata: {results2['metadatas'][0][i]}")

    print("\nTest 2: get")
    all_docs = collection.get(include=["documents", "metadatas"])

    for i in range(len(all_docs['documents'])):
        print(f"\nDocument {i+1}:")
        print(f"ID: {all_docs['ids'][i]}")
        print(f"Document: {all_docs['documents'][i]}")
        print(f"Metadata: {all_docs['metadatas'][i]}")

if __name__ == "__main__":
    main()
