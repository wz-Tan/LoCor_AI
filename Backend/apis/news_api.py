import requests
import os
from dotenv import load_dotenv

load_dotenv()

url = "https://news-api14.p.rapidapi.com/v2/trendings"

# Params
# topic ('General', 'Politics', 'Sport')
# limit (Default = 0)

headers = {
	"x-rapidapi-key": os.getenv('API_KEY'),
	"x-rapidapi-host": "news-api14.p.rapidapi.com",
	"Content-Type": "application/json"
}

response = requests.get(url, headers=headers)

print(response.json())