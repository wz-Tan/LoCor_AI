import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../shared.css";
import "./Chat.css";

const SUGGESTED = [
  "Why restock Electric Drills?",
  "What's my highest risk item?",
  "Summarise this month's trends",
  "Which items should I discount?",
];

const AI_REPLIES = {
  "Why restock Electric Drills?": "Based on your sales data and current market trends, Electric Drills have seen a 34% demand increase this month — likely driven by the Raya renovation season. Your current stock of 45 units is projected to run out in 8 days at the current sales rate. I recommend restocking to at least 80 units.",
  "What's my highest risk item?": "Your highest risk item right now is Wall Paint 5L. With only 12 units remaining and demand projected to rise in Q3, you're at risk of stockout within 6 days. Immediate restocking is recommended.",
  "Summarise this month's trends": "This month, Power Tools and Paint categories are trending upward — driven by the renovation season. Finishing products like Sand Paper are slowing down. Overall revenue is up 12% compared to last month. 3 items need urgent attention: Electric Drills, Wall Paint, and Cable Wire.",
  "Which items should I discount?": "Based on your inventory and sales velocity, Sand Paper has the slowest movement. With 150 units in stock and declining demand, a 15-20% discount would help clear stock before it becomes dead inventory. Cable Wire is also worth considering for a smaller discount.",
  "Tell me more about my recommendations": "Based on your current inventory and market trends, here are my top recommendations: 1) Restock Electric Drills to at least 80 units — demand is up 34% this month. 2) Urgently reorder Wall Paint 5L — only 12 units left, projected stockout in 6 days. 3) Discount Sand Paper by 15-20% to clear slow-moving stock. 4) Hold all other orders — stock levels are optimal. Would you like me to go deeper on any specific item?",
};

