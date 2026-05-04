import type { Card, Noble } from './types'

// Tier 1 cards (40 cards)
export const TIER1_CARDS: Card[] = [
  // White (diamond) producers
  { id: 't1-w1', tier: 1, color: 'white', points: 0, cost: { blue: 3 } },
  { id: 't1-w2', tier: 1, color: 'white', points: 0, cost: { red: 2, green: 1 } },
  { id: 't1-w3', tier: 1, color: 'white', points: 0, cost: { red: 2, blue: 2 } },
  { id: 't1-w4', tier: 1, color: 'white', points: 0, cost: { black: 3 } },
  { id: 't1-w5', tier: 1, color: 'white', points: 0, cost: { green: 2, blue: 1 } },
  { id: 't1-w6', tier: 1, color: 'white', points: 0, cost: { green: 1, blue: 1, black: 1, red: 1 } },
  { id: 't1-w7', tier: 1, color: 'white', points: 0, cost: { blue: 1, black: 2 } },
  { id: 't1-w8', tier: 1, color: 'white', points: 1, cost: { green: 4 } },

  // Blue (sapphire) producers
  { id: 't1-b1', tier: 1, color: 'blue', points: 0, cost: { white: 3 } },
  { id: 't1-b2', tier: 1, color: 'blue', points: 0, cost: { green: 2, black: 1 } },
  { id: 't1-b3', tier: 1, color: 'blue', points: 0, cost: { green: 2, red: 2 } },
  { id: 't1-b4', tier: 1, color: 'blue', points: 0, cost: { red: 3 } },
  { id: 't1-b5', tier: 1, color: 'blue', points: 0, cost: { black: 2, white: 1 } },
  { id: 't1-b6', tier: 1, color: 'blue', points: 0, cost: { white: 1, green: 1, black: 1, red: 1 } },
  { id: 't1-b7', tier: 1, color: 'blue', points: 0, cost: { white: 1, red: 2 } },
  { id: 't1-b8', tier: 1, color: 'blue', points: 1, cost: { black: 4 } },

  // Green (emerald) producers
  { id: 't1-g1', tier: 1, color: 'green', points: 0, cost: { blue: 3 } },
  { id: 't1-g2', tier: 1, color: 'green', points: 0, cost: { white: 2, blue: 1 } },
  { id: 't1-g3', tier: 1, color: 'green', points: 0, cost: { white: 1, blue: 1, black: 1, red: 1 } },
  { id: 't1-g4', tier: 1, color: 'green', points: 0, cost: { black: 2, blue: 2 } },
  { id: 't1-g5', tier: 1, color: 'green', points: 0, cost: { black: 3 } },
  { id: 't1-g6', tier: 1, color: 'green', points: 0, cost: { blue: 2, red: 1 } },
  { id: 't1-g7', tier: 1, color: 'green', points: 0, cost: { white: 2, red: 2 } },
  { id: 't1-g8', tier: 1, color: 'green', points: 1, cost: { red: 4 } },

  // Red (ruby) producers
  { id: 't1-r1', tier: 1, color: 'red', points: 0, cost: { green: 3 } },
  { id: 't1-r2', tier: 1, color: 'red', points: 0, cost: { white: 2, green: 1 } },
  { id: 't1-r3', tier: 1, color: 'red', points: 0, cost: { white: 1, green: 1, black: 1, blue: 1 } },
  { id: 't1-r4', tier: 1, color: 'red', points: 0, cost: { blue: 2, green: 2 } },
  { id: 't1-r5', tier: 1, color: 'red', points: 0, cost: { white: 3 } },
  { id: 't1-r6', tier: 1, color: 'red', points: 0, cost: { green: 2, black: 1 } },
  { id: 't1-r7', tier: 1, color: 'red', points: 0, cost: { blue: 2, white: 2 } },
  { id: 't1-r8', tier: 1, color: 'red', points: 1, cost: { white: 4 } },

  // Black (onyx) producers
  { id: 't1-k1', tier: 1, color: 'black', points: 0, cost: { red: 3 } },
  { id: 't1-k2', tier: 1, color: 'black', points: 0, cost: { blue: 2, red: 1 } },
  { id: 't1-k3', tier: 1, color: 'black', points: 0, cost: { white: 1, red: 1, blue: 1, green: 1 } },
  { id: 't1-k4', tier: 1, color: 'black', points: 0, cost: { red: 2, white: 2 } },
  { id: 't1-k5', tier: 1, color: 'black', points: 0, cost: { green: 3 } },
  { id: 't1-k6', tier: 1, color: 'black', points: 0, cost: { red: 2, green: 1 } },
  { id: 't1-k7', tier: 1, color: 'black', points: 0, cost: { white: 2, blue: 2 } },
  { id: 't1-k8', tier: 1, color: 'black', points: 1, cost: { blue: 4 } },
]

