import {
  ANIMAL_CARDS,
  ANIMAL_ROW_SIZE,
  AXIAL_DIRECTIONS,
  CENTRAL_BOARD_SPACES,
  MAX_ANIMAL_CARDS_HELD,
  PERSONAL_BOARD_CELLS,
  TOKENS_PER_SPACE,
  TOKEN_POOL,
} from './h-data'
import { hexKey } from './h-types'
import type {
  AnimalCardDef,
  HAction,
  HGameState,
  HPlayerState,
  HexCoord,
  HexStack,
  TokenColor,
} from './h-types'

const TREE_MOUNTAIN_POINTS: Record<number, number> = { 1: 1, 2: 3, 3: 7 }
const BOARD_CELL_SET = new Set(PERSONAL_BOARD_CELLS.map((c) => hexKey(c.q, c.r)))
const CARDS_BY_ID = new Map(ANIMAL_CARDS.map((c) => [c.id, c]))

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildPouch(): TokenColor[] {
  const tokens: TokenColor[] = []
  for (const [color, count] of Object.entries(TOKEN_POOL) as [TokenColor, number][]) {
    for (let i = 0; i < count; i++) tokens.push(color)
  }
  return shuffle(tokens)
}

function topOf(stack: HexStack): TokenColor | undefined {
  return stack[stack.length - 1]
}

// Placement legality per color. Blue/yellow are single-layer and terminal.
// Grey stacks only on grey (mountains, height <= 3). Green caps 0-2 brown
// (trees, height <= 3). Red caps 0-1 of {grey, brown, red} (buildings,
// height <= 2). Brown is filler: stacks on empty/brown/grey, capped at
// height 2 so a following green can still reach a height-3 tree.
// (Brown-on-grey specifically is a documented interpretation — public rules
// summaries were ambiguous on this exact interaction.)
function canPlaceColor(color: TokenColor, stack: HexStack): boolean {
  const top = topOf(stack)
  const height = stack.length
  switch (color) {
    case 'blue':
    case 'yellow':
      return height === 0
    case 'grey':
      return (top === undefined || top === 'grey') && height < 3
    case 'green':
      return (top === undefined || top === 'brown') && height < 3
    case 'red':
      return (top === undefined || top === 'grey' || top === 'brown' || top === 'red') && height < 2
    case 'brown':
      return (top === undefined || top === 'brown' || top === 'grey') && height < 2
    default:
      return false
  }
}

function neighborsOf(q: number, r: number): HexCoord[] {
  return AXIAL_DIRECTIONS.map((d) => ({ q: q + d.q, r: r + d.r }))
}

function rotateOffset(dq: number, dr: number, steps: number): HexCoord {
  let q = dq
  let r = dr
  const n = ((steps % 6) + 6) % 6
  for (let i = 0; i < n; i++) {
    const nq = q + r
    const nr = -q
    q = nq
    r = nr
  }
  return { q, r }
}

function matchesHabitat(
  board: Record<string, HexStack>,
  def: AnimalCardDef,
  anchorQ: number,
  anchorR: number,
  rotation: number
): boolean {
  for (const cell of def.habitat) {
    const off = rotateOffset(cell.dq, cell.dr, rotation)
    const q = anchorQ + off.q
    const r = anchorR + off.r
    const stack = board[hexKey(q, r)] ?? []
    if (stack.length === 0) return false
    if (cell.color !== 'any' && topOf(stack) !== cell.color) return false
    if (cell.height !== undefined && stack.length !== cell.height) return false
  }
  return true
}

/** All not-yet-claimed anchor+rotation matches for a card on a player's board. */
export function findHabitatMatches(
  board: Record<string, HexStack>,
  cardId: string,
  claimed: { q: number; r: number; rotation: number }[]
): { q: number; r: number; rotation: number }[] {
  const def = CARDS_BY_ID.get(cardId)
  if (!def) return []
  const claimedSet = new Set(claimed.map((c) => `${c.q},${c.r},${c.rotation}`))
  const results: { q: number; r: number; rotation: number }[] = []
  for (const cell of PERSONAL_BOARD_CELLS) {
    for (let rotation = 0; rotation < 6; rotation++) {
      const key = `${cell.q},${cell.r},${rotation}`
      if (claimedSet.has(key)) continue
      if (matchesHabitat(board, def, cell.q, cell.r, rotation)) {
        results.push({ q: cell.q, r: cell.r, rotation })
      }
    }
  }
  return results
}

