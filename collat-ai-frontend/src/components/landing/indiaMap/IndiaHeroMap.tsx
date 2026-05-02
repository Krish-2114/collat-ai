import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useCallback, useRef, useState } from 'react'

import type { CityName } from '@/types/api.types'

import { CityMapNode } from '@/components/landing/indiaMap/CityMapNode'
import { MapInsightsColumn } from '@/components/landing/indiaMap/MapInsightsColumn'
import { MapSidePanel } from '@/components/landing/indiaMap/MapSidePanel'
import { INDIA_MAP_SRC, METRO_GEO, projectLonLatToPercent } from '@/components/landing/indiaGeo'

import { CITY_NAMES } from '@/utils/constants'

export function IndiaHeroMap() {
  const [focused, setFocused] = useState<CityName | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 160, damping: 28, mass: 0.4 })
  const sy = useSpring(my, { stiffness: 160, damping: 28, mass: 0.4 })

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      const el = wrapRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      mx.set(px * 3.5)
      my.set(py * 3.5)
    },
    [mx, my],
  )

  const onLeave = useCallback(() => {
    mx.set(0)
    my.set(0)
  }, [mx, my])

  const toggleFocus = useCallback((city: CityName) => {
    setFocused((f) => (f === city ? null : city))
  }, [])

  return (
    <div className="flex w-full flex-col gap-5 lg:flex-row lg:items-stretch lg:gap-6">
      <div
        ref={wrapRef}
        className="relative mx-auto w-full max-w-[420px] shrink-0 overflow-visible lg:mx-0"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        <motion.div
          style={{ x: sx, y: sy }}
          className="relative w-full max-w-[420px] rounded-2xl border border-stone-200/90 bg-gradient-to-b from-white via-white to-stone-100/90 p-[3px] shadow-[0_16px_48px_-14px_rgba(15,23,42,0.22)] ring-1 ring-stone-900/[0.05]"
        >
          <div className="relative rounded-[13px]">
            <div className="relative overflow-hidden rounded-[13px] shadow-inner shadow-stone-900/[0.06]">
              <div className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute left-[6%] top-[26%] h-[45%] w-[40%] rounded-full bg-primary-600/[0.05] blur-3xl" />
                <div className="absolute right-[4%] top-[20%] h-[38%] w-[36%] rounded-full bg-primary-600/[0.045] blur-3xl" />
                <div className="absolute bottom-[6%] left-[32%] h-[32%] w-[48%] rounded-full bg-stone-900/[0.04] blur-3xl" />
              </div>
              <div
                className="pointer-events-none absolute inset-0 z-[1] opacity-[0.4]"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(0,0,0,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.028)_1px,transparent_1px)',
                  backgroundSize: '16px 16px',
                }}
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 z-[2]"
                style={{
                  background:
                    'radial-gradient(ellipse at 50% 40%, transparent 48%, rgba(255,255,255,0.08) 68%, rgba(255,255,255,0.72) 100%)',
                }}
                aria-hidden
              />
              <img
                src={INDIA_MAP_SRC}
                alt=""
                draggable={false}
                className="relative z-[3] block h-auto w-full select-none"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 z-[6] overflow-visible">
              {CITY_NAMES.map((city) => {
                const g = METRO_GEO[city]
                const p = projectLonLatToPercent(g.lon, g.lat)
                return (
                  <CityMapNode
                    key={city}
                    city={city}
                    leftPct={p.leftPct}
                    topPct={p.topPct}
                    focused={focused}
                    onSelect={toggleFocus}
                  />
                )
              })}
            </div>
          </div>
        </motion.div>
      </div>
      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-4 self-stretch lg:flex-row lg:items-stretch lg:gap-5">
        <div className="flex w-full shrink-0 lg:max-w-[17.5rem] lg:min-h-0">
          <MapSidePanel city={focused} onClear={() => setFocused(null)} />
        </div>
        <MapInsightsColumn />
      </div>
    </div>
  )
}
