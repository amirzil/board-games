import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import styles from './ErrorToast.module.css'

export default function ErrorToast() {
  const { error, setError } = useGameStore()

  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(null), 4000)
    return () => clearTimeout(t)
  }, [error, setError])

  return (
    <AnimatePresence>
      {error && (
        <motion.div
          className={styles.toast}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
        >
          {error}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
