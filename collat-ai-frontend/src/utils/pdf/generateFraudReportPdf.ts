import { FRAUD_FLAG_LABELS } from '@/utils/constants'
import {
  createA4Doc,
  drawHeaderBand,
  drawSectionTitle,
  ensureY,
  stampFooters,
  wrapLines,
} from '@/utils/pdf/pdfDoc'
import { PDF } from '@/utils/pdf/pdfTheme'
import { formatPropertyAddressLine, propertyDetailRows } from '@/utils/pdf/propertyFormat'
import type { ValuationRequest, ValuationResponse } from '@/types/api.types'
import { formatPercentage } from '@/utils/formatters'

function safeFilePart(s: string): string {
  return s.replace(/[^\w\-]+/g, '_').slice(0, 48) || 'property'
}

export function generateFraudReportPdf(req: ValuationRequest, res: ValuationResponse): void {
  const doc = createA4Doc()
  let y = drawHeaderBand(doc, 'Fraud & collateral risk memorandum')
  const generated = new Date().toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...PDF.primary700)
  doc.text(`Generated: ${generated}`, PDF.margin, y)
  y += 8

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...PDF.primary900)
  const addrLines = wrapLines(doc, formatPropertyAddressLine(req), PDF.contentW)
  doc.text(addrLines, PDF.margin, y)
  y += addrLines.length * 5 + 4

  y = ensureY(doc, y, 36)
  y = drawSectionTitle(doc, 'Property reference', y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  for (const row of propertyDetailRows(req)) {
    doc.setTextColor(...PDF.primary700)
    doc.text(row.label, PDF.margin, y)
    doc.setTextColor(...PDF.primary900)
    doc.text(row.value.slice(0, 70), PDF.margin + 52, y)
    y += 4.5
  }
  y += 4

  const f = res.fraud_risk
  y = ensureY(doc, y, 28)
  y = drawSectionTitle(doc, 'Composite assessment', y)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PDF.primary600)
  doc.text(`Severity: ${f.severity}`, PDF.margin, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...PDF.primary800)
  doc.text(`Model fraud probability: ${formatPercentage(f.fraud_probability, true)}`, PDF.margin, y)
  y += 5
  doc.text(`Deterministic rules triggered: ${f.flags_raised} of 10`, PDF.margin, y)
  y += 5
  doc.text(`Isolation Forest anomaly: ${f.is_statistical_anomaly ? 'Flagged' : 'Not flagged'}`, PDF.margin, y)
  y += 8

  y = ensureY(doc, y, 24)
  y = drawSectionTitle(doc, 'Triggered rules (detail)', y)
  if (f.flag_commentary.length === 0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...PDF.primary700)
    doc.text('No rules fired — payload is clean on the deterministic policy surface.', PDF.margin, y)
    y += 8
  } else {
    for (const row of f.flag_commentary) {
      y = ensureY(doc, y, 26)
      const title = FRAUD_FLAG_LABELS[row.flag_id] ?? row.flag_id
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(...PDF.primary600)
      doc.text(title.slice(0, 90), PDF.margin, y)
      y += 4.5
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...PDF.primary800)
      for (const line of wrapLines(doc, `${row.rule} — ${row.commentary}`, PDF.contentW)) {
        y = ensureY(doc, y, 6)
        doc.text(line, PDF.margin, y)
        y += 3.8
      }
      y += 2
    }
  }

  y = ensureY(doc, y, 28)
  y = drawSectionTitle(doc, 'Recommended next steps', y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...PDF.primary800)
  const steps = [
    'Treat model output as triage, not adjudication. Escalate when anomaly and rules align.',
    'Refresh registry / title verification where commentary references documentation gaps.',
    'Re-score after material field corrections; retain audit trail of payload versions.',
  ]
  for (const s of steps) {
    const lines = wrapLines(doc, `• ${s}`, PDF.contentW)
    for (const ln of lines) {
      y = ensureY(doc, y, 5)
      doc.text(ln, PDF.margin, y)
      y += 4
    }
    y += 1
  }

  stampFooters(doc)
  doc.save(`CollatAI_Fraud_${safeFilePart(req.city)}_${new Date().toISOString().slice(0, 10)}.pdf`)
}
