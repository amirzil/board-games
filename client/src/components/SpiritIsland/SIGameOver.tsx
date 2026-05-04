import { motion } from 'framer-motion'
import type { SIGameState } from '@splendor/shared'
import Button from '../UI/Button'
import styles from './SIGameOver.module.css'

interface Props {
  state: SIGameState
  onBack: () => void
}

export default function SIGameOver({ state, onBack }: Props) {
  const won = state.winner === 'spirits'

  return (
    <div className={`${styles.container} ${won ? styles.victory : styles.defeat}`}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className={styles.icon}>{won ? '🌿' : '☠️'}</div>
        <h1 className={styles.title}>{won ? 'The Spirits Prevail!' : 'The Island Falls...'}</h1>
        <p className={styles.subtitle}>
          {won
            ? 'You generated enough fear to drive the invaders away.'
            : state.blight >= state.blightCap
              ? 'The island was consumed by blight.'
              : 'A spirit was destroyed, breaking your connection to the island.'}
        </p>

        <div className={styles.stats}>
          <div className={styles.statRow}>
            <span>Turns survived</span><span>{state.turn}</span>
          </div>
          <div className={styles.statRow}>
            <span>Fear generated</span><span>{state.fearPool}</span>
          </div>
          <div className={styles.statRow}>
            <span>Blight placed</span><span>{state.blight}</span>
          </div>
        </div>

        <Button size="lg" onClick={onBack}>Back to Home</Button>
      </motion.div>
    </div>
  )
}
