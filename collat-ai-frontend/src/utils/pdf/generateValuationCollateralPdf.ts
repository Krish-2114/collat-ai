import { FRAUD_FLAG_LABELS } from '@/utils/constants'
import { deriveCreditDecision } from '@/utils/pdf/creditDecision'
import {
  createA4Doc,
  drawHeaderBand,
  drawParagraph,
  drawSectionTitle,
  ensureY,
  stampFooters,
  wrapLines,
} from '@/utils/pdf/pdfDoc'
import {
  writeDecisionText,
  writeMarketValueText,
  writeRpiText,
  writeShapDriversText,
} from '@/utils/pdf/pdfReportText'
import { PDF } from '@/utils/pdf/pdfTheme'
import { formatPropertyAddressLine, propertyDetailRows } from '@/utils/pdf/propertyFormat'
import type { ValuationRequest, ValuationResponse } from '@/types/api.types'
import { formatCurrency, formatCurrencyFull, formatPercentage } from '@/utils/formatters'

function safeFilePart(s: string): string {
  return s.replace(/[^\w\-]+/g, '_').slice(0, 48) || 'property'
}

function drawKeyValueBlock(
  doc: ReturnType<typeof createA4Doc>,
  rows: { label: string; value: string }[],
  startY: number,
): number {
  const colW = PDF.contentW / 2 - 4
  let y = startY
  doc.setFontSize(8.5)
  for (let i = 0; i < rows.length; i += 2) {
    const left = rows[i]
    const right = rows[i + 1]
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...PDF.primary700)
    doc.text(left.label, PDF.margin, y)
    doc.setTextColor(...PDF.primary900)
    doc.setFont('helvetica', 'bold')
    const lv = wrapLines(doc, left.value, colW)
    doc.text(lv, PDF.margin, y + 4)
    const lh = Math.max(lv.length * 3.6, 8)

    if (right) {
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...PDF.primary700)
      doc.text(right.label, PDF.margin + PDF.contentW / 2 + 2, y)
      doc.setTextColor(...PDF.primary900)
      doc.setFont('helvetica', 'bold')
      const rv = wrapLines(doc, right.value, colW)
      doc.text(rv, PDF.margin + PDF.contentW / 2 + 2, y + 4)
      const rh = Math.max(rv.length * 3.6, 8)
      y += Math.max(lh, rh) + 3
    } else {
      y += lh + 3
    }
  }
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...PDF.primary800)
  return y + 2
}

