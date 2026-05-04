import type {
  GameState,
  Player,
  Card,
  Noble,
  Gems,
  GemColor,
  NonGoldColor,
  GameAction,
  TierState,
} from './types'
import { TIER1_CARDS, TIER2_CARDS, TIER3_CARDS, NOBLES } from './cardData'

const GEM_COLORS: NonGoldColor[] = ['white', 'blue', 'green', 'red', 'black']

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function emptyGems(): Gems {
  return { white: 0, blue: 0, green: 0, red: 0, black: 0, gold: 0 }
}

function gemCount(gems: Partial<Gems>): number {
  return Object.values(gems).reduce((s, v) => s + (v ?? 0), 0)
}

function cardProduction(player: Player): Partial<Record<NonGoldColor, number>> {
  const prod: Partial<Record<NonGoldColor, number>> = {}
  for (const card of player.cards) {
    prod[card.color] = (prod[card.color] ?? 0) + 1
  }
  return prod
}

export function initGame(playerInfos: { id: string; name: string }[]): GameState {
  const n = playerInfos.length

  // Gem counts depend on player count
  const baseGems = n === 2 ? 4 : n === 3 ? 5 : 7
  const gems: Gems = {
    white: baseGems,
    blue: baseGems,
    green: baseGems,
    red: baseGems,
    black: baseGems,
    gold: 5,
  }

  const tier1Shuffled = shuffle(TIER1_CARDS)
  const tier2Shuffled = shuffle(TIER2_CARDS)
  const tier3Shuffled = shuffle(TIER3_CARDS)

  const noblesShuffled = shuffle(NOBLES).slice(0, n + 1)

  const makeTier = (cards: Card[]): TierState => ({
    deck: cards.slice(4),
    visible: cards.slice(0, 4) as (Card | null)[],
  })

  const players: Player[] = playerInfos.map((p) => ({
    id: p.id,
    name: p.name,
    gems: emptyGems(),
    cards: [],
    reserved: [],
    nobles: [],
    points: 0,
  }))

  return {
    phase: 'playing',
    players,
    currentPlayerIndex: 0,
    board: {
      tier1: makeTier(tier1Shuffled),
      tier2: makeTier(tier2Shuffled),
      tier3: makeTier(tier3Shuffled),
      nobles: noblesShuffled,
      gems,
    },
    winner: null,
    round: 1,
    lastRound: false,
    lastRoundStartedBy: null,
  }
}

function findCard(state: GameState, cardId: string): { card: Card; tier: 1 | 2 | 3; index: number } | null {
  for (const tier of [1, 2, 3] as const) {
    const key = `tier${tier}` as 'tier1' | 'tier2' | 'tier3'
    const visible = state.board[key].visible
    const index = visible.findIndex((c) => c?.id === cardId)
    if (index !== -1 && visible[index]) {
      return { card: visible[index]!, tier, index }
    }
  }
  return null
}

function removeCardFromBoard(state: GameState, tier: 1 | 2 | 3, index: number): GameState {
  const key = `tier${tier}` as 'tier1' | 'tier2' | 'tier3'
  const tierState = state.board[key]
  const newDeck = [...tierState.deck]
  const newVisible = [...tierState.visible]

  if (newDeck.length > 0) {
    newVisible[index] = newDeck.shift()!
  } else {
    newVisible[index] = null
  }

  return {
    ...state,
    board: {
      ...state.board,
      [key]: { deck: newDeck, visible: newVisible },
    },
  }
}

