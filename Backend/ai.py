import json
import os

from dotenv import load_dotenv
from processing_generation import generate, newsletter
from prompts.ai import DASHBOARD_PROMPT, DOCUMENT_PROMPT, EXCEL_PROMPT, INSIGHTS_PROMPT
from zai import ZaiClient

load_dotenv()

# Get this API Key from This Link (+ Documentation)
# https://docs.z.ai/guides/overview/quick-start
API_KEY = os.getenv("Z_AI_API_KEY")
AI_ENDPOINT = "https://api.ilmu.ai/v1"

# Create Client Instance
client = ZaiClient(api_key=API_KEY, base_url=AI_ENDPOINT)


# Talk to the AI
async def get_ai_response(chat_history, context):

    messages = list(chat_history)  # copy to avoid mutating original

    if context:
        # find the existing system message and append context to it
        if messages and messages[0]["role"] == "system":
            messages[0] = {
                "role": "system",
                "content": messages[0]["content"]
                + f"\n\nRelevant business data:\n\n{context}",
            }
        else:
            messages.insert(
                0,
                {"role": "system", "content": f"Relevant business data:\n\n{context}"},
            )

    # Create chat completion
    response = client.chat.completions.create(
        model="ilmu-glm-5.1",
        messages=messages,
        max_tokens=5000,
        temperature=0.5,
    )

    return response.choices[0].message.content


async def generate_insights(context):

    messages = [
        {"role": "system", "content": INSIGHTS_PROMPT},
        {"role": "user", "content": f"Here is the business data:\n\n{context}"},
    ]

    response = client.chat.completions.create(
        model="ilmu-glm-5.1",
        messages=messages,
        thinking={"type": "disabled"},
        max_tokens=10000,  # needs more room for full JSON
        temperature=0.3,  # lower = more consistent JSON output
    )

    print("Response is ", response)
    raw = response.choices[0].message.content
    print("Raw insight is ", raw)
    clean = (
        raw.strip()
        .removeprefix("```json")
        .removeprefix("```")
        .removesuffix("```")
        .strip()
    )

    return json.loads(clean)


# Generate Newsletter (Context is Synthesized Data from ChromaDB + Trends)
async def generate_newsletter(context):
    document_messages = [
        {"role": "system", "content": DOCUMENT_PROMPT},
        {
            "role": "user",
            "content": f"Here is the business context. Take this as a crucial point of information:\n\n{context}",
        },
    ]

    # Create Proposal Content
    response = client.chat.completions.create(
        model="ilmu-glm-5.1",
        messages=document_messages,
        thinking={"type": "disabled"},
        max_tokens=5000,
    )

    report_content = response.choices[0].message.content

    # Create Excel Content
    excel_messages = [
        {"role": "system", "content": EXCEL_PROMPT},
        {
            "role": "user",
            "content": f"Here is the business context. Take this as a crucial point of information and strictly follow it:\n\n{context}. Follow this business proposal {report_content}",
        },
    ]

    response = client.chat.completions.create(
        model="ilmu-glm-5.1",
        messages=excel_messages,
        thinking={"type": "disabled"},
        max_tokens=5000,
    )

    excel_content = response.choices[0].message.content

    # Parse Them into Buffers
    word_buffer = generate.generate_doc(report_content)
    excel_buffer = generate.generate_excel(excel_content)

    # Send Email
    newsletter.send_email(word_buffer, excel_buffer)


async def generate_dashboard(context):
    messages = [
        {"role": "system", "content": DASHBOARD_PROMPT},
        {"role": "user", "content": f"Here is the business data:\n\n{context}"},
    ]

    response = client.chat.completions.create(
        model="ilmu-glm-5.1",
        messages=messages,
        thinking={"type": "disabled"},
        max_tokens=5000,
        temperature=0.3,
    )

    raw = response.choices[0].message.content
    clean = (
        raw.strip()
        .removeprefix("```json")
        .removeprefix("```")
        .removesuffix("```")
        .strip()
    )
    return json.loads(clean)
