import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

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
  .bg-glow { position: fixed; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(99,75,255,0.12) 0%, transparent 70%); top: -100px; right: -100px; pointer-events: none; z-index: 0; }
  .bg-glow-2 { position: fixed; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, rgba(20,200,160,0.08) 0%, transparent 70%); bottom: -50px; left: -50px; pointer-events: none; z-index: 0; }

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

  .main { flex: 1; padding: 2.5rem 3rem; margin-left: 220px; transition: margin-left 0.3s ease; animation: fadeUp 0.5s ease both; max-width: 900px; }
  .main.collapsed { margin-left: 0; padding-left: 4rem; }

  /* Back button */
  .back-btn {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 0.78rem; color: rgba(240,237,232,0.35);
    background: none; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    margin-bottom: 1.75rem;
    transition: color 0.2s ease;
    padding: 0;
  }
  .back-btn:hover { color: rgba(240,237,232,0.7); }

  /* Product header strip */
  .product-strip {
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 1.1rem 1.4rem;
    margin-bottom: 2rem;
  }
  .product-strip-left { display: flex; flex-direction: column; gap: 3px; }
  .product-strip-name { font-family: 'DM Serif Display', serif; font-size: 1.5rem; color: #f0ede8; }
  .product-strip-cat { font-size: 0.72rem; color: rgba(240,237,232,0.3); letter-spacing: 0.04em; }
  .product-strip-price { font-family: 'DM Serif Display', serif; font-size: 1.8rem; color: #f0ede8; }
  .product-strip-price-label { font-size: 0.62rem; color: rgba(240,237,232,0.22); text-align: right; margin-top: 2px; }

  /* AI Analysis area */
  .analysis-area {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 2rem;
    min-height: 300px;
    position: relative;
  }

  /* Loading state */
  .loading-header {
    display: flex; align-items: center; gap: 10px;
    font-size: 0.78rem; color: rgba(160,155,255,0.6);
    margin-bottom: 1.5rem;
  }
  .pulse-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: rgba(160,155,255,0.7);
    animation: pulse 1.2s ease-in-out infinite;
  }
  @keyframes pulse { 0%,100% { opacity: 0.3; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.1); } }

  /* Error state */
  .error-msg {
    font-size: 0.82rem; color: rgba(255,100,100,0.75);
    background: rgba(255,100,100,0.06);
    border: 1px solid rgba(255,100,100,0.15);
    border-radius: 10px;
    padding: 1rem 1.25rem;
  }

  /* ── Formatted markdown output ── */
  .md-content { font-size: 0.87rem; line-height: 1.75; color: rgba(240,237,232,0.8); }

  .md-content h3 {
    font-family: 'DM Serif Display', serif;
    font-size: 1.05rem;
    color: #f0ede8;
    margin: 1.75rem 0 0.6rem;
    padding-bottom: 0.4rem;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .md-content h3:first-child { margin-top: 0; }

  .md-content p { margin-bottom: 0.6rem; }

  .md-content ul, .md-content ol {
    padding-left: 1.25rem;
    margin-bottom: 0.75rem;
  }
  .md-content li { margin-bottom: 0.3rem; }

  .md-content strong { color: #f0ede8; font-weight: 500; }

  .md-content em { color: rgba(160,155,255,0.85); font-style: italic; }

  /* RM / number highlights */
  .rm-val {
    font-family: 'DM Serif Display', serif;
    color: rgba(20,200,160,0.9);
    font-size: 1em;
  }

  /* Horizontal rule between sections */
  .md-content hr {
    border: none;
    border-top: 1px solid rgba(255,255,255,0.06);
    margin: 1.25rem 0;
  }

  /* Streaming cursor */
  .cursor {
    display: inline-block;
    width: 2px; height: 1em;
    background: rgba(160,155,255,0.7);
    margin-left: 2px;
    vertical-align: text-bottom;
    animation: blink 0.9s step-end infinite;
  }
  @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
`;

const NAV_ITEMS = [
  { icon: "⊞", label: "Dashboard",   path: "/dashboard" },
  { icon: "◫", label: "Insights",    path: "/insights"  },
  { icon: "⊜", label: "Pricing",     path: "/pricing"   },
  { icon: "◉", label: "Chat",        path: "/chat"      },
  { icon: "⊕", label: "Upload Data", path: "/?reupload=true" },
];

// ── Lightweight markdown → HTML renderer ──────────────────────────────────────
function renderMarkdown(text) {
  const lines = text.split("\n");
  let html = "";
  let inList = false;
  let listTag = "";

  const closeList = () => {
    if (inList) { html += `</${listTag}>`; inList = false; listTag = ""; }
  };

  const processInline = (str) => {
    return str
      // Bold+italic
      .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
      // Bold
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      // Italic
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      // RM values — highlight currency amounts
      .replace(/(RM\s?[\d,]+(?:\.\d{1,2})?)/g, '<span class="rm-val">$1</span>')
      // Percentage highlights
      .replace(/(\d+(?:\.\d+)?%)/g, "<strong>$1</strong>");
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // H3 heading: ### or **1. Title** style
    if (/^###\s+/.test(line)) {
      closeList();
      const heading = processInline(line.replace(/^###\s+/, "").replace(/\*\*/g, ""));
      html += `<h3>${heading}</h3>`;
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      closeList();
      html += "<hr/>";
      continue;
    }

    // Unordered list
    if (/^[\-\*]\s+/.test(line)) {
      if (!inList || listTag !== "ul") { closeList(); html += "<ul>"; inList = true; listTag = "ul"; }
      html += `<li>${processInline(line.replace(/^[\-\*]\s+/, ""))}</li>`;
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      if (!inList || listTag !== "ol") { closeList(); html += "<ol>"; inList = true; listTag = "ol"; }
      html += `<li>${processInline(line.replace(/^\d+\.\s+/, ""))}</li>`;
      continue;
    }

    closeList();

    // Empty line
    if (line.trim() === "") { html += ""; continue; }

    // Paragraph
    html += `<p>${processInline(line)}</p>`;
  }

  closeList();
  return html;
}

export default function PricingDetail() {
  const { productName } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const product = state?.product ?? { name: decodeURIComponent(productName), cat: "", price: null };

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rawText, setRawText] = useState("");
  const [status, setStatus] = useState("loading"); // loading | streaming | done | error
  const [errorMsg, setErrorMsg] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const fetchStream = async () => {
      setStatus("loading");
      setRawText("");
      try {
        const res = await fetch(`http://localhost:${ENDPOINT}/pricing-strategy/stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_name: product.name }),
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        setStatus("streaming");

        while (true) {
          const { value, done } = await reader.read();
          if (done || cancelled) break;
          const chunk = decoder.decode(value, { stream: true });
          setRawText((prev) => prev + chunk);
          // Auto-scroll as content streams in
          bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }

        if (!cancelled) setStatus("done");
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(err.message || "Failed to fetch pricing analysis.");
          setStatus("error");
        }
      }
    };

    fetchStream();
    return () => { cancelled = true; };
  }, [product.name]);

  const showCursor = status === "loading" || status === "streaming";

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

          <button className="back-btn" onClick={() => navigate("/pricing")}>
            ← Back to Products
          </button>

          {/* Product identity strip */}
          <div className="product-strip">
            <div className="product-strip-left">
              <div className="product-strip-name">{product.name}</div>
              {product.cat && <div className="product-strip-cat">{product.cat}</div>}
            </div>
            {product.price != null && (
              <div>
                <div className="product-strip-price">RM {product.price}</div>
                <div className="product-strip-price-label">your price</div>
              </div>
            )}
          </div>

          {/* AI Analysis area */}
          <div className="analysis-area">

            {/* Loading header shown while fetching / streaming */}
            {(status === "loading" || status === "streaming") && (
              <div className="loading-header">
                <div className="pulse-dot" />
                {status === "loading"
                  ? "Fetching competitor data & generating analysis…"
                  : "Analysing pricing strategy…"}
              </div>
            )}

            {status === "error" && (
              <div className="error-msg">⚠ {errorMsg}</div>
            )}

            {/* Rendered markdown content */}
            {rawText && (
              <div
                className="md-content"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(rawText) + (showCursor ? '<span class="cursor"></span>' : ""),
                }}
              />
            )}

            <div ref={bottomRef} />
          </div>

        </main>
      </div>
    </>
  );
}