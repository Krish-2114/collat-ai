"""
training_pipeline.py — Collat.AI v3
Full end-to-end training orchestrator:
  1. Web scraping (optional, with fallback)
  2. 200K dataset generation (8 cities + image features)
  3. Preprocessing + split
  4. Value Engine (XGBoost + Conformal)
  5. Liquidity Engine (Ordinal LightGBM + RPI Calibration)
  6. Fraud Engine (Isolation Forest + 8 rules)
  7. SHAP Explainers
  8. Model evaluation
  9. Artefact save

Run:
  python training_pipeline.py                    # full 200K
  python training_pipeline.py --fast             # 20K fast mode
  python training_pipeline.py --scrape           # enable web scraping
  python training_pipeline.py --n 50000          # custom sample size
"""

import os, sys, time, joblib, argparse, logging
import numpy as np
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import (
    APP_CONFIG, DATA_CONFIG, RANDOM_SEED,
    VALUE_ENGINE_FEATURES, LIQUIDITY_ENGINE_FEATURES,
    FRAUD_ENGINE_FEATURES, CITIES,
)
from dataset_generator import generate_dataset
from preprocessor    import PropertyPreprocessor, split_dataset, build_feature_matrix
from value_engine    import ValueEngine
from liquidity_engine import LiquidityEngine
from fraud_engine    import FraudEngine
from explainability  import CollatExplainer

# Setup logging
os.makedirs(APP_CONFIG.log_dir, exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(message)s",
    handlers=[
        logging.FileHandler(os.path.join(APP_CONFIG.log_dir, "training.log")),
        logging.StreamHandler(sys.stdout),
    ]
)
log = logging.getLogger("collat_ai.training")


# ──────────────────────────────────────────────────────────────
# HELPERS
# ──────────────────────────────────────────────────────────────

class _Timer:
    def __init__(self, name):
        self.name = name
    def __enter__(self):
        self.t = time.time()
        log.info(f"\n{'═'*60}\n  [{self.name}] Starting...\n{'═'*60}")
        return self
    def __exit__(self, *_):
        elapsed = round(time.time() - self.t, 1)
        log.info(f"  [{self.name}] Completed OK in {elapsed}s\n")


def _resolve_features(df: pd.DataFrame, base_list: list) -> list:
    """Map base feature names → encoded counterparts if they exist."""
    result = []
    for f in base_list:
        enc = f"{f}_encoded"
        if enc in df.columns:
            result.append(enc)
        elif f in df.columns:
            result.append(f)
    return list(dict.fromkeys(result))   # deduplicate, preserve order


def _eval_metrics(name, model, X_test, y_test) -> dict:
    """Compute and print model evaluation metrics."""
    from sklearn.metrics import (
        mean_absolute_percentage_error, f1_score, accuracy_score,
        precision_score, recall_score
    )
    metrics = {}
    if name == "value":
        preds = model.predict(X_test)
        p50   = np.expm1(model.xgb_model.predict(X_test.values.astype(np.float32))) if hasattr(model, 'xgb_model') else preds["price_p50_sqft"]
        mape  = mean_absolute_percentage_error(y_test, preds["price_p50_sqft"]) * 100
        metrics = {"test_mape_%": round(mape, 2),
                   "target_met": mape < 12,
                   "status": "✅" if mape < 12 else "❌"}
        log.info(f"  [ValueEngine] Test MAPE: {mape:.2f}% {'✅' if mape<12 else '❌ (target <12%)'}")

    elif name == "liquidity":
        proba   = model.ordinal_model.predict_proba(X_test.values.astype(np.float32))
        y_pred  = np.argmax(proba, axis=1)
        wf1     = f1_score(y_test, y_pred, average="weighted")
        acc     = accuracy_score(y_test, y_pred)
        metrics = {"test_weighted_f1": round(wf1, 4),
                   "test_accuracy_%": round(acc*100, 2),
                   "target_met": wf1 > 0.71,
                   "status": "✅" if wf1 > 0.71 else "❌"}
        log.info(f"  [LiquidityEngine] Test WF1: {wf1:.4f} {'✅' if wf1>0.71 else '❌ (target >0.71)'}")

    elif name == "fraud":
        scores  = model.iso_forest.decision_function(X_test.values.astype(np.float32))
        is_anom = model.iso_forest.predict(X_test.values.astype(np.float32)) == -1
        # FPR on anomaly labels vs true fraud
        tn = int(np.sum((~is_anom) & (y_test == 0)))
        fp = int(np.sum(is_anom   & (y_test == 0)))
        fpr = fp / max(1, tn + fp) * 100
        metrics = {"test_fpr_%": round(fpr, 2),
                   "target_met": fpr < 5,
                   "status": "✅" if fpr < 5 else "❌"}
        log.info(f"  [FraudEngine] Test FPR: {fpr:.2f}% {'✅' if fpr<5 else '❌ (target <5%)'}")

    return metrics


