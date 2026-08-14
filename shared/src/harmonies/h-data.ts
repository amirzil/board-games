import type { AnimalCardDef, HexCoord, TokenColor } from './h-types'

export const AXIAL_DIRECTIONS: HexCoord[] = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
]

// --- Personal board shape -------------------------------------------------
// The real game's exact personal-board outline still couldn't be verified
// from available sources. This is a revised original layout: a radius-2
// hexagon core (19 cells) with each of the 6 corners rounded out by a small
// fan of cells one ring further out, rather than a plain hexagon-of-hexagons
// (whose corners come to a single-cell point and read as "cut off" compared
// to the rounder outline of the real board). The engine only depends on
// this being *some* list of axial coordinates, so the exact shape can be
// revised again later without touching h-engine.ts.
export const PERSONAL_BOARD_CELLS: HexCoord[] = (() => {
  const N = 2
  const cells = new Map<string, HexCoord>()
  const add = (c: HexCoord) => cells.set(`${c.q},${c.r}`, c)

  for (let q = -N; q <= N; q++) {
    const rMin = Math.max(-N, -q - N)
    const rMax = Math.min(N, -q + N)
    for (let r = rMin; r <= rMax; r++) add({ q, r })
  }

  for (let i = 0; i < 6; i++) {
    const dir = AXIAL_DIRECTIONS[i]
    const prevDir = AXIAL_DIRECTIONS[(i + 5) % 6]
    const nextDir = AXIAL_DIRECTIONS[(i + 1) % 6]
    const corner = { q: dir.q * N, r: dir.r * N }
    add({ q: corner.q + dir.q, r: corner.r + dir.r })
    add({ q: corner.q + prevDir.q, r: corner.r + prevDir.r })
    add({ q: corner.q + nextDir.q, r: corner.r + nextDir.r })
  }

  return Array.from(cells.values())
})()

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
    cubeCellIndex: 0,
    track: [7, 5, 3],
  },
  {
    id: 'owl',
    name: 'Owl',
    habitat: [
      { dq: 0, dr: 0, color: 'green', height: 3 },
      { dq: 1, dr: 0, color: 'green' },
    ],
    cubeCellIndex: 0,
    track: [9, 6, 3],
  },
  {
    id: 'heron',
    name: 'Heron',
    habitat: [
      { dq: 0, dr: 0, color: 'blue' },
      { dq: 1, dr: 0, color: 'yellow' },
    ],
    cubeCellIndex: 0,
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
    cubeCellIndex: 0,
    track: [8, 5, 2],
  },
  {
    id: 'bear',
    name: 'Bear',
    habitat: [{ dq: 0, dr: 0, color: 'grey', height: 3 }],
    cubeCellIndex: 0,
    track: [6, 4, 2],
  },
  {
    id: 'rabbit',
    name: 'Rabbit',
    habitat: [
      { dq: 0, dr: 0, color: 'yellow' },
      { dq: 1, dr: 0, color: 'yellow' },
    ],
    cubeCellIndex: 0,
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
    cubeCellIndex: 0,
    track: [7, 4, 2],
  },
  {
    id: 'beaver',
    name: 'Beaver',
    habitat: [
      { dq: 0, dr: 0, color: 'red' },
      { dq: 1, dr: 0, color: 'blue' },
    ],
    cubeCellIndex: 0,
    track: [5, 3, 1],
  },
  {
    id: 'hawk',
    name: 'Hawk',
    habitat: [
      { dq: 0, dr: 0, color: 'grey', height: 2 },
      { dq: 1, dr: 0, color: 'grey', height: 2 },
    ],
    cubeCellIndex: 0,
    track: [8, 5, 2],
  },
  {
    id: 'squirrel',
    name: 'Squirrel',
    habitat: [
      { dq: 0, dr: 0, color: 'green', height: 2 },
      { dq: 1, dr: 0, color: 'green', height: 1 },
    ],
    cubeCellIndex: 0,
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
    cubeCellIndex: 0,
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
    cubeCellIndex: 0,
    track: [8, 5, 2],
  },
  {
    id: 'woodpecker',
    name: 'Woodpecker',
    habitat: [
      { dq: 0, dr: 0, color: 'green', height: 1 },
      { dq: 1, dr: 0, color: 'green', height: 3 },
    ],
    cubeCellIndex: 0,
    track: [7, 4, 2],
  },
  {
    id: 'falcon',
    name: 'Falcon',
    habitat: [
      { dq: 0, dr: 0, color: 'grey', height: 3 },
      { dq: 1, dr: 0, color: 'grey', height: 3 },
    ],
    cubeCellIndex: 0,
    track: [10, 6, 3],
  },
]
