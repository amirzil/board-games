import { create } from 'zustand'
import type { SIGameState } from '@splendor/shared'

interface SIGameStore {
  siGameState: SIGameState | null
  setSIGameState: (state: SIGameState | null) => void

  // UI state: which card the player has selected (waiting for target)
  pendingCardId: string | null
  setPendingCard: (id: string | null) => void

  // UI state: which grow option is pending (waiting for land click)
  pendingGrow: 'addPresence' | null
  setPendingGrow: (opt: 'addPresence' | null) => void
}

export const useSIGameStore = create<SIGameStore>((set) => ({
  siGameState: null,
  setSIGameState: (siGameState) => set({ siGameState: siGameState ?? null, pendingCardId: null, pendingGrow: null }),

  pendingCardId: null,
  setPendingCard: (pendingCardId) => set({ pendingCardId }),

  pendingGrow: null,
  setPendingGrow: (pendingGrow) => set({ pendingGrow }),
}))
