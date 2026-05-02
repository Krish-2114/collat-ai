"""
explainability.py — Collat.AI v2
SHAP-based feature attribution + natural language commentary
"""

import numpy as np
import pandas as pd
import shap
from typing import Dict, List
import warnings, os, sys
warnings.filterwarnings("ignore")

FEATURE_DISPLAY = {
    "infra_index": "Infrastructure Quality", "zone_premium": "Zone Premium",
    "locality_premium": "Locality Premium", "metro_distance_km": "Metro Distance",
    "sea_distance_km": "Sea/Coastal Distance", "market_heat_index": "Market Heat Index",
    "listing_price_sqft": "Listing Price/sqft", "circle_rate_sqft": "Circle Rate/sqft",
    "price_trend_6m": "6-Month Price Trend", "price_trend_12m": "12-Month Trend",
    "area_sqft": "Property Area", "age_years": "Building Age",
    "floor_ratio": "Floor Position", "img_condition_score": "Photo: Condition",
    "img_view_score": "Photo: View Quality", "img_renovation_score": "Photo: Renovation",
    "dom_median_locality": "Median Days on Market", "buyer_pool_score": "Buyer Pool",
    "exit_ease_score": "Exit Ease", "rental_yield": "Rental Yield",
    "rera_registered": "RERA Registered", "legal_clear": "Legal Title Clear",
    "flood_zone_flag": "Flood Zone Risk", "crz_flag": "CRZ Restriction",
    "nri_demand_score": "NRI Demand Score", "walk_score": "Walk Score",
    "it_park_proximity": "IT Park Proximity",
}

def _display(col: str) -> str:
    return FEATURE_DISPLAY.get(col, col.replace("_", " ").title())

def _commentary(feature: str, shap_val: float, feat_val: float) -> str:
    direction = "boosts" if shap_val > 0 else "reduces"
    templates = {
        "infra_index": f"Infrastructure quality ({feat_val:.0f}/100) {direction} value.",
        "metro_distance_km": f"Metro distance ({feat_val:.1f}km) {direction} value.",
        "age_years": (f"New building (age {feat_val:.0f}yr) is positive."
                      if shap_val > 0 else f"Older building ({feat_val:.0f}yr) — depreciation risk."),
        "market_heat_index": f"Market demand ({feat_val:.0f}/100) {direction} valuation.",
        "img_condition_score": f"Property condition score ({feat_val:.0f}/100) {direction} value.",
        "img_view_score": f"View quality ({feat_val:.0f}/100) {direction} premium.",
        "legal_clear": ("Clear title — no encumbrance." if feat_val == 1 else "Title unclear — legal risk."),
        "flood_zone_flag": ("No flood risk." if feat_val == 0 else "Flood zone — discount applied."),
        "crz_flag": ("No CRZ restriction." if feat_val == 0 else "CRZ zone — development limited."),
        "rental_yield": f"Rental yield ({feat_val*100:.1f}%) {direction} income valuation.",
        "rera_registered": ("RERA registered — compliance positive." if feat_val == 1 else "No RERA — higher risk."),
        "nri_demand_score": f"NRI demand ({feat_val:.0f}/100) {direction} exit liquidity.",
    }
    if feature in templates:
        return templates[feature]
    return f"{_display(feature)} ({feat_val:.2f}) {direction} the valuation."


class CollatExplainer:
    def __init__(self, model, feature_names: List[str], model_name: str = "model"):
        self.model = model
        self.feature_names = feature_names
        self.model_name = model_name
        self._explainer = None

    def build(self, background_X: pd.DataFrame, max_bg: int = 300):
        n = min(max_bg, len(background_X))
        bg = background_X[self.feature_names].fillna(0).sample(n=n, random_state=42)
        print(f"  [SHAP] Building TreeExplainer for {self.model_name}...")
        self._explainer = shap.TreeExplainer(self.model, bg)
        return self

    def explain_batch(self, X: pd.DataFrame, top_n: int = 5) -> List[Dict]:
        assert self._explainer is not None
        Xc = X[self.feature_names].fillna(0)
        sv = self._explainer.shap_values(Xc)
        if isinstance(sv, list):
            sv = sv[1] if len(sv) > 1 else sv[0]
        explanations = []
        for i in range(len(Xc)):
            row_sv = sv[i]
            row_vals = Xc.iloc[i]
            sorted_idx = np.argsort(np.abs(row_sv))[::-1][:top_n * 2]
            pos_drivers, neg_drivers = [], []
            for idx in sorted_idx:
                fn = self.feature_names[idx]
                sv_val = float(row_sv[idx])
                fv = float(row_vals.iloc[idx])
                entry = {"feature": fn, "display_name": _display(fn),
                         "shap_value": round(sv_val, 4), "feature_value": round(fv, 3),
                         "direction": "positive" if sv_val > 0 else "negative",
                         "commentary": _commentary(fn, sv_val, fv)}
                (pos_drivers if sv_val > 0 else neg_drivers).append(entry)
            explanations.append({
                "value_drivers_positive": pos_drivers[:top_n],
                "value_drivers_negative": neg_drivers[:top_n],
                "top_features": (pos_drivers + neg_drivers)[:top_n],
            })
        return explanations

    def explain_single(self, X: pd.DataFrame, top_n: int = 5) -> Dict:
        return self.explain_batch(X, top_n)[0]
