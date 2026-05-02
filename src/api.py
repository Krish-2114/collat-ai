"""
api.py — Collat.AI v3 FastAPI Application
Endpoints: /health, /valuate, /valuate/batch, /cities, /zones/{city}, /localities/{city}/{zone}
Run: uvicorn api:app --host 0.0.0.0 --port 8000 --reload
"""

import os, sys, time, logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import uvicorn

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import APP_CONFIG, CITIES
from schemas import ValuationRequest, BatchValuationRequest, HealthResponse
from inference_pipeline import valuate_property, valuate_batch, _load_artefacts, _reload_artefacts

logging.basicConfig(level=getattr(logging, APP_CONFIG.log_level),
                    format="%(asctime)s | %(levelname)-8s | %(message)s")
log = logging.getLogger("collat_ai.api")
_START = time.time()
_READY = False
_LOAD_ERROR: str | None = None
_MAX_LOAD_ERR = 400


def _format_load_error(exc: BaseException) -> str:
    msg = f"{type(exc).__name__}: {exc}"
    return msg if len(msg) <= _MAX_LOAD_ERR else msg[: _MAX_LOAD_ERR - 3] + "..."


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _READY, _LOAD_ERROR
    log.info("Collat.AI v3 starting...")
    _LOAD_ERROR = None
    try:
        _load_artefacts(APP_CONFIG.model_dir)
        _READY = True
        log.info("All models loaded OK")
    except Exception as e:
        _READY = False
        _LOAD_ERROR = _format_load_error(e)
        log.warning("Models not loaded: %s", e, exc_info=True)
    yield
    log.info("Shutting down.")


app = FastAPI(
    title=APP_CONFIG.title,
    version=APP_CONFIG.version,
    description="""
## Collat.AI v3 — Multi-City Indian Real Estate Intelligence

AI-powered collateral valuation covering **8 major Indian cities**:

- **200K+ training records** across Mumbai, Delhi, Bangalore, Hyderabad, Pune, Chennai, Kolkata, Ahmedabad
- **P10/P50/P90 Market Value** with conformal prediction intervals
- **Resale Potential Index** (0–100) + Time-to-Liquidate estimate
- **10-Rule Fraud Detection** + Isolation Forest anomaly scoring
- **CNN Image Feature Pipeline** (EfficientNet-B0, 8 visual signals)
- **SHAP Explainability** — every output justified
- **Direct LTV Output** — underwriting-ready in <30 seconds
    """,
    lifespan=lifespan,
)

app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_methods=["*"], allow_headers=["*"])


@app.middleware("http")
async def timing_middleware(request: Request, call_next):
    t0 = time.time()
    resp = await call_next(request)
    resp.headers["X-Response-Time-Ms"] = str(round((time.time() - t0) * 1000, 1))
    return resp


def _safe(obj):
    if isinstance(obj, dict):       return {k: _safe(v) for k, v in obj.items()}
    if isinstance(obj, list):       return [_safe(v) for v in obj]
    if isinstance(obj, np.integer): return int(obj)
    if isinstance(obj, np.floating):return float(obj)
    if isinstance(obj, np.ndarray): return obj.tolist()
    if isinstance(obj, np.bool_):   return bool(obj)
    return obj


# ── Health ────────────────────────────────────────────────────
@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health():
    return HealthResponse(
        status="ok" if _READY else "degraded",
        model_version=APP_CONFIG.version,
        models_loaded=_READY,
        uptime_s=round(time.time() - _START, 1),
        load_error=None if _READY else _LOAD_ERROR,
    )


# ── Reference ─────────────────────────────────────────────────
@app.get("/cities", tags=["Reference"])
async def list_cities():
    return {
        "cities": list(CITIES.keys()),
        "city_info": {
            city: {"tier": cfg.get("tier"), "base_psf": cfg.get("base_psf"),
                   "population_m": cfg.get("population_m")}
            for city, cfg in CITIES.items()
        }
    }


@app.get("/zones/{city}", tags=["Reference"])
async def list_zones(city: str):
    if city not in CITIES:
        raise HTTPException(status_code=404, detail=f"City '{city}' not found. Available: {list(CITIES.keys())}")
    zones = CITIES[city]["zones"]
    return {
        "city": city,
        "zones": list(zones.keys()),
        "zone_premiums": {z: v["premium"] for z, v in zones.items()}
    }


@app.get("/localities/{city}/{zone}", tags=["Reference"])
async def list_localities(city: str, zone: str):
    if city not in CITIES:
        raise HTTPException(status_code=404, detail=f"City '{city}' not found")
    locs = CITIES[city].get("localities", {}).get(zone, [])
    if not locs:
        raise HTTPException(status_code=404, detail=f"Zone '{zone}' not found in {city}")
    return {"city": city, "zone": zone, "localities": locs}


# ── Valuation ─────────────────────────────────────────────────
@app.post("/valuate", tags=["Valuation"],
          summary="Single property collateral valuation")
async def valuate(request: ValuationRequest):
    """
    Full AI collateral intelligence report:
    - Market value P10/P50/P90 with conformal prediction
    - Distress value (SARFAESI liquidation floor)
    - Resale Potential Index + Time-to-Liquidate
    - 10-rule fraud detection + statistical anomaly score
    - CNN image quality signals
    - Confidence grade (A/B/C/D) + LTV recommendation
    - Max safe loan amount
    - SHAP feature attribution drivers
    """
    if not _READY:
        raise HTTPException(status_code=503,
                            detail="Models not loaded. Run: python src/training_pipeline.py")
    payload = request.model_dump(mode="json")
    result  = valuate_property(payload, include_shap=True)
    return _safe(result)


@app.post("/valuate/batch", tags=["Valuation"],
          summary="Batch valuation (up to 50 properties)")
async def batch_valuate(request: BatchValuationRequest):
    if not _READY:
        raise HTTPException(status_code=503, detail="Models not loaded")
    payloads = [r.model_dump(mode="json") for r in request.properties]
    results  = valuate_batch(payloads, include_shap=request.include_shap)
    return {"count": len(results), "results": _safe(results)}


@app.post("/reload", tags=["System"])
async def reload_models():
    global _READY, _LOAD_ERROR
    _reload_artefacts()
    _LOAD_ERROR = None
    try:
        _load_artefacts(APP_CONFIG.model_dir)
        _READY = True
        return {"status": "ok", "message": "Models reloaded successfully"}
    except Exception as e:
        _READY = False
        _LOAD_ERROR = _format_load_error(e)
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("api:app", host=APP_CONFIG.api_host, port=APP_CONFIG.api_port,
                reload=False, log_level=APP_CONFIG.log_level.lower())
