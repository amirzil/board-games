import { useId } from 'react'
import styles from './AnimalIllustration.module.css'

// Original painterly-watercolor vignettes for the Animal Cards — a different
// invented technique from Splendor's vintage-engraving card art, chosen to
// fit Harmonies' nature theme. Each animal is built from simple primitive
// shapes (ellipses/polygons); the "wc" filter pushes every wash through
// turbulence-driven displacement (soft, irregular bleed edges instead of
// crisp vector outlines) plus a masked grain layer (pigment granulation), so
// plain shapes read as loose brushwork. Fine details (eyes, whiskers) render
// unfiltered so the animal stays legible at small sizes.

type Wash = { cx: number; cy: number; rx: number; ry: number; rotate?: number; color: string; opacity?: number }
type Poly = { points: string; color: string; opacity?: number }
type Dot = { cx: number; cy: number; r: number; color: string }
type Line = { d: string; color: string; width: number }

interface AnimalArt {
  washes?: Wash[]
  polys?: Poly[]
  dots?: Dot[]
  lines?: Line[]
}

const ANIMAL_ART: Record<string, AnimalArt> = {
  fox: {
    washes: [
      { cx: 46, cy: 62, rx: 26, ry: 16, rotate: -8, color: '#d9793f' },
      { cx: 68, cy: 44, rx: 13, ry: 12, color: '#d9793f' },
      { cx: 42, cy: 68, rx: 13, ry: 7, color: '#f6ead6', opacity: 0.85 },
      { cx: 22, cy: 60, rx: 14, ry: 8, rotate: 20, color: '#d9793f' },
      { cx: 14, cy: 56, rx: 5, ry: 4, color: '#f6ead6', opacity: 0.9 },
    ],
    polys: [
      { points: '60,34 65,20 70,36', color: '#d9793f' },
      { points: '64,35 67,26 70,36', color: '#3a2a22', opacity: 0.85 },
      { points: '76,36 82,24 84,38', color: '#d9793f' },
      { points: '79,37 82,29 84,38', color: '#3a2a22', opacity: 0.85 },
    ],
    dots: [
      { cx: 78, cy: 42, r: 2.1, color: '#2b2118' },
      { cx: 84, cy: 47, r: 1.6, color: '#2b2118' },
    ],
  },
  owl: {
    washes: [
      { cx: 50, cy: 62, rx: 22, ry: 22, color: '#8b7d6b' },
      { cx: 50, cy: 36, rx: 20, ry: 18, color: '#8b7d6b' },
      { cx: 40, cy: 34, rx: 8, ry: 8, color: '#f3ead2' },
      { cx: 60, cy: 34, rx: 8, ry: 8, color: '#f3ead2' },
    ],
    polys: [
      { points: '46,42 50,50 54,42', color: '#d9a441' },
    ],
    dots: [
      { cx: 40, cy: 35, r: 3.4, color: '#2b2118' },
      { cx: 60, cy: 35, r: 3.4, color: '#2b2118' },
    ],
  },
  heron: {
    washes: [
      { cx: 50, cy: 70, rx: 16, ry: 13, color: '#aebdc4' },
      { cx: 62, cy: 34, rx: 8, ry: 12, rotate: -25, color: '#aebdc4' },
      { cx: 68, cy: 24, rx: 7, ry: 6.5, color: '#aebdc4' },
    ],
    polys: [
      { points: '73,22 88,26 74,29', color: '#e0a94a' },
    ],
    lines: [
      { d: 'M50,83 L48,95', color: '#d9a441', width: 2 },
      { d: 'M55,83 L57,95', color: '#d9a441', width: 2 },
    ],
    dots: [{ cx: 71, cy: 22, r: 1.6, color: '#2b2118' }],
  },
  salmon: {
    washes: [
      { cx: 50, cy: 55, rx: 30, ry: 13, color: '#e8927a' },
      { cx: 46, cy: 50, rx: 20, ry: 6, color: '#f6dcc8', opacity: 0.8 },
    ],
    polys: [
      { points: '78,55 94,45 94,65', color: '#c76a52' },
      { points: '52,44 58,32 62,45', color: '#c76a52' },
    ],
    dots: [{ cx: 26, cy: 51, r: 2.4, color: '#2b2118' }],
  },
  bear: {
    washes: [
      { cx: 50, cy: 64, rx: 27, ry: 20, color: '#6b5644' },
      { cx: 50, cy: 34, rx: 16, ry: 15, color: '#6b5644' },
      { cx: 36, cy: 22, rx: 6, ry: 6, color: '#5a4736' },
      { cx: 64, cy: 22, rx: 6, ry: 6, color: '#5a4736' },
      { cx: 50, cy: 40, rx: 8, ry: 6, color: '#c9a06a' },
    ],
    dots: [
      { cx: 44, cy: 32, r: 2, color: '#2b2118' },
      { cx: 56, cy: 32, r: 2, color: '#2b2118' },
      { cx: 50, cy: 42, r: 2.4, color: '#2b2118' },
    ],
  },
  rabbit: {
    washes: [
      { cx: 50, cy: 68, rx: 20, ry: 15, color: '#d9c9a8' },
      { cx: 50, cy: 44, rx: 13, ry: 12, color: '#d9c9a8' },
      { cx: 38, cy: 18, rx: 5, ry: 16, rotate: -8, color: '#d9c9a8' },
      { cx: 58, cy: 16, rx: 5, ry: 17, rotate: 8, color: '#d9c9a8' },
      { cx: 74, cy: 66, rx: 6, ry: 6, color: '#f6ead6' },
    ],
    polys: [
      { points: '37,6 40,20 34,20', color: '#e8a1a1', opacity: 0.75 },
      { points: '59,4 62,18 56,18', color: '#e8a1a1', opacity: 0.75 },
    ],
    dots: [
      { cx: 45, cy: 42, r: 2, color: '#2b2118' },
      { cx: 56, cy: 42, r: 2, color: '#2b2118' },
    ],
  },
  deer: {
    washes: [
      { cx: 48, cy: 66, rx: 24, ry: 16, color: '#c19a6b' },
      { cx: 68, cy: 40, rx: 12, ry: 11, color: '#c19a6b' },
      { cx: 42, cy: 74, rx: 12, ry: 7, color: '#f0e3cc', opacity: 0.85 },
    ],
    lines: [
      { d: 'M64,30 Q60,14 50,10', color: '#8a6a45', width: 2.2 },
      { d: 'M60,20 L52,16', color: '#8a6a45', width: 1.8 },
      { d: 'M72,30 Q78,14 88,10', color: '#8a6a45', width: 2.2 },
      { d: 'M76,20 L84,16', color: '#8a6a45', width: 1.8 },
    ],
    dots: [
      { cx: 76, cy: 38, r: 2.2, color: '#2b2118' },
      { cx: 82, cy: 44, r: 1.6, color: '#2b2118' },
    ],
  },
  beaver: {
    washes: [
      { cx: 44, cy: 60, rx: 22, ry: 16, color: '#7a5a3a' },
      { cx: 62, cy: 46, rx: 12, ry: 11, color: '#7a5a3a' },
      { cx: 55, cy: 38, rx: 4, ry: 4, color: '#5a4530' },
      { cx: 66, cy: 36, rx: 4, ry: 4, color: '#5a4530' },
    ],
    polys: [
      { points: '18,66 4,58 4,78 18,74', color: '#4a3a2a' },
    ],
    dots: [
      { cx: 68, cy: 46, r: 2.2, color: '#2b2118' },
      { cx: 74, cy: 50, r: 1.6, color: '#2b2118' },
    ],
  },
  hawk: {
    washes: [
      { cx: 48, cy: 58, rx: 16, ry: 20, color: '#9c6b45' },
      { cx: 48, cy: 32, rx: 11, ry: 10, color: '#b98a5a' },
    ],
    polys: [
      { points: '18,50 48,44 20,70', color: '#6b4a2e' },
      { points: '78,50 48,44 76,70', color: '#6b4a2e' },
      { points: '46,34 34,30 46,40', color: '#3a2a22' },
    ],
    dots: [{ cx: 53, cy: 30, r: 2, color: '#2b2118' }],
  },
  squirrel: {
    washes: [
      { cx: 40, cy: 62, rx: 16, ry: 13, color: '#b5673f' },
      { cx: 50, cy: 42, rx: 11, ry: 10, color: '#b5673f' },
      { cx: 66, cy: 40, rx: 15, ry: 18, rotate: 20, color: '#c97a4a' },
      { cx: 72, cy: 22, rx: 12, ry: 14, rotate: 20, color: '#c97a4a' },
      { cx: 38, cy: 68, rx: 8, ry: 5, color: '#f0dcc0', opacity: 0.85 },
    ],
    polys: [
      { points: '44,32 48,22 50,34', color: '#b5673f' },
      { points: '55,32 58,23 60,34', color: '#b5673f' },
    ],
    dots: [
      { cx: 46, cy: 40, r: 2, color: '#2b2118' },
      { cx: 56, cy: 40, r: 2, color: '#2b2118' },
    ],
  },
  otter: {
    washes: [
      { cx: 50, cy: 58, rx: 30, ry: 14, color: '#6b4f38' },
      { cx: 22, cy: 52, rx: 10, ry: 10, color: '#6b4f38' },
      { cx: 50, cy: 62, rx: 20, ry: 6, color: '#c9a97a', opacity: 0.8 },
    ],
    dots: [
      { cx: 18, cy: 49, r: 2.2, color: '#2b2118' },
      { cx: 12, cy: 54, r: 1.6, color: '#2b2118' },
    ],
  },
  toad: {
    washes: [
      { cx: 50, cy: 62, rx: 26, ry: 20, color: '#7a8a5a' },
      { cx: 50, cy: 68, rx: 16, ry: 10, color: '#c9caa0', opacity: 0.85 },
    ],
    polys: [
      { points: '36,42 44,50 30,52', color: '#4a5a3a', opacity: 0.6 },
      { points: '68,44 74,52 60,53', color: '#4a5a3a', opacity: 0.6 },
    ],
    dots: [
      { cx: 36, cy: 40, r: 6, color: '#e8cf6a' },
      { cx: 64, cy: 40, r: 6, color: '#e8cf6a' },
      { cx: 36, cy: 40, r: 2.4, color: '#2b2118' },
      { cx: 64, cy: 40, r: 2.4, color: '#2b2118' },
    ],
    lines: [{ d: 'M40,76 Q50,82 60,76', color: '#2b2118', width: 1.6 }],
  },
  woodpecker: {
    washes: [
      { cx: 50, cy: 62, rx: 15, ry: 20, color: '#2b2118' },
      { cx: 50, cy: 34, rx: 10, ry: 10, color: '#2b2118' },
      { cx: 50, cy: 66, rx: 7, ry: 12, color: '#f3ead2' },
    ],
    polys: [
      { points: '58,30 74,34 58,38', color: '#3a2a22' },
      { points: '46,24 54,18 54,28', color: '#c23b30' },
    ],
    dots: [{ cx: 55, cy: 32, r: 1.8, color: '#f3ead2' }],
  },
  falcon: {
    washes: [
      { cx: 50, cy: 60, rx: 15, ry: 19, color: '#7a8896' },
      { cx: 50, cy: 34, rx: 10, ry: 9, color: '#7a8896' },
      { cx: 50, cy: 64, rx: 7, ry: 12, color: '#d9d2c0' },
    ],
    polys: [
      { points: '38,52 8,40 40,68', color: '#5a6672' },
      { points: '62,52 92,40 60,68', color: '#5a6672' },
      { points: '46,28 38,24 46,34', color: '#3a2a22' },
    ],
    dots: [{ cx: 54, cy: 32, r: 1.8, color: '#2b2118' }],
  },
}

