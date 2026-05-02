import { motion } from 'framer-motion'

import { MAP_INSIGHTS } from '@/components/landing/indiaMap/mockMapData'

export function MapInsightsColumn() {
  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 lg:h-full lg:min-h-0">
      {MAP_INSIGHTS.map((insight, index) => (
        <motion.div
          key={insight.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06 + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="flex min-h-0 flex-1 flex-col rounded-xl border border-stone-200/85 bg-white/90 px-3 py-3 shadow-md shadow-stone-900/10 backdrop-blur-md"
        >
          <div>
            <div className="flex items-start justify-between gap-2">
              <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-stone-500">{insight.label}</p>
              <span className="shrink-0 rounded border border-stone-200/90 bg-stone-50 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-stone-600">
                {insight.tag}
              </span>
            </div>
            <p className="mt-1.5 text-[12px] font-semibold leading-snug tracking-tight text-stone-900">{insight.headline}</p>
            <p className="mt-2 text-[10px] leading-relaxed text-stone-600">{insight.body}</p>
          </div>
          <p className="sr-only">Reference metro: {insight.anchorCity}</p>
        </motion.div>
      ))}
    </div>
  )
}
