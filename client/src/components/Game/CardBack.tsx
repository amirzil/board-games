import { useId } from 'react'
import styles from './CardBack.module.css'

interface CardBackProps {
  tier: 1 | 2 | 3
  className?: string
}

// Original back design: tier-coded color, a compass-rosette emblem (not the
// publisher's dragon/gem crest), the game's own "Splendor" wordmark already
// used elsewhere in this app, and a tier-count dot row.
const TIER_COLORS: Record<1 | 2 | 3, { bg: string; bg2: string; accent: string }> = {
  1: { bg: '#1f4a30', bg2: '#123320', accent: '#d7c98a' },
  2: { bg: '#7a6a28', bg2: '#4a3d14', accent: '#f0dfa0' },
  3: { bg: '#1d3f66', bg2: '#122844', accent: '#cfe0f2' },
}

export default function CardBack({ tier, className = '' }: CardBackProps) {
  const uid = useId()
  const { bg, bg2, accent } = TIER_COLORS[tier]
  const gradId = `card-back-wash-${uid}`

  return (
    <div className={`${styles.back} ${className}`}>
      <svg viewBox="0 0 100 140" className={styles.art} aria-hidden="true">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={bg} />
            <stop offset="100%" stopColor={bg2} />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="98" height="138" rx="7" fill={`url(#${gradId})`} />
        <rect x="6" y="6" width="88" height="128" rx="4" fill="none" stroke={accent} strokeOpacity="0.4" strokeWidth="1" />

        <g transform="translate(50,58)" stroke={accent} strokeOpacity="0.85" fill="none" strokeWidth="1.4">
          <circle r="19" />
          <rect x="-12" y="-12" width="24" height="24" transform="rotate(45)" />
          <rect x="-12" y="-12" width="24" height="24" />
        </g>
        <circle cx="50" cy="58" r="4.5" fill={accent} />

        <text x="50" y="98" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="10" fontWeight="700" letterSpacing="2" fill={accent}>
          SPLENDOR
        </text>

        {Array.from({ length: tier }).map((_, i) => (
          <circle key={i} cx={50 - (tier - 1) * 5 + i * 10} cy="112" r="2.2" fill={accent} />
        ))}
      </svg>
    </div>
  )
}
