import type { ReactNode } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Badge } from '@/components/ui/badge'
import {
  LIQUIDITY_HEAT_INSIGHT,
  LIQUIDITY_HEAT_SCORE,
  LOCAL_PRICE_GROWTH_PCT,
  LOCAL_PRICE_TREND_PSF,
  SUPPLY_DEMAND,
} from '@/components/common/preAnalysisDashboardData'

function PanelShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-lg border border-stone-200/90 bg-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] ${className ?? ''}`}
    >
      {children}
    </div>
  )
}

function WidgetTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">{children}</h3>
  )
}

function LocalPriceTrendWidget() {
  return (
    <PanelShell className="p-4 sm:p-5">
      <WidgetTitle>Local Price Trend (₹/sq.ft)</WidgetTitle>
      <div className="mt-3 h-[200px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={[...LOCAL_PRICE_TREND_PSF]} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-stone-200)" vertical={false} />
            <XAxis dataKey="m" tick={{ fontSize: 11, fill: 'var(--color-stone-600)' }} axisLine={{ stroke: 'var(--color-stone-300)' }} tickLine={false} />
            <YAxis
              width={48}
              tick={{ fontSize: 10, fill: 'var(--color-stone-600)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(1)}k`}
              domain={['dataMin - 200', 'dataMax + 200']}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: '1px solid var(--color-stone-200)',
                fontSize: 12,
                background: 'var(--color-surface-card)',
              }}
              formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}/sqft`, '']}
              labelFormatter={(l) => `${l}`}
            />
            <Line type="monotone" dataKey="psf" name="₹/sqft" stroke="var(--color-primary-600)" strokeWidth={2} dot={{ r: 3, fill: 'var(--color-primary-600)', strokeWidth: 0 }} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2 border-t border-stone-100 pt-3">
        <p className="font-mono text-xs tabular-nums text-stone-600">
          Jan → ₹16,200 · … · Jun → ₹17,850
        </p>
        <p className="text-sm font-semibold tabular-nums text-primary-800">+{LOCAL_PRICE_GROWTH_PCT}% <span className="font-normal text-stone-500">(6 mo)</span></p>
      </div>
    </PanelShell>
  )
}

function SupplyDemandWidget() {
  const chartData = [
    { name: 'Available listings', value: SUPPLY_DEMAND.availableListings },
    { name: 'Buyer demand score', value: SUPPLY_DEMAND.buyerDemandScore },
  ]
  return (
    <PanelShell className="flex h-full flex-col p-4 sm:p-5">
      <WidgetTitle>Supply vs Demand</WidgetTitle>
      <div className="mt-3 min-h-[168px] flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 4 }} barCategoryGap={12}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-stone-200)" horizontal />
            <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--color-stone-600)' }} axisLine={{ stroke: 'var(--color-stone-300)' }} tickLine={false} />
            <YAxis type="category" dataKey="name" width={118} tick={{ fontSize: 10, fill: 'var(--color-stone-700)' }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: 'var(--color-primary-50)', opacity: 0.35 }}
              contentStyle={{
                borderRadius: 8,
                border: '1px solid var(--color-stone-200)',
                fontSize: 12,
                background: 'var(--color-surface-card)',
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} fill="var(--color-primary-600)" maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 space-y-1 border-t border-stone-100 pt-3 font-mono text-xs tabular-nums text-stone-700">
        <p>Listings: {SUPPLY_DEMAND.availableListings.toLocaleString('en-IN')}</p>
        <p>Demand score: {SUPPLY_DEMAND.buyerDemandScore.toLocaleString('en-IN')}</p>
        <p className="pt-1 text-[13px] font-semibold text-stone-900">{SUPPLY_DEMAND.insight}</p>
      </div>
    </PanelShell>
  )
}

function LiquidityHeatWidget() {
  const score = LIQUIDITY_HEAT_SCORE
  const gauge = [{ name: 'heat', value: score, fill: 'var(--color-primary-600)' }]
  return (
    <PanelShell className="flex h-full flex-col p-4 sm:p-5">
      <WidgetTitle>Micro-Market Liquidity</WidgetTitle>
      <div className="relative mx-auto mt-2 h-[160px] w-[160px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="72%" outerRadius="100%" barSize={9} data={gauge} startAngle={90} endAngle={-270}>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar background={{ fill: 'var(--color-stone-200)' }} dataKey="value" cornerRadius={3} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-1">
          <span className="font-mono text-3xl font-bold tabular-nums text-stone-900">{score}</span>
          <span className="text-[11px] font-medium text-stone-500">/ 100</span>
        </div>
      </div>
      <p className="mt-auto border-t border-stone-100 pt-3 text-center text-sm font-medium leading-snug text-stone-800">{LIQUIDITY_HEAT_INSIGHT}</p>
    </PanelShell>
  )
}

/**
 * Pre-run market context panel (Valuation, Liquidity, Fraud right column).
 * Fades out when analysis starts; not a substitute for model outputs.
 */
export function PreAnalysisMarketIntelligenceDashboard() {
  return (
    <div className="overflow-hidden rounded-xl border border-stone-200/90 bg-stone-50/40 shadow-sm shadow-stone-900/[0.06] ring-1 ring-stone-200/40">
      <header className="border-b border-stone-200/80 bg-surface-card px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight text-stone-900 sm:text-xl">Pre-Analysis Market Intelligence</h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-stone-600">
              Market signals and micro-market activity before valuation is run.
            </p>
          </div>
          <Badge variant="outline" className="shrink-0 border-primary-300/80 bg-primary-50/90 text-xs font-semibold text-primary-900">
            Live Market Signals
          </Badge>
        </div>
      </header>

      <div className="space-y-4 p-4 sm:p-5">
        <LocalPriceTrendWidget />

        <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
          <SupplyDemandWidget />
          <LiquidityHeatWidget />
        </div>
      </div>
    </div>
  )
}
