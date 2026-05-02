import { AlertOctagon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { FraudResponse } from '@/types/api.types'
import {
  formatPercentage,
  fraudSeverityFromProbability,
  getSeverityColorClass,
} from '@/utils/formatters'

export function FraudRiskCard({ f }: { f: FraudResponse }) {
  const ui = fraudSeverityFromProbability(f.fraud_probability)

  return (
    <Card className="border-gray-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">Overall fraud risk</CardTitle>
        <AlertOctagon className="h-5 w-5 text-red-600" aria-hidden />
      </CardHeader>
      <CardContent className="flex flex-wrap items-end gap-4">
        <div>
          <p className="text-xs text-gray-500">Model score</p>
          <p className="font-mono text-4xl font-bold text-gray-900">
            {formatPercentage(f.fraud_probability / 100, true)}
          </p>
        </div>
        <Badge className={getSeverityColorClass(ui)}>
          {ui.charAt(0).toUpperCase() + ui.slice(1)} risk
        </Badge>
        {f.is_statistical_anomaly ? (
          <Badge variant="destructive">Statistical anomaly</Badge>
        ) : (
          <Badge variant="secondary">No IF anomaly flag</Badge>
        )}
      </CardContent>
    </Card>
  )
}
