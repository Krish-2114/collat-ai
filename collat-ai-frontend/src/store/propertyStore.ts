import { create } from 'zustand'

import type { ValuationRequest, ValuationResponse } from '@/types/api.types'

interface PropertyStore {
  propertyData: Partial<ValuationRequest>
  valuationResult: ValuationResponse | null
  lastPropertyRequest: ValuationRequest | null
  isLoading: boolean
  error: string | null
  backendOnline: boolean | null
  modelsLoaded: boolean | null
  modelLoadError: string | null
  setPropertyData: (data: Partial<ValuationRequest>) => void
  setValuationResult: (result: ValuationResponse | null) => void
  setLastPropertyRequest: (payload: ValuationRequest | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setBackendStatus: (
    online: boolean,
    modelsLoaded: boolean,
    modelLoadError?: string | null,
  ) => void
  reset: () => void
}

export const usePropertyStore = create<PropertyStore>((set) => ({
  propertyData: {},
  valuationResult: null,
  lastPropertyRequest: null,
  isLoading: false,
  error: null,
  backendOnline: null,
  modelsLoaded: null,
  modelLoadError: null,

  setPropertyData: (data) =>
    set((s) => ({ propertyData: { ...s.propertyData, ...data } })),

  setValuationResult: (result) => set({ valuationResult: result }),

  setLastPropertyRequest: (payload) => set({ lastPropertyRequest: payload }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  setBackendStatus: (online, modelsLoaded, modelLoadError = null) =>
    set({
      backendOnline: online,
      modelsLoaded,
      modelLoadError: modelLoadError ?? null,
    }),

  reset: () =>
    set({
      propertyData: {},
      valuationResult: null,
      lastPropertyRequest: null,
      error: null,
      isLoading: false,
      backendOnline: null,
      modelsLoaded: null,
      modelLoadError: null,
    }),
}))
