import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'

import { PreAnalysisMarketIntelligenceDashboard } from '@/components/common/PreAnalysisMarketIntelligenceDashboard'

type PreAnalysisRightColumnProps = {
  error: string | null
  isLoading: boolean
  hasResult: boolean
  loadingContent: ReactNode
  resultsContent: ReactNode
  errorContent: ReactNode
}

/**
 * Right column: pre-analysis dashboard → loading → results, with motion between idle and loading.
 */
export function PreAnalysisRightColumn({
  error,
  isLoading,
  hasResult,
  loadingContent,
  resultsContent,
  errorContent,
}: PreAnalysisRightColumnProps) {
  return (
    <div className="min-w-0 flex-1 space-y-6 lg:w-[60%]">
      {error ? errorContent : null}

      <AnimatePresence mode="wait">
        {isLoading && !error ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {loadingContent}
          </motion.div>
        ) : !hasResult && !error ? (
          <motion.div
            key="pre-analysis"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            <PreAnalysisMarketIntelligenceDashboard />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!isLoading && hasResult ? (
        <motion.div
          key="analysis-results"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          {resultsContent}
        </motion.div>
      ) : null}
    </div>
  )
}
