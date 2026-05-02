import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] hover:scale-[1.02] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary-600 text-white shadow-md shadow-primary-600/25 hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/30',
        secondary:
          'border-2 border-primary-500 bg-white text-primary-700 shadow-sm hover:bg-primary-50',
        accent:
          'border border-accent-600/30 bg-accent-600 text-white shadow-sm hover:bg-accent-700',
        ghost: 'hover:bg-primary-50/80 hover:text-primary-900 text-stone-700',
        outline:
          'border-2 border-stone-200 bg-white/80 text-stone-800 hover:border-primary-300 hover:bg-primary-50/50',
        destructive: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
      },
      size: {
        default: 'h-11 px-5 py-2',
        sm: 'h-9 rounded-lg px-3.5 text-xs',
        lg: 'h-12 rounded-xl px-8 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
