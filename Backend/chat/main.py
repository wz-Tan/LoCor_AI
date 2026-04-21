import os

import dotenv
import sql
from zai import ZaiClient

dotenv.load_dotenv()

# Get this API Key from This Link (+ Documentation)
# https://docs.z.ai/guides/overview/quick-start
API_KEY = os.getenv("Z_AI_API_KEY")
AI_ENDPOINT = "https://api.z.ai/api/paas/v4/"

# Create Client Instance
client = ZaiClient(api_key=API_KEY)

# Messages (Pull from SQLite Soon)
messages = sql.get_all_messages()
print("All messages are ", messages)

# Talk to the AI
while True:
    print("AI is thinking...")

    # Create chat completion
    response = client.chat.completions.create(
        model="glm-4.5-flash",
        messages=messages,
        thinking={"type": "disabled"},
        max_tokens=250,
        temperature=0.5,
        stream=True,
    )

    # Collect and print the stream
    full_response = ""
    for chunk in response:
        delta = chunk.choices[0].delta.content
        if delta:
            print(delta, end="", flush=True)
            full_response += delta

    print()  # New line after stream ends

    text = input("Your Reaction: ")
    if text == "q":
        break

    # Current Session Use
    messages.append({"role": "assistant", "content": full_response})
    messages.append({"role": "user", "content": text})

    # Save Into Backend
    sql.save_message("assistant", full_response)
    sql.save_message("user", text)

sql.close_connection()
