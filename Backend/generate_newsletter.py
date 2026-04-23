import asyncio
import os

import dotenv
from db import query
from processing_generation import generate, newsletter
from prompts.newsletter import DOCUMENT_PROMPT, EXCEL_PROMPT
from zai import ZaiClient

dotenv.load_dotenv()

FUNCTION_MAP = {
    "send_email": newsletter.send_email,
    "generate_doc": generate.generate_doc,
    "generate_excel": generate.generate_excel,
}

# Get this API Key from This Link (+ Documentation)
# https://docs.z.ai/guides/overview/quick-start
API_KEY = os.getenv("Z_AI_API_KEY")
AI_ENDPOINT = "https://api.ilmu.ai/v1"

# Create Client Instance
client = ZaiClient(api_key=API_KEY, base_url=AI_ENDPOINT)


async def main():
    # For Querying Purposes
    collection_names = [
        "Company_Description",
        "Inventory_Sheets",
        "Balance_Sheets",
        "Sales_Sheets",
    ]
    final_context = ""

    queryText = "sales trends inventory performance"
    print("Generating newsletter")

    # Query ChromaDB for context (Separate for Description, Inventory, Sales and Balance Sheets)
    for collection_name in collection_names:
        results = query.QueryFunction(
            query=[queryText], collection_name=collection_name
        )

        docs = (
            results["documents"][0]
            if isinstance(results, dict) and results["documents"]
            else []
        )
        context = "\n\n".join(docs) if docs else ""

        final_context += context

    # currentTrends = await get_pricing_strategy()

    document_messages = [
        {"role": "system", "content": DOCUMENT_PROMPT},
        {
            "role": "user",
            "content": f"Here is the business context. Take this as a crucial point of information:\n\n{final_context}",
        },
    ]

    # Create Proposal Content
    response = client.chat.completions.create(
        model="ilmu-glm-5.1",
        messages=document_messages,
        thinking={"type": "disabled"},
        max_tokens=8000,
    )

    report_content = response.choices[0].message.content
    report_content = report_content.strip()
    if report_content.startswith("```"):
        report_content = report_content.split("\n", 1)[
            1
        ]  # remove first line (```markdown)
    if report_content.endswith("```"):
        report_content = report_content.rsplit("\n", 1)[0]  # remove last line (```)

    print("Report content is ", report_content)

    # Create Excel Content
    excel_messages = [
        {"role": "system", "content": EXCEL_PROMPT},
        {
            "role": "user",
            "content": f"Here is the business context. Take this as a crucial point of information and strictly follow it:\n\n{final_context}. Follow this business proposal {report_content}",
        },
    ]

    response = client.chat.completions.create(
        model="ilmu-glm-5.1",
        messages=excel_messages,
        thinking={"type": "disabled"},
        max_tokens=8000,
    )

    excel_content = response.choices[0].message.content
    print("Excel content is ", excel_content)

    # Parse Them into Buffers
    word_buffer = generate.generate_doc(report_content)
    excel_buffer = generate.generate_excel(excel_content)

    # Send Email
    newsletter.send_email(word_buffer, excel_buffer)
    print("Email is sent")


if __name__ == "__main__":
    asyncio.run(main())
