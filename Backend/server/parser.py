import io

import fitz
import pandas as pd
from docx import Document


async def initialise_data(
    description_file, inventory_sheet, sales_sheet, balance_sheet
):
    print("Initialising data")
    try:
        # Store filenames before reading
        desc_filename = description_file.filename
        inv_filename = inventory_sheet.filename
        sales_filename = sales_sheet.filename
        bal_filename = balance_sheet.filename

        # Convert to Bytes
        desc_bytes = await description_file.read()
        inv_bytes = await inventory_sheet.read()
        sales_bytes = await sales_sheet.read()
        bal_bytes = await balance_sheet.read()

        # Extract Company Description
        ext = desc_filename.split(".")[-1].lower()
        if ext == "pdf":
            company_description = extract_from_pdf(desc_bytes)
        elif ext in ["doc", "docx"]:
            company_description = extract_from_doc(desc_bytes)
        else:
            return

        # Inventory Sheet
        ext = inv_filename.split(".")[-1].lower()
        if ext == "csv":
            inventory_data = pd.read_csv(io.BytesIO(inv_bytes))
        elif ext in ["xls", "xlsx"]:
            inventory_data = pd.read_excel(io.BytesIO(inv_bytes))
        else:
            return

        # Sales Sheet
        ext = sales_filename.split(".")[-1].lower()
        if ext == "csv":
            sales_data = pd.read_csv(io.BytesIO(sales_bytes))
        elif ext in ["xls", "xlsx"]:
            sales_data = pd.read_excel(io.BytesIO(sales_bytes))
        else:
            return

        # Balance Sheet
        ext = bal_filename.split(".")[-1].lower()
        if ext == "csv":
            balance_sheet_data = pd.read_csv(io.BytesIO(bal_bytes))
        elif ext in ["xls", "xlsx"]:
            balance_sheet_data = pd.read_excel(io.BytesIO(bal_bytes))
        else:
            return

        print("Completed data extraction")
        return company_description, inventory_data, sales_data, balance_sheet_data

    except Exception as e:
        print("Error initialising data ", e)


def extract_from_doc(file_bytes):
    """Extract Text from Word File"""
    doc = Document(io.BytesIO(file_bytes))
    return "\n".join([para.text for para in doc.paragraphs])


def extract_from_pdf(file_bytes):
    """Extract Text from PDF"""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    full_text = ""
    for page in doc:
        full_text += page.get_text()
    return full_text


# Handling Dataframes into ChromaDB
async def upload_dataframe_to_chromadb(
    df: pd.DataFrame, collection, source_filename: str
):
    for i, row in df.iterrows():
        collection.add(
            documents=[str(row.to_dict())],
            ids=[f"{source_filename}_row_{i}"],
            metadatas=[{"source": source_filename, "row": i}],
        )
