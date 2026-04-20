# Module to Send a Generated Report for the User
import os

import dotenv
import process
import resend
from pandas.io.common import BytesIO

# Initialise Environment
dotenv.load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")
email_address = os.getenv("EMAIL")


# Send Email to User
def send_email(reportBuffer: BytesIO, spreadsheetBuffer: BytesIO):
    """Send Email to User with Attachments after Generating Word and Excel File"""
    report = reportBuffer.read()
    spreadsheet = spreadsheetBuffer.read()

    # Convert Bytes into Attachment item
    report_attachment: resend.Attachment = {
        "content": list(report),
        "filename": "report.docx",
    }

    spreadsheet_attachment: resend.Attachment = {
        "content": list(spreadsheet),
        "filename": "spreadsheet.xlsx",
    }

    params: resend.Emails.SendParams = {
        "from": "onboarding@resend.dev",
        "to": [email_address],
        "subject": "Testing Email",
        "html": "<strong>it works!</strong><br/>Hello",
        "attachments": [report_attachment, spreadsheet_attachment],
    }

    email = resend.Emails.send(params)
    print(email)