function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getDateLabel() {
  return new Date().toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

function formatMessage(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code style='background:rgba(255,255,255,0.1);padding:2px 6px;border-radius:4px;font-size:0.8em;'>$1</code>")
    .replace(/\n/g, "<br/>");
}

export default function Chat() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState([
    {
      id: 1,
      title: "New conversation",
      date: "Today",
      messages: [
        { role: "ai", text: "Hello! I'm your LoCoAI assistant. Ask me anything about your inventory, trends, or recommendations.", time: getTime() },
      ],
    },
  ]);
  const [activeSessionId, setActiveSessionId] = useState(1);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const activeSession = sessions.find((s) => s.id === activeSessionId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, isTyping]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      window.history.replaceState({}, "", "/chat");
      handleSuggestion(q);
    }
  }, []);

  function handleNewChat() {
    const newSession = {
      id: Date.now(),
      title: "New conversation",
      date: "Today",
      messages: [{ role: "ai", text: "Hello! I'm your LoCoAI assistant. Ask me anything about your inventory, trends, or recommendations.", time: getTime() }],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  }

  function handleSuggestion(text) {
    const userMsg = { role: "user", text, time: getTime() };
    setIsTyping(true);
    setTimeout(() => {
      const reply = AI_REPLIES[text] || "Based on your data, here's what I found...";
      const aiMsg = { role: "ai", text: reply, time: getTime() };
      setIsTyping(false);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, userMsg, aiMsg], title: s.title === "New conversation" ? text.slice(0, 30) : s.title }
            : s
        )
      );
    }, 1500);
  }

  function handleSend() {
    const text = input.trim();
    if (!text && !attachedFile) return;
    const userMsg = {
      role: "user",
      text: attachedFile ? `${text ? text + " " : ""}[Attached: ${attachedFile.name}]` : text,
      time: getTime(),
    };
    setInput("");
    setAttachedFile(null);
    setIsTyping(true);
    setTimeout(() => {
      const reply = AI_REPLIES[text] || "That's a great question! Based on your uploaded data, I can see patterns that suggest you should focus on your high-demand items this season. Would you like me to break down specific recommendations for each product category?";
      const aiMsg = { role: "ai", text: reply, time: getTime() };
      setIsTyping(false);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, userMsg, aiMsg], title: s.title === "New conversation" ? (text.slice(0, 30) || attachedFile?.name) : s.title }
            : s
        )
      );
    }, 1500);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  const todaySessions = sessions.filter((s) => s.date === "Today");
  const yesterdaySessions = sessions.filter((s) => s.date === "Yesterday");

  return (
    <>
      <div className="bg-grid" />
      <div className="bg-glow" />
      <div className="bg-glow-2" />
      <div className="chat-wrap">
        <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? "<" : ">"}
        </button>
        <aside className={`sidebar ${sidebarOpen ? "" : "closed"}`}>
          <div className="sidebar-logo">Lo<em>Co</em>AI</div>
          <nav className="sidebar-nav">
            <button className="nav-item" onClick={() => navigate("/dashboard")}><span className="nav-icon">⊞</span> Dashboard</button>
            <button className="nav-item" onClick={() => navigate("/inventory")}><span className="nav-icon">◫</span> Inventory</button>
            <button className="nav-item active" onClick={() => navigate("/chat")}><span className="nav-icon">◉</span> Chat</button>
            <button className="nav-item" onClick={() => navigate("/?reupload=true")}><span className="nav-icon">⊕</span> Upload Data</button>
          </nav>
          <div className="sidebar-footer">LoCoAI · SME Edition</div>
        </aside>
        <aside className={`history-sidebar ${sidebarOpen ? "" : "closed"}`}>
          <div className="history-title">Chat History</div>
          <button className="new-chat-btn" onClick={handleNewChat}>+ New Chat</button>
          {todaySessions.length > 0 && (
            <>
              <div className="history-section-label">Today</div>
              {todaySessions.map((s) => (
                <div key={s.id} className={`history-item ${s.id === activeSessionId ? "selected" : ""}`} onClick={() => setActiveSessionId(s.id)}>
                  <div className="history-item-title">{s.title}</div>
                  <div className="history-item-date">{getDateLabel()}</div>
                </div>
              ))}
            </>
          )}
          {yesterdaySessions.length > 0 && (
            <>
              <div className="history-section-label">Yesterday</div>
              {yesterdaySessions.map((s) => (
                <div key={s.id} className={`history-item ${s.id === activeSessionId ? "selected" : ""}`} onClick={() => setActiveSessionId(s.id)}>
                  <div className="history-item-title">{s.title}</div>
                  <div className="history-item-date">Yesterday</div>
                </div>
              ))}
            </>
          )}
        </aside>
        <div className={`chat-main ${sidebarOpen ? "" : "collapsed"}`}>
          <div className="chat-header">
            <div>
              <div className="chat-header-title">{activeSession?.title || "New conversation"}</div>
              <div className="chat-header-sub">Answers based on your uploaded business data</div>
            </div>
            <span className="model-badge">LoCoAI · GLM</span>
          </div>
          <div className="messages-wrap">
            {activeSession?.messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role}`}>
                <div className={`avatar ${msg.role}`}>{msg.role === "ai" ? "AI" : "You"}</div>
                <div style={{ minWidth: 0, width: "70%", flex: "0 1 auto" }}>
                <div className={`bubble ${msg.role}`} style={{ width: "100%", wordBreak: "break-word", overflowWrap: "break-word" }} dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }} />                  <div className="bubble-time">{msg.time}</div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="message ai">
                <div className="avatar ai">AI</div>
                <div className="bubble ai typing">
                  <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {activeSession?.messages.length <= 1 && (
            <div className="suggestions">
              {SUGGESTED.map((s, i) => (
                <button key={i} className="suggestion-chip" onClick={() => handleSuggestion(s)}>{s}</button>
              ))}
            </div>
          )}
          <div className="input-area">
            {attachedFile && (
              <div className="file-preview">
                📎 {attachedFile.name}
                <button className="file-remove" onClick={() => setAttachedFile(null)}>✕</button>
              </div>
            )}
            <div className="input-wrap">
              <textarea className="chat-input" placeholder="Ask anything about your business..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} rows={1} />
              <div className="input-actions">
                <button className="attach-btn" onClick={() => fileInputRef.current?.click()}>📎</button>
                <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="*" onChange={(e) => setAttachedFile(e.target.files[0])} />
                <button className="send-btn" onClick={handleSend} disabled={!input.trim() && !attachedFile}>→</button>
              </div>
            </div>
            <div className="input-hint">Press Enter to send · Shift+Enter for new line · Attach any file</div>
          </div>
        </div>
      </div>
    </>
  );
}