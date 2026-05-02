import { useEffect } from 'react'

import { referenceService } from '@/services/referenceService'
import { usePropertyStore } from '@/store/propertyStore'

const POLL_MS = 12_000

export function useHealthCheck() {
  const setBackendStatus = usePropertyStore((s) => s.setBackendStatus)

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setInterval> | undefined

    const tick = async () => {
      try {
        const h = await referenceService.checkHealth()
        if (!cancelled) {
          setBackendStatus(true, h.models_loaded, h.load_error ?? null)
        }
      } catch {
        if (!cancelled) {
          setBackendStatus(false, false, null)
        }
      }
    }

    void tick()
    timer = setInterval(() => void tick(), POLL_MS)

    return () => {
      cancelled = true
      if (timer) clearInterval(timer)
    }
  }, [setBackendStatus])
}
