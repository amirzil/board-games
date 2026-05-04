import { create } from 'zustand'
import type { SIGameState, SIAction, Land } from '@splendor/shared'
import { applySIAction, SPIRIT_DEFS } from '@splendor/shared'

export const SI_TUTORIAL_PLAYER_ID = 'si-tutorial-player'

export type SITutorialHighlight = 'island' | 'invaders' | 'fear' | 'spirit-panel' | null
export type SITutorialActionType =
  | 'info'
  | 'grow-action'
  | 'play-card-action'
  | 'confirm-action'

export interface SITutorialStep {
  title: string
  message: string
  highlight: SITutorialHighlight
  actionType: SITutorialActionType
}

export const SI_TUTORIAL_STEPS: SITutorialStep[] = [
  {
    title: 'Welcome to Spirit Island',
    message:
      'Spirit Island is a cooperative game. You and your allies are powerful spirits defending a wild island from colonizing invaders. Work together to generate fear and drive them away before the island is consumed by blight.',
    highlight: null,
    actionType: 'info',
  },
  {
    title: 'The Island',
    message:
      'The island is divided into 8 lands, each with a terrain type: 🌿 Jungle, ⛰️ Mountain, 💧 Wetland, or 🏜️ Sands. Each land shows its invader pieces (⚔️ Explorers, 🏘️ Towns, 🏙️ Cities), native 👤 Dahan, and ☠️ Blight tokens. Coastal lands are marked.',
    highlight: 'island',
    actionType: 'info',
  },
  {
    title: 'The Invader Track',
    message:
      'Each turn, the invader AI follows 3 steps: Ravage (invaders attack lands in the Ravage slot, dealing damage and adding Blight), Build (towns and cities multiply in Build slot lands), and Explore (scouts advance into matching terrain). Cards shift left each turn.',
    highlight: 'invaders',
    actionType: 'info',
  },
  {
    title: 'Fear & Victory',
    message:
      'Generate Fear by destroying invader pieces. Fill the Fear track to win! If Blight ever covers the island (☠️ cap reached), or your spirit is destroyed (no presence remaining), the invaders win. Every point of fear matters.',
    highlight: 'fear',
    actionType: 'info',
  },
  {
    title: 'Your Spirit',
    message:
      "Your spirit panel shows your Energy (used to play power cards), Card Plays remaining this turn, and Presence on the island. Each turn you Grow (extend your reach), gain Energy, and play Power Cards to fight invaders or aid the island.",
    highlight: 'spirit-panel',
    actionType: 'info',
  },
  {
    title: 'Grow: Extend Your Reach',
    message:
      'Each turn you must Grow. Click "+ Add Presence" then click a highlighted land to place your presence there. You can only expand to lands adjacent to where you already have presence. Try placing on land A5.',
    highlight: 'island',
    actionType: 'grow-action',
  },
  {
    title: 'Play a Power Card',
    message:
      "Now play a power card. Click 'Charged Storm' (⚡ Fast, cost 1) from your hand — it's already highlighted. Then click land A2 on the island to target it. The card will deal 3 damage to invaders there and generate fear.",
    highlight: 'spirit-panel',
    actionType: 'play-card-action',
  },
  {
    title: 'Confirm Ready',
    message:
      "You've grown and played your card. Click 'Confirm Ready' to end your Spirit Phase. In multiplayer, all spirits confirm before the invader phase runs. Since you're solo, it fires immediately.",
    highlight: 'spirit-panel',
    actionType: 'confirm-action',
  },
  {
    title: 'The Invaders Strike',
    message:
      "Watch what just happened: your Fast power resolved (Charged Storm hit A2), then the Invader Phase ran automatically — Ravage damaged any land in the Ravage slot, Build upgraded invaders, and new Explorers arrived. Check the log for details.",
    highlight: 'invaders',
    actionType: 'info',
  },
  {
    title: "You're Ready!",
    message:
      "That's the core loop: Grow → Play Powers → Confirm → Watch Invaders → Repeat. Use your unique spirit powers wisely to hold back the tide. Good luck defending the island, Spirit!",
    highlight: null,
    actionType: 'info',
  },
]

// ─── Pre-baked tutorial game state ───────────────────────────────────────────

