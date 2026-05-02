import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { ShapDriver } from '@/types/api.types'
import { shapContribution } from '@/utils/formatters'

function topDrivers(drivers: ShapDriver[], n: number) {
  const sorted = [...drivers].sort(
    (a, b) => Math.abs(shapContribution(b)) - Math.abs(shapContribution(a)),
  )
  return sorted.slice(0, n).map((d) => ({
    name: (d.display_name ?? d.feature).replace(/_/g, ' '),
    value: shapContribution(d),
  }))
}

export function ShapChart({
  drivers,
  title,
  topN = 10,
}: {
  drivers: ShapDriver[]
  title: string
  topN?: number
}) {
  const data = useMemo(() => topDrivers(drivers, topN), [drivers, topN])

  if (!data.length) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
        No SHAP drivers returned (explainer artefact may be missing).
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
      <div className="h-[320px] w-full" aria-label={title}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
          >
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
              tick={{ fontSize: 11 }}
              interval={0}
            />
            <Tooltip
              formatter={(v) => [
                typeof v === 'number' && Number.isFinite(v) ? v.toFixed(4) : '—',
                'Contribution',
              ]}
              contentStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.value >= 0 ? '#10b981' : '#ef4444'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
