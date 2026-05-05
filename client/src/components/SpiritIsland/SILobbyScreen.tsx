import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import socket from '../../socket'
import { useGameStore } from '../../store/gameStore'
import { useSITutorialStore } from '../../store/siTutorialStore'
import Button from '../UI/Button'
import styles from './SILobbyScreen.module.css'

export const SPIRITS = [
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

  // Local selection — kept in sync with server via si_select_spirit
  const [selectedSpirit, setSelectedSpirit] = useState<string>(SPIRITS[0].id)

  // When we join a room, emit our initial selection
  useEffect(() => {
    if (room && playerId) {
      const existing = room.spiritSelections?.[playerId]
      if (!existing) {
        socket.emit('si_select_spirit', selectedSpirit)
      } else {
        setSelectedSpirit(existing)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!room])

  const handleSpiritSelect = (spiritId: string) => {
    setSelectedSpirit(spiritId)
    socket.emit('si_select_spirit', spiritId)
  }

  const handleCreate = () => {
    if (!name.trim()) return
    socket.emit('create_room', name.trim())
  }

  const handleJoin = () => {
    if (!name.trim() || !joinCode.trim()) return
    socket.emit('join_room', { code: joinCode.trim().toUpperCase(), name: name.trim() })
  }

  const handleStart = () => {
    socket.emit('si_start_game')
  }

  const isHost = room?.hostId === playerId
  const selections = room?.spiritSelections ?? {}
  const selectedSpirits = Object.values(selections)
  const hasConflict = selectedSpirits.length !== new Set(selectedSpirits).size
  const allSelected = room ? room.players.every((p) => selections[p.id]) : false
  const canStart = allSelected && !hasConflict

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
            {room.players.map((p, i) => {
              const spirit = SPIRITS.find((s) => s.id === selections[p.id])
              return (
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
                  {spirit && (
                    <span className={styles.spiritBadge} style={{ color: spirit.color }}>
                      {spirit.name}
                    </span>
                  )}
                </motion.div>
              )
            })}
          </div>

          <div className={styles.spiritSelect}>
            <p className={styles.spiritLabel}>Choose Your Spirit</p>
            <div className={styles.spiritGrid}>
              {SPIRITS.map((s) => {
                const takenBy = room.players.find(
                  (p) => p.id !== playerId && selections[p.id] === s.id
                )
                return (
                  <button
                    key={s.id}
                    className={`${styles.spiritCard} ${selectedSpirit === s.id ? styles.spiritSelected : ''} ${takenBy ? styles.spiritTaken : ''}`}
                    style={{ '--spirit-color': s.color } as React.CSSProperties}
                    onClick={() => handleSpiritSelect(s.id)}
                    disabled={!!takenBy}
                  >
                    <span className={styles.spiritName}>{s.name}</span>
                    <span className={styles.spiritTagline}>
                      {takenBy ? `Taken by ${takenBy.name}` : s.tagline}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {isHost ? (
            <Button size="lg" onClick={handleStart} disabled={!canStart}>
              Start Game
            </Button>
          ) : (
            <p className={styles.waitingText}>Waiting for host to start...</p>
          )}
          {hasConflict && (
            <p className={styles.conflictText}>Two players have chosen the same spirit</p>
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
