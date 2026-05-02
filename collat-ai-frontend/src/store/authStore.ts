import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Demo auth only: credentials live in localStorage (plaintext).
 * Replace with a real backend (OAuth / JWT) before any production use.
 */
const REGISTRY_KEY = 'collat-user-registry'

export type AuthUser = {
  id: string
  email: string
  displayName: string
}

type RegistryRow = {
  id: string
  email: string
  displayName: string
  /** Demo-only — not secure */
  password: string
}

type Registry = Record<string, RegistryRow>

function readRegistry(): Registry {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    return parsed && typeof parsed === 'object' ? (parsed as Registry) : {}
  } catch {
    return {}
  }
}

function writeRegistry(r: Registry) {
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(r))
}

type AuthResult = { ok: true } | { ok: false; error: string }

interface AuthState {
  user: AuthUser | null
  login: (email: string, password: string) => AuthResult
  signup: (email: string, password: string, displayName: string) => AuthResult
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,

      login(email, password) {
        const key = email.trim().toLowerCase()
        if (!key || !password) return { ok: false, error: 'Enter email and password' }
        const registry = readRegistry()
        const row = registry[key]
        if (!row || row.password !== password) {
          return { ok: false, error: 'Invalid email or password' }
        }
        set({
          user: { id: row.id, email: row.email, displayName: row.displayName },
        })
        return { ok: true }
      },

      signup(email, password, displayName) {
        const key = email.trim().toLowerCase()
        const name = displayName.trim()
        if (!key || !name) return { ok: false, error: 'Enter email and display name' }
        if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters' }
        const registry = readRegistry()
        if (registry[key]) return { ok: false, error: 'That email is already registered' }
        const id = crypto.randomUUID()
        const row: RegistryRow = {
          id,
          email: email.trim(),
          displayName: name,
          password,
        }
        registry[key] = row
        writeRegistry(registry)
        set({ user: { id, email: row.email, displayName: name } })
        return { ok: true }
      },

      logout() {
        set({ user: null })
      },
    }),
    { name: 'collat-auth-session', partialize: (s) => ({ user: s.user }) },
  ),
)
