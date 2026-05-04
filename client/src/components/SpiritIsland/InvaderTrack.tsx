import type { SIGameState } from '@splendor/shared'
import styles from './InvaderTrack.module.css'

interface Props {
  state: SIGameState
}

export default function InvaderTrack({ state }: Props) {
  return (
    <div className={styles.track}>
      <h3 className={styles.heading}>Invader Track</h3>

      <div className={styles.slots}>
        <div className={`${styles.slot} ${styles.ravage}`}>
          <span className={styles.slotLabel}>Ravage</span>
          {state.ravageCard ? (
            <div className={styles.card}>
              <span className={styles.cardTerrain}>{terrainIcon(state.ravageCard.terrain)}</span>
              <span className={styles.cardLabel}>{state.ravageCard.label}</span>
            </div>
          ) : (
            <div className={styles.emptyCard}>—</div>
          )}
          <p className={styles.slotDesc}>Invaders attack</p>
        </div>

        <div className={`${styles.slot} ${styles.build}`}>
          <span className={styles.slotLabel}>Build</span>
          {state.buildCard ? (
            <div className={styles.card}>
              <span className={styles.cardTerrain}>{terrainIcon(state.buildCard.terrain)}</span>
              <span className={styles.cardLabel}>{state.buildCard.label}</span>
            </div>
          ) : (
            <div className={styles.emptyCard}>—</div>
          )}
          <p className={styles.slotDesc}>Towns upgrade</p>
        </div>

        <div className={`${styles.slot} ${styles.explore}`}>
          <span className={styles.slotLabel}>Explore</span>
          {state.invaderDeck.length > 0 ? (
            <div className={styles.card}>
              <span className={styles.deckCount}>{state.invaderDeck.length}</span>
              <span className={styles.cardLabel}>cards left</span>
            </div>
          ) : (
            <div className={styles.emptyCard}>Empty</div>
          )}
          <p className={styles.slotDesc}>Scouts advance</p>
        </div>
      </div>

      <div className={styles.blightRow}>
        <span className={styles.blightIcon}>☠️</span>
        <span className={styles.blightLabel}>Blight:</span>
        <span className={`${styles.blightCount} ${state.blight >= state.blightCap * 0.75 ? styles.danger : ''}`}>
          {state.blight} / {state.blightCap}
        </span>
      </div>
    </div>
  )
}

function terrainIcon(terrain: string): string {
  return { jungle: '🌿', mountain: '⛰️', wetland: '💧', sands: '🏜️' }[terrain] ?? '?'
}
