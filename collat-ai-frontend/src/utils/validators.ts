import { z } from 'zod'

const citySchema = z.enum([
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Pune',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
])

const propertyTypeSchema = z.enum([
  'Apartment',
  'Villa',
  'Commercial',
  'Industrial',
  'Plot',
])

const ownershipSchema = z.enum(['Freehold', 'Leasehold'])

function optionalNonNegative() {
  return z
    .union([z.string(), z.number(), z.undefined()])
    .transform((val) => {
      if (val === '' || val === null || val === undefined) return undefined
      const n = Number(val)
      return Number.isFinite(n) ? n : undefined
    })
    .pipe(z.number().nonnegative().optional())
}

function optionalLatLon() {
  return z
    .union([z.string(), z.number(), z.undefined()])
    .transform((val) => {
      if (val === '' || val === null || val === undefined) return undefined
      const n = Number(val)
      return Number.isFinite(n) ? n : undefined
    })
    .pipe(z.number().optional())
}

export const propertySchema = z
  .object({
    city: citySchema,
    zone: z
      .union([z.string(), z.undefined()])
      .transform((v) => {
        if (v === undefined || v === null) return undefined
        const s = String(v).trim()
        return s === '' ? undefined : s
      })
      .pipe(z.string().optional()),
    locality: z
      .union([z.string(), z.undefined()])
      .transform((v) => {
        if (v === undefined || v === null) return undefined
        const s = String(v).trim()
        return s === '' ? undefined : s
      })
      .pipe(z.string().optional()),
    lat: optionalLatLon(),
    lon: optionalLatLon(),
    property_type: propertyTypeSchema,
    sub_type: z
      .union([z.string(), z.undefined()])
      .transform((v) => {
        if (v === undefined || v === null) return undefined
        const s = String(v).trim()
        return s === '' ? undefined : s
      })
      .pipe(z.string().optional()),
    area_sqft: z.coerce.number().min(50).max(100_000),
    age_years: z.coerce.number().min(0).max(100),
    floor_number: z.coerce.number().int().min(0).max(200),
    total_floors: z.coerce.number().int().min(1).max(200),
    bedrooms: z.coerce.number().int().min(0).max(20),
    bathrooms: z.coerce.number().int().min(0).max(20),
    parking_slots: z.coerce.number().int().min(0).max(10),
    furnishing: z.coerce.number().int().min(0).max(2),
    occupancy: z.coerce.number().int().min(0).max(2),
    monthly_rent: z.coerce.number().min(0),
    ownership_type: ownershipSchema,
    lift_available: z.boolean(),
    security_available: z.boolean(),
    gym_available: z.boolean(),
    swimming_pool: z.boolean(),
    clubhouse: z.boolean(),
    power_backup: z.boolean(),
    intercom: z.boolean(),
    cctv: z.boolean(),
    rera_registered: z.boolean(),
    oc_received: z.boolean(),
    cc_received: z.boolean(),
    bmc_approved: z.boolean(),
    legal_clear: z.boolean(),
    encumbrance_flag: z.boolean(),
    litigation_flag: z.boolean(),
    title_age_years: z.coerce.number().int().min(0),
    registered_sale_deed: z.boolean(),
    loan_on_property: z.boolean(),
    mutation_done: z.boolean(),
    flood_zone_flag: z.boolean(),
    crz_flag: z.boolean(),
    heritage_zone_flag: z.boolean(),
    slum_proximity_flag: z.boolean(),
    planned_zone_flag: z.boolean(),
    it_park_proximity: z.boolean(),
    circle_rate_sqft: optionalNonNegative(),
    listing_price_sqft: optionalNonNegative(),
    img_count: z.coerce.number().int().min(0).max(20),
    vastu_compliant: z.boolean(),
    corner_unit: z.boolean(),
    east_facing: z.boolean(),
    balcony_count: z.coerce.number().int().min(0).max(5),
    servant_room: z.boolean(),
    modular_kitchen: z.boolean(),
    smart_home: z.boolean(),
  })
  .refine((data) => data.floor_number <= data.total_floors, {
    message: 'Floor number cannot exceed total floors',
    path: ['floor_number'],
  })

export type PropertyFormValues = z.output<typeof propertySchema>
