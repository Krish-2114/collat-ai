import type { jsPDF } from 'jspdf'

import type {
  DistressValueResponse,
  FraudFlagCommentary,
  FraudResponse,
  LiquidityResponse,
  MarketValueResponse,
  UnderwritingResponse,
  ValuationRequest,
} from '@/types/api.types'
import { FRAUD_FLAG_LABELS } from '@/utils/constants'
import { drawReadableSectionTitle, ensureY, wrapLines } from '@/utils/pdf/pdfDoc'
import { PDF } from '@/utils/pdf/pdfTheme'
import { formatPropertyHeroLine, formatPropertySpecsLine } from '@/utils/pdf/propertyFormat'
import { formatCurrency, formatCurrencyFull } from '@/utils/formatters'

const S = PDF.semantic

function drawItalicMuted(doc: jsPDF, text: string, x: number, y: number, maxW: number, lineH: number): number {
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(9)
  doc.setTextColor(...S.muted)
  const lines = wrapLines(doc, text, maxW)
  doc.text(lines, x, y)
  doc.setFont('helvetica', 'normal')
  return y + lines.length * lineH
}

export function drawPropertySnapshotCard(doc: jsPDF, y: number, req: ValuationRequest, generated: string): number {
  const x0 = PDF.margin
  const cardW = PDF.contentW
  const pad = 6
  const innerW = cardW - pad * 2

  /** Standard PDF fonts (Helvetica) cannot render emoji; keep this line ASCII-only. */
  const heroLine = formatPropertyHeroLine(req)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  const heroLines = wrapLines(doc, heroLine, innerW)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  const specLines = wrapLines(doc, formatPropertySpecsLine(req).replace(/\s*\|\s*/g, ' | '), innerW)

  const lineHHero = 6
  const lineHSpec = 4.4
  const footerH = 7
  const cardH = Math.max(40, pad + 4 + heroLines.length * lineHHero + 3 + specLines.length * lineHSpec + footerH + pad)

  y = ensureY(doc, y, cardH + 14)
  const top = y

  doc.setFillColor(...S.cardBg)
  doc.roundedRect(x0, top, cardW, cardH, 2.5, 2.5, 'F')
  doc.setDrawColor(...S.track)
  doc.setLineWidth(0.25)
  doc.roundedRect(x0, top, cardW, cardH, 2.5, 2.5, 'S')

  let cy = top + pad + 4
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...S.heading)
  doc.text(heroLines, x0 + pad, cy)
  cy += heroLines.length * lineHHero + 2

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...S.body)
  doc.text(specLines, x0 + pad, cy)
  cy += specLines.length * lineHSpec

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...S.muted)
  doc.text(generated, x0 + cardW - pad, top + cardH - pad, { align: 'right' })

  return top + cardH + 10
}

export function drawMarketValueHuman(doc: jsPDF, y: number, mv: MarketValueResponse): number {
  y = drawReadableSectionTitle(doc, 'Estimated market value', y)
  y = ensureY(doc, y, 38)

  const x0 = PDF.margin
  const w = PDF.contentW
  const barY = y
  const barH = 5
  const span = Math.max(1, mv.p90_total - mv.p10_total)
  const rel50 = Math.min(1, Math.max(0, (mv.p50_total - mv.p10_total) / span))
  const wLow = w * rel50
  const wHigh = w - wLow

  doc.setFillColor(...S.track)
  doc.roundedRect(x0, barY, w, barH, 1, 1, 'F')
  doc.setFillColor(...S.blueBg)
  doc.roundedRect(x0, barY, wLow, barH, 1, 1, 'F')
  doc.setFillColor(...S.blue)
  doc.roundedRect(x0 + wLow, barY, wHigh, barH, 1, 1, 'F')
  doc.setDrawColor(...S.blue)
  doc.setLineWidth(0.45)
  const tickX = x0 + rel50 * w
  doc.line(tickX, barY - 0.8, tickX, barY + barH + 0.8)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...S.muted)
  doc.text('Lower end', x0, barY + barH + 4)
  const cx = Math.min(x0 + w - 40, Math.max(x0 + 22, tickX - 18))
  doc.text('Central estimate', cx, barY + barH + 4)
  doc.text('Upper end', x0 + w, barY + barH + 4, { align: 'right' })
  y = barY + barH + 10

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...S.body)
  doc.text(
    `Central estimate: ${formatCurrency(mv.p50_total)} (${formatCurrencyFull(mv.p50_total)}) — ₹${mv.p50_sqft.toLocaleString('en-IN')} per sqft`,
    x0,
    y,
  )
  y += 5
  doc.text(
    `Value range: between ${formatCurrency(mv.p10_total)} and ${formatCurrency(mv.p90_total)} (${formatCurrencyFull(mv.p10_total)} – ${formatCurrencyFull(mv.p90_total)})`,
    x0,
    y,
  )
  y += 6
  y = drawItalicMuted(
    doc,
    'What this means: Based on market analysis, we are about 80% confident the true value falls in this range. The central figure is our best single-point estimate for discussion and benchmarking.',
    x0,
    y,
    w,
    3.8,
  )
  return y + 6
}

