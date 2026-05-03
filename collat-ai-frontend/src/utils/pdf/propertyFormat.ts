import type { ValuationRequest } from '@/types/api.types'

/** Hero line: type, locality, zone, city — e.g. "Apartment, Churchgate, South Mumbai". */
export function formatPropertyHeroLine(req: ValuationRequest): string {
  const parts: string[] = [req.property_type]
  if (req.locality) parts.push(req.locality)
  if (req.zone) parts.push(req.zone)
  parts.push(req.city)
  return parts.join(', ')
}

/** Single-line key specs for PDF snapshot. */
export function formatPropertySpecsLine(req: ValuationRequest): string {
  const bhk = `${req.bedrooms} BHK`
  const floor = `Floor ${req.floor_number}/${req.total_floors}`
  const age = `${req.age_years} years old`
  const area = `${req.area_sqft.toLocaleString('en-IN')} sqft`
  return `${area}  |  ${bhk}  |  ${floor}  |  ${age}  |  ${req.ownership_type}`
}

export function formatPropertyAddressLine(req: ValuationRequest): string {
  const parts: string[] = [req.city]
  if (req.zone) parts.push(req.zone)
  if (req.locality) parts.push(req.locality)
  return parts.join(' · ')
}

export function propertyDetailRows(req: ValuationRequest): { label: string; value: string }[] {
  return [
    { label: 'Property type', value: req.property_type },
    { label: 'Carpet / built-up area', value: `${req.area_sqft.toLocaleString('en-IN')} sqft` },
    { label: 'Age (years)', value: String(req.age_years) },
    { label: 'Floor', value: `${req.floor_number} / ${req.total_floors}` },
    { label: 'Occupancy', value: `${req.occupancy}%` },
    { label: 'Ownership', value: req.ownership_type },
    { label: 'Bedrooms / baths', value: `${req.bedrooms} / ${req.bathrooms}` },
    { label: 'Parking', value: String(req.parking_slots) },
  ]
}
