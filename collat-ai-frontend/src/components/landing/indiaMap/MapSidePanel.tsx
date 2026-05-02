import { motion, AnimatePresence } from 'framer-motion'

import type { CityName } from '@/types/api.types'

import { metricsForCity, sparklineForCity } from '@/components/landing/indiaMap/mockMapData'
import { MiniSparkline } from '@/components/landing/indiaMap/MiniSparkline'

import { Button } from '@/components/ui/button'

type MapSidePanelProps = {
  city: CityName | null
  onClear: () => void
}

export function MapSidePanel({ city, onClear }: MapSidePanelProps) {
  const m = city ? metricsForCity(city) : null
  const spark = city ? sparklineForCity(city) : []

  return (
    <div className="flex h-full min-h-[200px] w-full flex-col rounded-xl border border-stone-200/90 bg-white/75 p-4 shadow-sm shadow-stone-900/5 backdrop-blur-md lg:min-h-0">
      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-stone-500">City summary</p>
      <AnimatePresence mode="wait">
        {m ? (
          <motion.div
            key={m.city}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="mt-3 flex flex-1 flex-col"
          >
            <p className="text-base font-semibold tracking-tight text-stone-900">{m.city}</p>
            <p className="mt-1 font-mono text-sm tabular-nums text-stone-700">{m.psfDisplay}</p>
            <p className="mt-0.5 font-mono text-xs tabular-nums text-stone-800">{m.growth}</p>
            <div className="mt-4 space-y-3 border-t border-stone-200/80 pt-3 text-xs text-stone-600">
              <div className="flex justify-between gap-2">
                <span className="text-stone-500">Deal vol.</span>
                <span className="font-mono tabular-nums text-stone-800">{m.volumeDeals}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-stone-500">Liquidity</span>
                <span className="font-mono tabular-nums text-stone-800">{m.liquidityIndex}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-stone-500">TTL band</span>
                <span className="font-mono tabular-nums text-stone-800">{m.ttlWeeks}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-stone-500">Confidence</span>
                <span className="font-mono tabular-nums text-stone-800">{m.confidence}</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-[9px] font-medium uppercase tracking-wide text-stone-400">Flow</p>
              <MiniSparkline values={spark} className="mt-1.5 text-primary-600" />
            </div>
            <Button type="button" variant="ghost" size="sm" className="mt-auto justify-self-end text-stone-500 hover:text-stone-900" onClick={onClear}>
              Clear focus
            </Button>
          </motion.div>
        ) : (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex-1 text-xs leading-relaxed text-stone-500"
          >
            Click a city on the map to see indicative ₹/sqft, growth, liquidity, and flow (mock data for this demo).
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
