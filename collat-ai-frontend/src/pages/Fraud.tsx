import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type Resolver } from 'react-hook-form'
import { toast } from 'sonner'

import { DownloadReportButton } from '@/components/common/DownloadReportButton'
import { PreAnalysisRightColumn } from '@/components/common/PreAnalysisRightColumn'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { SaveAnalysisButton } from '@/components/portfolio/SaveAnalysisButton'
import { PropertyForm } from '@/components/forms/PropertyForm'
import { FraudBreakdownTable } from '@/components/outputs/FraudBreakdownTable'
import { FraudRecommendations } from '@/components/outputs/FraudRecommendations'
import { FraudRiskCard } from '@/components/outputs/FraudRiskCard'
import { FraudRuleList } from '@/components/outputs/FraudRuleList'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { valuationService } from '@/services/valuationService'
import { usePropertyStore } from '@/store/propertyStore'
import { toValuationRequest } from '@/utils/apiPayload'
import { DEFAULT_FORM_PROPERTY, DEMO_PROPERTY } from '@/utils/constants'
import { propertySchema, type PropertyFormValues } from '@/utils/validators'

export default function Fraud() {
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema) as Resolver<PropertyFormValues>,
    defaultValues: DEFAULT_FORM_PROPERTY as PropertyFormValues,
  })

  const cached = usePropertyStore((s) => s.valuationResult)
  const isLoading = usePropertyStore((s) => s.isLoading)
  const error = usePropertyStore((s) => s.error)
  const setLoading = usePropertyStore((s) => s.setLoading)
  const setError = usePropertyStore((s) => s.setError)
  const setValuationResult = usePropertyStore((s) => s.setValuationResult)
  const setLastPropertyRequest = usePropertyStore((s) => s.setLastPropertyRequest)

  const f = cached?.fraud_risk

  const submit = form.handleSubmit(async (values) => {
    const payload = toValuationRequest(values)
    setLoading(true)
    setError(null)
    try {
      const data = await valuationService.valuate(payload)
      setValuationResult(data)
      setLastPropertyRequest(payload)
      toast.success('Fraud assessment updated')
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
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Fraud risk assessment</h1>
        <p className="mt-1 text-sm text-stone-600">
          Ten deterministic rules plus isolation-forest anomaly scoring on engineered features.
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="w-full shrink-0 lg:w-[40%]">
          <div className="sticky top-24 space-y-4">
            <PropertyForm form={form} />
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => void submit()} disabled={isLoading}>
                {isLoading ? <LoadingSpinner label="Scanning…" /> : 'Run fraud scan'}
              </Button>
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
          hasResult={Boolean(f)}
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
              <LoadingSpinner label="Running fraud models…" />
              <div className="mt-4 grid gap-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            </Card>
          }
          resultsContent={
            f ? (
              <>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <DownloadReportButton variant="engine" engine="fraud" />
                  <SaveAnalysisButton engine="fraud" />
                </div>
                <FraudRiskCard f={f} />
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Statistical anomaly</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-stone-700">
                    <p>
                      Isolation Forest highlights when engineered features deviate from the training
                      manifold. {f.is_statistical_anomaly ? 'This payload is flagged as anomalous.' : 'No anomaly flag on this run.'}
                    </p>
                    <p className="text-xs text-stone-500">
                      Combine with rule commentary — anomalies are not proof of fraud, but warrant
                      targeted verification.
                    </p>
                  </CardContent>
                </Card>
                <FraudRuleList f={f} />
                <FraudBreakdownTable f={f} />
                <FraudRecommendations f={f} />
              </>
            ) : null
          }
        />
      </div>
    </div>
  )
}
