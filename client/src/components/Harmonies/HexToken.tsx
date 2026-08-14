import { useId } from 'react'
import type { TokenColor } from '@splendor/shared'
import styles from './HexToken.module.css'

// A polished hex-coin look for loose tokens (central board, pending hand):
// a darker beveled rim behind a glossy domed top face, echoing the site's
// faceted-gem tokens from Splendor but in natural, matte terrain tones
// rather than jewel-cut facets — these read as wood/stone/clay pieces.
const HEX_ANGLES = [0, 60, 120, 180, 240, 300]

function hexPoint(cx: number, cy: number, r: number, angleDeg: number): string {
  const rad = (angleDeg * Math.PI) / 180
  return `${cx + r * Math.cos(rad)},${cy + r * Math.sin(rad)}`
}

function hexPoints(cx: number, cy: number, r: number): string {
  return HEX_ANGLES.map((a) => hexPoint(cx, cy, r, a)).join(' ')
}

interface HexTokenProps {
  color: TokenColor
  glow?: boolean
  className?: string
}

export default function HexToken({ color, glow = true, className = '' }: HexTokenProps) {
  const uid = useId()
  const gradId = `hex-token-dome-${uid}`

  return (
    <svg
      viewBox="0 0 100 100"
      className={`${styles.token} ${styles[color]} ${glow ? styles.glow : styles.plainShadow} ${className}`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={gradId} cx="35%" cy="30%" r="75%">
          <stop offset="0%" className={styles.stopLight} />
          <stop offset="55%" className={styles.stopMid} />
          <stop offset="100%" className={styles.stopDark} />
        </radialGradient>
      </defs>
      <polygon points={hexPoints(50, 50, 44)} className={styles.rim} />
      <polygon points={hexPoints(50, 50, 35)} fill={`url(#${gradId})`} className={styles.top} />
      <ellipse cx="37" cy="34" rx="10" ry="6" className={styles.specular} />
    </svg>
  )
}
