import { useCallback } from 'react'
import type { NonGoldColor, Player } from '@splendor/shared'
import { useGameStore } from '../../store/gameStore'
import { useTutorialStore, TUTORIAL_PLAYER_ID, TUTORIAL_STEPS } from '../../store/tutorialStore'
import socket from '../../socket'
import CardRow from './CardRow'
import NobleCard from './NobleCard'
import GemBank from './GemBank'
import PlayerPanel from './PlayerPanel'
import TutorialOverlay from '../Tutorial/TutorialOverlay'
import styles from './GameBoard.module.css'

function cardProduction(player: Pick<Player, 'cards'>): Partial<Record<NonGoldColor, number>> {
  const prod: Partial<Record<NonGoldColor, number>> = {}
  for (const card of player.cards) {
    prod[card.color] = (prod[card.color] ?? 0) + 1
  }
  return prod
}

export default function GameBoard() {
  const gameStore = useGameStore()
  const tutorialStore = useTutorialStore()
  const isTutorial = tutorialStore.active

  // Use tutorial state when active, otherwise use socket-driven state
  const gameState = isTutorial ? tutorialStore.gameState : gameStore.gameState
  const playerId = isTutorial ? TUTORIAL_PLAYER_ID : gameStore.playerId
  const pendingGems = isTutorial ? tutorialStore.pendingGems : gameStore.pendingGems

  const tutStep = isTutorial ? TUTORIAL_STEPS[tutorialStore.stepIndex] : null

  const localPlayer = gameState?.players.find((p) => p.id === playerId)
  const currentPlayer = gameState?.players[gameState.currentPlayerIndex]

  // In tutorial mode, only allow interaction during action steps
  const baseIsMyTurn = currentPlayer?.id === playerId
  const isMyTurn = isTutorial
    ? baseIsMyTurn && tutStep?.actionType !== 'info'
    : baseIsMyTurn

  const myProduction = localPlayer ? cardProduction(localPlayer) : {}
  const board = gameState?.board

  const canBuyCard = useCallback(
    (cardId: string): boolean => {
      if (!isMyTurn || !localPlayer || !board) return false

      // In tutorial, buying only allowed during buy-action step
      if (isTutorial && tutStep?.actionType !== 'buy-action') return false

      const prod = cardProduction(localPlayer)
      const allCards = [
        ...board.tier1.visible,
        ...board.tier2.visible,
        ...board.tier3.visible,
        ...localPlayer.reserved,
      ].filter(Boolean) as { id: string; cost: Partial<Record<NonGoldColor, number>> }[]

      const card = allCards.find((c) => c.id === cardId)
      if (!card) return false

      let goldNeeded = 0
      for (const [color, cost] of Object.entries(card.cost) as [NonGoldColor, number][]) {
        const discount = prod[color] ?? 0
        const remaining = Math.max(0, cost - discount)
        const paid = Math.min(remaining, localPlayer.gems[color])
        goldNeeded += remaining - paid
      }
      return goldNeeded <= localPlayer.gems.gold
    },
    [isTutorial, tutStep, isMyTurn, localPlayer, board]
  )

  if (!gameState || !board) return null

  const { players, currentPlayerIndex } = gameState

  // In tutorial, only allow reserving during reserve-action step
  const canReserve = isTutorial
    ? isMyTurn && tutStep?.actionType === 'reserve-action' && (localPlayer?.reserved.length ?? 3) < 3
    : isMyTurn && (localPlayer?.reserved.length ?? 3) < 3

  // Highlight area from current tutorial step
  const highlightArea = tutStep?.highlight ?? null

  const handleBuyCard = (cardId: string, fromReserved = false) => {
    if (!isMyTurn) return
    if (isTutorial) {
      tutorialStore.clearPendingGems()
      tutorialStore.applyTutorialAction({ type: 'buyCard', cardId, fromReserved })
    } else {
      gameStore.clearPendingGems()
      socket.emit('game_action', { type: 'buyCard', cardId, fromReserved })
    }
  }

  const handleReserveCard = (cardId: string) => {
    if (!isMyTurn) return
    if (isTutorial) {
      tutorialStore.applyTutorialAction({ type: 'reserveCard', cardId })
    } else {
      socket.emit('game_action', { type: 'reserveCard', cardId })
    }
  }

  const handleReserveFromDeck = (tier: 1 | 2 | 3) => {
    if (!isMyTurn) return
    if (isTutorial) {
      tutorialStore.applyTutorialAction({ type: 'reserveCard', cardId: '', tier })
    } else {
      socket.emit('game_action', { type: 'reserveCard', cardId: '', tier })
    }
  }

  const handleTakeGem = (color: NonGoldColor) => {
    if (isTutorial) {
      tutorialStore.addPendingGem(color)
    } else {
      gameStore.addPendingGem(color)
    }
  }

  const handleConfirmTake = () => {
    if (!isMyTurn) return
    if (isTutorial) {
      tutorialStore.applyTutorialAction({ type: 'takeGems', gems: pendingGems.gems })
    } else {
      socket.emit('game_action', { type: 'takeGems', gems: pendingGems.gems })
    }
  }

  const handleCancelTake = () => {
    if (isTutorial) {
      tutorialStore.clearPendingGems()
    } else {
      gameStore.clearPendingGems()
    }
  }

  // Noble attainability for local player
  const attainableNobles = new Set(
    board.nobles
      .filter((n) =>
        localPlayer
          ? Object.entries(n.requirement).every(
              ([c, req]) => (myProduction[c as NonGoldColor] ?? 0) >= req!
            )
          : false
      )
      .map((n) => n.id)
  )

  return (
    <div className={styles.board}>
      {isTutorial && <TutorialOverlay />}

      {/* Turn indicator */}
      <div className={styles.turnBar}>
        <span className={styles.turnText}>
          {isMyTurn ? 'Your turn' : `${currentPlayer?.name ?? ''}'s turn`}
        </span>
        {gameState.lastRound && (
          <span className={styles.lastRound}>Final Round!</span>
        )}
        <span className={styles.roundBadge}>Round {gameState.round}</span>
      </div>

      {/* Main area */}
      <div className={styles.mainArea}>
        <div className={styles.boardLeft}>
          {/* Nobles row */}
          <div className={`${styles.noblesRow} ${highlightArea === 'nobles' ? styles.tutHighlight : ''}`}>
            {board.nobles.map((noble) => (
              <NobleCard
                key={noble.id}
                noble={noble}
                isAttainable={attainableNobles.has(noble.id)}
              />
            ))}
          </div>

          {/* Card rows tier 3 → 1 */}
          {([3, 2, 1] as const).map((tier) => (
            <div
              key={tier}
              className={tier === 1 && highlightArea === 'tier1' ? styles.tutHighlight : undefined}
            >
              <CardRow
                tier={tier}
                tierState={board[`tier${tier}`]}
                isMyTurn={isMyTurn ?? false}
                canBuyCard={canBuyCard}
                canReserve={canReserve ?? false}
                onBuyCard={(id) => handleBuyCard(id, false)}
                onReserveCard={handleReserveCard}
                onReserveFromDeck={handleReserveFromDeck}
                playerProduction={myProduction}
                currentPlayer={localPlayer}
              />
            </div>
          ))}
        </div>

        {/* Gem bank */}
        <div className={highlightArea === 'gems' ? styles.tutHighlight : undefined}>
          <GemBank
            gems={board.gems}
            isMyTurn={isMyTurn ?? false}
            pendingGems={pendingGems.gems}
            pendingCount={pendingGems.count}
            onTakeGem={handleTakeGem}
            onConfirmTake={handleConfirmTake}
            onCancelTake={handleCancelTake}
          />
        </div>
      </div>

      {/* Player panels */}
      <div className={styles.playerPanels}>
        {players.map((player) => (
          <PlayerPanel
            key={player.id}
            player={player}
            isCurrentTurn={player.id === currentPlayer?.id}
            isLocalPlayer={player.id === playerId}
            onBuyReserved={(cardId) => handleBuyCard(cardId, true)}
            canBuyCard={canBuyCard}
            playerProduction={player.id === playerId ? myProduction : cardProduction(player)}
          />
        ))}
      </div>
    </div>
  )
}
