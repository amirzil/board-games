import type { HGameState } from '@splendor/shared'
import { useGameStore } from '../../store/gameStore'
import Button from '../UI/Button'
import styles from './HGameOver.module.css'

interface Props {
  state: HGameState
  onBack: () => void
}

export default function HGameOver({ state, onBack }: Props) {
  const { playerId } = useGameStore()
  const ranked = [...state.players].sort((a, b) => (b.finalScore ?? 0) - (a.finalScore ?? 0))

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Landscape Complete</h1>
        <div className={styles.list}>
          {ranked.map((p, i) => (
            <div key={p.id} className={`${styles.row} ${state.winners.includes(p.id) ? styles.winner : ''} ${p.id === playerId ? styles.you : ''}`}>
              <span className={styles.rank}>{i + 1}</span>
              <span className={styles.name}>{p.name}{p.id === playerId ? ' (you)' : ''}</span>
              <span className={styles.score}>{p.finalScore ?? 0} pts</span>
              {state.winners.includes(p.id) && <span className={styles.crown}>Winner</span>}
            </div>
          ))}
        </div>
        <Button size="lg" onClick={onBack}>Back to Games</Button>
      </div>
    </div>
  )
}
