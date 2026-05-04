import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import socket from '../../socket'
import Button from '../UI/Button'
import styles from './WaitingRoom.module.css'

export default function WaitingRoom() {
  const { room, playerId } = useGameStore()
  if (!room) return null

  const isHost = room.hostId === playerId
  const canStart = room.players.length >= 2

  const handleStart = () => socket.emit('start_game')

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className={styles.title}>Waiting for Players</h2>

        <div className={styles.codeBlock}>
          <span className={styles.codeLabel}>Room Code</span>
          <span className={styles.code}>{room.code}</span>
          <span className={styles.codeHint}>Share this with your friends</span>
        </div>

        <div className={styles.playerList}>
          {room.players.map((p, i) => (
            <motion.div
              key={p.id}
              className={`${styles.playerRow} ${p.id === playerId ? styles.you : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <span className={styles.playerDot} />
              <span className={styles.playerName}>{p.name}</span>
              {p.id === room.hostId && <span className={styles.hostBadge}>Host</span>}
              {p.id === playerId && <span className={styles.youBadge}>You</span>}
            </motion.div>
          ))}

          {Array.from({ length: 4 - room.players.length }).map((_, i) => (
            <div key={i} className={styles.emptySlot}>
              <span className={styles.emptyDot} />
              <span className={styles.emptyText}>Waiting...</span>
            </div>
          ))}
        </div>

        {isHost ? (
          <div className={styles.startSection}>
            {!canStart && (
              <p className={styles.hint}>Need at least 2 players to start</p>
            )}
            <Button size="lg" onClick={handleStart} disabled={!canStart}>
              Start Game
            </Button>
          </div>
        ) : (
          <p className={styles.waitingText}>Waiting for host to start the game...</p>
        )}
      </motion.div>
    </div>
  )
}
