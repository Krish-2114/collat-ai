import { AlertCircle, CheckCircle2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { FraudResponse } from '@/types/api.types'
import { FRAUD_FLAG_LABELS } from '@/utils/constants'

export function FraudRuleList({ f }: { f: FraudResponse }) {
  const totalRules = 10

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Rule-based flags</CardTitle>
        <p className="text-sm text-gray-600">
          {f.flags_raised} of {totalRules} rules triggered
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {f.flag_commentary.length === 0 ? (
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" aria-hidden />
            <span>No deterministic rules fired on this payload.</span>
          </div>
        ) : (
          <ul className="space-y-3">
            {f.flag_commentary.map((row) => (
              <li
                key={row.flag_id}
                className="flex gap-3 rounded-lg border border-amber-100 bg-amber-50/60 p-3 text-sm"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden />
                <div>
                  <p className="font-medium text-amber-950">
                    {FRAUD_FLAG_LABELS[row.flag_id] ?? row.flag_id}
                  </p>
                  <p className="text-xs text-amber-900/90">{row.rule}</p>
                  <p className="mt-1 text-amber-950/90">{row.commentary}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
