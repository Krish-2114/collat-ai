import { Component, type ErrorInfo, type ReactNode } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  message?: string
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  override componentDidCatch(error: Error, _info: ErrorInfo) {
    console.error('ErrorBoundary', error, _info)
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[40vh] items-center justify-center p-8">
          <Alert variant="destructive" className="max-w-lg">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription className="mt-2 space-y-3">
              <p>{this.state.message ?? 'Unexpected UI error.'}</p>
              <Button
                type="button"
                variant="secondary"
                onClick={() => this.setState({ hasError: false, message: undefined })}
              >
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )
    }
    return this.props.children
  }
}
