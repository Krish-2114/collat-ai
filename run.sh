#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Collat.AI v3 — Master Run Script
# Usage:
#   ./run.sh train      → Generate dataset + train all models
#   ./run.sh api        → Start FastAPI server (port 8000)
#   ./run.sh ui         → Start Streamlit dashboard (port 8501)
#   ./run.sh all        → Train + API + UI (background)
#   ./run.sh web        → FastAPI (8000) + Vite React app (5173) — judge stack
#   ./run.sh demo       → Run demo inference without UI
#   ./run.sh scrape     → Run web scraper (demo mode)
#   ./run.sh install-api → pip install API-only deps (requirements-api.txt)
# ─────────────────────────────────────────────────────────────
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$ROOT/src"
export PYTHONPATH="$SRC:$PYTHONPATH"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

banner() {
  echo -e "${BLUE}"
  echo "  ╔══════════════════════════════════════════════╗"
  echo "  ║     🏙️  Collat.AI v3 — Multi-City AI          ║"
  echo "  ║   8 Cities · 200K+ Records · CNN Images       ║"
  echo "  ╚══════════════════════════════════════════════╝"
  echo -e "${NC}"
}

check_python() {
  if ! command -v python3 &>/dev/null; then
    echo -e "${RED}❌ Python 3 not found. Install Python 3.10+${NC}"
    exit 1
  fi
  echo -e "${GREEN}✅ Python: $(python3 --version)${NC}"
}

install_deps() {
  echo -e "${YELLOW}📦 Installing full Python dependencies (training, Streamlit, scrapers)...${NC}"
  pip install -r "$ROOT/requirements.txt" -q
  echo -e "${GREEN}✅ Full dependencies installed${NC}"
}

install_api_deps() {
  echo -e "${YELLOW}📦 Installing API-only dependencies (requirements-api.txt)...${NC}"
  pip install -r "$ROOT/requirements-api.txt" -q
  echo -e "${GREEN}✅ API dependencies installed${NC}"
}

cmd="${1:-help}"

banner
check_python

case "$cmd" in
  install)
    install_deps
    ;;

  install-api)
    install_api_deps
    ;;

  train)
    echo -e "${YELLOW}🚂 Starting training pipeline...${NC}"
    echo -e "  Step 1/3: Generating 200K dataset across 8 cities"
    python3 "$SRC/dataset_generator.py"
    echo -e "  Step 2/3: Training models (Value + Liquidity + Fraud)"
    python3 "$SRC/training_pipeline.py"
    echo -e "${GREEN}✅ Training complete! Models saved to models/${NC}"
    echo -e "   Run ${YELLOW}./run.sh api${NC} to start the API server."
    ;;

  api)
    echo -e "${YELLOW}🚀 Starting FastAPI server on http://0.0.0.0:8000${NC}"
    echo -e "   Swagger UI: ${BLUE}http://localhost:8000/docs${NC}"
    cd "$SRC"
    python3 -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload
    ;;

  ui)
    echo -e "${YELLOW}🖥️  Starting Streamlit dashboard on http://0.0.0.0:8501${NC}"
    cd "$SRC"
    streamlit run app.py --server.port 8501 --server.address 0.0.0.0
    ;;

  demo)
    echo -e "${YELLOW}🔮 Running demo inference...${NC}"
    cd "$SRC"
    python3 -c "
import sys
sys.path.insert(0, '.')
from inference_pipeline import _load_artefacts, valuate_property
import json
try:
    _load_artefacts()
    result = valuate_property({
        'city': 'Mumbai', 'zone': 'Western Suburbs', 'locality': 'Andheri',
        'property_type': 'Apartment', 'sub_type': '3BHK',
        'area_sqft': 1100, 'age_years': 5,
        'floor_number': 12, 'total_floors': 25,
        'bedrooms': 3, 'bathrooms': 3, 'parking_slots': 2,
        'lift_available': True, 'rera_registered': True
    })
    mv = result['market_value']
    print(f'Market Value (P50): ₹{mv[\"p50_total\"]/1e7:.2f} Cr')
    print(f'Price/sqft:         ₹{mv[\"p50_sqft\"]:,.0f}')
    print(f'RPI Score:          {result[\"liquidity\"][\"rpi_score\"]:.1f}/100')
    print(f'Fraud Risk:         {result[\"fraud_risk\"][\"fraud_probability\"]:.1f}%')
    print(f'Grade:              {result[\"confidence\"][\"grade\"]}')
    print(f'Max Safe Loan:      ₹{result[\"underwriting\"][\"max_safe_loan_inr\"]/1e7:.2f} Cr')
except Exception as e:
    print(f'Demo failed: {e}')
    print('Run ./run.sh train first to generate models.')
"
    ;;

  scrape)
    echo -e "${YELLOW}🕷️  Running web scraper (demo mode — no real HTTP)...${NC}"
    cd "$SRC"
    python3 -c "
import sys
sys.path.insert(0, '.')
from web_scraper import PropertyScraper
s = PropertyScraper(demo_mode=True)
listings = s.scrape_city('Mumbai', max_listings=20)
print(f'Scraped {len(listings)} listings from Mumbai (demo mode)')
if listings:
    print('Sample:', listings[0])
"
    ;;

  all)
    echo -e "${YELLOW}🏁 Running full pipeline: train → api → ui${NC}"
    bash "$0" train
    echo -e "${YELLOW}Starting API in background...${NC}"
    cd "$SRC" && python3 -m uvicorn api:app --host 0.0.0.0 --port 8000 &
    API_PID=$!
    sleep 3
    echo -e "${GREEN}✅ API running (PID $API_PID)${NC}"
    echo -e "${YELLOW}Starting Streamlit UI...${NC}"
    streamlit run "$SRC/app.py" --server.port 8501 --server.address 0.0.0.0
    ;;

  web|stack|desktop)
    echo -e "${YELLOW}🌐 FastAPI + Vite — same as ${BLUE}npm start${NC} (venv + pip + npm if needed)"
    echo -e "   API:       ${BLUE}http://localhost:8000${NC} (Swagger: /docs)"
    echo -e "   Frontend:  ${BLUE}http://localhost:5173${NC}"
    if ! command -v npm &>/dev/null; then
      echo -e "${RED}❌ npm not found. Install Node.js LTS.${NC}"
      exit 1
    fi
    cd "$ROOT" && npm start
    ;;

  help|*)
    echo -e "${GREEN}Available commands:${NC}"
    echo "  ./run.sh install      — Install full Python deps (requirements.txt)"
    echo "  ./run.sh install-api  — Install API-only deps (requirements-api.txt, for judges / inference)"
    echo "  ./run.sh train    — Generate 200K dataset + train all models"
    echo "  ./run.sh api      — Start FastAPI server (http://localhost:8000)"
    echo "  ./run.sh ui       — Start Streamlit dashboard (http://localhost:8501)"
    echo "  ./run.sh demo     — Run a quick demo inference"
    echo "  ./run.sh scrape   — Demo the web scraper"
    echo "  ./run.sh all      — Train + launch both servers"
    echo "  ./run.sh web      — Same as npm start (one-shot bootstrap + dev stack)"
    echo ""
    echo -e "${YELLOW}Quick Start (judges / one command):${NC}"
    echo "  npm start                             # venv + pip + npm + API + Vite"
    echo "  ./run.sh web                          # same as npm start"
    echo ""
    echo -e "${YELLOW}Quick Start (training + Streamlit):${NC}"
    echo "  pip install -r requirements.txt"
    echo "  ./run.sh train && ./run.sh api        # Terminal 1"
    echo "  ./run.sh ui                           # Terminal 2"
    ;;
esac
