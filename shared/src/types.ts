export type GemColor = 'white' | 'blue' | 'green' | 'red' | 'black' | 'gold'
export type NonGoldColor = Exclude<GemColor, 'gold'>

export type Gems = Record<GemColor, number>

export interface Card {
  id: string
  tier: 1 | 2 | 3
  color: NonGoldColor
  points: number
  cost: Partial<Record<NonGoldColor, number>>
}

export interface Noble {
  id: string
  points: number
  requirement: Partial<Record<NonGoldColor, number>>
}

export interface Player {
  id: string
  name: string
  gems: Gems
  cards: Card[]
  reserved: Card[]
  nobles: Noble[]
  points: number
}

export interface TierState {
  deck: Card[]
  visible: (Card | null)[]
}

export interface BoardState {
  tier1: TierState
  tier2: TierState
  tier3: TierState
  nobles: Noble[]
  gems: Gems
}

export interface GameState {
  phase: 'lobby' | 'playing' | 'ended'
  players: Player[]
  currentPlayerIndex: number
  board: BoardState
  winner: string | null
  round: number
  lastRound: boolean
  lastRoundStartedBy: string | null
}

export interface RoomInfo {
  code: string
  hostId: string
  players: { id: string; name: string }[]
}

// Actions
export type TakeGemsAction = {
  type: 'takeGems'
  gems: Partial<Record<NonGoldColor, number>>
}

export type BuyCardAction = {
  type: 'buyCard'
  cardId: string
  fromReserved: boolean
}

export type ReserveCardAction = {
  type: 'reserveCard'
  cardId: string
  tier?: 1 | 2 | 3
}

export type GameAction = TakeGemsAction | BuyCardAction | ReserveCardAction

// Socket events
export interface ServerToClientEvents {
  room_update: (room: RoomInfo) => void
  game_state: (state: GameState) => void
  error: (message: string) => void
  player_id: (id: string) => void
}

export interface ClientToServerEvents {
  create_room: (name: string) => void
  join_room: (data: { code: string; name: string }) => void
  start_game: () => void
  game_action: (action: GameAction) => void
}
