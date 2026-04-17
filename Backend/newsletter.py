# Module to Send a Generated Report for the User
import os

import dotenv
import resend

# Initialise Environment
dotenv.load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")
email_address = os.getenv("EMAIL")


def decode_attachment(filepath):
    f: bytes = open(os.path.join(os.path.dirname(__file__), filepath), "rb").read()
    return f


# Send Email to User
def send_email(report, spreadsheet):
    report = decode_attachment("./Sample_WordFile.docx")
    spreadsheet = decode_attachment("./Sample_Spreadsheet.xlsx")

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


send_email("a", "b")
