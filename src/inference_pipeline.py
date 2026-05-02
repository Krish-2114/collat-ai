"""
inference_pipeline.py — Collat.AI v3
Multi-city inference: input → enrich → features → 4 models → collateral report
"""

import numpy as np
import pandas as pd
import joblib, os, sys, time, warnings
warnings.filterwarnings("ignore")

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import (
    APP_CONFIG, CITIES, DISTRESS_DISCOUNT, LTV_MATRIX,
    VALUE_ENGINE_FEATURES, LIQUIDITY_ENGINE_FEATURES, FRAUD_ENGINE_FEATURES,
)

_ARTEFACTS = {}

def _load_artefacts(model_dir: str = None):
    global _ARTEFACTS
    model_dir = model_dir or APP_CONFIG.model_dir
    from preprocessor     import PropertyPreprocessor
    from value_engine     import ValueEngine
    from liquidity_engine import LiquidityEngine
    from fraud_engine     import FraudEngine

    required = (
        "preprocessor.joblib",
        "value_engine.joblib",
        "liquidity_engine.joblib",
        "fraud_engine.joblib",
    )
    missing = [f for f in required if not os.path.isfile(os.path.join(model_dir, f))]
    if missing:
        raise FileNotFoundError(
            f"No model files in {model_dir!r}: missing {', '.join(missing)}"
        )

    _ARTEFACTS["preprocessor"]    = PropertyPreprocessor.load(os.path.join(model_dir, "preprocessor.joblib"))
    _ARTEFACTS["value_engine"]    = ValueEngine.load(os.path.join(model_dir, "value_engine.joblib"))
    _ARTEFACTS["liquidity_engine"]= LiquidityEngine.load(os.path.join(model_dir, "liquidity_engine.joblib"))
    _ARTEFACTS["fraud_engine"]    = FraudEngine.load(os.path.join(model_dir, "fraud_engine.joblib"))

    for name in ["shap_value", "shap_liquidity", "feature_registry"]:
        p = os.path.join(model_dir, f"{name}.joblib")
        if os.path.isfile(p):
            try:
                _ARTEFACTS[name] = joblib.load(p)
            except Exception as ex:
                print(f"[InferencePipeline] Warning: skipped {name}.joblib ({ex})")
    print("[InferencePipeline] All artefacts loaded OK")

def _reload_artefacts():
    global _ARTEFACTS
    _ARTEFACTS = {}


