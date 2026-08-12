import { motion } from 'framer-motion'
import type { GemColor } from '@splendor/shared'
import GemFace from './GemFace'
import styles from './GemToken.module.css'

interface GemTokenProps {
  color: GemColor
  count?: number
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  disabled?: boolean
  className?: string
  stackable?: boolean
}

const GEM_LABELS: Record<GemColor, string> = {
  white: 'Diamond',
  blue: 'Sapphire',
  green: 'Emerald',
  red: 'Ruby',
  black: 'Onyx',
  gold: 'Gold',
}

// Fixed offsets (in % of the token's own box) so a stack of chips reads as a
// small tossed pile instead of a perfectly centered duplicate.
const STACK_OFFSETS = [
  { x: 14, y: 10, r: -9 },
  { x: -12, y: 15, r: 11 },
]

export default function GemToken({ color, count, size = 'md', onClick, disabled, className = '', stackable }: GemTokenProps) {
  const isClickable = !!onClick && !disabled
  const showCount = count !== undefined
  const extraStacked = stackable && count ? Math.min(count - 1, STACK_OFFSETS.length) : 0

  return (
    <motion.button
      type="button"
      className={`${styles.token} ${styles[color]} ${styles[size]} ${isClickable ? styles.clickable : ''} ${disabled ? styles.disabled : ''} ${className}`}
      onClick={isClickable ? onClick : undefined}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 16 }}
      whileHover={isClickable ? { scale: 1.1, y: -3 } : {}}
      whileTap={isClickable ? { scale: 0.95, y: 0 } : {}}
      title={`${GEM_LABELS[color]}${showCount ? ` (${count})` : ''}`}
      style={{ cursor: isClickable ? 'pointer' : 'default' }}
    >
      {Array.from({ length: extraStacked }).map((_, i) => {
        const o = STACK_OFFSETS[i]
        return (
          <div key={i} className={styles.stackGem} style={{ transform: `translate(${o.x}%, ${o.y}%) rotate(${o.r}deg)` }}>
            <GemFace color={color} glow={false} />
          </div>
        )
      })}
      <div className={styles.inner}>
        <GemFace color={color} />
        {showCount && <span className={styles.count}>{count}</span>}
      </div>
    </motion.button>
  )
}
