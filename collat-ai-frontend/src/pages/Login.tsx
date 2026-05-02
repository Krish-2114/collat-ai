import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { DownloadReportButton } from '@/components/common/DownloadReportButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/authStore'

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const signup = useAuthStore((s) => s.signup)
  const user = useAuthStore((s) => s.user)

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')

  if (user) {
    return (
      <div className="mx-auto max-w-md px-4 py-14 lg:px-8">
        <Card className="border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle>Signed in</CardTitle>
            <CardDescription>
              You are logged in as <span className="font-medium text-stone-800">{user.displayName}</span> (
              {user.email}).
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/portfolio">Open portfolio</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/">Home</Link>
              </Button>
            </div>
            <DownloadReportButton variant="overview" slug="login" className="w-fit" />
          </CardContent>
        </Card>
      </div>
    )
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'login') {
      const r = login(email, password)
      if (!r.ok) {
        toast.error(r.error)
        return
      }
      toast.success('Welcome back')
      navigate('/portfolio', { replace: true })
      return
    }
    const r = signup(email, password, displayName)
    if (!r.ok) {
      toast.error(r.error)
      return
    }
    toast.success('Account created')
    navigate('/portfolio', { replace: true })
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 lg:px-8 lg:py-16">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card className="border-stone-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">{mode === 'login' ? 'Sign in' : 'Create account'}</CardTitle>
            <CardDescription>
              {mode === 'login'
                ? 'Use your workspace to save analyses to a personal portfolio (local demo — data stays in this browser).'
                : 'Register to pin valuation, liquidity, and fraud runs to your portfolio.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex rounded-lg border border-stone-200 bg-stone-50 p-1">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
                  mode === 'login' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
                  mode === 'signup' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Register
              </button>
            </div>
            <form className="space-y-4" onSubmit={submit}>
              {mode === 'signup' ? (
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display name</Label>
                  <Input
                    id="displayName"
                    autoComplete="name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Priya Sharma"
                    required={mode === 'signup'}
                  />
                </div>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={mode === 'signup' ? 6 : undefined}
                  required
                />
                {mode === 'signup' ? <p className="text-xs text-stone-500">At least 6 characters (demo only).</p> : null}
              </div>
              <Button type="submit" className="w-full">
                {mode === 'login' ? 'Sign in' : 'Create account'}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-stone-500">
              <Link to="/" className="font-medium text-primary-700 underline-offset-4 hover:underline">
                Back to home
              </Link>
            </p>
            <div className="mt-4 flex justify-center">
              <DownloadReportButton variant="overview" slug="login" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