interface AnimalIllustrationProps {
  animalId: string
  className?: string
}

export default function AnimalIllustration({ animalId, className = '' }: AnimalIllustrationProps) {
  const uid = useId()
  const filterId = `wc-${uid}`
  const art = ANIMAL_ART[animalId]

  return (
    <svg viewBox="0 0 100 100" className={`${styles.art} ${className}`} aria-hidden="true">
      <defs>
        <filter id={filterId} x="-40%" y="-40%" width="180%" height="180%">
          <feTurbulence type="fractalNoise" baseFrequency="0.06 0.09" numOctaves="2" seed="4" result="bigNoise" />
          <feDisplacementMap in="SourceGraphic" in2="bigNoise" scale="7" xChannelSelector="R" yChannelSelector="G" result="wobbled" />
          <feGaussianBlur in="wobbled" stdDeviation="0.5" result="soft" />
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="9" result="grainNoise" />
          <feColorMatrix in="grainNoise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 -0.15" result="grainAlpha" />
          <feComposite in="grainAlpha" in2="soft" operator="in" result="grain" />
          <feMerge>
            <feMergeNode in="soft" />
            <feMergeNode in="grain" />
          </feMerge>
        </filter>
      </defs>
      {!art && <ellipse cx={50} cy={55} rx={22} ry={18} fill="#8a9a7a" filter={`url(#${filterId})`} />}
      {art?.washes?.map((w, i) => (
        <ellipse
          key={`w${i}`}
          cx={w.cx}
          cy={w.cy}
          rx={w.rx}
          ry={w.ry}
          fill={w.color}
          opacity={w.opacity ?? 1}
          transform={w.rotate ? `rotate(${w.rotate} ${w.cx} ${w.cy})` : undefined}
          filter={`url(#${filterId})`}
        />
      ))}
      {art?.polys?.map((p, i) => (
        <polygon key={`p${i}`} points={p.points} fill={p.color} opacity={p.opacity ?? 1} filter={`url(#${filterId})`} />
      ))}
      {art?.lines?.map((l, i) => (
        <path key={`l${i}`} d={l.d} stroke={l.color} strokeWidth={l.width} strokeLinecap="round" fill="none" />
      ))}
      {art?.dots?.map((d, i) => (
        <circle key={`d${i}`} cx={d.cx} cy={d.cy} r={d.r} fill={d.color} />
      ))}
    </svg>
  )
}
