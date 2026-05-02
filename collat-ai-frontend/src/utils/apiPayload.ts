import type { ValuationRequest } from '@/types/api.types'
import type { PropertyFormValues } from '@/utils/validators'

export function toValuationRequest(v: PropertyFormValues): ValuationRequest {
  return {
    ...v,
    zone: v.zone?.trim() ? v.zone : undefined,
    locality: v.locality?.trim() ? v.locality : undefined,
    sub_type: v.sub_type?.trim() ? v.sub_type : undefined,
  }
}
