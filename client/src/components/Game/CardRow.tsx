import { motion, AnimatePresence } from 'framer-motion'
import type { Card, NonGoldColor, Player, TierState } from '@splendor/shared'
import DevelopmentCard from './DevelopmentCard'
import CardBack from './CardBack'
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
  const canClickDeck = isMyTurn && canReserve && tierState.deck.length > 0

  return (
    <div className={styles.row}>
      {/* Deck: a stack of face-down cards */}
      <motion.div
        className={`${styles.deck} ${tierState.deck.length === 0 ? styles.empty : ''}`}
        whileHover={canClickDeck ? { scale: 1.04, y: -3 } : {}}
        onClick={canClickDeck ? () => onReserveFromDeck(tier) : undefined}
      >
        {tierState.deck.length > 2 && <CardBack tier={tier} className={styles.deckLayer2} />}
        {tierState.deck.length > 1 && <CardBack tier={tier} className={styles.deckLayer1} />}
        <CardBack tier={tier} className={styles.deckLayerTop} />
        <span className={styles.deckCount}>{tierState.deck.length}</span>
        {canClickDeck && <span className={styles.deckHint}>Reserve</span>}
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