function makeSITutorialState(): SIGameState {
  const lightningDef = SPIRIT_DEFS.find((d) => d.id === 'lightning')!

  const lands: Land[] = [
    { id: 'A1', terrain: 'jungle',   isCoastal: true,  adjacent: ['A2', 'A4'],             explorers: 0, towns: 1, cities: 0, dahan: 1, blight: 0, presence: [] },
    { id: 'A2', terrain: 'sands',    isCoastal: true,  adjacent: ['A1', 'A3', 'A5'],        explorers: 1, towns: 1, cities: 0, dahan: 1, blight: 0, presence: [] },
    { id: 'A3', terrain: 'mountain', isCoastal: true,  adjacent: ['A2', 'A6'],              explorers: 2, towns: 0, cities: 0, dahan: 1, blight: 0, presence: [] },
    { id: 'A4', terrain: 'jungle',   isCoastal: false, adjacent: ['A1', 'A5', 'A7'],        explorers: 0, towns: 0, cities: 0, dahan: 2, blight: 0, presence: ['lightning'] },
    { id: 'A5', terrain: 'wetland',  isCoastal: false, adjacent: ['A2', 'A4', 'A6', 'A8'], explorers: 0, towns: 0, cities: 0, dahan: 1, blight: 0, presence: [] },
    { id: 'A6', terrain: 'mountain', isCoastal: false, adjacent: ['A3', 'A5', 'A8'],        explorers: 0, towns: 0, cities: 0, dahan: 2, blight: 0, presence: [] },
    { id: 'A7', terrain: 'sands',    isCoastal: false, adjacent: ['A4', 'A8'],              explorers: 0, towns: 0, cities: 0, dahan: 1, blight: 0, presence: ['lightning'] },
    { id: 'A8', terrain: 'wetland',  isCoastal: false, adjacent: ['A5', 'A6', 'A7'],        explorers: 0, towns: 0, cities: 0, dahan: 1, blight: 0, presence: [] },
  ]

  return {
    phase: 'spirit',
    turn: 1,
    spirits: [
      {
        id: 'lightning',
        name: lightningDef.name,
        color: lightningDef.color,
        playerId: SI_TUTORIAL_PLAYER_ID,
        presenceLands: ['A4', 'A7'],
        energyTrackRevealed: 0,
        cardPlayRevealed: 0,
        energy: 2,
        cardPlaysUsed: 0,
        hand: [...lightningDef.startingCards],
        discard: [],
        playedThisTurn: [],
        ready: false,
        hasGrown: false,
      },
    ],
    lands,
    invaderDeck: [
      { id: 'tut-inv-1', terrain: 'wetland',  label: 'Wetlands' },
      { id: 'tut-inv-2', terrain: 'jungle',   label: 'Jungle' },
      { id: 'tut-inv-3', terrain: 'mountain', label: 'Mountain' },
    ],
    ravageCard: null,
    buildCard: { id: 'tut-build', terrain: 'mountain', label: 'Mountain' },
    fearPool: 0,
    fearThreshold: 10,
    blight: 0,
    blightCap: 6,
    winner: null,
    log: ['Tutorial started. Invaders are advancing — defend the island!'],
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface SITutorialStore {
  active: boolean
  stepIndex: number
  siGameState: SIGameState | null

  startSITutorial: () => void
  exitSITutorial: () => void
  nextStep: () => void
  applyTutorialAction: (action: SIAction) => void
}

export const useSITutorialStore = create<SITutorialStore>((set, get) => ({
  active: false,
  stepIndex: 0,
  siGameState: null,

  startSITutorial: () =>
    set({ active: true, stepIndex: 0, siGameState: makeSITutorialState() }),

  exitSITutorial: () =>
    set({ active: false, stepIndex: 0, siGameState: null }),

  nextStep: () => {
    const { stepIndex } = get()
    if (stepIndex < SI_TUTORIAL_STEPS.length - 1) {
      set({ stepIndex: stepIndex + 1 })
    }
  },

  applyTutorialAction: (action: SIAction) => {
    const { siGameState, stepIndex } = get()
    if (!siGameState) return

    try {
      const newState = applySIAction(siGameState, SI_TUTORIAL_PLAYER_ID, action)
      const nextStepIndex = stepIndex + 1

      // After confirmReady (step 7 → index 7), the engine auto-resolves everything.
      // The next info step (index 8) explains what happened.
      set({ siGameState: newState, stepIndex: nextStepIndex })
    } catch (err) {
      console.warn('SI tutorial action error:', err)
    }
  },
}))
