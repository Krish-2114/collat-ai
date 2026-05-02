import { CalendarRange, Timer } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { LiquidityResponse } from '@/types/api.types'
import { formatPercentage } from '@/utils/formatters'

export function LiquidityInsights({ liq }: { liq: LiquidityResponse }) {
  const mid = (liq.ttl_days_low + liq.ttl_days_high) / 2
  const span = Math.max(1, liq.ttl_days_high - liq.ttl_days_low)
  const estPos = ((liq.ttl_days_estimate - liq.ttl_days_low) / span) * 100

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
          <Timer className="h-4 w-4 text-primary-600" aria-hidden />
          <CardTitle className="text-base font-semibold">Time to liquidate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="font-mono text-2xl font-bold text-gray-900">
            {liq.ttl_days_low} – {liq.ttl_days_high} days
          </p>
          <p className="text-sm text-gray-600">
            Point estimate:{' '}
            <span className="font-semibold text-gray-900">{liq.ttl_days_estimate} days</span>
          </p>
          <div className="relative pt-2">
            <div className="relative h-2 rounded-full bg-gray-200">
              <div
                className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-600 ring-2 ring-white"
                style={{ left: `${Math.min(100, Math.max(0, estPos))}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>{liq.ttl_days_low}d</span>
              <span>{liq.ttl_days_high}d</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
          <CalendarRange className="h-4 w-4 text-emerald-600" aria-hidden />
          <CardTitle className="text-base font-semibold">Exit certainty (90d)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="font-mono text-3xl font-bold text-emerald-700">
            {formatPercentage(liq.exit_certainty_90d / 100, true)}
          </p>
          <p className="text-sm text-gray-600">
            Probability-weighted view of exiting within roughly ninety days given current micro-market
            liquidity ({liq.liquidity_band}).
          </p>
          <p className="text-xs text-gray-500">
            Mid-range reference: ~{Math.round(mid)} days across the estimated band.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
