import { motion } from 'framer-motion'

import type { CityName } from '@/types/api.types'

import { MiniSparkline } from '@/components/landing/indiaMap/MiniSparkline'

type CityNodeTooltipProps = {
  city: CityName
  psfLabel: string
  growthLabel: string
  growthUp: boolean
  sparkline: number[]
  align: 'left' | 'right'
}

export function CityNodeTooltip({ city, psfLabel, growthLabel, growthUp, sparkline, align }: CityNodeTooltipProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.98 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={`pointer-events-none absolute top-1/2 z-30 hidden w-[11.5rem] -translate-y-1/2 rounded-lg border border-stone-200/80 bg-white/85 px-3 py-2.5 text-left shadow-lg shadow-stone-900/10 backdrop-blur-md sm:block ${
        align === 'right' ? 'right-full mr-2' : 'left-full ml-2'
      }`}
    >
      <p className="text-[11px] font-semibold tracking-tight text-stone-900">{city}</p>
      <p className="mt-0.5 font-mono text-[10px] tabular-nums text-stone-600">{psfLabel}</p>
      <p className="mt-0.5 font-mono text-[10px] tabular-nums text-stone-800">
        {growthUp ? '↑ ' : '→ '}
        {growthLabel}
      </p>
      <div className="mt-2 flex items-end justify-between gap-2 border-t border-stone-200/70 pt-2">
        <span className="text-[9px] font-medium uppercase tracking-wide text-stone-400">Trend</span>
        <MiniSparkline values={sparkline} />
      </div>
    </motion.div>
  )
}
