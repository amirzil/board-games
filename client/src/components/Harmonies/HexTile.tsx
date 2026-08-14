import { useId } from 'react'
import type { TokenColor } from '@splendor/shared'
import styles from './HexTile.module.css'

// A flat-top hex rendered as a raised block: a bright top face plus a
// darker "skirt" extruded down the three front-facing edges, faking a 3D
// prism sitting on the table without needing a real 3D transform on the
// whole board (keeps hit-testing simple — these stay ordinary flat elements
// in the DOM grid, just drawn to look extruded).
const HEX_ANGLES = [0, 60, 120, 180, 240, 300] as const
const R = 38
const CX = 50
const CY = 42
const DEPTH = 16

function hexPoint(angleDeg: number): [number, number] {
  const rad = (angleDeg * Math.PI) / 180
  return [CX + R * Math.cos(rad), CY + R * Math.sin(rad)]
}

const VERTS = HEX_ANGLES.map(hexPoint) // [right, bottomRight, bottomLeft, left, topLeft, topRight]

function buildSkirtPath(): string {
  const [right, bottomRight, bottomLeft, left] = VERTS
  const shift = ([x, y]: [number, number]): [number, number] => [x, y + DEPTH]
  const pts = [left, bottomLeft, bottomRight, right, shift(right), shift(bottomRight), shift(bottomLeft), shift(left)]
  return `M ${pts.map((p) => p.join(',')).join(' L ')} Z`
}

const TOP_POINTS = VERTS.map((p) => p.join(',')).join(' ')
const SKIRT_PATH = buildSkirtPath()

interface HexTileProps {
  /** Terrain color of whatever token sits here; omit for bare empty ground. */
  topColor?: TokenColor
  className?: string
}

export default function HexTile({ topColor, className = '' }: HexTileProps) {
  const uid = useId()
  const gradId = `hex-tile-top-${uid}`
  const colorClass = topColor ? styles[topColor] : styles.empty

  return (
    <svg viewBox="0 0 100 100" className={`${styles.tile} ${colorClass} ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="20%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" className={styles.stopLight} />
          <stop offset="100%" className={styles.stopMid} />
        </linearGradient>
      </defs>
      <path d={SKIRT_PATH} className={styles.skirt} />
      <polygon points={TOP_POINTS} fill={`url(#${gradId})`} className={styles.top} />
    </svg>
  )
}
