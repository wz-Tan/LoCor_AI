import { useState, useEffect } from "react";
import "./App.css";

// ---- Upload Box Component ----
function UploadBox({ label, hint, icon, fileKey, accept, onFileChange, file }) {
  return (
    <div className={`upload-box ${file ? "filled" : ""}`}>
      <span className="upload-icon">{file ? "✓" : icon}</span>
      <div className="upload-label">{label}</div>
      <div className="upload-hint">{hint}</div>
      {file && <div className="upload-filename">{file.name}</div>}
      <label
        style={{
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
        }}
      >
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
      {status === "done" && (
        <span style={{ marginLeft: "auto", fontSize: "0.75rem" }}>✓</span>
      )}
    </li>
  );
}

// ---- Progress Bar Component ----
function ProgressBar() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const steps = [0, 20, 40, 60, 80, 100];
    const timers = steps.map((w, i) => setTimeout(() => setWidth(w), i * 1800));
    return () => timers.forEach(clearTimeout);
  }, []);

  return <div className="progress-bar-fill" style={{ width: `${width}%` }} />;
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
        <div className="screen">
          <div className="bg-grid" />
          <div className="bg-glow" />
          <div className="bg-glow-2" />
          <div className="content title-wrap">
            <span className="logo-badge">Business AI · SME Edition</span>
            <h1 className="main-title">
              Lo<em>Co</em>AI
            </h1>
            <p className="tagline">
              Your local AI — built for retail decisions
            </p>
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
        <div className="screen">
          <div className="bg-grid" />
          <div className="bg-glow" />
          <div className="bg-glow-2" />
          <div className="content">
            <div className="card">
              <p className="step-indicator">Step 01 — Identity</p>
              <h2 className="card-title">What's your business called?</h2>
              <p className="card-subtitle">
                This helps LoCoAI personalise every report and recommendation to
                your company.
              </p>
              <label className="field-label">Company name</label>
              <input
                className="text-input"
                type="text"
                placeholder="e.g. Ahmad's Hardware Store"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && companyName.trim() && setStep(3)
                }
                autoFocus
              />
              <button
                className={`btn-primary ${companyName.trim() ? "active" : "disabled"}`}
                onClick={() => companyName.trim() && setStep(3)}
              >
                Continue →
              </button>
              <button className="btn-back" onClick={() => setStep(1)}>
                ← Back
              </button>
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
        <div className="screen">
          <div className="bg-grid" />
          <div className="bg-glow" />
          <div className="bg-glow-2" />
          <div className="content">
            <div className="card">
              <p className="step-indicator">Step 02 — Documents</p>
              <h2 className="card-title">Upload your records</h2>
              <p className="card-subtitle">
                Welcome, {companyName}. Upload all four documents below to
                initialise your AI profile.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
                  gap: "12px",
                  marginBottom: "1.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
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
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
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
                {allFilesFilled
                  ? "Initialise LoCoAI →"
                  : "Upload all 4 documents to continue"}
              </button>
              <button className="btn-back" onClick={() => setStep(2)}>
                ← Back
              </button>
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
        <div className="screen">
          <div className="bg-grid" />
          <div className="bg-glow" />
          <div className="bg-glow-2" />
          <div className="content processing-wrap">
            <p className="processing-title">Analysing your business</p>
            <p className="processing-sub">
              This will only take a moment, {companyName}.
            </p>

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
      <div style={{ position: "relative" }}>
        <div className="bg-grid" />
        <div className="bg-glow" />
        <div className="bg-glow-2" />

        <div className="dashboard-wrap">
          <div className="dash-header">
            <div className="dash-logo">
              Lo<em>Co</em>AI
            </div>
            <div className="dash-company">{companyName}</div>
          </div>

          <div className="dash-grid">
            {[
              {
                label: "Monthly Revenue",
                value: "RM 45,000",
                change: "+12% vs last month",
                dir: "up",
              },
              {
                label: "Total Inventory",
                value: "730 units",
                change: "-3% vs last month",
                dir: "down",
              },
              {
                label: "Top Category",
                value: "Power Tools",
                change: "Trending up",
                dir: "up",
              },
              {
                label: "Reorder Alerts",
                value: "3 items",
                change: "Action needed",
                dir: "down",
              },
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
                  <span className={`trend-badge ${t.demand.toLowerCase()}`}>
                    {t.demand} Demand
                  </span>
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
                {
                  name: "Electric Drill",
                  stock: 45,
                  price: "RM 189",
                  status: "OK",
                  dir: "up",
                },
                {
                  name: "Screwdriver Set",
                  stock: 120,
                  price: "RM 35",
                  status: "OK",
                  dir: "up",
                },
                {
                  name: "PVC Pipe",
                  stock: 200,
                  price: "RM 8.50",
                  status: "OK",
                  dir: "up",
                },
                {
                  name: "Wall Paint",
                  stock: 80,
                  price: "RM 65",
                  status: "OK",
                  dir: "up",
                },
                {
                  name: "Cable Wire",
                  stock: 60,
                  price: "RM 22",
                  status: "Low",
                  dir: "down",
                },
              ].map((item, i) => (
                <div className="inv-row" key={i}>
                  <span>{item.name}</span>
                  <span>{item.stock}</span>
                  <span>{item.price}</span>
                  <span
                    className={`trend-badge ${item.dir === "up" ? "high" : "low"}`}
                  >
                    {item.status}
                  </span>
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
              <div
                key={i}
                style={{
                  padding: "12px 0",
                  borderBottom:
                    i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  fontSize: "0.85rem",
                  color: "rgba(240,237,232,0.7)",
                  lineHeight: 1.6,
                }}
              >
                {r}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
