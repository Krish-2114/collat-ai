import {
  createA4Doc,
  drawHeaderBand,
  drawParagraph,
  drawSectionTitle,
  ensureY,
  stampFooters,
} from '@/utils/pdf/pdfDoc'
import { PDF } from '@/utils/pdf/pdfTheme'

export type OverviewSlug = 'landing' | 'company' | 'models' | 'login'

const CONTENT: Record<
  OverviewSlug,
  { file: string; title: string; sections: { h: string; body: string[] }[] }
> = {
  landing: {
    file: 'CollatAI_Platform_overview',
    title: 'Platform overview',
    sections: [
      {
        h: 'Purpose',
        body: [
          'Collat.AI delivers institutional collateral intelligence for Indian real estate — valuation bands, distress overlays, liquidity indices, and fraud signals in a single inference stack suitable for credit and risk workflows.',
        ],
      },
      {
        h: 'Core engines',
        body: [
          'Value Engine: market, distress, and confidence with plain-language value drivers for audit.',
          'Liquidity Engine: resale potential (RPI), time-to-liquidate, and exit certainty.',
          'Risk Engine: deterministic rules plus anomaly detection for documentation and collateral integrity.',
        ],
      },
      {
        h: 'Governance',
        body: [
          'Model output is indicative and must be used with policy overlays, independent legal verification, and human approval for lending decisions.',
        ],
      },
    ],
  },
  company: {
    file: 'CollatAI_Company_memo',
    title: 'Company memorandum',
    sections: [
      {
        h: 'About Collat.AI',
        body: [
          'Collat.AI builds multi-city collateral intelligence — valuation, liquidity, and fraud signals — in a desktop-friendly workflow backed by a FastAPI inference stack.',
        ],
      },
      {
        h: 'Deployment',
        body: [
          'Teams may self-host the API alongside the web client. API documentation is available from the running server for integration and regression testing.',
        ],
      },
      {
        h: 'Contact',
        body: ['krish.r.shah2004@gmail.com — for demonstrations, security review packs, and enterprise onboarding.'],
      },
    ],
  },
  models: {
    file: 'CollatAI_Models_summary',
    title: 'AI models — executive summary',
    sections: [
      {
        h: 'Value Engine',
        body: [
          'Inputs: city, locality, property type, area, age, floor, occupancy, infrastructure score.',
          'Outputs: market value band, distress value, valuation band, confidence score — with key value factors for audit.',
        ],
      },
      {
        h: 'Liquidity Engine',
        body: [
          'Inputs: micro-market trends, demand signals, property type, infrastructure score.',
          'Outputs: liquidity score (RPI), estimated sale window — designed for recovery and liquidity stress testing.',
        ],
      },
      {
        h: 'Risk Engine',
        body: [
          'Inputs: ownership, registry, legal signals, property metadata.',
          'Outputs: risk rating posture, ownership match state, legal risk summary — for escalations prior to disbursement.',
        ],
      },
    ],
  },
  login: {
    file: 'CollatAI_Session_security_notice',
    title: 'Session & data handling notice',
    sections: [
      {
        h: 'Authentication',
        body: [
          'Portfolio features use local session state in this client build. Credentials are not transmitted to Collat.AI production services unless you explicitly configure a backend integration.',
        ],
      },
      {
        h: 'Saved analyses',
        body: [
          'Items saved to the portfolio are stored in browser local storage for the signed-in profile. Clear site data or sign out on shared machines to remove residual context.',
        ],
      },
      {
        h: 'Sensitive payloads',
        body: [
          'Property submissions sent to your configured API should traverse TLS and follow your institution’s data classification policy.',
        ],
      },
    ],
  },
}

export function generateOverviewPdf(slug: OverviewSlug): void {
  const spec = CONTENT[slug]
  const doc = createA4Doc()
  let y = drawHeaderBand(doc, spec.title)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...PDF.primary700)
  doc.text(`Generated: ${new Date().toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}`, PDF.margin, y)
  y += 10

  for (const sec of spec.sections) {
    y = ensureY(doc, y, 28)
    y = drawSectionTitle(doc, sec.h, y)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...PDF.primary800)
    for (const para of sec.body) {
      y = drawParagraph(doc, para, PDF.margin, y, PDF.contentW, 4.2)
      y += 2
    }
    y += 4
  }

  stampFooters(doc)
  doc.save(`${spec.file}_${new Date().toISOString().slice(0, 10)}.pdf`)
}
