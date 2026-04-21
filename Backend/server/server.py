import parser
from fastapi import FastAPI
from fastapi.datastructures import UploadFile
from fastapi.middleware.cors import CORSMiddleware

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
    print("Description file is ", description_file)
    print("invenotry file is ", inventory_sheet)
    print("sales file is ", sales_sheet)
    print("balance file is ", balance_sheet)

    # Parse Files into Word and Dataframes
    (
        company_description,
        inventory_df,
        sales_df,
        balance_sheet_df,
    ) = await parser.initialise_data(
        description_file, sales_sheet, inventory_sheet, balance_sheet
    )

    # Upload Data into ChromaDB
    await upload_to_chromadb(company_description, "Company Description")

    # Additional Processing for DataFrames
    # await parser.upload_dataframe_to_chromadb(inventory_df)
    # await parser.upload_dataframe_to_chromadb(sales_df)
    # await parser.upload_dataframe_to_chromadb(balance_sheet_df)

    print("Initialisation is complete")
    return {"status": "ok"}


async def upload_to_chromadb(content: str, metadata: str):
    print(f"Uploading file {content} with metadata {metadata}")
