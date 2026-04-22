import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

  .inv-wrap {
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

  .toggle-btn:hover {
    background: rgba(255,255,255,0.1);
    color: #f0ede8;
  }

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

  .sidebar-logo {
    font-family: 'DM Serif Display', serif;
    font-size: 1.5rem;
    color: #f0ede8;
  }

  .sidebar-logo em {
    font-style: italic;
    color: rgba(160,155,255,0.9);
  }

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

  .sidebar-footer {
    margin-top: auto;
    font-size: 0.7rem;
    color: rgba(240,237,232,0.2);
    letter-spacing: 0.05em;
  }

  .main {
    flex: 1;
    padding: 2.5rem;
    animation: fadeUp 0.6s ease both;
    margin-left: 220px;
    transition: margin-left 0.3s ease;
  }

  .main.collapsed {
    margin-left: 0;
    padding-left: 4rem;
  }

  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 2rem;
  }

  .page-title {
    font-family: 'DM Serif Display', serif;
    font-size: 2rem;
    color: #f0ede8;
    margin-bottom: 0.25rem;
  }

  .page-subtitle { font-size: 0.85rem; color: rgba(240,237,232,0.35); font-weight: 300; }

  .export-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.05);
    color: rgba(240,237,232,0.7);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.82rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .export-btn:hover { background: rgba(255,255,255,0.09); color: #f0ede8; }

  .urgent-banner {
    background: rgba(255,100,100,0.07);
    border: 1px solid rgba(255,100,100,0.2);
    border-radius: 14px;
    padding: 1rem 1.25rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .urgent-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255,100,100,0.9);
    flex-shrink: 0;
    animation: pulse 1.2s ease infinite;
  }

  .urgent-text { font-size: 0.82rem; color: rgba(255,100,100,0.9); }

  .filter-tabs { display: flex; gap: 8px; margin-bottom: 1.5rem; }

  .tab {
    padding: 7px 16px;
    border-radius: 999px;
    font-size: 0.78rem;
    cursor: pointer;
    border: 1px solid rgba(255,255,255,0.08);
    background: none;
    color: rgba(240,237,232,0.4);
    font-family: 'DM Sans', sans-serif;
    transition: all 0.2s ease;
  }

  .tab:hover { background: rgba(255,255,255,0.05); color: rgba(240,237,232,0.7); }

  .tab.active {
    background: rgba(160,155,255,0.12);
    border-color: rgba(160,155,255,0.3);
    color: rgba(160,155,255,0.95);
  }

  .table-wrap {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 18px;
    overflow: hidden;
    margin-bottom: 1.5rem;
  }

  .table-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr 1.5fr;
    padding: 14px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    font-size: 0.68rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(240,237,232,0.2);
  }

  .table-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr 1.5fr;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    align-items: center;
    transition: background 0.15s ease;
  }

  .table-row:last-child { border-bottom: none; }
  .table-row:hover { background: rgba(255,255,255,0.02); }

  .table-row.urgent {
    background: rgba(255,100,100,0.04);
    border-left: 2px solid rgba(255,100,100,0.4);
  }

  .product-name { font-size: 0.85rem; color: #f0ede8; font-weight: 500; }
  .product-cat { font-size: 0.7rem; color: rgba(240,237,232,0.3); margin-top: 2px; }
  .cell { font-size: 0.82rem; color: rgba(240,237,232,0.6); }

  .badge {
    display: inline-block;
    font-size: 0.65rem;
    padding: 4px 10px;
    border-radius: 999px;
    font-weight: 500;
    letter-spacing: 0.05em;
  }

  .badge.restock { background: rgba(255,100,100,0.1); color: rgba(255,100,100,0.9); border: 1px solid rgba(255,100,100,0.2); }
  .badge.hold { background: rgba(160,155,255,0.1); color: rgba(160,155,255,0.9); border: 1px solid rgba(160,155,255,0.2); }
  .badge.clear { background: rgba(255,180,50,0.1); color: rgba(255,180,50,0.9); border: 1px solid rgba(255,180,50,0.2); }
  .badge.discount { background: rgba(20,200,160,0.1); color: rgba(20,200,160,0.9); border: 1px solid rgba(20,200,160,0.2); }

  .action-btns { display: flex; gap: 6px; }

  .accept-btn {
    padding: 5px 12px;
    border-radius: 8px;
    border: 1px solid rgba(20,200,160,0.3);
    background: rgba(20,200,160,0.08);
    color: rgba(20,200,160,0.9);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.72rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .accept-btn:hover { background: rgba(20,200,160,0.15); }

  .reject-btn {
    padding: 5px 12px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.08);
    background: none;
    color: rgba(240,237,232,0.3);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.72rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .reject-btn:hover { background: rgba(255,100,100,0.08); border-color: rgba(255,100,100,0.2); color: rgba(255,100,100,0.8); }

  .accepted-label { font-size: 0.72rem; color: rgba(20,200,160,0.7); }
  .rejected-label { font-size: 0.72rem; color: rgba(240,237,232,0.2); }

  .summary-row { display: flex; gap: 12px; }

  .summary-card {
    flex: 1;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 1.1rem 1.25rem;
  }

  .summary-label {
    font-size: 0.68rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(240,237,232,0.25);
    margin-bottom: 0.4rem;
  }

  .summary-value { font-family: 'DM Serif Display', serif; font-size: 1.5rem; color: #f0ede8; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.7); }
  }
`;

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

export default function Inventory() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inventory, setInventory] = useState(initialInventory.map((i) => ({ ...i, decision: null })));
  const [filter, setFilter] = useState("All");
  const recommendationRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("scrollTo") === "recommendations") {
      setTimeout(() => {
        recommendationRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
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
      <style>{styles}</style>
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
            <button className="nav-item" onClick={() => navigate("/dashboard")}>
              <span className="nav-icon">⊞</span> Dashboard
            </button>
            <button className="nav-item active" onClick={() => navigate("/inventory")}>
              <span className="nav-icon">◫</span> Inventory
            </button>
            <button className="nav-item" onClick={() => navigate("/chat")}>
              <span className="nav-icon">◉</span> Chat
            </button>
            <button className="nav-item" onClick={() => navigate("/?reupload=true")}>
              <span className="nav-icon">⊕</span> Upload Data
            </button>
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
              <span className="urgent-text">
                {urgentCount} urgent item{urgentCount > 1 ? "s" : ""} flagged — immediate action recommended.
              </span>
            </div>
          )}

          <div className="filter-tabs">
            {FILTERS.map((f) => (
              <button key={f} className={`tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>

          <div className="table-wrap">
            <div className="table-header">
              <span>Product</span>
              <span>Current</span>
              <span>Recommended</span>
              <span>Price</span>
              <span>Action Tag</span>
              <span>Decision</span>
            </div>

            {filtered.map((item) => (
              <div className={`table-row ${item.urgent ? "urgent" : ""}`} key={item.id}>
                <div>
                  <div className="product-name">{item.name}</div>
                  <div className="product-cat">{item.category}</div>
                  <div style={{ fontSize: "0.7rem", color: "rgba(240,237,232,0.25)", marginTop: "3px" }}>{item.reason}</div>
                </div>
                <div className="cell">{item.current} units</div>
                <div className="cell" style={{
                  color: item.recommended > item.current ? "rgba(20,200,160,0.8)" : item.recommended < item.current ? "rgba(255,180,50,0.8)" : "rgba(240,237,232,0.6)"
                }}>
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

          {/* AI Recommendations */}
          <div ref={recommendationRef} style={{
            background: "rgba(160,155,255,0.06)",
            border: "1px solid rgba(160,155,255,0.18)",
            borderRadius: "18px",
            padding: "1.5rem",
            marginBottom: "1.5rem",
          }}>
            <div style={{
              fontSize: "0.7rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(160,155,255,0.5)",
              marginBottom: "1.25rem",
            }}>
              AI Recommendations
            </div>

            {[
              { icon: "🔺", text: "Restock Electric Drills immediately — demand up 34%, projected stockout in 8 days." },
              { icon: "🔺", text: "Increase Wall Paint 5L order — renovation season approaching, current stock critically low." },
              { icon: "🔻", text: "Discount Sand Paper by 15-20% — slow moving stock, clear before it becomes dead inventory." },
              { icon: "◆", text: "Hold Screwdriver Set and PVC Pipe orders — stock levels are optimal for current demand." },
            ].map((r, i, arr) => (
              <div key={i} style={{
                display: "flex",
                gap: "12px",
                padding: "12px 0",
                borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                fontSize: "0.83rem",
                color: "rgba(240,237,232,0.7)",
                lineHeight: 1.6,
                alignItems: "flex-start",
              }}>
                <span style={{ flexShrink: 0 }}>{r.icon}</span>
                <span>{r.text}</span>
              </div>
            ))}

            <button
              onClick={() => navigate("/chat?q=Tell me more about my recommendations")}
              style={{
                marginTop: "1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                borderRadius: "10px",
                border: "1px solid rgba(160,155,255,0.3)",
                background: "rgba(160,155,255,0.1)",
                color: "rgba(160,155,255,0.9)",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.82rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Explore More with AI Chat →
            </button>
          </div>

          <div className="summary-row">
            <div className="summary-card">
              <div className="summary-label">Total Items</div>
              <div className="summary-value">{inventory.length}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Accepted</div>
              <div className="summary-value" style={{ color: "rgba(20,200,160,0.8)" }}>{acceptedCount}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Pending</div>
              <div className="summary-value" style={{ color: "rgba(160,155,255,0.8)" }}>{pendingCount}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Rejected</div>
              <div className="summary-value" style={{ color: "rgba(255,100,100,0.8)" }}>{rejectedCount}</div>
            </div>
          </div>

        </main>
      </div>
    </>
  );
}