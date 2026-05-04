import { create } from 'zustand'
import type { GameState, GameAction, NonGoldColor, Card } from '@splendor/shared'
import { applyAction, TIER1_CARDS, TIER2_CARDS, TIER3_CARDS, NOBLES } from '@splendor/shared'

export const TUTORIAL_PLAYER_ID = 'tutorial-player'
const BOT_ID = 'tutorial-bot'

// Curated easy card guaranteed buyable with {white:1, blue:1, green:1}
const EASY_CARD: Card = {
  id: 'tut-easy',
  tier: 1,
  color: 'green',
  points: 0,
  cost: { white: 1, blue: 1, green: 1 },
}

export type TutorialHighlight = 'gems' | 'tier1' | 'nobles' | null

export type TutorialActionType = 'info' | 'gems-action' | 'buy-action' | 'reserve-action'

export interface TutorialStepConfig {
  title: string
  message: string
  highlight: TutorialHighlight
  actionType: TutorialActionType
}

export const TUTORIAL_STEPS: TutorialStepConfig[] = [
  {
    title: 'Welcome to Splendor',
    message:
      'You are a Renaissance gem merchant competing to earn the most prestige points. Collect gems, buy development cards, and attract noble patrons. The first player to reach 15 points triggers the final round!',
    highlight: null,
    actionType: 'info',
  },
  {
    title: 'The Gem Bank',
    message:
      'The Gem Bank holds five colored tokens and gold wildcards. Each turn you may take up to 3 different colored gems, or 2 of the same color if at least 4 remain in the bank.',
    highlight: 'gems',
    actionType: 'info',
  },
  {
    title: 'Take Some Gems',
    message:
      'Your turn! Click gem tokens to select them, then click Confirm. Try taking one white, one blue, and one green gem.',
    highlight: 'gems',
    actionType: 'gems-action',
  },
  {
    title: 'Development Cards',
    message:
      'Development cards cost gems to purchase. Once bought, each card permanently produces one gem of its color — reducing the cost of all future purchases. Tier I cards are cheapest; Tier III are most powerful.',
    highlight: 'tier1',
    actionType: 'info',
  },
  {
    title: 'Buy a Card',
    message:
      'Hover over the glowing Tier I card and click Buy to purchase it. It costs one white, one blue, and one green gem — exactly what you took!',
    highlight: 'tier1',
    actionType: 'buy-action',
  },
  {
    title: 'Reserve a Card',
    message:
      'You can Reserve any card to secure it before other players take it. You also receive a Gold wildcard token usable as any color. Hover a Tier I card and click Reserve.',
    highlight: 'tier1',
    actionType: 'reserve-action',
  },
  {
    title: 'Noble Patrons',
    message:
      'Nobles automatically visit you when your purchased cards match their gem color requirements — no action needed. Each noble is worth 3 prestige points!',
    highlight: 'nobles',
    actionType: 'info',
  },
  {
    title: "Ready to Play!",
    message:
      "Once any player reaches 15 prestige points, everyone gets one final turn. The player with the most points wins! You're ready — good luck, merchant!",
    highlight: null,
    actionType: 'info',
  },
]

interface PendingGems {
  gems: Partial<Record<NonGoldColor, number>>
  count: number
}

function makeTutorialState(): GameState {
  const otherTier1 = TIER1_CARDS.slice(0, 3)
  const tier1Deck = TIER1_CARDS.slice(3)

  return {
    phase: 'playing',
    players: [
      {
        id: TUTORIAL_PLAYER_ID,
        name: 'You',
        gems: { white: 0, blue: 0, green: 0, red: 0, black: 0, gold: 0 },
        cards: [],
        reserved: [],
        nobles: [],
        points: 0,
      },
      {
        id: BOT_ID,
        name: 'Merchant',
        gems: { white: 0, blue: 0, green: 0, red: 0, black: 0, gold: 0 },
        cards: [],
        reserved: [],
        nobles: [],
        points: 0,
      },
    ],
    currentPlayerIndex: 0,
    board: {
      tier1: {
        visible: [EASY_CARD, ...otherTier1] as (Card | null)[],
        deck: tier1Deck,
      },
      tier2: {
        visible: TIER2_CARDS.slice(0, 4) as (Card | null)[],
        deck: TIER2_CARDS.slice(4),
      },
      tier3: {
        visible: TIER3_CARDS.slice(0, 4) as (Card | null)[],
        deck: TIER3_CARDS.slice(4),
      },
      nobles: NOBLES.slice(0, 3),
      gems: { white: 4, blue: 4, green: 4, red: 4, black: 4, gold: 5 },
    },
    winner: null,
    round: 1,
    lastRound: false,
    lastRoundStartedBy: null,
  }
}

