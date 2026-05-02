export function formatCurrency(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1e7) {
    return `₹${(value / 1e7).toFixed(2)} Cr`
  }
  if (abs >= 1e5) {
    return `₹${(value / 1e5).toFixed(2)} L`
  }
  return `₹${Math.round(value).toLocaleString('en-IN')}`
}

export function formatCurrencyFull(value: number): string {
  return `₹${Math.round(value).toLocaleString('en-IN')}`
}

export function formatPercentage(value: number, isFraction = false): string {
  const pct = isFraction ? value * 100 : value
  return `${pct.toFixed(1)}%`
}

export function formatSqft(value: number): string {
  return `${Math.round(value).toLocaleString('en-IN')} sqft`
}

export function confidenceIntervalWidthPct(mv: {
  p10_sqft: number
  p90_sqft: number
  p50_sqft: number
}): number {
  const denom = Math.max(1, mv.p50_sqft)
  return ((mv.p90_sqft - mv.p10_sqft) / denom) * 100
}

export type SeverityUi = 'low' | 'medium' | 'high' | 'critical'

export function fraudSeverityFromProbability(pct: number): SeverityUi {
  if (pct < 20) return 'low'
  if (pct < 50) return 'medium'
  if (pct < 80) return 'high'
  return 'critical'
}

export function getSeverityColorClass(severity: SeverityUi): string {
  const colors: Record<SeverityUi, string> = {
    low: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    medium: 'bg-amber-50 text-amber-900 border-amber-200',
    high: 'bg-red-50 text-red-800 border-red-200',
    critical: 'bg-red-900 text-white border-red-950',
  }
  return colors[severity] ?? colors.low
}

export function getGradeColorClass(grade: string): string {
  const g = grade.toUpperCase()
  const colors: Record<string, string> = {
    A: 'text-emerald-600',
    B: 'text-primary-600',
    C: 'text-amber-600',
    D: 'text-red-600',
  }
  return colors[g] ?? 'text-gray-600'
}

export function shapContribution(d: {
  shap_value?: number
  contribution?: number
}): number {
  return d.shap_value ?? d.contribution ?? 0
}