function liquidityHeadlineLabel(liq: LiquidityResponse): string {
  const s = liq.rpi_score
  if (s >= 80) return 'Excellent liquidity'
  if (s >= 60) return 'Strong liquidity'
  if (s >= 40) return 'Moderate liquidity'
  return 'Weaker liquidity'
}

export function drawLiquidityHuman(doc: jsPDF, y: number, liq: LiquidityResponse): number {
  y = drawReadableSectionTitle(doc, 'How fast can this sell?', y)
  y = ensureY(doc, y, 36)
  const x0 = PDF.margin
  const check = liq.rpi_score >= 70 ? '  (strong)' : ''
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...S.heading)
  doc.text(`${Math.round(liq.rpi_score)}/100${check}`, x0, y)
  y += 8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...S.greenDark)
  doc.text(liquidityHeadlineLabel(liq), x0, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...S.body)
  doc.text(
    `Expected time to sell: ${liq.ttl_days_low}–${liq.ttl_days_high} days (most likely around ${liq.ttl_days_estimate} days).`,
    x0,
    y,
  )
  y += 5
  y = drawItalicMuted(
    doc,
    'What this means: This score reflects how quickly similar collateral typically clears the market when priced in line with buyer demand. Higher scores suggest an easier exit if the loan ever needed to be recovered through sale.',
    x0,
    y,
    PDF.contentW,
    3.8,
  )
  return y + 6
}

export function drawLoanRecommendationHuman(
  doc: jsPDF,
  y: number,
  distress: DistressValueResponse,
  uw: UnderwritingResponse,
): number {
  y = drawReadableSectionTitle(doc, 'Recommended loan amount', y)
  y = ensureY(doc, y, 40)
  const x0 = PDF.margin
  const w = PDF.contentW

  doc.setFillColor(...S.cardBg)
  doc.roundedRect(x0, y, w, 16, 2, 2, 'F')
  doc.setDrawColor(...S.track)
  doc.roundedRect(x0, y, w, 16, 2, 2, 'S')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(...S.heading)
  doc.text(`Maximum safe loan: ${formatCurrency(uw.max_safe_loan_inr)}`, x0 + 5, y + 10)
  y += 20

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(...S.body)
  doc.text(
    `Based on distress value range: ${formatCurrency(distress.low_total)} – ${formatCurrency(distress.high_total)} (${formatCurrencyFull(distress.low_total)} – ${formatCurrencyFull(distress.high_total)})`,
    x0,
    y,
  )
  y += 4.5
  doc.text(`Loan-to-value ratio: ${uw.eligible_ltv_pct.toFixed(1)}%`, x0, y)
  y += 4.5
  doc.text(
    `Discount versus market (quick-sale scenario): ${distress.discount_lo_pct.toFixed(1)}% – ${distress.discount_hi_pct.toFixed(1)}%`,
    x0,
    y,
  )
  y += 6
  y = drawItalicMuted(
    doc,
    `What this means: If the property had to be sold quickly, we bracket expected proceeds between ${formatCurrency(distress.low_total)} and ${formatCurrency(distress.high_total)}. At ${uw.eligible_ltv_pct.toFixed(1)}% loan-to-value, a facility of about ${formatCurrency(uw.max_safe_loan_inr)} leaves headroom against that stress case.`,
    x0,
    y,
    w,
    3.8,
  )
  if (uw.note) {
    y += 4
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...S.muted)
    const nl = wrapLines(doc, uw.note, w)
    doc.text(nl, x0, y)
    y += nl.length * 3.8
  }
  return y + 6
}

