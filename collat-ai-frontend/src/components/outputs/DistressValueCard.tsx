import { Gavel } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DistressValueResponse, MarketValueResponse } from '@/types/api.types'
import { formatCurrency } from '@/utils/formatters'

export function DistressValueCard({
  distress,
  market,
}: {
  distress: DistressValueResponse
  market: MarketValueResponse
}) {
  const pctOfMid =
    market.p50_total > 0 ? (distress.low_total / market.p50_total) * 100 : 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">Distress value</CardTitle>
        <Gavel className="h-4 w-4 text-gray-600" aria-hidden />
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-gray-600">
          SARFAESI-style liquidation floor (range). For forced-sale scenarios.
        </p>
        <p className="font-mono text-2xl font-bold text-gray-900">
          {formatCurrency(distress.low_total)}
        </p>
        <p className="text-xs text-gray-500">
          Band: {formatCurrency(distress.low_total)} — {formatCurrency(distress.high_total)} ·
          Discount vs P50: {distress.discount_lo_pct}% – {distress.discount_hi_pct}%
        </p>
        <p className="text-sm text-gray-700">
          Liquidation floor ≈ <span className="font-semibold">{pctOfMid.toFixed(0)}%</span> of
          median market value (low end).
        </p>
      </CardContent>
    </Card>
  )
}
