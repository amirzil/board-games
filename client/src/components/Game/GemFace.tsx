import type { GemColor } from '@splendor/shared'
import styles from './GemFace.module.css'

// Brilliant-cut facet geometry: a hexagonal table facet surrounded by six
// kite-shaped pavilion facets, shaded so light reads as falling from the
// upper-left — matching the specular highlight placed in the same corner.
const HEX_ANGLES = [-90, -30, 30, 90, 150, 210]
const FACET_SHADE_ORDER = ['light', 'light', 'mid', 'dark', 'dark', 'mid'] as const

function hexPoint(cx: number, cy: number, r: number, angleDeg: number): [number, number] {
  const rad = (angleDeg * Math.PI) / 180
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
}

interface GemFaceProps {
  color: GemColor
  /** Ambient colored glow — on for loose tokens, off for small inline icons. */
  glow?: boolean
  className?: string
}

export default function GemFace({ color, glow = true, className = '' }: GemFaceProps) {
  const tableVerts = HEX_ANGLES.map((a) => hexPoint(50, 50, 15, a))
  const outerVerts = HEX_ANGLES.map((a) => hexPoint(50, 50, 40, a))

  return (
    <svg
      viewBox="0 0 100 100"
      className={`${styles.face} ${styles[color]} ${glow ? styles.glow : styles.plainShadow} ${className}`}
      aria-hidden="true"
    >
      {HEX_ANGLES.map((_, i) => {
        const next = (i + 1) % 6
        const points = [tableVerts[i], outerVerts[i], outerVerts[next], tableVerts[next]]
          .map((p) => p.join(','))
          .join(' ')
        return <polygon key={i} points={points} className={styles[`facet_${FACET_SHADE_ORDER[i]}`]} />
      })}
      <polygon points={tableVerts.map((p) => p.join(',')).join(' ')} className={styles.facetTable} />
      <polygon points={outerVerts.map((p) => p.join(',')).join(' ')} className={styles.girdle} />
      <ellipse cx="37" cy="33" rx="11" ry="6.5" className={styles.specular} />
    </svg>
  )
}
