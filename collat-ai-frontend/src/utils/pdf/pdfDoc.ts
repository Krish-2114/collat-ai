import { jsPDF } from 'jspdf'

import { PDF } from '@/utils/pdf/pdfTheme'

export function createA4Doc(): jsPDF {
  return new jsPDF({ unit: 'mm', format: 'a4', compress: true })
}

export function stampFooters(doc: jsPDF, confidentiality = 'Collat.AI — confidential · for internal credit use only') {
  const total = doc.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    doc.setDrawColor(...PDF.rule)
    doc.setLineWidth(0.2)
    doc.line(PDF.margin, PDF.footerY - 4, 210 - PDF.margin, PDF.footerY - 4)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...PDF.primary700)
    doc.text(`Page ${i} of ${total}`, PDF.margin, PDF.footerY)
    doc.text(confidentiality, 210 - PDF.margin, PDF.footerY, { align: 'right' })
  }
}

export function drawHeaderBand(doc: jsPDF, documentTitle: string): number {
  doc.setFillColor(...PDF.primary50)
  doc.rect(0, 0, 210, 26, 'F')
  doc.setDrawColor(...PDF.rule)
  doc.setLineWidth(0.35)
  doc.line(0, 26, 210, 26)
  doc.setTextColor(...PDF.primary600)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('COLLAT.AI', PDF.margin, 11)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...PDF.primary800)
  doc.text('Collateral intelligence', PDF.margin, 18)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...PDF.primary900)
  doc.text(documentTitle, 210 - PDF.margin, 14, { align: 'right' })
  doc.setTextColor(...PDF.primary800)
  return 32
}

export function wrapLines(doc: jsPDF, text: string, maxW: number): string[] {
  return doc.splitTextToSize(text, maxW)
}

export function drawParagraph(doc: jsPDF, text: string, x: number, y: number, maxW: number, lineH: number): number {
  doc.setTextColor(...PDF.primary800)
  const lines = wrapLines(doc, text, maxW)
  doc.text(lines, x, y)
  return y + lines.length * lineH
}

export function drawSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...PDF.primary600)
  doc.text(title.toUpperCase(), PDF.margin, y)
  doc.setDrawColor(...PDF.rule)
  doc.setLineWidth(0.35)
  doc.line(PDF.margin, y + 1.5, 210 - PDF.margin, y + 1.5)
  doc.setTextColor(...PDF.primary800)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  return y + 8
}

/** Human-readable report section heading (sentence case, neutral rule). */
export function drawReadableSectionTitle(doc: jsPDF, title: string, y: number): number {
  const S = PDF.semantic
  y = ensureY(doc, y, 14)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...S.heading)
  doc.text(title, PDF.margin, y)
  const ruleY = y + 5
  doc.setDrawColor(...S.track)
  doc.setLineWidth(0.35)
  doc.line(PDF.margin, ruleY, PDF.margin + PDF.contentW, ruleY)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...S.body)
  return ruleY + 7
}

export function ensureY(doc: jsPDF, y: number, blockH: number): number {
  if (y + blockH > PDF.footerY - 8) {
    doc.addPage()
    return PDF.margin + 6
  }
  return y
}
