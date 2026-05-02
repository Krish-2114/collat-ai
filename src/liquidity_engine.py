"""
liquidity_engine.py — Collat.AI v2
LightGBM Ordinal Regression → Resale Potential Index (0-100)
Target: Weighted F1 > 0.71
"""

import numpy as np
import pandas as pd
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import f1_score, classification_report
from sklearn.isotonic import IsotonicRegression
import shap, joblib, os, sys, warnings
warnings.filterwarnings("ignore")

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import LIGHTGBM_PARAMS, RANDOM_SEED, APP_CONFIG


class OrdinalLightGBM:
    """Binary decomposition ordinal regression for K=4 classes."""
    def __init__(self, params: dict):
        self.params = {**params}
        self.models_ = {}
        self.thresholds_ = [0, 1, 2]
        self.fitted = False

    def fit(self, X_train, y_train, X_val=None, y_val=None):
        for thr in self.thresholds_:
            y_bin = (y_train > thr).astype(int)
            p = {**self.params, "objective": "binary", "metric": "binary_logloss"}
            dtrain = lgb.Dataset(X_train, label=y_bin)
            cbs = [lgb.log_evaluation(-1)]
            if X_val is not None:
                y_val_bin = (y_val > thr).astype(int)
                dval = lgb.Dataset(X_val, label=y_val_bin, reference=dtrain)
                cbs = [lgb.early_stopping(50, verbose=False), lgb.log_evaluation(-1)]
                m = lgb.train(p, dtrain, valid_sets=[dval], callbacks=cbs,
                              num_boost_round=p.get("n_estimators", 1000))
            else:
                m = lgb.train(p, dtrain, callbacks=cbs,
                              num_boost_round=p.get("n_estimators", 1000))
            self.models_[thr] = m
        self.fitted = True
        return self

    def predict_proba(self, X) -> np.ndarray:
        cp = np.stack([self.models_[k].predict(X) for k in self.thresholds_], axis=1)
        cp = np.clip(cp, 1e-6, 1 - 1e-6)
        proba = np.zeros((len(X), 4))
        proba[:, 0] = 1 - cp[:, 0]
        proba[:, 1] = cp[:, 0] - cp[:, 1]
        proba[:, 2] = cp[:, 1] - cp[:, 2]
        proba[:, 3] = cp[:, 2]
        proba = np.clip(proba, 0, 1)
        proba /= proba.sum(axis=1, keepdims=True)
        return proba

    def predict(self, X) -> np.ndarray:
        return np.argmax(self.predict_proba(X), axis=1)


class RPICalibrator:
    def __init__(self):
        self.iso = IsotonicRegression(increasing=True, out_of_bounds="clip")
        self.fitted = False

    def fit(self, proba: np.ndarray, dom_days: np.ndarray):
        rpi_proxy = proba[:, 0] * 100 + proba[:, 1] * 50 + proba[:, 2] * 20
        rpi_true = np.clip(100 - np.log1p(dom_days) * 10, 5, 98)
        self.iso.fit(rpi_proxy, rpi_true)
        self.fitted = True
        return self

    def transform(self, proba: np.ndarray) -> np.ndarray:
        rpi_proxy = proba[:, 0] * 100 + proba[:, 1] * 50 + proba[:, 2] * 20
        if self.fitted:
            return np.clip(self.iso.predict(rpi_proxy), 5, 98)
        return np.clip(rpi_proxy, 5, 98)


class LiquidityEngine:
    TTL_LABELS = ["0-30 days", "31-90 days", "91-180 days", "180+ days"]
    TTL_MIDPOINTS = np.array([15, 60, 135, 240])

    def __init__(self):
        self.ordinal_model = OrdinalLightGBM(LIGHTGBM_PARAMS)
        self.rpi_calibrator = RPICalibrator()
        self.explainer = None
        self.feature_names_ = []
        self.fitted = False
        self.training_metrics = {}

    def fit(self, X_train: pd.DataFrame, y_train: np.ndarray,
            X_val: pd.DataFrame, y_val: np.ndarray,
            dom_train: np.ndarray = None):
        self.feature_names_ = list(X_train.columns)
        X_tr = X_train.values.astype(np.float32)
        X_vl = X_val.values.astype(np.float32)
        y_tr = y_train.astype(int)
        y_vl = y_val.astype(int)

        print("  [LiquidityEngine] Training Ordinal LightGBM...")
        self.ordinal_model.fit(X_tr, y_tr, X_vl, y_vl)

        # Calibrate RPI
        if dom_train is not None:
            print("  [LiquidityEngine] Calibrating RPI...")
            train_proba = self.ordinal_model.predict_proba(X_tr)
            self.rpi_calibrator.fit(train_proba, dom_train)

        # Evaluate
        y_pred = self.ordinal_model.predict(X_vl)
        wf1 = f1_score(y_vl, y_pred, average="weighted")
        self.training_metrics = {
            "weighted_f1": wf1,
            "report": classification_report(y_vl, y_pred,
                       target_names=self.TTL_LABELS, zero_division=0),
        }
        print(f"  [LiquidityEngine] Val WF1: {wf1:.4f} (target >0.71)")

        try:
            self.explainer = shap.TreeExplainer(self.ordinal_model.models_[0])
        except Exception:
            pass

        self.fitted = True
        return self

    def predict(self, X: pd.DataFrame) -> dict:
        assert self.fitted
        for col in self.feature_names_:
            if col not in X.columns:
                X = X.copy(); X[col] = 0.0
        Xv = X[self.feature_names_].fillna(0).values.astype(np.float32)
        proba = self.ordinal_model.predict_proba(Xv)
        y_pred = np.argmax(proba, axis=1)
        rpi = self.rpi_calibrator.transform(proba)
        expected_dom = (proba * self.TTL_MIDPOINTS).sum(axis=1)
        exit_90d = proba[:, 0] + proba[:, 1]
        return {
            "rpi_score": rpi.round(1),
            "liquidity_bucket": y_pred,
            "ttl_label": np.array([self.TTL_LABELS[b] for b in y_pred]),
            "expected_dom_days": expected_dom.round(0).astype(int),
            "exit_certainty_90d": exit_90d.round(3),
            "class_proba": proba.round(3),
            "liquidity_grade": np.where(
                rpi >= 80, "A", np.where(rpi >= 60, "B",
                np.where(rpi >= 40, "C", "D"))),
        }

    def save(self, path: str = None):
        path = path or os.path.join(APP_CONFIG.model_dir, "liquidity_engine.joblib")
        os.makedirs(os.path.dirname(path), exist_ok=True)
        joblib.dump({"ordinal_model": self.ordinal_model,
                     "rpi_calibrator": self.rpi_calibrator,
                     "feature_names": self.feature_names_,
                     "training_metrics": self.training_metrics}, path)
        print(f"[LiquidityEngine] Saved → {path}")

    @classmethod
    def load(cls, path: str = None):
        path = path or os.path.join(APP_CONFIG.model_dir, "liquidity_engine.joblib")
        d = joblib.load(path)
        e = cls()
        e.ordinal_model = d["ordinal_model"]
        e.rpi_calibrator = d["rpi_calibrator"]
        e.feature_names_ = d["feature_names"]
        e.training_metrics = d["training_metrics"]
        e.fitted = True
        return e
