import type { SIGameState } from '@splendor/shared'
import styles from './FearTrack.module.css'

interface Props {
  state: SIGameState
}

export default function FearTrack({ state }: Props) {
  const pct = Math.min(1, state.fearPool / state.fearThreshold)
  const terrorLevel = pct < 0.33 ? 1 : pct < 0.67 ? 2 : pct < 1 ? 3 : 3

  return (
    <div className={styles.track}>
      <div className={styles.row}>
        <span className={styles.label}>Fear</span>
        <span className={styles.count}>{state.fearPool} / {state.fearThreshold}</span>
        <span className={styles.terrorLabel}>Terror {terrorLevel}</span>
      </div>
      <div className={styles.bar}>
        <div className={styles.fill} style={{ width: `${pct * 100}%` }} />
        <div className={styles.marker} style={{ left: '33%' }} />
        <div className={styles.marker} style={{ left: '67%' }} />
      </div>
    </div>
  )
}
