import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from 'recharts'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { LiquidityResponse } from '@/types/api.types'
import { getGradeColorClass } from '@/utils/formatters'

export function RpiGauge({ liq }: { liq: LiquidityResponse }) {
  const score = Math.min(100, Math.max(0, liq.rpi_score))
  const data = [{ name: 'rpi', value: score, fill: '#2563eb' }]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Resale Potential Index</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 md:flex-row md:items-center">
        <div className="relative mx-auto h-44 w-44 shrink-0" aria-label={`RPI score ${score}`}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="72%"
              outerRadius="100%"
              barSize={12}
              data={data}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar background={{ fill: '#e5e7eb' }} dataKey="value" cornerRadius={6} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-2">
            <p className="font-mono text-3xl font-bold text-gray-900">{score.toFixed(0)}</p>
            <p className="text-xs text-gray-500">/ 100</p>
          </div>
        </div>
        <div className="flex-1 space-y-2 text-sm">
          <p className="text-gray-700">{liq.rpi_label}</p>
          <p>
            <span className="text-gray-500">Liquidity band:</span>{' '}
            <span className="font-medium">{liq.liquidity_band}</span>
          </p>
          <p>
            <span className="text-gray-500">Grade:</span>{' '}
            <span className={`text-lg font-bold ${getGradeColorClass(liq.liquidity_grade)}`}>
              {liq.liquidity_grade}
            </span>
          </p>
          <Badge variant="secondary">TTL estimate: {liq.ttl_days_estimate} days</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
