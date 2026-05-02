import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PortfolioEngine = 'valuation' | 'liquidity' | 'fraud'

export type PortfolioItem = {
  id: string
  userId: string
  engine: PortfolioEngine
  title: string
  subtitle: string
  createdAt: string
}

interface PortfolioState {
  items: PortfolioItem[]
  /** Append a saved analysis for the signed-in user */
  addSnapshot: (userId: string, engine: PortfolioEngine, title: string, subtitle: string) => void
  removeSnapshot: (userId: string, id: string) => void
  listForUser: (userId: string) => PortfolioItem[]
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      items: [],

      addSnapshot(userId, engine, title, subtitle) {
        const item: PortfolioItem = {
          id: crypto.randomUUID(),
          userId,
          engine,
          title,
          subtitle,
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ items: [item, ...s.items] }))
      },

      removeSnapshot(userId, id) {
        set((s) => ({
          items: s.items.filter((i) => !(i.id === id && i.userId === userId)),
        }))
      },

      listForUser(userId) {
        return get()
          .items.filter((i) => i.userId === userId)
          .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      },
    }),
    { name: 'collat-portfolio' },
  ),
)