type AlertLevel = 'high' | 'medium' | 'low'

function levelForFlag(flagId: string): AlertLevel {
  if (flagId === 'R01' || flagId === 'R07' || flagId === 'R08') return 'high'
  return 'medium'
}

function alertStyles(level: AlertLevel): { bg: [number, number, number]; fg: [number, number, number]; tag: string } {
  if (level === 'high') return { bg: S.redBg, fg: S.redDark, tag: 'HIGH RISK' }
  if (level === 'medium') return { bg: S.amberBg, fg: S.amberDark, tag: 'MEDIUM RISK' }
  return { bg: S.greenBg, fg: S.greenDark, tag: 'LOW RISK' }
}

function whyTemplate(flagId: string): string {
  const t: Record<string, string> = {
    R01:
      'Pricing that sits far above typical benchmarks can reflect seller expectations, data gaps, or behaviors that deserve a closer look before you rely on the collateral.',
    R07:
      'Large gaps between transacted or asking levels and government reference rates can reflect rapid appreciation, reporting differences, or the need for on-ground verification.',
    R08:
      'Title and encumbrance questions can directly affect enforceability. These items are usually resolved with legal review and supporting documentation.',
    R02:
      'Unusually low indicated values can affect coverage ratios and deserve a sanity check against recent comparables.',
    R04:
      'Inconsistent area or layout signals can point to data capture issues or non-standard structures.',
    R05:
      'Age and condition mismatches can skew automated benchmarks until the file is reconciled.',
    R06:
      'Floor-level inconsistencies can change how buyers perceive the unit and how models interpret the asset.',
    R09:
      'Very low prices versus reference bands can indicate distress, special circumstances, or incomplete inputs.',
    R10:
      'Rental yield outliers can signal lease terms, furnished lets, or comparability issues in the rent series.',
    R03: 'Income-based benchmarks are out of line with the rest of the file; treat as a prompt to validate assumptions.',
  }
  return t[flagId] ?? 'This signal is worth confirming with your standard collateral checks before you treat the case as routine.'
}

function actionForLevel(level: AlertLevel): string {
  if (level === 'high') return 'Physical inspection, independent checks, or escalated review are recommended before approval.'
  if (level === 'medium') return 'Confirm facts with documentation or a targeted follow-up before finalizing terms.'
  return 'No extra action beyond your normal file checks is indicated solely from this alert.'
}

