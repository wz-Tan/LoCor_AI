import json
import re

from prompts.ai_generation import DASHBOARD_PROMPT, INSIGHTS_PROMPT


class AIChat:
    def __init__(self, client):
        self.client = client

    async def respond(self, chat_history, context):
        messages = list(chat_history)

        if context:
            if messages and messages[0]["role"] == "system":
                messages[0] = {
                    "role": "system",
                    "content": messages[0]["content"] + f"\n\nRelevant business data:\n\n{context}",
                }
            else:
                messages.insert(0, {"role": "system", "content": f"Relevant business data:\n\n{context}"})

        response = self._complete(messages, max_tokens=2048, temperature=0.5)
        return response

    async def insights(self, context):
        messages = [
            {"role": "system", "content": INSIGHTS_PROMPT},
            {"role": "user", "content": f"Here is the business data:\n\n{context}"},
        ]
        raw = self._complete(messages, max_tokens=2000, temperature=0.3)
        return json.loads(self._clean_json(raw))

    async def dashboard(self, context):
        messages = [
            {"role": "system", "content": DASHBOARD_PROMPT},
            {"role": "user", "content": f"Here is the business data:\n\n{context}"},
        ]
        raw = self._complete(messages, max_tokens=5000, temperature=0.3)
        return json.loads(self._clean_json(raw))

    def _complete(self, messages, **kwargs):
        response = self.client.chat.completions.create(
            model="glm-4.5-flash",
            messages=messages,
            thinking={"type": "disabled"},
            **kwargs,
        )
        return response.choices[0].message.content

    @staticmethod
    def _clean_json(raw: str) -> str:
        return re.sub(r"^```(?:json)?\s*|\s*```$", "", raw.strip())