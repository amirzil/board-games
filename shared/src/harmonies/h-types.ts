// Harmonies rules engine types.
//
// A few numeric/geometric details of the physical game (the exact personal
// board outline, and the precise token-pool counts) could not be verified
// from public sources while building this, so h-data.ts documents those as
// original design choices rather than claims of authenticity. The placement,
// stacking, and scoring RULES below are cross-checked against the published
// rules and are implemented faithfully.

export type TokenColor = 'green' | 'grey' | 'blue' | 'yellow' | 'red' | 'brown'

export interface HexCoord {
  q: number
  r: number
}

export function hexKey(q: number, r: number): string {
  return `${q},${r}`
}

// bottom-to-top
export type HexStack = TokenColor[]

// A habitat pattern cell, relative to an anchor at (0,0). `color: 'any'`
// matches any occupied hex regardless of color; `height`, if given, requires
// that exact stack height (1-3) at the matching color's top token.
export interface HabitatCell {
  dq: number
  dr: number
  color: TokenColor | 'any'
  height?: 1 | 2 | 3
}

export interface AnimalCardDef {
  id: string
  name: string
  habitat: HabitatCell[]
  // Score by cubes-already-placed, e.g. [7,5,3] => 0 cubes scores 7, 1 scores
  // 5, 2 scores 3, 3+ (fully filled) scores 0. Length also caps how many
  // times a card can be matched.
  //
  // NOTE ON RULES AMBIGUITY: the published rule is "you score the topmost
  // space that does not have a cube," which is genuinely ambiguous about
  // whether score decays with each cube placed (this implementation) or
  // stays flat at track[0] until the card is fully filled and only then
  // drops to 0 (the other plausible reading, and the one that would match
  // some players' description of over-completing a card as a "trap"). This
  // was implemented as progressive decay; worth confirming against an
  // actual rulebook if the scoring tension feels off in play.
  track: number[]
}

export interface ClaimedMatch {
  q: number
  r: number
  rotation: number
}

export interface PlayerAnimalCard {
  cardId: string
  cubesPlaced: number
  claimed: ClaimedMatch[]
}

export interface HPlayerState {
  id: string
  name: string
  board: Record<string, HexStack>
  animalCards: PlayerAnimalCard[]
  finalScore: number | null
}

export interface HGameState {
  phase: 'playing' | 'ended'
  players: HPlayerState[]
  currentPlayerIndex: number
  centralBoard: TokenColor[][]
  pouch: TokenColor[]
  animalRow: string[]
  animalDeck: string[]
  pendingTokens: TokenColor[]
  hasDraftedThisTurn: boolean
  finalRound: boolean
  finalRoundTriggeredBy: number | null
  winners: string[]
  log: string[]
}

export type HTakeTokensAction = { type: 'takeTokens'; spaceIndex: number }
export type HPlaceTokenAction = { type: 'placeToken'; color: TokenColor; q: number; r: number }
export type HTakeAnimalCardAction = { type: 'takeAnimalCard'; cardId: string }
export type HPlaceAnimalCubeAction = {
  type: 'placeAnimalCube'
  cardId: string
  anchorQ: number
  anchorR: number
  rotation: number
}
export type HEndTurnAction = { type: 'endTurn' }

export type HAction =
  | HTakeTokensAction
  | HPlaceTokenAction
  | HTakeAnimalCardAction
  | HPlaceAnimalCubeAction
  | HEndTurnAction

export interface HClientToServerEvents {
  h_start_game: () => void
  h_action: (action: HAction) => void
}

export interface HServerToClientEvents {
  h_game_state: (state: HGameState) => void
}