export function drawRiskAlertsHuman(
  doc: jsPDF,
  y: number,
  f: FraudResponse,
  commentary: FraudFlagCommentary[],
): number {
  y = drawReadableSectionTitle(doc, 'Risk alerts', y)
  y = ensureY(doc, y, 28)

  const x0 = PDF.margin
  const w = PDF.contentW

  if (commentary.length === 0) {
    const st = alertStyles('low')
    doc.setFillColor(...st.bg)
    doc.roundedRect(x0, y, w, 18, 2, 2, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...st.fg)
    doc.text('No high-priority rules triggered', x0 + 4, y + 6)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const lines = wrapLines(doc, 'Automated policy checks did not raise items that require immediate escalation on this submission.', w - 8)
    doc.text(lines, x0 + 4, y + 11)
    y += 22
  } else {
    const maxCards = 5
    const innerW = w - 8
    for (let i = 0; i < Math.min(commentary.length, maxCards); i++) {
      const row = commentary[i]
      const level = levelForFlag(row.flag_id)
      const st = alertStyles(level)
      const title = (FRAUD_FLAG_LABELS[row.flag_id] ?? row.flag_id).replace(/\b\w/g, (c) => c.toUpperCase())
      const issue = row.rule
      const why = [row.commentary, whyTemplate(row.flag_id)].filter(Boolean).join(' ')
      const action = actionForLevel(level)

      const linesIssue = wrapLines(doc, issue, innerW)
      const linesWhy = wrapLines(doc, why, innerW)
      const linesAct = wrapLines(doc, action, innerW)
      const cardH =
        7 +
        5 +
        linesIssue.length * 3.6 +
        5 +
        linesWhy.length * 3.5 +
        5 +
        linesAct.length * 3.5 +
        6

      y = ensureY(doc, y, cardH + 4)
      doc.setFillColor(...st.bg)
      doc.roundedRect(x0, y, w, cardH, 2, 2, 'F')
      doc.setDrawColor(...S.track)
      doc.setLineWidth(0.2)
      doc.roundedRect(x0, y, w, cardH, 2, 2, 'S')

      let innerY = y + 6
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(...st.fg)
      doc.text(`${st.tag}  ·  ${title}`, x0 + 4, innerY)
      innerY += 6
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(...S.heading)
      doc.text('Issue', x0 + 4, innerY)
      innerY += 4
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...S.body)
      for (const ln of linesIssue) {
        doc.text(ln, x0 + 4, innerY)
        innerY += 3.6
      }
      innerY += 2
      doc.setFont('helvetica', 'bold')
      doc.text('Why it matters', x0 + 4, innerY)
      innerY += 4
      doc.setFont('helvetica', 'normal')
      for (const ln of linesWhy) {
        doc.text(ln, x0 + 4, innerY)
        innerY += 3.5
      }
      innerY += 2
      doc.setFont('helvetica', 'bold')
      doc.text('Action', x0 + 4, innerY)
      innerY += 4
      doc.setFont('helvetica', 'normal')
      for (const ln of linesAct) {
        doc.text(ln, x0 + 4, innerY)
        innerY += 3.5
      }
      y += cardH + 5
    }
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(...S.body)
  const anomalyLine = f.is_statistical_anomaly
    ? 'Statistical pattern check: needs review — this property differs from typical patterns in the training mix.'
    : 'Statistical pattern check: passed — the property follows expected overall patterns in the automated screen.'
  y = ensureY(doc, y, 10)
  doc.text(anomalyLine, x0, y)
  y += 6

  const sev = (f.severity || '').toLowerCase()
  let overall = 'Overall risk level: moderate — routine diligence applies.'
  if (sev.includes('critical') || sev.includes('high')) {
    overall = 'Overall risk level: elevated — manual review is strongly recommended.'
  } else if (sev.includes('low')) {
    overall = 'Overall risk level: lower — continue with standard controls.'
  }
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...S.heading)
  doc.text(overall, x0, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...S.body)
  return y + 4
}

export function drawConfidenceHuman(doc: jsPDF, y: number, scoreRaw: number, grade: string, manualReview: boolean, reviewReason?: string | null): number {
  y = drawReadableSectionTitle(doc, 'Data quality & confidence', y)
  y = ensureY(doc, y, 28)
  const x0 = PDF.margin
  const w = PDF.contentW
  const scorePct = scoreRaw <= 1 ? scoreRaw * 100 : scoreRaw

  let barColor = S.red
  if (scorePct >= 90) barColor = S.green
  else if (scorePct >= 70) barColor = S.amber

  doc.setFillColor(...S.track)
  doc.roundedRect(x0, y, w, 5, 1, 1, 'F')
  doc.setFillColor(...barColor)
  doc.roundedRect(x0, y, (w * Math.min(100, Math.max(0, scorePct))) / 100, 5, 1, 1, 'F')
  y += 9

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...S.body)
  doc.text(`Confidence score: ${scorePct.toFixed(1)}% — Grade ${grade.toUpperCase()}`, x0, y)
  y += 5

  const confExplain =
    scorePct >= 90
      ? 'We have strong underlying inputs for this estimate, with solid comparable activity in the area.'
      : scorePct >= 70
        ? 'Data quality is acceptable for directional decisions; treat extreme outcomes with proportionate care.'
        : 'Data is thinner or noisier; lean on additional verification before relying on the numbers alone.'

  y = drawItalicMuted(doc, `What this means: ${confExplain}`, x0, y, w, 3.8)
  y += 2
  const routing = manualReview
    ? 'Routing: This case is flagged for manual review due to risk or policy signals (not necessarily because confidence is low).'
    : 'Routing: No automatic manual-review flag was raised from the confidence module alone.'
  y = drawItalicMuted(doc, routing, x0, y, w, 3.8)
  if (reviewReason) {
    y += 2
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...S.body)
    const rr = wrapLines(doc, String(reviewReason), w)
    doc.text(rr, x0, y)
    y += rr.length * 3.8
  }
  return y + 6
}
