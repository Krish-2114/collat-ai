import type { jsPDF } from 'jspdf'

import type { MarketValueResponse, ShapDriver } from '@/types/api.types'
import { formatCurrency, formatCurrencyFull, shapContribution } from '@/utils/formatters'
import { ensureY, wrapLines } from '@/utils/pdf/pdfDoc'
import { PDF } from '@/utils/pdf/pdfTheme'

/** P10 / P50 / P90 and PSF — text only. */
export function writeMarketValueText(doc: jsPDF, y: number, mv: MarketValueResponse): number {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...PDF.primary800)
  const rows = [
    `P10 (total): ${formatCurrency(mv.p10_total)} — ${formatCurrencyFull(mv.p10_total)}`,
    `P50 (total): ${formatCurrency(mv.p50_total)} — ${formatCurrencyFull(mv.p50_total)}`,
    `P90 (total): ${formatCurrency(mv.p90_total)} — ${formatCurrencyFull(mv.p90_total)}`,
    `Per sqft — P10: ₹${mv.p10_sqft.toLocaleString('en-IN')} · P50: ₹${mv.p50_sqft.toLocaleString('en-IN')} · P90: ₹${mv.p90_sqft.toLocaleString('en-IN')}`,
  ]
  for (const line of rows) {
    doc.text(line, PDF.margin, y)
    y += 4.6
  }
  return y + 2
}

export function writeRpiText(doc: jsPDF, y: number, score: number, label: string): number {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...PDF.primary600)
  doc.text(`RPI score: ${score.toFixed(0)} / 100`, PDF.margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...PDF.primary800)
  doc.text(`Label: ${label}`, PDF.margin, y)
  return y + 6
}

export function writeShapDriversText(doc: jsPDF, y: number, drivers: ShapDriver[], topN: number): number {
  const sorted = [...drivers]
    .sort((a, b) => Math.abs(shapContribution(b)) - Math.abs(shapContribution(a)))
    .slice(0, topN)
  if (!sorted.length) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...PDF.primary700)
    doc.text('No SHAP driver rows returned for this run.', PDF.margin, y)
    return y + 6
  }
  doc.setFontSize(9)
  sorted.forEach((d, i) => {
    const name = (d.display_name ?? d.feature).replace(/_/g, ' ')
    const val = shapContribution(d)
    y = ensureY(doc, y, 10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...PDF.primary600)
    doc.text(`${i + 1}. ${name}`, PDF.margin, y)
    y += 4.2
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...PDF.primary800)
    doc.text(`   SHAP contribution: ${val.toFixed(4)}`, PDF.margin, y)
    y += 5.2
  })
  return y + 2
}

export function writeDecisionText(doc: jsPDF, y: number, decision: string, rationale: string): number {
  y = ensureY(doc, y, 24)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...PDF.primary600)
  doc.text('Underwriting routing (indicative)', PDF.margin, y)
  y += 5
  doc.setFontSize(11)
  doc.setTextColor(...PDF.primary900)
  doc.text(`Decision: ${decision.toUpperCase()}`, PDF.margin, y)
  y += 7
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...PDF.primary800)
  for (const line of wrapLines(doc, rationale, PDF.contentW)) {
    y = ensureY(doc, y, 5)
    doc.text(line, PDF.margin, y)
    y += 4
  }
  return y + 4
}
