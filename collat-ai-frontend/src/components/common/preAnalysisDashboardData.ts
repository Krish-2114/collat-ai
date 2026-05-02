/** Illustrative pre-analysis market data (not model output). */

export const LOCAL_PRICE_TREND_PSF = [
  { m: 'Jan', psf: 16200 },
  { m: 'Feb', psf: 16450 },
  { m: 'Mar', psf: 16700 },
  { m: 'Apr', psf: 17050 },
  { m: 'May', psf: 17400 },
  { m: 'Jun', psf: 17850 },
] as const

export const LOCAL_PRICE_GROWTH_PCT = 10.2

export const SUPPLY_DEMAND = {
  availableListings: 420,
  buyerDemandScore: 610,
  /** Narrative insight (derived from mock figures). */
  insight: 'Demand exceeds supply by 45%',
} as const

export const LIQUIDITY_HEAT_SCORE = 87

export const LIQUIDITY_HEAT_INSIGHT = 'High resale activity in this locality'
