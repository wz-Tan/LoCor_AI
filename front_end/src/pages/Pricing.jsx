import { useState } from "react";
import { useNavigate } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #0d0d0f; color: #f0ede8; min-height: 100vh; }

  .bg-grid {
    position: fixed; inset: 0;
    background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 60px 60px; pointer-events: none; z-index: 0;
  }
  .bg-glow { position: fixed; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(99,75,255,0.12) 0%, transparent 70%); top: -100px; right: -100px; pointer-events: none; z-index: 0; }
  .bg-glow-2 { position: fixed; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, rgba(20,200,160,0.08) 0%, transparent 70%); bottom: -50px; left: -50px; pointer-events: none; z-index: 0; }

  .wrap { position: relative; z-index: 1; min-height: 100vh; display: flex; }

  /* Sidebar Styling synced with Insights.js */
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

  .products-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .product-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 1.25rem; cursor: pointer; transition: border-color 0.2s ease, background 0.2s ease, transform 0.15s ease; position: relative; overflow: hidden; }
  .product-card:hover { border-color: rgba(160,155,255,0.3); background: rgba(160,155,255,0.04); transform: translateY(-2px); }
  .product-card:hover .click-hint { opacity: 1; }

  .product-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
  .product-name { font-size: 0.9rem; font-weight: 500; color: #f0ede8; }
  .product-cat { font-size: 0.7rem; color: rgba(240,237,232,0.3); margin-top: 3px; }
  .product-price { font-family: 'DM Serif Display', serif; font-size: 1.4rem; color: #f0ede8; text-align: right; }
  .product-price-label { font-size: 0.65rem; color: rgba(240,237,232,0.25); text-align: right; font-family: 'DM Sans', sans-serif; margin-top: 2px; }

  .price-position { display: flex; align-items: center; gap: 6px; margin-top: 0.75rem; }
  .position-bar-bg { flex: 1; height: 4px; background: rgba(255,255,255,0.07); border-radius: 999px; position: relative; }
  .position-marker { position: absolute; top: 50%; transform: translate(-50%, -50%); width: 10px; height: 10px; border-radius: 50%; border: 2px solid #0d0d0f; }
  .position-label { font-size: 0.68rem; color: rgba(240,237,232,0.3); white-space: nowrap; }

  .price-tag { font-size: 0.68rem; padding: 3px 8px; border-radius: 999px; font-weight: 500; margin-top: 0.75rem; display: inline-block; }
  .price-tag.cheaper { background: rgba(20,200,160,0.1); color: rgba(20,200,160,0.9); border: 1px solid rgba(20,200,160,0.2); }
  .price-tag.pricier { background: rgba(255,100,100,0.1); color: rgba(255,100,100,0.9); border: 1px solid rgba(255,100,100,0.2); }
  .price-tag.inline { background: rgba(160,155,255,0.1); color: rgba(160,155,255,0.9); border: 1px solid rgba(160,155,255,0.2); }

  .click-hint { position: absolute; bottom: 12px; right: 14px; font-size: 0.65rem; color: rgba(160,155,255,0.5); opacity: 0; transition: opacity 0.2s ease; }

  /* Modal Styles */
  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(6px); z-index: 100; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s ease; }
  .modal { background: #13131a; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 2rem; width: 520px; max-width: 90vw; position: relative; animation: slideUp 0.25s ease; }
  .modal-close { position: absolute; top: 1rem; right: 1rem; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: rgba(240,237,232,0.5); border-radius: 8px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.8rem; transition: all 0.2s ease; }
  .modal-close:hover { background: rgba(255,255,255,0.1); color: #f0ede8; }
  .modal-title { font-family: 'DM Serif Display', serif; font-size: 1.4rem; color: #f0ede8; margin-bottom: 0.25rem; }
  .modal-cat { font-size: 0.75rem; color: rgba(240,237,232,0.3); margin-bottom: 1.5rem; }
  .modal-your-price { display: flex; justify-content: space-between; align-items: center; background: rgba(160,155,255,0.07); border: 1px solid rgba(160,155,255,0.18); border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: 1.25rem; }
  .modal-your-label { font-size: 0.75rem; color: rgba(160,155,255,0.7); margin-bottom: 4px; }
  .modal-your-value { font-family: 'DM Serif Display', serif; font-size: 1.6rem; color: #f0ede8; }
  .modal-section-label { font-size: 0.65rem; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(240,237,232,0.2); margin-bottom: 0.75rem; }
  .competitor-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
  .competitor-row:last-child { border-bottom: none; }
  .comp-name { flex: 1; font-size: 0.82rem; color: rgba(240,237,232,0.65); }
  .comp-price { font-size: 0.88rem; font-weight: 500; color: #f0ede8; min-width: 70px; text-align: right; }
  .comp-diff { font-size: 0.72rem; padding: 2px 8px; border-radius: 999px; min-width: 64px; text-align: center; }
  .comp-diff.cheaper { background: rgba(255,100,100,0.1); color: rgba(255,100,100,0.9); border: 1px solid rgba(255,100,100,0.2); }
  .comp-diff.pricier { background: rgba(20,200,160,0.1); color: rgba(20,200,160,0.9); border: 1px solid rgba(20,200,160,0.2); }
  .comp-diff.same { background: rgba(160,155,255,0.1); color: rgba(160,155,255,0.9); border: 1px solid rgba(160,155,255,0.2); }
  .modal-suggestion { margin-top: 1.25rem; background: rgba(255,180,50,0.05); border: 1px solid rgba(255,180,50,0.15); border-radius: 12px; padding: 0.9rem 1rem; font-size: 0.78rem; color: rgba(255,180,50,0.85); line-height: 1.6; }
  .modal-suggestion span { font-weight: 500; }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
`;

const PRODUCTS = [
  {
    id: 1,
    name: "Wireless Earbuds Pro",
    cat: "Electronics",
    price: 189,
    position: "inline",
    competitors: [
      { name: "Shopee Top Seller", price: 175 },
      { name: "Lazada Official Store", price: 199 },
      { name: "Competitor Brand X", price: 165 },
    ],
    suggestion:
      "You're priced between competitors. Consider a small reduction to RM 179 to undercut Lazada and drive volume.",
  },
  {
    id: 2,
    name: "USB-C Hub 7-in-1",
    cat: "Electronics",
    price: 79,
    position: "cheaper",
    competitors: [
      { name: "Shopee Top Seller", price: 95 },
      { name: "Lazada Official Store", price: 89 },
      { name: "Competitor Brand Y", price: 105 },
    ],
    suggestion:
      "Your price is already the lowest. Hold pricing — there's room to raise by 5–8% without losing competitive edge.",
  },
  {
    id: 3,
    name: "Mechanical Keyboard TKL",
    cat: "Peripherals",
    price: 320,
    position: "pricier",
    competitors: [
      { name: "Shopee Top Seller", price: 269 },
      { name: "Lazada Official Store", price: 299 },
      { name: "Competitor Brand Z", price: 285 },
    ],
    suggestion:
      "You're the most expensive in this segment. Consider a discount to RM 299 or bundle with a mouse pad to justify the premium.",
  },
  {
    id: 4,
    name: "Ergonomic Mouse",
    cat: "Peripherals",
    price: 145,
    position: "inline",
    competitors: [
      { name: "Shopee Top Seller", price: 138 },
      { name: "Lazada Official Store", price: 152 },
      { name: "Competitor Brand X", price: 140 },
    ],
    suggestion:
      "Pricing is competitive. Hold steady and monitor — if stock runs low, a slight increase to RM 155 is defensible.",
  },
  {
    id: 5,
    name: "Monitor Stand Deluxe",
    cat: "Accessories",
    price: 55,
    position: "cheaper",
    competitors: [
      { name: "Shopee Top Seller", price: 68 },
      { name: "Lazada Official Store", price: 72 },
      { name: "Competitor Brand Y", price: 60 },
    ],
    suggestion:
      "Strong price advantage. You can raise to RM 62–65 and still remain the lowest — reclaim that margin.",
  },
  {
    id: 6,
    name: "LED Desk Lamp",
    cat: "Accessories",
    price: 99,
    position: "pricier",
    competitors: [
      { name: "Shopee Top Seller", price: 79 },
      { name: "Lazada Official Store", price: 85 },
      { name: "Competitor Brand Z", price: 75 },
    ],
    suggestion:
      "You're priced above the market. Either reduce to RM 85 to match Lazada, or highlight a differentiator (e.g. warranty, lumens) in your listing.",
  },
];

const NAV_ITEMS = [
  { icon: "⊞", label: "Dashboard", path: "/dashboard" },
  { icon: "◫", label: "Insights", path: "/insights" },
  { icon: "⊜", label: "Pricing", path: "/pricing" },
  { icon: "◉", label: "Chat", path: "/chat" },
  { icon: "⊕", label: "Upload Data", path: "/?reupload=true" },
];

function positionTag(pos) {
  if (pos === "cheaper") return { cls: "cheaper", label: "↓ Below Market" };
  if (pos === "pricier") return { cls: "pricier", label: "↑ Above Market" };
  return { cls: "inline", label: "→ Inline" };
}

function markerColor(pos) {
  if (pos === "cheaper") return "rgba(20,200,160,0.9)";
  if (pos === "pricier") return "rgba(255,100,100,0.9)";
  return "rgba(160,155,255,0.9)";
}

function markerLeft(pos) {
  if (pos === "cheaper") return "15%";
  if (pos === "pricier") return "85%";
  return "50%";
}

function diffLabel(myPrice, compPrice) {
  const diff = (((myPrice - compPrice) / compPrice) * 100).toFixed(0);
  if (Math.abs(diff) <= 2) return { cls: "same", label: "≈ Same" };
  if (diff > 0) return { cls: "cheaper", label: `+${diff}% higher` };
  return { cls: "pricier", label: `${diff}% lower` };
}

export default function Pricing() {
  const [selected, setSelected] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

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
              Click any product to compare your price against competitors.
            </p>
          </div>

          <div className="section-label">All Products</div>
          <div className="products-grid">
            {PRODUCTS.map((p) => {
              const tag = positionTag(p.position);
              return (
                <div
                  key={p.id}
                  className="product-card"
                  onClick={() => setSelected(p)}
                >
                  <div className="product-header">
                    <div>
                      <div className="product-name">{p.name}</div>
                      <div className="product-cat">{p.cat}</div>
                    </div>
                    <div>
                      <div className="product-price">RM {p.price}</div>
                      <div className="product-price-label">your price</div>
                    </div>
                  </div>

                  <div className="price-position">
                    <span
                      className="position-label"
                      style={{
                        fontSize: "0.65rem",
                        color: "rgba(240,237,232,0.2)",
                      }}
                    >
                      low
                    </span>
                    <div className="position-bar-bg">
                      <div
                        className="position-marker"
                        style={{
                          left: markerLeft(p.position),
                          background: markerColor(p.position),
                        }}
                      />
                    </div>
                    <span
                      className="position-label"
                      style={{
                        fontSize: "0.65rem",
                        color: "rgba(240,237,232,0.2)",
                      }}
                    >
                      high
                    </span>
                  </div>

                  <div className={`price-tag ${tag.cls}`}>{tag.label}</div>
                  <span className="click-hint">View comparison →</span>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* Modal remains same but use positionTag helper consistently */}
      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>
              ✕
            </button>

            <div className="modal-title">{selected.name}</div>
            <div className="modal-cat">{selected.cat}</div>

            <div className="modal-your-price">
              <div>
                <div className="modal-your-label">Your Price</div>
                <div className="modal-your-value">RM {selected.price}</div>
              </div>
              <div
                className={`price-tag ${positionTag(selected.position).cls}`}
                style={{ margin: 0 }}
              >
                {positionTag(selected.position).label}
              </div>
            </div>

            <div className="modal-section-label">Competitor Prices</div>
            <div>
              {selected.competitors.map((c, i) => {
                const d = diffLabel(selected.price, c.price);
                return (
                  <div key={i} className="competitor-row">
                    <div className="comp-name">{c.name}</div>
                    <div className="comp-price">RM {c.price}</div>
                    <div className={`comp-diff ${d.cls}`}>{d.label}</div>
                  </div>
                );
              })}
            </div>

            <div className="modal-suggestion">
              <span>💡 Suggestion: </span>
              {selected.suggestion}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
