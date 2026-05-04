import type { Land, PowerCard, SpiritDef, InvaderCard } from './si-types'

// ─── Board A (8 lands) ───────────────────────────────────────────────────────

export const BOARD_A_LANDS: Land[] = [
  { id: 'A1', terrain: 'jungle',   isCoastal: true,  adjacent: ['A2', 'A4'],             explorers: 0, towns: 1, cities: 0, dahan: 1, blight: 0, presence: [] },
  { id: 'A2', terrain: 'sands',    isCoastal: true,  adjacent: ['A1', 'A3', 'A5'],        explorers: 0, towns: 1, cities: 0, dahan: 1, blight: 0, presence: [] },
  { id: 'A3', terrain: 'mountain', isCoastal: true,  adjacent: ['A2', 'A6'],              explorers: 1, towns: 0, cities: 0, dahan: 1, blight: 0, presence: [] },
  { id: 'A4', terrain: 'jungle',   isCoastal: false, adjacent: ['A1', 'A5', 'A7'],        explorers: 0, towns: 0, cities: 0, dahan: 2, blight: 0, presence: [] },
  { id: 'A5', terrain: 'wetland',  isCoastal: false, adjacent: ['A2', 'A4', 'A6', 'A8'], explorers: 0, towns: 0, cities: 0, dahan: 1, blight: 0, presence: [] },
  { id: 'A6', terrain: 'mountain', isCoastal: false, adjacent: ['A3', 'A5', 'A8'],        explorers: 0, towns: 0, cities: 0, dahan: 2, blight: 0, presence: [] },
  { id: 'A7', terrain: 'sands',    isCoastal: false, adjacent: ['A4', 'A8'],              explorers: 0, towns: 0, cities: 0, dahan: 1, blight: 0, presence: [] },
  { id: 'A8', terrain: 'wetland',  isCoastal: false, adjacent: ['A5', 'A6', 'A7'],        explorers: 0, towns: 0, cities: 0, dahan: 1, blight: 0, presence: [] },
]

// ─── Lightning's Swift Strike — power cards ───────────────────────────────────

const LIGHTNING_CARDS: PowerCard[] = [
  {
    id: 'ls-thunderstrike',
    name: 'Thunderstrike',
    cost: 0,
    speed: 'fast',
    elements: ['air'],
    description: '2 damage to invaders in target land.',
  },
  {
    id: 'ls-charged-storm',
    name: 'Charged Storm',
    cost: 1,
    speed: 'fast',
    elements: ['air', 'fire'],
    description: '3 damage to invaders in target land. +1 fear.',
  },
  {
    id: 'ls-raging-lightning',
    name: 'Raging Lightning',
    cost: 2,
    speed: 'slow',
    elements: ['air', 'fire'],
    description: '4 damage to invaders in target land.',
  },
  {
    id: 'ls-flash',
    name: 'Flash of Lightning',
    cost: 0,
    speed: 'fast',
    elements: ['air', 'sun'],
    description: '1 damage to each invader piece in target land. Push 1 explorer to an adjacent land.',
  },
]

// ─── River Surges in Sunlight — power cards ──────────────────────────────────

const RIVER_CARDS: PowerCard[] = [
  {
    id: 'rs-bounty',
    name: "River's Bounty",
    cost: 0,
    speed: 'slow',
    elements: ['water', 'sun'],
    description: 'Add 1 Dahan to target wetland.',
  },
  {
    id: 'rs-wash-away',
    name: 'Wash Away',
    cost: 1,
    speed: 'fast',
    elements: ['water', 'earth'],
    description: 'Push all explorers in target coastal land to an adjacent land.',
  },
  {
    id: 'rs-flash-floods',
    name: 'Flash Floods',
    cost: 2,
    speed: 'fast',
    elements: ['water'],
    description: '2 damage to invaders in target wetland. +1 fear.',
  },
  {
    id: 'rs-boon-of-vigor',
    name: 'Boon of Vigor',
    cost: 0,
    speed: 'fast',
    elements: ['water', 'sun'],
    description: 'A spirit with presence in target land gains 2 energy.',
  },
]

// ─── Spirit definitions ───────────────────────────────────────────────────────

export const SPIRIT_DEFS: SpiritDef[] = [
  {
    id: 'lightning',
    name: "Lightning's Swift Strike",
    color: '#f0c040',
    startingCards: LIGHTNING_CARDS,
    startingPresenceLands: ['A4', 'A7'],
    energyTrack: [1, 2, 3, 3, 4, 4],
    cardPlayTrack: [1, 2, 2, 3, 3, 4],
  },
  {
    id: 'river',
    name: 'River Surges in Sunlight',
    color: '#4a9fd4',
    startingCards: RIVER_CARDS,
    startingPresenceLands: ['A5', 'A8'],
    energyTrack: [1, 1, 2, 2, 3, 4],
    cardPlayTrack: [1, 1, 2, 2, 3, 3],
  },
]

// ─── Invader deck ─────────────────────────────────────────────────────────────
// 9 cards: 3 each of sands/jungle/wetland, 2 mountain (mountains are fewer in base game)
// plus 1 extra to give variety. Shuffled at game start.

export const BASE_INVADER_DECK: InvaderCard[] = [
  { id: 'inv-j1', terrain: 'jungle',   label: 'Jungle' },
  { id: 'inv-j2', terrain: 'jungle',   label: 'Jungle' },
  { id: 'inv-s1', terrain: 'sands',    label: 'Sands' },
  { id: 'inv-s2', terrain: 'sands',    label: 'Sands' },
  { id: 'inv-w1', terrain: 'wetland',  label: 'Wetlands' },
  { id: 'inv-w2', terrain: 'wetland',  label: 'Wetlands' },
  { id: 'inv-m1', terrain: 'mountain', label: 'Mountain' },
  { id: 'inv-m2', terrain: 'mountain', label: 'Mountain' },
  { id: 'inv-j3', terrain: 'jungle',   label: 'Jungle' },
]
