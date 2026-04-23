import io

import fitz
import pandas as pd
from docx import Document


class DocumentParser:
    # Public entry point
    @staticmethod
    async def initialise_data(
        description_file, inventory_sheet, sales_sheet, balance_sheet
    ):
        print("Initialising data...")
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

            # Parse bytes
            company_description = await DocumentParser._read_pdf_or_docx(
                desc_filename, desc_bytes
            )
            inventory_data = await DocumentParser._read_csv_or_xlsx(
                inv_filename, inv_bytes
            )
            sales_data = await DocumentParser._read_csv_or_xlsx(
                sales_filename, sales_bytes
            )
            balance_sheet_data = await DocumentParser._read_csv_or_xlsx(
                bal_filename, bal_bytes
            )

            print("Completed data extraction")
            return company_description, inventory_data, sales_data, balance_sheet_data

        except Exception as e:
            print("Error initialising data ", e)
            return None, None, None, None

    @staticmethod
    async def upload_df_to_chromadb(df: pd.DataFrame, collection, source_filename: str):
        for i, row in df.iterrows():
            collection.add(
                documents=[str(row.to_dict())],
                ids=[f"{source_filename}_row_{i}"],
                metadatas=[{"source": source_filename, "row": i}],
            )

    # Private helper functions ──────────────────────────────────────────────────────────────────
    # Company description
    @staticmethod
    async def _read_pdf_or_docx(filename: str, file_bytes: bytes) -> str | None:
        ext = filename.split(".")[-1].lower()
        if ext == "pdf":
            return DocumentParser._extract_from_pdf(file_bytes)
        elif ext in ["doc", "docx"]:
            return DocumentParser._extract_from_doc(file_bytes)
        elif ext == "txt":
            return DocumentParser._extract_from_txt(file_bytes)
        else:
            print(f"Unsupported description file format: {ext}")
            return None

    # Inventory, Sales, Balance sheets
    @staticmethod
    async def _read_csv_or_xlsx(
        filename: str, file_bytes: bytes
    ) -> pd.DataFrame | None:
        ext = filename.split(".")[-1].lower()
        if ext == "csv":
            return pd.read_csv(io.BytesIO(file_bytes))
        elif ext in ["xls", "xlsx"]:
            return pd.read_excel(io.BytesIO(file_bytes))
        else:
            print(f"Unsupported spreadsheet format: {ext}")
            return None

    # Helpers for _read_pdf_or_docx()
    @staticmethod
    def _extract_from_pdf(file_bytes: bytes) -> str:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        return "".join(page.get_text() for page in doc)

    @staticmethod
    def _extract_from_doc(file_bytes: bytes) -> str:
        doc = Document(io.BytesIO(file_bytes))
        return "\n".join(para.text for para in doc.paragraphs)

    @staticmethod
    def _extract_from_txt(file_bytes: bytes) -> str:
        return file_bytes.decode("utf-8")

    # Converting a Dataframe into A List Of Strings
    @staticmethod
    def _parse_dataframe(df: pd.DataFrame | None) -> str:
        if df is None or df.empty:
            return ""
        return df.to_string()
