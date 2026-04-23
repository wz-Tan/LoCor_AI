# Module to Send a Generated Report for the User
import os
from datetime import date

import resend
from dotenv import load_dotenv
from io import BytesIO

# Initialise Environment
load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")
email_address = os.getenv("EMAIL")


# Send Email to User
def send_email(reportBuffer: BytesIO, spreadsheetBuffer: BytesIO) -> None:

    today = date.today()
    """Send Email to User with Attachments after Generating Word and Excel File"""
    reportBuffer.seek(0)
    spreadsheetBuffer.seek(0)
    report = reportBuffer.read()
    spreadsheet = spreadsheetBuffer.read()

    # Convert Bytes into Attachment items
    report_attachment: resend.Attachment = {
        "content": list(report),
        "filename": f"Report_For_{today}.docx",
    }

    spreadsheet_attachment: resend.Attachment = {
        "content": list(spreadsheet),
        "filename": f"Spreadsheet_For_{today}.xlsx",
    }

    # Email content
    params: resend.Emails.SendParams = {
        "from": "onboarding@resend.dev",
        "to": [email_address],
        "subject": f"Weekly Proposal and Business Report on {today}",
        "html": "<strong>Attached are this week`s business report and the suggested inventory changes</strong>",
        "attachments": [report_attachment, spreadsheet_attachment],
    }

    # Send email
    email = resend.Emails.send(params)
    print(f"\nEmail sent:\n{email}\n")
