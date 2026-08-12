import { motion, AnimatePresence } from 'framer-motion'
import type { Card, NonGoldColor, Player, TierState } from '@splendor/shared'
import DevelopmentCard from './DevelopmentCard'
import styles from './CardRow.module.css'

interface CardRowProps {
  tier: 1 | 2 | 3
  tierState: TierState
  isMyTurn: boolean
  canBuyCard: (cardId: string) => boolean
  canReserve: boolean
  onBuyCard: (cardId: string) => void
  onReserveCard: (cardId: string) => void
  onReserveFromDeck: (tier: 1 | 2 | 3) => void
  playerProduction: Partial<Record<NonGoldColor, number>>
  currentPlayer?: Player
}

const TIER_LABELS: Record<1 | 2 | 3, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
}

const TIER_COLORS: Record<1 | 2 | 3, string> = {
  1: 'var(--tier1-color)',
  2: 'var(--tier2-color)',
  3: 'var(--tier3-color)',
}

export default function CardRow({
  tier,
  tierState,
  isMyTurn,
  canBuyCard,
  canReserve,
  onBuyCard,
  onReserveCard,
  onReserveFromDeck,
  playerProduction,
  currentPlayer,
}: CardRowProps) {
  return (
    <div className={styles.row}>
      {/* Deck */}
      <motion.div
        className={`${styles.deck} ${tierState.deck.length === 0 ? styles.empty : ''}`}
        style={{ borderColor: TIER_COLORS[tier] }}
        whileHover={isMyTurn && canReserve && tierState.deck.length > 0 ? { scale: 1.04 } : {}}
        onClick={isMyTurn && canReserve && tierState.deck.length > 0 ? () => onReserveFromDeck(tier) : undefined}
      >
        <span className={styles.deckTier} style={{ color: TIER_COLORS[tier] }}>{TIER_LABELS[tier]}</span>
        <span className={styles.deckCount}>{tierState.deck.length}</span>
        {tierState.deck.length > 0 && isMyTurn && canReserve && (
          <span className={styles.deckHint}>Reserve</span>
        )}
      </motion.div>

      {/* Visible cards */}
      <div className={styles.cards}>
        <AnimatePresence>
          {tierState.visible.map((card, idx) =>
            card ? (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, rotateY: -100, y: -16 }}
                animate={{ opacity: 1, rotateY: 0, y: 0 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.4, delay: idx * 0.05, ease: 'easeOut' }}
                style={{ transformPerspective: 700 }}
              >
                <DevelopmentCard
                  card={card}
                  canBuy={isMyTurn && canBuyCard(card.id)}
                  canReserve={isMyTurn && canReserve}
                  onBuy={() => onBuyCard(card.id)}
                  onReserve={() => onReserveCard(card.id)}
                  playerProduction={playerProduction}
                  currentPlayer={currentPlayer}
                />
              </motion.div>
            ) : (
              <div key={`empty-${idx}`} className={styles.emptySlot} />
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
