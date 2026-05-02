import { lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'

import { AppShell } from '@/components/layout/AppShell'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import './styles/globals.css'

const Landing = lazy(() => import('@/pages/Landing'))
const Models = lazy(() => import('@/pages/Models'))
const Valuation = lazy(() => import('@/pages/Valuation'))
const Liquidity = lazy(() => import('@/pages/Liquidity'))
const Fraud = lazy(() => import('@/pages/Fraud'))
const Portfolio = lazy(() => import('@/pages/Portfolio'))
const Company = lazy(() => import('@/pages/Company'))
const Privacy = lazy(() => import('@/pages/Privacy'))
const Terms = lazy(() => import('@/pages/Terms'))
const Login = lazy(() => import('@/pages/Login'))

const router = createHashRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: (
          <Suspense
            fallback={
              <div className="flex min-h-[50vh] items-center justify-center bg-surface">
                <LoadingSpinner label="Loading…" />
              </div>
            }
          >
            <Landing />
          </Suspense>
        ),
      },
      {
        path: 'models',
        element: (
          <Suspense
            fallback={
              <div className="flex min-h-[50vh] items-center justify-center bg-surface">
                <LoadingSpinner label="Loading…" />
              </div>
            }
          >
            <Models />
          </Suspense>
        ),
      },
      {
        path: 'valuate',
        element: (
          <Suspense
            fallback={
              <div className="flex min-h-[50vh] items-center justify-center bg-surface">
                <LoadingSpinner />
              </div>
            }
          >
            <Valuation />
          </Suspense>
        ),
      },
      {
        path: 'liquidity',
        element: (
          <Suspense
            fallback={
              <div className="flex min-h-[50vh] items-center justify-center bg-surface">
                <LoadingSpinner />
              </div>
            }
          >
            <Liquidity />
          </Suspense>
        ),
      },
      {
        path: 'fraud',
        element: (
          <Suspense
            fallback={
              <div className="flex min-h-[50vh] items-center justify-center bg-surface">
                <LoadingSpinner />
              </div>
            }
          >
            <Fraud />
          </Suspense>
        ),
      },
      {
        path: 'portfolio',
        element: (
          <Suspense
            fallback={
              <div className="flex min-h-[50vh] items-center justify-center bg-surface">
                <LoadingSpinner />
              </div>
            }
          >
            <Portfolio />
          </Suspense>
        ),
      },
      {
        path: 'company',
        element: (
          <Suspense
            fallback={
              <div className="flex min-h-[50vh] items-center justify-center bg-surface">
                <LoadingSpinner />
              </div>
            }
          >
            <Company />
          </Suspense>
        ),
      },
      {
        path: 'privacy',
        element: (
          <Suspense
            fallback={
              <div className="flex min-h-[50vh] items-center justify-center bg-surface">
                <LoadingSpinner />
              </div>
            }
          >
            <Privacy />
          </Suspense>
        ),
      },
      {
        path: 'terms',
        element: (
          <Suspense
            fallback={
              <div className="flex min-h-[50vh] items-center justify-center bg-surface">
                <LoadingSpinner />
              </div>
            }
          >
            <Terms />
          </Suspense>
        ),
      },
      {
        path: 'login',
        element: (
          <Suspense
            fallback={
              <div className="flex min-h-[50vh] items-center justify-center bg-surface">
                <LoadingSpinner />
              </div>
            }
          >
            <Login />
          </Suspense>
        ),
      },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <>
    <RouterProvider router={router} />
    <Toaster
      richColors
      position="top-center"
      toastOptions={{
        classNames: {
          success: 'border-emerald-200 bg-emerald-50 text-emerald-950',
          error: 'border-red-200 bg-red-50 text-red-950',
          warning: 'border-primary-200 bg-primary-50 text-stone-900',
          info: 'border-primary-200 bg-primary-50/80 text-stone-900',
        },
      }}
    />
  </>,
)
