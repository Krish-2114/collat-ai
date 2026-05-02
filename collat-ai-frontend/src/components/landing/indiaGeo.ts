/**
 * Metro coordinates and projection aligned to `public/india.svg` (MapSVG geoViewBox).
 */
import type { CityName } from '@/types/api.types'

/** Same order as in the source SVG: west, north, east, south (degrees). */
export const INDIA_MAP_GEO = {
  west: 68.18401,
  north: 37.084109,
  east: 97.418146,
  south: 6.753659,
} as const

export const INDIA_MAP_PIXEL = { width: 611.85999, height: 695.70178 } as const

export const INDIA_MAP_ASPECT = INDIA_MAP_PIXEL.width / INDIA_MAP_PIXEL.height

/** Public asset (copied from user-provided detailed India outline). */
export const INDIA_MAP_SRC = `${import.meta.env.BASE_URL}india.svg`

export const METRO_GEO: Record<CityName, { lon: number; lat: number }> = {
  Mumbai: { lon: 72.88, lat: 19.08 },
  Delhi: { lon: 77.21, lat: 28.61 },
  Bangalore: { lon: 77.59, lat: 12.97 },
  Hyderabad: { lon: 78.47, lat: 17.39 },
  Pune: { lon: 73.86, lat: 18.52 },
  Chennai: { lon: 80.27, lat: 13.08 },
  Kolkata: { lon: 88.36, lat: 22.57 },
  Ahmedabad: { lon: 72.57, lat: 23.02 },
}

const lonSpan = INDIA_MAP_GEO.east - INDIA_MAP_GEO.west
const latSpan = INDIA_MAP_GEO.north - INDIA_MAP_GEO.south

/** Percent positions (0–100) for overlay on the SVG, matching mapsvg:geoViewBox. */
export function projectLonLatToPercent(lon: number, lat: number): { leftPct: number; topPct: number } {
  const leftPct = ((lon - INDIA_MAP_GEO.west) / lonSpan) * 100
  const topPct = ((INDIA_MAP_GEO.north - lat) / latSpan) * 100
  return { leftPct: +leftPct.toFixed(4), topPct: +topPct.toFixed(4) }
}
