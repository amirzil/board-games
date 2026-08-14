import type { HexStack } from '@splendor/shared'
import styles from './TokenPiece.module.css'

// Original low-poly, flat-shaded (light-left / dark-right) 3D pieces sitting
// on a HexTile — trees and mountains grow taller with stack height, buildings
// get a base block from whatever they're capping, water and fields stay flat
// decorative overlays since they never stack.

type Pt = [number, number]
const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
const pts = (arr: Pt[]) => arr.map((p) => p.join(',')).join(' ')

function TriTwoTone({ apex, baseL, baseR, light, dark }: { apex: Pt; baseL: Pt; baseR: Pt; light: string; dark: string }) {
  const m = mid(baseL, baseR)
  return (
    <>
      <polygon points={pts([apex, baseL, m])} fill={light} />
      <polygon points={pts([apex, m, baseR])} fill={dark} />
    </>
  )
}

function RectTwoTone({ x, y, w, h, light, dark }: { x: number; y: number; w: number; h: number; light: string; dark: string }) {
  return (
    <>
      <rect x={x} y={y} width={w / 2} height={h} fill={light} />
      <rect x={x + w / 2} y={y} width={w / 2} height={h} fill={dark} />
    </>
  )
}

const GREEN = { light: '#5ddb7a', dark: '#1f7a3e' }
const GREY = { light: '#b8bcc2', dark: '#6b707a' }
const RED = { light: '#e8695a', dark: '#a3301f' }
const BROWN = { light: '#a9784a', dark: '#6b4826' }
const BLUE = { light: '#6fc8ef', dark: '#1f6f9c' }
const GOLD = { light: '#ffe98a', dark: '#c99a1a' }
const FILLER_TONES: Record<string, { light: string; dark: string }> = { grey: GREY, brown: BROWN, red: RED }

const TREE_TIERS: Record<number, { apex: Pt; baseL: Pt; baseR: Pt }[]> = {
  1: [{ apex: [50, 44], baseL: [30, 66], baseR: [70, 66] }],
  2: [
    { apex: [50, 40], baseL: [28, 68], baseR: [72, 68] },
    { apex: [50, 22], baseL: [38, 46], baseR: [62, 46] },
  ],
  3: [
    { apex: [50, 36], baseL: [26, 70], baseR: [74, 70] },
    { apex: [50, 20], baseL: [35, 46], baseR: [65, 46] },
    { apex: [50, 4], baseL: [42, 26], baseR: [58, 26] },
  ],
}

const MOUNTAIN_TIERS: Record<number, { apex: Pt; baseL: Pt; baseR: Pt }[]> = {
  1: [{ apex: [50, 40], baseL: [20, 76], baseR: [80, 76] }],
  2: [
    { apex: [50, 34], baseL: [15, 78], baseR: [85, 78] },
    { apex: [50, 14], baseL: [32, 50], baseR: [68, 50] },
  ],
  3: [
    { apex: [50, 30], baseL: [12, 80], baseR: [88, 80] },
    { apex: [50, 10], baseL: [28, 52], baseR: [72, 52] },
    { apex: [50, 2], baseL: [38, 26], baseR: [62, 26] },
  ],
}

function Tree({ height }: { height: number }) {
  const tiers = TREE_TIERS[height] ?? TREE_TIERS[1]
  return (
    <g className={styles.piece}>
      <RectTwoTone x={45} y={64} w={10} h={12} light={BROWN.light} dark={BROWN.dark} />
      {tiers.map((t, i) => (
        <TriTwoTone key={i} apex={t.apex} baseL={t.baseL} baseR={t.baseR} light={GREEN.light} dark={GREEN.dark} />
      ))}
    </g>
  )
}

function Mountain({ height }: { height: number }) {
  const tiers = MOUNTAIN_TIERS[height] ?? MOUNTAIN_TIERS[1]
  const top = tiers[tiers.length - 1]
  return (
    <g className={styles.piece}>
      {tiers.map((t, i) => (
        <TriTwoTone key={i} apex={t.apex} baseL={t.baseL} baseR={t.baseR} light={GREY.light} dark={GREY.dark} />
      ))}
      {height === 3 && (
        <polygon
          points={pts([top.apex, [top.apex[0] - 6, top.apex[1] + 12], [top.apex[0] + 6, top.apex[1] + 12]])}
          fill="#f0f2f5"
        />
      )}
    </g>
  )
}

function Building({ fillerColor }: { fillerColor?: string }) {
  const base = fillerColor ? FILLER_TONES[fillerColor] : undefined
  return (
    <g className={styles.piece}>
      {base && <RectTwoTone x={40} y={72} w={20} h={8} light={base.light} dark={base.dark} />}
      <RectTwoTone x={36} y={50} w={28} h={24} light={RED.light} dark={RED.dark} />
      <TriTwoTone apex={[50, 32]} baseL={[30, 52]} baseR={[70, 52]} light={RED.light} dark={RED.dark} />
    </g>
  )
}

function Water() {
  return (
    <g className={styles.piece}>
      <ellipse cx={50} cy={58} rx={34} ry={16} fill={BLUE.dark} />
      <ellipse cx={50} cy={56} rx={30} ry={13} fill={BLUE.light} opacity={0.8} />
      <path d="M22,56 Q50,50 78,56" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" />
      <path d="M26,64 Q50,60 74,64" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" fill="none" />
    </g>
  )
}

function Field() {
  return (
    <g className={styles.piece}>
      <path d="M18,46 Q50,40 82,46" stroke="#8a6a1a" strokeWidth="1.4" fill="none" opacity={0.45} />
      <path d="M18,56 Q50,50 82,56" stroke="#8a6a1a" strokeWidth="1.4" fill="none" opacity={0.45} />
      <path d="M18,66 Q50,60 82,66" stroke="#8a6a1a" strokeWidth="1.4" fill="none" opacity={0.45} />
    </g>
  )
}

function Stump({ tall }: { tall: boolean }) {
  const h = tall ? 14 : 10
  return (
    <g className={styles.piece}>
      <RectTwoTone x={34} y={72 - h} w={32} h={h} light={BROWN.light} dark={BROWN.dark} />
      <ellipse cx={50} cy={72 - h} rx={16} ry={5} fill={BROWN.light} />
    </g>
  )
}

function CubeMarker() {
  return (
    <g className={styles.cubeMarker}>
      <polygon points="50,10 60,20 50,30 40,20" fill={GOLD.light} />
      <polygon points="50,10 60,20 50,20" fill={GOLD.dark} opacity={0.6} />
    </g>
  )
}

interface TokenPieceProps {
  stack: HexStack
  isCubed?: boolean
  className?: string
}

export default function TokenPiece({ stack, isCubed, className = '' }: TokenPieceProps) {
  const top = stack[stack.length - 1]
  if (!top) return null

  let piece: React.ReactNode = null
  if (top === 'green') piece = <Tree height={stack.length} />
  else if (top === 'grey') piece = <Mountain height={stack.length} />
  else if (top === 'red') piece = <Building fillerColor={stack.length > 1 ? stack[0] : undefined} />
  else if (top === 'blue') piece = <Water />
  else if (top === 'yellow') piece = <Field />
  else if (top === 'brown') piece = <Stump tall={stack.length > 1} />

  return (
    <svg viewBox="0 0 100 100" className={`${styles.svg} ${className}`} aria-hidden="true">
      {piece}
      {isCubed && <CubeMarker />}
    </svg>
  )
}
