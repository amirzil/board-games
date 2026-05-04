import type { PowerCard } from '@splendor/shared'
import styles from './PowerCardUI.module.css'

const ELEMENT_ICONS: Record<string, string> = {
  sun: '☀️', moon: '🌙', fire: '🔥', air: '💨',
  water: '💧', earth: '🪨', plant: '🌿', animal: '🦋',
}

interface Props {
  card: PowerCard
  canAfford: boolean
  isSelected?: boolean
  isPlayed?: boolean
  isTutorialHighlighted?: boolean
  onClick?: () => void
}

export default function PowerCardUI({ card, canAfford, isSelected, isPlayed, isTutorialHighlighted, onClick }: Props) {
  return (
    <button
      className={`
        ${styles.card}
        ${isSelected ? styles.selected : ''}
        ${isPlayed ? styles.played : ''}
        ${!canAfford && !isPlayed ? styles.unaffordable : ''}
        ${card.speed === 'fast' ? styles.fast : styles.slow}
        ${isTutorialHighlighted ? styles.tutHighlight : ''}
      `}
      onClick={onClick}
      disabled={isPlayed || !onClick}
      title={card.description}
    >
      <div className={styles.header}>
        <span className={styles.cost}>{card.cost}</span>
        <span className={styles.speed}>{card.speed === 'fast' ? '⚡' : '🐢'}</span>
      </div>

      <div className={styles.elements}>
        {card.elements.map((el) => (
          <span key={el} className={styles.element} title={el}>{ELEMENT_ICONS[el]}</span>
        ))}
      </div>

      <p className={styles.name}>{card.name}</p>
      <p className={styles.desc}>{card.description}</p>
    </button>
  )
}
