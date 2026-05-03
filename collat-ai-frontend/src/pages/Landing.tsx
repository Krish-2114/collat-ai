import { motion } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Droplets,
  Layers,
  Shield,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { HeroDashboard } from '@/components/landing/HeroDashboard'
import { MarketCoverageSection } from '@/components/landing/MarketCoverageSection'
import { Button } from '@/components/ui/button'

const fade = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.45 },
} as const

const heroFade = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
} as const

const capabilityHighlights = [
  {
    title: 'AI Valuation Engine',
    body: 'Real-time market value, distress value, and confidence scoring.',
  },
  {
    title: 'Liquidity Intelligence',
    body: 'Resale potential, exit timelines, and liquidation insights.',
  },
  {
    title: 'Risk Detection',
    body: 'Fraud signals, ownership checks, and collateral risk alerts.',
  },
] as const

export default function Landing() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden border-b border-stone-200/80 bg-gradient-to-b from-stone-50 via-white to-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:py-12 lg:px-8 lg:py-14">
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,520px)] xl:grid-cols-[minmax(0,1fr)_minmax(320px,560px)] lg:gap-8 xl:gap-10">
            <div className="min-w-0 pt-0 lg:pt-1">
              <motion.div
                className="inline-flex items-center gap-2 rounded-full border border-primary-200/80 bg-primary-50/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-primary-800"
                {...heroFade}
                transition={{ ...heroFade.transition, delay: 0 }}
              >
                <Sparkles className="h-3.5 w-3.5 text-primary-600" aria-hidden />
                AI-powered collateral intelligence
              </motion.div>
              <motion.h1
                className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-stone-900 sm:text-5xl"
                {...heroFade}
                transition={{ ...heroFade.transition, delay: 0.06 }}
              >
                Smarter lending. Stronger decisions.
                <span className="mt-1 block text-primary-600">Backed by intelligence.</span>
              </motion.h1>
              <motion.p
                className="mt-5 max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg"
                {...heroFade}
                transition={{ ...heroFade.transition, delay: 0.12 }}
              >
                Collat.ai combines real-time market intelligence, liquidity scoring, and risk detection to give lenders a
                complete view of collateral health in under 30 seconds.
              </motion.p>
              <motion.div
                className="mt-8 flex flex-wrap items-center gap-3"
                {...heroFade}
                transition={{ ...heroFade.transition, delay: 0.18 }}
              >
                <Button asChild size="lg" className="shadow-md shadow-primary-600/15">
                  <Link to="/valuate">
                    Start valuation <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-2 border-primary-500 text-primary-700 shadow-sm transition-all hover:bg-primary-50 hover:shadow-md">
                  <Link to="/models">
                    <Layers className="h-4 w-4" strokeWidth={2.25} aria-hidden /> Explore models
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                className="mt-10 grid gap-4 sm:grid-cols-3"
                {...heroFade}
                transition={{ ...heroFade.transition, delay: 0.24 }}
              >
                <Link
                  to="/valuate"
                  className="group relative overflow-hidden rounded-2xl border-2 border-stone-200/90 bg-white p-5 shadow-md shadow-stone-900/[0.06] ring-1 ring-stone-200/40 transition-all duration-300 hover:-translate-y-1 hover:border-primary-300/90 hover:shadow-xl hover:shadow-primary-600/[0.12]"
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden />
                  <BarChart3 className="h-7 w-7 text-primary-600" aria-hidden />
                  <h3 className="mt-3 text-sm font-bold text-stone-900">Predict price</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-stone-600">AI-driven market value estimation in seconds.</p>
                  <ArrowUpRight className="ml-auto mt-3 h-4 w-4 text-primary-600 opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                </Link>
                <Link
                  to="/liquidity"
                  className="group relative overflow-hidden rounded-2xl border-2 border-stone-200/90 bg-white p-5 shadow-md shadow-stone-900/[0.06] ring-1 ring-stone-200/40 transition-all duration-300 hover:-translate-y-1 hover:border-primary-300/90 hover:shadow-xl hover:shadow-primary-600/[0.12]"
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden />
                  <Droplets className="h-7 w-7 text-primary-600" aria-hidden />
                  <h3 className="mt-3 text-sm font-bold text-stone-900">Check liquidity</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-stone-600">Resale potential, exit timelines & liquidity score.</p>
                  <ArrowUpRight className="ml-auto mt-3 h-4 w-4 text-primary-600 opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                </Link>
                <Link
                  to="/fraud"
                  className="group relative overflow-hidden rounded-2xl border-2 border-stone-200/90 bg-white p-5 shadow-md shadow-stone-900/[0.06] ring-1 ring-stone-200/40 transition-all duration-300 hover:-translate-y-1 hover:border-primary-300/90 hover:shadow-xl hover:shadow-primary-600/[0.12]"
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden />
                  <Shield className="h-7 w-7 text-primary-800" aria-hidden />
                  <h3 className="mt-3 text-sm font-bold text-stone-900">Detect risk</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-stone-600">Fraud detection, legal checks & risk flags.</p>
                  <ArrowUpRight className="ml-auto mt-3 h-4 w-4 text-primary-800 opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                </Link>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="min-h-0 min-w-0 w-full max-lg:max-h-[min(78dvh,640px)] max-lg:overflow-y-auto max-lg:overflow-x-hidden max-lg:pr-1"
            >
              <HeroDashboard />
            </motion.div>
          </div>
        </div>
      </section>

      <MarketCoverageSection />

      <section id="how-it-works" className="scroll-mt-24 border-t border-stone-200/80 bg-stone-50/40 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
          <motion.h2 className="text-2xl font-semibold text-stone-900" {...fade}>
            How it works
          </motion.h2>
          <div className="mt-10 grid gap-8 text-left md:grid-cols-3">
            {[
              {
                title: 'Know your collateral',
                body: 'Start with the property fundamentals your institution already tracks—where it is, what it is, and how it fits the book—so every review begins from the same clear snapshot.',
              },
              {
                title: 'Intelligence in context',
                body: 'We combine your inputs with ongoing market movement, local activity, and wider signals so you see how the asset compares to its surroundings—not a single figure in isolation.',
              },
              {
                title: 'From insight to action',
                body: 'Move to a rounded view of value, liquidity, and risk in one place, delivered quickly so credit and collateral teams can align, explain their view, and decide with confidence.',
              },
            ].map((b) => (
              <motion.div
                key={b.title}
                {...fade}
                className="relative overflow-hidden rounded-2xl border-2 border-stone-200/90 bg-white p-6 shadow-md shadow-stone-900/[0.06] ring-1 ring-stone-200/50 transition-all duration-300 hover:-translate-y-1 hover:border-primary-200/80 hover:shadow-xl hover:shadow-primary-600/[0.1]"
              >
                <Activity className="h-5 w-5 text-primary-600" aria-hidden />
                <h3 className="mt-3 font-semibold text-stone-900">{b.title}</h3>
                <p className="mt-2 text-sm text-stone-600">{b.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-stone-200/90 bg-[#fafaf9] py-16 lg:py-20">
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[length:22px_22px] opacity-[0.55]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-transparent to-stone-100/60"
          aria-hidden
        />
        <div className="relative mx-auto max-w-5xl px-4 text-center lg:px-8">
          <motion.h2
            className="text-balance text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl lg:text-[1.75rem] lg:leading-snug"
            {...fade}
          >
            Transform Collateral Decisions in Under 30 Seconds
          </motion.h2>
          <motion.p
            className="mx-auto mt-5 max-w-2xl text-pretty text-sm leading-relaxed text-stone-600 sm:text-base"
            {...fade}
            transition={{ ...fade.transition, delay: 0.06 }}
          >
            Deploy AI-powered valuation, liquidity scoring, and fraud intelligence across your lending workflows.
          </motion.p>

          <motion.div
            className="mx-auto mt-14 max-w-4xl text-left"
            {...fade}
            transition={{ ...fade.transition, delay: 0.1 }}
          >
            <div className="grid gap-5 sm:grid-cols-3 sm:gap-6">
              {capabilityHighlights.map((item) => (
                <div
                  key={item.title}
                  className="group relative overflow-hidden rounded-2xl border-2 border-stone-200/90 bg-white p-6 text-left shadow-md shadow-stone-900/[0.06] ring-1 ring-stone-200/50 transition-all duration-300 hover:-translate-y-1 hover:border-primary-200/80 hover:shadow-xl hover:shadow-primary-600/[0.1]"
                >
                  <div className="h-1 w-12 rounded-full bg-primary-600 shadow-sm shadow-primary-600/25" aria-hidden />
                  <h3 className="mt-4 text-base font-semibold tracking-tight text-stone-900">{item.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-stone-600">{item.body}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
