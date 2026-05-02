import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { FraudResponse } from '@/types/api.types'
import { fraudSeverityFromProbability } from '@/utils/formatters'

export function FraudRecommendations({ f }: { f: FraudResponse }) {
  const sev = fraudSeverityFromProbability(f.fraud_probability)

  const main =
    sev === 'low'
      ? 'Proceed with standard due diligence. Ruleset is clean or low-signal.'
      : sev === 'medium'
        ? 'Additional verification recommended — reconcile listing, circle rate, and rental documentation.'
        : sev === 'high'
          ? 'Elevated risk: expand field investigation and legal opinion before sanction.'
          : 'Critical risk profile: hold sanction until independent valuation and legal clearance.'

  const steps: string[] = []
  if (f.flags_raised > 0) {
    steps.push('Collect updated chain of title and encumbrance certificate.')
    steps.push('Verify circle rate vs. declared consideration with registration data.')
  }
  if (f.is_statistical_anomaly) {
    steps.push('Review feature bundle against comparable micro-market transactions.')
  }
  if (f.fraud_probability >= 50) {
    steps.push('Obtain second opinion valuation from an on-ground surveyor.')
  }
  if (steps.length === 0) {
    steps.push('Retain standard KYC and income documentation.')
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Recommendation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-gray-700">{main}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Next steps checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-2 text-sm text-gray-700">
            {steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
