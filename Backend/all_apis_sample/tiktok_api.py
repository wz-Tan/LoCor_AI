import requests
import os
from dotenv import load_dotenv

load_dotenv()

url = "https://tiktok-scraper7.p.rapidapi.com/ads/trends/videos"

# Max 20
querystring = {'page': '1',"limit":"20", 'period': '30'}

headers = {
	"x-rapidapi-key": os.getenv("RAPIDAPI_API_KEY"),
	"x-rapidapi-host": "tiktok-scraper7.p.rapidapi.com",
	"Content-Type": "application/json"
}

response = requests.get(url, headers=headers, params=querystring)

print(response.json())