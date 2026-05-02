import { AlertTriangle } from 'lucide-react'

import { AnimatedOutlet } from '@/components/layout/AnimatedOutlet'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { useHealthCheck } from '@/hooks/useHealthCheck'
import { usePropertyStore } from '@/store/propertyStore'

export function AppShell() {
  useHealthCheck()
  const backendOnline = usePropertyStore((s) => s.backendOnline)
  const modelsLoaded = usePropertyStore((s) => s.modelsLoaded)
  const modelLoadError = usePropertyStore((s) => s.modelLoadError)

  return (
    <div className="flex min-h-svh flex-col bg-surface">
      <Header />
      {backendOnline === false ? (
        <div className="flex items-start gap-2 border-b border-primary-200/80 bg-primary-50 px-4 py-3 text-sm text-stone-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" aria-hidden />
          <div>
            <p className="font-medium">Backend unreachable</p>
            <p className="mt-1 text-stone-700">
              Start the API from the Collat_AI repo:{' '}
              <code className="rounded-md border border-primary-200/60 bg-white/80 px-1.5 py-0.5 font-mono text-xs text-stone-800">
                cd src; python -m uvicorn api:app --host 0.0.0.0 --port 8000
              </code>
            </p>
          </div>
        </div>
      ) : null}
      {backendOnline && modelsLoaded === false ? (
        <div className="border-b border-primary-200/80 bg-primary-50/90 px-4 py-3 text-sm text-stone-800">
          <div className="mx-auto max-w-[1600px] space-y-2">
            <p>
              API is online but models did not load (valuation returns 503). Ensure the four{' '}
              <code className="rounded bg-white/90 px-1 font-mono text-xs text-stone-900">*.joblib</code> engines live
              in <code className="rounded bg-white/90 px-1 font-mono text-xs text-stone-900">models/</code> next to
              <code className="rounded bg-white/90 px-1 font-mono text-xs text-stone-900">src/</code>, or set env{' '}
              <code className="rounded bg-white/90 px-1 font-mono text-xs text-stone-900">COLLAT_AI_MODEL_DIR</code> to
              that folder, then restart the API (or POST <code className="font-mono text-xs">/reload</code>).
            </p>
            {modelLoadError ? (
              <p className="rounded-md border border-stone-200 bg-white/90 px-2 py-1.5 font-mono text-xs text-red-900">
                {modelLoadError}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
      <main className="flex flex-1 flex-col">
        <ErrorBoundary>
          <AnimatedOutlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  )
}
