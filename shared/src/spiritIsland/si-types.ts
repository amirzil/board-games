export type Terrain = 'jungle' | 'mountain' | 'wetland' | 'sands'
export type SIElement = 'sun' | 'moon' | 'fire' | 'air' | 'water' | 'earth' | 'plant' | 'animal'
export type PowerSpeed = 'fast' | 'slow'

export interface Land {
  id: string
  terrain: Terrain
  isCoastal: boolean
  adjacent: string[]
  explorers: number
  towns: number
  cities: number
  dahan: number
  blight: number
  presence: string[] // spirit ids with presence here
}

export interface PowerCard {
  id: string
  name: string
  cost: number
  speed: PowerSpeed
  elements: SIElement[]
  description: string
}

export interface SpiritDef {
  id: string
  name: string
  color: string
  startingCards: PowerCard[]
  startingPresenceLands: string[] // land ids for initial placement
  // energy track: index = number of presence revealed, value = energy gained per turn
  energyTrack: number[]
  // card play track: index = number of presence revealed, value = card plays per turn
  cardPlayTrack: number[]
}

export interface SpiritState {
  id: string
  name: string
  color: string
  playerId: string
  presenceLands: string[]
  energyTrackRevealed: number
  cardPlayRevealed: number
  energy: number
  cardPlaysUsed: number
  hand: PowerCard[]
  discard: PowerCard[]
  playedThisTurn: PlayedCard[]
  ready: boolean
  hasGrown: boolean
}

export interface PlayedCard {
  card: PowerCard
  targetLandId: string | null
}

export interface InvaderCard {
  id: string
  terrain: Terrain
  label: string
}

export type SIPhase =
  | 'spirit'
  | 'fast-powers'
  | 'invader'
  | 'slow-powers'
  | 'time-passes'
  | 'ended'

export interface SIGameState {
  phase: SIPhase
  turn: number
  spirits: SpiritState[]
  lands: Land[]
  invaderDeck: InvaderCard[]
  ravageCard: InvaderCard | null
  buildCard: InvaderCard | null
  fearPool: number
  fearThreshold: number
  blight: number
  blightCap: number
  winner: 'spirits' | 'invaders' | null
  log: string[]
}

// Action types (client → server)
export type SIGrowAction =
  | { type: 'grow'; option: 'addPresence'; landId: string }
  | { type: 'grow'; option: 'reclaimAll' }

export type SIPlayCardAction = {
  type: 'playCard'
  cardId: string
  targetLandId: string
}

export type SIConfirmAction = {
  type: 'confirmReady'
}

export type SIAction = SIGrowAction | SIPlayCardAction | SIConfirmAction

// Socket event extensions
export interface SIClientToServerEvents {
  si_start_game: () => void
  si_select_spirit: (spiritId: string) => void
  si_action: (action: SIAction) => void
}

export interface SIServerToClientEvents {
  si_game_state: (state: SIGameState) => void
}
