import type { Gems, NonGoldColor } from '@splendor/shared'
import GemToken from './GemToken'
import styles from './GemBank.module.css'

interface GemBankProps {
  gems: Gems
  isMyTurn: boolean
  pendingGems: Partial<Record<NonGoldColor, number>>
  pendingCount: number
  onTakeGem: (color: NonGoldColor) => void
  onConfirmTake: () => void
  onCancelTake: () => void
}

const COLORS: NonGoldColor[] = ['white', 'blue', 'green', 'red', 'black']

export default function GemBank({
  gems,
  isMyTurn,
  pendingGems,
  pendingCount,
  onTakeGem,
  onConfirmTake,
  onCancelTake,
}: GemBankProps) {
  function canTake(color: NonGoldColor): boolean {
    if (!isMyTurn) return false
    const pending = pendingGems[color] ?? 0
    const available = gems[color] - pending

    // Already selected 3 different
    const distinctColors = Object.keys(pendingGems).length
    if (pendingCount >= 3) return false

    // Take-2 mode: only one color with count 2
    if (pending === 1 && distinctColors === 1) {
      // Can take 2nd of same if original pile had ≥4
      return gems[color] >= 4 && available >= 1
    }

    // Take-2 not started yet, or taking different colors
    if (pending === 0) {
      if (distinctColors === 0) return available > 0
      // Already taking some, can only add different colors now (unless going for take-2)
      if (pendingGems[color] !== undefined) return false // already in selection
      return available > 0 && distinctColors < 3
    }

    return false
  }

  const canConfirm = pendingCount === 3 || (pendingCount === 2 && Object.keys(pendingGems).length === 1) || pendingCount === 1

  return (
    <div className={styles.bank}>
      <h3 className={styles.title}>Gem Bank</h3>
      <div className={styles.tokens}>
        {COLORS.map((color) => {
          const available = gems[color]
          const pending = pendingGems[color] ?? 0
          const displayCount = available - pending
          return (
            <div key={color} className={styles.tokenStack}>
              <GemToken
                color={color}
                count={displayCount}
                size="md"
                onClick={canTake(color) ? () => onTakeGem(color) : undefined}
                disabled={!canTake(color) || displayCount === 0}
                stackable
              />
              {pending > 0 && (
                <span className={styles.pendingBadge}>+{pending}</span>
              )}
            </div>
          )
        })}
        <div className={styles.tokenStack}>
          <GemToken
            color="gold"
            count={gems.gold}
            size="md"
            stackable
          />
        </div>
      </div>

      {pendingCount > 0 && (
        <div className={styles.pendingActions}>
          <p className={styles.pendingText}>
            Taking: {Object.entries(pendingGems).map(([c, n]) => `${n} ${c}`).join(', ')}
          </p>
          <div className={styles.pendingBtns}>
            <button className={styles.confirmBtn} onClick={onConfirmTake} disabled={!canConfirm}>
              Confirm
            </button>
            <button className={styles.cancelBtn} onClick={onCancelTake}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
