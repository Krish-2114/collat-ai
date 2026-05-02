import type { ValuationRequest, ValuationResponse } from '@/types/api.types'

import { api } from './api'

export const valuationService = {
  valuate: async (property: ValuationRequest): Promise<ValuationResponse> => {
    const { data } = await api.post<ValuationResponse>('/valuate', property)
    return data
  },

  batchValuate: async (
    properties: ValuationRequest[],
    includeShap = false,
  ): Promise<{ count: number; results: ValuationResponse[] }> => {
    const { data } = await api.post<{ count: number; results: ValuationResponse[] }>(
      '/valuate/batch',
      { properties, include_shap: includeShap },
    )
    return data
  },
}
