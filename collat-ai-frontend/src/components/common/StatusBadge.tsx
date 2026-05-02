import { cn } from '@/lib/utils'

export function StatusBadge({
  ok,
  label,
  className,
}: {
  ok: boolean
  label: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
        ok
          ? 'border-emerald-200/90 bg-emerald-50/90 text-emerald-900'
          : 'border-red-200/90 bg-red-50 text-red-900',
        className,
      )}
    >
      <span
        className={cn('h-1.5 w-1.5 shrink-0 rounded-full motion-safe:animate-pulse', ok ? 'bg-emerald-500' : 'bg-red-500')}
        aria-hidden
      />
      {label}
    </span>
  )
}
