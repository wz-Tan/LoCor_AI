const ENDPOINT = 8000;

export async function getChatHistory() {
  console.log("Acquiring Chat History");

  const res = await fetch(`http://localhost:${ENDPOINT}/chat_history`, {
    method: "GET",
  });

  const data = await res.json();
  return data.chat_history;
}

export async function getAIResponse(user_message) {
  console.log("Getting AI Response to User's Message", user_message);
  const res = await fetch(`http://localhost:${ENDPOINT}/chat_response`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_response: user_message }),
  });
  const data = await res.json();
  console.log("AI Response is ", data.ai_response);
  return data.ai_response;
}
