import { motion, AnimatePresence } from 'framer-motion'
import { useSITutorialStore, SI_TUTORIAL_STEPS } from '../../store/siTutorialStore'
import styles from './SITutorialOverlay.module.css'

export default function SITutorialOverlay() {
  const { stepIndex, nextStep, exitSITutorial } = useSITutorialStore()
  const step = SI_TUTORIAL_STEPS[stepIndex]
  const isLastStep = stepIndex === SI_TUTORIAL_STEPS.length - 1
  const isInfoStep = step.actionType === 'info'

  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">
        <motion.div
          key={stepIndex}
          className={styles.panel}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div className={styles.header}>
            <div className={styles.progress}>
              {SI_TUTORIAL_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`${styles.dot} ${i === stepIndex ? styles.dotActive : i < stepIndex ? styles.dotDone : ''}`}
                />
              ))}
            </div>
            <span className={styles.stepCount}>{stepIndex + 1} / {SI_TUTORIAL_STEPS.length}</span>
            <button className={styles.skipBtn} onClick={exitSITutorial}>
              Skip
            </button>
          </div>

          <h2 className={styles.title}>{step.title}</h2>
          <p className={styles.message}>{step.message}</p>

          <div className={styles.footer}>
            {isInfoStep ? (
              <motion.button
                className={styles.nextBtn}
                onClick={isLastStep ? exitSITutorial : nextStep}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {isLastStep ? 'Start Playing' : 'Next →'}
              </motion.button>
            ) : (
              <motion.span
                className={styles.actionHint}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ↑ Perform the highlighted action to continue
              </motion.span>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
