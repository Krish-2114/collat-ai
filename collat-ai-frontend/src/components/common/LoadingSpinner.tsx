import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

export function LoadingSpinner({
  className,
  label,
}: {
  className?: string
  label?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)} role="status">
      <Loader2 className="h-5 w-5 animate-spin text-primary-600" aria-hidden />
      {label ? <span className="text-sm text-gray-600">{label}</span> : null}
    </span>
  )
}
