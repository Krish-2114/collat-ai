import { Link } from 'react-router-dom'

const legalLinkClass =
  'text-xs text-stone-500 transition-colors duration-200 hover:text-stone-800 md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="animate-footer-in mt-auto w-full border-t border-stone-200/90 bg-surface-muted/90">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
          <p className="text-xs leading-relaxed text-stone-500 md:text-sm">
            © {year} Collat.AI · Team The Triads. All rights reserved.
          </p>
          <nav aria-label="Legal" className="shrink-0">
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-1">
              <li>
                <Link to="/privacy" className={legalLinkClass}>
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className={legalLinkClass}>
                  Terms
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <p className="mt-3 border-t border-stone-200/60 pt-3 text-xs text-stone-500/50 md:text-[13px]">
          Powered by Collat Intelligence
        </p>
      </div>
    </footer>
  )
}
