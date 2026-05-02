import type {
  CitiesResponse,
  HealthResponse,
  LocalitiesResponse,
  ZonesResponse,
} from '@/types/api.types'

import { api } from './api'

export const referenceService = {
  checkHealth: async (): Promise<HealthResponse> => {
    const { data } = await api.get<HealthResponse>('/health')
    return data
  },

  getCities: async (): Promise<CitiesResponse> => {
    const { data } = await api.get<CitiesResponse>('/cities')
    return data
  },

  getZones: async (city: string): Promise<ZonesResponse> => {
    const { data } = await api.get<ZonesResponse>(`/zones/${encodeURIComponent(city)}`)
    return data
  },

  getLocalities: async (
    city: string,
    zone: string,
  ): Promise<LocalitiesResponse> => {
    const { data } = await api.get<LocalitiesResponse>(
      `/localities/${encodeURIComponent(city)}/${encodeURIComponent(zone)}`,
    )
    return data
  },
}
