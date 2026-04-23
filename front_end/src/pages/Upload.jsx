import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../App.css";
import { init } from "../../api/init";

const STEPS = [
  "Reading your documents",
  "Scanning market trends",
  "Analysing your inventory",
  "Generating recommendations",
  "Sending A Detailed Analysis to Your Email...",
];

// ---- Upload Box ----
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

// ---- Processing Step ----
function ProcessingStep({ label, index, activeStep }) {
  let status = "idle";
  if (index < activeStep) status = "done";
  else if (index === activeStep) status = "active";

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

// ---- Progress Bar ----
function ProgressBar({ activeStep, total }) {
  const width =
    activeStep < 0 ? 0 : Math.round((activeStep / (total - 1)) * 100);
  return (
    <div
      className="progress-bar-fill"
      style={{ width: `${width}%`, transition: "width 0.5s ease" }}
    />
  );
}

// ---- Main App ----
export default function App() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const isReupload = params.get("reupload") === "true";

  const [step, setStep] = useState(isReupload ? 3 : 1);
  const [companyName, setCompanyName] = useState("");
  const [activeStep, setActiveStep] = useState(-1);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState({
    companyDescription: null,
    inventoryRecords: null,
    salesSheets: null,
    balanceSheets: null,
  });

  const navigate = useNavigate();

  function handleFileChange(key, file) {
    setFiles((prev) => ({ ...prev, [key]: file }));
  }

  const allFilesFilled =
    files.companyDescription &&
    files.inventoryRecords &&
    files.salesSheets &&
    files.balanceSheets;

  async function handleSubmit() {
    if (!allFilesFilled) return;
    setError(null);
    setStep(4);
    try {
      await init(
        files.companyDescription,
        files.inventoryRecords,
        files.salesSheets,
        files.balanceSheets,
        (stepIndex) => setActiveStep(stepIndex),
      );
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setStep(3);
      setActiveStep(-1);
    }
  }

  // ---- Screen 1: Title ----
  if (step === 1) {
    return (
      <div className="screen">
        <div className="bg-grid" />
        <div className="bg-glow" />
        <div className="bg-glow-2" />
        <div className="content title-wrap">
          <span className="logo-badge">Business AI · SME Edition</span>
          <h1 className="main-title">
            Lo<em>Cor</em>AI
          </h1>
          <p className="tagline">Your local AI — built for retail decisions</p>
          <button className="btn-start" onClick={() => setStep(2)}>
            Get Started <span className="btn-arrow">→</span>
          </button>
        </div>
      </div>
    );
  }

  // ---- Screen 2: Company Name ----
  if (step === 2) {
    return (
      <div className="screen">
        <div className="bg-grid" />
        <div className="bg-glow" />
        <div className="bg-glow-2" />
        <div className="content">
          <div className="card">
            <p className="step-indicator">Step 01 — Identity</p>
            <h2 className="card-title">What's your business called?</h2>
            <p className="card-subtitle">
              This helps LoCorAI personalise every report and recommendation to
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
            <button
              className="btn-back"
              onClick={() => (isReupload ? navigate("/dashboard") : setStep(1))}
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Screen 3: File Uploads ----
  if (step === 3) {
    return (
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

            {error && (
              <div
                style={{
                  marginBottom: "1rem",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "rgba(255,80,80,0.1)",
                  border: "1px solid rgba(255,80,80,0.3)",
                  color: "rgba(255,120,120,0.9)",
                  fontSize: "0.8rem",
                }}
              >
                ⚠ {error}
              </div>
            )}

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
                ? "Initialise LoCorAI →"
                : "Upload all 4 documents to continue"}
            </button>
            <button
              className="btn-back"
              onClick={() => (isReupload ? navigate("/dashboard") : setStep(2))}
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Screen 4: Processing ----
  if (step === 4) {
    return (
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
            {STEPS.map((label, i) => (
              <ProcessingStep
                key={i}
                label={label}
                index={i}
                activeStep={activeStep}
              />
            ))}
          </ul>

          <div className="progress-bar-wrap">
            <ProgressBar activeStep={activeStep} total={STEPS.length} />
          </div>
        </div>
      </div>
    );
  }
}
