import { useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SIGameState } from '@splendor/shared'
import { SPIRIT_DEFS, getValidPresenceLands } from '@splendor/shared'
import socket from '../../socket'
import { useGameStore } from '../../store/gameStore'
import { useSIGameStore } from '../../store/siGameStore'
import { useSITutorialStore, SI_TUTORIAL_PLAYER_ID, SI_TUTORIAL_STEPS } from '../../store/siTutorialStore'
import LandTile from './LandTile'
import SpiritPanel from './SpiritPanel'
import InvaderTrack from './InvaderTrack'
import FearTrack from './FearTrack'
import SITutorialOverlay from './SITutorialOverlay'
import styles from './SIBoard.module.css'

interface Props {
  state: SIGameState
}

function buildSpiritColors(state: SIGameState): Record<string, string> {
  const map: Record<string, string> = {}
  for (const s of state.spirits) {
    map[s.id] = s.color
  }
  return map
}

export default function SIBoard({ state: livePropState }: Props) {
  const { playerId: livePlayerId } = useGameStore()
  const { pendingCardId, pendingGrow, setPendingCard, setPendingGrow } = useSIGameStore()
  const tutorialStore = useSITutorialStore()
  const isTutorial = tutorialStore.active
  const tutStep = isTutorial ? SI_TUTORIAL_STEPS[tutorialStore.stepIndex] : null

  // Use tutorial state + player ID when in tutorial mode
  const state = (isTutorial ? tutorialStore.siGameState : livePropState) ?? livePropState
  const playerId = isTutorial ? SI_TUTORIAL_PLAYER_ID : livePlayerId

  const localSpirit = state.spirits.find((s) => s.playerId === playerId)
  const localSpiritIdx = state.spirits.findIndex((s) => s.playerId === playerId)
  const isSpirit = state.phase === 'spirit'

  const spiritColors = buildSpiritColors(state)

  const getCardPlays = useCallback((spirit: typeof state.spirits[0]) => {
    const def = SPIRIT_DEFS.find((d) => d.id === spirit.id)
    if (!def) return 1
    return def.cardPlayTrack[Math.min(spirit.cardPlayRevealed, def.cardPlayTrack.length - 1)]
  }, [])

  // In tutorial, restrict actions to the current step type
  const tutActionType = tutStep?.actionType
  const canGrow     = !isTutorial || tutActionType === 'grow-action'
  const canPlayCard = !isTutorial || tutActionType === 'play-card-action'
  const canConfirm  = !isTutorial || tutActionType === 'confirm-action'

  const dispatchAction = useCallback((action: Parameters<typeof tutorialStore.applyTutorialAction>[0]) => {
    if (isTutorial) {
      tutorialStore.applyTutorialAction(action)
    } else {
      socket.emit('si_action', action)
    }
  }, [isTutorial, tutorialStore])

  // Determine valid target lands
  const validTargetLands = useCallback((): Set<string> => {
    if (!localSpirit || !isSpirit || localSpirit.ready) return new Set()

    if (pendingGrow === 'addPresence') {
      const all = getValidPresenceLands(state, localSpiritIdx)
      // In tutorial grow step, only highlight A5
      if (isTutorial && tutActionType === 'grow-action') {
        return new Set(all.filter((id) => id === 'A5'))
      }
      return new Set(all)
    }

    if (pendingCardId) {
      const card = localSpirit.hand.find((c) => c.id === pendingCardId)
      if (!card) return new Set()
      const validLands: string[] = []
      for (const land of state.lands) {
        if (card.id === 'rs-bounty' && land.terrain !== 'wetland') continue
        if (card.id === 'rs-wash-away' && !land.isCoastal) continue
        if (card.id === 'rs-flash-floods' && land.terrain !== 'wetland') continue
        // In tutorial play-card step, only A2 is valid
        if (isTutorial && tutActionType === 'play-card-action' && land.id !== 'A2') continue
        validLands.push(land.id)
      }
      return new Set(validLands)
    }

    return new Set()
  }, [localSpirit, isSpirit, pendingGrow, pendingCardId, state, localSpiritIdx, isTutorial, tutActionType])

  const handleLandClick = useCallback((landId: string) => {
    if (!localSpirit || !isSpirit || localSpirit.ready) return

    if (pendingGrow === 'addPresence' && canGrow) {
      dispatchAction({ type: 'grow', option: 'addPresence', landId })
      setPendingGrow(null)
      return
    }

    if (pendingCardId && canPlayCard) {
      dispatchAction({ type: 'playCard', cardId: pendingCardId, targetLandId: landId })
      setPendingCard(null)
      return
    }
  }, [localSpirit, isSpirit, pendingGrow, pendingCardId, canGrow, canPlayCard, dispatchAction, setPendingGrow, setPendingCard])

  const handleGrowPresence = () => {
    if (!canGrow) return
    if (pendingGrow === 'addPresence') {
      setPendingGrow(null)
    } else {
      setPendingGrow('addPresence')
      setPendingCard(null)
    }
  }

  const handleReclaimAll = () => {
    if (!canGrow) return
    dispatchAction({ type: 'grow', option: 'reclaimAll' })
    setPendingGrow(null)
    setPendingCard(null)
  }

  const handleSelectCard = (cardId: string) => {
    if (!canPlayCard) return
    // In tutorial, only allow selecting the Charged Storm card
    if (isTutorial && tutActionType === 'play-card-action' && cardId !== 'ls-charged-storm') return
    if (pendingCardId === cardId) {
      setPendingCard(null)
    } else {
      setPendingCard(cardId)
      setPendingGrow(null)
    }
  }

  const handleConfirmReady = () => {
    if (!canConfirm) return
    dispatchAction({ type: 'confirmReady' })
    setPendingCard(null)
    setPendingGrow(null)
  }

  const targets = validTargetLands()
  const hasPendingAction = !!(pendingGrow || pendingCardId)

  const phaseLabel: Record<string, string> = {
    spirit: 'Spirit Phase',
    'fast-powers': 'Fast Powers',
    invader: 'Invader Phase',
    'slow-powers': 'Slow Powers',
    'time-passes': 'Time Passes',
    ended: 'Game Over',
  }

  // Highlight classes from tutorial step
  const tutHighlight = tutStep?.highlight ?? null

  return (
    <div className={styles.board}>
      {isTutorial && <SITutorialOverlay />}

      {/* Top bar */}
      <div className={styles.topBar}>
        <span className={styles.turnLabel}>Turn {state.turn}</span>
        <span className={`${styles.phaseLabel} ${styles[state.phase.replace(/-/g, '')]}`}>
          {phaseLabel[state.phase] ?? state.phase}
        </span>
        <div className={`${styles.fearArea} ${tutHighlight === 'fear' ? styles.tutHighlight : ''}`}>
          <FearTrack state={state} />
        </div>
      </div>

      {/* Pending action hint */}
      <AnimatePresence>
        {hasPendingAction && (
          <motion.div
            className={styles.actionHint}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {pendingGrow === 'addPresence' && '👆 Click a highlighted land to place your presence'}
            {pendingCardId && '👆 Click a highlighted land to target your power card'}
            <button className={styles.cancelHint} onClick={() => { setPendingCard(null); setPendingGrow(null) }}>Cancel</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className={styles.main}>
        {/* Island board */}
        <div className={`${styles.island} ${tutHighlight === 'island' ? styles.tutHighlight : ''}`}>
          <h3 className={styles.islandTitle}>Island Board A</h3>
          <div className={styles.landGrid}>
            {state.lands.map((land) => (
              <LandTile
                key={land.id}
                land={land}
                spiritColors={spiritColors}
                isTarget={targets.has(land.id)}
                isClickable={targets.has(land.id)}
                onClick={() => handleLandClick(land.id)}
              />
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div className={`${styles.sidebar} ${tutHighlight === 'invaders' ? styles.tutHighlight : ''}`}>
          <InvaderTrack state={state} />

          <div className={styles.log}>
            <span className={styles.logTitle}>Log</span>
            <div className={styles.logEntries}>
              {[...state.log].reverse().map((entry, i) => (
                <p key={i} className={styles.logEntry}>{entry}</p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Spirit panels */}
      <div className={`${styles.spiritPanels} ${tutHighlight === 'spirit-panel' ? styles.tutHighlight : ''}`}>
        {state.spirits.map((spirit) => (
          <SpiritPanel
            key={spirit.id}
            spirit={spirit}
            isLocalPlayer={spirit.playerId === playerId}
            isSpirit={isSpirit}
            pendingCardId={spirit.playerId === playerId ? pendingCardId : null}
            pendingGrow={spirit.playerId === playerId ? pendingGrow : null}
            cardPlays={getCardPlays(spirit)}
            tutorialHighlightCardId={isTutorial && tutActionType === 'play-card-action' ? 'ls-charged-storm' : null}
            onGrowPresence={handleGrowPresence}
            onReclaimAll={handleReclaimAll}
            onSelectCard={handleSelectCard}
            onConfirmReady={handleConfirmReady}
            confirmDisabled={isTutorial && !canConfirm}
          />
        ))}
      </div>
    </div>
  )
}
