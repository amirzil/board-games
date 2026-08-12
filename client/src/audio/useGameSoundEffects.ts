import { useEffect, useRef } from 'react'
import type { GameState } from '@splendor/shared'
import { playSound } from './soundEngine'

// Reacts to whatever changed between the previous and current GameState so
// both players hear the table react — not just whoever clicked.
export function useGameSoundEffects(gameState: GameState | null | undefined, localPlayerId: string | null | undefined) {
  const prevRef = useRef<GameState | null>(null)

  useEffect(() => {
    const prev = prevRef.current
    const curr = gameState ?? null
    prevRef.current = curr

    if (!prev || !curr || prev === curr) return

    if (prev.phase !== 'ended' && curr.phase === 'ended') {
      playSound('win')
      return
    }
    if (curr.phase !== 'playing') return

    let reserved = false
    let bought = false
    let nobleClaimed = false

    for (const currPlayer of curr.players) {
      const prevPlayer = prev.players.find((p) => p.id === currPlayer.id)
      if (!prevPlayer) continue
      if (currPlayer.reserved.length > prevPlayer.reserved.length) reserved = true
      if (currPlayer.cards.length > prevPlayer.cards.length) bought = true
      if (currPlayer.nobles.length > prevPlayer.nobles.length) nobleClaimed = true
    }

    const prevVisibleIds = new Set(
      [...prev.board.tier1.visible, ...prev.board.tier2.visible, ...prev.board.tier3.visible]
        .filter((c): c is NonNullable<typeof c> => c !== null)
        .map((c) => c.id)
    )
    const currVisibleIds = [...curr.board.tier1.visible, ...curr.board.tier2.visible, ...curr.board.tier3.visible]
      .filter((c): c is NonNullable<typeof c> => c !== null)
      .map((c) => c.id)
    const revealed = currVisibleIds.some((id) => !prevVisibleIds.has(id))

    const sum = (gems: Record<string, number>) => Object.values(gems).reduce((a, b) => a + b, 0)
    const gemsTaken = !reserved && !bought && sum(curr.board.gems) < sum(prev.board.gems)

    if (reserved) playSound('cardReserve')
    if (bought) playSound('cardBuy')
    if (gemsTaken) playSound('chipConfirm')
    if (revealed && (reserved || bought)) {
      window.setTimeout(() => playSound('cardReveal'), 160)
    }
    if (nobleClaimed) {
      window.setTimeout(() => playSound('nobleClaim'), bought ? 320 : 0)
    }

    const prevCurrentPlayer = prev.players[prev.currentPlayerIndex]
    const currCurrentPlayer = curr.players[curr.currentPlayerIndex]
    if (localPlayerId && currCurrentPlayer?.id === localPlayerId && prevCurrentPlayer?.id !== localPlayerId) {
      window.setTimeout(() => playSound('turnStart'), 500)
    }
  }, [gameState, localPlayerId])
}
