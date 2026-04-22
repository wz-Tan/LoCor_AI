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
    position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none; z-index: 0;
  }

  .bg-glow {
    position: fixed; width: 600px; height: 600px; border-radius: 50%;
    background: radial-gradient(circle, rgba(99,75,255,0.12) 0%, transparent 70%);
    top: -100px; right: -100px; pointer-events: none; z-index: 0;
  }

  .bg-glow-2 {
    position: fixed; width: 400px; height: 400px; border-radius: 50%;
    background: radial-gradient(circle, rgba(20,200,160,0.08) 0%, transparent 70%);
    bottom: -50px; left: -50px; pointer-events: none; z-index: 0;
  }

  .wrap { position: relative; z-index: 1; min-height: 100vh; display: flex; }

  .toggle-btn {
    position: fixed; top: 1.25rem; left: 1.25rem; z-index: 20;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
    color: rgba(240,237,232,0.6); border-radius: 8px; width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 0.9rem; transition: all 0.2s ease;
  }
  .toggle-btn:hover { background: rgba(255,255,255,0.1); color: #f0ede8; }

  .sidebar {
    width: 220px; min-height: 100vh;
    background: rgba(255,255,255,0.03); border-right: 1px solid rgba(255,255,255,0.07);
    padding: 2rem 1.25rem; display: flex; flex-direction: column; gap: 2.5rem;
    position: fixed; top: 0; left: 0; bottom: 0; z-index: 10;
    transition: transform 0.3s ease;
  }
  .sidebar.closed { transform: translateX(-220px); }
  .sidebar-logo { font-family: 'DM Serif Display', serif; font-size: 1.5rem; color: #f0ede8; }
  .sidebar-logo em { font-style: italic; color: rgba(160,155,255,0.9); }
  .sidebar-nav { display: flex; flex-direction: column; gap: 4px; }

  .nav-item {
    display: flex; align-items: center; gap: 10px; padding: 10px 14px;
    border-radius: 10px; font-size: 0.85rem; color: rgba(240,237,232,0.45);
    cursor: pointer; transition: all 0.2s ease; border: none; background: none;
    width: 100%; text-align: left; font-family: 'DM Sans', sans-serif;
  }
  .nav-item:hover { background: rgba(255,255,255,0.05); color: rgba(240,237,232,0.8); }
  .nav-item.active { background: rgba(160,155,255,0.12); color: rgba(160,155,255,0.95); border: 1px solid rgba(160,155,255,0.2); }
  .nav-icon { font-size: 1rem; }
  .sidebar-footer { margin-top: auto; font-size: 0.7rem; color: rgba(240,237,232,0.2); letter-spacing: 0.05em; }

  .main {
    flex: 1; padding: 2.5rem; margin-left: 220px;
    transition: margin-left 0.3s ease; animation: fadeUp 0.6s ease both;
  }
  .main.collapsed { margin-left: 0; padding-left: 4rem; }

  .page-header { margin-bottom: 2rem; }
  .page-title { font-family: 'DM Serif Display', serif; font-size: 2rem; color: #f0ede8; margin-bottom: 0.25rem; }
  .page-subtitle { font-size: 0.85rem; color: rgba(240,237,232,0.35); font-weight: 300; }

  .section-label {
    font-size: 0.68rem; letter-spacing: 0.15em; text-transform: uppercase;
    color: rgba(240,237,232,0.2); margin-bottom: 1rem;
  }

  /* ── Trends ── */
  .trends-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 2rem; }

  .trend-card {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px; padding: 1.25rem; transition: border-color 0.2s ease;
  }
  .trend-card:hover { border-color: rgba(255,255,255,0.12); }
  .trend-card.up { border-left: 2px solid rgba(20,200,160,0.5); }
  .trend-card.down { border-left: 2px solid rgba(255,100,100,0.5); }
  .trend-card.neutral { border-left: 2px solid rgba(160,155,255,0.5); }

  .trend-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
  .trend-name { font-size: 0.88rem; font-weight: 500; color: #f0ede8; }

  .trend-badge {
    font-size: 0.65rem; padding: 3px 8px; border-radius: 999px; font-weight: 500;
  }
  .trend-badge.up { background: rgba(20,200,160,0.1); color: rgba(20,200,160,0.9); border: 1px solid rgba(20,200,160,0.2); }
  .trend-badge.down { background: rgba(255,100,100,0.1); color: rgba(255,100,100,0.9); border: 1px solid rgba(255,100,100,0.2); }
  .trend-badge.neutral { background: rgba(160,155,255,0.1); color: rgba(160,155,255,0.9); border: 1px solid rgba(160,155,255,0.2); }

  .trend-desc { font-size: 0.78rem; color: rgba(240,237,232,0.4); line-height: 1.6; margin-bottom: 0.75rem; }

  .competitor-tag {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 0.68rem; padding: 3px 10px; border-radius: 999px;
    background: rgba(255,180,50,0.08); border: 1px solid rgba(255,180,50,0.2);
    color: rgba(255,180,50,0.8);
  }

  /* ── Insights ── */
  .insights-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 2rem; }

  .insight-card {
    background: rgba(160,155,255,0.05); border: 1px solid rgba(160,155,255,0.12);
    border-radius: 16px; padding: 1.25rem;
  }

  .insight-icon { font-size: 1.25rem; margin-bottom: 0.75rem; }
  .insight-title { font-size: 0.88rem; font-weight: 500; color: #f0ede8; margin-bottom: 0.5rem; }
  .insight-body { font-size: 0.78rem; color: rgba(240,237,232,0.45); line-height: 1.7; }

  .insight-direction {
    margin-top: 0.75rem; font-size: 0.75rem; font-weight: 500;
    display: flex; align-items: center; gap: 6px;
  }
  .insight-direction.buy { color: rgba(20,200,160,0.9); }
  .insight-direction.reduce { color: rgba(255,100,100,0.9); }
  .insight-direction.hold { color: rgba(160,155,255,0.9); }
  .insight-direction.watch { color: rgba(255,180,50,0.9); }

  /* ── Inventory Count ── */
  .inv-table-wrap {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 18px; overflow: hidden; margin-bottom: 1.5rem;
  }

  .inv-table-header {
    display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1.2fr;
    padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);
    font-size: 0.68rem; letter-spacing: 0.1em; text-transform: uppercase;
    color: rgba(240,237,232,0.2);
  }

  .inv-table-row {
    display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1.2fr;
    padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.04);
    align-items: center; transition: background 0.15s ease;
  }
  .inv-table-row:last-child { border-bottom: none; }
  .inv-table-row:hover { background: rgba(255,255,255,0.02); }
  .inv-table-row.critical { border-left: 2px solid rgba(255,100,100,0.4); background: rgba(255,100,100,0.03); }

  .inv-name { font-size: 0.85rem; color: #f0ede8; font-weight: 500; }
  .inv-cat { font-size: 0.7rem; color: rgba(240,237,232,0.3); margin-top: 2px; }
  .inv-cell { font-size: 0.82rem; color: rgba(240,237,232,0.55); }

  .stock-bar-wrap { display: flex; align-items: center; gap: 8px; }
  .stock-bar-bg { flex: 1; height: 4px; background: rgba(255,255,255,0.07); border-radius: 999px; }
  .stock-bar-fill { height: 4px; border-radius: 999px; }

  .status-dot {
    width: 7px; height: 7px; border-radius: 50%; display: inline-block; margin-right: 6px;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.7); }
  }
