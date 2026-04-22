import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../shared.css";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <>
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
            <button className="nav-item active" onClick={() => navigate("/dashboard")}><span className="nav-icon">⊞</span> Dashboard</button>
            <button className="nav-item" onClick={() => navigate("/inventory")}><span className="nav-icon">◫</span> Inventory</button>
            <button className="nav-item" onClick={() => navigate("/chat")}><span className="nav-icon">◉</span> Chat</button>
            <button className="nav-item" onClick={() => navigate("/?reupload=true")}><span className="nav-icon">⊕</span> Upload Data</button>
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
                <span>Product</span><span>Stock</span><span>Status</span>
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