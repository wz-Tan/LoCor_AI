import { useState } from "react";
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

  .dash-wrap {
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

  .sidebar.closed {
    transform: translateX(-220px);
  }

  .sidebar-logo {
    font-family: 'DM Serif Display', serif;
    font-size: 1.5rem;
    color: #f0ede8;
  }

  .sidebar-logo em {
    font-style: italic;
    color: rgba(160,155,255,0.9);
  }

  .sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

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

  .nav-item:hover {
    background: rgba(255,255,255,0.05);
    color: rgba(240,237,232,0.8);
  }

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

  .page-header { margin-bottom: 2rem; }

  .page-title {
    font-family: 'DM Serif Display', serif;
    font-size: 2rem;
    color: #f0ede8;
    margin-bottom: 0.25rem;
  }

  .page-subtitle {
    font-size: 0.85rem;
    color: rgba(240,237,232,0.35);
    font-weight: 300;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 2rem;
  }

  .metric-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 1.25rem;
    transition: border-color 0.2s ease;
  }

  .metric-card:hover { border-color: rgba(255,255,255,0.15); }

  .metric-label {
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(240,237,232,0.3);
    margin-bottom: 0.6rem;
  }

  .metric-value {
    font-family: 'DM Serif Display', serif;
    font-size: 1.75rem;
    color: #f0ede8;
    line-height: 1;
    margin-bottom: 0.4rem;
  }

  .metric-change { font-size: 0.72rem; font-weight: 300; }
  .up { color: rgba(20,200,160,0.8); }
  .down { color: rgba(255,100,100,0.8); }
  .neutral { color: rgba(240,237,232,0.3); }

  .content-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-bottom: 14px;
  }

  .card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 1.5rem;
  }

  .card-title {
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(240,237,232,0.3);
    margin-bottom: 1.25rem;
  }

  .alert-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }

  .alert-item:last-child { border-bottom: none; }

  .alert-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-top: 5px;
    flex-shrink: 0;
  }

  .alert-dot.high { background: rgba(255,100,100,0.8); }
  .alert-dot.medium { background: rgba(160,155,255,0.8); }
  .alert-dot.low { background: rgba(20,200,160,0.8); }

  .alert-text {
    font-size: 0.82rem;
    color: rgba(240,237,232,0.7);
    line-height: 1.5;
  }

  .alert-time {
    font-size: 0.7rem;
    color: rgba(240,237,232,0.25);
    margin-top: 2px;
  }

  .inv-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    font-size: 0.8rem;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    color: rgba(240,237,232,0.65);
    align-items: center;
  }

  .inv-row:last-child { border-bottom: none; }

  .inv-header {
    color: rgba(240,237,232,0.2);
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .badge {
    display: inline-block;
    font-size: 0.65rem;
    padding: 3px 8px;
    border-radius: 999px;
    font-weight: 500;
  }

  .badge.ok {
    background: rgba(20,200,160,0.1);
    color: rgba(20,200,160,0.9);
    border: 1px solid rgba(20,200,160,0.2);
  }

  .badge.low {
    background: rgba(255,100,100,0.1);
    color: rgba(255,100,100,0.85);
    border: 1px solid rgba(255,100,100,0.2);
  }

  .badge.warn {
    background: rgba(255,180,50,0.1);
    color: rgba(255,180,50,0.85);
    border: 1px solid rgba(255,180,50,0.2);
  }

  .report-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    margin-bottom: 10px;
    transition: border-color 0.2s;
    cursor: pointer;
  }

  .report-box:hover { border-color: rgba(160,155,255,0.3); }
  .report-name { font-size: 0.82rem; color: rgba(240,237,232,0.75); margin-bottom: 3px; }
  .report-date { font-size: 0.7rem; color: rgba(240,237,232,0.25); }
  .report-arrow { font-size: 0.8rem; color: rgba(240,237,232,0.2); }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 1.25rem 1rem;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: 'DM Sans', sans-serif;
    color: rgba(240,237,232,0.6);
    font-size: 0.78rem;
    text-align: center;
  }

  .action-btn:hover {
    background: rgba(160,155,255,0.08);
    border-color: rgba(160,155,255,0.25);
    color: rgba(160,155,255,0.9);
    transform: translateY(-2px);
  }

  .action-icon { font-size: 1.25rem; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

export default function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <>
      <style>{styles}</style>
      <div className="bg-grid" />
      <div className="bg-glow" />
      <div className="bg-glow-2" />

      <div className="dash-wrap">

        <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? "<" : ">"}
        </button>

        <aside className={`sidebar ${sidebarOpen ? "" : "closed"}`}>
          <div className="sidebar-logo">Lo<em>Co</em>AI</div>
          <nav className="sidebar-nav">
            <button className="nav-item active" onClick={() => navigate("/dashboard")}>
              <span className="nav-icon">⊞</span> Dashboard
            </button>
            <button className="nav-item" onClick={() => navigate("/inventory")}>
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
            <h1 className="page-title">Good morning 👋</h1>
            <p className="page-subtitle">Here's your business health check for today.</p>
          </div>

          <div className="metrics-grid">
            {[
              { label: "Monthly Revenue", value: "RM 45,000", change: "↑ 12% vs last month", dir: "up" },
              { label: "Total Inventory", value: "730 units", change: "↓ 3% vs last month", dir: "down" },
              { label: "Trend Alerts", value: "5 alerts", change: "Updated today", dir: "neutral" },
              { label: "Reorder Alerts", value: "3 items", change: "Action needed", dir: "down" },
            ].map((m, i) => (
              <div className="metric-card" key={i}>
                <div className="metric-label">{m.label}</div>
                <div className="metric-value">{m.value}</div>
                <div className={`metric-change ${m.dir}`}>{m.change}</div>
              </div>
            ))}
          </div>

          <div className="content-row">
            <div className="card">
              <div className="card-title">Recent Trend Alerts</div>
              {[
                { level: "high", text: "Electric drills demand surging — Raya renovation season driving sales up 34%.", time: "2 hours ago" },
                { level: "high", text: "Wall paint low stock warning — projected to run out in 6 days at current rate.", time: "4 hours ago" },
                { level: "medium", text: "PVC pipes showing steady demand increase across Klang Valley retailers.", time: "Yesterday" },
                { level: "low", text: "Sand paper demand declining — consider reducing next order quantity.", time: "Yesterday" },
              ].map((a, i) => (
                <div className="alert-item" key={i}>
                  <span className={`alert-dot ${a.level}`} />
                  <div>
                    <div className="alert-text">{a.text}</div>
                    <div className="alert-time">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-title">Inventory Snapshot</div>
              <div className="inv-row inv-header">
                <span>Product</span>
                <span>Stock</span>
                <span>Status</span>
              </div>
              {[
                { name: "Electric Drill", stock: 45, status: "ok" },
                { name: "Wall Paint 5L", stock: 12, status: "low" },
                { name: "Screwdriver Set", stock: 120, status: "ok" },
                { name: "Cable Wire 10m", stock: 8, status: "low" },
                { name: "PVC Pipe 1in", stock: 200, status: "ok" },
                { name: "Sand Paper", stock: 150, status: "warn" },
              ].map((item, i) => (
                <div className="inv-row" key={i}>
                  <span>{item.name}</span>
                  <span>{item.stock}</span>
                  <span className={`badge ${item.status}`}>{item.status.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="content-row">
            <div className="card">
              <div className="card-title">Last Reports Generated</div>
              {[
                { name: "April Inventory Report", date: "Generated 21 Apr 2026, 9:00 AM" },
                { name: "Q1 2026 Business Summary", date: "Generated 1 Apr 2026, 8:30 AM" },
                { name: "March Trend Analysis", date: "Generated 31 Mar 2026, 5:00 PM" },
              ].map((r, i) => (
                <div className="report-box" key={i}>
                  <div>
                    <div className="report-name">{r.name}</div>
                    <div className="report-date">{r.date}</div>
                  </div>
                  <span className="report-arrow">→</span>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-title">Quick Actions</div>
              <div className="actions-grid">
                {[
                  { icon: "◫", label: "View Inventory", path: "/inventory" },
                  { icon: "◉", label: "Ask AI", path: "/chat" },
                  { icon: "⊕", label: "Upload New Data", path: "/?reupload=true" },
                  { icon: "↓", label: "Export Report", path: "/dashboard" },
                  { icon: "⊞", label: "Trend Analysis", path: "/dashboard" },
                  { icon: "✦", label: "Recommendations", path: "/inventory?scrollTo=recommendations" },
                ].map((a, i) => (
                  <button className="action-btn" key={i} onClick={() => navigate(a.path)}>
                    <span className="action-icon">{a.icon}</span>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </main>
      </div>
    </>
  );
}