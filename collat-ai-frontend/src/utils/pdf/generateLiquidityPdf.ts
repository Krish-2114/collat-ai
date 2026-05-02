import { CITY_INFO } from '@/utils/constants'
import {
  createA4Doc,
  drawHeaderBand,
  drawParagraph,
  drawSectionTitle,
  ensureY,
  stampFooters,
  wrapLines,
} from '@/utils/pdf/pdfDoc'
import { writeRpiText, writeShapDriversText } from '@/utils/pdf/pdfReportText'
import { PDF } from '@/utils/pdf/pdfTheme'
import { formatPropertyAddressLine, propertyDetailRows } from '@/utils/pdf/propertyFormat'
import type { CityName, ValuationRequest, ValuationResponse } from '@/types/api.types'
import { formatPercentage } from '@/utils/formatters'

function safeFilePart(s: string): string {
  return s.replace(/[^\w\-]+/g, '_').slice(0, 48) || 'property'
}

export function generateLiquidityReportPdf(req: ValuationRequest, res: ValuationResponse): void {
  const doc = createA4Doc()
  let y = drawHeaderBand(doc, 'Liquidity intelligence memorandum')
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

  const liq = res.liquidity
  y = ensureY(doc, y, 36)
  y = drawSectionTitle(doc, 'Resale potential index (RPI)', y)
  y = writeRpiText(doc, y, liq.rpi_score, liq.rpi_label)

  y = ensureY(doc, y, 32)
  y = drawSectionTitle(doc, 'Time to liquidate & exit certainty', y)
  doc.setFontSize(9)
  doc.setTextColor(...PDF.primary800)
  doc.text(`Liquidity band: ${liq.liquidity_band} · Grade: ${liq.liquidity_grade}`, PDF.margin, y)
  y += 5
  doc.text(
    `TTL window: ${liq.ttl_days_low}–${liq.ttl_days_high} days (estimate ${liq.ttl_days_estimate} days)`,
    PDF.margin,
    y,
  )
  y += 5
  doc.text(`Exit certainty (90d): ${formatPercentage(liq.exit_certainty_90d / 100, true)}`, PDF.margin, y)
  y += 8

  const city = req.city as CityName
  const info = CITY_INFO[city]
  y = ensureY(doc, y, 20)
  y = drawSectionTitle(doc, 'Market context (indicative)', y)
  const note = `City tier ${info.tier} · indicative base PSF ₹${info.base_psf.toLocaleString('en-IN')} — RPI ${liq.rpi_score.toFixed(0)} vs typical premium micro-markets in this band.`
  y = drawParagraph(doc, note, PDF.margin, y, PDF.contentW, 3.8)

  y = ensureY(doc, y, 48)
  y = drawSectionTitle(doc, 'Top 5 SHAP liquidity drivers', y)
  y = writeShapDriversText(doc, y, res.shap_liquidity_drivers ?? [], 5)

  stampFooters(doc)
  doc.save(`CollatAI_Liquidity_${safeFilePart(req.city)}_${new Date().toISOString().slice(0, 10)}.pdf`)
}
