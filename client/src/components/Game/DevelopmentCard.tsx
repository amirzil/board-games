import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Card, NonGoldColor, Player } from '@splendor/shared'
import styles from './DevelopmentCard.module.css'

interface DevelopmentCardProps {
  card: Card
  canBuy: boolean
  canReserve: boolean
  isReserved?: boolean
  onBuy: () => void
  onReserve: () => void
  playerProduction?: Partial<Record<NonGoldColor, number>>
  currentPlayer?: Player
}

const GEM_SYMBOL: Record<NonGoldColor, string> = {
  white: '◇',
  blue: '◆',
  green: '◈',
  red: '♦',
  black: '◉',
}

export default function DevelopmentCard({
  card,
  canBuy,
  canReserve,
  isReserved = false,
  onBuy,
  onReserve,
  playerProduction = {},
  currentPlayer,
}: DevelopmentCardProps) {
  const [hovered, setHovered] = useState(false)

  const costEntries = Object.entries(card.cost).filter(([, v]) => (v ?? 0) > 0) as [NonGoldColor, number][]

  return (
    <motion.div
      className={`${styles.card} ${styles[`tier${card.tier}`]} ${styles[card.color]}`}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -4, scale: 1.02 }}
      layout
    >
      {/* Color stripe at top */}
      <div className={`${styles.stripe} ${styles[`stripe_${card.color}`]}`} />

      {/* Points */}
      <div className={styles.header}>
        {card.points > 0 && (
          <span className={styles.points}>{card.points}</span>
        )}
        <div className={`${styles.gemProduced} ${styles[`gem_${card.color}`]}`} />
      </div>

      {/* Cost */}
      <div className={styles.cost}>
        {costEntries.map(([color, amount]) => {
          const discount = playerProduction[color] ?? 0
          const remaining = Math.max(0, amount - discount)
          const affordable = currentPlayer
            ? (currentPlayer.gems[color] + (currentPlayer.gems.gold ?? 0)) >= remaining
            : true
          return (
            <div key={color} className={`${styles.costItem} ${styles[`cost_${color}`]} ${!affordable && remaining > 0 ? styles.cantAfford : ''}`}>
              <span className={styles.costAmount}>{amount}</span>
              {discount > 0 && remaining < amount && (
                <span className={styles.discount}>-{discount}</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Tier indicator */}
      <div className={styles.tierBadge}>{'I'.repeat(card.tier)}</div>

      {/* Action overlay */}
      <AnimatePresence>
        {hovered && (canBuy || canReserve) && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {canBuy && (
              <button
                className={`${styles.actionBtn} ${styles.buyBtn}`}
                onClick={(e) => { e.stopPropagation(); onBuy() }}
              >
                Buy
              </button>
            )}
            {canReserve && !isReserved && (
              <button
                className={`${styles.actionBtn} ${styles.reserveBtn}`}
                onClick={(e) => { e.stopPropagation(); onReserve() }}
              >
                Reserve
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
