import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary-100 text-primary-700 hover:bg-primary-100/80',
        secondary:
          'border-transparent bg-stone-150 text-stone-800 hover:bg-stone-200/90',
        destructive:
          'border-transparent bg-red-100 text-red-800 hover:bg-red-100/80',
        outline: 'border-stone-200 text-stone-800 bg-white',
        success:
          'border-transparent bg-emerald-50 text-emerald-800 border-emerald-200',
        warning:
          'border-transparent bg-amber-50 text-amber-900 border-amber-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
