import { BookmarkPlus } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { usePortfolioStore, type PortfolioEngine } from '@/store/portfolioStore'
import { usePropertyStore } from '@/store/propertyStore'
import type { ValuationRequest, ValuationResponse } from '@/types/api.types'

function buildCopy(
  engine: PortfolioEngine,
  req: ValuationRequest,
  res: ValuationResponse,
): { title: string; subtitle: string } {
  const title = `${req.city} — ${req.locality || req.zone || req.property_type} · ${req.area_sqft.toLocaleString('en-IN')} sqft`

  if (engine === 'valuation') {
    const p50 = res.market_value.p50_total
    return {
      title,
      subtitle: `P50 ₹${Math.round(p50).toLocaleString('en-IN')} · confidence ${res.confidence.score.toFixed(0)}`,
    }
  }
  if (engine === 'liquidity') {
    const liq = res.liquidity
    return {
      title,
      subtitle: `RPI ${liq.rpi_score.toFixed(0)} · ${liq.liquidity_band} band`,
    }
  }
  const f = res.fraud_risk
  return {
    title,
    subtitle: `${f.severity} · ${(f.fraud_probability * 100).toFixed(1)}% model probability`,
  }
}

type Props = {
  engine: PortfolioEngine
  /** When false, button is not rendered */
  disabled?: boolean
}

export function SaveAnalysisButton({ engine, disabled }: Props) {
  const user = useAuthStore((s) => s.user)
  const addSnapshot = usePortfolioStore((s) => s.addSnapshot)
  const last = usePropertyStore((s) => s.lastPropertyRequest)
  const result = usePropertyStore((s) => s.valuationResult)

  if (!user) return null

  const ready =
    last &&
    result &&
    (engine === 'valuation'
      ? Boolean(result.market_value)
      : engine === 'liquidity'
        ? Boolean(result.liquidity)
        : Boolean(result.fraud_risk))

  if (!ready || disabled) return null

  const save = () => {
    const { title, subtitle } = buildCopy(engine, last!, result!)
    addSnapshot(user.id, engine, title, subtitle)
    toast.success('Saved to your portfolio')
  }

  return (
    <Button type="button" variant="outline" size="sm" className="border-primary-300 text-primary-800" onClick={save}>
      <BookmarkPlus className="h-4 w-4" aria-hidden />
      Save to portfolio
    </Button>
  )
}
