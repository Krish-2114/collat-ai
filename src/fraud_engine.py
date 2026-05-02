"""
fraud_engine.py — Collat.AI v3
Isolation Forest + 10 deterministic rules (multi-city aware)
Target: False Positive Rate < 5%
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib, os, sys, warnings
warnings.filterwarnings("ignore")

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import RANDOM_SEED, APP_CONFIG, CITIES

try:
    from pyod.models.hbos import HBOS
    PYOD_AVAILABLE = True
except ImportError:
    PYOD_AVAILABLE = False

FRAUD_RULES = {
    "R01": "price_psf > 3× city median (overvaluation)",
    "R02": "price_psf < 0.3× city median (undervaluation / distress)",
    "R03": "cap_rate > 12% (anomalous yield)",
    "R04": "area_sqft < 100 or > 50,000",
    "R05": "age_years outside valid range (0-100)",
    "R06": "floor_number > total_floors (data inconsistency)",
    "R07": "listing_price > 2× circle_rate (needs physical verification)",
    "R08": "legal_clear=0 + encumbrance/litigation flags (title risk)",
    "R09": "price_psf < 0.5× circle_rate (below government floor)",
    "R10": "rental_yield > 8% (anomalous rental income — verify)",
}

FRAUD_COMMENTARY = {
    "R01": "⚠️ Price/sqft exceeds 3× city median — potential overvaluation.",
    "R02": "⚠️ Price/sqft below 30% of city median — distressed or data error.",
    "R03": "⚠️ Cap rate > 12% — anomalous yield; verify rental income.",
    "R04": "⚠️ Property area outside valid range — data quality issue.",
    "R05": "⚠️ Building age outside valid range (0-100 years).",
    "R06": "⚠️ Floor number exceeds total floors — data inconsistency.",
    "R07": "⚠️ Listing price > 2× circle rate — physical inspection required.",
    "R08": "⚠️ Title unclear + encumbrance/litigation — legal review mandatory.",
    "R09": "⚠️ Price/sqft below 50% of government circle rate — stamp duty risk.",
    "R10": "⚠️ Rental yield > 8% — verify rental income documentation.",
}


def _get_city_median(city: str, preprocessor_medians) -> float:
    """Get city-specific PSF median for fraud thresholds."""
    if not isinstance(preprocessor_medians, dict):
        cfg = CITIES.get(city, {})
        return cfg.get("base_psf", 10000)
    if city and city in preprocessor_medians:
        return preprocessor_medians[city]
    if "all" in preprocessor_medians:
        return preprocessor_medians["all"]
    # Fallback: use config base_psf
    cfg = CITIES.get(city, {})
    return cfg.get("base_psf", 10000)


def _apply_rules(row: pd.Series, city_median: float) -> list:
    flags = []
    ppsf     = row.get("price_psf", row.get("listing_price_sqft", city_median))
    area     = row.get("area_sqft", 500)
    age      = row.get("age_years", 10)
    cap_rate = row.get("cap_rate", 0)
    rental_y = row.get("rental_yield", 0)
    legal    = row.get("legal_clear", 1)
    enc      = row.get("encumbrance_flag", 0)
    lit      = row.get("litigation_flag", 0)
    floor_no = row.get("floor_number", 1)
    total_fl = row.get("total_floors", 5)
    circle   = row.get("circle_rate_sqft", city_median * 0.6)
    listing  = row.get("listing_price_sqft", ppsf)

    if ppsf  > city_median * 3.0:            flags.append("R01")
    if ppsf  < city_median * 0.3:            flags.append("R02")
    if cap_rate > 0.12:                       flags.append("R03")
    if area < 100 or area > 50_000:           flags.append("R04")
    if age < 0 or age > 100:                  flags.append("R05")
    if floor_no > total_fl:                   flags.append("R06")
    if circle > 0 and listing > circle * 2.0: flags.append("R07")
    if legal == 0 and (enc == 1 or lit == 1): flags.append("R08")
    if circle > 0 and ppsf < circle * 0.5:   flags.append("R09")
    if rental_y > 0.08:                       flags.append("R10")
    return flags


class FraudEngine:
    def __init__(self):
        self.iso_forest = IsolationForest(
            n_estimators=300, contamination=0.05,
            random_state=RANDOM_SEED, n_jobs=-1
        )
        self.hbos = HBOS(contamination=0.05) if PYOD_AVAILABLE else None
        self.city_medians: dict = {}
        self.feature_names_: list = []
        self.fitted = False
        self.training_metrics: dict = {}

    def fit(self, X_train: pd.DataFrame, city_medians: dict = None):
        self.feature_names_ = list(X_train.columns)
        self.city_medians = city_medians or {}
        Xv = X_train.fillna(0).values.astype(np.float32)

        print("  [FraudEngine] Training Isolation Forest...")
        self.iso_forest.fit(Xv)

        if self.hbos is not None:
            try:
                print("  [FraudEngine] Training HBOS...")
                self.hbos.fit(Xv)
            except Exception as e:
                print(f"  [FraudEngine] HBOS failed: {e}")
                self.hbos = None

        scores = -self.iso_forest.score_samples(Xv)
        pct_anomaly = (self.iso_forest.predict(Xv) == -1).mean()
        self.training_metrics = {
            "anomaly_rate_train": round(float(pct_anomaly), 4),
            "iso_score_p50": round(float(np.percentile(scores, 50)), 4),
            "iso_score_p95": round(float(np.percentile(scores, 95)), 4),
        }
        print(f"  [FraudEngine] Anomaly rate: {pct_anomaly*100:.1f}%")
        self.fitted = True
        return self

    def predict(self, X: pd.DataFrame, raw_rows: pd.DataFrame = None) -> dict:
        assert self.fitted
        for col in self.feature_names_:
            if col not in X.columns:
                X = X.copy(); X[col] = 0.0
        Xv = X[self.feature_names_].fillna(0).values.astype(np.float32)

        iso_pred   = self.iso_forest.predict(Xv)           # -1 = anomaly
        iso_scores = -self.iso_forest.score_samples(Xv)    # higher = more anomalous

        # Normalise to 0-100 probability
        s_min, s_max = iso_scores.min(), iso_scores.max()
        if s_max > s_min:
            fraud_prob = (iso_scores - s_min) / (s_max - s_min) * 100
        else:
            fraud_prob = np.zeros(len(Xv))

        # HBOS ensemble if available
        if self.hbos is not None:
            try:
                hbos_prob = self.hbos.predict_proba(Xv)[:, 1] * 100
                fraud_prob = (fraud_prob * 0.6 + hbos_prob * 0.4)
            except Exception:
                pass

        # Deterministic rules on raw rows (if provided)
        all_flags, all_commentary = [], []
        if raw_rows is not None and len(raw_rows) == len(X):
            for i, (_, row) in enumerate(raw_rows.iterrows()):
                city = row.get("city", "Mumbai")
                med  = _get_city_median(city, self.city_medians)
                flags = _apply_rules(row, med)
                commentary = [{"flag_id": f, "rule": FRAUD_RULES[f],
                               "commentary": FRAUD_COMMENTARY[f]} for f in flags]
                all_flags.append(flags)
                all_commentary.append(commentary)
                # Boost fraud_prob based on rule hits
                if flags:
                    boost = min(30, len(flags) * 10)
                    fraud_prob[i] = min(99, fraud_prob[i] + boost)
        else:
            all_flags     = [[] for _ in range(len(X))]
            all_commentary= [[] for _ in range(len(X))]

        severity = np.where(fraud_prob >= 65, "High",
                   np.where(fraud_prob >= 35, "Medium", "Low"))

        return {
            "fraud_probability":       fraud_prob.round(1),
            "is_statistical_anomaly":  (iso_pred == -1),
            "severity":                severity,
            "flags_raised":            np.array([len(f) for f in all_flags]),
            "flag_ids":                all_flags,
            "flag_commentary":         all_commentary,
            "anomaly_score_raw":       iso_scores.round(4),
        }

    def save(self, path: str = None):
        path = path or os.path.join(APP_CONFIG.model_dir, "fraud_engine.joblib")
        os.makedirs(os.path.dirname(path), exist_ok=True)
        joblib.dump({
            "iso_forest":        self.iso_forest,
            "hbos":              self.hbos,
            "city_medians":      self.city_medians,
            "feature_names":     self.feature_names_,
            "training_metrics":  self.training_metrics,
        }, path)
        print(f"[FraudEngine] Saved → {path}")

    @classmethod
    def load(cls, path: str = None):
        path = path or os.path.join(APP_CONFIG.model_dir, "fraud_engine.joblib")
        d = joblib.load(path)
        e = cls()
        e.iso_forest        = d["iso_forest"]
        e.hbos              = d.get("hbos")
        e.city_medians      = d.get("city_medians", {})
        e.feature_names_    = d["feature_names"]
        e.training_metrics  = d.get("training_metrics", {})
        e.fitted = True
        return e
