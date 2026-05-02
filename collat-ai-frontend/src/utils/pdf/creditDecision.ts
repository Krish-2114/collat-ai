import type { ValuationResponse } from '@/types/api.types'

export type CreditDecision = 'Approve' | 'Review' | 'Decline'

export function deriveCreditDecision(res: ValuationResponse): { decision: CreditDecision; rationale: string } {
  const grade = res.confidence.grade.toUpperCase()
  const fp = res.fraud_risk.fraud_probability
  const flags = res.fraud_risk.flags_raised

  if (grade === 'D' || fp >= 0.72 || flags >= 8) {
    return {
      decision: 'Decline',
      rationale:
        'Outside automated appetite: severe confidence band, elevated composite fraud probability, or extensive deterministic rule surface.',
    }
  }
  if (res.confidence.manual_review || grade === 'C' || fp >= 0.38 || flags >= 4) {
    return {
      decision: 'Review',
      rationale:
        'Refer to credit committee: manual-review flag, mid-tier grade, meaningful fraud probability, or multiple concurrent rule triggers.',
    }
  }
  return {
    decision: 'Approve',
    rationale:
      'Within standard automated parameters: contained fraud score, limited rule triggers, and confidence grade in the A–B range.',
  }
}
