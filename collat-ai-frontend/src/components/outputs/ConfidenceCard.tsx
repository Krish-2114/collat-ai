import { BadgeCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ConfidenceResponse } from '@/types/api.types'
import { formatPercentage, getGradeColorClass } from '@/utils/formatters'

export function ConfidenceCard({ c }: { c: ConfidenceResponse }) {
  const scorePct = c.score <= 1 ? c.score * 100 : c.score

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">Confidence grade</CardTitle>
        <BadgeCheck className="h-4 w-4 text-gray-600" aria-hidden />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`text-4xl font-bold ${getGradeColorClass(c.grade)}`}>
            {c.grade}
          </span>
          <div>
            <p className="text-sm text-gray-600">Model confidence</p>
            <p className="font-mono text-xl font-semibold">
              {formatPercentage(scorePct / 100, true)}
            </p>
          </div>
          {c.manual_review ? (
            <Badge variant="warning">Manual review</Badge>
          ) : (
            <Badge variant="success">Auto</Badge>
          )}
        </div>
        {c.review_reason ? (
          <p className="text-sm text-amber-900">{c.review_reason}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
