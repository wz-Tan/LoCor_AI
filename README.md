# LoCor AI - Business Intelligence & Market Analysis Agent

LoCor AI is an autonomous business intelligence platform designed to empower small to medium-sized enterprises (SMEs) by bridging the gap between internal operational data and real-time external market trends.

## 🚀 Core Mission
The project transforms raw business documents and social media noise into actionable strategic advice, helping owners optimize inventory, predict sales, and stay ahead of viral trends.

## System Architecture
![System Architecture](architecture.png)

---

## 🛠️ Key Features

### 1. Market Trend Aggregation
The system monitors global and regional trends across multiple platforms:
- **Social Media:** TikTok, Twitter, and YouTube (via RapidAPI).
- **News:** Real-time news aggregation focused on business and general topics.
- **Efficiency:** Uses a custom **TOON encoding** to compress platform data, reducing LLM token usage by up to 30-50% while maintaining high data fidelity.

### 2. Internal Business Intelligence (RAG)
LoCor AI uses **Retrieval-Augmented Generation (RAG)** to understand the specific context of your business:
- **Data Ingestion:** Automatically parses Company Descriptions, Sales Sheets, Inventory Lists, and Balance Sheets.
- **Vector Storage:** Stores business context in **ChromaDB**, allowing the AI to make recommendations based on your actual stock levels and financial health.

### 3. Agentic Execution
Instead of just providing text, the AI acts as a digital consultant that can:
- 📄 **Generate Reports:** Automatically create professional Word documents (`.docx`) summarizing market opportunities.
- 📊 **Create Spreadsheets:** Produce Excel files (`.xlsx`) containing data-driven inventory suggestions.
- 📧 **Automated Delivery:** Send the final deliverables directly to the owner's inbox using the **Resend API**.

### 4. High-Performance Architecture
- **Caching:** Utilizes **Redis** to cache trend summaries for 1 hour, minimizing API costs and latency.
- **Async Processing:** Handles multiple API requests concurrently using Python's `asyncio`.
- **FastAPI Backend:** Provides a robust REST API for frontend communication and data initialization.

---

## 🔄 Data Flow

1.  **Ingestion:** The user uploads business spreadsheets via the `front_end`. The `Backend` parses these and populates the `ChromaDB` vector store.
2.  **Observation:** The system fetches live data from TikTok, YouTube, Twitter, and News APIs.
3.  **Summarization:** An AI agent analyzes the "noise" and produces a "Market Opportunity Report" (cached in Redis).
4.  **Synthesis:** The main orchestrator (`main.py`) combines the **Business Context** (from ChromaDB) with the **Market Report** (from Redis).
5.  **Action:** The AI invokes tools to generate files and sends a consolidated strategy email to the user.

---

## 📂 Project Structure (Backend)

| Directory | Responsibility |
| :--- | :--- |
| `data_apis/` | Logic for fetching and AI-summarizing platform trends (TikTok, News, etc.). |
| `db/` | Vector database management and document population logic. |
| `processing_generation/` | File generation (Word/Excel) and email notification services. |
| `processing_tools/` | Document and DataFrame parsing utilities. |
| `server.py` | The FastAPI entry point for data initialization and web requests. |
| `main.py` | The core agentic loop and orchestrator. |

---

## 🔧 Technology Stack
- **AI/LLM:** Z.ai (GLM-4.5)
- **Database:** ChromaDB (Vector), Redis (Cache)
- **Frameworks:** FastAPI, Pandas, Asyncio
- **APIs:** RapidAPI (Social/News), Resend (Email)
- **File Handling:** Openpyxl (Excel), Python-docx (Word)

---

# Redis Setup Guide

---

## Mac

### Install
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Redis
brew install redis
```

### Start
```bash
brew services start redis
```

### Verify
```bash
redis-cli ping
# Expected: PONG
```

### Stop
```bash
brew services stop redis
```

### Restart
```bash
brew services restart redis
```

---

## Windows

### Install
```powershell
# 1. Open PowerShell as Administrator and enable WSL2
wsl --install

# 2. Restart your PC, then open Ubuntu terminal and run:
sudo apt update
sudo apt install redis-server -y
```

### Start
```bash
sudo service redis-server start
```

### Verify
```bash
redis-cli ping
# Expected: PONG
```

### Stop
```bash
sudo service redis-server stop
```

### Restart
```bash
sudo service redis-server restart
```

> ⚠️ **Note:** WSL does not auto-start on reboot. You will need to run `sudo service redis-server start` every time you restart your PC.

---

## Linux (Ubuntu/Debian)

### Install
```bash
sudo apt update
sudo apt install redis-server -y
```

### Start
```bash
sudo systemctl start redis
```

### Enable auto-start on reboot
```bash
sudo systemctl enable redis
```

### Verify
```bash
redis-cli ping
# Expected: PONG
```

### Stop
```bash
sudo systemctl stop redis
```

### Restart
```bash
sudo systemctl restart redis
```

---

## Python Client (All Platforms)

```bash
pip install redis
```

```python
import redis
redis_client = redis.Redis(host='localhost', port=6379, db=0)
```

---

## Optimization

### Uses TOON Instead of JSON

Reduces token usage by ~25-30%, allowing for a faster model processing

### Redis Caching (TODO Maybe)

Prevents duplicative API calls within a short timeframe. Enhances data retrieval speed

---

