import { motion } from 'framer-motion'
import { Clock, Layers, ShieldCheck, Sparkles } from 'lucide-react'

import { cn } from '@/lib/utils'

const items = [
  {
    icon: Layers,
    title: 'Three engines',
    body: 'Value, liquidity, and risk — each explained in plain language.',
  },
  {
    icon: Sparkles,
    title: 'One workflow',
    body: 'Same property form powers every model on the right.',
  },
  {
    icon: Clock,
    title: 'Seconds to insight',
    body: 'Run any engine after you fill the basics.',
  },
  {
    icon: ShieldCheck,
    title: 'Built for decisions',
    body: 'Ranges and scores you can brief a committee on.',
  },
] as const

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
}

const itemMotion = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

export function ModelsOverviewStrip() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
    >
      {items.map(({ icon: Icon, title, body }) => (
        <motion.div
          key={title}
          variants={itemMotion}
          whileHover={{ y: -4, transition: { duration: 0.22 } }}
          className={cn(
            'group relative overflow-hidden rounded-2xl border-2 border-stone-200/90 bg-surface-card p-4 shadow-md shadow-stone-900/[0.07]',
            'transition-all duration-300 hover:border-primary-300/80 hover:shadow-xl hover:shadow-primary-600/[0.14]',
          )}
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            aria-hidden
          />
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700 ring-1 ring-primary-200/60">
              <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-tight text-stone-900">{title}</p>
              <p className="mt-1 text-xs leading-relaxed text-stone-600">{body}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
