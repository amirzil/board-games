import type { Land } from '@splendor/shared'
import styles from './LandTile.module.css'

const TERRAIN_ICONS: Record<string, string> = {
  jungle: '🌿',
  mountain: '⛰️',
  wetland: '💧',
  sands: '🏜️',
}

interface Props {
  land: Land
  spiritColors: Record<string, string>
  isTarget?: boolean
  isClickable?: boolean
  onClick?: () => void
}

export default function LandTile({ land, spiritColors, isTarget, isClickable, onClick }: Props) {
  return (
    <button
      className={`${styles.tile} ${styles[land.terrain]} ${land.isCoastal ? styles.coastal : ''} ${isTarget ? styles.target : ''} ${isClickable ? styles.clickable : ''}`}
      onClick={onClick}
      disabled={!isClickable}
    >
      <div className={styles.header}>
        <span className={styles.terrainIcon}>{TERRAIN_ICONS[land.terrain]}</span>
        <span className={styles.landId}>{land.id}</span>
        {land.isCoastal && <span className={styles.coastalBadge}>Coast</span>}
      </div>

      <div className={styles.pieces}>
        {land.cities > 0 && <span className={styles.city} title="Cities">🏙️{land.cities}</span>}
        {land.towns > 0 && <span className={styles.town} title="Towns">🏘️{land.towns}</span>}
        {land.explorers > 0 && <span className={styles.explorer} title="Explorers">⚔️{land.explorers}</span>}
        {land.dahan > 0 && <span className={styles.dahan} title="Dahan">👤{land.dahan}</span>}
        {land.blight > 0 && <span className={styles.blight} title="Blight">☠️{land.blight}</span>}
      </div>

      {land.presence.length > 0 && (
        <div className={styles.presenceRow}>
          {land.presence.map((spiritId, i) => (
            <span
              key={i}
              className={styles.presenceDot}
              style={{ background: spiritColors[spiritId] ?? '#fff' }}
              title={spiritId}
            />
          ))}
        </div>
      )}
    </button>
  )
}
