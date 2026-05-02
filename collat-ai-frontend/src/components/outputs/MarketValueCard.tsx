import { TrendingUp } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { MarketValueResponse } from '@/types/api.types'
import {
  confidenceIntervalWidthPct,
  formatCurrency,
  formatSqft,
} from '@/utils/formatters'

export function MarketValueCard({ mv }: { mv: MarketValueResponse }) {
  const widthPct = confidenceIntervalWidthPct(mv)
  const span = mv.p90_total - mv.p10_total
  const p50Pos =
    span > 0 ? ((mv.p50_total - mv.p10_total) / span) * 100 : 50

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">Market value</CardTitle>
        <TrendingUp className="h-4 w-4 text-primary-600" aria-hidden />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs text-gray-500">P10 (conservative)</p>
            <p className="font-mono text-lg font-semibold text-gray-800">
              {formatCurrency(mv.p10_total)}
            </p>
            <p className="text-xs text-gray-500">{formatSqft(mv.p10_sqft)}</p>
          </div>
          <div className="rounded-lg bg-primary-50 p-3 ring-1 ring-primary-100">
            <p className="text-xs font-medium text-primary-700">P50 median</p>
            <p className="font-mono text-xl font-bold text-primary-800">
              {formatCurrency(mv.p50_total)}
            </p>
            <p className="text-xs text-primary-700/80">{formatSqft(mv.p50_sqft)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">P90 (upside)</p>
            <p className="font-mono text-lg font-semibold text-gray-800">
              {formatCurrency(mv.p90_total)}
            </p>
            <p className="text-xs text-gray-500">{formatSqft(mv.p90_sqft)}</p>
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs text-gray-500">Range (P10–P90)</p>
          <div className="relative h-3 rounded-full bg-gray-200">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-200 via-primary-400 to-amber-200"
              style={{ width: '100%' }}
            />
            <div
              className="absolute top-1/2 h-4 w-1 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-primary-700 shadow"
              style={{ left: `${Math.min(100, Math.max(0, p50Pos))}%` }}
              title="P50"
            />
          </div>
          <p className="mt-2 text-xs text-gray-600">
            Confidence band width (PSF):{' '}
            <span className="font-mono font-medium">{widthPct.toFixed(1)}%</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
