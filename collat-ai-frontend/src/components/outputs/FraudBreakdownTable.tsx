import { useMemo, useState } from 'react'

import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { FraudResponse } from '@/types/api.types'
import { FRAUD_FLAG_LABELS } from '@/utils/constants'

export function FraudBreakdownTable({ f }: { f: FraudResponse }) {
  const [q, setQ] = useState('')

  const rows = useMemo(() => {
    const base = f.flag_commentary.map((c) => ({
      id: c.flag_id,
      severity: f.fraud_probability >= 65 ? 'High' : f.fraud_probability >= 35 ? 'Medium' : 'Low',
      description: FRAUD_FLAG_LABELS[c.flag_id] ?? c.flag_id,
      rule: c.rule,
      recommendation:
        c.flag_id === 'R08'
          ? 'Mandatory legal review'
          : c.flag_id === 'R07' || c.flag_id === 'R09'
            ? 'Physical inspection + registry check'
            : 'Data reconciliation with borrower',
    }))
    if (!q.trim()) return base
    const s = q.toLowerCase()
    return base.filter(
      (r) =>
        r.id.toLowerCase().includes(s) ||
        r.description.toLowerCase().includes(s) ||
        r.rule.toLowerCase().includes(s),
    )
  }, [f.flag_commentary, f.fraud_probability, q])

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base font-semibold">Risk breakdown</CardTitle>
        <Input
          placeholder="Filter…"
          className="max-w-xs"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Filter risk rows"
        />
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
              <th className="py-2 pr-4 font-medium">Flag</th>
              <th className="py-2 pr-4 font-medium">Severity</th>
              <th className="py-2 pr-4 font-medium">Description</th>
              <th className="py-2 font-medium">Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-500">
                  No rows match this filter.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 pr-4 font-mono text-xs">{r.id}</td>
                  <td className="py-3 pr-4">{r.severity}</td>
                  <td className="py-3 pr-4 text-gray-700">
                    <div className="font-medium">{r.description}</div>
                    <div className="text-xs text-gray-500">{r.rule}</div>
                  </td>
                  <td className="py-3 text-gray-700">{r.recommendation}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