function autoBotAction(state: GameState): GameState {
  // Bot tries to take 3 gems; falls back to fewer if the bank is low
  const attempts: Partial<Record<NonGoldColor, number>>[] = [
    { red: 1, black: 1, white: 1 },
    { red: 1, black: 1 },
    { red: 1 },
  ]
  for (const gems of attempts) {
    try {
      return applyAction(state, BOT_ID, { type: 'takeGems', gems })
    } catch {
      // try next option
    }
  }
  return state
}

// After the player takes gems, ensure they have at least {white:1, blue:1, green:1}
// so they can always buy the easy card in the buy-action step.
function patchGemsForBuy(state: GameState): GameState {
  const playerIdx = state.players.findIndex((p) => p.id === TUTORIAL_PLAYER_ID)
  const player = state.players[playerIdx]
  const need: Partial<Record<NonGoldColor, number>> = { white: 1, blue: 1, green: 1 }
  const patchedGems = { ...player.gems }
  const bankGems = { ...state.board.gems }

  for (const [color, required] of Object.entries(need) as [NonGoldColor, number][]) {
    if (patchedGems[color] < required) {
      const add = required - patchedGems[color]
      patchedGems[color] = required
      bankGems[color] = Math.max(0, bankGems[color] - add)
    }
  }

  const newPlayers = [...state.players]
  newPlayers[playerIdx] = { ...player, gems: patchedGems }
  return { ...state, players: newPlayers, board: { ...state.board, gems: bankGems } }
}

interface TutorialStore {
  active: boolean
  stepIndex: number
  gameState: GameState | null
  pendingGems: PendingGems

  startTutorial: () => void
  exitTutorial: () => void
  nextStep: () => void
  applyTutorialAction: (action: GameAction) => void
  addPendingGem: (color: NonGoldColor) => void
  clearPendingGems: () => void
}

export const useTutorialStore = create<TutorialStore>((set, get) => ({
  active: false,
  stepIndex: 0,
  gameState: null,
  pendingGems: { gems: {}, count: 0 },

  startTutorial: () => {
    set({
      active: true,
      stepIndex: 0,
      gameState: makeTutorialState(),
      pendingGems: { gems: {}, count: 0 },
    })
  },

  exitTutorial: () => {
    set({ active: false, stepIndex: 0, gameState: null, pendingGems: { gems: {}, count: 0 } })
  },

  nextStep: () => {
    const { stepIndex } = get()
    if (stepIndex < TUTORIAL_STEPS.length - 1) {
      set({ stepIndex: stepIndex + 1 })
    }
  },

  applyTutorialAction: (action: GameAction) => {
    const { gameState, stepIndex } = get()
    if (!gameState) return

    const currentStep = TUTORIAL_STEPS[stepIndex]

    try {
      let newState = applyAction(gameState, TUTORIAL_PLAYER_ID, action)

      // After gems-action, patch so the easy card is always buyable
      if (currentStep.actionType === 'gems-action') {
        newState = patchGemsForBuy(newState)
      }

      // Auto-play the bot if it's now the bot's turn
      if (newState.players[newState.currentPlayerIndex]?.id === BOT_ID) {
        newState = autoBotAction(newState)
      }

      set({
        gameState: newState,
        stepIndex: stepIndex + 1,
        pendingGems: { gems: {}, count: 0 },
      })
    } catch (err) {
      console.warn('Tutorial action error:', err)
    }
  },

  addPendingGem: (color: NonGoldColor) => {
    const { pendingGems } = get()
    set({
      pendingGems: {
        gems: { ...pendingGems.gems, [color]: (pendingGems.gems[color] ?? 0) + 1 },
        count: pendingGems.count + 1,
      },
    })
  },

  clearPendingGems: () => set({ pendingGems: { gems: {}, count: 0 } }),
}))