function checkNobles(state: GameState, playerIndex: number): GameState {
  const player = state.players[playerIndex]
  const prod = cardProduction(player)

  let newState = state
  let updatedPlayer = { ...player }
  const remainingNobles = [...state.board.nobles]

  const awarded: Noble[] = []
  for (let i = remainingNobles.length - 1; i >= 0; i--) {
    const noble = remainingNobles[i]
    const qualifies = Object.entries(noble.requirement).every(
      ([color, req]) => (prod[color as NonGoldColor] ?? 0) >= req!
    )
    if (qualifies) {
      awarded.push(noble)
      remainingNobles.splice(i, 1)
      break // only one noble per turn
    }
  }

  if (awarded.length > 0) {
    updatedPlayer = {
      ...updatedPlayer,
      nobles: [...updatedPlayer.nobles, ...awarded],
      points: updatedPlayer.points + awarded.reduce((s, n) => s + n.points, 0),
    }
    const newPlayers = [...newState.players]
    newPlayers[playerIndex] = updatedPlayer
    newState = {
      ...newState,
      players: newPlayers,
      board: { ...newState.board, nobles: remainingNobles },
    }
  }

  return newState
}

function advanceTurn(state: GameState): GameState {
  const n = state.players.length
  const next = (state.currentPlayerIndex + 1) % n

  // Check if the last round is over
  if (state.lastRound && next === 0) {
    // Find winner: most points, tiebreak: fewest cards
    let winner = state.players[0]
    for (const p of state.players) {
      if (
        p.points > winner.points ||
        (p.points === winner.points && p.cards.length < winner.cards.length)
      ) {
        winner = p
      }
    }
    return { ...state, phase: 'ended', winner: winner.id, currentPlayerIndex: next }
  }

  const newRound = next === 0 ? state.round + 1 : state.round
  return { ...state, currentPlayerIndex: next, round: newRound }
}