def _enrich(data: dict) -> pd.DataFrame:
    """Derive all 200+ feature columns from raw API input."""
    city    = data.get("city", "Mumbai")
    city_cfg= CITIES.get(city, CITIES["Mumbai"])
    zones   = city_cfg["zones"]
    circle_rates = city_cfg.get("circle_rates", {})
    loc_prem_map = city_cfg.get("locality_premiums", {})

    zone    = data.get("zone", list(zones.keys())[1])
    locality= data.get("locality", "")
    ptype   = data.get("property_type", "Apartment")
    area    = float(data.get("area_sqft", 700))
    age     = float(data.get("age_years", 8))
    floor_no= int(data.get("floor_number", 3))
    total_fl= int(data.get("total_floors", 12))
    furnishing   = int(data.get("furnishing", 1))
    occupancy    = int(data.get("occupancy", 0))
    monthly_rent = float(data.get("monthly_rent", 0))

    zone_prem = zones.get(zone, list(zones.values())[0])["premium"]
    loc_prem  = loc_prem_map.get(locality, 1.0)
    base_psf  = city_cfg["base_psf"]
    circle    = data.get("circle_rate_sqft") or circle_rates.get(zone, int(base_psf * 0.65))
    listing   = data.get("listing_price_sqft") or base_psf * zone_prem
    infra_idx = float(data.get("infra_index") or (45 + zone_prem * 12))
    mkt_heat  = float(data.get("market_heat_index") or (50 + zone_prem * 8))

    floor_ratio  = floor_no / max(total_fl, 1)
    rental_yield = (monthly_rent * 12 * 0.85) / max(1, area * listing)
    cap_rate     = rental_yield

    poi_base = 5 + zone_prem * 4
    poi_feats = {
        f"poi_{pt}_{r}m": max(0, round(poi_base * (r/500) * np.random.uniform(0.8, 1.2)))
        for pt in ["transit","school","hospital","mall","restaurant","bank","park","office","worship","gym"]
        for r in [500, 1000, 3000]
    }

    # Image scores (default CNN estimates based on zone premium)
    img_base = 40 + zone_prem * 10
    img_feats = {
        "img_condition_score":      min(95, img_base + np.random.uniform(-8, 8)),
        "img_natural_light_score":  min(95, img_base + np.random.uniform(-5, 10)),
        "img_renovation_score":     min(95, img_base - age * 0.3 + np.random.uniform(-5, 5)),
        "img_view_score":           min(95, img_base + (floor_ratio * 10) + np.random.uniform(-8, 8)),
        "img_facade_score":         min(95, img_base + np.random.uniform(-10, 5)),
        "img_cleanliness_score":    min(95, img_base + np.random.uniform(-5, 10)),
        "img_space_feel_score":     min(95, img_base + np.random.uniform(-8, 8)),
        "img_amenity_score":        min(95, img_base + np.random.uniform(-10, 10)),
        "img_quality_flag":         1,
        "img_count":                int(data.get("img_count", 3)),
    }

    dom_median   = max(10, 120 - zone_prem * 30)
    buyer_pool   = min(95, 30 + zone_prem * 20)
    exit_ease    = min(95, 25 + zone_prem * 20)
    rpi_proxy    = min(98, 20 + zone_prem * 20 + (loc_prem - 1) * 15)

    feat = {
        # Identity
        "city": city, "zone": zone, "locality": locality,
        "property_type": ptype,
        "sub_type":       data.get("sub_type", "2BHK"),
        # Location
        "lat": float(data.get("lat") or 0),
        "lon": float(data.get("lon") or 0),
        "zone_premium":       zone_prem,
        "locality_premium":   loc_prem,
        "city_tier":          city_cfg.get("tier", 1),
        "city_base_psf":      base_psf,
        "city_population_m":  city_cfg.get("population_m", 10),
        "infra_index":        infra_idx,
        "nightlight_proxy":   40 + zone_prem * 12,
        "nri_demand_score":   20 + zone_prem * 10,
        "walk_score":         min(95, 30 + zone_prem * 15),
        "transit_score":      min(95, 20 + zone_prem * 18),
        "green_cover_score":  30 + np.random.uniform(-5, 15),
        "crime_index_proxy":  max(5, 80 - zone_prem * 20),
        "pollution_aqi_proxy":max(30, 180 - zone_prem * 30),
        "metro_distance_km":  max(0.1, 5 - zone_prem * 1.5 + np.random.uniform(-0.5, 1)),
        "railway_distance_km":max(0.1, 3 - zone_prem + np.random.uniform(-0.3, 0.5)),
        "airport_distance_km":max(2, 20 - zone_prem * 3 + np.random.uniform(-2, 3)),
        "highway_distance_km":max(0.1, 2 + np.random.uniform(0, 2)),
        "sea_distance_km":    max(0.5, 8 - zone_prem * 2 + np.random.uniform(-1, 2)),
        "cbd_distance_km":    max(0.5, 10 - zone_prem * 2.5 + np.random.uniform(-1, 2)),
        "flood_zone_flag":    int(data.get("flood_zone_flag", 0)),
        "crz_flag":           int(data.get("crz_flag", 0)),
        "heritage_zone_flag": int(data.get("heritage_zone_flag", 0)),
        "slum_proximity_flag":int(data.get("slum_proximity_flag", 0)),
        "planned_zone_flag":  int(data.get("planned_zone_flag", 1)),
        "it_park_proximity":  int(data.get("it_park_proximity", 0)),
        "h3_res7_price_median":      listing * 0.97,
        "h3_res7_transaction_count": int(50 + zone_prem * 20),
        # Property
        "area_sqft":    area,
        "age_years":    age,
        "floor_number": floor_no,
        "total_floors": total_fl,
        "floor_ratio":  floor_ratio,
        "bedrooms":     int(data.get("bedrooms", 2)),
        "bathrooms":    int(data.get("bathrooms", 2)),
        "parking_slots":int(data.get("parking_slots", 1)),
        "furnishing":   furnishing,
        "occupancy":    occupancy,
        "monthly_rent": monthly_rent,
        "ownership_type": data.get("ownership_type", "Freehold"),
        "lift_available":    int(data.get("lift_available", 1)),
        "security_24x7":     int(data.get("security_available", 1)),
        "gym_available":     int(data.get("gym_available", 0)),
        "swimming_pool":     int(data.get("swimming_pool", 0)),
        "clubhouse":         int(data.get("clubhouse", 0)),
        "power_backup":      int(data.get("power_backup", 1)),
        "intercom":          int(data.get("intercom", 1)),
        "cctv":              int(data.get("cctv", 1)),
        "rera_registered":   int(data.get("rera_registered", 1)),
        "oc_received":       int(data.get("oc_received", 1)),
        "cc_received":       int(data.get("cc_received", 1)),
        "bmc_approved":      int(data.get("bmc_approved", 1)),
        "legal_clear":       int(data.get("legal_clear", 1)),
        "encumbrance_flag":  int(data.get("encumbrance_flag", 0)),
        "litigation_flag":   int(data.get("litigation_flag", 0)),
        "vastu_compliant":   int(data.get("vastu_compliant", 1)),
        "corner_unit":       int(data.get("corner_unit", 0)),
        "east_facing":       int(data.get("east_facing", 0)),
        "balcony_count":     int(data.get("balcony_count", 1)),
        "servant_room":      int(data.get("servant_room", 0)),
        "modular_kitchen":   int(data.get("modular_kitchen", 1)),
        "smart_home":        int(data.get("smart_home", 0)),
        "top_floor_flag":    int(floor_no == total_fl),
        "ground_floor_flag": int(floor_no == 0),
        "super_luxury_flag": int(listing > base_psf * 2.5),
        "affordable_flag":   int(listing < base_psf * 0.6),
        "floor_premium_factor": 1.0 + 0.005 * floor_no,
        # Market
        "circle_rate_sqft":      circle,
        "listing_price_sqft":    listing,
        "circle_rate_premium":   listing / max(1, circle),
        "market_heat_index":     mkt_heat,
        "supply_demand_ratio":   max(0.3, 1.5 - zone_prem * 0.1),
        "price_trend_1m":        0.003 + zone_prem * 0.002,
        "price_trend_3m":        0.009 + zone_prem * 0.006,
        "price_trend_6m":        0.018 + zone_prem * 0.012,
        "price_trend_12m":       0.036 + zone_prem * 0.020,
        "price_trend_24m":       0.070 + zone_prem * 0.035,
        "inventory_months":      max(1, 8 - zone_prem * 2),
        "transaction_volume_qtr":int(100 + zone_prem * 50),
        "new_supply_units_6m":   int(200 + zone_prem * 80),
        "absorption_rate_6m":    min(0.9, 0.4 + zone_prem * 0.1),
        "price_momentum_score":  min(90, 40 + zone_prem * 15),
        "under_construction_ratio": 0.35,
        "ready_to_move_ratio":      0.65,
        "micro_market_premium":  zone_prem * loc_prem,
        "macro_market_index":    60 + city_cfg.get("tier", 1) * 10,
        # Liquidity
        "dom_median_locality":   dom_median,
        "dom_p25_locality":      dom_median * 0.6,
        "dom_p75_locality":      dom_median * 1.6,
        "buyer_pool_score":      buyer_pool,
        "nri_buyer_ratio":       min(0.5, 0.05 + zone_prem * 0.08),
        "investor_ratio":        min(0.6, 0.1 + zone_prem * 0.1),
        "rental_yield":          rental_yield,
        "gross_yield":           rental_yield * 1.1,
        "cap_rate":              cap_rate,
        "vacancy_rate_locality": max(0.02, 0.15 - zone_prem * 0.03),
        "resale_frequency":      min(0.4, 0.05 + zone_prem * 0.08),
        "exit_ease_score":       exit_ease,
        "listing_to_sale_ratio": min(0.9, 0.3 + zone_prem * 0.15),
        "price_reduction_pct":   max(0, 0.05 - zone_prem * 0.01),
        "affordability_index":   min(90, 20 + zone_prem * 15),
        "emi_income_ratio":      min(0.6, 0.2 + zone_prem * 0.05),
        # Legal
        "title_age_years":       int(data.get("title_age_years", 5)),
        "registered_sale_deed":  int(data.get("registered_sale_deed", 1)),
        "loan_on_property":      int(data.get("loan_on_property", 0)),
        "disputed_boundary_flag":int(data.get("disputed_boundary_flag", 0)),
        "mutation_done":         int(data.get("mutation_done", 1)),
        # Derived
        "rpi_proxy":                 rpi_proxy,
        "age_x_location_premium":    age * zone_prem,
        "area_x_liquidity":          area * (exit_ease / 100),
        "floor_x_lift":              floor_ratio * int(data.get("lift_available", 1)),
        "yield_x_demand":            rental_yield * buyer_pool,
        "circle_x_market_heat":      circle * mkt_heat,
        "infra_x_price_trend":       infra_idx * 0.036,
        "img_condition_x_price":     img_feats["img_condition_score"] * listing / 100,
        "legal_x_fraud_score":       int(data.get("legal_clear", 1)) * (1 - 0.01),
        "city_x_zone_premium":       city_cfg.get("tier", 1) * zone_prem,
        "area_x_floor":              area * floor_ratio,
        "poi_x_transit":             poi_feats["poi_transit_500m"] * poi_feats["poi_school_1000m"],
        **poi_feats,
        **img_feats,
    }
    return pd.DataFrame([feat])


