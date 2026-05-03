import { createA4Doc, drawHeaderBand, stampFooters } from '@/utils/pdf/pdfDoc'
import { writeKeyValueFactorsSection } from '@/utils/pdf/pdfReportText'
import {
  drawConfidenceHuman,
  drawLiquidityHuman,
  drawLoanRecommendationHuman,
  drawMarketValueHuman,
  drawPropertySnapshotCard,
  drawRiskAlertsHuman,
} from '@/utils/pdf/valuationPdfHuman'
import type { ValuationRequest, ValuationResponse } from '@/types/api.types'

function safeFilePart(s: string): string {
  return s.replace(/[^\w\-]+/g, '_').slice(0, 48) || 'property'
}

/**
 * Human-readable collateral valuation PDF (jsPDF).
 * Order: property snapshot → value → liquidity → loan → risks → value factors → confidence.
 */
export function generateValuationCollateralPdf(req: ValuationRequest, res: ValuationResponse): void {
  const doc = createA4Doc()
  let y = drawHeaderBand(doc, 'Collateral valuation report')
  const generated = new Date().toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })

  y = drawPropertySnapshotCard(doc, y, req, generated)

  y = drawMarketValueHuman(doc, y, res.market_value)

  y = drawLiquidityHuman(doc, y, res.liquidity)

  y = drawLoanRecommendationHuman(doc, y, res.distress_value, res.underwriting)

  y = drawRiskAlertsHuman(doc, y, res.fraud_risk, res.fraud_risk.flag_commentary)

  y = writeKeyValueFactorsSection(doc, y, res.shap_value_drivers, { variant: 'valuation', topN: 5 })

  const c = res.confidence
  y = drawConfidenceHuman(doc, y, c.score, c.grade, c.manual_review, c.review_reason)

  stampFooters(doc)
  const fname = `CollatAI_Valuation_${safeFilePart(req.city)}_${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(fname)
}
