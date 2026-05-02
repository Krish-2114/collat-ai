export type CityName =
  | 'Mumbai'
  | 'Delhi'
  | 'Bangalore'
  | 'Hyderabad'
  | 'Pune'
  | 'Chennai'
  | 'Kolkata'
  | 'Ahmedabad'

export type PropertyTypeName =
  | 'Apartment'
  | 'Villa'
  | 'Commercial'
  | 'Industrial'
  | 'Plot'

export type OwnershipType = 'Freehold' | 'Leasehold'

export interface ValuationRequest {
  property_id?: string
  city: CityName
  zone?: string
  locality?: string
  lat?: number
  lon?: number
  property_type: PropertyTypeName
  sub_type?: string
  area_sqft: number
  age_years: number
  floor_number: number
  total_floors: number
  bedrooms: number
  bathrooms: number
  parking_slots: number
  furnishing: number
  occupancy: number
  monthly_rent: number
  ownership_type: OwnershipType
  lift_available: boolean
  security_available: boolean
  gym_available: boolean
  swimming_pool: boolean
  clubhouse: boolean
  power_backup: boolean
  intercom: boolean
  cctv: boolean
  rera_registered: boolean
  oc_received: boolean
  cc_received: boolean
  bmc_approved: boolean
  legal_clear: boolean
  encumbrance_flag: boolean
  litigation_flag: boolean
  title_age_years: number
  registered_sale_deed: boolean
  loan_on_property: boolean
  mutation_done: boolean
  flood_zone_flag: boolean
  crz_flag: boolean
  heritage_zone_flag: boolean
  slum_proximity_flag: boolean
  planned_zone_flag: boolean
  it_park_proximity: boolean
  circle_rate_sqft?: number
  listing_price_sqft?: number
  img_count: number
  vastu_compliant: boolean
  corner_unit: boolean
  east_facing: boolean
  balcony_count: number
  servant_room: boolean
  modular_kitchen: boolean
  smart_home: boolean
}

export interface MarketValueResponse {
  p10_sqft: number
  p50_sqft: number
  p90_sqft: number
  p10_total: number
  p50_total: number
  p90_total: number
}

export interface DistressValueResponse {
  low_total: number
  high_total: number
  discount_lo_pct: number
  discount_hi_pct: number
}

export interface LiquidityResponse {
  rpi_score: number
  rpi_label: string
  liquidity_band: string
  liquidity_grade: string
  ttl_days_low: number
  ttl_days_high: number
  ttl_days_estimate: number
  exit_certainty_90d: number
  class_probabilities?: number[]
}

export interface FraudFlagCommentary {
  flag_id: string
  rule: string
  commentary: string
}

export interface FraudResponse {
  fraud_probability: number
  severity: string
  is_statistical_anomaly: boolean
  flags_raised: number
  flag_ids: string[]
  flag_commentary: FraudFlagCommentary[]
}

export interface ConfidenceResponse {
  score: number
  grade: string
  manual_review: boolean
  review_reason?: string | null
}

export interface UnderwritingResponse {
  eligible_ltv_pct: number
  distress_value_inr: number
  max_safe_loan_inr: number
  ownership_type: string
  note: string
}

export interface ShapDriver {
  feature: string
  display_name?: string
  shap_value?: number
  contribution?: number
  direction?: string
  commentary?: string
  feature_value?: number
}

export interface ValuationResponse {
  market_value: MarketValueResponse
  distress_value: DistressValueResponse
  liquidity: LiquidityResponse
  fraud_risk: FraudResponse
  confidence: ConfidenceResponse
  underwriting: UnderwritingResponse
  shap_value_drivers: ShapDriver[]
  shap_liquidity_drivers: ShapDriver[]
  meta: Record<string, unknown>
}

export interface CitiesResponse {
  cities: string[]
  city_info: Record<
    string,
    { tier: number; base_psf: number; population_m: number }
  >
}

export interface ZonesResponse {
  city: string
  zones: string[]
  zone_premiums: Record<string, number>
}

export interface LocalitiesResponse {
  city: string
  zone: string
  localities: string[]
}

export interface HealthResponse {
  status: string
  model_version: string
  models_loaded: boolean
  uptime_s: number
  /** Present when the API is up but artefact load failed (see server logs). */
  load_error?: string | null
}
