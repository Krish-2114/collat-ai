import { useEffect, useRef } from 'react'
import {
  Controller,
  type UseFormReturn,
  useWatch,
} from 'react-hook-form'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCityData } from '@/hooks/useCityData'
import type { PropertyFormValues } from '@/utils/validators'

const selectClass =
  'flex h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-900 shadow-sm transition-[border-color,box-shadow] duration-200 focus-visible:border-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/35'

function BoolRow({
  form,
  name,
  label,
}: {
  form: UseFormReturn<PropertyFormValues>
  name: keyof PropertyFormValues
  label: string
}) {
  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field }) => (
        <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-700 transition-colors hover:text-primary-800">
          <Checkbox
            checked={Boolean(field.value)}
            onCheckedChange={(v) => field.onChange(v === true)}
          />
          {label}
        </label>
      )}
    />
  )
}

export function PropertyForm({
  form,
}: {
  form: UseFormReturn<PropertyFormValues>
}) {
  const city = useWatch({ control: form.control, name: 'city' })
  const zone = useWatch({ control: form.control, name: 'zone' })
  const { zones, localities, loadingZones, loadingLocs } = useCityData(
    city,
    zone,
  )

  const prevCity = useRef(city)
  const prevZone = useRef<string | undefined>(zone)

  useEffect(() => {
    if (prevCity.current !== city) {
      form.setValue('zone', undefined)
      form.setValue('locality', undefined)
      prevCity.current = city
      prevZone.current = undefined
    }
  }, [city, form])

  useEffect(() => {
    if (prevZone.current !== zone) {
      form.setValue('locality', undefined)
      prevZone.current = zone
    }
  }, [zone, form])

  const { register, formState } = form

  return (
    <div className="space-y-4">
      <Accordion
        type="multiple"
        defaultValue={['location', 'basics']}
        className="w-full rounded-xl border border-stone-200/90 bg-surface-card px-4 shadow-sm"
      >
        <AccordionItem value="location">
          <AccordionTrigger>Location details</AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="city">City</Label>
                <select id="city" className={selectClass} {...register('city')}>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Pune">Pune</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Ahmedabad">Ahmedabad</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="zone">Zone</Label>
                <select
                  id="zone"
                  className={selectClass}
                  disabled={loadingZones || zones.length === 0}
                  {...register('zone')}
                >
                  <option value="">Select zone</option>
                  {zones.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="locality">Locality</Label>
                <select
                  id="locality"
                  className={selectClass}
                  disabled={!zone || loadingLocs || localities.length === 0}
                  {...register('locality')}
                >
                  <option value="">Select locality</option>
                  {localities.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lat">Latitude (optional)</Label>
                <Input id="lat" type="number" step="any" {...register('lat')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lon">Longitude (optional)</Label>
                <Input id="lon" type="number" step="any" {...register('lon')} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="basics">
          <AccordionTrigger>Property basics</AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="property_type">Property type</Label>
                <select
                  id="property_type"
                  className={selectClass}
                  {...register('property_type')}
                >
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Plot">Plot</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sub_type">Sub type</Label>
                <Input id="sub_type" placeholder="e.g. 3BHK" {...register('sub_type')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area_sqft">Area (sqft)</Label>
                <Input id="area_sqft" type="number" {...register('area_sqft')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age_years">Age (years)</Label>
                <Input id="age_years" type="number" {...register('age_years')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="floor_number">Floor number</Label>
                <Input id="floor_number" type="number" {...register('floor_number')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_floors">Total floors</Label>
                <Input id="total_floors" type="number" {...register('total_floors')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input id="bedrooms" type="number" {...register('bedrooms')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input id="bathrooms" type="number" {...register('bathrooms')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parking_slots">Parking slots</Label>
                <Input id="parking_slots" type="number" {...register('parking_slots')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownership_type">Ownership</Label>
                <select id="ownership_type" className={selectClass} {...register('ownership_type')}>
                  <option value="Freehold">Freehold</option>
                  <option value="Leasehold">Leasehold</option>
                </select>
              </div>
            </div>
            {formState.errors.floor_number ? (
              <p className="mt-2 text-sm text-red-600">{formState.errors.floor_number.message}</p>
            ) : null}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="amenities">
          <AccordionTrigger>Amenities</AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <BoolRow form={form} name="lift_available" label="Lift available" />
              <BoolRow form={form} name="security_available" label="Security available" />
              <BoolRow form={form} name="gym_available" label="Gym" />
              <BoolRow form={form} name="swimming_pool" label="Swimming pool" />
              <BoolRow form={form} name="clubhouse" label="Clubhouse" />
              <BoolRow form={form} name="power_backup" label="Power backup" />
              <BoolRow form={form} name="intercom" label="Intercom" />
              <BoolRow form={form} name="cctv" label="CCTV" />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="compliance">
          <AccordionTrigger>Compliance & legal</AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <BoolRow form={form} name="rera_registered" label="RERA registered" />
              <BoolRow form={form} name="oc_received" label="OC received" />
              <BoolRow form={form} name="cc_received" label="CC received" />
              <BoolRow form={form} name="bmc_approved" label="BMC / authority approved" />
              <BoolRow form={form} name="legal_clear" label="Legal clear" />
              <BoolRow form={form} name="encumbrance_flag" label="Encumbrance flag" />
              <BoolRow form={form} name="litigation_flag" label="Litigation flag" />
              <BoolRow form={form} name="registered_sale_deed" label="Registered sale deed" />
              <BoolRow form={form} name="loan_on_property" label="Loan on property" />
              <BoolRow form={form} name="mutation_done" label="Mutation done" />
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="title_age_years">Title age (years)</Label>
                <Input id="title_age_years" type="number" {...register('title_age_years')} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="risk">
          <AccordionTrigger>Risk flags</AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <BoolRow form={form} name="flood_zone_flag" label="Flood zone" />
              <BoolRow form={form} name="crz_flag" label="CRZ" />
              <BoolRow form={form} name="heritage_zone_flag" label="Heritage zone" />
              <BoolRow form={form} name="slum_proximity_flag" label="Slum proximity" />
              <BoolRow form={form} name="planned_zone_flag" label="Planned zone" />
              <BoolRow form={form} name="it_park_proximity" label="IT park proximity" />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="market">
          <AccordionTrigger>Market data</AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="circle_rate_sqft">Circle rate (₹/sqft) optional</Label>
                <Input id="circle_rate_sqft" type="number" {...register('circle_rate_sqft')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="listing_price_sqft">Listing price (₹/sqft) optional</Label>
                <Input id="listing_price_sqft" type="number" {...register('listing_price_sqft')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="furnishing">Furnishing</Label>
                <select id="furnishing" className={selectClass} {...register('furnishing')}>
                  <option value={0}>Unfurnished</option>
                  <option value={1}>Semi</option>
                  <option value={2}>Full</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="occupancy">Occupancy</Label>
                <select id="occupancy" className={selectClass} {...register('occupancy')}>
                  <option value={0}>Self occupied</option>
                  <option value={1}>Rented</option>
                  <option value={2}>Vacant</option>
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="monthly_rent">Monthly rent (₹)</Label>
                <Input id="monthly_rent" type="number" {...register('monthly_rent')} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="extra">
          <AccordionTrigger>Additional details</AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="img_count">Image count</Label>
                <Input id="img_count" type="number" {...register('img_count')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="balcony_count">Balcony count</Label>
                <Input id="balcony_count" type="number" {...register('balcony_count')} />
              </div>
              <BoolRow form={form} name="vastu_compliant" label="Vastu compliant" />
              <BoolRow form={form} name="corner_unit" label="Corner unit" />
              <BoolRow form={form} name="east_facing" label="East facing" />
              <BoolRow form={form} name="servant_room" label="Servant room" />
              <BoolRow form={form} name="modular_kitchen" label="Modular kitchen" />
              <BoolRow form={form} name="smart_home" label="Smart home" />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
