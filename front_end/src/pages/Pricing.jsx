import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ENDPOINT = 8000;

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #0d0d0f; color: #f0ede8; min-height: 100vh; }

  .bg-grid {
    position: fixed; inset: 0;
    background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 60px 60px; pointer-events: none; z-index: 0;
  }
  .bg-glow  { position: fixed; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(99,75,255,0.12) 0%, transparent 70%); top: -100px; right: -100px; pointer-events: none; z-index: 0; }
  .bg-glow-2{ position: fixed; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, rgba(20,200,160,0.08) 0%, transparent 70%); bottom: -50px; left: -50px; pointer-events: none; z-index: 0; }

  .wrap { position: relative; z-index: 1; min-height: 100vh; display: flex; }

  .toggle-btn { position: fixed; top: 1.25rem; left: 1.25rem; z-index: 20; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: rgba(240,237,232,0.6); border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.9rem; transition: all 0.2s ease; }
  .toggle-btn:hover { background: rgba(255,255,255,0.1); color: #f0ede8; }

  .sidebar { width: 220px; min-height: 100vh; background: rgba(255,255,255,0.03); border-right: 1px solid rgba(255,255,255,0.07); padding: 2rem 1.25rem; display: flex; flex-direction: column; gap: 2.5rem; position: fixed; top: 0; left: 0; bottom: 0; z-index: 10; transition: transform 0.3s ease; }
  .sidebar.closed { transform: translateX(-220px); }
  .sidebar-logo { font-family: 'DM Serif Display', serif; font-size: 1.5rem; color: #f0ede8; }
  .sidebar-logo em { font-style: italic; color: rgba(160,155,255,0.9); }
  .sidebar-nav { display: flex; flex-direction: column; gap: 4px; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; font-size: 0.85rem; color: rgba(240,237,232,0.45); cursor: pointer; transition: all 0.2s ease; border: none; background: none; width: 100%; text-align: left; font-family: 'DM Sans', sans-serif; }
  .nav-item:hover { background: rgba(255,255,255,0.05); color: rgba(240,237,232,0.8); }
  .nav-item.active { background: rgba(160,155,255,0.12); color: rgba(160,155,255,0.95); border: 1px solid rgba(160,155,255,0.2); }
  .nav-icon { font-size: 1rem; }
  .sidebar-footer { margin-top: auto; font-size: 0.7rem; color: rgba(240,237,232,0.2); letter-spacing: 0.05em; }

  .main { flex: 1; padding: 2.5rem; margin-left: 220px; transition: margin-left 0.3s ease; animation: fadeUp 0.6s ease both; }
  .main.collapsed { margin-left: 0; padding-left: 4rem; }

  .page-header { margin-bottom: 2rem; }
  .page-title { font-family: 'DM Serif Display', serif; font-size: 2rem; color: #f0ede8; margin-bottom: 0.25rem; }
  .page-subtitle { font-size: 0.85rem; color: rgba(240,237,232,0.35); font-weight: 300; }
  .section-label { font-size: 0.68rem; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(240,237,232,0.2); margin-bottom: 1rem; }

  /* Loading skeletons */
  .skeleton-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .skeleton-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 1.4rem 1.25rem; height: 140px; animation: shimmer 1.6s ease infinite; }
  @keyframes shimmer { 0%,100% { opacity: 0.3; } 50% { opacity: 0.7; } }

  /* Error */
  .fetch-error { font-size: 0.82rem; color: rgba(255,100,100,0.75); background: rgba(255,100,100,0.06); border: 1px solid rgba(255,100,100,0.15); border-radius: 10px; padding: 1rem 1.25rem; }

  /* Product grid */
  .products-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }

  .product-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 1.25rem;
    cursor: pointer;
    transition: border-color 0.2s ease, background 0.2s ease, transform 0.15s ease;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .product-card:hover { border-color: rgba(160,155,255,0.3); background: rgba(160,155,255,0.04); transform: translateY(-2px); }
  .product-card:hover .click-hint { opacity: 1; }
  .product-card.low-stock { border-color: rgba(255,160,50,0.2); }
  .product-card.low-stock:hover { border-color: rgba(255,160,50,0.4); }

  .product-header { display: flex; justify-content: space-between; align-items: flex-start; }
  .product-name { font-size: 0.9rem; font-weight: 500; color: #f0ede8; line-height: 1.35; }
  .product-cat  { font-size: 0.68rem; color: rgba(240,237,232,0.3); margin-top: 3px; letter-spacing: 0.04em; }
  .product-price { font-family: 'DM Serif Display', serif; font-size: 1.4rem; color: #f0ede8; text-align: right; }
  .product-price-label { font-size: 0.62rem; color: rgba(240,237,232,0.22); text-align: right; font-family: 'DM Sans', sans-serif; margin-top: 2px; }

  /* Stats row */
  .stats-row { display: flex; gap: 8px; flex-wrap: wrap; }
  .stat-pill {
    display: flex; align-items: center; gap: 4px;
    font-size: 0.68rem;
    padding: 3px 9px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.03);
    color: rgba(240,237,232,0.45);
    white-space: nowrap;
  }
  .stat-pill.margin    { color: rgba(20,200,160,0.85);  border-color: rgba(20,200,160,0.18);  background: rgba(20,200,160,0.06); }
  .stat-pill.stock-ok  { color: rgba(240,237,232,0.35); }
  .stat-pill.stock-low { color: rgba(255,160,50,0.85);  border-color: rgba(255,160,50,0.2);   background: rgba(255,160,50,0.06); }
  .stat-pill.profit    { color: rgba(160,155,255,0.85); border-color: rgba(160,155,255,0.18); background: rgba(160,155,255,0.06); }

  .analyse-btn {
    margin-top: 0.1rem;
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 0.72rem; color: rgba(160,155,255,0.65);
    font-family: 'DM Sans', sans-serif;
    border: 1px solid rgba(160,155,255,0.15);
    background: rgba(160,155,255,0.07);
    border-radius: 999px;
    padding: 4px 12px;
    width: fit-content;
    transition: all 0.2s ease;
  }
  .product-card:hover .analyse-btn { color: rgba(160,155,255,0.9); border-color: rgba(160,155,255,0.35); background: rgba(160,155,255,0.12); }

  .click-hint { position: absolute; bottom: 12px; right: 14px; font-size: 0.65rem; color: rgba(160,155,255,0.5); opacity: 0; transition: opacity 0.2s ease; }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
`;

const NAV_ITEMS = [
  { icon: "⊞", label: "Dashboard",   path: "/dashboard" },
  { icon: "◫", label: "Insights",    path: "/insights"  },
  { icon: "⊜", label: "Pricing",     path: "/pricing"   },
  { icon: "◉", label: "Chat",        path: "/chat"      },
  { icon: "⊕", label: "Upload Data", path: "/?reupload=true" },
];

export default function Pricing() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [products, setProducts]       = useState([]);
  const [fetchState, setFetchState]   = useState("loading"); // loading | done | error
  const [errorMsg, setErrorMsg]       = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`http://localhost:${ENDPOINT}/products`);
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const data = await res.json();
        setProducts(data.products || []);
        setFetchState("done");
      } catch (err) {
        setErrorMsg(err.message || "Failed to load products.");
        setFetchState("error");
      }
    };
    load();
  }, []);

  const handleCardClick = (product) => {
    navigate(`/pricing/${encodeURIComponent(product.name)}`, { state: { product } });
  };

  return (
    <>
      <style>{styles}</style>
      <div className="bg-grid" />
      <div className="bg-glow" />
      <div className="bg-glow-2" />

      <div className="wrap">
        <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? "<" : ">"}
        </button>

        <aside className={`sidebar ${sidebarOpen ? "" : "closed"}`}>
          <div className="sidebar-logo">Lo<em>Co</em>AI</div>
          <nav className="sidebar-nav">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                className={`nav-item ${item.path === "/pricing" ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                <span className="nav-icon">{item.icon}</span> {item.label}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">LoCorAI · SME Edition</div>
        </aside>

        <main className={`main ${sidebarOpen ? "" : "collapsed"}`}>
          <div className="page-header">
            <h1 className="page-title">Pricing</h1>
            <p className="page-subtitle">
              Select a product to run an AI-powered competitive pricing analysis.
            </p>
          </div>

          <div className="section-label">
            {fetchState === "done" ? `${products.length} Products` : "All Products"}
          </div>

          {/* Loading skeletons */}
          {fetchState === "loading" && (
            <div className="skeleton-grid">
              {[...Array(6)].map((_, i) => <div key={i} className="skeleton-card" />)}
            </div>
          )}

          {/* Error */}
          {fetchState === "error" && (
            <div className="fetch-error">⚠ {errorMsg}</div>
          )}

          {/* Products */}
          {fetchState === "done" && (
            <div className="products-grid">
              {products.map((p, i) => (
                <div
                  key={i}
                  className={`product-card ${p.stock_status === "low" ? "low-stock" : ""}`}
                  onClick={() => handleCardClick(p)}
                >
                  <div className="product-header">
                    <div>
                      <div className="product-name">{p.name}</div>
                      <div className="product-cat">{p.category}</div>
                    </div>
                    <div>
                      <div className="product-price">RM {p.unit_price.toFixed(2)}</div>
                      <div className="product-price-label">selling price</div>
                    </div>
                  </div>

                  <div className="stats-row">
                    <span className="stat-pill margin">↑ {p.margin_pct}% margin</span>
                    <span className="stat-pill profit">+RM {p.profit_per_unit.toFixed(2)} / unit</span>
                    <span className={`stat-pill ${p.stock_status === "low" ? "stock-low" : "stock-ok"}`}>
                      {p.stock_status === "low" ? "⚠ " : ""}{p.stock} in stock
                    </span>
                  </div>

                  <div className="analyse-btn">✦ Analyse pricing →</div>
                  <span className="click-hint">Click to analyse →</span>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}