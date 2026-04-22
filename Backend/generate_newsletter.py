import asyncio
import os

import dotenv
from db import query
from processing_generation import generate, newsletter
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
AI_ENDPOINT = "https://api.z.ai/api/paas/v4/"

# Create Client Instance
client = ZaiClient(api_key=API_KEY)

# TODO: Instead of Using A Hardcoded List Pull from SQLite
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

    # currentTrends = await fetch_and_summarise_trends()

    DOCUMENT_PROMPT = """
    You are a business analyst writing a weekly proposal document for a retail/e-commerce SME owner.

    You will be given a set of business data and insights collected from the past week. Your job is to analyze this information and produce a well-structured, persuasive proposal that helps the SME owner make clear, confident business decisions.

    **Guidelines:**
    - Write with authority and clarity. The owner is busy — be direct and back every recommendation with a reason drawn from the data.
    - Do not invent data. Only use what is provided in the context below.
    - Each recommendation must have a visible "why" — tie it explicitly to a trend, anomaly, or pattern in the data.
    - Tone should be professional but practical. Avoid jargon.

    **Output format:** Return only valid Markdown. Use the exact section structure below. Do not add extra sections or commentary outside the document.

    ---

    # Weekly Business Proposal
    ## [Week ending: {date}]

    ### Executive Summary
    A 3–5 sentence overview of the week's most important findings and the core recommendation.

    ### Key Insights
    A bulleted breakdown of the most significant patterns or anomalies found in the data this week. Each bullet should be specific and data-backed.

    - **[Insight title]:** explanation

    ### Recommendations
    For each recommendation, state what to do, why the data supports it, and what outcome to expect.

    #### Recommendation 1: [Title]
    - **Action:** ...
    - **Reasoning:** ...
    - **Expected outcome:** ...

    #### Recommendation 2: [Title]
    - **Action:** ...
    - **Reasoning:** ...
    - **Expected outcome:** ...

    *(Add more recommendations as warranted by the data)*

    ### Inventory Changes
    Based on the data, list products that need restocking and products that should be discontinued or cleared. Be specific — include product names or SKUs if present in the context.

    **Restock:**
    - **[Product]:** reason (e.g. stock running low, high velocity this week)

    **Discontinue / Clear:**
    - **[Product]:** reason (e.g. low movement, high days-on-hand)

    ### Risks & Watch Points
    Brief bullets on anything that looks uncertain, needs monitoring, or could go wrong if recommendations are not acted on.

    ### Closing Note
    One short paragraph summarizing the overall outlook for the coming week.

    ---
    """

    EXCEL_PROMPT = """
    You are a data assistant producing an inventory update for a retail/e-commerce SME.

    You will be given the current week's inventory data and the previous version of the inventory. Your job is to produce the full updated inventory as a JSON array, reflecting all changes recommended in the proposal, and flagging what has changed from the previous version.

    **Guidelines:**
    - Every product from the previous inventory must appear in the output, unless it is being discontinued/removed.
    - New products being added must also appear.
    - Compare each row against the previous version and set the `change` field accordingly.
    - Do not invent or estimate values. Only use what is provided in the context.
    - If a field is unchanged, carry it over from the previous version exactly.

    **Change types for the `change` field:**
    - `"added"` — product is new, did not exist in the previous version
    - `"removed"` — product is discontinued or cleared, no longer carried
    - `"modified"` — one or more field values changed from the previous version
    - `"unchanged"` — no changes at all

    **For `"modified"` rows, also include a `"diff"` field** listing only the fields that changed, with their old and new values.

    **Output format:** Return only a valid JSON array. No markdown, no explanation, no backticks. Each object must follow this exact schema:

    ```
    [
      {
        "product_name": "string",
        "sku": "string",
        "quantity": number,
        "status": "string",       // e.g. "active", "low stock", "clearance", "discontinued"
        "price": number,
        "change": "added" | "removed" | "modified" | "unchanged",
        "diff": {                 // only present if change is "modified"
          "field_name": {
            "old": <previous value>,
            "new": <current value>
          }
        }
      }
    ]
    ```

    ---
    """

    document_messages = [
        {"role": "system", "content": DOCUMENT_PROMPT},
        {
            "role": "user",
            "content": f"Here is the business context. Take this as a crucial point of information:\n\n{final_context}",
        },
    ]

    # Create Proposal Content
    response = client.chat.completions.create(
        model="glm-4.5-flash",
        messages=document_messages,
        thinking={"type": "disabled"},
        max_tokens=8000,
    )

    report_content = response.choices[0].message.content
    print("Report content is ", report_content)

    print("final_context length:", len(final_context))
    print("report_content length:", len(report_content))
    print("Combined:", len(final_context) + len(report_content))

    # Create Excel Content
    excel_messages = [
        {"role": "system", "content": EXCEL_PROMPT},
        {
            "role": "user",
            "content": f"Here is the business context. Take this as a crucial point of information and strictly follow it:\n\n{final_context}. Follow this business proposal {report_content}",
        },
    ]

    response = client.chat.completions.create(
        model="glm-4.5-flash",
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
