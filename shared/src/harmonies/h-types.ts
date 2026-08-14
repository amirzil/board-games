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
  // Index into `habitat` marking which cell receives the Animal cube when
  // the pattern is matched (the real card prints this on one specific
  // space of the habitat diagram). All cards in this project's roster use
  // index 0 (the anchor) by convention.
  cubeCellIndex: number
  // Printed card values, highest/best first (index 0 = full-completion
  // reward) down to lowest/first-match reward last, e.g. [7,5,3] for a
  // 3-cube card: your first successful match scores 3, second scores 5,
  // fully completing the card scores 7. Zero matches always scores 0 —
  // per the rule, a card starts with a cube covering every space, and you
  // score whatever the topmost still-cube-free space shows, which is
  // nothing until your first match. Length is also the number of cubes
  // the card starts with (and therefore how many times it can be
  // matched). Score for `matches` successful habitat completions:
  // matches === 0 ? 0 : track[track.length - matches].
  track: number[]
}

export interface PlayerAnimalCard {
  cardId: string
  // Cubes still sitting on the card, not yet moved to the board. Starts at
  // track.length; hits 0 when the card is fully matched (at which point it
  // stops counting against the 4-card limit, per the rule that a completed
  // card is set aside).
  cubesRemainingOnCard: number
}

export interface HPlayerState {
  id: string
  name: string
  board: Record<string, HexStack>
  // Hexes with an Animal cube sitting on them — these can never receive
  // another token (matching "cannot place a token on a space occupied by
  // an Animal cube"), and can never receive a second cube either.
  cubedHexes: string[]
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
  hasTakenCardThisTurn: boolean
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
