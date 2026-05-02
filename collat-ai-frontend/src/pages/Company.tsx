import { Link } from 'react-router-dom'

import { DownloadReportButton } from '@/components/common/DownloadReportButton'
import { Button } from '@/components/ui/button'

import { API_BASE_URL } from '@/services/api'

const API_DOCS = `${API_BASE_URL}/docs`
const CONTACT_EMAIL = 'krish.r.shah2004@gmail.com'
const MAIL = `mailto:${CONTACT_EMAIL}?subject=Collat.AI%20inquiry`

export default function Company() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-stone-900">Company</h1>
      <p className="mt-4 leading-relaxed text-stone-600">
        Collat.AI builds collateral intelligence for Indian real estate — multi-city valuation, liquidity, and fraud
        signals in one desktop-friendly workflow backed by a FastAPI inference stack.
      </p>
      <ul className="mt-8 list-inside list-disc space-y-2 text-sm text-stone-600">
        <li>
          <a href={API_DOCS} className="text-primary-700 underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
            Open API documentation
          </a>{' '}
          (local server on port 8000)
        </li>
        <li>
          <Link to="/valuate" className="text-primary-700 underline-offset-4 hover:underline">
            Try the valuation workspace
          </Link>
        </li>
        <li>
          <Link to="/portfolio" className="text-primary-700 underline-offset-4 hover:underline">
            View portfolio hub
          </Link>
        </li>
      </ul>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild>
          <a href={MAIL}>Email us</a>
        </Button>
        <DownloadReportButton variant="overview" slug="company" />
        <Button asChild variant="outline">
          <Link to="/">Home</Link>
        </Button>
      </div>
    </div>
  )
}
