import uuid
from datetime import datetime

from db import data_feeder
from fastapi import FastAPI
from fastapi.datastructures import UploadFile
from fastapi.middleware.cors import CORSMiddleware
from processing_tools.parser import DocumentParser

app = FastAPI()

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    print("Root is called")
    return {"Message": "This is The Root of the Page"}


# Take In Company Description, Inventory Sheets, Sales Sheets and Balance Sheets
@app.post("/initialise_data")
async def initialise_data(
    description_file: UploadFile,
    inventory_sheet: UploadFile,
    sales_sheet: UploadFile,
    balance_sheet: UploadFile,
):

    # Parse Files into Word and Dataframes
    (
        company_description,
        inventory_df,
        sales_df,
        balance_sheet_df,
    ) = await DocumentParser.initialise_data(
        description_file, sales_sheet, inventory_sheet, balance_sheet
    )

    # Use Current Time as metadata
    date = datetime.now().strftime("%d/%m/%Y")

    # Random ID
    id = str(uuid.uuid4())

    # Upload Data into ChromaDB
    # Company Description
    data_feeder.populate_db(
        documents=[company_description],
        ids=[id],
        metadatas=[{"date_added": date}],
        collection_name="Company_Description",
    )

    # Dataframes
    parsed_inventory = DocumentParser._parse_dataframe(inventory_df)
    parsed_sales = DocumentParser._parse_dataframe(sales_df)
    parsed_balance_sheet = DocumentParser._parse_dataframe(balance_sheet_df)

    print("Initialisation is complete")
    return {"status": "ok"}


async def upload_to_chromadb(content: str, metadata: str):
    print(f"Uploading file {content} with metadata {metadata}")
