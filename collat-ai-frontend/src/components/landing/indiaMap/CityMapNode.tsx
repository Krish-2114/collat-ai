import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

import type { CityName } from '@/types/api.types'

import { CityNodeTooltip } from '@/components/landing/indiaMap/CityNodeTooltip'
import { MapPinIcon } from '@/components/landing/indiaMap/MapPinIcon'
import { growthPctForCity, isTier1, sparklineForCity } from '@/components/landing/indiaMap/mockMapData'

import { CITY_INFO } from '@/utils/constants'

type CityMapNodeProps = {
  city: CityName
  leftPct: number
  topPct: number
  focused: CityName | null
  onSelect: (city: CityName) => void
}

export function CityMapNode({ city, leftPct, topPct, focused, onSelect }: CityMapNodeProps) {
  const [hovered, setHovered] = useState(false)
  const tier1 = isTier1(city)
  const dimmed = focused !== null && focused !== city
  const psf = CITY_INFO[city].base_psf
  const psfLabel = psf >= 1000 ? `₹${(psf / 1000).toFixed(1)}k/sqft` : `₹${psf}/sqft`
  const { up, pct } = growthPctForCity(city)
  const growthLabel = `${up ? '+' : ''}${pct}%`
  const spark = sparklineForCity(city)
  const tipRight = leftPct > 58
  const ringW = tier1 ? 38 : 32

  return (
    <motion.button
      type="button"
      aria-label={`${city}, ${psfLabel}, ${growthLabel}`}
      aria-pressed={focused === city}
      className="pointer-events-auto absolute -translate-x-1/2 -translate-y-[calc(100%-1px)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      style={{
        left: `${leftPct}%`,
        top: `${topPct}%`,
        zIndex: hovered || focused === city ? 40 : 12,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(city)}
      animate={{
        scale: hovered ? 1.22 : focused === city ? 1.12 : tier1 ? 1.06 : 1,
        opacity: dimmed ? 0.35 : 1,
      }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="relative flex items-center justify-center">
        <motion.span
          className="absolute rounded-full border border-primary-500/25 bg-transparent"
          animate={{
            scale: [1, 1.45, 1],
            opacity: [0.35, 0.05, 0.35],
          }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: (leftPct % 7) * 0.12 }}
          style={{ width: ringW, height: ringW * 0.55 }}
          aria-hidden
        />
        <motion.span
          className="pointer-events-none absolute left-1/2 top-[55%] h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-600/35 blur-lg"
          animate={{ opacity: hovered ? 0.95 : 0.52, scale: hovered ? 1.18 : 1 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        />
        <span className="relative z-[1] drop-shadow-[0_4px_8px_rgba(234,88,12,0.38)]" aria-hidden>
          <MapPinIcon large={tier1} />
        </span>
        <AnimatePresence>
          {hovered ? (
            <CityNodeTooltip
              city={city}
              psfLabel={psfLabel}
              growthLabel={growthLabel}
              growthUp={up}
              sparkline={spark}
              align={tipRight ? 'right' : 'left'}
            />
          ) : null}
        </AnimatePresence>
      </span>
    </motion.button>
  )
}
