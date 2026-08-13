import { useId } from 'react'
import type { NonGoldColor } from '@splendor/shared'
import styles from './CardArt.module.css'

// Original vintage-engraving-style vignettes, not a reproduction of any
// published card art. Tier decides the subject (portrait / trade scene /
// grand architecture, matching the real game's convention), color decides
// the duotone wash, and the card's own id deterministically picks which of
// two variants renders — stable across re-renders, varied across a row.

type Category = 'portrait' | 'trade' | 'architecture'

const CATEGORY_FOR_TIER: Record<1 | 2 | 3, Category> = {
  1: 'portrait',
  2: 'trade',
  3: 'architecture',
}

const PALETTE: Record<NonGoldColor, { bg: string; bg2: string; ink: string }> = {
  white: { bg: '#e8e3d5', bg2: '#c7c0ac', ink: '#5c554a' },
  blue: { bg: '#cfe0ee', bg2: '#9fbcd8', ink: '#22415e' },
  green: { bg: '#dbe8d3', bg2: '#a9c99d', ink: '#2b4a29' },
  red: { bg: '#ecd8cd', bg2: '#d4a893', ink: '#5a2a1e' },
  black: { bg: '#d6d3ce', bg2: '#a19d96', ink: '#1c1c1c' },
}

interface SceneProps {
  variant: number
  ink: string
}

function Portrait({ variant, ink }: SceneProps) {
  if (variant === 0) {
    return (
      <>
        <circle cx="50" cy="31" r="10" fill={ink} />
        <path d="M27,80 Q27,53 41,48 L59,48 Q73,53 73,80 Z" fill={ink} />
      </>
    )
  }
  return (
    <>
      <path d="M50,14 L64,41 Q64,48 50,48 Q36,48 36,41 Z" fill={ink} />
      <circle cx="50" cy="36" r="3.2" fill="rgba(255,255,255,0.32)" />
      <path d="M26,81 Q26,54 40,49 L60,49 Q74,54 74,81 Z" fill={ink} />
    </>
  )
}

function Trade({ variant, ink }: SceneProps) {
  if (variant === 0) {
    return (
      <>
        <rect x="0" y="66" width="100" height="2" fill={ink} opacity="0.5" />
        <path d="M20,70 L80,70 L68,85 L32,85 Z" fill={ink} />
        <rect x="48.8" y="28" width="2.4" height="42" fill={ink} />
        <path d="M50,31 L50,61 L25,61 Z" fill={ink} />
        <path d="M13,44 L21,41 L17,48 Z" fill={ink} opacity="0.55" />
        <path d="M83,37 L91,34 L87,41 Z" fill={ink} opacity="0.55" />
      </>
    )
  }
  return (
    <>
      <rect x="0" y="72" width="100" height="2" fill={ink} opacity="0.5" />
      <path d="M8,85 L8,49 L25,49 L25,85 Z" fill={ink} />
      <path d="M75,85 L75,49 L92,49 L92,85 Z" fill={ink} />
      <path d="M25,85 Q50,32 75,85 Z" fill={ink} />
      <rect x="0" y="82" width="100" height="6" fill={ink} />
    </>
  )
}

function Architecture({ variant, ink }: SceneProps) {
  if (variant === 0) {
    return (
      <>
        <rect x="0" y="83" width="100" height="4" fill={ink} />
        <rect x="30" y="40" width="40" height="43" fill={ink} />
        <path d="M21,40 L30,16 L39,40 Z" fill={ink} />
        <path d="M61,40 L70,16 L79,40 Z" fill={ink} />
        <circle cx="50" cy="53" r="7" fill="rgba(255,255,255,0.28)" />
      </>
    )
  }
  const towers = [
    { x: 6, w: 12, h: 28 },
    { x: 20, w: 9, h: 45 },
    { x: 32, w: 14, h: 22 },
    { x: 49, w: 10, h: 53 },
    { x: 62, w: 13, h: 33 },
    { x: 78, w: 11, h: 19 },
  ]
  return (
    <>
      <rect x="0" y="83" width="100" height="4" fill={ink} />
      {towers.map((t) => (
        <rect key={t.x} x={t.x} y={83 - t.h} width={t.w} height={t.h} fill={ink} />
      ))}
    </>
  )
}

const SCENES: Record<Category, (p: SceneProps) => JSX.Element> = {
  portrait: Portrait,
  trade: Trade,
  architecture: Architecture,
}

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

interface CardArtProps {
  cardId: string
  tier: 1 | 2 | 3
  color: NonGoldColor
  className?: string
}

export default function CardArt({ cardId, tier, color, className = '' }: CardArtProps) {
  const uid = useId()
  const category = CATEGORY_FOR_TIER[tier]
  const variant = hashString(cardId) % 2
  const { bg, bg2, ink } = PALETTE[color]
  const Scene = SCENES[category]
  const gradId = `card-art-wash-${uid}`

  return (
    <svg viewBox="0 0 100 92" preserveAspectRatio="xMidYMid slice" className={`${styles.art} ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={bg} />
          <stop offset="100%" stopColor={bg2} />
        </linearGradient>
      </defs>
      <rect width="100" height="92" fill={`url(#${gradId})`} />
      <Scene variant={variant} ink={ink} />
    </svg>
  )
}
