# 🏙️ Collat.AI v3 — Multi-City Indian Real Estate Intelligence

> AI-powered collateral valuation for NBFCs & Fintechs across **8 major Indian cities**

[![Python](https://www.python.org/downloads/)](https://www.python.org/downloads/)
[![FastAPI](https://fastapi.tiangolo.com)](https://fastapi.tiangolo.com)
[![Streamlit](https://streamlit.io)](https://streamlit.io)

---

## 🆕 What's New in v3 vs v2

| Feature | v2 | v3 |
|---|---|---|
| Cities | Mumbai only | **8 cities** (Mumbai, Delhi, Bangalore, Hyderabad, Pune, Chennai, Kolkata, Ahmedabad) |
| Dataset | 100K records | **200K+ records** |
| Image Pipeline | Simulated scores | **EfficientNet-B0 CNN** (timm) feature extraction |
| Web Scraping | None | MagicBricks/99acres/Housing.com scraper module |
| Fraud Rules | 8 rules | **10 rules** + per-city median thresholds |
| Enrichment | Mumbai circle rates | Per-city circle rates + OSM POI |
| Model | XGBoost + LightGBM | Same + **image features + city embeddings** |

---

## 🏗️ Project Structure

```
Collat_AI/
├── src/
│   ├── config.py                # 8-city config, feature registry, hyperparams
│   ├── dataset_generator.py     # 200K synthetic dataset generator
│   ├── web_scraper.py           # Property listing scraper (MagicBricks/99acres)
│   ├── image_feature_extractor.py  # EfficientNet-B0 CNN image features
│   ├── preprocessor.py          # Multi-city label encoding + scaling
│   ├── value_engine.py          # XGBoost P10/P50/P90 valuation
│   ├── liquidity_engine.py      # LightGBM Ordinal RPI + TTL
│   ├── fraud_engine.py          # Isolation Forest + 10 deterministic rules
│   ├── explainability.py        # SHAP attribution
│   ├── inference_pipeline.py    # Full inference orchestration
│   ├── schemas.py               # Pydantic v2 API models
│   ├── api.py                   # FastAPI application
│   └── app.py                   # Streamlit dashboard
├── collat-ai-frontend/         # React + Vite + Electron UI
├── data/                        # Generated datasets, image cache, scraper cache
├── models/                      # Trained model artefacts (*.joblib)
├── logs/                        # Training and API logs
├── requirements-api.txt         # API / inference only (default for judges)
├── requirements.txt             # Full stack (training, Streamlit, scrapers, PyTorch)
├── run.sh                       # Master run script (Unix / Git Bash)
├── run-web.ps1                  # API + React (Windows)
├── package.json                 # Root `npm run dev` (API + Vite via concurrently)
└── demo.py                      # Quick inference demo
```

---

## 🚀 Quick Start

### Judges / demo: API + React UI (slim Python deps)

Use **`requirements-api.txt`** only (no training stack, no PyTorch/timm for judges).

**Windows (PowerShell, from repo root) — single command:**

```powershell
npm start
```

(or **`.\run-web.ps1`**, which runs the same thing.)

That script will, when needed: create **`./venv`**, **`pip install -r requirements-api.txt`**, **`npm install`** (workspaces), then start **API + Vite**. Requires **Node.js** + **Python 3.11+ (64-bit)** on `PATH` (`py` / `python`).

**Manual path** (if you prefer separate steps): create venv, `pip install -r requirements-api.txt`, `npm install`, then **`npm run dev`**.

`npm run dev` uses **`./venv/.../python`** for the API when that venv exists. Override with env **`COLLAT_PYTHON`**.

Open **http://localhost:5173** (frontend). API: **http://localhost:8000** (Swagger: **/docs**).

**macOS / Linux / Git Bash:**

```bash
chmod +x run.sh
npm start
```

(or **`./run.sh web`** if you only want the stack and already ran **`npm install`** + venv pip once.)

**Fast restarts** (deps already installed):

```bash
npm run dev
```

Inference still needs pre-trained artefacts under **`models/*.joblib`** at the repo root. If they are missing, the API starts but valuation returns **503** until you add models or run training locally.

If `pip` tries to **compile NumPy/Pandas** and fails with a **GCC** error, use **64-bit Python 3.11 or 3.12** and a fresh venv.

---

### Full development: training, Streamlit, scrapers

```powershell
pip install -r requirements.txt
# or
./run.sh install
```

Then train, API, and Streamlit as below.

### Train models

```bash
./run.sh train
# This runs:
#   → dataset_generator.py  (generates 200K records across 8 cities)
#   → training_pipeline.py  (trains Value + Liquidity + Fraud engines)
# Takes ~10-20 minutes on CPU, ~3-5 minutes with GPU
```

### Start the API only

```bash
./run.sh api
# FastAPI at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

`model_dir`, `data/`, and `logs/` are resolved from the **repository root** (next to `src/`), so you can run uvicorn from `src/`; artefacts should live in **`models/*.joblib`** at the repo root.

### Start the Streamlit dashboard

```bash
# New terminal
./run.sh ui
# Streamlit at http://localhost:8501
```

### Quick demo (CLI)

```bash
./run.sh demo
# Tests inference on a sample property (needs models in models/)
```

---

## 📡 API Reference

### `POST /valuate` — Single Property

```json
{
  "city": "Mumbai",
  "zone": "Western Suburbs",
  "locality": "Bandra",
  "property_type": "Apartment",
  "sub_type": "3BHK",
  "area_sqft": 1200,
  "age_years": 5,
  "floor_number": 15,
  "total_floors": 28,
  "bedrooms": 3,
  "bathrooms": 3,
  "parking_slots": 2,
  "lift_available": true,
  "rera_registered": true
}
```

**Response includes:**
- `market_value` — P10/P50/P90 price range
- `distress_value` — SARFAESI liquidation floor
- `liquidity` — RPI score (0–100) + Time-to-Liquidate
- `fraud_risk` — probability + rule flags
- `confidence` — Grade A/B/C/D
- `underwriting` — eligible LTV + max safe loan amount
- `shap_value_drivers` — top feature attributions

### `POST /valuate/batch` — Up to 50 Properties

```json
{
  "properties": [...],
  "include_shap": false
}
```

### `GET /cities` — List all cities
### `GET /zones/{city}` — List zones for a city
### `GET /localities/{city}/{zone}` — List localities

---

## 🤖 ML Architecture

### Value Engine
- **Model**: XGBoost (n=1500) + Quantile regression (P10/P90) + Conformal prediction
- **Features**: Location (50+) + Property (40+) + Market (20+) + Image (10) + Interactions (12)
- **Target**: MAPE < 12%

### Liquidity Engine
- **Model**: LightGBM ordinal regression (binary decomposition, K=4 classes)
- **Output**: Resale Potential Index (0–100) + Time-to-Liquidate label
- **Target**: Weighted F1 > 0.71

### Fraud Engine
- **Model**: Isolation Forest (n=300) + HBOS (if pyod available) + 10 deterministic rules
- **Rules**: Overvaluation, undervaluation, cap rate anomaly, area bounds, age bounds,
  floor inconsistency, listing vs circle rate, title risk, below circle rate, rental yield anomaly
- **Target**: FPR < 5%

### Image Pipeline (EfficientNet-B0)
- 8 visual signals: condition, natural light, renovation, view, facade,
  cleanliness, spaciousness, amenities
- Uses `timm` pretrained backbone — no fine-tuning required

---

## 🏙️ Supported Cities

| City | Tier | Base PSF | Zones |
|---|---|---|---|
| Mumbai | 1 | ₹18,500 | 7 |
| Delhi | 1 | ₹9,500 | 7 |
| Bangalore | 1 | ₹7,500 | 7 |
| Hyderabad | 2 | ₹6,200 | 7 |
| Pune | 2 | ₹6,800 | 7 |
| Chennai | 2 | ₹5,800 | 7 |
| Kolkata | 2 | ₹4,200 | 7 |
| Ahmedabad | 2 | ₹4,800 | 7 |

---

## ⚡ Performance Targets

| Metric | Target | Notes |
|---|---|---|
| Valuation MAPE | < 12% | P50 vs actual |
| Liquidity WF1 | > 0.71 | Weighted F1 across 4 TTL classes |
| Fraud FPR | < 5% | False positive rate |
| Inference latency | < 30s | Single property, CPU |
| API throughput | > 100 req/min | With model preload |

---

*Collat.AI v3 — TenzorX Hackathon 2026*
