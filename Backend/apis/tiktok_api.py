import requests
import os
from dotenv import load_dotenv

load_dotenv()

url = "https://tiktok-scraper7.p.rapidapi.com/feed/list"

# Max 20
querystring = {"region":"us","count":"20"}

headers = {
	"x-rapidapi-key": os.getenv('API_KEY'),
	"x-rapidapi-host": "tiktok-scraper7.p.rapidapi.com",
	"Content-Type": "application/json"
}

response = requests.get(url, headers=headers, params=querystring)

print(response.json())