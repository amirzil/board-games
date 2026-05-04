import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './HomeScreen.module.css'

const GAMES = [
  { id: 'splendor',      name: 'Splendor',      tagline: 'Collect gems, buy cards, attract nobles', players: '2–4', available: true },
  { id: 'harmonies',     name: 'Harmonies',     tagline: 'Compose beautiful landscapes in harmony', players: '1–5', available: false },
  { id: 'spirit-island', name: 'Spirit Island', tagline: 'Defend your island as powerful spirits',  players: '1–2', available: true },
]

interface Props {
  onSelectGame: (id: string) => void
}

export default function HomeScreen({ onSelectGame }: Props) {
  const [comingSoon, setComingSoon] = useState<string | null>(null)

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.inner}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className={styles.header}>
          <h1 className={styles.siteTitle}>Board Games</h1>
          <p className={styles.siteSubtitle}>Choose a game to play</p>
        </div>

        <div className={styles.grid}>
          {GAMES.map((game, i) => (
            <motion.button
              key={game.id}
              className={`${styles.card} ${!game.available ? styles.cardDisabled : ''}`}
              onClick={() => game.available ? onSelectGame(game.id) : setComingSoon(game.name)}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.08, ease: 'easeOut' }}
              whileHover={{ y: -4, transition: { duration: 0.15 } }}
            >
              <div className={styles.cardTop}>
                <span className={`${styles.statusBadge} ${game.available ? styles.statusAvailable : styles.statusSoon}`}>
                  {game.available ? 'Available' : 'Coming Soon'}
                </span>
              </div>
              <h2 className={styles.gameName}>{game.name}</h2>
              <p className={styles.tagline}>{game.tagline}</p>
              <div className={styles.playersBadge}>
                <span className={styles.playersIcon}>&#9670;</span>
                {game.players} players
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {comingSoon && (
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setComingSoon(null)}
          >
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className={styles.modalTitle}>Coming Soon</p>
              <p className={styles.modalGame}>{comingSoon}</p>
              <p className={styles.modalText}>This game is not yet available. Check back later!</p>
              <button className={styles.dismissBtn} onClick={() => setComingSoon(null)}>
                Dismiss
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
