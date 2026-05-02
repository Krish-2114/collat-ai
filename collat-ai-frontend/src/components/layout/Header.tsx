import { motion } from 'framer-motion'
import { ChevronDown, LogIn, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

const nav = [
  { to: '/', label: 'Home', end: true },
  { to: '/models', label: 'Models' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/valuate', label: 'Valuation' },
  { to: '/liquidity', label: 'Liquidity' },
  { to: '/fraud', label: 'Fraud' },
]

const DEMO_MAIL = 'mailto:krish.r.shah2004@gmail.com?subject=Collat.AI%20demo%20request'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'relative px-3 py-2 text-sm font-semibold transition-colors',
    isActive
      ? 'text-stone-900 after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:rounded-full after:bg-primary-600'
      : 'text-stone-600 hover:text-primary-700',
  )

export function Header() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/95 shadow-[0_1px_0_rgba(234,88,12,0.04)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-3 px-4 lg:gap-6 lg:px-8">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
          <NavLink to="/" className="flex items-center gap-2.5 font-semibold text-stone-900">
            <span
              className="flex h-9 w-9 items-center justify-center bg-primary-600 text-sm font-bold text-white shadow-sm shadow-primary-600/25"
              style={{
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              }}
            >
              C
            </span>
            <span className="hidden tracking-tight sm:inline">COLLAT.AI</span>
          </NavLink>
        </motion.div>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 overflow-x-auto md:flex lg:gap-1">
          {nav.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {user ? (
            <details className="group relative hidden sm:block">
              <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-sm font-semibold text-stone-800 marker:hidden hover:bg-stone-100 [&::-webkit-details-marker]:hidden">
                <User className="h-4 w-4 text-primary-600" aria-hidden />
                <span className="max-w-[8rem] truncate">{user.displayName}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60 group-open:rotate-180" aria-hidden />
              </summary>
              <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-stone-200 bg-white py-1 shadow-lg">
                <p className="border-b border-stone-100 px-3 py-2 text-xs text-stone-500">{user.email}</p>
                <NavLink to="/portfolio" className="block px-3 py-2 text-sm text-stone-700 hover:bg-stone-50">
                  My portfolio
                </NavLink>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50"
                  onClick={() => logout()}
                >
                  Sign out
                </button>
              </div>
            </details>
          ) : (
            <Button asChild size="sm" variant="outline" className="hidden border-stone-300 sm:inline-flex">
              <NavLink to="/login">
                <LogIn className="h-3.5 w-3.5" aria-hidden />
                Sign in
              </NavLink>
            </Button>
          )}
          <Button asChild size="sm" className="hidden shadow-sm sm:inline-flex">
            <a href={DEMO_MAIL}>Request demo</a>
          </Button>
        </div>
      </div>

      <nav className="flex flex-wrap justify-center gap-0.5 border-t border-stone-100 px-2 py-2 md:hidden">
        {nav.map(({ to, label, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => cn(linkClass({ isActive }), 'text-xs')}>
            {label}
          </NavLink>
        ))}
        {user ? (
          <NavLink to="/portfolio" className="rounded-md border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs font-semibold text-stone-800">
            You
          </NavLink>
        ) : (
          <NavLink to="/login" className="rounded-md border border-primary-300 px-2.5 py-1.5 text-xs font-semibold text-primary-800">
            Sign in
          </NavLink>
        )}
        <a href={DEMO_MAIL} className="rounded-md bg-primary-600 px-2.5 py-1.5 text-xs font-semibold text-white">
          Demo
        </a>
      </nav>
    </header>
  )
}
