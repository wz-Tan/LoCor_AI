const ENDPOINT = 8000;

let currentChat = null;

export async function getChatHistory() {
  console.log("Getting Chat History");
  if (!currentChat) {
    console.log("Getting chat history from backend");
    currentChat = await retrieveChatHistoryFromBackend();
  }
  console.log("Current chat is ", currentChat);
  return currentChat;
}

export async function retrieveChatHistoryFromBackend() {
  console.log("Acquiring Chat History");

  const res = await fetch(`http://localhost:${ENDPOINT}/chat_history`, {
    method: "GET",
  });

  const data = await res.json();
  return data.chat_history;
}

export async function getAIResponse(user_message) {
  console.log("Getting AI Response to User's Message", user_message);
  currentChat.push({ role: "user", content: user_message });
  const res = await fetch(`http://localhost:${ENDPOINT}/chat_response`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_response: user_message }),
  });
  const data = await res.json();
  currentChat.push(data);
  console.log("AI Response is ", data.ai_response);
  return data.ai_response;
}
