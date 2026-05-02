import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type Resolver } from 'react-hook-form'
import { toast } from 'sonner'

import { DownloadReportButton } from '@/components/common/DownloadReportButton'
import { PreAnalysisRightColumn } from '@/components/common/PreAnalysisRightColumn'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { SaveAnalysisButton } from '@/components/portfolio/SaveAnalysisButton'
import { PropertyForm } from '@/components/forms/PropertyForm'
import { ConfidenceCard } from '@/components/outputs/ConfidenceCard'
import { DistressValueCard } from '@/components/outputs/DistressValueCard'
import { MarketValueCard } from '@/components/outputs/MarketValueCard'
import { UnderwritingCard } from '@/components/outputs/UnderwritingCard'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { valuationService } from '@/services/valuationService'
import { usePropertyStore } from '@/store/propertyStore'
import { toValuationRequest } from '@/utils/apiPayload'
import { DEFAULT_FORM_PROPERTY, DEMO_PROPERTY } from '@/utils/constants'
import { propertySchema, type PropertyFormValues } from '@/utils/validators'

export default function Valuation() {
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema) as Resolver<PropertyFormValues>,
    defaultValues: DEFAULT_FORM_PROPERTY as PropertyFormValues,
  })

  const isLoading = usePropertyStore((s) => s.isLoading)
  const error = usePropertyStore((s) => s.error)
  const result = usePropertyStore((s) => s.valuationResult)
  const setLoading = usePropertyStore((s) => s.setLoading)
  const setError = usePropertyStore((s) => s.setError)
  const setValuationResult = usePropertyStore((s) => s.setValuationResult)
  const setLastPropertyRequest = usePropertyStore((s) => s.setLastPropertyRequest)

  const submitValuation = form.handleSubmit(async (values) => {
    const payload = toValuationRequest(values)
    setLoading(true)
    setError(null)
    try {
      const data = await valuationService.valuate(payload)
      setValuationResult(data)
      setLastPropertyRequest(payload)
      toast.success('Valuation complete')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Valuation failed'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  })

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Market valuation</h1>
        <p className="mt-1 text-sm text-stone-600">
          Submit property attributes to run the value engine with full collateral intelligence.
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="w-full shrink-0 lg:w-[40%]">
          <div className="sticky top-24 space-y-4">
            <PropertyForm form={form} />
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => void submitValuation()} disabled={isLoading}>
                {isLoading ? <LoadingSpinner label="Analyzing…" /> : 'Valuate property'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  form.reset(DEFAULT_FORM_PROPERTY as PropertyFormValues)
                  setError(null)
                }}
              >
                Clear form
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset(DEMO_PROPERTY as PropertyFormValues)
                  toast.message('Demo data loaded')
                }}
              >
                Load sample
              </Button>
            </div>
            <p className="text-xs text-stone-500">Typical inference under thirty seconds once models are warm.</p>
          </div>
        </div>

        <PreAnalysisRightColumn
          error={error}
          isLoading={isLoading}
          hasResult={Boolean(result)}
          errorContent={
            error ? (
              <Alert variant="destructive">
                <AlertTitle>Request failed</AlertTitle>
                <AlertDescription className="mt-2 flex flex-col gap-3">
                  <p>{error}</p>
                  <Button type="button" variant="secondary" onClick={() => void submitValuation()}>
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
                <div>
                  <p className="font-medium text-stone-900">Analyzing property…</p>
                  <p className="text-sm text-stone-500">Estimated time under 30 seconds</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-32 w-full md:col-span-2" />
              </div>
            </Card>
          }
          resultsContent={
            result ? (
              <>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <DownloadReportButton variant="engine" engine="valuation" />
                  <SaveAnalysisButton engine="valuation" />
                </div>
                <MarketValueCard mv={result.market_value} />
                <div className="grid gap-4 lg:grid-cols-2">
                  <DistressValueCard distress={result.distress_value} market={result.market_value} />
                  <ConfidenceCard c={result.confidence} />
                </div>
                <UnderwritingCard u={result.underwriting} />
              </>
            ) : null
          }
        />
      </div>
    </div>
  )
}