# ──────────────────────────────────────────────────────────────
# MAIN PIPELINE
# ──────────────────────────────────────────────────────────────

def run_training(
    n_samples:    int  = DATA_CONFIG.n_samples,
    data_path:    str  = None,
    save_dir:     str  = None,
    build_shap:   bool = True,
    fast:         bool = False,
    scrape:       bool = False,
    cities:       list = None,
):
    save_dir = save_dir or APP_CONFIG.model_dir
    os.makedirs(save_dir, exist_ok=True)
    all_metrics = {}

    if fast:
        n_samples = min(n_samples, 25_000)
        build_shap = False
        log.info(f"[Pipeline] ⚡ FAST MODE — {n_samples:,} samples, SHAP disabled")

    log.info(f"[Pipeline] Collat.AI v3 Training Start")
    log.info(f"[Pipeline] Samples={n_samples:,} | SHAP={build_shap} | Scrape={scrape}")

    # ── STEP 1: WEB SCRAPING (optional) ──────────────────────
    scraped_df = None
    if scrape:
        with _Timer("Web Scraping"):
            try:
                from web_scraper import RealEstateScraper
                scraper  = RealEstateScraper()
                city_list = cities or list(CITIES.keys())
                scraped_df = scraper.scrape_all_cities(
                    max_per_city=min(500, n_samples // len(city_list)),
                    cities=city_list,
                )
                log.info(f"Scraped {len(scraped_df):,} real listings")
                scraped_path = os.path.join(APP_CONFIG.data_dir, "scraped_listings.csv")
                scraped_df.to_csv(scraped_path, index=False)
            except Exception as e:
                log.warning(f"Scraping failed ({e}), proceeding without scraped data")
                scraped_df = None

    # ── STEP 2: DATASET GENERATION ───────────────────────────
    with _Timer("Dataset Generation"):
        if data_path and os.path.exists(data_path):
            log.info(f"Loading existing dataset from {data_path}")
            df_raw = pd.read_csv(data_path)
            if len(df_raw) > n_samples:
                df_raw = df_raw.sample(n=n_samples, random_state=RANDOM_SEED).reset_index(drop=True)
        else:
            df_raw = generate_dataset(
                n=n_samples,
                cities=cities,
                save_dir=APP_CONFIG.data_dir,
                scraped_df=scraped_df,
                verbose=True,
            )
        log.info(f"Dataset shape: {df_raw.shape} | Cities: {df_raw['city'].nunique()}")

    # ── STEP 3: TRAIN/VAL/TEST SPLIT ─────────────────────────
    with _Timer("Train/Val/Test Split"):
        # Stratify by city + property_type for balanced splits
        df_raw["strat_key"] = df_raw["city"] + "_" + df_raw["property_type"]
        train_raw, val_raw, test_raw = split_dataset(df_raw)
        log.info(f"Train: {len(train_raw):,} | Val: {len(val_raw):,} | Test: {len(test_raw):,}")

    # ── STEP 4: PREPROCESSING ────────────────────────────────
    with _Timer("Preprocessing"):
        pp = PropertyPreprocessor()
        train = pp.fit_transform(train_raw)
        val   = pp.transform(val_raw)
        test  = pp.transform(test_raw)
        pp_path = os.path.join(save_dir, "preprocessor.joblib")
        pp.save(pp_path)
        log.info(f"Preprocessor saved → {pp_path}")

    # ── STEP 5: VALUE ENGINE ──────────────────────────────────
    with _Timer("Value Engine (XGBoost + Conformal)"):
        ve_feats = _resolve_features(train, VALUE_ENGINE_FEATURES)
        X_tr_v   = build_feature_matrix(train, ve_feats)
        X_vl_v   = build_feature_matrix(val,   ve_feats)
        X_te_v   = build_feature_matrix(test,  ve_feats)
        y_tr_v   = train["price_psf"].values
        y_vl_v   = val["price_psf"].values
        y_te_v   = test["price_psf"].values

        ve = ValueEngine()
        ve.fit(X_tr_v, y_tr_v, X_vl_v, y_vl_v)
        ve.save(os.path.join(save_dir, "value_engine.joblib"))

        imp = ve.feature_importances
        imp.head(30).to_csv(os.path.join(save_dir, "value_feature_importance.csv"), index=False)
        log.info(f"Top 5 value drivers:\n{imp.head().to_string()}")
        all_metrics["value"] = _eval_metrics("value", ve, X_te_v, y_te_v)

    # ── STEP 6: LIQUIDITY ENGINE ──────────────────────────────
    with _Timer("Liquidity Engine (LightGBM Ordinal)"):
        le_feats = _resolve_features(train, LIQUIDITY_ENGINE_FEATURES)
        X_tr_l   = build_feature_matrix(train, le_feats)
        X_vl_l   = build_feature_matrix(val,   le_feats)
        X_te_l   = build_feature_matrix(test,  le_feats)
        y_tr_l   = train["ttl_bucket"].values.astype(int)
        y_vl_l   = val["ttl_bucket"].values.astype(int)
        y_te_l   = test["ttl_bucket"].values.astype(int)
        dom_tr   = train["dom_median_locality"].values if "dom_median_locality" in train.columns else None

        le = LiquidityEngine()
        le.fit(X_tr_l, y_tr_l, X_vl_l, y_vl_l, dom_train=dom_tr)
        le.save(os.path.join(save_dir, "liquidity_engine.joblib"))
        all_metrics["liquidity"] = _eval_metrics("liquidity", le, X_te_l, y_te_l)

    # ── STEP 7: FRAUD ENGINE ──────────────────────────────────
    with _Timer("Fraud Engine (Isolation Forest + 8 Rules)"):
        fe_feats = _resolve_features(train, FRAUD_ENGINE_FEATURES)
        X_tr_f   = build_feature_matrix(train, fe_feats)
        X_te_f   = build_feature_matrix(test,  fe_feats)
        city_med = float(train_raw["price_psf"].median()) if "price_psf" in train_raw.columns else 8000

        fe = FraudEngine()
        fe.fit(X_tr_f, city_medians=city_med)
        fe.save(os.path.join(save_dir, "fraud_engine.joblib"))
        y_te_fraud = test_raw["is_fraud"].values if "is_fraud" in test_raw.columns else np.zeros(len(X_te_f))
        all_metrics["fraud"] = _eval_metrics("fraud", fe, X_te_f, y_te_fraud)

    # ── STEP 8: SHAP EXPLAINERS ───────────────────────────────
    if build_shap:
        with _Timer("SHAP Explainers"):
            max_bg = 300 if not fast else 100

            shap_v = CollatExplainer(ve.xgb_model, list(X_tr_v.columns), "ValueEngine")
            shap_v.build(X_tr_v, max_bg=max_bg)
            joblib.dump(shap_v, os.path.join(save_dir, "shap_value.joblib"))

            shap_l = CollatExplainer(
                le.ordinal_model.models_[0], list(X_tr_l.columns), "LiquidityEngine"
            )
            shap_l.build(X_tr_l, max_bg=max_bg)
            joblib.dump(shap_l, os.path.join(save_dir, "shap_liquidity.joblib"))

            log.info("SHAP explainers built OK")

            # Sample explanation
            sample_expl = shap_v.explain(X_te_v.iloc[[0]])
            log.info(f"Sample SHAP explanation (top 3 value drivers):")
            for d in sample_expl.get("top_positive", [])[:3]:
                log.info(f"  + {d.get('display_name','?')}: {d.get('commentary','')[:60]}")

    # ── STEP 9: FEATURE REGISTRY + METADATA ──────────────────
    with _Timer("Saving Artefacts"):
        feat_reg = {
            "value_features":     list(X_tr_v.columns),
            "liquidity_features": list(X_tr_l.columns),
            "fraud_features":     list(X_tr_f.columns),
            "n_value_features":   len(X_tr_v.columns),
            "n_liquidity_features": len(X_tr_l.columns),
            "n_fraud_features":   len(X_tr_f.columns),
        }
        joblib.dump(feat_reg, os.path.join(save_dir, "feature_registry.joblib"))

        training_meta = {
            "version":     APP_CONFIG.version,
            "n_train":     len(train_raw),
            "n_val":       len(val_raw),
            "n_test":      len(test_raw),
            "cities":      list(df_raw["city"].unique()),
            "metrics":     all_metrics,
            "timestamp":   pd.Timestamp.now().isoformat(),
            "model_dir":   save_dir,
        }
        import json
        with open(os.path.join(save_dir, "training_meta.json"), "w") as f:
            json.dump(training_meta, f, indent=2, default=str)

    # ── FINAL SUMMARY ─────────────────────────────────────────
    log.info(f"\n{'█'*60}")
    log.info(f"  Collat.AI v3 — Training Complete")
    log.info(f"  Dataset: {len(df_raw):,} records across {df_raw['city'].nunique()} cities")
    log.info(f"  Value Engine MAPE:   {ve.training_metrics.get('val_mape', '?'):.2f}%  {all_metrics.get('value',{}).get('status','')}")
    log.info(f"  Liquidity Engine WF1:{le.training_metrics.get('weighted_f1', '?'):.4f}  {all_metrics.get('liquidity',{}).get('status','')}")
    log.info(f"  Fraud Engine FPR:    {all_metrics.get('fraud',{}).get('test_fpr_%','?')}%  {all_metrics.get('fraud',{}).get('status','')}")
    log.info(f"  Models saved → {save_dir}")
    log.info(f"{'█'*60}\n")

    return {
        "preprocessor": pp, "value_engine": ve,
        "liquidity_engine": le, "fraud_engine": fe,
        "metrics": all_metrics, "feature_registry": feat_reg,
    }


# ──────────────────────────────────────────────────────────────
# CLI
# ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Collat.AI v3 Training Pipeline")
    parser.add_argument("--n",         type=int,   default=DATA_CONFIG.n_samples,
                        help="Number of training samples (default 200K)")
    parser.add_argument("--data_path", type=str,   default=None,
                        help="Path to existing CSV (skip generation)")
    parser.add_argument("--save_dir",  type=str,   default=APP_CONFIG.model_dir)
    parser.add_argument("--fast",      action="store_true",
                        help="Fast mode: 25K samples, skip SHAP")
    parser.add_argument("--scrape",    action="store_true",
                        help="Enable web scraping for real listing data")
    parser.add_argument("--no_shap",   action="store_true",
                        help="Skip SHAP explainer build")
    parser.add_argument("--city",      type=str,   default=None,
                        help="Comma-separated cities or 'all'")
    args = parser.parse_args()

    cities = None
    if args.city and args.city != "all":
        cities = [c.strip() for c in args.city.split(",")]

    run_training(
        n_samples  = args.n,
        data_path  = args.data_path,
        save_dir   = args.save_dir,
        build_shap = not args.no_shap,
        fast       = args.fast,
        scrape     = args.scrape,
        cities     = cities,
    )
