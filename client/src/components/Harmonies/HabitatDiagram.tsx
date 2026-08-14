import type { HabitatCell } from '@splendor/shared'
import styles from './HabitatDiagram.module.css'

// Small at-a-glance hex diagram of an Animal Card's required habitat pattern,
// reusing the same colors as HexToken so a card's requirement visually
// matches the tokens/tiles a player would place to satisfy it. Previously
// the pattern was only discoverable by drafting the card and using "Match"
// on the board — this shows it up front.

const COLOR_FILL: Record<string, string> = {
  green: '#2f9955',
  grey: '#8b909a',
  blue: '#2f8fc4',
  yellow: '#d4a828',
  red: '#c1442c',
  brown: '#8a6239',
  any: 'transparent',
}

const HEX_ANGLES = [0, 60, 120, 180, 240, 300]
function hexPoints(cx: number, cy: number, r: number): string {
  return HEX_ANGLES.map((a) => {
    const rad = (a * Math.PI) / 180
    return `${cx + r * Math.cos(rad)},${cy + r * Math.sin(rad)}`
  }).join(' ')
}

function axialToPixel(dq: number, dr: number, size: number) {
  const x = size * 1.5 * dq
  const y = size * (Math.sqrt(3) / 2 * dq + Math.sqrt(3) * dr)
  return { x, y }
}

interface HabitatDiagramProps {
  habitat: HabitatCell[]
  className?: string
}

export default function HabitatDiagram({ habitat, className = '' }: HabitatDiagramProps) {
  const size = 11
  const pts = habitat.map((cell) => ({ cell, ...axialToPixel(cell.dq, cell.dr, size) }))
  const minX = Math.min(...pts.map((p) => p.x)) - size
  const maxX = Math.max(...pts.map((p) => p.x)) + size
  const minY = Math.min(...pts.map((p) => p.y)) - size
  const maxY = Math.max(...pts.map((p) => p.y)) + size
  const w = maxX - minX
  const h = maxY - minY

  return (
    <svg viewBox={`${minX} ${minY} ${w} ${h}`} className={`${styles.diagram} ${className}`} aria-hidden="true">
      {pts.map((p, i) => (
        <g key={i}>
          <polygon
            points={hexPoints(p.x, p.y, size)}
            fill={COLOR_FILL[p.cell.color]}
            className={p.cell.color === 'any' ? styles.anyCell : styles.cell}
          />
          {p.cell.height && p.cell.height > 1 && (
            <text x={p.x} y={p.y + 3.2} textAnchor="middle" className={styles.heightLabel}>
              {p.cell.height}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}
