import { ArrowRight, Building2, Droplets, ShieldAlert, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { DownloadReportButton } from '@/components/common/DownloadReportButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthStore } from '@/store/authStore'
import { usePortfolioStore, type PortfolioEngine } from '@/store/portfolioStore'

const engineMeta: Record<
  PortfolioEngine,
  { label: string; path: string; icon: typeof Building2; accent: string }
> = {
  valuation: { label: 'Valuation', path: '/valuate', icon: Building2, accent: 'text-primary-600' },
  liquidity: { label: 'Liquidity', path: '/liquidity', icon: Droplets, accent: 'text-violet-600' },
  fraud: { label: 'Fraud', path: '/fraud', icon: ShieldAlert, accent: 'text-red-600' },
}

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
  } catch {
    return iso
  }
}

export default function Portfolio() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const listForUser = usePortfolioStore((s) => s.listForUser)
  const removeSnapshot = usePortfolioStore((s) => s.removeSnapshot)

  const items = user ? listForUser(user.id) : []

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8 lg:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">Portfolio</h1>
          <p className="mt-2 text-stone-600">
            {user
              ? `Saved analyses for ${user.displayName}. Run engines and use “Save to portfolio” on each results page.`
              : 'Sign in to save valuation, liquidity, and fraud runs to a personal list. Engines stay available for everyone.'}
          </p>
        </div>
        {user ? (
          <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
            <p className="text-xs text-stone-500">
              <span className="font-medium text-stone-700">{user.email}</span>
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              {items.length > 0 ? (
                <DownloadReportButton
                  variant="portfolio"
                  items={items}
                  displayName={user.displayName}
                  email={user.email}
                />
              ) : null}
              <Button type="button" variant="outline" size="sm" onClick={() => logout()}>
                Sign out
              </Button>
            </div>
          </div>
        ) : (
          <Button asChild className="shrink-0 self-start sm:self-auto">
            <Link to="/login">Sign in to personalize</Link>
          </Button>
        )}
      </div>

      {user && items.length > 0 ? (
        <ul className="mt-10 space-y-3">
          {items.map((item) => {
            const meta = engineMeta[item.engine]
            const Icon = meta.icon
            return (
              <li key={item.id}>
                <Card className="border-stone-200 shadow-sm transition-shadow hover:shadow-md">
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 gap-3">
                      <Icon className={`mt-0.5 h-8 w-8 shrink-0 ${meta.accent}`} aria-hidden />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{meta.label}</p>
                        <p className="font-semibold text-stone-900">{item.title}</p>
                        <p className="text-sm text-stone-600">{item.subtitle}</p>
                        <p className="mt-1 text-xs text-stone-400">{formatWhen(item.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button asChild variant="outline" size="sm" className="border-primary-300">
                        <Link to={meta.path}>
                          Open <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-stone-500 hover:text-red-700"
                        onClick={() => removeSnapshot(user.id, item.id)}
                        aria-label="Remove from portfolio"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            )
          })}
        </ul>
      ) : user ? (
        <Card className="mt-10 border-dashed border-stone-300 bg-stone-50/50">
          <CardContent className="p-8 text-center text-sm text-stone-600">
            <p>No saved analyses yet.</p>
            <p className="mt-2">
              Open <Link className="font-medium text-primary-700 underline-offset-2 hover:underline" to="/valuate">Valuation</Link>,{' '}
              <Link className="font-medium text-primary-700 underline-offset-2 hover:underline" to="/liquidity">Liquidity</Link>, or{' '}
              <Link className="font-medium text-primary-700 underline-offset-2 hover:underline" to="/fraud">Fraud</Link>, run a property, then click{' '}
              <strong className="text-stone-800">Save to portfolio</strong>.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <h2 className="mt-14 text-sm font-semibold uppercase tracking-wide text-stone-500">Engines</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Card className="h-full border-stone-200 shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="flex h-full flex-col gap-3 p-5">
            <Building2 className="h-8 w-8 text-primary-600" aria-hidden />
            <h2 className="font-semibold text-stone-900">Valuation</h2>
            <p className="text-sm text-stone-600">P10 / P50 / P90 bands and underwriting outputs.</p>
            <Button asChild variant="outline" size="sm" className="mt-auto w-full border-primary-300">
              <Link to="/valuate">
                Open <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="h-full border-stone-200 shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="flex h-full flex-col gap-3 p-5">
            <Droplets className="h-8 w-8 text-violet-600" aria-hidden />
            <h2 className="font-semibold text-stone-900">Liquidity</h2>
            <p className="text-sm text-stone-600">RPI, TTL bands, and exit certainty.</p>
            <Button asChild variant="outline" size="sm" className="mt-auto w-full border-primary-300">
              <Link to="/liquidity">
                Open <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="h-full border-stone-200 shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="flex h-full flex-col gap-3 p-5">
            <ShieldAlert className="h-8 w-8 text-red-600" aria-hidden />
            <h2 className="font-semibold text-stone-900">Fraud</h2>
            <p className="text-sm text-stone-600">Rules + anomaly scoring.</p>
            <Button asChild variant="outline" size="sm" className="mt-auto w-full border-primary-300">
              <Link to="/fraud">
                Open <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <p className="mt-10 text-center text-sm text-stone-500">
        <Link to="/" className="font-medium text-primary-700 underline-offset-4 hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  )
}
