import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getChatHistory, getAIResponse } from "../../api/chat";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: #0d0d0f;
    color: #f0ede8;
    min-height: 100vh;
  }

  .bg-grid {
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
    z-index: 0;
  }

  .bg-glow {
    position: fixed;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99,75,255,0.12) 0%, transparent 70%);
    top: -100px;
    right: -100px;
    pointer-events: none;
    z-index: 0;
  }

  .bg-glow-2 {
    position: fixed;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(20,200,160,0.08) 0%, transparent 70%);
    bottom: -50px;
    left: -50px;
    pointer-events: none;
    z-index: 0;
  }

  .chat-wrap {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    display: flex;
  }

  .toggle-btn {
    position: fixed;
    top: 1.25rem;
    left: 1.25rem;
    z-index: 20;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(240,237,232,0.6);
    border-radius: 8px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s ease;
  }

  .toggle-btn:hover { background: rgba(255,255,255,0.1); color: #f0ede8; }

  .sidebar {
    width: 220px;
    min-height: 100vh;
    background: rgba(255,255,255,0.03);
    border-right: 1px solid rgba(255,255,255,0.07);
    padding: 2rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 10;
    transition: transform 0.3s ease;
  }

  .sidebar.closed { transform: translateX(-220px); }

  .sidebar-logo { font-family: 'DM Serif Display', serif; font-size: 1.5rem; color: #f0ede8; }
  .sidebar-logo em { font-style: italic; color: rgba(160,155,255,0.9); }
  .sidebar-nav { display: flex; flex-direction: column; gap: 4px; }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 0.85rem;
    color: rgba(240,237,232,0.45);
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    font-family: 'DM Sans', sans-serif;
  }

  .nav-item:hover { background: rgba(255,255,255,0.05); color: rgba(240,237,232,0.8); }

  .nav-item.active {
    background: rgba(160,155,255,0.12);
    color: rgba(160,155,255,0.95);
    border: 1px solid rgba(160,155,255,0.2);
  }

  .nav-icon { font-size: 1rem; }
  .sidebar-footer { margin-top: auto; font-size: 0.7rem; color: rgba(240,237,232,0.2); letter-spacing: 0.05em; }

  .history-sidebar {
    width: 240px;
    min-height: 100vh;
    background: rgba(255,255,255,0.02);
    border-right: 1px solid rgba(255,255,255,0.06);
    padding: 1.5rem 1rem;
    position: fixed;
    top: 0;
    left: 220px;
    bottom: 0;
    z-index: 9;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
    transition: transform 0.3s ease;
  }

  .history-sidebar.closed { transform: translateX(-220px); }

  .history-title { font-size: 0.68rem; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(240,237,232,0.2); padding: 0 4px; }

  .new-chat-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 14px;
    border-radius: 10px;
    border: 1px dashed rgba(255,255,255,0.1);
    background: none;
    color: rgba(240,237,232,0.4);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
    text-align: left;
  }

  .new-chat-btn:hover { background: rgba(160,155,255,0.08); border-color: rgba(160,155,255,0.25); color: rgba(160,155,255,0.9); }

  .history-section-label { font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(240,237,232,0.15); padding: 0 4px; margin-top: 0.5rem; }

  .history-item {
    padding: 10px 12px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
  }

  .history-item:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.07); }
  .history-item.selected { background: rgba(160,155,255,0.08); border-color: rgba(160,155,255,0.2); }

  .history-item-title { font-size: 0.8rem; color: rgba(240,237,232,0.65); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px; }
  .history-item.selected .history-item-title { color: rgba(160,155,255,0.9); }
  .history-item-date { font-size: 0.68rem; color: rgba(240,237,232,0.2); }

  .chat-main {
    margin-left: 460px;
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100vh;
    position: relative;
    transition: margin-left 0.3s ease;
    overflow: hidden;
    min-width: 0;
    max-width: calc(100vw - 460px);
  }

  .chat-main.collapsed { margin-left: 240px; }

  .chat-header {
    padding: 1.5rem 2rem;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .chat-header-title { font-size: 0.9rem; color: rgba(240,237,232,0.7); font-weight: 500; }
  .chat-header-sub { font-size: 0.72rem; color: rgba(240,237,232,0.25); margin-top: 2px; }

  .model-badge {
    font-size: 0.68rem;
    padding: 4px 12px;
    border-radius: 999px;
    background: rgba(160,155,255,0.08);
    border: 1px solid rgba(160,155,255,0.2);
    color: rgba(160,155,255,0.8);
  }

  .messages-wrap {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .messages-wrap::-webkit-scrollbar { width: 4px; }
  .messages-wrap::-webkit-scrollbar-track { background: transparent; }
  .messages-wrap::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 999px; }

  .message { display: flex; gap: 12px; animation: fadeUp 0.3s ease both; width: 100%; box-sizing: border-box; }
  .message.user { flex-direction: row-reverse; }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 500;
    flex-shrink: 0;
  }

  .avatar.ai { background: rgba(160,155,255,0.15); border: 1px solid rgba(160,155,255,0.2); color: rgba(160,155,255,0.9); }
  .avatar.user { background: rgba(20,200,160,0.12); border: 1px solid rgba(20,200,160,0.2); color: rgba(20,200,160,0.9); }

  .bubble { width: fit-content; max-width: 100%; padding: 12px 16px; border-radius: 16px; font-size: 0.85rem; line-height: 1.6; word-break: break-all; overflow-wrap: anywhere; white-space: pre-wrap; }

  .bubble.ai { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); color: rgba(240,237,232,0.8); border-top-left-radius: 4px; }
  .bubble.user { background: rgba(160,155,255,0.12); border: 1px solid rgba(160,155,255,0.2); color: rgba(240,237,232,0.9); border-top-right-radius: 4px; width: 100%; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; }
  .bubble-time { font-size: 0.65rem; color: rgba(240,237,232,0.2); margin-top: 6px; }
  .message.user .bubble-time { text-align: right; }

  .typing { display: flex; gap: 4px; align-items: center; padding: 14px 16px; }

  .typing-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(160,155,255,0.6);
    animation: typingPulse 1.2s ease infinite;
  }

  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }

  @keyframes typingPulse {
    0%, 100% { opacity: 0.3; transform: translateY(0); }
    50% { opacity: 1; transform: translateY(-3px); }
  }

  .suggestions { display: flex; flex-wrap: wrap; gap: 8px; padding: 0 2rem 1rem; }

  .suggestion-chip {
    padding: 7px 14px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.08);
    background: none;
    color: rgba(240,237,232,0.45);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .suggestion-chip:hover { background: rgba(160,155,255,0.08); border-color: rgba(160,155,255,0.25); color: rgba(160,155,255,0.9); }

  .input-area { padding: 1rem 2rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.06); }

  .input-wrap {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 16px;
    padding: 10px 14px;
    transition: border-color 0.2s ease;
  }

  .input-wrap:focus-within { border-color: rgba(160,155,255,0.35); }

  .chat-input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.875rem;
    color: #f0ede8;
    resize: none;
    max-height: 120px;
    line-height: 1.5;
  }

  .chat-input::placeholder { color: rgba(240,237,232,0.2); }

  .input-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

  .attach-btn { background: none; border: none; color: rgba(240,237,232,0.25); cursor: pointer; font-size: 1rem; padding: 4px; transition: color 0.2s; }
  .attach-btn:hover { color: rgba(240,237,232,0.6); }

  .send-btn {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    border: none;
    background: rgba(160,155,255,0.9);
    color: #0d0d0f;
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .send-btn:hover { background: rgba(160,155,255,1); transform: scale(1.05); }
  .send-btn:disabled { background: rgba(255,255,255,0.08); color: rgba(240,237,232,0.2); cursor: not-allowed; transform: none; }

  .input-hint { font-size: 0.68rem; color: rgba(240,237,232,0.15); text-align: center; margin-top: 8px; }

  .file-preview {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    background: rgba(20,200,160,0.08);
    border: 1px solid rgba(20,200,160,0.2);
    border-radius: 8px;
    margin-bottom: 8px;
    font-size: 0.75rem;
    color: rgba(20,200,160,0.9);
  }

  .file-remove { background: none; border: none; color: rgba(20,200,160,0.6); cursor: pointer; margin-left: auto; font-size: 0.8rem; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

const SUGGESTED = [
  "Why restock Electric Drills?",
  "What's my highest risk item?",
  "Summarise this month's trends",
  "Which items should I discount?",
];

function getTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDateLabel() {
  return new Date().toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export default function Chat() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // messages is a flat array of { role, text, time } — simpler than sessions for now
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // On mount: load chat history from backend and map into messages array
  useEffect(() => {
    async function chatHistory() {
      try {
        const data = await getChatHistory();

        // role from backend is "user" or "assistant" -> map "assistant" to "ai"
        const mapped = (data ?? [])
          .filter((msg) => msg.role === "user" || msg.role === "assistant")
          .map((msg) => ({
            role: msg.role === "assistant" ? "ai" : "user",
            text: msg.content,
            time: getTime(),
          }));
        setMessages(mapped);
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
    }
    chatHistory();
  }, []);

  // Append a single message object to the messages array
  function appendMessage(msg) {
    setMessages((prev) => [...prev, msg]);
  }

  async function handleSend() {
    const text = input.trim();
    if (!text && !attachedFile) return;

    const userMsg = {
      role: "user",
      text: attachedFile
        ? `${text ? text + " " : ""}[Attached: ${attachedFile.name}]`
        : text,
      time: getTime(),
    };

    setInput("");
    setAttachedFile(null);
    appendMessage(userMsg); // show user message immediately
    setIsTyping(true);

    try {
      const reply = await getAIResponse(text); // POST to backend, returns ai response string
      console.log("AI Response is ", reply);
      appendMessage({ role: "ai", text: reply, time: getTime() });
    } catch (err) {
      console.error("Failed to get AI response", err);
      appendMessage({
        role: "ai",
        text: "Something went wrong. Please try again.",
        time: getTime(),
      });
    } finally {
      setIsTyping(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="bg-grid" />
      <div className="bg-glow" />
      <div className="bg-glow-2" />

      <div className="chat-wrap">
        <button
          className="toggle-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? "<" : ">"}
        </button>

        <aside className={`sidebar ${sidebarOpen ? "" : "closed"}`}>
          <div className="sidebar-logo">
            Lo<em>Co</em>AI
          </div>
          <nav className="sidebar-nav">
            <button className="nav-item" onClick={() => navigate("/dashboard")}>
              <span className="nav-icon">⊞</span> Dashboard
            </button>
            <button className="nav-item" onClick={() => navigate("/insights")}>
              <span className="nav-icon">◫</span> Insights
            </button>
            <button
              className="nav-item active"
              onClick={() => navigate("/chat")}
            >
              <span className="nav-icon">◉</span> Chat
            </button>
            <button
              className="nav-item"
              onClick={() => navigate("/?reupload=true")}
            >
              <span className="nav-icon">⊕</span> Upload Data
            </button>
          </nav>
          <div className="sidebar-footer">LoCorAI · SME Edition</div>
        </aside>

        <div className={`chat-main ${sidebarOpen ? "" : "collapsed"}`}>
          <div className="chat-header">
            <div>
              <div className="chat-header-title">LoCorAI Assistant</div>
              <div className="chat-header-sub">
                Answers based on your uploaded business data
              </div>
            </div>
            <span className="model-badge">LoCorAI · GLM</span>
          </div>

          <div className="messages-wrap">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role}`}>
                <div className={`avatar ${msg.role}`}>
                  {msg.role === "ai" ? "AI" : "You"}
                </div>
                <div style={{ minWidth: 0, maxWidth: "65%", flex: "0 1 65%" }}>
                  <div
                    className={`bubble ${msg.role}`}
                    style={{
                      width: "100%",
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                    }}
                  >
                    {msg.text}
                  </div>
                  <div className="bubble-time">{msg.time}</div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message ai">
                <div className="avatar ai">AI</div>
                <div className="bubble ai typing">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {messages.length === 0 && (
            <div className="suggestions">
              {SUGGESTED.map((s, i) => (
                <button
                  key={i}
                  className="suggestion-chip"
                  onClick={() => {
                    setInput(s);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="input-area">
            {attachedFile && (
              <div className="file-preview">
                📎 {attachedFile.name}
                <button
                  className="file-remove"
                  onClick={() => setAttachedFile(null)}
                >
                  ✕
                </button>
              </div>
            )}
            <div className="input-wrap">
              <textarea
                className="chat-input"
                placeholder="Ask anything about your business..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <div className="input-actions">
                <button
                  className="attach-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  📎
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept="*"
                  onChange={(e) => setAttachedFile(e.target.files[0])}
                />
                <button
                  className="send-btn"
                  onClick={handleSend}
                  disabled={!input.trim() && !attachedFile}
                >
                  →
                </button>
              </div>
            </div>
            <div className="input-hint">
              Press Enter to send · Shift+Enter for new line · Attach any file
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