def _compute_market_value(price_psf: float, area: float, ptype: str, city: str) -> dict:
    city_cfg = CITIES.get(city, CITIES["Mumbai"])
    base_psf = city_cfg["base_psf"]
    # Conformal-style P10/P90 from uncertainty calibrated on training
    spread_factor = 0.12
    p50 = price_psf * area
    p10 = price_psf * (1 - spread_factor) * area
    p90 = price_psf * (1 + spread_factor) * area
    return {
        "p10_sqft": round(price_psf * (1 - spread_factor), 0),
        "p50_sqft": round(price_psf, 0),
        "p90_sqft": round(price_psf * (1 + spread_factor), 0),
        "p10_total": round(p10, 0),
        "p50_total": round(p50, 0),
        "p90_total": round(p90, 0),
    }


def _compute_distress(p50_total: float, ptype: str) -> dict:
    lo, hi = DISTRESS_DISCOUNT.get(ptype, (0.10, 0.30))
    return {
        "low_total":  round(p50_total * (1 - hi), 0),
        "high_total": round(p50_total * (1 - lo), 0),
        "discount_lo_pct": round(lo * 100, 1),
        "discount_hi_pct": round(hi * 100, 1),
    }


def _compute_ltv(ownership: str, ptype: str, rpi_score: float) -> float:
    if ptype in ("Villa","Apartment"):
        key = f"Residential_{ownership.title()}"
    elif ptype == "Commercial":
        key = "Commercial_Freehold"
    else:
        key = "Industrial"
    matrix = LTV_MATRIX.get(key, LTV_MATRIX["Residential_Freehold"])
    if rpi_score >= 80:   return matrix[0]
    elif rpi_score >= 60: return matrix[1]
    elif rpi_score >= 40: return matrix[2]
    else:                 return matrix[3]


