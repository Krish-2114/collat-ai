import type { jsPDF } from 'jspdf'

import type { ShapDriver } from '@/types/api.types'
import { shapContribution } from '@/utils/formatters'
import { drawReadableSectionTitle, ensureY, wrapLines } from '@/utils/pdf/pdfDoc'
import { PDF } from '@/utils/pdf/pdfTheme'

const S = PDF.semantic

/** Plain-language value / liquidity driver list (no model-internals wording). */
export function writeKeyValueFactorsSection(
  doc: jsPDF,
  y: number,
  drivers: ShapDriver[],
  opts: { variant: 'valuation' | 'liquidity'; topN: number },
): number {
  const title = opts.variant === 'valuation' ? 'Key value factors' : 'Key liquidity factors'
  y = drawReadableSectionTitle(doc, title, y)
  const sorted = [...drivers]
    .sort((a, b) => Math.abs(shapContribution(b)) - Math.abs(shapContribution(a)))
    .slice(0, opts.topN)
  if (!sorted.length) {
    y = ensureY(doc, y, 10)
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    doc.setTextColor(...S.muted)
    const emptyMsg =
      opts.variant === 'valuation'
        ? 'Detailed breakdown of individual price drivers is not available for this run. The valuation is based on comparable sales, location quality, and recent market movement in the area.'
        : 'Detailed breakdown of individual liquidity drivers is not available for this run. Scores still reflect local resale activity, typical exit timelines, and comparable turnover patterns.'
    const lines = wrapLines(doc, emptyMsg, PDF.contentW)
    doc.text(lines, PDF.margin, y)
    doc.setFont('helvetica', 'normal')
    return y + lines.length * 4 + 4
  }
  sorted.forEach((d, i) => {
    y = ensureY(doc, y, 14)
    const name = (d.display_name ?? d.feature).replace(/_/g, ' ')
    const v = shapContribution(d)
    const direction =
      opts.variant === 'valuation'
        ? v >= 0
          ? 'Supports a higher estimate'
          : 'Weighs on the estimate'
        : v >= 0
          ? 'Supports a quicker exit view'
          : 'Suggests a longer or less certain exit'
    const extra = d.commentary ? ` — ${d.commentary}` : ''
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...S.heading)
    doc.text(`${i + 1}. ${name}`, PDF.margin, y)
    y += 4.2
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...S.body)
    const body = `${direction}${extra}`
    for (const ln of wrapLines(doc, body, PDF.contentW)) {
      doc.text(ln, PDF.margin, y)
      y += 3.8
    }
    y += 2
  })
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
  return writeKeyValueFactorsSection(doc, y, drivers, { variant: 'liquidity', topN })
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
