import requests
import os
from dotenv import load_dotenv

load_dotenv()

url = "https://trending-twitter-hashtags.p.rapidapi.com/getTrendingTwitterHashtags"

headers = {
	"x-rapidapi-key": os.getenv('API_KEY'),
	"x-rapidapi-host": "trending-twitter-hashtags.p.rapidapi.com",
	"Content-Type": "application/json"
}

response = requests.post(url, headers=headers)

print(response.json())