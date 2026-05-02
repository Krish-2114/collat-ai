import { Link } from 'react-router-dom'

const CONTACT_EMAIL = 'krish.r.shah2004@gmail.com'
const MAIL_LEGAL = `mailto:${CONTACT_EMAIL}?subject=Collat.AI%20Terms%20inquiry`

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-base font-semibold tracking-tight text-stone-900">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-stone-600">{children}</div>
    </section>
  )
}

export default function Terms() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 lg:px-8 lg:py-16">
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Legal</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900">Terms of Use</h1>
      <p className="mt-2 text-sm text-stone-500">Last updated: 2 May 2026</p>

      <div className="mt-6 rounded-lg border border-stone-200/90 bg-stone-50/80 px-4 py-3 text-sm text-stone-700">
        By accessing or using Collat.AI, you agree to these terms. If you are using the product on behalf of an
        organization, you represent that you have authority to bind that organization. These terms are not a substitute
        for legal review of your specific deployment.
      </div>

      <Section title="1. The service">
        <p>
          Collat.AI provides software and APIs for collateral-related intelligence (including, without limitation,
          valuation estimates, liquidity-style signals, and risk-oriented checks). Features may change as we improve the
          product. We may suspend or limit access for maintenance, security, or abuse prevention.
        </p>
      </Section>

      <Section title="2. Accounts and eligibility">
        <p>
          You must provide accurate registration information and keep credentials confidential. You are responsible for
          activity under your account. You must comply with applicable law and any enterprise agreement between your
          organization and Collat.AI.
        </p>
      </Section>

      <Section title="3. Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-inside list-disc space-y-2 pl-1">
          <li>Reverse engineer, scrape, or probe the service in a way that could harm stability or security.</li>
          <li>Circumvent access controls, quotas, or billing mechanisms.</li>
          <li>Use the service to violate law, infringe rights, or process data you are not authorized to process.</li>
          <li>Upload malware or content designed to disrupt the platform.</li>
        </ul>
      </Section>

      <Section title="4. Your data and inputs">
        <p>
          You retain ownership of data you submit. You grant Collat.AI a license to host, process, and display that data
          solely to provide and improve the service (including training or tuning only where expressly agreed in writing
          or as disclosed in product settings). You represent that you have the rights and, where required, consents to
          submit property and personal data you provide.
        </p>
      </Section>

      <Section title="5. Outputs and disclaimers">
        <p>
          Model outputs, scores, charts, and reports are <span className="font-medium text-stone-800">informational</span>{' '}
          and assist human decision-making. They are not a substitute for independent appraisal, legal diligence, credit
          underwriting, or regulatory compliance. Collat.AI does not guarantee accuracy, completeness, or fitness for a
          particular transaction. You remain solely responsible for credit and business decisions.
        </p>
      </Section>

      <Section title="6. Intellectual property">
        <p>
          Collat.AI and its branding, software, documentation, and model-related assets are protected by intellectual
          property laws. Except for the limited rights to use the service as offered, no rights are granted to you. You
          may not remove proprietary notices from exports or reports where they appear.
        </p>
      </Section>

      <Section title="7. Third parties and APIs">
        <p>
          The product may interoperate with APIs or data sources operated by third parties. Their terms and availability
          apply separately. Collat.AI is not responsible for third-party failures, rate limits, or changes that affect
          integrations you configure.
        </p>
      </Section>

      <Section title="8. Confidentiality">
        <p>
          If you receive non-public information about Collat.AI (for example, under a pilot or NDA), you must protect it
          and use it only as permitted. Aggregated statistics that do not identify you are not confidential.
        </p>
      </Section>

      <Section title="9. Fees">
        <p>
          If you purchase a paid plan, fees, taxes, and payment terms are set out in the applicable order form or
          checkout. Unless stated otherwise, subscriptions renew until cancelled in accordance with the commercial terms
          provided at purchase.
        </p>
      </Section>

      <Section title="10. Limitation of liability">
        <p>
          To the maximum extent permitted by law, Collat.AI and its suppliers will not be liable for any indirect,
          incidental, special, consequential, or punitive damages, or for loss of profits, data, or goodwill, arising from
          your use of the service. Our aggregate liability for claims relating to the service in any twelve-month period
          is limited to the greater of (a) the fees you paid to Collat.AI for the service in that period or (b) a
          reasonable nominal cap where the service is provided without charge, except where liability cannot be excluded
          under applicable law.
        </p>
      </Section>

      <Section title="11. Indemnity">
        <p>
          You will defend and indemnify Collat.AI against claims arising from your data, your violation of these terms, or
          your violation of third-party rights, except to the extent caused by Collat.AI’s willful misconduct.
        </p>
      </Section>

      <Section title="12. Termination">
        <p>
          You may stop using the service at any time. We may suspend or terminate access for breach of these terms,
          risk to the platform, or non-payment where applicable. Provisions that by their nature should survive
          (including Sections 6, 10, 11, and 13) will survive termination.
        </p>
      </Section>

      <Section title="13. Governing law and disputes">
        <p>
          These terms are governed by the laws of India, without regard to conflict-of-law rules. Courts at Mumbai,
          Maharashtra shall have exclusive jurisdiction, subject to any mandatory provisions of law that cannot be waived.
        </p>
      </Section>

      <Section title="14. Changes">
        <p>
          We may modify these terms by posting an updated version. Continued use after the effective date constitutes
          acceptance of the revised terms, except where stricter notice is required by law or contract.
        </p>
      </Section>

      <Section title="15. Contact">
        <p>
          Questions about these terms:{' '}
          <a href={MAIL_LEGAL} className="font-medium text-primary-800 underline-offset-2 hover:underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </Section>

      <p className="mt-12">
        <Link to="/" className="text-sm text-primary-700 underline-offset-4 hover:underline">
          ← Back to home
        </Link>
      </p>
    </article>
  )
}
