import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { useId, useState } from 'react'
import { Link } from 'react-router-dom'

import { OutputBox } from '@/components/models/OutputBox'
import type { ModelCardContent } from '@/components/models/modelsContent'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

function PopCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl border-2 border-stone-200/90 bg-white p-4 shadow-md shadow-stone-900/[0.06] sm:p-5',
        'transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-200/90 hover:shadow-lg hover:shadow-primary-600/[0.12]',
        className,
      )}
    >
      {children}
    </div>
  )
}

function ValueRangeVisual() {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium uppercase tracking-wide text-stone-500">Illustrative range</p>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-stone-200/90 ring-1 ring-stone-300/40">
        <div
          className="absolute inset-y-0 left-[8%] right-[12%] rounded-full bg-gradient-to-r from-primary-400/80 to-primary-600/90"
          aria-hidden
        />
        <div className="absolute left-1/2 top-1/2 h-3 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-800 shadow-sm" aria-hidden />
      </div>
      <div className="flex justify-between text-[11px] text-stone-500">
        <span>Lower</span>
        <span className="font-medium text-primary-800">Typical</span>
        <span>Higher</span>
      </div>
    </div>
  )
}

function LiquidityRingVisual({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score))
  return (
    <div className="flex items-center gap-4">
      <div
        className="relative h-20 w-20 shrink-0 rounded-full p-1 shadow-inner ring-2 ring-primary-200/50"
        style={{
          background: `conic-gradient(rgb(234 88 12) ${pct * 3.6}deg, rgb(231 229 228) 0deg)`,
        }}
        aria-label={`Score ${score} out of 100`}
      >
        <div className="flex h-[4.25rem] w-[4.25rem] flex-col items-center justify-center rounded-full bg-surface-card text-center shadow-md">
          <span className="font-mono text-lg font-semibold leading-none tabular-nums text-stone-900">{score}</span>
          <span className="mt-0.5 text-[9px] font-medium text-stone-500">/ 100</span>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-stone-600">
        The ring fills up when selling is likely to be easier. This sample shows <span className="font-semibold text-primary-800">{score}</span> out of 100.
      </p>
    </div>
  )
}

