import { useCallback, useEffect, useState } from 'react'

import { referenceService } from '@/services/referenceService'
import type { CitiesResponse } from '@/types/api.types'

export function useCityData(city: string | undefined, zone: string | undefined) {
  const [citiesPayload, setCitiesPayload] = useState<CitiesResponse | null>(null)
  const [zones, setZones] = useState<string[]>([])
  const [localities, setLocalities] = useState<string[]>([])
  const [loadingZones, setLoadingZones] = useState(false)
  const [loadingLocs, setLoadingLocs] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshCities = useCallback(async () => {
    try {
      setError(null)
      const data = await referenceService.getCities()
      setCitiesPayload(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load cities')
    }
  }, [])

  useEffect(() => {
    void refreshCities()
  }, [refreshCities])

  useEffect(() => {
    if (!city) {
      setZones([])
      return
    }
    let cancelled = false
    ;(async () => {
      setLoadingZones(true)
      try {
        const z = await referenceService.getZones(city)
        if (!cancelled) {
          setZones(z.zones)
        }
      } catch {
        if (!cancelled) setZones([])
      } finally {
        if (!cancelled) setLoadingZones(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [city])

  useEffect(() => {
    if (!city || !zone) {
      setLocalities([])
      return
    }
    let cancelled = false
    ;(async () => {
      setLoadingLocs(true)
      try {
        const l = await referenceService.getLocalities(city, zone)
        if (!cancelled) {
          setLocalities(l.localities)
        }
      } catch {
        if (!cancelled) setLocalities([])
      } finally {
        if (!cancelled) setLoadingLocs(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [city, zone])

  return {
    citiesPayload,
    zones,
    localities,
    loadingZones,
    loadingLocs,
    error,
    refreshCities,
  }
}
