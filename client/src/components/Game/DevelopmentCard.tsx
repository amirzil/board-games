import { useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import type { Card, NonGoldColor, Player } from '@splendor/shared'
import GemFace from './GemFace'
import GemToken from './GemToken'
import CardArt from './CardArt'
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

  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)
  const rotateX = useTransform(mouseY, [0, 1], [7, -7])
  const rotateY = useTransform(mouseX, [0, 1], [-7, 7])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width)
    mouseY.set((e.clientY - rect.top) / rect.height)
  }
  const handleMouseLeave = () => {
    mouseX.set(0.5)
    mouseY.set(0.5)
    setHovered(false)
  }

  const costEntries = Object.entries(card.cost).filter(([, v]) => (v ?? 0) > 0) as [NonGoldColor, number][]

  return (
    <motion.div
      className={`${styles.card} ${styles[`tier${card.tier}`]}`}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      whileHover={{ y: -6, scale: 1.03 }}
      layout
    >
      <div className={styles.grain} />

      {/* Illustration */}
      <div className={styles.artWrap}>
        <CardArt cardId={card.id} tier={card.tier} color={card.color} />
        <div className={styles.hatch} />
        <div className={styles.vignette} />
        <div className={styles.artHeader}>
          {card.points > 0 && <span className={styles.points}>{card.points}</span>}
          <GemFace color={card.color} glow={false} className={styles.gemIcon} />
        </div>
      </div>

      {/* Card stock beneath the picture */}
      <div className={styles.lower} />

      {/* Cost, stacked bottom-left — climbs upward so it never runs off the card */}
      <div className={styles.costStack}>
        {costEntries.map(([color, amount], i) => {
          const discount = playerProduction[color] ?? 0
          const remaining = Math.max(0, amount - discount)
          const affordable = currentPlayer
            ? (currentPlayer.gems[color] + (currentPlayer.gems.gold ?? 0)) >= remaining
            : true
          return (
            <div
              key={color}
              className={`${styles.costChip} ${!affordable && remaining > 0 ? styles.cantAfford : ''}`}
              style={{ bottom: i * 20, zIndex: costEntries.length - i }}
            >
              <GemToken color={color} count={amount} size="sm" />
              {discount > 0 && remaining < amount && (
                <span className={styles.discount}>-{discount}</span>
              )}
            </div>
          )
        })}
      </div>

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
