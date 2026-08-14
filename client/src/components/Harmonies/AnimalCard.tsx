import type { AnimalCardDef } from '@splendor/shared'
import AnimalIllustration from './AnimalIllustration'
import HabitatDiagram from './HabitatDiagram'
import styles from './AnimalCard.module.css'

export interface AnimalCardProgress {
  matches: number
  complete: boolean
  currentValue: number
}

interface AnimalCardProps {
  def: AnimalCardDef
  layout: 'card' | 'row'
  actionLabel: string
  onAction: () => void
  actionDisabled?: boolean
  selected?: boolean
  progress?: AnimalCardProgress
}

export default function AnimalCard({ def, layout, actionLabel, onAction, actionDisabled, selected, progress }: AnimalCardProps) {
  // track[] is ordered from "all cells matched" (best value) down to "one
  // cell matched" (smallest); reversed here so the track reads left-to-right
  // as a player naturally fills it in, one match at a time.
  const ascendingTrack = [...def.track].reverse()
  const reachedStep = progress ? progress.matches - 1 : -1

  return (
    <div className={`${styles.card} ${styles[layout]} ${selected ? styles.selected : ''} ${progress?.complete ? styles.complete : ''}`}>
      <div className={styles.illoWrap}>
        <AnimalIllustration animalId={def.id} className={styles.illo} />
        <div className={styles.grain} />
        <div className={styles.vignette} />
      </div>
      <div className={styles.body}>
        <span className={styles.name}>{def.name}</span>
        <HabitatDiagram habitat={def.habitat} className={styles.habitatDiagram} />
        <div className={styles.track}>
          {ascendingTrack.map((v, i) => (
            <span key={i} className={`${styles.step} ${i === reachedStep ? styles.stepReached : ''} ${i < reachedStep ? styles.stepPassed : ''}`}>
              {v}
            </span>
          ))}
        </div>
        {progress && (
          <span className={styles.progressLabel}>
            {progress.complete ? 'Complete' : `${progress.matches}/${def.track.length} matched · worth ${progress.currentValue} now`}
          </span>
        )}
        <button className={styles.actionBtn} disabled={actionDisabled} onClick={onAction}>
          {actionLabel}
        </button>
      </div>
    </div>
  )
}
