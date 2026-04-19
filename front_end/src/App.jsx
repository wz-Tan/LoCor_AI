import { useState, useEffect } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: #0d0d0f;
    color: #f0ede8;
    min-height: 100vh;
  }

  .screen {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    position: relative;
    overflow: hidden;
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

  .content {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 520px;
  }

  .title-wrap {
    text-align: center;
    animation: fadeUp 0.8s ease both;
  }

  .logo-badge {
    display: inline-block;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(160,155,255,0.8);
    border: 1px solid rgba(160,155,255,0.25);
    padding: 6px 16px;
    border-radius: 999px;
    margin-bottom: 2rem;
  }

  .main-title {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(4rem, 12vw, 7rem);
    line-height: 1;
    letter-spacing: -0.02em;
    color: #f0ede8;
    margin-bottom: 1.5rem;
  }

  .main-title em {
    font-style: italic;
    color: rgba(160,155,255,0.9);
  }

  .tagline {
    font-size: 1rem;
    font-weight: 300;
    color: rgba(240,237,232,0.45);
    letter-spacing: 0.05em;
    margin-bottom: 3rem;
  }

  .btn-start {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.12);
    color: #f0ede8;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 400;
    letter-spacing: 0.05em;
    padding: 14px 32px;
    border-radius: 999px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
  }

  .btn-start:hover {
    background: rgba(255,255,255,0.12);
    border-color: rgba(160,155,255,0.5);
    transform: translateY(-2px);
  }

  .btn-arrow {
    font-size: 1rem;
    transition: transform 0.3s ease;
  }

  .btn-start:hover .btn-arrow {
    transform: translateX(4px);
  }

  .card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 24px;
    padding: 3rem;
    animation: fadeUp 0.6s ease both;
  }

  .step-indicator {
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(160,155,255,0.7);
    margin-bottom: 1.5rem;
    font-weight: 500;
  }

  .card-title {
    font-family: 'DM Serif Display', serif;
    font-size: 2.2rem;
    line-height: 1.15;
    color: #f0ede8;
    margin-bottom: 0.5rem;
  }

  .card-subtitle {
    font-size: 0.875rem;
    color: rgba(240,237,232,0.4);
    font-weight: 300;
    margin-bottom: 2.5rem;
    line-height: 1.6;
  }

  .field-label {
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(240,237,232,0.4);
    font-weight: 500;
    margin-bottom: 0.75rem;
    display: block;
  }

  .text-input {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 1rem 1.25rem;
    font-family: 'DM Sans', sans-serif;
    font-size: 1rem;
    font-weight: 300;
    color: #f0ede8;
    outline: none;
    transition: border-color 0.2s ease;
    margin-bottom: 2rem;
  }

  .text-input::placeholder { color: rgba(240,237,232,0.2); }
  .text-input:focus { border-color: rgba(160,155,255,0.5); }

  .btn-primary {
    width: 100%;
    padding: 1rem;
    border-radius: 12px;
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-primary.active { background: #a09bff; color: #0d0d0f; }
  .btn-primary.active:hover { background: #b8b4ff; transform: translateY(-1px); }
  .btn-primary.disabled { background: rgba(255,255,255,0.06); color: rgba(240,237,232,0.2); cursor: not-allowed; }

  .btn-back {
    background: none;
    border: none;
    color: rgba(240,237,232,0.35);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.8rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    margin-top: 1.25rem;
    padding: 0;
    transition: color 0.2s;
    display: block;
    text-align: center;
    width: 100%;
  }

  .btn-back:hover { color: rgba(240,237,232,0.6); }

  .upload-box {
    background: rgba(255,255,255,0.03);
    border: 1px dashed rgba(255,255,255,0.1);
    border-radius: 16px;
    padding: 1.25rem;
    transition: all 0.2s ease;
    text-align: left;
  }

  .upload-box:hover {
    background: rgba(255,255,255,0.06);
    border-color: rgba(160,155,255,0.35);
  }

  .upload-box.filled {
    border-style: solid;
    border-color: rgba(20,200,160,0.35);
    background: rgba(20,200,160,0.05);
  }

  .upload-icon { font-size: 1.25rem; margin-bottom: 0.5rem; display: block; }
  .upload-label { font-size: 0.8rem; font-weight: 500; color: #f0ede8; margin-bottom: 0.25rem; }
  .upload-hint { font-size: 0.7rem; color: rgba(240,237,232,0.3); font-weight: 300; }
  .upload-filename {
    font-size: 0.7rem;
    color: rgba(20,200,160,0.9);
    margin-top: 0.5rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .hidden-input { display: none; }

  .processing-wrap {
    text-align: center;
    animation: fadeUp 0.6s ease both;
  }

  .processing-title {
    font-family: 'DM Serif Display', serif;
    font-size: 2rem;
    color: #f0ede8;
    margin-bottom: 0.5rem;
  }

  .processing-sub {
    font-size: 0.85rem;
    color: rgba(240,237,232,0.35);
    font-weight: 300;
    margin-bottom: 3rem;
    letter-spacing: 0.05em;
  }

  .steps-list {
    list-style: none;
    width: 100%;
    max-width: 380px;
    margin: 0 auto 2.5rem;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .step-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 18px;
    border-radius: 14px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    transition: all 0.4s ease;
    font-size: 0.85rem;
    color: rgba(240,237,232,0.3);
    text-align: left;
  }

  .step-row.active {
    background: rgba(160,155,255,0.08);
    border-color: rgba(160,155,255,0.25);
    color: rgba(240,237,232,0.9);
  }

  .step-row.done {
    background: rgba(20,200,160,0.06);
    border-color: rgba(20,200,160,0.2);
    color: rgba(20,200,160,0.8);
  }

  .step-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255,255,255,0.1);
    flex-shrink: 0;
    transition: all 0.4s ease;
  }

  .step-row.active .step-dot {
    background: rgba(160,155,255,0.9);
    box-shadow: 0 0 8px rgba(160,155,255,0.5);
    animation: pulse 1.2s ease infinite;
  }

  .step-row.done .step-dot { background: rgba(20,200,160,0.9); }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.7); }
  }

  .progress-bar-wrap {
    width: 100%;
    max-width: 380px;
    margin: 0 auto;
    height: 2px;
    background: rgba(255,255,255,0.06);
    border-radius: 999px;
    overflow: hidden;
  }

  .progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, rgba(160,155,255,0.8), rgba(20,200,160,0.8));
    border-radius: 999px;
    transition: width 0.6s ease;
  }

  .dashboard-wrap {
    min-height: 100vh;
    padding: 2.5rem;
    position: relative;
    z-index: 1;
  }

  .dash-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2.5rem;
  }

  .dash-logo {
    font-family: 'DM Serif Display', serif;
    font-size: 1.5rem;
    color: #f0ede8;
  }

  .dash-logo em {
    font-style: italic;
    color: rgba(160,155,255,0.9);
  }

  .dash-company {
    font-size: 0.8rem;
    color: rgba(240,237,232,0.35);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .dash-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 2rem;
  }

  .metric-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 1.25rem;
  }

  .metric-label {
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(240,237,232,0.35);
    margin-bottom: 0.5rem;
  }

  .metric-value {
    font-family: 'DM Serif Display', serif;
    font-size: 1.8rem;
    color: #f0ede8;
  }

  .metric-change { font-size: 0.75rem; margin-top: 0.25rem; }
  .metric-change.up { color: rgba(20,200,160,0.8); }
  .metric-change.down { color: rgba(255,100,100,0.8); }

  .dash-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 2rem;
  }

  .dash-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 1.5rem;
  }

  .dash-card-title {
    font-size: 0.75rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(240,237,232,0.35);
    margin-bottom: 1.25rem;
  }

  .trend-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    font-size: 0.85rem;
    color: rgba(240,237,232,0.7);
  }

  .trend-item:last-child { border-bottom: none; }

  .trend-badge {
    font-size: 0.7rem;
    padding: 3px 10px;
    border-radius: 999px;
  }

  .trend-badge.high {
    background: rgba(20,200,160,0.12);
    color: rgba(20,200,160,0.9);
    border: 1px solid rgba(20,200,160,0.2);
  }

  .trend-badge.medium {
    background: rgba(160,155,255,0.12);
    color: rgba(160,155,255,0.9);
    border: 1px solid rgba(160,155,255,0.2);
  }

  .trend-badge.low {
    background: rgba(255,100,100,0.1);
    color: rgba(255,100,100,0.8);
    border: 1px solid rgba(255,100,100,0.2);
  }

  .inv-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    font-size: 0.8rem;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    color: rgba(240,237,232,0.7);
    align-items: center;
  }

  .inv-row:last-child { border-bottom: none; }

  .inv-header {
    color: rgba(240,237,232,0.25);
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

// ---- Upload Box Component ----
function UploadBox({ label, hint, icon, fileKey, accept, onFileChange, file }) {
  return (
    <div className={`upload-box ${file ? "filled" : ""}`}>
      <span className="upload-icon">{file ? "✓" : icon}</span>
      <div className="upload-label">{label}</div>
      <div className="upload-hint">{hint}</div>
      {file && <div className="upload-filename">{file.name}</div>}
      <label style={{
        display: "inline-block",
        marginTop: "0.75rem",
        padding: "6px 16px",
        borderRadius: "999px",
        border: "1px solid rgba(255,255,255,0.15)",
        fontSize: "0.7rem",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: file ? "rgba(20,200,160,0.9)" : "rgba(240,237,232,0.5)",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}>
        {file ? "Change file" : "Upload"}
        <input
          type="file"
          className="hidden-input"
          accept={accept}
          onChange={(e) => onFileChange(fileKey, e.target.files[0])}
        />
      </label>
    </div>
  );
}

// ---- Processing Step Component ----
function ProcessingStep({ label, index }) {
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    const activeTimer = setTimeout(() => setStatus("active"), index * 1800);
    const doneTimer = setTimeout(() => setStatus("done"), index * 1800 + 1600);
    return () => {
      clearTimeout(activeTimer);
      clearTimeout(doneTimer);
    };
  }, [index]);

  return (
    <li className={`step-row ${status}`}>
      <span className="step-dot" />
      {label}
      {status === "done" && <span style={{ marginLeft: "auto", fontSize: "0.75rem" }}>✓</span>}
    </li>
  );
}