export function computeScore(player: HPlayerState): number {
  let total = 0
  const board = player.board

  // Trees & mountains
  for (const key of Object.keys(board)) {
    const stack = board[key]
    const top = topOf(stack)
    if (top === 'green') {
      total += TREE_MOUNTAIN_POINTS[stack.length] ?? 0
    } else if (top === 'grey') {
      const [q, r] = key.split(',').map(Number)
      const hasMountainNeighbor = neighborsOf(q, r).some(
        (n) => topOf(board[hexKey(n.q, n.r)] ?? []) === 'grey'
      )
      if (hasMountainNeighbor) total += TREE_MOUNTAIN_POINTS[stack.length] ?? 0
    }
  }

  // Fields: connected groups of yellow, size >= 2, flat 5 each
  const seen = new Set<string>()
  for (const key of Object.keys(board)) {
    if (seen.has(key) || topOf(board[key]) !== 'yellow') continue
    const group: string[] = []
    const stack = [key]
    seen.add(key)
    while (stack.length) {
      const k = stack.pop()!
      group.push(k)
      const [q, r] = k.split(',').map(Number)
      for (const n of neighborsOf(q, r)) {
        const nk = hexKey(n.q, n.r)
        if (!seen.has(nk) && topOf(board[nk] ?? []) === 'yellow') {
          seen.add(nk)
          stack.push(nk)
        }
      }
    }
    if (group.length >= 2) total += 5
  }

  // Buildings: red capped stack, scores 5 if adjacent to >=3 distinct colors
  for (const key of Object.keys(board)) {
    if (topOf(board[key]) !== 'red') continue
    const [q, r] = key.split(',').map(Number)
    const colors = new Set<TokenColor>()
    for (const n of neighborsOf(q, r)) {
      const t = topOf(board[hexKey(n.q, n.r)] ?? [])
      if (t) colors.add(t)
    }
    if (colors.size >= 3) total += 5
  }

  // Rivers: best connected group of blue tokens. First 6 score 1pt each,
  // beyond the 6th scores 4pts each (the low-end per-token rate wasn't
  // confirmed from public sources — documented assumption).
  const riverSeen = new Set<string>()
  let bestRiver = 0
  for (const key of Object.keys(board)) {
    if (riverSeen.has(key) || topOf(board[key]) !== 'blue') continue
    let size = 0
    const stack = [key]
    riverSeen.add(key)
    while (stack.length) {
      const k = stack.pop()!
      size++
      const [q, r] = k.split(',').map(Number)
      for (const n of neighborsOf(q, r)) {
        const nk = hexKey(n.q, n.r)
        if (!riverSeen.has(nk) && topOf(board[nk] ?? []) === 'blue') {
          riverSeen.add(nk)
          stack.push(nk)
        }
      }
    }
    bestRiver = Math.max(bestRiver, size)
  }
  total += Math.min(bestRiver, 6) * 1 + Math.max(0, bestRiver - 6) * 4

  // Animal cards: score whatever the topmost still-empty track slot shows
  for (const pc of player.animalCards) {
    const def = CARDS_BY_ID.get(pc.cardId)
    if (!def) continue
    total += pc.cubesPlaced < def.track.length ? def.track[pc.cubesPlaced] : 0
  }

  return total
}

export function initHarmoniesGame(players: { id: string; name: string }[]): HGameState {
  const pouch = buildPouch()
  const centralBoard: TokenColor[][] = []
  for (let i = 0; i < CENTRAL_BOARD_SPACES; i++) {
    centralBoard.push(pouch.splice(-TOKENS_PER_SPACE, TOKENS_PER_SPACE))
  }

  const shuffledCardIds = shuffle(ANIMAL_CARDS.map((c) => c.id))
  const animalRow = shuffledCardIds.splice(0, ANIMAL_ROW_SIZE)

  return {
    phase: 'playing',
    players: players.map((p) => ({
      id: p.id,
      name: p.name,
      board: {},
      animalCards: [],
      finalScore: null,
    })),
    currentPlayerIndex: 0,
    centralBoard,
    pouch,
    animalRow,
    animalDeck: shuffledCardIds,
    pendingTokens: [],
    hasDraftedThisTurn: false,
    finalRound: false,
    finalRoundTriggeredBy: null,
    winners: [],
    log: [],
  }
}

function requireCurrentPlayer(state: HGameState, playerId: string): number {
  const idx = state.players.findIndex((p) => p.id === playerId)
  if (idx === -1) throw new Error('Player not in game')
  if (idx !== state.currentPlayerIndex) throw new Error('Not your turn')
  return idx
}

function removeOne<T>(arr: T[], value: T): boolean {
  const i = arr.indexOf(value)
  if (i === -1) return false
  arr.splice(i, 1)
  return true
}

