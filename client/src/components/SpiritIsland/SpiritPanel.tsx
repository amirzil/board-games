import type { SpiritState } from '@splendor/shared'
import { SPIRIT_DEFS } from '@splendor/shared'
import PowerCardUI from './PowerCardUI'
import styles from './SpiritPanel.module.css'

interface Props {
  spirit: SpiritState
  isLocalPlayer: boolean
  isSpirit: boolean  // phase is 'spirit'
  pendingCardId: string | null
  pendingGrow: 'addPresence' | null
  cardPlays: number
  tutorialHighlightCardId?: string | null
  confirmDisabled?: boolean
  onGrowPresence: () => void
  onReclaimAll: () => void
  onSelectCard: (cardId: string) => void
  onConfirmReady: () => void
}

export default function SpiritPanel({
  spirit,
  isLocalPlayer,
  isSpirit,
  pendingCardId,
  pendingGrow,
  cardPlays,
  tutorialHighlightCardId,
  confirmDisabled,
  onGrowPresence,
  onReclaimAll,
  onSelectCard,
  onConfirmReady,
}: Props) {
  const def = SPIRIT_DEFS.find((d) => d.id === spirit.id)
  const energyIncome = def ? def.energyTrack[Math.min(spirit.energyTrackRevealed, def.energyTrack.length - 1)] : 0
  const canConfirm = isLocalPlayer && isSpirit && !spirit.ready

  return (
    <div className={`${styles.panel} ${spirit.ready ? styles.ready : ''}`} style={{ '--spirit-color': spirit.color } as React.CSSProperties}>
      <div className={styles.header}>
        <div className={styles.dot} style={{ background: spirit.color }} />
        <span className={styles.name}>{spirit.name}</span>
        {spirit.ready && <span className={styles.readyBadge}>Ready ✓</span>}
        {!isLocalPlayer && <span className={styles.remoteBadge}>Ally</span>}
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Energy</span>
          <span className={styles.statVal}>{spirit.energy}</span>
          <span className={styles.statIncome}>+{energyIncome}/turn</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Card plays</span>
          <span className={styles.statVal}>{cardPlays - spirit.cardPlaysUsed}</span>
          <span className={styles.statIncome}>of {cardPlays}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Presence</span>
          <span className={styles.statVal}>{spirit.presenceLands.length}</span>
        </div>
      </div>

      {isLocalPlayer && isSpirit && !spirit.ready && (
        <div className={styles.actions}>
          {!spirit.hasGrown && (
            <div className={styles.growRow}>
              <span className={styles.growLabel}>Grow:</span>
              <button
                className={`${styles.growBtn} ${pendingGrow === 'addPresence' ? styles.active : ''}`}
                onClick={onGrowPresence}
              >
                + Add Presence
              </button>
              <button className={styles.growBtn} onClick={onReclaimAll}>
                ↩ Reclaim All
              </button>
            </div>
          )}
          {spirit.hasGrown && (
            <p className={styles.grewNote}>✓ Grew this turn</p>
          )}
        </div>
      )}

      <div className={styles.handSection}>
        <span className={styles.handLabel}>Hand</span>
        {spirit.playedThisTurn.length > 0 && (
          <span className={styles.playedNote}>{spirit.playedThisTurn.length} played</span>
        )}
      </div>

      <div className={styles.hand}>
        {spirit.hand.map((card) => (
          <PowerCardUI
            key={card.id}
            card={card}
            canAfford={spirit.energy >= card.cost}
            isSelected={pendingCardId === card.id}
            isTutorialHighlighted={tutorialHighlightCardId === card.id}
            onClick={isLocalPlayer && isSpirit && !spirit.ready ? () => onSelectCard(card.id) : undefined}
          />
        ))}
        {spirit.playedThisTurn.map(({ card }) => (
          <PowerCardUI
            key={card.id}
            card={card}
            canAfford
            isPlayed
          />
        ))}
        {spirit.hand.length === 0 && spirit.playedThisTurn.length === 0 && (
          <p className={styles.emptyHand}>No cards in hand — use Reclaim to restore</p>
        )}
      </div>

      {canConfirm && (
        <button
          className={`${styles.confirmBtn} ${confirmDisabled ? styles.confirmBtnDisabled : ''}`}
          onClick={onConfirmReady}
          disabled={confirmDisabled}
        >
          Confirm Ready →
        </button>
      )}
    </div>
  )
}
