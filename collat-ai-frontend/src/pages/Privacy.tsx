import { Link } from 'react-router-dom'

const CONTACT_EMAIL = 'krish.r.shah2004@gmail.com'
const MAIL_PRIVACY = `mailto:${CONTACT_EMAIL}?subject=Collat.AI%20Privacy%20request`

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-base font-semibold tracking-tight text-stone-900">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-stone-600">{children}</div>
    </section>
  )
}

export default function Privacy() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 lg:px-8 lg:py-16">
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Legal</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-stone-500">Last updated: 2 May 2026</p>

      <div className="mt-6 rounded-lg border border-stone-200/90 bg-stone-50/80 px-4 py-3 text-sm text-stone-700">
        This policy describes how Collat.AI treats information in connection with the product. It is not legal advice;
        please review with your counsel, especially if you process personal data on behalf of others (for example, as a
        lender or service provider).
      </div>

      <Section title="1. Who this applies to">
        <p>
          Collat.AI (&quot;Collat.AI&quot;, &quot;we&quot;, &quot;us&quot;) provides software and related services for
          collateral intelligence, including valuation, liquidity, and risk-related workflows. This policy applies to
          visitors to our marketing site, authenticated users of the application, and API consumers where personal or
          property-related data may be involved.
        </p>
      </Section>

      <Section title="2. Information we collect">
        <p>Depending on how you use the product, we may process categories such as:</p>
        <ul className="list-inside list-disc space-y-2 pl-1">
          <li>
            <span className="font-medium text-stone-800">Account and contact data</span> — for example, name, work
            email, organization, and authentication identifiers when you sign in or contact us.
          </li>
          <li>
            <span className="font-medium text-stone-800">Property and collateral inputs</span> — data you or your
            organization enter to run analyses (such as location, attributes, identifiers you choose to provide, and
            uploaded documents if the product supports them).
          </li>
          <li>
            <span className="font-medium text-stone-800">Usage and technical data</span> — such as IP address, device and
            browser type, timestamps, pages or endpoints accessed, and diagnostic logs needed to operate and secure the
            service.
          </li>
          <li>
            <span className="font-medium text-stone-800">Support communications</span> — content you send when you request
            help or report issues.
          </li>
        </ul>
        <p>
          We do not use this policy to solicit sensitive categories of personal data beyond what your workflow reasonably
          requires. You should avoid submitting unnecessary personal identifiers unless needed for your credit or
          operations process.
        </p>
      </Section>

      <Section title="3. How we use information">
        <ul className="list-inside list-disc space-y-2 pl-1">
          <li>To provide, maintain, and improve the Collat.AI platform and models.</li>
          <li>To authenticate users, enforce access controls, and protect against abuse or fraud.</li>
          <li>To communicate about the service, security, or policy changes.</li>
          <li>To meet legal, regulatory, or audit obligations where applicable.</li>
          <li>
            With appropriate safeguards, for analytics and reliability (for example, aggregated or de-identified metrics).
          </li>
        </ul>
      </Section>

      <Section title="4. Lawful processing (including India)">
        <p>
          Where the Digital Personal Data Protection Act, 2023 (India) or similar laws apply, we process personal data
          for lawful purposes such as providing the service you requested, security, compliance, and legitimate interests
          that are not overridden by your rights. Where consent is required, we will seek it in line with applicable law
          and your organization’s instructions.
        </p>
        <p>
          If you use Collat.AI on behalf of a company, your organization may be an independent controller for borrower or
          employee data; this policy does not replace your own notices or agreements with data subjects.
        </p>
      </Section>

      <Section title="5. Sharing and subprocessors">
        <p>
          We do not sell personal data. We may share information with service providers who assist us (for example,
          hosting, logging, email delivery, or security) under contracts that require appropriate confidentiality and
          security. We may disclose information if required by law, court order, or to protect rights, safety, or
          integrity of users and the public.
        </p>
        <p>
          A merger, acquisition, or asset sale could involve transfer of information to a successor under commitments
          consistent with this policy or as notified to you.
        </p>
      </Section>

      <Section title="6. Retention">
        <p>
          We retain information for as long as needed to provide the service, comply with law, resolve disputes, and
          enforce agreements. Retention periods can depend on your organization’s settings, backups, and regulatory
          requirements. Where deletion is requested and not prohibited by law, we will delete or de-identify data in a
          reasonable timeframe.
        </p>
      </Section>

      <Section title="7. Security">
        <p>
          We implement administrative, technical, and organizational measures designed to protect information against
          unauthorized access, loss, or alteration. No method of transmission or storage is completely secure; you
          should use strong credentials and follow your organization’s security policies.
        </p>
      </Section>

      <Section title="8. Your choices and rights">
        <p>
          Depending on your jurisdiction, you may have rights to access, correct, delete, or restrict processing of your
          personal data, or to object to certain processing. To exercise rights or ask questions, contact us at the email
          below. We may need to verify your identity or coordinate with your employer if your account is enterprise-managed.
        </p>
      </Section>

      <Section title="9. International transfers">
        <p>
          Our infrastructure or subprocessors may be located outside your country. Where required, we use appropriate
          safeguards (such as contractual clauses) for cross-border transfers.
        </p>
      </Section>

      <Section title="10. Children">
        <p>
          Collat.AI is a business product and is not directed at children. We do not knowingly collect personal data from
          children below the age at which parental consent is required in your jurisdiction.
        </p>
      </Section>

      <Section title="11. Changes to this policy">
        <p>
          We may update this policy from time to time. We will post the revised version with an updated date and, where
          changes are material, provide additional notice as appropriate (for example, in-app or by email).
        </p>
      </Section>

      <Section title="12. Contact">
        <p>
          For privacy requests or questions:{' '}
          <a href={MAIL_PRIVACY} className="font-medium text-primary-800 underline-offset-2 hover:underline">
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
