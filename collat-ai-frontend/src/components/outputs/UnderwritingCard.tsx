import { Landmark } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { UnderwritingResponse } from '@/types/api.types'
import { formatCurrency, formatCurrencyFull } from '@/utils/formatters'

export function UnderwritingCard({ u }: { u: UnderwritingResponse }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">Underwriting</CardTitle>
        <Landmark className="h-4 w-4 text-gray-600" aria-hidden />
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs text-gray-500">Eligible LTV</p>
          <p className="font-mono text-lg font-semibold">{u.eligible_ltv_pct.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Max safe loan</p>
          <p className="font-mono text-lg font-semibold">
            {formatCurrency(u.max_safe_loan_inr)}
          </p>
          <p className="text-xs text-gray-500">{formatCurrencyFull(u.max_safe_loan_inr)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Distress value (INR)</p>
          <p className="font-mono text-lg font-semibold">
            {formatCurrency(u.distress_value_inr)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Ownership</p>
          <p className="text-sm font-medium text-gray-800">{u.ownership_type}</p>
        </div>
        <p className="text-sm text-gray-600 sm:col-span-2">{u.note}</p>
      </CardContent>
    </Card>
  )
}
