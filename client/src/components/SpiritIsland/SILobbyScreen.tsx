import { useState } from 'react'
import { motion } from 'framer-motion'
import socket from '../../socket'
import { useGameStore } from '../../store/gameStore'
import { useSITutorialStore } from '../../store/siTutorialStore'
import Button from '../UI/Button'
import styles from './SILobbyScreen.module.css'

const SPIRITS = [
  { id: 'lightning', name: "Lightning's Swift Strike", tagline: 'Destroy invaders with speed and overwhelming force', color: '#f0c040' },
  { id: 'river',     name: 'River Surges in Sunlight',  tagline: 'Nurture the land and sweep invaders away',       color: '#4a9fd4' },
]

interface Props {
  onBack: () => void
}

export default function SILobbyScreen({ onBack }: Props) {
  const { playerId, room } = useGameStore()
  const { startSITutorial } = useSITutorialStore()
  const [name, setName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose')
  const [selectedSpirit, setSelectedSpirit] = useState<string>(SPIRITS[0].id)

  const handleCreate = () => {
    if (!name.trim()) return
    socket.emit('create_room', name.trim())
  }

  const handleJoin = () => {
    if (!name.trim() || !joinCode.trim()) return
    socket.emit('join_room', { code: joinCode.trim().toUpperCase(), name: name.trim() })
  }

  const handleStart = () => {
    if (!room || !playerId) return
    const assignments: Record<string, string> = {}

    // Assign spirits: host picks their spirit; guest gets the other
    const hostPlayer = room.players.find((p) => p.id === room.hostId)
    const guestPlayers = room.players.filter((p) => p.id !== room.hostId)
    if (hostPlayer) assignments[hostPlayer.id] = selectedSpirit
    const otherSpirit = SPIRITS.find((s) => s.id !== selectedSpirit)?.id ?? SPIRITS[0].id
    for (const g of guestPlayers) {
      assignments[g.id] = otherSpirit
    }

    socket.emit('si_start_game', assignments)
  }

  const isHost = room?.hostId === playerId
  const canStart = (room?.players.length ?? 0) >= 1

  // If in a room, show waiting room / start screen
  if (room) {
    return (
      <div className={styles.container}>
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <button className={styles.backBtn} onClick={onBack}>&#8592; All Games</button>
          <h2 className={styles.title}>Spirit Island</h2>

          <div className={styles.codeBlock}>
            <span className={styles.codeLabel}>Room Code</span>
            <span className={styles.code}>{room.code}</span>
          </div>

          <div className={styles.playerList}>
            {room.players.map((p, i) => (
              <motion.div
                key={p.id}
                className={`${styles.playerRow} ${p.id === playerId ? styles.you : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <span className={styles.playerDot} />
                <span className={styles.playerName}>{p.name}</span>
                {p.id === room.hostId && <span className={styles.hostBadge}>Host</span>}
                {p.id === playerId && <span className={styles.youBadge}>You</span>}
              </motion.div>
            ))}
          </div>

          {isHost && (
            <div className={styles.spiritSelect}>
              <p className={styles.spiritLabel}>Your Spirit</p>
              <div className={styles.spiritGrid}>
                {SPIRITS.map((s) => (
                  <button
                    key={s.id}
                    className={`${styles.spiritCard} ${selectedSpirit === s.id ? styles.spiritSelected : ''}`}
                    style={{ '--spirit-color': s.color } as React.CSSProperties}
                    onClick={() => setSelectedSpirit(s.id)}
                  >
                    <span className={styles.spiritName}>{s.name}</span>
                    <span className={styles.spiritTagline}>{s.tagline}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isHost ? (
            <Button size="lg" onClick={handleStart} disabled={!canStart}>
              Start Game
            </Button>
          ) : (
            <p className={styles.waitingText}>Waiting for host to start...</p>
          )}
        </motion.div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <button className={styles.backBtn} onClick={onBack}>&#8592; All Games</button>

        <div className={styles.logo}>
          <div className={styles.spiritIcon}>🌿</div>
          <h1 className={styles.titleLarge}>Spirit Island</h1>
          <p className={styles.subtitle}>Defend your island as powerful spirits</p>
        </div>

        {mode === 'choose' && (
          <motion.div className={styles.actions} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Button size="lg" onClick={() => setMode('create')}>Create Room</Button>
            <Button size="lg" variant="secondary" onClick={() => setMode('join')}>Join Room</Button>
            <Button size="md" variant="secondary" onClick={startSITutorial}>How to Play (Tutorial)</Button>
          </motion.div>
        )}

        {(mode === 'create' || mode === 'join') && (
          <motion.div className={styles.form} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className={styles.field}>
              <label htmlFor="si-name">Your Name</label>
              <input
                id="si-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                maxLength={20}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (mode === 'create') handleCreate()
                    else if (joinCode) handleJoin()
                  }
                }}
              />
            </div>

            {mode === 'join' && (
              <div className={styles.field}>
                <label htmlFor="si-code">Room Code</label>
                <input
                  id="si-code"
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ABCD"
                  maxLength={4}
                  className={styles.codeInput}
                  onKeyDown={(e) => e.key === 'Enter' && name && joinCode && handleJoin()}
                />
              </div>
            )}

            <div className={styles.formActions}>
              <Button
                size="lg"
                onClick={mode === 'create' ? handleCreate : handleJoin}
                disabled={!name.trim() || (mode === 'join' && joinCode.length < 4)}
              >
                {mode === 'create' ? 'Create Room' : 'Join Room'}
              </Button>
              <Button size="md" variant="ghost" onClick={() => setMode('choose')}>Back</Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
