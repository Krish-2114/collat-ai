import { motion } from 'framer-motion'

import { DownloadReportButton } from '@/components/common/DownloadReportButton'
import { MODEL_CARDS } from '@/components/models/modelsContent'
import { ModelCard } from '@/components/models/ModelCard'
import { ModelsOverviewStrip } from '@/components/models/ModelsOverviewStrip'

export default function Models() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-6xl px-4 py-12 pb-20 lg:px-8 lg:py-16"
    >
      <header className="mb-12 flex flex-col gap-6 border-b border-stone-200/70 pb-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="text-left">
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">AI Models</h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-stone-600">
            Understand what each model does, what it uses, and what you get.
          </p>
        </div>
        <DownloadReportButton variant="overview" slug="models" className="shrink-0 self-start border-stone-200" />
      </header>

      <ModelsOverviewStrip />

      <div className="mt-12 flex flex-col gap-10 lg:mt-14 lg:gap-12">
        {MODEL_CARDS.map((model, index) => (
          <ModelCard key={model.id} model={model} index={index} />
        ))}
      </div>
    </motion.div>
  )
}
