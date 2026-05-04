import { motion, AnimatePresence } from 'framer-motion'
import type { Player, GemColor, NonGoldColor } from '@splendor/shared'
import GemToken from './GemToken'
import DevelopmentCard from './DevelopmentCard'
import styles from './PlayerPanel.module.css'

interface PlayerPanelProps {
  player: Player
  isCurrentTurn: boolean
  isLocalPlayer: boolean
  onBuyReserved: (cardId: string) => void
  canBuyCard: (cardId: string) => boolean
  playerProduction: Partial<Record<NonGoldColor, number>>
}

const GEM_COLORS: GemColor[] = ['white', 'blue', 'green', 'red', 'black', 'gold']

export default function PlayerPanel({
  player,
  isCurrentTurn,
  isLocalPlayer,
  onBuyReserved,
  canBuyCard,
  playerProduction,
}: PlayerPanelProps) {
  const totalGems = Object.values(player.gems).reduce((s, v) => s + v, 0)

  return (
    <div className={`${styles.panel} ${isCurrentTurn ? styles.active : ''} ${isLocalPlayer ? styles.local : ''}`}>
      {/* Turn indicator */}
      {isCurrentTurn && (
        <motion.div
          className={styles.turnPulse}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.nameRow}>
          <span className={styles.name}>{player.name}</span>
          {isLocalPlayer && <span className={styles.youTag}>You</span>}
          {isCurrentTurn && <span className={styles.turnTag}>Turn</span>}
        </div>
        <div className={styles.points}>
          <span className={styles.pointsValue}>{player.points}</span>
          <span className={styles.pointsLabel}>pts</span>
        </div>
      </div>

      {/* Nobles earned */}
      {player.nobles.length > 0 && (
        <div className={styles.nobles}>
          {player.nobles.map((n) => (
            <div key={n.id} className={styles.nobleEarned} title={`+${n.points} points`}>
              ♛
            </div>
          ))}
        </div>
      )}

      {/* Gems */}
      <div className={styles.gems}>
        {GEM_COLORS.map((color) => {
          const count = player.gems[color]
          if (count === 0) return null
          return (
            <div key={color} className={styles.gemItem}>
              <GemToken color={color} count={count} size="sm" />
            </div>
          )
        })}
        {totalGems > 0 && (
          <span className={styles.gemTotal}>{totalGems}/10</span>
        )}
      </div>

      {/* Card production summary */}
      <div className={styles.production}>
        {(['white', 'blue', 'green', 'red', 'black'] as NonGoldColor[]).map((color) => {
          const count = playerProduction[color] ?? 0
          if (count === 0) return null
          return (
            <div key={color} className={`${styles.prodItem} ${styles[`prod_${color}`]}`}>
              <span className={styles.prodCount}>{count}</span>
            </div>
          )
        })}
      </div>

      {/* Reserved cards */}
      {player.reserved.length > 0 && (
        <div className={styles.reserved}>
          <span className={styles.reservedLabel}>Reserved</span>
          <div className={styles.reservedCards}>
            {player.reserved.map((card) => (
              <AnimatePresence key={card.id}>
                {isLocalPlayer ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <DevelopmentCard
                      card={card}
                      canBuy={canBuyCard(card.id)}
                      canReserve={false}
                      isReserved
                      onBuy={() => onBuyReserved(card.id)}
                      onReserve={() => {}}
                      playerProduction={playerProduction}
                      currentPlayer={player}
                    />
                  </motion.div>
                ) : (
                  <div className={styles.hiddenCard} />
                )}
              </AnimatePresence>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