export function generateValuationCollateralPdf(req: ValuationRequest, res: ValuationResponse): void {
  const doc = createA4Doc()
  let y = drawHeaderBand(doc, 'Collateral valuation memorandum')
  const generated = new Date().toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...PDF.primary700)
  doc.text(`Generated: ${generated}`, PDF.margin, y)
  y += 8

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...PDF.primary900)
  const addr = formatPropertyAddressLine(req)
  const addrLines = wrapLines(doc, addr, PDF.contentW)
  doc.text(addrLines, PDF.margin, y)
  y += addrLines.length * 5 + 4

  y = ensureY(doc, y, 40)
  y = drawSectionTitle(doc, 'Property details', y)
  y = drawKeyValueBlock(doc, propertyDetailRows(req), y)

  y = ensureY(doc, y, 36)
  y = drawSectionTitle(doc, 'Market value (model band)', y)
  doc.setFontSize(8)
  y = drawParagraph(
    doc,
    'Indicative total value distribution (INR). P50 is the central estimate; P10 and P90 bound the model range.',
    PDF.margin,
    y,
    PDF.contentW,
    3.6,
  )
  y += 2
  y = writeMarketValueText(doc, y, res.market_value)

  y = ensureY(doc, y, 36)
  y = drawSectionTitle(doc, 'Distress value & LTV recommendation', y)
  const dv = res.distress_value
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...PDF.primary800)
  doc.text(
    `Distress range: ${formatCurrency(dv.low_total)} – ${formatCurrency(dv.high_total)} (${formatCurrencyFull(dv.low_total)} – ${formatCurrencyFull(dv.high_total)})`,
    PDF.margin,
    y,
  )
  y += 5
  doc.text(`Discount vs market (model): ${dv.discount_lo_pct.toFixed(1)}% – ${dv.discount_hi_pct.toFixed(1)}%`, PDF.margin, y)
  y += 5
  const u = res.underwriting
  doc.text(`Eligible LTV: ${u.eligible_ltv_pct.toFixed(1)}%`, PDF.margin, y)
  y += 5
  doc.text(`Max safe loan (indicative): ${formatCurrency(u.max_safe_loan_inr)} (${formatCurrencyFull(u.max_safe_loan_inr)})`, PDF.margin, y)
  y += 5
  doc.setFontSize(8)
  doc.setTextColor(...PDF.primary700)
  const noteLines = wrapLines(doc, u.note, PDF.contentW)
  doc.text(noteLines, PDF.margin, y)
  y += noteLines.length * 3.6 + 4

  y = ensureY(doc, y, 28)
  y = drawSectionTitle(doc, 'Liquidity (RPI)', y)
  doc.setFontSize(8)
  doc.setTextColor(...PDF.primary800)
  doc.text(
    `${res.liquidity.liquidity_grade} · ${res.liquidity.liquidity_band} · TTL est. ${res.liquidity.ttl_days_estimate} days (${res.liquidity.ttl_days_low}–${res.liquidity.ttl_days_high})`,
    PDF.margin,
    y,
  )
  y += 6
  y = writeRpiText(doc, y, res.liquidity.rpi_score, res.liquidity.rpi_label)

  y = ensureY(doc, y, 40)
  y = drawSectionTitle(doc, 'Fraud risk & triggered rules', y)
  const f = res.fraud_risk
  doc.setFontSize(9)
  doc.setTextColor(...PDF.primary800)
  doc.text(
    `Composite severity: ${f.severity} · Model probability ${formatPercentage(f.fraud_probability, true)} · Rules triggered: ${f.flags_raised}`,
    PDF.margin,
    y,
  )
  y += 5
  doc.setFontSize(8)
  doc.text(`Statistical anomaly (Isolation Forest): ${f.is_statistical_anomaly ? 'Yes' : 'No'}`, PDF.margin, y)
  y += 6
  if (f.flag_commentary.length === 0) {
    doc.setTextColor(...PDF.primary700)
    doc.text('No deterministic rules fired on this payload.', PDF.margin, y)
    y += 5
  } else {
    for (const row of f.flag_commentary) {
      y = ensureY(doc, y, 22)
      const title = FRAUD_FLAG_LABELS[row.flag_id] ?? row.flag_id
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...PDF.primary600)
      doc.text(title.slice(0, 80), PDF.margin, y)
      y += 4
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...PDF.primary800)
      const ruleLines = wrapLines(doc, row.rule, PDF.contentW)
      doc.text(ruleLines, PDF.margin, y)
      y += ruleLines.length * 3.5
      const comLines = wrapLines(doc, row.commentary, PDF.contentW)
      doc.text(comLines, PDF.margin, y)
      y += comLines.length * 3.5 + 3
    }
  }

  y = ensureY(doc, y, 40)
  y = drawSectionTitle(doc, 'Top 5 SHAP value drivers', y)
  y = writeShapDriversText(doc, y, res.shap_value_drivers, 5)

  y = ensureY(doc, y, 40)
  y = drawSectionTitle(doc, 'Confidence', y)
  const c = res.confidence
  const scorePct = c.score <= 1 ? c.score * 100 : c.score
  doc.setFontSize(9)
  doc.setTextColor(...PDF.primary800)
  doc.text(`Grade ${c.grade} · Score ${formatPercentage(scorePct / 100, true)} · ${c.manual_review ? 'Manual review required' : 'Auto path'}`, PDF.margin, y)
  y += 5
  if (c.review_reason) {
    doc.setFontSize(8)
    doc.setTextColor(...PDF.primary700)
    const rr = wrapLines(doc, c.review_reason, PDF.contentW)
    doc.text(rr, PDF.margin, y)
    y += rr.length * 3.6 + 2
  }
  y += 4

  y = ensureY(doc, y, 36)
  const { decision, rationale } = deriveCreditDecision(res)
  y = writeDecisionText(doc, y, decision, rationale)

  stampFooters(doc)
  const fname = `CollatAI_Valuation_${safeFilePart(req.city)}_${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(fname)
}
