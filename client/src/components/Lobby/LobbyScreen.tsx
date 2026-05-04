import { useState } from 'react'
import { motion } from 'framer-motion'
import socket from '../../socket'
import { useTutorialStore } from '../../store/tutorialStore'
import Button from '../UI/Button'
import styles from './LobbyScreen.module.css'

interface Props {
  onBack?: () => void
}

export default function LobbyScreen({ onBack }: Props) {
  const [name, setName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose')
  const startTutorial = useTutorialStore((s) => s.startTutorial)

  const handleCreate = () => {
    if (!name.trim()) return
    socket.emit('create_room', name.trim())
  }

  const handleJoin = () => {
    if (!name.trim() || !joinCode.trim()) return
    socket.emit('join_room', { code: joinCode.trim().toUpperCase(), name: name.trim() })
  }

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {onBack && (
          <button className={styles.backBtn} onClick={onBack}>
            &#8592; All Games
          </button>
        )}
        <div className={styles.logo}>
          <div className={styles.gems}>
            {['white', 'blue', 'green', 'red', 'black'].map((c) => (
              <div key={c} className={`${styles.gem} ${styles[`gem_${c}`]}`} />
            ))}
          </div>
          <h1 className={styles.title}>Splendor</h1>
          <p className={styles.subtitle}>The Game of Renaissance Merchants</p>
        </div>

        {mode === 'choose' && (
          <motion.div
            className={styles.actions}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button size="lg" onClick={() => setMode('create')}>Create Room</Button>
            <Button size="lg" variant="secondary" onClick={() => setMode('join')}>Join Room</Button>
            <Button size="md" variant="secondary" onClick={startTutorial}>How to Play (Tutorial)</Button>
          </motion.div>
        )}

        {(mode === 'create' || mode === 'join') && (
          <motion.div
            className={styles.form}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={styles.field}>
              <label htmlFor="name">Your Name</label>
              <input
                id="name"
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
                <label htmlFor="code">Room Code</label>
                <input
                  id="code"
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
              <Button size="md" variant="ghost" onClick={() => setMode('choose')}>
                Back
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
