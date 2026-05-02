"""
preprocessor.py — Collat.AI v3
Multi-city label encoding, scaling, and dataset splitting.
Fit on TRAIN ONLY to prevent data leakage.
"""

import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from typing import Tuple, Dict, List
import joblib, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import DATA_CONFIG, APP_CONFIG, CITIES

POI_TYPES  = ["transit","school","hospital","mall","restaurant","bank","park","office","worship","gym"]
POI_RADII  = [500, 1000, 3000]

class SafeLabelEncoder:
    def __init__(self):
        self._le = LabelEncoder()
        self._classes = set()

    def fit(self, series: pd.Series):
        vals = list(series.astype(str).unique()) + ["__unknown__"]
        self._le.fit(vals)
        self._classes = set(vals)
        return self

    def transform(self, series: pd.Series) -> np.ndarray:
        s = series.astype(str).copy()
        s[~s.isin(self._classes)] = "__unknown__"
        return self._le.transform(s)

    def fit_transform(self, series: pd.Series) -> np.ndarray:
        return self.fit(series).transform(series)


class PropertyPreprocessor:
    CATEGORICAL_COLS = [
        "city", "zone", "locality", "property_type", "sub_type",
        "furnishing", "occupancy", "ownership_type",
        "property_age_bucket", "size_bucket",
    ]
    BINARY_COLS = [
        "lift_available", "security_24x7", "gym_available", "swimming_pool",
        "clubhouse", "power_backup", "intercom", "cctv",
        "rera_registered", "oc_received", "cc_received", "bmc_approved",
        "legal_clear", "encumbrance_flag", "litigation_flag",
        "flood_zone_flag", "crz_flag", "heritage_zone_flag",
        "slum_proximity_flag", "planned_zone_flag", "it_park_proximity",
        "vastu_compliant", "corner_unit", "east_facing", "servant_room",
        "modular_kitchen", "smart_home", "top_floor_flag", "ground_floor_flag",
        "super_luxury_flag", "affordable_flag",
    ]
    NUMERICAL_COLS = [
        "area_sqft", "age_years", "floor_number", "total_floors", "floor_ratio",
        "bedrooms", "bathrooms", "parking_slots", "monthly_rent",
        "lat", "lon", "zone_premium", "locality_premium",
        "city_tier", "city_base_psf", "city_population_m",
        "infra_index", "nightlight_proxy", "nri_demand_score",
        "walk_score", "transit_score", "green_cover_score",
        "crime_index_proxy", "pollution_aqi_proxy",
        *[f"poi_{pt}_{r}m" for pt in POI_TYPES for r in POI_RADII],
        "metro_distance_km", "railway_distance_km", "airport_distance_km",
        "highway_distance_km", "sea_distance_km", "cbd_distance_km",
        "circle_rate_sqft", "listing_price_sqft", "circle_rate_premium",
        "market_heat_index", "supply_demand_ratio",
        "price_trend_1m", "price_trend_3m", "price_trend_6m", "price_trend_12m",
        "price_trend_24m", "inventory_months", "transaction_volume_qtr",
        "new_supply_units_6m", "absorption_rate_6m", "price_momentum_score",
        "dom_median_locality", "buyer_pool_score", "rental_yield",
        "cap_rate", "vacancy_rate_locality", "resale_frequency",
        "exit_ease_score", "rpi_proxy",
        "img_condition_score", "img_natural_light_score", "img_renovation_score",
        "img_view_score", "img_facade_score", "img_cleanliness_score",
        "img_space_feel_score", "img_amenity_score", "img_quality_flag", "img_count",
        "age_x_location_premium", "area_x_liquidity", "floor_x_lift",
        "yield_x_demand", "circle_x_market_heat", "infra_x_price_trend",
        "img_condition_x_price", "legal_x_fraud_score",
        "city_x_zone_premium", "area_x_floor", "poi_x_transit",
        "h3_res7_price_median", "h3_res7_transaction_count",
        "floor_premium_factor",
    ]

    def __init__(self):
        self.encoders: Dict[str, SafeLabelEncoder] = {}
        self.scaler = StandardScaler()
        self.city_medians: Dict[str, float] = {}
        self._num_cols_fitted = []
        self._fitted = False

    def _clean(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        df["area_sqft"]   = df["area_sqft"].clip(50, 100_000)
        df["age_years"]   = df["age_years"].clip(0, 100)
        df["floor_ratio"] = df["floor_ratio"].clip(0, 1)
        if "rental_yield" in df.columns:
            df["rental_yield"] = df["rental_yield"].clip(0, 0.30)
        for t in ["1m","3m","6m","12m","24m"]:
            c = f"price_trend_{t}"
            if c in df.columns:
                df[c] = df[c].clip(-0.5, 0.5)

        if "property_age_bucket" not in df.columns or df["property_age_bucket"].isnull().any():
            df["property_age_bucket"] = pd.cut(df["age_years"],
                bins=[-1,5,15,30,100], labels=["New","Mid","Old","Very Old"])
        if "size_bucket" not in df.columns or df["size_bucket"].isnull().any():
            df["size_bucket"] = pd.cut(df["area_sqft"],
                bins=[0,600,1200,3000,100001], labels=["Small","Mid","Large","Ultra"])

        for col in self.NUMERICAL_COLS:
            if col in df.columns:
                df[col] = df[col].fillna(0)
        for col in self.CATEGORICAL_COLS:
            if col in df.columns:
                df[col] = df[col].astype(str).fillna("Unknown")
        for col in self.BINARY_COLS:
            if col in df.columns:
                df[col] = df[col].fillna(0).astype(int)
        return df

    def fit(self, df: pd.DataFrame):
        df = self._clean(df)
        for col in self.CATEGORICAL_COLS:
            if col in df.columns:
                self.encoders[col] = SafeLabelEncoder().fit(df[col])
        # Per-city medians for fraud engine
        if "price_psf" in df.columns and "city" in df.columns:
            self.city_medians = df.groupby("city")["price_psf"].median().to_dict()
        elif "price_psf" in df.columns:
            self.city_medians = {"all": df["price_psf"].median()}

        avail = [c for c in self.NUMERICAL_COLS if c in df.columns]
        self.scaler.fit(df[avail])
        self._num_cols_fitted = avail
        self._fitted = True
        return self

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        assert self._fitted, "Preprocessor not fitted yet"
        df = self._clean(df)
        for col in self.CATEGORICAL_COLS:
            if col in df.columns and col in self.encoders:
                df[f"{col}_encoded"] = self.encoders[col].transform(df[col])
        for col in self._num_cols_fitted:
            if col not in df.columns:
                df[col] = 0.0
        avail = self._num_cols_fitted
        df[avail] = self.scaler.transform(df[avail])
        return df

    def fit_transform(self, df: pd.DataFrame) -> pd.DataFrame:
        return self.fit(df).transform(df)

    def save(self, path: str = None):
        path = path or os.path.join(APP_CONFIG.model_dir, "preprocessor.joblib")
        os.makedirs(os.path.dirname(path), exist_ok=True)
        joblib.dump(self, path)
        print(f"[Preprocessor] Saved → {path}")

    @staticmethod
    def load(path: str = None):
        path = path or os.path.join(APP_CONFIG.model_dir, "preprocessor.joblib")
        return joblib.load(path)


def split_dataset(df: pd.DataFrame,
                  test_size: float = DATA_CONFIG.test_size,
                  val_size:  float = DATA_CONFIG.val_size,
                  random_state: int = DATA_CONFIG.random_state
                  ) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    # Stratify on city to preserve multi-city distribution
    strat_col = "city" if "city" in df.columns else "zone"
    train_val, test = train_test_split(df, test_size=test_size,
                                       stratify=df[strat_col], random_state=random_state)
    vr = val_size / (1 - test_size)
    train, val = train_test_split(train_val, test_size=vr,
                                  stratify=train_val[strat_col], random_state=random_state)
    print(f"[Split] Train:{len(train):,} | Val:{len(val):,} | Test:{len(test):,}")
    return (train.reset_index(drop=True),
            val.reset_index(drop=True),
            test.reset_index(drop=True))


def build_feature_matrix(df: pd.DataFrame, feature_list: List[str]) -> pd.DataFrame:
    available, missing = [], []
    for c in feature_list:
        if c in df.columns:
            available.append(c)
        else:
            missing.append(c)
    if missing:
        print(f"[FeatureMatrix] Filling {len(missing)} missing cols with 0")
        for c in missing:
            df[c] = 0.0
        available = feature_list
    return df[available].copy().fillna(0)