// Tier 2 cards (30 cards)
export const TIER2_CARDS: Card[] = [
  // White producers
  { id: 't2-w1', tier: 2, color: 'white', points: 1, cost: { green: 3, blue: 2, black: 2 } },
  { id: 't2-w2', tier: 2, color: 'white', points: 2, cost: { blue: 1, red: 4, black: 2 } },
  { id: 't2-w3', tier: 2, color: 'white', points: 2, cost: { red: 5 } },
  { id: 't2-w4', tier: 2, color: 'white', points: 3, cost: { black: 6 } },
  { id: 't2-w5', tier: 2, color: 'white', points: 1, cost: { red: 2, white: 3, black: 2 } },
  { id: 't2-w6', tier: 2, color: 'white', points: 2, cost: { green: 1, blue: 4, black: 2 } },

  // Blue producers
  { id: 't2-b1', tier: 2, color: 'blue', points: 1, cost: { white: 3, red: 2, black: 2 } },
  { id: 't2-b2', tier: 2, color: 'blue', points: 2, cost: { green: 1, white: 4, black: 2 } },
  { id: 't2-b3', tier: 2, color: 'blue', points: 2, cost: { black: 5 } },
  { id: 't2-b4', tier: 2, color: 'blue', points: 3, cost: { red: 6 } },
  { id: 't2-b5', tier: 2, color: 'blue', points: 1, cost: { white: 2, blue: 2, black: 3 } },
  { id: 't2-b6', tier: 2, color: 'blue', points: 2, cost: { red: 1, black: 4, white: 2 } },

  // Green producers
  { id: 't2-g1', tier: 2, color: 'green', points: 1, cost: { blue: 3, red: 2, white: 2 } },
  { id: 't2-g2', tier: 2, color: 'green', points: 2, cost: { blue: 1, red: 4, white: 2 } },
  { id: 't2-g3', tier: 2, color: 'green', points: 2, cost: { white: 5 } },
  { id: 't2-g4', tier: 2, color: 'green', points: 3, cost: { blue: 6 } },
  { id: 't2-g5', tier: 2, color: 'green', points: 1, cost: { blue: 2, green: 3, red: 2 } },
  { id: 't2-g6', tier: 2, color: 'green', points: 2, cost: { white: 1, green: 4, blue: 2 } },

  // Red producers
  { id: 't2-r1', tier: 2, color: 'red', points: 1, cost: { black: 3, green: 2, blue: 2 } },
  { id: 't2-r2', tier: 2, color: 'red', points: 2, cost: { black: 1, green: 4, blue: 2 } },
  { id: 't2-r3', tier: 2, color: 'red', points: 2, cost: { green: 5 } },
  { id: 't2-r4', tier: 2, color: 'red', points: 3, cost: { white: 6 } },
  { id: 't2-r5', tier: 2, color: 'red', points: 1, cost: { green: 2, black: 3, blue: 2 } },
  { id: 't2-r6', tier: 2, color: 'red', points: 2, cost: { black: 1, blue: 4, green: 2 } },

  // Black producers
  { id: 't2-k1', tier: 2, color: 'black', points: 1, cost: { red: 3, white: 2, green: 2 } },
  { id: 't2-k2', tier: 2, color: 'black', points: 2, cost: { red: 1, white: 4, green: 2 } },
  { id: 't2-k3', tier: 2, color: 'black', points: 2, cost: { red: 5 } },
  { id: 't2-k4', tier: 2, color: 'black', points: 3, cost: { green: 6 } },
  { id: 't2-k5', tier: 2, color: 'black', points: 1, cost: { red: 3, white: 2, blue: 3 } },
  { id: 't2-k6', tier: 2, color: 'black', points: 2, cost: { green: 1, red: 4, white: 2 } },
]

