from prompts.ai_generation import DOCUMENT_PROMPT, EXCEL_PROMPT
from processing_generation import generate, newsletter


class AIReportGenerator:
    def __init__(self, client):
        self.client = client

    async def generate(self, context):
        report_content = self._build_doc(context)
        excel_content = self._build_excel(context, report_content)

        word_buffer = generate.generate_doc(report_content)
        excel_buffer = generate.generate_excel(excel_content)

        newsletter.send_email(word_buffer, excel_buffer)

    def _build_doc(self, context):
        messages = [
            {"role": "system", "content": DOCUMENT_PROMPT},
            {"role": "user", "content": f"Here is the business context. Take this as a crucial point of information:\n\n{context}"},
        ]
        return self._complete(messages)

    def _build_excel(self, context, report_content):
        messages = [
            {"role": "system", "content": EXCEL_PROMPT},
            {"role": "user", "content": f"Here is the business context. Take this as a crucial point of information and strictly follow it:\n\n{context}. Follow this business proposal {report_content}"},
        ]
        return self._complete(messages)

    def _complete(self, messages):
        response = self.client.chat.completions.create(
            model="glm-4.5-flash",
            messages=messages,
            thinking={"type": "disabled"},
            max_tokens=2000,
        )
        return response.choices[0].message.content