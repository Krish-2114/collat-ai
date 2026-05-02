import {
  createA4Doc,
  drawHeaderBand,
  drawSectionTitle,
  ensureY,
  stampFooters,
  wrapLines,
} from '@/utils/pdf/pdfDoc'
import { PDF } from '@/utils/pdf/pdfTheme'
import type { PortfolioItem } from '@/store/portfolioStore'

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function generatePortfolioRegisterPdf(displayName: string, email: string, items: PortfolioItem[]): void {
  const doc = createA4Doc()
  let y = drawHeaderBand(doc, 'Saved analyses register')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...PDF.primary700)
  doc.text(`Prepared for: ${displayName} (${email})`, PDF.margin, y)
  y += 5
  doc.text(`As of: ${new Date().toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}`, PDF.margin, y)
  y += 10

  y = drawSectionTitle(doc, 'Register of saved engine runs', y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...PDF.primary800)
  doc.text('Rows reflect snapshots saved from Valuation, Liquidity, and Fraud workspaces.', PDF.margin, y)
  y += 8

  const colDate = PDF.margin
  const colEng = PDF.margin + 42
  const colTitle = PDF.margin + 68
  const wTitle = PDF.contentW - 68

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...PDF.primary600)
  doc.text('Captured', colDate, y)
  doc.text('Engine', colEng, y)
  doc.text('Title / subtitle', colTitle, y)
  y += 5
  doc.setDrawColor(...PDF.rule)
  doc.line(PDF.margin, y, 210 - PDF.margin, y)
  y += 4

  doc.setFont('helvetica', 'normal')
  for (const item of items) {
    y = ensureY(doc, y, 22)
    doc.setFontSize(7.5)
    doc.setTextColor(...PDF.primary700)
    doc.text(formatWhen(item.createdAt).slice(0, 22), colDate, y)
    doc.setTextColor(...PDF.primary900)
    doc.text(item.engine.toUpperCase().slice(0, 11), colEng, y)
    const titleBlock = `${item.title}\n${item.subtitle}`
    const lines = wrapLines(doc, titleBlock, wTitle)
    doc.setTextColor(...PDF.primary800)
    doc.text(lines, colTitle, y)
    y += Math.max(lines.length * 3.6, 8) + 2
  }

  stampFooters(doc)
  doc.save(`CollatAI_Portfolio_${new Date().toISOString().slice(0, 10)}.pdf`)
}
