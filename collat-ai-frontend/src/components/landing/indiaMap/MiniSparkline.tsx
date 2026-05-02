type MiniSparklineProps = {
  values: number[]
  className?: string
}

/** Tiny SVG sparkline; values expected roughly 0–100 */
export function MiniSparkline({ values, className }: MiniSparklineProps) {
  if (values.length < 2) return null
  const w = 72
  const h = 22
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = Math.max(1e-6, max - min)
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w
    const y = h - ((v - min) / span) * (h - 4) - 2
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return (
    <svg className={className} width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary-600/90"
        points={pts.join(' ')}
      />
    </svg>
  )
}
