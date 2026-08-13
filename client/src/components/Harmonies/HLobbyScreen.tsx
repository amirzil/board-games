import { useState } from 'react'
import { motion } from 'framer-motion'
import socket from '../../socket'
import { useGameStore } from '../../store/gameStore'
import Button from '../UI/Button'
import styles from './HLobbyScreen.module.css'

interface Props {
  onBack: () => void
}

export default function HLobbyScreen({ onBack }: Props) {
  const { playerId, room } = useGameStore()
  const [name, setName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose')

  const handleCreate = () => {
    if (!name.trim()) return
    socket.emit('create_room', name.trim())
  }

  const handleJoin = () => {
    if (!name.trim() || !joinCode.trim()) return
    socket.emit('join_room', { code: joinCode.trim().toUpperCase(), name: name.trim() })
  }

  const handleStart = () => socket.emit('h_start_game')

  const isHost = room?.hostId === playerId

  if (room) {
    return (
      <div className={styles.container}>
        <motion.div className={styles.card} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
          <h2 className={styles.title}>Harmonies</h2>

          <div className={styles.codeBlock}>
            <span className={styles.codeLabel}>Room Code</span>
            <span className={styles.code}>{room.code}</span>
            <span className={styles.codeHint}>Share this with your friends, or start solo</span>
          </div>

          <div className={styles.playerList}>
            {room.players.map((p, i) => (
              <motion.div key={p.id} className={`${styles.playerRow} ${p.id === playerId ? styles.you : ''}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                <span className={styles.playerDot} />
                <span className={styles.playerName}>{p.name}</span>
                {p.id === room.hostId && <span className={styles.hostBadge}>Host</span>}
                {p.id === playerId && <span className={styles.youBadge}>You</span>}
              </motion.div>
            ))}
          </div>

          {isHost ? (
            <Button size="lg" onClick={handleStart}>Start Game</Button>
          ) : (
            <p className={styles.waitingText}>Waiting for host to start...</p>
          )}
        </motion.div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <motion.div className={styles.card} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
        <button className={styles.backBtn} onClick={onBack}>&#8592; All Games</button>

        <div className={styles.logo}>
          <h1 className={styles.titleLarge}>Harmonies</h1>
          <p className={styles.subtitle}>Compose beautiful landscapes in harmony</p>
        </div>

        {mode === 'choose' && (
          <motion.div className={styles.actions} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Button size="lg" onClick={() => setMode('create')}>Create Room</Button>
            <Button size="lg" variant="secondary" onClick={() => setMode('join')}>Join Room</Button>
          </motion.div>
        )}

        {(mode === 'create' || mode === 'join') && (
          <motion.div className={styles.form} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className={styles.field}>
              <label htmlFor="h-name">Your Name</label>
              <input
                id="h-name"
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
                <label htmlFor="h-code">Room Code</label>
                <input
                  id="h-code"
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
              <Button size="lg" onClick={mode === 'create' ? handleCreate : handleJoin} disabled={!name.trim() || (mode === 'join' && joinCode.length < 4)}>
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
