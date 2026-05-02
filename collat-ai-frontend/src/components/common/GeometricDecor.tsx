import { motion } from 'framer-motion'

/** Light wireframe-style shapes inspired by product-analysis dashboards */
export function GeometricDecor({ className }: { className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
      aria-hidden
    >
      <motion.svg
        viewBox="0 0 200 160"
        className="mx-auto h-40 w-full max-w-[280px] text-primary-300/90"
        fill="none"
        animate={{ rotate: [0, 1.5, 0, -1.5, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      >
        <polygon
          points="100,20 150,70 130,120 70,120 50,70"
          stroke="currentColor"
          strokeWidth="1.2"
          className="fill-primary-100/50"
        />
        <motion.rect
          x="35"
          y="55"
          width="48"
          height="48"
          rx="8"
          stroke="currentColor"
          strokeWidth="1"
          className="fill-primary-50/60"
          transform="rotate(-12 59 79)"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.polygon
          points="155,95 185,125 165,145 135,130"
          stroke="currentColor"
          strokeWidth="1"
          className="fill-primary-200/35"
          animate={{ y: [0, 3, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />
        <circle cx="88" cy="42" r="4" className="fill-primary-400/50" />
        <circle cx="142" cy="48" r="3" className="fill-primary-500/35" />
      </motion.svg>
    </motion.div>
  )
}
