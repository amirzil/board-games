import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import Button from '../UI/Button'
import styles from './GameOver.module.css'

export default function GameOver() {
  const { gameState, playerId } = useGameStore()
  if (!gameState) return null

  const winner = gameState.players.find((p) => p.id === gameState.winner)
  const isWinner = gameState.winner === playerId
  const sortedPlayers = [...gameState.players].sort((a, b) => b.points - a.points)

  const handlePlayAgain = () => {
    window.location.reload()
  }

  return (
    <div className={styles.container}>
      {/* Particle burst */}
      {isWinner && (
        <div className={styles.particles}>
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className={styles.particle}
              style={{
                left: `${Math.random() * 100}%`,
                background: ['#c9a84c', '#3a7bd5', '#27ae60', '#c0392b', '#f0c040'][i % 5],
              }}
              initial={{ y: '60vh', opacity: 1 }}
              animate={{
                y: `${-20 - Math.random() * 80}vh`,
                x: `${(Math.random() - 0.5) * 200}px`,
                opacity: 0,
                rotate: Math.random() * 720,
              }}
              transition={{
                duration: 1.5 + Math.random(),
                delay: Math.random() * 0.8,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'backOut' }}
      >
        <div className={styles.crown}>♛</div>

        <h1 className={styles.winnerName}>{winner?.name}</h1>
        <p className={styles.winnerSubtitle}>
          {isWinner ? 'You won! Magnificent!' : 'Wins the game!'}
        </p>

        {/* Scoreboard */}
        <div className={styles.scoreboard}>
          {sortedPlayers.map((p, i) => (
            <motion.div
              key={p.id}
              className={`${styles.scoreRow} ${p.id === playerId ? styles.you : ''} ${p.id === gameState.winner ? styles.winner : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
            >
              <span className={styles.rank}>#{i + 1}</span>
              <span className={styles.scoreName}>{p.name}</span>
              <span className={styles.scorePoints}>{p.points} pts</span>
              <span className={styles.scoreCards}>{p.cards.length} cards</span>
            </motion.div>
          ))}
        </div>

        <Button size="lg" onClick={handlePlayAgain}>
          Play Again
        </Button>
      </motion.div>
    </div>
  )
}
