import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type OutputBoxProps = {
  children: ReactNode
  className?: string
}

/** Highlighted example output — elevated, primary-tinted edge. */
export function OutputBox({ children, className }: OutputBoxProps) {
  return (
    <div
      className={cn(
        'rounded-xl border-2 border-primary-200/50 bg-gradient-to-b from-primary-50/40 to-stone-50/90 px-4 py-3.5 text-sm leading-relaxed text-stone-800',
        'shadow-md shadow-stone-900/[0.05] ring-1 ring-stone-200/60',
        className,
      )}
    >
      {children}
    </div>
  )
}
