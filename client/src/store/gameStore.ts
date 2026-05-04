import { create } from 'zustand'
import type { GameState, RoomInfo, NonGoldColor } from '@splendor/shared'

interface PendingGems {
  gems: Partial<Record<NonGoldColor, number>>
  count: number
}

interface GameStore {
  playerId: string | null
  room: RoomInfo | null
  gameState: GameState | null
  error: string | null
  pendingGems: PendingGems

  setPlayerId: (id: string) => void
  setRoom: (room: RoomInfo) => void
  clearRoom: () => void
  setGameState: (state: GameState) => void
  setError: (msg: string | null) => void
  addPendingGem: (color: NonGoldColor) => void
  removePendingGem: (color: NonGoldColor) => void
  clearPendingGems: () => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  playerId: null,
  room: null,
  gameState: null,
  error: null,
  pendingGems: { gems: {}, count: 0 },

  setPlayerId: (id) => set({ playerId: id }),
  setRoom: (room) => set({ room }),
  clearRoom: () => set({ room: null }),
  setGameState: (gameState) => set({ gameState, pendingGems: { gems: {}, count: 0 } }),
  setError: (error) => set({ error }),

  addPendingGem: (color) => {
    const { pendingGems } = get()
    set({
      pendingGems: {
        gems: { ...pendingGems.gems, [color]: (pendingGems.gems[color] ?? 0) + 1 },
        count: pendingGems.count + 1,
      },
    })
  },

  removePendingGem: (color) => {
    const { pendingGems } = get()
    const current = pendingGems.gems[color] ?? 0
    if (current <= 0) return
    const newGems = { ...pendingGems.gems }
    if (current === 1) delete newGems[color]
    else newGems[color] = current - 1
    set({ pendingGems: { gems: newGems, count: pendingGems.count - 1 } })
  },

  clearPendingGems: () => set({ pendingGems: { gems: {}, count: 0 } }),
}))
