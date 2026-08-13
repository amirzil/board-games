import type { AnimalCardDef, HexCoord, TokenColor } from './h-types'

// --- Personal board shape -------------------------------------------------
// The real game's exact personal-board outline couldn't be verified from
// available sources, so this is an original radius-2 hex layout (19 cells)
// rather than a traced replica. The engine only depends on this being *some*
// list of axial coordinates, so the shape can be reworked freely later (e.g.
// for Phase 2's visual pass) without touching h-engine.ts.
export const PERSONAL_BOARD_CELLS: HexCoord[] = (() => {
  const cells: HexCoord[] = []
  const N = 2
  for (let q = -N; q <= N; q++) {
    const rMin = Math.max(-N, -q - N)
    const rMax = Math.min(N, -q + N)
    for (let r = rMin; r <= rMax; r++) cells.push({ q, r })
  }
  return cells
})()

export const AXIAL_DIRECTIONS: HexCoord[] = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
]

// --- Token pool ------------------------------------------------------------
// Exact physical token counts also couldn't be verified; this distribution
// is an original assumption sized for a full 4-player game.
export const TOKEN_POOL: Record<TokenColor, number> = {
  green: 20,
  grey: 20,
  blue: 20,
  yellow: 20,
  red: 20,
  brown: 16,
}

export const CENTRAL_BOARD_SPACES = 5
export const TOKENS_PER_SPACE = 3
export const MAX_ANIMAL_CARDS_HELD = 4
export const ANIMAL_ROW_SIZE = 5

// --- Animal cards ------------------------------------------------------------
// An original starter roster (habitat patterns, names, and scoring tracks
// are invented for this project) rather than the published game's card set,
// which isn't available to reproduce. Sized to be playable now; easy to
// extend with more cards later since the engine just reads this list.
export const ANIMAL_CARDS: AnimalCardDef[] = [
  {
    id: 'fox',
    name: 'Fox',
    habitat: [
      { dq: 0, dr: 0, color: 'red' },
      { dq: 1, dr: 0, color: 'yellow' },
      { dq: 0, dr: 1, color: 'yellow' },
    ],
    track: [7, 5, 3],
  },
  {
    id: 'owl',
    name: 'Owl',
    habitat: [
      { dq: 0, dr: 0, color: 'green', height: 3 },
      { dq: 1, dr: 0, color: 'green' },
    ],
    track: [9, 6, 3],
  },
  {
    id: 'heron',
    name: 'Heron',
    habitat: [
      { dq: 0, dr: 0, color: 'blue' },
      { dq: 1, dr: 0, color: 'yellow' },
    ],
    track: [5, 3, 1],
  },
  {
    id: 'salmon',
    name: 'Salmon',
    habitat: [
      { dq: 0, dr: 0, color: 'blue' },
      { dq: 1, dr: 0, color: 'blue' },
      { dq: 2, dr: 0, color: 'blue' },
    ],
    track: [8, 5, 2],
  },
  {
    id: 'bear',
    name: 'Bear',
    habitat: [{ dq: 0, dr: 0, color: 'grey', height: 3 }],
    track: [6, 4, 2],
  },
  {
    id: 'rabbit',
    name: 'Rabbit',
    habitat: [
      { dq: 0, dr: 0, color: 'yellow' },
      { dq: 1, dr: 0, color: 'yellow' },
    ],
    track: [4, 2, 1],
  },
  {
    id: 'deer',
    name: 'Deer',
    habitat: [
      { dq: 0, dr: 0, color: 'green' },
      { dq: 1, dr: 0, color: 'green' },
      { dq: 0, dr: 1, color: 'green' },
    ],
    track: [7, 4, 2],
  },
  {
    id: 'beaver',
    name: 'Beaver',
    habitat: [
      { dq: 0, dr: 0, color: 'red' },
      { dq: 1, dr: 0, color: 'blue' },
    ],
    track: [5, 3, 1],
  },
  {
    id: 'hawk',
    name: 'Hawk',
    habitat: [
      { dq: 0, dr: 0, color: 'grey', height: 2 },
      { dq: 1, dr: 0, color: 'grey', height: 2 },
    ],
    track: [8, 5, 2],
  },
  {
    id: 'squirrel',
    name: 'Squirrel',
    habitat: [
      { dq: 0, dr: 0, color: 'green', height: 2 },
      { dq: 1, dr: 0, color: 'green', height: 1 },
    ],
    track: [6, 4, 2],
  },
  {
    id: 'otter',
    name: 'Otter',
    habitat: [
      { dq: 0, dr: 0, color: 'blue' },
      { dq: 1, dr: 0, color: 'blue' },
      { dq: 1, dr: -1, color: 'red' },
    ],
    track: [9, 6, 3],
  },
  {
    id: 'toad',
    name: 'Toad',
    habitat: [
      { dq: 0, dr: 0, color: 'blue' },
      { dq: 1, dr: 0, color: 'yellow' },
      { dq: 0, dr: 1, color: 'green' },
    ],
    track: [8, 5, 2],
  },
  {
    id: 'woodpecker',
    name: 'Woodpecker',
    habitat: [
      { dq: 0, dr: 0, color: 'green', height: 1 },
      { dq: 1, dr: 0, color: 'green', height: 3 },
    ],
    track: [7, 4, 2],
  },
  {
    id: 'falcon',
    name: 'Falcon',
    habitat: [
      { dq: 0, dr: 0, color: 'grey', height: 3 },
      { dq: 1, dr: 0, color: 'grey', height: 3 },
    ],
    track: [10, 6, 3],
  },
]
