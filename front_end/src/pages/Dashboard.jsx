import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboard } from "./api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #0d0d0f; color: #f0ede8; min-height: 100vh; }

  .bg-grid {
    position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 60px 60px; pointer-events: none; z-index: 0;
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

  .dash-wrap { position: relative; z-index: 1; min-height: 100vh; display: flex; }

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

  .main { flex: 1; padding: 2.5rem; animation: fadeUp 0.6s ease both; margin-left: 220px; transition: margin-left 0.3s ease; }
  .main.collapsed { margin-left: 0; padding-left: 4rem; }

  .page-header { margin-bottom: 2rem; display: flex; align-items: flex-end; justify-content: space-between; }
  .page-title { font-family: 'DM Serif Display', serif; font-size: 2rem; color: #f0ede8; margin-bottom: 0.25rem; }
  .page-subtitle { font-size: 0.85rem; color: rgba(240,237,232,0.35); font-weight: 300; }
  .last-updated { font-size: 0.7rem; color: rgba(240,237,232,0.2); }

  .section-label {
    font-size: 0.68rem; letter-spacing: 0.14em; text-transform: uppercase;
    color: rgba(240,237,232,0.2); margin-bottom: 0.75rem; margin-top: 1.75rem;
  }

  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
  .stat-card {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px; padding: 1.4rem 1.25rem; transition: border-color 0.2s;
  }
  .stat-card:hover { border-color: rgba(255,255,255,0.15); }
  .stat-label { font-size: 0.68rem; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(240,237,232,0.28); margin-bottom: 0.65rem; }
  .stat-value { font-family: 'DM Serif Display', serif; font-size: 1.9rem; color: #f0ede8; line-height: 1; margin-bottom: 0.45rem; }
  .stat-change { font-size: 0.72rem; font-weight: 300; }
  .stat-sub { font-size: 0.7rem; color: rgba(240,237,232,0.25); margin-top: 0.5rem; }
  .up { color: rgba(20,200,160,0.85); }
  .down { color: rgba(255,100,100,0.85); }
  .neutral { color: rgba(240,237,232,0.3); }

  .breakdown-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 14px; }
  .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 1.5rem; }
  .card-title { font-size: 0.68rem; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(240,237,232,0.28); margin-bottom: 1.25rem; }

  .sale-row { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
  .sale-row:last-child { border-bottom: none; }
  .sale-name { font-size: 0.8rem; color: rgba(240,237,232,0.7); flex: 1; }
  .sale-bar-wrap { flex: 2; height: 4px; background: rgba(255,255,255,0.06); border-radius: 99px; overflow: hidden; }
  .sale-bar { height: 100%; border-radius: 99px; background: rgba(160,155,255,0.5); }
  .sale-val { font-size: 0.75rem; color: rgba(240,237,232,0.45); min-width: 60px; text-align: right; }
  .sale-change { font-size: 0.7rem; min-width: 48px; text-align: right; }

  .top-item { display: flex; align-items: center; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
  .top-item:last-child { border-bottom: none; }
  .top-rank { font-size: 0.7rem; color: rgba(240,237,232,0.2); width: 18px; }
  .top-name { font-size: 0.8rem; color: rgba(240,237,232,0.7); flex: 1; }
  .top-units { font-size: 0.75rem; color: rgba(240,237,232,0.35); }
  .top-rev { font-size: 0.78rem; color: rgba(240,237,232,0.6); font-family: 'DM Serif Display', serif; }

  .trends-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .trend-card {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px; padding: 1.25rem; transition: border-color 0.2s;
  }
  .trend-card:hover { border-color: rgba(255,255,255,0.14); }
  .trend-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.65rem; }
  .trend-name { font-size: 0.83rem; font-weight: 500; color: rgba(240,237,232,0.85); }
  .trend-pill { font-size: 0.65rem; padding: 2px 8px; border-radius: 999px; font-weight: 500; }
  .trend-pill.up     { background: rgba(20,200,160,0.1);   color: rgba(20,200,160,0.9);   border: 1px solid rgba(20,200,160,0.2); }
  .trend-pill.down   { background: rgba(255,100,100,0.1);  color: rgba(255,100,100,0.85); border: 1px solid rgba(255,100,100,0.2); }
  .trend-pill.neutral{ background: rgba(240,237,232,0.05); color: rgba(240,237,232,0.4);  border: 1px solid rgba(240,237,232,0.1); }
  .trend-desc { font-size: 0.77rem; color: rgba(240,237,232,0.45); line-height: 1.6; margin-bottom: 0.8rem; }
  .competitor-box {
    font-size: 0.72rem; color: rgba(160,155,255,0.75);
    background: rgba(160,155,255,0.06); border: 1px solid rgba(160,155,255,0.12);
    border-radius: 8px; padding: 7px 10px; line-height: 1.5;
  }
  .competitor-label { font-size: 0.62rem; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(160,155,255,0.4); margin-bottom: 2px; }
  .price-box {
    font-size: 0.72rem; margin-top: 8px;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px; padding: 7px 10px; line-height: 1.5;
  }
  .price-label { font-size: 0.62rem; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(240,237,232,0.2); margin-bottom: 2px; }
  .price-box.up   { border-color: rgba(20,200,160,0.2);  color: rgba(20,200,160,0.85); }
  .price-box.down { border-color: rgba(255,100,100,0.2); color: rgba(255,100,100,0.8); }
  .price-box.hold { border-color: rgba(255,180,50,0.2);  color: rgba(255,180,50,0.8); }

  .empty-state { font-size: 0.8rem; color: rgba(240,237,232,0.2); text-align: center; padding: 2rem 0; }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
`;

const NAV_ITEMS = [
  { icon: "⊞", label: "Dashboard", path: "/dashboard" },
  { icon: "◫", label: "Insights", path: "/insights" },
  { icon: "◉", label: "Chat", path: "/chat" },
  { icon: "⊕", label: "Upload Data", path: "/?reupload=true" },
];

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function StatCard({ label, value, change, dir, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className={`stat-change ${dir}`}>{change}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

function SaleRow({ name, value, change, dir, pct, maxPct }) {
  return (
    <div className="sale-row">
      <span className="sale-name">{name}</span>
      <div className="sale-bar-wrap">
        <div
          className="sale-bar"
          style={{ width: `${(pct / maxPct) * 100}%` }}
        />
      </div>
      <span className="sale-val">{value}</span>
      <span className={`sale-change ${dir}`}>{change}</span>
    </div>
  );
}

function TopProductRow({ rank, name, units, revenue }) {
  return (
    <div className="top-item">
      <span className="top-rank">#{rank}</span>
      <span className="top-name">{name}</span>
      <span className="top-units">{units} units</span>
      <span className="top-rev">{revenue}</span>
    </div>
  );
}

function TrendCard({
  name,
  dir,
  label,
  desc,
  competitor,
  priceAction,
  priceSuggestion,
}) {
  const priceIcon =
    priceAction === "up" ? "↑" : priceAction === "down" ? "↓" : "→";
  return (
    <div className="trend-card">
      <div className="trend-top">
        <span className="trend-name">{name}</span>
        <span className={`trend-pill ${dir}`}>{label}</span>
      </div>
      <p className="trend-desc">{desc}</p>
      {competitor && (
        <div className="competitor-box">
          <div className="competitor-label">Competitor</div>
          {competitor}
        </div>
      )}
      {priceSuggestion && (
        <div className={`price-box ${priceAction}`}>
          <div className="price-label">Price Signal {priceIcon}</div>
          {priceSuggestion}
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard().then((data) => {
      setDashboardData(data);
      setLoading(false);
    });
  }, []);

  const {
    greeting = "Good morning 👋",
    subtitle = "Here's your business health check for today.",
    lastUpdated = "",
    stats = [],
    salesByCategory = [],
    topProducts = [],
    trends = [],
  } = dashboardData ?? {};

  const maxPct = salesByCategory.length
    ? Math.max(...salesByCategory.map((s) => s.pct))
    : 100;

  return (
    <>
      <style>{styles}</style>
      <div className="bg-grid" />
      <div className="bg-glow" />
      <div className="bg-glow-2" />

      <div className="dash-wrap">
        <button
          className="toggle-btn"
          onClick={() => setSidebarOpen((o) => !o)}
        >
          {sidebarOpen ? "<" : ">"}
        </button>

        <aside className={`sidebar ${sidebarOpen ? "" : "closed"}`}>
          <div className="sidebar-logo">
            Lo<em>Co</em>AI
          </div>
          <nav className="sidebar-nav">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.path}
                className={`nav-item ${item.path === "/dashboard" ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                <span className="nav-icon">{item.icon}</span> {item.label}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">LoCorAI · SME Edition</div>
        </aside>

        <main className={`main ${sidebarOpen ? "" : "collapsed"}`}>
          {loading ? (
            <p className="empty-state" style={{ marginTop: "4rem" }}>
              Loading dashboard...
            </p>
          ) : (
            <>
              {/* ── HEADER ── */}
              <div className="page-header">
                <div>
                  <h1 className="page-title">{greeting}</h1>
                  <p className="page-subtitle">{subtitle}</p>
                </div>
                {lastUpdated && (
                  <span className="last-updated">{lastUpdated}</span>
                )}
              </div>

              {/* ── STATS ── */}
              <div className="section-label" style={{ marginTop: 0 }}>
                Performance
              </div>
              <div className="stats-grid">
                {stats.length > 0 ? (
                  stats.map((s, i) => <StatCard key={i} {...s} />)
                ) : (
                  <p className="empty-state">Revenue data not yet connected.</p>
                )}
              </div>

              {/* ── SALES BREAKDOWN + TOP PRODUCTS ── */}
              {(salesByCategory.length > 0 || topProducts.length > 0) && (
                <div className="breakdown-row">
                  {salesByCategory.length > 0 && (
                    <div className="card">
                      <div className="card-title">Sales by Category</div>
                      {salesByCategory.map((s, i) => (
                        <SaleRow key={i} {...s} maxPct={maxPct} />
                      ))}
                    </div>
                  )}
                  {topProducts.length > 0 && (
                    <div className="card">
                      <div className="card-title">Top Products</div>
                      {topProducts.map((p, i) => (
                        <TopProductRow key={i} rank={i + 1} {...p} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── MARKET TRENDS + COMPETITOR INTEL ── */}
              <div className="section-label">
                Market Trends & Competitor Intel
              </div>
              <div className="trends-grid">
                {trends.length > 0 ? (
                  trends.map((t, i) => <TrendCard key={i} {...t} />)
                ) : (
                  <p className="empty-state">No trend data available.</p>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
