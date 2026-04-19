import chromadb
import uuid

#for storing in disk
"""
client = chromadb.PersistentClient(path="./chroma_data")
collection = client.get_or_create_collection(name="quotes")
"""
#initializing client
client = chromadb.Client()
collection = client.create_collection(name="quotes")

#source of data
with open("database.txt", 'r', encoding="utf-8") as f:
	#quotes is a list of all the lines in .txt
	quotes: list[str] = f.read().splitlines()

collection.add(
	#id category = unique id allocated by uuid
	ids=[str(uuid.uuid4()) for _ in quotes],
	#document category = line
	documents=quotes,
	#all related metadatas, saved in dictionary form
	metadatas=[{"line": line} for line in range(len(quotes))]
)

#print(collection.peek())

results = collection.query(
	query_texts=[
		"Which one is debating about existance?",
		"Which one is by Nelson Mandela?",
		"Which one is by a philosopher from the 17th century?",
		"Which one is from a French philosopher?"
	],
	n_results=3
)

for i, query_results in enumerate(results["documents"]):
	print(f"\nQuery {i}")
	print("\n".join(query_results))

