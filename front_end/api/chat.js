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

export async function getAIResponseStream(user_message, onChunk) {
    currentChat.push({ role: "user", content: user_message });
    const res = await fetch(`http://localhost:${ENDPOINT}/chat_response/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_response: user_message }),
    });
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = "";
    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        onChunk(chunk);
    }
    currentChat.push({ role: "assistant", content: full });
    return full;
}

export async function clearChat() {
    console.log('cleared chat');
    // await fetch(
    //   `http://localhost:${ENDPOINT}/clear_chat`,
    //   { method: "POST" }
    // );
}