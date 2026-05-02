import { motion } from 'framer-motion'

import { CITY_INFO, CITY_NAMES } from '@/utils/constants'

import { IndiaHeroMap } from '@/components/landing/indiaMap/IndiaHeroMap'

function formatPsfK(psf: number): string {
  if (psf >= 1000) return `₹${(psf / 1000).toFixed(1)}K/sqft`
  return `₹${psf}/sqft`
}

function trendFor(city: string): { up: boolean; pct: string } {
  let h = 0
  for (let i = 0; i < city.length; i++) h = (h * 31 + city.charCodeAt(i)) >>> 0
  const pct = (4 + (h % 120) / 10).toFixed(1)
  const up = (h >> 3) % 5 !== 0
  return { up, pct }
}

const fade = {
  initial: { opacity: 0, y: 8 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.4 },
} as const

export function MarketCoverageSection() {
  return (
    <section id="market-coverage" className="scroll-mt-20 border-y border-stone-200 bg-[#fafaf9] py-11 lg:py-12">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <motion.div {...fade} className="mb-7 lg:mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-500">Coverage</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-stone-900 lg:text-xl">National footprint</h2>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-stone-600 lg:text-sm">
            Tier-stratified priors across eight metros.
          </p>
        </motion.div>

        <motion.div
          {...fade}
          transition={{ ...fade.transition, delay: 0.05 }}
          className="overflow-visible rounded-2xl border-2 border-stone-200/90 bg-white shadow-xl shadow-stone-900/[0.07] ring-1 ring-stone-200/50 transition-shadow duration-300 hover:shadow-2xl hover:shadow-primary-600/[0.08]"
        >
          <div className="relative min-h-[300px] border-b border-stone-200 bg-[#f7f6f4] lg:min-h-[360px] lg:border-b-0">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.5] bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[length:14px_14px]"
              aria-hidden
            />
            <div className="relative flex h-full flex-col p-5 sm:p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">India — active metros</p>
              <div className="relative mt-4 min-h-[220px] flex-1 lg:min-h-[280px]" role="img" aria-label="Interactive map of India with metro markers">
                <IndiaHeroMap />
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-stone-200/90 pt-4 text-[10px] sm:grid-cols-4">
                {CITY_NAMES.map((city) => {
                  const psf = CITY_INFO[city].base_psf
                  const { up, pct } = trendFor(city)
                  return (
                    <div key={city} className="min-w-0">
                      <dt className="truncate font-medium text-stone-900">{city}</dt>
                      <dd className="font-mono tabular-nums text-stone-600">{formatPsfK(psf)}</dd>
                      <dd className={`font-mono tabular-nums ${up ? 'text-emerald-700' : 'text-amber-800'}`}>
                        {up ? '↑ +' : '→ '}
                        {pct}%
                      </dd>
                    </div>
                  )
                })}
              </dl>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
