import { create } from 'zustand'
import type { HGameState } from '@splendor/shared'

interface HGameStore {
  hGameState: HGameState | null
  setHGameState: (state: HGameState | null) => void

  // UI state: which held Animal card is selected for cube placement
  selectedCardId: string | null
  setSelectedCardId: (id: string | null) => void

  // UI state: which color from the current pendingTokens hand is armed for placement
  selectedColor: string | null
  setSelectedColor: (color: string | null) => void
}

export const useHGameStore = create<HGameStore>((set) => ({
  hGameState: null,
  setHGameState: (hGameState) => set({ hGameState: hGameState ?? null, selectedCardId: null, selectedColor: null }),

  selectedCardId: null,
  setSelectedCardId: (selectedCardId) => set({ selectedCardId }),

  selectedColor: null,
  setSelectedColor: (selectedColor) => set({ selectedColor }),
}))