export function applyHAction(state: HGameState, playerId: string, action: HAction): HGameState {
  if (state.phase !== 'playing') throw new Error('Game has ended')
  const next = structuredClone(state)
  const playerIdx = requireCurrentPlayer(next, playerId)
  const player = next.players[playerIdx]

  switch (action.type) {
    case 'takeTokens': {
      if (next.pendingTokens.length > 0) throw new Error('Place your current tokens first')
      const { spaceIndex } = action
      if (spaceIndex < 0 || spaceIndex >= next.centralBoard.length) throw new Error('Invalid space')
      const space = next.centralBoard[spaceIndex]
      if (space.length === 0) throw new Error('That space is empty')
      next.pendingTokens = space
      next.centralBoard[spaceIndex] = []
      next.hasDraftedThisTurn = true
      return next
    }

    case 'placeToken': {
      const { color, q, r } = action
      if (!BOARD_CELL_SET.has(hexKey(q, r))) throw new Error('Not a valid board cell')
      if (!removeOne(next.pendingTokens, color)) throw new Error("You don't have that token to place")
      const key = hexKey(q, r)
      const stack = player.board[key] ?? []
      if (!canPlaceColor(color, stack)) {
        next.pendingTokens.push(color) // undo the removal before failing
        throw new Error('Illegal placement for that color')
      }
      player.board[key] = [...stack, color]
      return next
    }

    case 'takeAnimalCard': {
      const { cardId } = action
      if (player.animalCards.length >= MAX_ANIMAL_CARDS_HELD) {
        throw new Error('You already hold the maximum number of Animal cards')
      }
      if (!removeOne(next.animalRow, cardId)) throw new Error('That Animal card is not available')
      player.animalCards.push({ cardId, cubesPlaced: 0, claimed: [] })
      return next
    }

    case 'placeAnimalCube': {
      const { cardId, anchorQ, anchorR, rotation } = action
      const def = CARDS_BY_ID.get(cardId)
      if (!def) throw new Error('Unknown Animal card')
      const held = player.animalCards.find((c) => c.cardId === cardId)
      if (!held) throw new Error('You do not hold that Animal card')
      if (held.cubesPlaced >= def.track.length) throw new Error('That card is already full')
      const alreadyClaimed = held.claimed.some(
        (c) => c.q === anchorQ && c.r === anchorR && c.rotation === rotation
      )
      if (alreadyClaimed) throw new Error('That habitat match is already claimed')
      if (!matchesHabitat(player.board, def, anchorQ, anchorR, rotation)) {
        throw new Error('Habitat pattern is not formed there')
      }
      held.cubesPlaced += 1
      held.claimed.push({ q: anchorQ, r: anchorR, rotation })
      return next
    }

    case 'endTurn': {
      if (!next.hasDraftedThisTurn) throw new Error('You must draft tokens before ending your turn')
      if (next.pendingTokens.length > 0) throw new Error('You still have tokens to place')

      // Refill any emptied central space; detect pouch-exhaustion trigger.
      for (let i = 0; i < next.centralBoard.length; i++) {
        if (next.centralBoard[i].length > 0) continue
        if (next.pouch.length === 0) {
          if (!next.finalRound) {
            next.finalRound = true
            next.finalRoundTriggeredBy = playerIdx
          }
          continue
        }
        const draw = Math.min(TOKENS_PER_SPACE, next.pouch.length)
        next.centralBoard[i] = next.pouch.splice(-draw, draw)
      }

      // Refill the animal row.
      while (next.animalRow.length < ANIMAL_ROW_SIZE && next.animalDeck.length > 0) {
        next.animalRow.push(next.animalDeck.pop()!)
      }

      // Personal-board-almost-full trigger.
      const occupied = Object.keys(player.board).length
      if (PERSONAL_BOARD_CELLS.length - occupied <= 2 && !next.finalRound) {
        next.finalRound = true
        next.finalRoundTriggeredBy = playerIdx
      }

      const nextIdx = (playerIdx + 1) % next.players.length
      if (next.finalRound && nextIdx === next.finalRoundTriggeredBy) {
        next.phase = 'ended'
        for (const p of next.players) p.finalScore = computeScore(p)
        const best = Math.max(...next.players.map((p) => p.finalScore ?? 0))
        const leaders = next.players.filter((p) => p.finalScore === best)
        if (leaders.length > 1) {
          const mostCubes = Math.max(
            ...leaders.map((p) => p.animalCards.reduce((sum, c) => sum + c.cubesPlaced, 0))
          )
          next.winners = leaders
            .filter((p) => p.animalCards.reduce((sum, c) => sum + c.cubesPlaced, 0) === mostCubes)
            .map((p) => p.id)
        } else {
          next.winners = leaders.map((p) => p.id)
        }
      } else {
        next.currentPlayerIndex = nextIdx
        next.hasDraftedThisTurn = false
      }
      return next
    }

    default:
      throw new Error('Unknown action')
  }
}
