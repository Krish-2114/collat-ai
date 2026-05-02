import { cn } from '@/lib/utils'

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl bg-gradient-to-r from-primary-100/80 via-stone-100 to-primary-100/80 bg-[length:200%_100%] motion-safe:animate-[shimmer_2s_ease-in-out_infinite]',
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
