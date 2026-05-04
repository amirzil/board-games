import type { Noble, NonGoldColor } from '@splendor/shared'
import styles from './NobleCard.module.css'

interface NobleCardProps {
  noble: Noble
  isAttainable?: boolean
}

export default function NobleCard({ noble, isAttainable }: NobleCardProps) {
  const reqEntries = Object.entries(noble.requirement).filter(([, v]) => (v ?? 0) > 0) as [NonGoldColor, number][]

  return (
    <div className={`${styles.card} ${isAttainable ? styles.attainable : ''}`}>
      <div className={styles.portrait}>
        <div className={styles.crown}>♛</div>
      </div>
      <div className={styles.points}>{noble.points}</div>
      <div className={styles.requirements}>
        {reqEntries.map(([color, amount]) => (
          <div key={color} className={`${styles.req} ${styles[`req_${color}`]}`}>
            <span className={styles.reqAmount}>{amount}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
