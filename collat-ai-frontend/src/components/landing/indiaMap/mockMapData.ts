import type { CityName } from '@/types/api.types'

import { CITY_INFO } from '@/utils/constants'

export const TIER_1_CITIES: readonly CityName[] = ['Mumbai', 'Delhi', 'Bangalore'] as const

export function isTier1(city: CityName): boolean {
  return CITY_INFO[city].tier === 1
}

function hashCity(city: string): number {
  let h = 2166136261
  for (let i = 0; i < city.length; i++) h = Math.imul(h ^ city.charCodeAt(i), 16777619)
  return h >>> 0
}

/** Mock 8-point sparkline series in 0–100 range for UI only */
export function sparklineForCity(city: CityName): number[] {
  const r = hashCity(city)
  const out: number[] = []
  let v = 40 + (r % 30)
  for (let i = 0; i < 8; i++) {
    v += ((r >> (i * 3)) % 11) - 5
    v = Math.min(92, Math.max(18, v))
    out.push(v)
  }
  return out
}

export function growthPctForCity(city: CityName): { up: boolean; pct: string } {
  const h = hashCity(city)
  const pct = (4 + (h % 140) / 10).toFixed(1)
  const up = (h >> 5) % 4 !== 0
  return { up, pct }
}

export type MapInsight = {
  id: string
  label: string
  headline: string
  anchorCity: CityName
  tag: string
  body: string
}

export const MAP_INSIGHTS: MapInsight[] = [
  {
    id: 'grow',
    label: 'Fastest growing',
    headline: 'Hyderabad +15.6%',
    anchorCity: 'Hyderabad',
    tag: 'Demand',
    body: 'Demand is rising quickly in Hyderabad, especially in IT areas. New projects are selling faster than in most other cities.',
  },
  {
    id: 'price',
    label: 'Highest price',
    headline: 'Mumbai ₹18.5k/sqft',
    anchorCity: 'Mumbai',
    tag: 'Prices',
    body: 'Mumbai remains the most expensive market. Prices are stable, and properties are rarely sold below market value.',
  },
  {
    id: 'liq',
    label: 'Liquidity pulse',
    headline: 'Bangalore 8.4 / 10',
    anchorCity: 'Bangalore',
    tag: 'Sales pace',
    body: 'Properties in Bangalore are selling faster than before. Gated communities are especially in high demand.',
  },
]

export type CityMapMetrics = {
  city: CityName
  psfDisplay: string
  growth: string
  growthUp: boolean
  volumeDeals: string
  liquidityIndex: string
  ttlWeeks: string
  confidence: string
}

export function metricsForCity(city: CityName): CityMapMetrics {
  const h = hashCity(city)
  const psf = CITY_INFO[city].base_psf
  const psfDisplay = psf >= 1000 ? `₹${(psf / 1000).toFixed(1)}k/sqft` : `₹${psf}/sqft`
  const { up, pct } = growthPctForCity(city)
  return {
    city,
    psfDisplay,
    growth: `${up ? '+' : ''}${pct}%`,
    growthUp: up,
    volumeDeals: `${(420 + (h % 380)).toLocaleString('en-IN')} / qtr`,
    liquidityIndex: `${(6.8 + (h % 25) / 10).toFixed(1)} / 10`,
    ttlWeeks: `${10 + (h % 14)}–${22 + (h % 10)} wk`,
    confidence: `${84 + (h % 12)}%`,
  }
}