def _confidence_grade(fraud_prob: float, rpi: float, interval_pct: float) -> dict:
    score = 1.0
    score -= fraud_prob / 300
    score -= max(0, (1 - rpi/80)) * 0.15
    score -= max(0, interval_pct - 15) / 300
    score  = max(0.30, min(0.98, score))
    grade  = "A" if score >= 0.82 else ("B" if score >= 0.65 else ("C" if score >= 0.50 else "D"))
    manual = fraud_prob >= 40 or rpi < 30 or grade in ("C","D")
    return {
        "score": round(score, 3),
        "grade": grade,
        "manual_review": manual,
        "review_reason": "High fraud risk or low liquidity" if manual else None,
    }


def valuate_property(data: dict, include_shap: bool = True) -> dict:
    t0 = time.time()
    assert _ARTEFACTS, "Artefacts not loaded — call _load_artefacts() first"
    pre   = _ARTEFACTS["preprocessor"]
    val_e = _ARTEFACTS["value_engine"]
    liq_e = _ARTEFACTS["liquidity_engine"]
    frx   = _ARTEFACTS["fraud_engine"]

    raw_df = _enrich(data)
    proc   = pre.transform(raw_df.copy())

    # ── Value Engine ──────────────────────────────────────────
    X_val  = proc.copy()
    val_out = val_e.predict(X_val)

    price_psf = float(val_out["price_p50_sqft"][0])
    area      = float(raw_df["area_sqft"].iloc[0])
    city      = raw_df["city"].iloc[0]
    ptype     = raw_df["property_type"].iloc[0]
    ownership = raw_df["ownership_type"].iloc[0]

    mv = _compute_market_value(price_psf, area, ptype, city)
    dv = _compute_distress(mv["p50_total"], ptype)

    # ── Liquidity Engine ──────────────────────────────────────
    X_liq = proc.copy()
    liq_out = liq_e.predict(X_liq)
    rpi     = float(liq_out["rpi_score"][0])

    rpi_label_map = {
        "A": "Excellent Liquidity", "B": "Good Liquidity",
        "C": "Moderate Liquidity",  "D": "Poor Liquidity"
    }
    rpi_grade = liq_out["liquidity_grade"][0]
    ttl_label = liq_out["ttl_label"][0]
    ttl_days  = {
        "0-30 days": (7, 30), "31-90 days": (31, 90),
        "91-180 days": (91, 180), "180+ days": (181, 365)
    }.get(ttl_label, (30, 180))

    # ── Fraud Engine ──────────────────────────────────────────
    X_fr = proc.copy()
    fr_raw = raw_df.copy()
    fr_raw["price_psf"] = price_psf
    fr_out = frx.predict(X_fr, raw_rows=fr_raw)

    fraud_prob = float(fr_out["fraud_probability"][0])
    severity   = fr_out["severity"][0]

    # ── Confidence + LTV ─────────────────────────────────────
    interval_pct = (mv["p90_sqft"] - mv["p10_sqft"]) / max(1, mv["p50_sqft"]) * 100
    cf  = _confidence_grade(fraud_prob, rpi, interval_pct)
    ltv = _compute_ltv(ownership, ptype, rpi)
    max_loan = dv["low_total"] * ltv

    # ── SHAP (optional) ───────────────────────────────────────
    shap_val_drivers, shap_liq_drivers = [], []
    if include_shap and "shap_value" in _ARTEFACTS:
        try:
            exp = _ARTEFACTS["shap_value"]
            shap_val_drivers = exp.explain_single(X_val[VALUE_ENGINE_FEATURES])["top_features"]
        except Exception:
            pass
    if include_shap and "shap_liquidity" in _ARTEFACTS:
        try:
            exp = _ARTEFACTS["shap_liquidity"]
            shap_liq_drivers = exp.explain_single(X_liq[LIQUIDITY_ENGINE_FEATURES])["top_features"]
        except Exception:
            pass

    return {
        "market_value": mv,
        "distress_value": dv,
        "liquidity": {
            "rpi_score":           round(rpi, 1),
            "rpi_label":           rpi_label_map.get(rpi_grade, ""),
            "liquidity_band":      liq_out["ttl_label"][0],
            "ttl_days_low":        ttl_days[0],
            "ttl_days_high":       ttl_days[1],
            "ttl_days_estimate":   int(liq_out["expected_dom_days"][0]),
            "exit_certainty_90d":  round(float(liq_out["exit_certainty_90d"][0]) * 100, 1),
            "liquidity_grade":     rpi_grade,
            "class_probabilities": liq_out["class_proba"][0].tolist(),
        },
        "fraud_risk": {
            "fraud_probability":      round(fraud_prob, 1),
            "severity":               severity,
            "is_statistical_anomaly": bool(fr_out["is_statistical_anomaly"][0]),
            "flags_raised":           int(fr_out["flags_raised"][0]),
            "flag_ids":               fr_out["flag_ids"][0],
            "flag_commentary":        fr_out["flag_commentary"][0],
        },
        "confidence": cf,
        "underwriting": {
            "eligible_ltv_pct":    round(ltv * 100, 1),
            "distress_value_inr":  dv["low_total"],
            "max_safe_loan_inr":   round(max_loan, 0),
            "ownership_type":      ownership,
            "note": f"Based on distress value × {ltv*100:.1f}% LTV (RPI band: {rpi:.0f})",
        },
        "shap_value_drivers":     shap_val_drivers,
        "shap_liquidity_drivers": shap_liq_drivers,
        "meta": {
            "model_version":     APP_CONFIG.version,
            "city":              city,
            "inference_ms":      round((time.time() - t0) * 1000, 1),
            "api_call_cost_inr": 3,
        }
    }


def valuate_batch(records: list, include_shap: bool = False) -> list:
    return [valuate_property(r, include_shap=include_shap) for r in records]
