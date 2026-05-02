import { FileDown } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import type { PortfolioItem } from '@/store/portfolioStore'
import { usePropertyStore } from '@/store/propertyStore'
import { cn } from '@/lib/utils'
import type { OverviewSlug } from '@/utils/pdf/generateOverviewPdf'

type EngineProps = {
  variant: 'engine'
  engine: 'valuation' | 'liquidity' | 'fraud'
  disabled?: boolean
  className?: string
}

type PortfolioProps = {
  variant: 'portfolio'
  items: PortfolioItem[]
  displayName: string
  email: string
  disabled?: boolean
  className?: string
}

type OverviewProps = {
  variant: 'overview'
  slug: OverviewSlug
  disabled?: boolean
  className?: string
}

export type DownloadReportButtonProps = EngineProps | PortfolioProps | OverviewProps

export function DownloadReportButton(props: DownloadReportButtonProps) {
  const last = usePropertyStore((s) => s.lastPropertyRequest)
  const result = usePropertyStore((s) => s.valuationResult)

  const handle = () => {
    void (async () => {
      try {
        if (props.variant === 'overview') {
          const { generateOverviewPdf } = await import('@/utils/pdf/generateOverviewPdf')
          generateOverviewPdf(props.slug)
          toast.success('PDF downloaded')
          return
        }
        if (props.variant === 'portfolio') {
          if (!props.items.length) {
            toast.error('No saved analyses to export')
            return
          }
          const { generatePortfolioRegisterPdf } = await import('@/utils/pdf/generatePortfolioPdf')
          generatePortfolioRegisterPdf(props.displayName, props.email, props.items)
          toast.success('PDF downloaded')
          return
        }
        if (!last || !result) {
          toast.error('Run an analysis first to generate a report')
          return
        }
        if (props.engine === 'valuation') {
          const { generateValuationCollateralPdf } = await import('@/utils/pdf/generateValuationCollateralPdf')
          generateValuationCollateralPdf(last, result)
        } else if (props.engine === 'liquidity') {
          const { generateLiquidityReportPdf } = await import('@/utils/pdf/generateLiquidityPdf')
          generateLiquidityReportPdf(last, result)
        } else {
          const { generateFraudReportPdf } = await import('@/utils/pdf/generateFraudReportPdf')
          generateFraudReportPdf(last, result)
        }
        toast.success('PDF downloaded')
      } catch (e) {
        console.error(e)
        toast.error('Could not generate PDF')
      }
    })()
  }

  const disabledOuter =
    props.disabled ||
    (props.variant === 'engine' &&
      (!last ||
        !result ||
        (props.engine === 'valuation' && !result.market_value) ||
        (props.engine === 'liquidity' && !result.liquidity) ||
        (props.engine === 'fraud' && !result.fraud_risk))) ||
    (props.variant === 'portfolio' && !props.items.length)

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn('border-stone-300 text-stone-800', props.className)}
      disabled={disabledOuter}
      onClick={handle}
    >
      <FileDown className="h-4 w-4" aria-hidden />
      Download report
    </Button>
  )
}