// ---- Progress Bar Component ----
function ProgressBar() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const steps = [0, 20, 40, 60, 80, 100];
    const timers = steps.map((w, i) =>
      setTimeout(() => setWidth(w), i * 1800)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="progress-bar-fill" style={{ width: `${width}%` }} />
  );
}

// ---- Main App ----
export default function App() {
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState("");
  const [files, setFiles] = useState({
    companyDescription: null,
    inventoryRecords: null,
    salesSheets: null,
    balanceSheets: null,
  });

  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(() => setStep(5), 9000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  function handleFileChange(key, file) {
    setFiles((prev) => ({ ...prev, [key]: file }));
  }

  const allFilesFilled =
    files.companyDescription &&
    files.inventoryRecords &&
    files.salesSheets &&
    files.balanceSheets;

  function handleSubmit() {
    if (!allFilesFilled) return;
    setStep(4);
    console.log("Company:", companyName, "Files:", files);
  }

  // ---- Screen 1: Title ----
  if (step === 1) {
    return (
      <>
        <style>{styles}</style>
        <div className="screen">
          <div className="bg-grid" />
          <div className="bg-glow" />
          <div className="bg-glow-2" />
          <div className="content title-wrap">
            <span className="logo-badge">Business AI · SME Edition</span>
            <h1 className="main-title">Lo<em>Co</em>AI</h1>
            <p className="tagline">Your local AI — built for retail decisions</p>
            <button className="btn-start" onClick={() => setStep(2)}>
              Get Started <span className="btn-arrow">→</span>
            </button>
          </div>
        </div>
      </>
    );
  }

  // ---- Screen 2: Company Name ----
  if (step === 2) {
    return (
      <>
        <style>{styles}</style>
        <div className="screen">
          <div className="bg-grid" />
          <div className="bg-glow" />
          <div className="bg-glow-2" />
          <div className="content">
            <div className="card">
              <p className="step-indicator">Step 01 — Identity</p>
              <h2 className="card-title">What's your business called?</h2>
              <p className="card-subtitle">
                This helps LoCoAI personalise every report and recommendation to your company.
              </p>
              <label className="field-label">Company name</label>
              <input
                className="text-input"
                type="text"
                placeholder="e.g. Ahmad's Hardware Store"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && companyName.trim() && setStep(3)}
                autoFocus
              />
              <button
                className={`btn-primary ${companyName.trim() ? "active" : "disabled"}`}
                onClick={() => companyName.trim() && setStep(3)}
              >
                Continue →
              </button>
              <button className="btn-back" onClick={() => setStep(1)}>← Back</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ---- Screen 3: File Uploads ----
  if (step === 3) {
    return (
      <>
        <style>{styles}</style>
        <div className="screen">
          <div className="bg-grid" />
          <div className="bg-glow" />
          <div className="bg-glow-2" />
          <div className="content">
            <div className="card">
              <p className="step-indicator">Step 02 — Documents</p>
              <h2 className="card-title">Upload your records</h2>
              <p className="card-subtitle">
                Welcome, {companyName}. Upload all four documents below to initialise your AI profile.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "12px", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <UploadBox
                    label="Company Description"
                    hint="PDF, Word or TXT"
                    icon="📄"
                    fileKey="companyDescription"
                    accept=".pdf,.doc,.docx,.txt"
                    onFileChange={handleFileChange}
                    file={files.companyDescription}
                  />
                  <UploadBox
                    label="Inventory Records"
                    hint="Excel or CSV"
                    icon="📦"
                    fileKey="inventoryRecords"
                    accept=".xlsx,.csv"
                    onFileChange={handleFileChange}
                    file={files.inventoryRecords}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <UploadBox
                    label="Sales Sheets"
                    hint="Excel or CSV"
                    icon="💰"
                    fileKey="salesSheets"
                    accept=".xlsx,.csv"
                    onFileChange={handleFileChange}
                    file={files.salesSheets}
                  />
                  <UploadBox
                    label="Balance Sheets"
                    hint="Excel or CSV"
                    icon="📊"
                    fileKey="balanceSheets"
                    accept=".xlsx,.csv"
                    onFileChange={handleFileChange}
                    file={files.balanceSheets}
                  />
                </div>
              </div>

              <button
                className={`btn-primary ${allFilesFilled ? "active" : "disabled"}`}
                onClick={handleSubmit}
              >
                {allFilesFilled ? "Initialise LoCoAI →" : "Upload all 4 documents to continue"}
              </button>
              <button className="btn-back" onClick={() => setStep(2)}>← Back</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ---- Screen 4: Processing ----
  if (step === 4) {
    return (
      <>
        <style>{styles}</style>
        <div className="screen">
          <div className="bg-grid" />
          <div className="bg-glow" />
          <div className="bg-glow-2" />
          <div className="content processing-wrap">
            <p className="processing-title">Analysing your business</p>
            <p className="processing-sub">This will only take a moment, {companyName}.</p>

            <ul className="steps-list">
              {[
                "Reading your documents",
                "Scanning market trends",
                "Analysing your inventory",
                "Generating recommendations",
                "Building your dashboard",
              ].map((label, i) => (
                <ProcessingStep key={i} label={label} index={i} />
              ))}
            </ul>

            <div className="progress-bar-wrap">
              <ProgressBar />
            </div>
          </div>
        </div>
      </>
    );
  }

  // ---- Screen 5: Dashboard ----
  return (
    <>
      <style>{styles}</style>
      <div style={{ position: "relative" }}>
        <div className="bg-grid" />
        <div className="bg-glow" />
        <div className="bg-glow-2" />

        <div className="dashboard-wrap">
          <div className="dash-header">
            <div className="dash-logo">Lo<em>Co</em>AI</div>
            <div className="dash-company">{companyName}</div>
          </div>

          <div className="dash-grid">
            {[
              { label: "Monthly Revenue", value: "RM 45,000", change: "+12% vs last month", dir: "up" },
              { label: "Total Inventory", value: "730 units", change: "-3% vs last month", dir: "down" },
              { label: "Top Category", value: "Power Tools", change: "Trending up", dir: "up" },
              { label: "Reorder Alerts", value: "3 items", change: "Action needed", dir: "down" },
            ].map((m, i) => (
              <div className="metric-card" key={i}>
                <div className="metric-label">{m.label}</div>
                <div className="metric-value">{m.value}</div>
                <div className={`metric-change ${m.dir}`}>{m.change}</div>
              </div>
            ))}
          </div>

          <div className="dash-row">
            <div className="dash-card">
              <div className="dash-card-title">AI Trend Analysis</div>
              {[
                { name: "Electric Drills", demand: "High" },
                { name: "Wall Paint", demand: "High" },
                { name: "PVC Pipes", demand: "Medium" },
                { name: "Cable Wire", demand: "Medium" },
                { name: "Sand Paper", demand: "Low" },
              ].map((t, i) => (
                <div className="trend-item" key={i}>
                  <span>{t.name}</span>
                  <span className={`trend-badge ${t.demand.toLowerCase()}`}>{t.demand} Demand</span>
                </div>
              ))}
            </div>

            <div className="dash-card">
              <div className="dash-card-title">Inventory Overview</div>
              <div className="inv-row inv-header">
                <span>Product</span>
                <span>Stock</span>
                <span>Price</span>
                <span>Status</span>
              </div>
              {[
                { name: "Electric Drill", stock: 45, price: "RM 189", status: "OK", dir: "up" },
                { name: "Screwdriver Set", stock: 120, price: "RM 35", status: "OK", dir: "up" },
                { name: "PVC Pipe", stock: 200, price: "RM 8.50", status: "OK", dir: "up" },
                { name: "Wall Paint", stock: 80, price: "RM 65", status: "OK", dir: "up" },
                { name: "Cable Wire", stock: 60, price: "RM 22", status: "Low", dir: "down" },
              ].map((item, i) => (
                <div className="inv-row" key={i}>
                  <span>{item.name}</span>
                  <span>{item.stock}</span>
                  <span>{item.price}</span>
                  <span className={`trend-badge ${item.dir === "up" ? "high" : "low"}`}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="dash-card" style={{ marginBottom: "2rem" }}>
            <div className="dash-card-title">AI Recommendations</div>
            {[
              "🔺 Restock Electric Drills — demand trending high based on current market trends.",
              "🔺 Increase Wall Paint stock before Q3 — renovation season approaching.",
              "🔻 Reduce Sand Paper orders — demand dropping, current stock sufficient for 3 months.",
            ].map((r, i) => (
              <div key={i} style={{
                padding: "12px 0",
                borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none",
                fontSize: "0.85rem",
                color: "rgba(240,237,232,0.7)",
                lineHeight: 1.6,
              }}>{r}</div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