function RiskChecklistVisual() {
  const items = ['Key facts line up', 'No major red flags in this sample', 'Worth a normal document check']
  return (
    <ul className="space-y-2">
      {items.map((t) => (
        <li key={t} className="flex items-start gap-2 text-xs text-stone-700">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-800 ring-1 ring-primary-200/70">
            <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
          </span>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  )
}

function ModelVisual({ variant }: { variant: ModelCardContent['visual'] }) {
  if (variant === 'valueRange') return <ValueRangeVisual />
  if (variant === 'liquidityRing') return <LiquidityRingVisual score={87} />
  return <RiskChecklistVisual />
}

type ModelCardProps = {
  model: ModelCardContent
  index: number
}

export function ModelCard({ model, index }: ModelCardProps) {
  const [showSample, setShowSample] = useState(false)
  const [showFactors, setShowFactors] = useState(false)
  const detailsId = useId()
  const detailsAnchor = `${model.id}-details`

  const scrollToDetails = () => {
    document.getElementById(detailsAnchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <motion.article
      id={model.id}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className={cn(
        'relative scroll-mt-28 space-y-4 rounded-2xl border-2 border-stone-200/90 bg-surface-card p-4 pt-5 shadow-xl shadow-stone-900/[0.08] sm:p-5 sm:pt-6 lg:p-6',
        'transition-shadow duration-300 hover:border-primary-200/80 hover:shadow-2xl hover:shadow-primary-600/[0.18]',
      )}
    >
      <div
        className="pointer-events-none absolute left-4 right-4 top-0 h-1 rounded-full bg-gradient-to-r from-primary-400/0 via-primary-500/70 to-primary-400/0 opacity-90 sm:left-6 sm:right-6"
        aria-hidden
      />

      <PopCard className="overflow-hidden bg-gradient-to-br from-primary-50/50 via-white to-stone-50/30 ring-1 ring-primary-100/80">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-800/90">Model</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-stone-900 lg:text-2xl">{model.title}</h2>
          <Link
            to={model.workspace.path}
            className="group inline-flex items-center gap-1.5 self-start rounded-lg border border-primary-200/80 bg-white/90 px-3 py-1.5 text-sm font-semibold text-primary-800 shadow-sm transition-all hover:border-primary-300 hover:bg-primary-50 hover:shadow-md"
          >
            Try in {model.workspace.label}
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
          </Link>
        </div>
        <p className="mt-4 max-w-prose text-sm leading-relaxed text-stone-600 lg:text-[15px]">{model.simpleDescription}</p>
      </PopCard>

      <div className="grid gap-4 md:grid-cols-2">
        <PopCard>
          <section aria-labelledby={`${detailsId}-predicts`}>
            <h3 id={`${detailsId}-predicts`} className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">
              What it predicts
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-stone-800">
              {model.predicts.map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" aria-hidden />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </section>
        </PopCard>

        <PopCard>
          <section aria-labelledby={`${detailsId}-inputs`}>
            <h3 id={`${detailsId}-inputs`} className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">
              What it uses
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-stone-800">
              {model.inputs.map((inp) => (
                <li key={inp} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-400" aria-hidden />
                  <span>{inp}</span>
                </li>
              ))}
            </ul>
          </section>
        </PopCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <PopCard className="lg:col-span-3">
          <section aria-labelledby={`${detailsId}-example`}>
            <h3 id={`${detailsId}-example`} className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">
              Example output
            </h3>
            <OutputBox className="mt-3">
              <ul className="space-y-2.5">
                {model.exampleLines.map((row) => (
                  <li key={row.label} className="flex flex-wrap gap-x-2 gap-y-0.5">
                    <span className="font-semibold text-stone-700">{row.label}:</span>
                    <span className="font-mono tabular-nums text-stone-900">{row.value}</span>
                  </li>
                ))}
              </ul>
            </OutputBox>
          </section>
        </PopCard>

        <PopCard className="lg:col-span-2">
          <section aria-labelledby={`${detailsId}-viz`}>
            <h3 id={`${detailsId}-viz`} className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">
              At a glance
            </h3>
            <div className="mt-3 rounded-lg border border-stone-200/80 bg-stone-50/80 px-3 py-3 ring-1 ring-stone-200/50">
              <ModelVisual variant={model.visual} />
            </div>
          </section>
        </PopCard>
      </div>

      <PopCard className="flex flex-wrap gap-2 bg-stone-50/50 p-3 sm:p-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-2 border-stone-300 bg-white font-semibold text-stone-800 shadow-sm transition-all hover:border-primary-300 hover:bg-primary-50/80 hover:text-primary-900"
          onClick={scrollToDetails}
        >
          View details
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-2 border-stone-300 bg-white font-semibold text-stone-800 shadow-sm transition-all hover:border-primary-300 hover:bg-primary-50/80 hover:text-primary-900"
          onClick={() => setShowSample((v) => !v)}
        >
          Try sample input
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-2 border-stone-300 bg-white font-semibold text-stone-800 shadow-sm transition-all hover:border-primary-300 hover:bg-primary-50/80 hover:text-primary-900"
          onClick={() => setShowFactors((v) => !v)}
        >
          See key factors
        </Button>
      </PopCard>

      <AnimatePresence initial={false}>
        {showSample ? (
          <motion.div
            key="sample"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <PopCard className="bg-gradient-to-b from-white to-stone-50/80">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">Sample inputs (illustrative)</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {model.sampleSummary.map((row) => (
                  <div
                    key={row.label}
                    className="rounded-xl border-2 border-stone-200/90 bg-white px-3 py-2.5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-500">{row.label}</p>
                    <p className="mt-1 text-sm font-semibold text-stone-900">{row.value}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-stone-600">
                Open the{' '}
                <Link to={model.workspace.path} className="font-semibold text-primary-700 underline-offset-2 hover:underline">
                  {model.workspace.label} workspace
                </Link>{' '}
                to run a real check with your numbers.
              </p>
            </PopCard>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {showFactors ? (
          <motion.div
            key="factors"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <PopCard>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">Key factors (simple view)</p>
              <ul className="mt-3 space-y-2 text-sm text-stone-700">
                {model.keyFactors.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-400" aria-hidden />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </PopCard>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div id={detailsAnchor} className="scroll-mt-28">
        <Separator className="my-2 bg-stone-200/80" />
        <PopCard className="border-l-4 border-l-primary-500 bg-gradient-to-br from-white to-stone-50/90">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">More detail</h3>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-stone-600">
            {model.details.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>
          <p className="mt-5 text-sm font-medium text-stone-700">
            Ready to go deeper?{' '}
            <Link to={model.workspace.path} className="font-semibold text-primary-700 underline-offset-2 hover:underline">
              Open the {model.workspace.label} page
            </Link>
            .
          </p>
        </PopCard>
      </div>
    </motion.article>
  )
}
