"""
schemas.py — Collat.AI v3
Pydantic v2 request/response models for multi-city API
"""

from pydantic import BaseModel, Field, model_validator
from typing import Optional, List, Dict, Any
from enum import Enum


class CityEnum(str, Enum):
    Mumbai     = "Mumbai"
    Delhi      = "Delhi"
    Bangalore  = "Bangalore"
    Hyderabad  = "Hyderabad"
    Pune       = "Pune"
    Chennai    = "Chennai"
    Kolkata    = "Kolkata"
    Ahmedabad  = "Ahmedabad"


class PropertyTypeEnum(str, Enum):
    Apartment  = "Apartment"
    Villa      = "Villa"
    Commercial = "Commercial"
    Industrial = "Industrial"
    Plot       = "Plot"


class OwnershipEnum(str, Enum):
    Freehold  = "Freehold"
    Leasehold = "Leasehold"


class ValuationRequest(BaseModel):
    property_id:   Optional[str]  = None
    city:          CityEnum        = CityEnum.Mumbai
    zone:          Optional[str]   = Field(None, description="City-specific zone")
    locality:      Optional[str]   = Field(None, description="Locality within the zone")
    lat:           Optional[float] = None
    lon:           Optional[float] = None
    property_type: PropertyTypeEnum = PropertyTypeEnum.Apartment
    sub_type:      Optional[str]   = Field(None, description="e.g. 2BHK, Bungalow, Office")
    area_sqft:     float = Field(..., gt=50, lt=100_000, description="Carpet/built-up area")
    age_years:     float = Field(..., ge=0, le=100)
    floor_number:  int   = Field(0, ge=0, le=200)
    total_floors:  int   = Field(5, ge=1, le=200)
    bedrooms:      int   = Field(2, ge=0, le=20)
    bathrooms:     int   = Field(1, ge=0, le=20)
    parking_slots: int   = Field(1, ge=0, le=10)
    furnishing:    int   = Field(1, ge=0, le=2, description="0=Unfurnished 1=Semi 2=Full")
    occupancy:     int   = Field(0, ge=0, le=2,  description="0=Self 1=Rented 2=Vacant")
    monthly_rent:  float = Field(0.0, ge=0)
    ownership_type: OwnershipEnum = OwnershipEnum.Freehold
    # Amenities
    lift_available:    bool = True
    security_available:bool = True
    gym_available:     bool = False
    swimming_pool:     bool = False
    clubhouse:         bool = False
    power_backup:      bool = True
    intercom:          bool = True
    cctv:              bool = True
    # Compliance
    rera_registered: bool = True
    oc_received:     bool = True
    cc_received:     bool = True
    bmc_approved:    bool = True
    # Legal
    legal_clear:          bool = True
    encumbrance_flag:     bool = False
    litigation_flag:      bool = False
    title_age_years:      int  = Field(5, ge=0)
    registered_sale_deed: bool = True
    loan_on_property:     bool = False
    mutation_done:        bool = True
    # Risk flags
    flood_zone_flag:  bool = False
    crz_flag:         bool = False
    heritage_zone_flag:bool = False
    slum_proximity_flag:bool= False
    planned_zone_flag: bool = True
    it_park_proximity: bool = False
    # Market overrides (optional)
    circle_rate_sqft:    Optional[float] = Field(None, ge=0)
    listing_price_sqft:  Optional[float] = Field(None, ge=0)
    # Image
    img_count: int = Field(3, ge=0, le=20)
    # Optional extras
    vastu_compliant: bool = True
    corner_unit:     bool = False
    east_facing:     bool = False
    balcony_count:   int  = Field(1, ge=0, le=5)
    servant_room:    bool = False
    modular_kitchen: bool = True
    smart_home:      bool = False

    @model_validator(mode="after")
    def validate_floors(self):
        if self.floor_number > self.total_floors:
            raise ValueError(f"floor_number ({self.floor_number}) > total_floors ({self.total_floors})")
        return self


class BatchValuationRequest(BaseModel):
    properties: List[ValuationRequest] = Field(..., min_length=1, max_length=50)
    include_shap: bool = False


class HealthResponse(BaseModel):
    status:        str
    model_version: str
    models_loaded: bool
    uptime_s:      float
    load_error:    Optional[str] = Field(
        None,
        description="Populated when models failed to load (truncated server-side).",
    )


class MarketValueResponse(BaseModel):
    p10_sqft: float; p50_sqft: float; p90_sqft: float
    p10_total: float; p50_total: float; p90_total: float


class LiquidityResponse(BaseModel):
    rpi_score: float; rpi_label: str
    liquidity_band: str; liquidity_grade: str
    ttl_days_low: int; ttl_days_high: int; ttl_days_estimate: int
    exit_certainty_90d: float


class FraudResponse(BaseModel):
    fraud_probability: float; severity: str
    is_statistical_anomaly: bool
    flags_raised: int; flag_ids: List[str]
    flag_commentary: List[Dict[str, Any]]


class ConfidenceResponse(BaseModel):
    score: float; grade: str
    manual_review: bool; review_reason: Optional[str]


class UnderwritingResponse(BaseModel):
    eligible_ltv_pct: float
    distress_value_inr: float; max_safe_loan_inr: float
    ownership_type: str; note: str


class ValuationResponse(BaseModel):
    market_value:    MarketValueResponse
    distress_value:  Dict[str, Any]
    liquidity:       LiquidityResponse
    fraud_risk:      FraudResponse
    confidence:      ConfidenceResponse
    underwriting:    UnderwritingResponse
    shap_value_drivers:    List[Dict[str, Any]] = []
    shap_liquidity_drivers:List[Dict[str, Any]] = []
    meta:            Dict[str, Any] = {}
