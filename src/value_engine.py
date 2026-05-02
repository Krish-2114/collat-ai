"""
value_engine.py — Collat.AI v2
XGBoost + Quantile Regression + Conformal Prediction
P10/P50/P90 market value range for Mumbai properties
Target: MAPE < 12%
"""

import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_percentage_error
from sklearn.preprocessing import StandardScaler
import shap, joblib, os, sys, warnings
warnings.filterwarnings("ignore")

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import XGBOOST_PARAMS, CONFORMAL_ALPHA, RANDOM_SEED, APP_CONFIG


class ConformalPredictor:
    def __init__(self, alpha: float = CONFORMAL_ALPHA):
        self.alpha = alpha
        self.qhat = None

    def calibrate(self, y_cal: np.ndarray, y_pred_cal: np.ndarray):
        residuals = np.abs(y_cal - y_pred_cal)
        n = len(residuals)
        q_level = min(np.ceil((n + 1) * (1 - self.alpha)) / n, 1.0)
        self.qhat = np.quantile(residuals, q_level)
        return self

    def predict_interval(self, y_pred: np.ndarray):
        assert self.qhat is not None
        return y_pred - self.qhat, y_pred + self.qhat


class ValueEngine:
    def __init__(self):
        self.xgb_model = xgb.XGBRegressor(
            **XGBOOST_PARAMS, objective="reg:squarederror"
        )
        self.xgb_p10 = xgb.XGBRegressor(
            **{**XGBOOST_PARAMS, "n_estimators": 800},
            objective="reg:quantileerror", quantile_alpha=0.10
        )
        self.xgb_p90 = xgb.XGBRegressor(
            **{**XGBOOST_PARAMS, "n_estimators": 800},
            objective="reg:quantileerror", quantile_alpha=0.90
        )
        self.conformal = ConformalPredictor()
        self.explainer = None
        self.fitted = False
        self.feature_names_ = []
        self.n_features_ = 0
        self.training_metrics = {}

    def fit(self, X_train: pd.DataFrame, y_train: np.ndarray,
            X_val: pd.DataFrame, y_val: np.ndarray):
        self.feature_names_ = list(X_train.columns)
        self.n_features_ = len(self.feature_names_)

        X_tr = X_train.values.astype(np.float32)
        X_vl = X_val.values.astype(np.float32)

        # Log-transform target
        y_tr_log = np.log1p(y_train)
        y_vl_log = np.log1p(y_val)

        print("  [ValueEngine] Training P50 XGBoost...")
        self.xgb_model.fit(X_tr, y_tr_log,
                           eval_set=[(X_vl, y_vl_log)], verbose=False)

        print("  [ValueEngine] Training P10/P90 quantile models...")
        self.xgb_p10.fit(X_tr, y_tr_log,
                         eval_set=[(X_vl, y_vl_log)], verbose=False)
        self.xgb_p90.fit(X_tr, y_tr_log,
                         eval_set=[(X_vl, y_vl_log)], verbose=False)

        # Calibrate conformal
        X_cal, _, y_cal, _ = train_test_split(X_vl, y_vl_log, test_size=0.5,
                                               random_state=RANDOM_SEED)
        y_cal_pred = self.xgb_model.predict(X_cal)
        self.conformal.calibrate(y_cal, y_cal_pred)

        # SHAP
        try:
            self.explainer = shap.TreeExplainer(self.xgb_model)
        except Exception:
            pass

        # Metrics
        y_pred_log = self.xgb_model.predict(X_vl)
        mape = mean_absolute_percentage_error(np.expm1(y_vl_log),
                                               np.expm1(y_pred_log)) * 100
        self.training_metrics = {"val_mape": mape}
        print(f"  [ValueEngine] Val MAPE: {mape:.2f}% (target <12%)")
        self.fitted = True
        return self

    def predict(self, X: pd.DataFrame) -> dict:
        assert self.fitted
        # Add any missing feature columns as 0
        for col in self.feature_names_:
            if col not in X.columns:
                X = X.copy(); X[col] = 0.0
        Xv = X[self.feature_names_].fillna(0).values.astype(np.float32)

        y_p50_log = self.xgb_model.predict(Xv)
        y_p10_log = self.xgb_p10.predict(Xv)
        y_p90_log = self.xgb_p90.predict(Xv)

        # Conformal adjustment
        conf_lo, conf_hi = self.conformal.predict_interval(y_p50_log)
        y_p10_log = np.minimum(y_p10_log, conf_lo)
        y_p90_log = np.maximum(y_p90_log, conf_hi)

        psf_p50 = np.expm1(y_p50_log)
        psf_p10 = np.expm1(y_p10_log)
        psf_p90 = np.expm1(y_p90_log)

        psf_p10 = np.minimum(psf_p10, psf_p50)
        psf_p90 = np.maximum(psf_p90, psf_p50)

        return {
            "price_p10_sqft": psf_p10.round(0),
            "price_p50_sqft": psf_p50.round(0),
            "price_p90_sqft": psf_p90.round(0),
        }

    @property
    def feature_importances(self) -> pd.DataFrame:
        imp = self.xgb_model.feature_importances_
        return pd.DataFrame({"feature": self.feature_names_, "importance": imp}
                            ).sort_values("importance", ascending=False).reset_index(drop=True)

    def save(self, path: str = None):
        path = path or os.path.join(APP_CONFIG.model_dir, "value_engine.joblib")
        os.makedirs(os.path.dirname(path), exist_ok=True)
        joblib.dump({"xgb_model": self.xgb_model, "xgb_p10": self.xgb_p10,
                     "xgb_p90": self.xgb_p90, "conformal": self.conformal,
                     "feature_names": self.feature_names_,
                     "n_features": self.n_features_,
                     "training_metrics": self.training_metrics}, path)
        print(f"[ValueEngine] Saved → {path}")

    @classmethod
    def load(cls, path: str = None):
        path = path or os.path.join(APP_CONFIG.model_dir, "value_engine.joblib")
        d = joblib.load(path)
        e = cls()
        e.xgb_model = d["xgb_model"]; e.xgb_p10 = d["xgb_p10"]
        e.xgb_p90 = d["xgb_p90"]; e.conformal = d["conformal"]
        e.feature_names_ = d["feature_names"]; e.n_features_ = d["n_features"]
        e.training_metrics = d["training_metrics"]; e.fitted = True
        try:
            e.explainer = shap.TreeExplainer(e.xgb_model)
        except Exception:
            pass
        return e
