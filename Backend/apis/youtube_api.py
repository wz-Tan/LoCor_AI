import requests
import os
from dotenv import load_dotenv

load_dotenv()

url = "https://yt-api.p.rapidapi.com/trending"

querystring = {"geo":"US","type":"now"}

headers = {
	"x-rapidapi-key": os.getenv('API_KEY'),
	"x-rapidapi-host": "yt-api.p.rapidapi.com",
	"Content-Type": "application/json"
}

response = requests.get(url, headers=headers, params=querystring)

print(response.json())