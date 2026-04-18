import requests
import os
from dotenv import load_dotenv

load_dotenv()

url = "https://youtube-trending.p.rapidapi.com/trending"

querystring = {"country":"US","type":"default"}

headers = {
	"x-rapidapi-key": os.getenv('API_KEY'),
	"x-rapidapi-host": "youtube-trending.p.rapidapi.com",
	"Content-Type": "application/json"
}

response = requests.get(url, headers=headers, params=querystring)

print(response.json())