`;

const TRENDS = [
  {
    name: "Power Tools",
    dir: "up",
    label: "↑ Trending",
    desc: "Demand spiked 34% this month driven by Raya renovation season. Expected to stay elevated through Q3.",
    competitor: "BuildMart cut drill prices by 12%",
  },
  {
    name: "Wall Paint",
    dir: "up",
    label: "↑ Trending",
    desc: "Paint categories seeing strong movement. Renovation momentum is pulling paint sales up across the board.",
    competitor: null,
  },
  {
    name: "Sand Paper",
    dir: "down",
    label: "↓ Slowing",
    desc: "Finishing products declining as buyers shift focus to larger renovation items. Demand softening week-on-week.",
    competitor: "HomeDepot running 20% sale on finishing goods",
  },
  {
    name: "Electrical",
    dir: "neutral",
    label: "→ Stable",
    desc: "Cable and wiring products holding steady. No significant shift in demand expected in the near term.",
    competitor: null,
  },
  {
    name: "Plumbing",
    dir: "neutral",
    label: "→ Stable",
    desc: "PVC and plumbing supplies moving at a consistent rate. Seasonal impact minimal for this category.",
    competitor: null,
  },
  {
    name: "Hand Tools",
    dir: "up",
    label: "↑ Trending",
    desc: "Screwdrivers and hammers seeing a modest uptick tied to the broader renovation wave this quarter.",
    competitor: null,
  },
];

const INSIGHTS = [
  {
    icon: "🛒",
    title: "Double down on Power Tools",
    body: "The renovation season is your best window. Demand is up and your competitors are discounting — position yourself on availability, not just price. Being in stock when they run out is your edge.",
    dir: "buy",
    dirLabel: "→ Buy More",
  },
  {
    icon: "🎨",
    title: "Prioritise Paint restocking",
    body: "Wall paint moves fast during renovation cycles. Your current stock won't last the season. Getting ahead of this now avoids losing sales to competitors who are already stocked up.",
    dir: "buy",
    dirLabel: "→ Buy More",
  },
  {
    icon: "📦",
    title: "Clear finishing goods soon",
    body: "Sand paper and finishing products are slowing down. The longer you hold, the harder it gets to move. A modest discount now clears shelf space for faster-moving items.",
    dir: "reduce",
    dirLabel: "→ Reduce / Discount",
  },
  {
    icon: "⚡",
    title: "Watch the electrical category",
    body: "Cable wire is stable now but competitor pricing pressure is building. Keep an eye on your margins here — no action needed yet, but don't over-order.",
    dir: "watch",
    dirLabel: "→ Watch Closely",
  },
];

const INVENTORY = [
  {
    name: "Electric Drill",
    cat: "Power Tools",
    stock: 45,
    capacity: 100,
    value: "RM 8,505",
    status: "critical",
  },
  {
    name: "Wall Paint 5L",
    cat: "Paint",
    stock: 12,
    capacity: 100,
    value: "RM 780",
    status: "critical",
  },
  {
    name: "Screwdriver Set",
    cat: "Hand Tools",
    stock: 120,
    capacity: 150,
    value: "RM 4,200",
    status: "ok",
  },
  {
    name: "PVC Pipe 1in",
    cat: "Plumbing",
    stock: 200,
    capacity: 250,
    value: "RM 1,700",
    status: "ok",
  },
  {
    name: "Cable Wire 10m",
    cat: "Electrical",
    stock: 60,
    capacity: 80,
    value: "RM 1,320",
    status: "ok",
  },
  {
    name: "Sand Paper",
    cat: "Finishing",
    stock: 150,
    capacity: 150,
    value: "RM 525",
    status: "excess",
  },
  {
    name: "Hammer",
    cat: "Hand Tools",
    stock: 75,
    capacity: 100,
    value: "RM 1,875",
    status: "ok",
  },
];

function stockColor(status) {
  if (status === "critical") return "rgba(255,100,100,0.8)";
  if (status === "excess") return "rgba(255,180,50,0.8)";
  return "rgba(20,200,160,0.8)";
}

function stockLabel(status) {
  if (status === "critical")
    return {
      color: "rgba(255,100,100,0.9)",
      dot: "rgba(255,100,100,0.9)",
      text: "Critical",
    };
  if (status === "excess")
    return {
      color: "rgba(255,180,50,0.9)",
      dot: "rgba(255,180,50,0.9)",
      text: "Excess",
    };
  return {
    color: "rgba(20,200,160,0.9)",
    dot: "rgba(20,200,160,0.9)",
    text: "Healthy",
  };
}

export default function Insights() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <>
      <style>{styles}</style>
      <div className="bg-grid" />
      <div className="bg-glow" />
      <div className="bg-glow-2" />

      <div className="wrap">
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
            <button
              className="nav-item active"
              onClick={() => navigate("/insights")}
            >
              <span className="nav-icon">◈</span> Insights
            </button>
            <button className="nav-item" onClick={() => navigate("/chat")}>
              <span className="nav-icon">◉</span> Chat
            </button>
            <button
              className="nav-item"
              onClick={() => navigate("/?reupload=true")}
            >
              <span className="nav-icon">⊕</span> Upload Data
            </button>
          </nav>
          <div className="sidebar-footer">LoCoAI · SME Edition</div>
        </aside>

        <main className={`main ${sidebarOpen ? "" : "collapsed"}`}>
          <div className="page-header">
            <h1 className="page-title">Insights</h1>
            <p className="page-subtitle">
              Market trends, strategic direction, and a snapshot of your current
              stock.
            </p>
          </div>

          {/* ── Section 1: Trends ── */}
          <div className="section-label">
            Current Trends & Competitor Activity
          </div>
          <div className="trends-grid">
            {TRENDS.map((t, i) => (
              <div key={i} className={`trend-card ${t.dir}`}>
                <div className="trend-top">
                  <span className="trend-name">{t.name}</span>
                  <span className={`trend-badge ${t.dir}`}>{t.label}</span>
                </div>
                <div className="trend-desc">{t.desc}</div>
                {t.competitor && (
                  <div className="competitor-tag">⚠ {t.competitor}</div>
                )}
              </div>
            ))}
          </div>

          {/* ── Section 2: Insights ── */}
          <div className="section-label">Strategic Insights</div>
          <div className="insights-grid" style={{ marginBottom: "2rem" }}>
            {INSIGHTS.map((ins, i) => (
              <div key={i} className="insight-card">
                <div className="insight-icon">{ins.icon}</div>
                <div className="insight-title">{ins.title}</div>
                <div className="insight-body">{ins.body}</div>
                <div className={`insight-direction ${ins.dir}`}>
                  {ins.dirLabel}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate("/chat")}
            style={{
              marginBottom: "2rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "10px",
              border: "1px solid rgba(160,155,255,0.3)",
              background: "rgba(160,155,255,0.08)",
              color: "rgba(160,155,255,0.9)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.82rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Ask AI for deeper analysis →
          </button>

          {/* ── Section 3: Inventory Count ── */}
          <div className="section-label">Inventory Count</div>
          <div className="inv-table-wrap">
            <div className="inv-table-header">
              <span>Product</span>
              <span>Stock</span>
              <span>Fill Level</span>
              <span>Est. Value</span>
              <span>Status</span>
            </div>
            {INVENTORY.map((item, i) => {
              const pct = Math.round((item.stock / item.capacity) * 100);
              const s = stockLabel(item.status);
              return (
                <div
                  key={i}
                  className={`inv-table-row ${item.status === "critical" ? "critical" : ""}`}
                >
                  <div>
                    <div className="inv-name">{item.name}</div>
                    <div className="inv-cat">{item.cat}</div>
                  </div>
                  <div className="inv-cell">{item.stock} units</div>
                  <div>
                    <div className="stock-bar-wrap">
                      <div className="stock-bar-bg">
                        <div
                          className="stock-bar-fill"
                          style={{
                            width: `${pct}%`,
                            background: stockColor(item.status),
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          color: "rgba(240,237,232,0.3)",
                          minWidth: "32px",
                        }}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <div className="inv-cell">{item.value}</div>
                  <div style={{ fontSize: "0.78rem", color: s.color }}>
                    <span
                      className="status-dot"
                      style={{ background: s.dot }}
                    />
                    {s.text}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </>
  );
}
