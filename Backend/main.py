import asyncio
import json
import os

import dotenv
from data_apis import fetch_and_summarise_trends
from processing_generation import newsletter, generate, tools
from zai import ZaiClient

dotenv.load_dotenv()

FUNCTION_MAP = {
    "send_email": newsletter.send_email,
    "generate_doc": generate.generate_doc,
    "generate_excel": generate.generate_excel,
}

# Get this API Key from This Link (+ Documentation)
# https://docs.z.ai/guides/overview/quick-start
API_KEY = os.environ["Z_AI_API_KEY"]
AI_ENDPOINT = "https://api.z.ai/api/paas/v4/"

# Create Client Instance
client = ZaiClient(api_key=API_KEY)

# TODO: Instead of Using A Hardcoded List Pull from ChromaDB
messages = [
    {
        "role": "system",
        "content": "You are a professional market analyser with brilliant business decision making skills and persuasiveness on inventory management and sales prediction.",
    },
    {
        "role": "user",
        "content": "Imagine Christmas is Coming. Generate me a report and a corresponding spreadsheet on what I should buy more on, I am a Gift Store Owner. Once completed send me an email with the information",
    },
]


async def main():
    currentTrends = await fetch_and_summarise_trends()
    messages.append({"role": "system", "content": currentTrends})
    print("Finished taking current trends")

    doc_buffer = None
    excel_buffer = None

    # Talk to the AI
    while True:
        # Create chat completion
        response = client.chat.completions.create(
            model="glm-4.5-flash",
            messages=messages,
            tools=tools.TOOLS,
            tool_choice="auto",
        )

        message = response.choices[0].message
        print("Current message is ", message.content)

        # No Tool Calls
        if not message.tool_calls:
            print("Completed: ", message.content)
            break

        # Append assistant's response to history
        messages.append(
            {
                "role": "assistant",
                "content": message.content,
                "tool_calls": message.tool_calls,
            }
        )

        # Execute each tool call and feed results back
        for tool_call in message.tool_calls:
            function_name = tool_call.function.name
            function_args = json.loads(tool_call.function.arguments)

            print("Calling function ", function_name)

            if function_name == "generate_doc":
                doc_buffer = generate.generate_doc(**function_args)
            elif function_name == "generate_excel":
                excel_buffer = generate.generate_excel(**function_args)
            elif function_name == "send_email":
                if doc_buffer and excel_buffer:
                    result = newsletter.send_email(doc_buffer, excel_buffer)
                    print(f"Email info: {result}")
                else:
                    print("Missing either doc buffer or excel buffer")

            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": "Finished calling function"
                    + function_name
                    + "with a result of "
                    + str(function_args),
                }
            )


if __name__ == "__main__":
    asyncio.run(main())
