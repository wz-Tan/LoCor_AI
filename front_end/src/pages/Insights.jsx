import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../shared.css";
import "./Insights.css";

const initialInventory = [
  { id: 1, name: "Electric Drill", category: "Power Tools", current: 45, recommended: 80, price: "RM 189", action: "restock", reason: "Demand trending high — Raya renovation season.", urgent: true },
  { id: 2, name: "Wall Paint 5L", category: "Paint", current: 12, recommended: 60, price: "RM 65", action: "restock", reason: "Stock critically low, high demand expected in Q3.", urgent: true },
  { id: 3, name: "Screwdriver Set", category: "Hand Tools", current: 120, recommended: 120, price: "RM 35", action: "hold", reason: "Stock level is optimal. No changes needed.", urgent: false },
  { id: 4, name: "PVC Pipe 1in", category: "Plumbing", current: 200, recommended: 200, price: "RM 8.50", action: "hold", reason: "Steady demand, current stock sufficient.", urgent: false },
  { id: 5, name: "Cable Wire 10m", category: "Electrical", current: 60, recommended: 40, price: "RM 22", action: "clear", reason: "Demand softening, reduce to avoid overstock.", urgent: false },
  { id: 6, name: "Sand Paper", category: "Finishing", current: 150, recommended: 80, price: "RM 3.50", action: "discount", reason: "Slow moving stock — discount to clear inventory.", urgent: false },
  { id: 7, name: "Hammer", category: "Hand Tools", current: 75, recommended: 75, price: "RM 25", action: "hold", reason: "Stable demand, no action needed.", urgent: false },
];

const ACTION_LABELS = { restock: "Restock", hold: "Hold", clear: "Clear", discount: "Discount" };
const FILTERS = ["All", "Restock", "Hold", "Clear", "Discount"];

export default function Insights() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inventory, setInventory] = useState(initialInventory.map((i) => ({ ...i, decision: null })));
  const [filter, setFilter] = useState("All");
  const recommendationRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("scrollTo") === "recommendations") {
      setTimeout(() => { recommendationRef.current?.scrollIntoView({ behavior: "smooth" }); }, 300);
    }
  }, []);

  function handleDecision(id, decision) {
    setInventory((prev) => prev.map((item) => item.id === id ? { ...item, decision } : item));
  }

  const filtered = inventory.filter((item) => filter === "All" ? true : item.action === filter.toLowerCase());
  const urgentCount = inventory.filter((i) => i.urgent).length;
  const acceptedCount = inventory.filter((i) => i.decision === "accepted").length;
  const pendingCount = inventory.filter((i) => i.decision === null).length;
  const rejectedCount = inventory.filter((i) => i.decision === "rejected").length;

  return (
    <>
      <div className="bg-grid" />
      <div className="bg-glow" />
      <div className="bg-glow-2" />
      <div className="inv-wrap">
        <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? "<" : ">"}
        </button>
        <aside className={`sidebar ${sidebarOpen ? "" : "closed"}`}>
          <div className="sidebar-logo">Lo<em>Co</em>AI</div>
          <nav className="sidebar-nav">
            <button className="nav-item" onClick={() => navigate("/dashboard")}><span className="nav-icon">⊞</span> Dashboard</button>
            <button className="nav-item active" onClick={() => navigate("/insights")}><span className="nav-icon">◫</span> Insights</button>
            <button className="nav-item" onClick={() => navigate("/chat")}><span className="nav-icon">◉</span> Chat</button>
            <button className="nav-item" onClick={() => navigate("/?reupload=true")}><span className="nav-icon">⊕</span> Upload Data</button>
          </nav>
          <div className="sidebar-footer">LoCoAI · SME Edition</div>
        </aside>
        <main className={`main ${sidebarOpen ? "" : "collapsed"}`}>
          <div className="page-header">
            <div>
              <h1 className="page-title">Inventory Manager</h1>
              <p className="page-subtitle">Review AI recommendations and accept or reject each change.</p>
            </div>
            <button className="export-btn">↓ Export Plan</button>
          </div>
          {urgentCount > 0 && (
            <div className="urgent-banner">
              <span className="urgent-dot" />
              <span className="urgent-text">{urgentCount} urgent item{urgentCount > 1 ? "s" : ""} flagged — immediate action recommended.</span>
            </div>
          )}
          <div className="filter-tabs">
            {FILTERS.map((f) => (
              <button key={f} className={`tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
          <div className="table-wrap">
            <div className="table-header">
              <span>Product</span><span>Current</span><span>Recommended</span><span>Price</span><span>Action Tag</span><span>Decision</span>
            </div>
            {filtered.map((item) => (
              <div className={`table-row ${item.urgent ? "urgent" : ""}`} key={item.id}>
                <div>
                  <div className="product-name">{item.name}</div>
                  <div className="product-cat">{item.category}</div>
                  <div style={{ fontSize: "0.7rem", color: "rgba(240,237,232,0.25)", marginTop: "3px" }}>{item.reason}</div>
                </div>
                <div className="cell">{item.current} units</div>
                <div className="cell" style={{ color: item.recommended > item.current ? "rgba(20,200,160,0.8)" : item.recommended < item.current ? "rgba(255,180,50,0.8)" : "rgba(240,237,232,0.6)" }}>
                  {item.recommended} units
                </div>
                <div className="cell">{item.price}</div>
                <div><span className={`badge ${item.action}`}>{ACTION_LABELS[item.action]}</span></div>
                <div className="action-btns">
                  {item.decision === null ? (
                    <>
                      <button className="accept-btn" onClick={() => handleDecision(item.id, "accepted")}>✓ Accept</button>
                      <button className="reject-btn" onClick={() => handleDecision(item.id, "rejected")}>✕</button>
                    </>
                  ) : item.decision === "accepted" ? (
                    <span className="accepted-label">✓ Accepted</span>
                  ) : (
                    <span className="rejected-label">✕ Rejected</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div ref={recommendationRef} className="ai-recommendations">
            <div className="ai-recommendations-title">AI Recommendations</div>
            {[
              { icon: "🔺", text: "Restock Electric Drills immediately — demand up 34%, projected stockout in 8 days." },
              { icon: "🔺", text: "Increase Wall Paint 5L order — renovation season approaching, current stock critically low." },
              { icon: "🔻", text: "Discount Sand Paper by 15-20% — slow moving stock, clear before it becomes dead inventory." },
              { icon: "◆", text: "Hold Screwdriver Set and PVC Pipe orders — stock levels are optimal for current demand." },
            ].map((r, i) => (
              <div key={i} className="recommendation-item">
                <span style={{ flexShrink: 0 }}>{r.icon}</span>
                <span>{r.text}</span>
              </div>
            ))}
            <button className="explore-btn" onClick={() => navigate("/chat?q=Tell me more about my recommendations")}>
              Explore More with AI Chat →
            </button>
          </div>
          <div className="summary-row">
            <div className="summary-card"><div className="summary-label">Total Items</div><div className="summary-value">{inventory.length}</div></div>
            <div className="summary-card"><div className="summary-label">Accepted</div><div className="summary-value" style={{ color: "rgba(20,200,160,0.8)" }}>{acceptedCount}</div></div>
            <div className="summary-card"><div className="summary-label">Pending</div><div className="summary-value" style={{ color: "rgba(160,155,255,0.8)" }}>{pendingCount}</div></div>
            <div className="summary-card"><div className="summary-label">Rejected</div><div className="summary-value" style={{ color: "rgba(255,100,100,0.8)" }}>{rejectedCount}</div></div>
          </div>
        </main>
      </div>
    </>
  );
}