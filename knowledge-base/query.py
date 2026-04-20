import chromadb
from chromadb.errors import NotFoundError

def QueryFunction(query: list[str]):
	client = chromadb.PersistentClient(path="./chroma_db")
	try:
		# Was trying it on my own database, do edit name field
		collection = client.get_collection(name="my_knowledge2")
	except NotFoundError:
		return ("Error: Collection(s) not found.")

	if not query:
		return ("Error: No queries detected.")

	# Submits queries and obtains results
	all_results = collection.query(
		query_texts=query,
		n_results=3
	)

	# Object to be returned
	filtered_results = {
		"ids" : [],
		"documents" : [],
		"distances" : [],
		"metadatas" : []
	}

	for i in range(len(all_results["distances"])):
		# Only contains relevent entries and their info:
		filtered_ids = []
		filtered_documents = []
		filtered_distances = []
		filtered_metadatas = []
		for j in range(len(all_results["distances"][i])):
			if (all_results["distances"][i][j] < 0.85):
				# Entries are accurate
				filtered_ids.append(all_results["ids"][i][j])
				filtered_documents.append(all_results["documents"][i][j])
				filtered_distances.append(all_results["distances"][i][j])
				filtered_metadatas.append(all_results["metadatas"][i][j])
			else:
				# Entries are not/no longer relevant
				break
		filtered_results["ids"].append(filtered_ids)
		filtered_results["documents"].append(filtered_documents)
		filtered_results["distances"].append(filtered_distances)
		filtered_results["metadatas"].append(filtered_metadatas)
				
	return (filtered_results)



def main():
	# I suggest a few queries related to our data entries, and a few completely unrelated ones to test accuracy
	queries = [
		"Which one is describing a person?",
		"Which one is related to modern TV?",
		"Which one is a quote by others?",
		"Which relates to the financial info of NVDIA?",
		"Who is gay?"
	]

	results = QueryFunction(queries)

	try:
		for i in range(len(results["distances"])):
			print(f"Query: {queries[i]}")
			for j in range(len(results["distances"][i])):
				print(f"- {results["documents"][i][j]}")
			print("\n")
	except:
		print("Error: \"results\" not as expected.")

	print("\n")

	try:
		for i in range(len(results["distances"])):
			print(f"Query: {queries[i]}")
			for j in range(len(results["distances"][i])):
				print(f"distance: {results["distances"][i][j]}")
			print("\n")
	except:
		print("Error: \"results\" not as expected.")



if __name__ == "__main__":
	main()
