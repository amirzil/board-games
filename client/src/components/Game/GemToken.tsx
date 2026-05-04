import { motion } from 'framer-motion'
import type { GemColor } from '@splendor/shared'
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

export default function GemToken({ color, count, size = 'md', onClick, disabled, className = '', stackable }: GemTokenProps) {
  const isClickable = !!onClick && !disabled
  const showCount = count !== undefined

  return (
    <motion.button
      type="button"
      className={`${styles.token} ${styles[color]} ${styles[size]} ${isClickable ? styles.clickable : ''} ${disabled ? styles.disabled : ''} ${className}`}
      onClick={isClickable ? onClick : undefined}
      whileHover={isClickable ? { scale: 1.1, y: -2 } : {}}
      whileTap={isClickable ? { scale: 0.95 } : {}}
      title={`${GEM_LABELS[color]}${showCount ? ` (${count})` : ''}`}
      style={{ cursor: isClickable ? 'pointer' : 'default' }}
    >
      <div className={styles.inner}>
        <div className={styles.highlight} />
        {showCount && <span className={styles.count}>{count}</span>}
      </div>
      {stackable && count && count > 1 && (
        <div className={`${styles.stack} ${styles[color]}`} />
      )}
    </motion.button>
  )
}
