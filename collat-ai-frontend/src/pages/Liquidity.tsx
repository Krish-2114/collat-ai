import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type Resolver } from 'react-hook-form'
import { useMemo } from 'react'
import { toast } from 'sonner'

import { DownloadReportButton } from '@/components/common/DownloadReportButton'
import { PreAnalysisRightColumn } from '@/components/common/PreAnalysisRightColumn'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { SaveAnalysisButton } from '@/components/portfolio/SaveAnalysisButton'
import { PropertyForm } from '@/components/forms/PropertyForm'
import { LiquidityInsights } from '@/components/outputs/LiquidityInsights'
import { RpiGauge } from '@/components/outputs/RpiGauge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { CityName } from '@/types/api.types'
import { valuationService } from '@/services/valuationService'
import { usePropertyStore } from '@/store/propertyStore'
import { toValuationRequest } from '@/utils/apiPayload'
import { CITY_INFO, DEFAULT_FORM_PROPERTY, DEMO_PROPERTY } from '@/utils/constants'
import { propertySchema, type PropertyFormValues } from '@/utils/validators'

export default function Liquidity() {
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema) as Resolver<PropertyFormValues>,
    defaultValues: DEFAULT_FORM_PROPERTY as PropertyFormValues,
  })

  const last = usePropertyStore((s) => s.lastPropertyRequest)
  const cached = usePropertyStore((s) => s.valuationResult)
  const isLoading = usePropertyStore((s) => s.isLoading)
  const error = usePropertyStore((s) => s.error)
  const setLoading = usePropertyStore((s) => s.setLoading)
  const setError = usePropertyStore((s) => s.setError)
  const setValuationResult = usePropertyStore((s) => s.setValuationResult)
  const setLastPropertyRequest = usePropertyStore((s) => s.setLastPropertyRequest)

  const liq = cached?.liquidity

  const marketNote = useMemo(() => {
    if (!liq) return null
    const city = (last?.city ?? 'Mumbai') as CityName
    const info = CITY_INFO[city]
    return `City tier ${info.tier} · indicative base PSF ₹${info.base_psf.toLocaleString('en-IN')} — your RPI ${liq.rpi_score.toFixed(0)} vs typical premium micro-markets in this band.`
  }, [liq, last])

  const submit = form.handleSubmit(async (values) => {
    const payload = toValuationRequest(values)
    setLoading(true)
    setError(null)
    try {
      const data = await valuationService.valuate(payload)
      setValuationResult(data)
      setLastPropertyRequest(payload)
      toast.success('Liquidity intelligence updated')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Request failed'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  })

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Liquidity intelligence</h1>
        <p className="mt-1 text-sm text-stone-600">
          Resale potential index, time-to-liquidate, and exit certainty using the same inference stack.
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="w-full shrink-0 lg:w-[40%]">
          <div className="sticky top-24 space-y-4">
            <PropertyForm form={form} />
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => void submit()} disabled={isLoading}>
                {isLoading ? <LoadingSpinner label="Running…" /> : 'Analyze liquidity'}
              </Button>
              {last ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    form.reset({
                      ...(DEFAULT_FORM_PROPERTY as PropertyFormValues),
                      ...last,
                      zone: last.zone ?? '',
                      locality: last.locality ?? '',
                    })
                    toast.message('Imported last valuation inputs')
                  }}
                >
                  Import last session
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset(DEMO_PROPERTY as PropertyFormValues)}
              >
                Load sample
              </Button>
            </div>
          </div>
        </div>

        <PreAnalysisRightColumn
          error={error}
          isLoading={isLoading}
          hasResult={Boolean(liq)}
          errorContent={
            error ? (
              <Alert variant="destructive">
                <AlertTitle>Request failed</AlertTitle>
                <AlertDescription className="mt-2 flex flex-col gap-3">
                  <p>{error}</p>
                  <Button type="button" variant="secondary" onClick={() => void submit()}>
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            ) : null
          }
          loadingContent={
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <LoadingSpinner />
                <p className="font-medium text-stone-900">Computing liquidity…</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-56 w-full" />
                <Skeleton className="h-56 w-full" />
              </div>
            </Card>
          }
          resultsContent={
            liq && cached ? (
              <>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <DownloadReportButton variant="engine" engine="liquidity" />
                  <SaveAnalysisButton engine="liquidity" />
                </div>
                <RpiGauge liq={liq} />
                <LiquidityInsights liq={liq} />
                {marketNote ? (
                  <Card className="border-primary-200/80 bg-primary-50/50 p-4 text-sm text-stone-800">
                    <p className="font-medium text-primary-900">Market context</p>
                    <p className="mt-1 text-stone-700">{marketNote}</p>
                  </Card>
                ) : null}
              </>
            ) : null
          }
        />
      </div>
    </div>
  )
}