export function applyAction(state: GameState, playerId: string, action: GameAction): GameState {
  const playerIndex = state.players.findIndex((p) => p.id === playerId)
  if (playerIndex === -1 || playerIndex !== state.currentPlayerIndex) {
    throw new Error('Not your turn')
  }
  if (state.phase !== 'playing') {
    throw new Error('Game is not in progress')
  }

  let newState = { ...state }
  let player = { ...state.players[playerIndex] }

  if (action.type === 'takeGems') {
    const taken = action.gems
    const colors = Object.entries(taken).filter(([, v]) => v! > 0) as [NonGoldColor, number][]

    // Validate
    const totalTaking = colors.reduce((s, [, v]) => s + v, 0)
    const taking2 = colors.length === 1 && colors[0][1] === 2
    const taking3 = colors.length <= 3 && colors.every(([, v]) => v === 1)

    if (!taking2 && !taking3) throw new Error('Invalid gem selection')
    if (taking2 && newState.board.gems[colors[0][0]] < 4) throw new Error('Not enough gems in bank for take-2')

    // Check player gem limit
    const currentTotal = gemCount(player.gems)
    if (currentTotal + totalTaking > 10) throw new Error('Would exceed 10 gems')

    // Deduct from bank
    const newBankGems = { ...newState.board.gems }
    const newPlayerGems = { ...player.gems }
    for (const [color, amount] of colors) {
      newBankGems[color] -= amount
      newPlayerGems[color] += amount
    }

    player = { ...player, gems: newPlayerGems }
    newState = { ...newState, board: { ...newState.board, gems: newBankGems } }
  } else if (action.type === 'buyCard') {
    let card: Card | undefined

    if (action.fromReserved) {
      const idx = player.reserved.findIndex((c) => c.id === action.cardId)
      if (idx === -1) throw new Error('Reserved card not found')
      card = player.reserved[idx]
      const newReserved = [...player.reserved]
      newReserved.splice(idx, 1)
      player = { ...player, reserved: newReserved }
    } else {
      const found = findCard(newState, action.cardId)
      if (!found) throw new Error('Card not found on board')
      card = found.card
      newState = removeCardFromBoard(newState, found.tier, found.index)
    }

    // Calculate actual cost after card bonuses
    const prod = cardProduction(player)
    const newPlayerGems = { ...player.gems }
    const newBankGems = { ...newState.board.gems }
    let goldNeeded = 0

    for (const [color, cost] of Object.entries(card.cost) as [NonGoldColor, number][]) {
      const discount = prod[color] ?? 0
      const remaining = Math.max(0, cost - discount)
      const paid = Math.min(remaining, newPlayerGems[color])
      newPlayerGems[color] -= paid
      newBankGems[color] += paid
      goldNeeded += remaining - paid
    }

    if (goldNeeded > newPlayerGems.gold) throw new Error('Cannot afford card')
    newPlayerGems.gold -= goldNeeded
    newBankGems.gold += goldNeeded

    player = {
      ...player,
      gems: newPlayerGems,
      cards: [...player.cards, card],
      points: player.points + card.points,
    }
    newState = { ...newState, board: { ...newState.board, gems: newBankGems } }
  } else if (action.type === 'reserveCard') {
    if (player.reserved.length >= 3) throw new Error('Cannot reserve more than 3 cards')

    let card: Card | undefined
    let newState2 = newState

    if (action.tier) {
      // Reserve from top of deck
      const key = `tier${action.tier}` as 'tier1' | 'tier2' | 'tier3'
      const tierState = newState.board[key]
      if (tierState.deck.length === 0) throw new Error('Deck is empty')
      const newDeck = [...tierState.deck]
      card = newDeck.shift()!
      newState2 = {
        ...newState,
        board: { ...newState.board, [key]: { ...tierState, deck: newDeck } },
      }
    } else {
      const found = findCard(newState, action.cardId)
      if (!found) throw new Error('Card not found')
      card = found.card
      newState2 = removeCardFromBoard(newState, found.tier, found.index)
    }

    const newPlayerGems = { ...player.gems }
    const newBankGems = { ...newState2.board.gems }
    if (newBankGems.gold > 0 && gemCount(player.gems) < 10) {
      newPlayerGems.gold += 1
      newBankGems.gold -= 1
    }

    player = { ...player, gems: newPlayerGems, reserved: [...player.reserved, card] }
    newState = { ...newState2, board: { ...newState2.board, gems: newBankGems } }
  }

  // Update player in state
  const newPlayers = [...newState.players]
  newPlayers[playerIndex] = player
  newState = { ...newState, players: newPlayers }

  // Check nobles
  newState = checkNobles(newState, playerIndex)

  // Check if last round triggered
  const updatedPlayer = newState.players[playerIndex]
  if (!newState.lastRound && updatedPlayer.points >= 15) {
    newState = {
      ...newState,
      lastRound: true,
      lastRoundStartedBy: updatedPlayer.id,
    }
  }

  // Advance turn
  newState = advanceTurn(newState)

  return newState
}

export function getValidActions(state: GameState, playerId: string): string[] {
  const playerIndex = state.players.findIndex((p) => p.id === playerId)
  if (playerIndex !== state.currentPlayerIndex) return []

  const player = state.players[playerIndex]
  const prod = cardProduction(player)
  const valid: string[] = []

  // Can take gems?
  const availableColors = GEM_COLORS.filter((c) => state.board.gems[c] > 0)
  if (availableColors.length > 0 && gemCount(player.gems) < 10) {
    valid.push('takeGems')
  }

  // Can buy any board card?
  const allVisible = [
    ...state.board.tier1.visible,
    ...state.board.tier2.visible,
    ...state.board.tier3.visible,
    ...player.reserved,
  ].filter(Boolean) as Card[]

  for (const card of allVisible) {
    let affordable = true
    let goldNeeded = 0
    for (const [color, cost] of Object.entries(card.cost) as [NonGoldColor, number][]) {
      const discount = prod[color] ?? 0
      const remaining = Math.max(0, cost - discount)
      const paid = Math.min(remaining, player.gems[color])
      goldNeeded += remaining - paid
    }
    if (goldNeeded > player.gems.gold) affordable = false
    if (affordable) valid.push(`buyCard:${card.id}`)
  }

  // Can reserve?
  if (player.reserved.length < 3) {
    valid.push('reserveCard')
  }

  return valid
}