// Tier 3 cards (20 cards)
export const TIER3_CARDS: Card[] = [
  // White producers
  { id: 't3-w1', tier: 3, color: 'white', points: 4, cost: { red: 3, white: 3, blue: 3, black: 5 } },
  { id: 't3-w2', tier: 3, color: 'white', points: 4, cost: { black: 7 } },
  { id: 't3-w3', tier: 3, color: 'white', points: 5, cost: { black: 7, blue: 3 } },
  { id: 't3-w4', tier: 3, color: 'white', points: 3, cost: { black: 3, red: 2, green: 3, white: 5 } },

  // Blue producers
  { id: 't3-b1', tier: 3, color: 'blue', points: 4, cost: { white: 3, blue: 3, green: 3, red: 5 } },
  { id: 't3-b2', tier: 3, color: 'blue', points: 4, cost: { red: 7 } },
  { id: 't3-b3', tier: 3, color: 'blue', points: 5, cost: { red: 7, black: 3 } },
  { id: 't3-b4', tier: 3, color: 'blue', points: 3, cost: { red: 3, white: 2, blue: 5, black: 3 } },

  // Green producers
  { id: 't3-g1', tier: 3, color: 'green', points: 4, cost: { blue: 3, green: 3, red: 3, black: 5 } },
  { id: 't3-g2', tier: 3, color: 'green', points: 4, cost: { black: 7 } },
  { id: 't3-g3', tier: 3, color: 'green', points: 5, cost: { black: 7, red: 3 } },
  { id: 't3-g4', tier: 3, color: 'green', points: 3, cost: { blue: 3, green: 5, red: 2, white: 3 } },

  // Red producers
  { id: 't3-r1', tier: 3, color: 'red', points: 4, cost: { white: 3, blue: 3, green: 5, black: 3 } },
  { id: 't3-r2', tier: 3, color: 'red', points: 4, cost: { green: 7 } },
  { id: 't3-r3', tier: 3, color: 'red', points: 5, cost: { green: 7, white: 3 } },
  { id: 't3-r4', tier: 3, color: 'red', points: 3, cost: { green: 3, blue: 3, white: 5, black: 2 } },

  // Black producers
  { id: 't3-k1', tier: 3, color: 'black', points: 4, cost: { white: 5, blue: 3, green: 3, red: 3 } },
  { id: 't3-k2', tier: 3, color: 'black', points: 4, cost: { white: 7 } },
  { id: 't3-k3', tier: 3, color: 'black', points: 5, cost: { white: 7, green: 3 } },
  { id: 't3-k4', tier: 3, color: 'black', points: 3, cost: { white: 3, blue: 5, green: 3, red: 2 } },
]

export const ALL_CARDS: Card[] = [...TIER1_CARDS, ...TIER2_CARDS, ...TIER3_CARDS]

// 10 Noble tiles
export const NOBLES: Noble[] = [
  { id: 'n1', points: 3, requirement: { red: 4, white: 4 } },
  { id: 'n2', points: 3, requirement: { blue: 4, green: 4 } },
  { id: 'n3', points: 3, requirement: { blue: 4, black: 4 } },
  { id: 'n4', points: 3, requirement: { green: 4, red: 4 } },
  { id: 'n5', points: 3, requirement: { white: 4, blue: 4 } },
  { id: 'n6', points: 3, requirement: { black: 3, red: 3, white: 3 } },
  { id: 'n7', points: 3, requirement: { black: 3, blue: 3, green: 3 } },
  { id: 'n8', points: 3, requirement: { white: 3, blue: 3, red: 3 } },
  { id: 'n9', points: 3, requirement: { green: 3, red: 3, black: 3 } },
  { id: 'n10', points: 3, requirement: { white: 3, green: 3, black: 3 } },
]
