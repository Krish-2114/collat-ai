import { CalendarDays, ChevronDown, MapPin } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import type { CityName } from '@/types/api.types'
import { CITY_INFO, CITY_NAMES } from '@/utils/constants'

type RangeKey = '6m' | '12m'

function hashSeed(city: string, range: string): number {
  let h = 2166136261
  for (let i = 0; i < city.length; i++) h = Math.imul(h ^ city.charCodeAt(i), 16777619)
  h = Math.imul(h ^ range.length, 16777619)
  for (let i = 0; i < range.length; i++) h = Math.imul(h ^ range.charCodeAt(i), 16777619)
  return h >>> 0
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function monthLabels(n: 6 | 12): string[] {
  if (n === 6) return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  return ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
}

function buildModel(city: CityName, range: RangeKey) {
  const seed = hashSeed(city, range)
  const rand = mulberry32(seed)
  const basePsf = CITY_INFO[city].base_psf
  const n = range === '12m' ? 12 : 6
  const labels = monthLabels(n)

  const trend = labels.map((m, i) => {
    const wave = Math.sin((i / Math.max(n - 1, 1)) * Math.PI) * 0.04
    const jitter = (rand() - 0.5) * 0.06
    const growth = (i / Math.max(n - 1, 1)) * 0.12
    const v = Math.round(basePsf * (1 + growth + wave + jitter))
    return { m, v }
  })

  const riskMonths = labels.map((m, i) => {
    const base = 32 + (seed % 25) + i * 2
    const v = Math.round(base * (0.85 + rand() * 0.35))
    return { m, v }
  })

  const totalAnalyses = 8200 + (seed % 8200)
  const avgConfPct = 86 + (seed % 12)
  const highRisk = 160 + ((seed >> 5) % 220)
  const ltvAccPct = 88 + ((seed >> 9) % 9)

  const fmtDelta = (up: boolean, mag: number) => `${up ? '+' : '−'}${mag.toFixed(1)}%`

  const kpis = [
    {
      label: 'Total analyses',
      value: totalAnalyses.toLocaleString('en-IN'),
      delta: fmtDelta(true, 12 + rand() * 12),
      up: true,
      to: '/portfolio' as const,
    },
    {
      label: 'Avg confidence',
      value: `${avgConfPct}%`,
      delta: fmtDelta(true, 4 + rand() * 8),
      up: true,
      to: '/valuate' as const,
    },
    {
      label: 'High risk cases',
      value: String(highRisk),
      delta: fmtDelta(false, 8 + rand() * 10),
      up: false,
      to: '/fraud' as const,
    },
    {
      label: 'Avg LTV accuracy',
      value: `${ltvAccPct}%`,
      delta: fmtDelta(true, 3 + rand() * 6),
      up: true,
      to: '/liquidity' as const,
    },
  ]

  let h = 28 + Math.floor(rand() * 22)
  let m = 28 + Math.floor(rand() * 18)
  let l = 100 - h - m
  if (l < 12) {
    const d = 12 - l
    l = 12
    h = Math.max(18, h - Math.ceil(d / 2))
    m = 100 - h - l
  }

  const donut = [
    { name: 'High', value: h, fill: '#7c3aed' },
    { name: 'Medium', value: m, fill: '#eab308' },
    { name: 'Low', value: l, fill: '#dc2626' },
  ]

  const rawReasons = [
    { name: 'High circle rate deviation', fill: '#dc2626' as const },
    { name: 'Ownership mismatch', fill: '#ea580c' as const },
    { name: 'Incomplete documentation', fill: '#eab308' as const },
    { name: 'Litigation / legal issues', fill: '#f97316' as const },
  ]
  const w = [0.42, 0.28, 0.18, 0.12].map((base, i) => {
    const shift = (rand() - 0.5) * 0.08
    return Math.max(0.06, base + shift + ((seed >> (i * 3)) % 7) / 200)
  })
  const sum = w.reduce((a, b) => a + b, 0)
  const riskBars = rawReasons.map((r, i) => ({
    ...r,
    pct: Math.round((w[i]! / sum) * 100),
  }))

  return { trend, riskMonths, donut, kpis, riskBars, totalAnalyses }
}

export function HeroDashboard() {
  const [city, setCity] = useState<CityName>('Mumbai')
  const [range, setRange] = useState<RangeKey>('6m')

  const model = useMemo(() => buildModel(city, range), [city, range])
  const { trend, riskMonths, donut, kpis, riskBars, totalAnalyses } = model
  const barCount = riskMonths.length

  return (
    <div className="rounded-2xl border-2 border-stone-200/90 bg-white p-3.5 shadow-xl shadow-stone-900/[0.08] ring-1 ring-stone-200/50 transition-shadow duration-300 hover:shadow-2xl hover:shadow-primary-600/[0.12] sm:p-4 lg:p-5">
      <div className="flex flex-col gap-3 border-b border-stone-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-stone-900 sm:text-lg">Market overview</h2>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <label className="sr-only" htmlFor="hero-city">
            City
          </label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" aria-hidden />
            <select
              id="hero-city"
              className="h-8 max-w-[11rem] appearance-none truncate rounded-lg border border-stone-200 bg-stone-50/80 py-1 pl-7 pr-7 text-[11px] font-medium text-stone-800 sm:h-9 sm:max-w-none sm:pl-8 sm:pr-8 sm:text-xs"
              value={city}
              onChange={(e) => setCity(e.target.value as CityName)}
            >
              {CITY_NAMES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" aria-hidden />
          </div>
          <label className="sr-only" htmlFor="hero-range">
            Range
          </label>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" aria-hidden />
            <select
              id="hero-range"
              className="h-8 appearance-none rounded-lg border border-stone-200 bg-stone-50/80 py-1 pl-7 pr-7 text-[11px] font-medium text-stone-800 sm:h-9 sm:pl-8 sm:pr-8 sm:text-xs"
              value={range}
              onChange={(e) => setRange(e.target.value as RangeKey)}
            >
              <option value="6m">Last 6 months</option>
              <option value="12m">Last 12 months</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" aria-hidden />
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        {kpis.map((s) => (
          <div
            key={s.label}
            className="block rounded-xl border-2 border-stone-200/80 bg-gradient-to-b from-white to-stone-50/90 px-2 py-2 shadow-sm shadow-stone-900/[0.04] transition-all duration-300 hover:-translate-y-1 hover:border-primary-300/80 hover:shadow-md hover:shadow-primary-600/10 sm:px-2.5 sm:py-2.5"
          >
            <p className="text-[9px] font-semibold uppercase leading-tight tracking-wide text-stone-500 sm:text-[10px]">
              {s.label}
            </p>
            <p className="mt-0.5 truncate font-mono text-sm font-bold text-stone-900 sm:text-base lg:text-lg">{s.value}</p>
            <p className={s.up ? 'text-[10px] font-medium text-emerald-600 sm:text-xs' : 'text-[10px] font-medium text-red-600 sm:text-xs'}>
              {s.delta}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:mt-5 sm:gap-4 lg:grid-cols-2">
        <div className="min-h-0 min-w-0 rounded-xl border-2 border-stone-200/80 bg-white p-2 shadow-md shadow-stone-900/[0.05] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-200/90 hover:shadow-lg sm:p-3">
          <p className="mb-1 text-[10px] font-semibold text-stone-600 sm:mb-2 sm:text-xs">Market value trend (₹/sq.ft.)</p>
          <div className="h-[118px] w-full sm:h-[132px] md:h-[148px] lg:h-[156px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 4, right: 4, left: -4, bottom: 0 }}>
                <XAxis dataKey="m" tick={{ fontSize: 9 }} stroke="#a8a29e" interval="preserveStartEnd" />
                <YAxis width={32} tick={{ fontSize: 9 }} stroke="#a8a29e" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v) => {
                    const n = typeof v === 'number' ? v : Number(v)
                    return [`₹${Number.isFinite(n) ? n.toLocaleString('en-IN') : '—'}`, 'PSF']
                  }}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e7e5e4' }}
                />
                <Line type="monotone" dataKey="v" stroke="#ea580c" strokeWidth={2} dot={{ fill: '#ea580c', r: 2.5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="min-h-0 min-w-0 rounded-xl border-2 border-stone-200/80 bg-white p-2 shadow-md shadow-stone-900/[0.05] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-200/90 hover:shadow-lg sm:p-3">
          <p className="mb-1 text-[10px] font-semibold text-stone-600 sm:mb-2 sm:text-xs">Liquidity score distribution</p>
          <div className="flex h-[118px] items-stretch justify-center gap-2 sm:h-[132px] sm:gap-3 md:h-[148px] lg:h-[156px]">
            <div className="h-full min-h-0 w-[42%] max-w-[130px] shrink-0 sm:max-w-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donut}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="58%"
                    outerRadius="88%"
                    paddingAngle={2}
                  >
                    {donut.map((e, i) => (
                      <Cell key={`${e.name}-${i}`} fill={e.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, n) => {
                      const pct = typeof v === 'number' ? v : Number(v)
                      return [`${Number.isFinite(pct) ? pct : '—'}%`, String(n)]
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center text-[10px] text-stone-600 sm:text-xs">
              <p className="font-mono text-lg font-bold leading-none text-stone-900 sm:text-xl">{totalAnalyses.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-stone-500 sm:text-xs">Total</p>
              <ul className="mt-1 space-y-0.5 sm:mt-1.5 sm:space-y-1">
                {donut.map((d) => (
                  <li key={d.name} className="flex items-center gap-1.5 truncate sm:gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full sm:h-2 sm:w-2" style={{ background: d.fill }} />
                    <span className="truncate">
                      {d.name}: {d.value}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:mt-5 sm:gap-4 lg:grid-cols-2">
        <div className="min-h-0 min-w-0 rounded-xl border-2 border-stone-200/80 bg-white p-2 shadow-md shadow-stone-900/[0.05] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-200/90 hover:shadow-lg sm:p-3">
          <p className="mb-1 text-[10px] font-semibold text-stone-600 sm:mb-2 sm:text-xs">Risk cases over time</p>
          <div className="h-[96px] w-full sm:h-[108px] md:h-[120px] lg:h-[128px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={riskMonths}
                margin={{
                  top: 4,
                  right: 6,
                  left: 4,
                  bottom: range === '12m' ? 28 : 10,
                }}
              >
                <XAxis
                  dataKey="m"
                  tick={{ fontSize: 8, fill: '#78716c' }}
                  stroke="#a8a29e"
                  interval={0}
                  angle={range === '12m' ? -35 : 0}
                  textAnchor={range === '12m' ? 'end' : 'middle'}
                  height={range === '12m' ? 36 : 24}
                />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="v" radius={[4, 4, 0, 0]}>
                  {riskMonths.map((_, i) => (
                    <Cell
                      key={i}
                      fill={
                        barCount <= 1
                          ? '#fb923c'
                          : `hsl(${22 - (i / (barCount - 1)) * 12} 90% ${52 - (i / (barCount - 1)) * 8}%)`
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="min-h-0 min-w-0 rounded-xl border-2 border-stone-200/80 bg-white p-2 shadow-md shadow-stone-900/[0.05] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-200/90 hover:shadow-lg sm:p-3">
          <p className="mb-2 text-[10px] font-semibold text-stone-600 sm:mb-2.5 sm:text-xs">Top risk reasons</p>
          <div className="space-y-2 sm:space-y-2.5">
            {riskBars.map((r) => (
              <div
                key={r.name}
                className="block rounded-lg border border-transparent p-1 transition-all hover:-translate-y-0.5 hover:border-stone-200/80 hover:bg-stone-50/90 hover:shadow-sm"
              >
                <div className="mb-0.5 flex justify-between gap-2 text-[9px] text-stone-600 sm:text-[10px]">
                  <span className="min-w-0 truncate leading-tight">{r.name}</span>
                  <span className="shrink-0 font-mono font-semibold text-stone-800">{r.pct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-stone-100 sm:h-2">
                  <div className="h-full rounded-full transition-all" style={{ width: `${r.pct}%`, background: r.fill }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
