import { useId } from 'react'
import styles from './NobleMedallion.module.css'

// A vector medallion — beveled gold ring, recessed disc, and a small
// gem-tipped crown — standing in for the old Unicode crown glyph.
export default function NobleMedallion() {
  const uid = useId()
  const ringGrad = `noble-ring-${uid}`
  const discGrad = `noble-disc-${uid}`

  return (
    <svg viewBox="0 0 100 100" className={styles.medallion} aria-hidden="true">
      <defs>
        <linearGradient id={ringGrad} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f0d896" />
          <stop offset="45%" stopColor="#c9a84c" />
          <stop offset="100%" stopColor="#8b6914" />
        </linearGradient>
        <radialGradient id={discGrad} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#3a2a14" />
          <stop offset="100%" stopColor="#160d05" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="50" r="46" fill={`url(#${ringGrad})`} />
      <circle cx="50" cy="50" r="37" fill={`url(#${discGrad})`} stroke="#0d0700" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="37" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

      <g strokeLinejoin="round">
        <path
          d="M30,68 L30,50 L40,58 L50,36 L60,58 L70,50 L70,68 Z"
          fill={`url(#${ringGrad})`}
          stroke="#5c4310"
          strokeWidth="1"
        />
        <rect x="28" y="66" width="44" height="7" rx="1.5" fill="#a0801f" stroke="#5c4310" strokeWidth="0.8" />
        <circle cx="30" cy="50" r="2.6" fill="#c0392b" />
        <circle cx="50" cy="36" r="3" fill="#3a7bd5" />
        <circle cx="70" cy="50" r="2.6" fill="#c0392b" />
      </g>
    </svg>
  )
}
