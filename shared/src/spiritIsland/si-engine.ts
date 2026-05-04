import type {
  SIGameState,
  SIAction,
  SpiritState,
  Land,
  PowerCard,
} from './si-types'
import { BOARD_A_LANDS, SPIRIT_DEFS, BASE_INVADER_DECK } from './si-data'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function addLog(state: SIGameState, msg: string): SIGameState {
  const log = [...state.log, msg].slice(-20)
  return { ...state, log }
}

function getLand(lands: Land[], id: string): Land {
  const land = lands.find((l) => l.id === id)
  if (!land) throw new Error(`Land ${id} not found`)
  return land
}

function updateLand(lands: Land[], id: string, patch: Partial<Land>): Land[] {
  return lands.map((l) => (l.id === id ? { ...l, ...patch } : l))
}

function getEnergyIncome(spirit: SpiritState, spiritId: string): number {
  const def = SPIRIT_DEFS.find((d) => d.id === spiritId)
  if (!def) return 0
  const idx = Math.min(spirit.energyTrackRevealed, def.energyTrack.length - 1)
  return def.energyTrack[idx]
}

function getCardPlays(spirit: SpiritState, spiritId: string): number {
  const def = SPIRIT_DEFS.find((d) => d.id === spiritId)
  if (!def) return 1
  const idx = Math.min(spirit.cardPlayRevealed, def.cardPlayTrack.length - 1)
  return def.cardPlayTrack[idx]
}

/** Damage amount: Explorer=1hp, Town=2hp, City=3hp */
function applyDamageToLand(land: Land, damage: number): { land: Land; fear: number } {
  let remaining = damage
  let fear = 0
  let { explorers, towns, cities } = land

  // Kill cities first (3hp each), then towns (2hp), then explorers (1hp)
  // Actually: in Spirit Island, damage is applied to cheapest pieces first for efficiency
  // but rules say the attacker chooses. For AI simplicity: kill explorers first, then towns, then cities.
  while (remaining > 0 && explorers > 0) {
    explorers--
    remaining -= 1
  }
  while (remaining >= 2 && towns > 0) {
    towns--
    remaining -= 2
    fear += 1
  }
  while (remaining >= 3 && cities > 0) {
    cities--
    remaining -= 3
    fear += 2
  }

  return { land: { ...land, explorers, towns, cities }, fear }
}

/** Add blight to a land — if already blighted, cascade to adjacent (simplified: just add to island count) */
function addBlight(state: SIGameState, landId: string): SIGameState {
  let lands = state.lands.map((l) =>
    l.id === landId ? { ...l, blight: l.blight + 1 } : l
  )
  const blight = state.blight + 1
  let s = { ...state, lands, blight }
  s = addLog(s, `Blight added to ${landId}. Total blight: ${blight}`)
  return s
}

// ─── Invader phase logic ──────────────────────────────────────────────────────

function runRavage(state: SIGameState): SIGameState {
  if (!state.ravageCard) return state
  const terrain = state.ravageCard.terrain
  let s = addLog(state, `Ravage: ${terrain}`)

  let totalFear = 0
  let lands = [...s.lands]

  for (const land of lands) {
    if (land.terrain !== terrain) continue
    const invaderCount = land.explorers + land.towns * 2 + land.cities * 3
    if (invaderCount === 0) continue

    // Invaders deal damage equal to their total count
    let dahanKilled = 0
    let dahan = land.dahan
    let dahanDamage = invaderCount
    while (dahanDamage > 0 && dahan > 0) {
      dahan--
      dahanDamage -= 2 // each dahan has 2hp
      dahanKilled++
    }

    // Dahan fight back: each surviving dahan deals 2 damage to invaders
    const dahanDamageBack = dahan * 2
    const { land: damagedLand, fear } = applyDamageToLand(
      { ...land, dahan },
      dahanDamageBack
    )

    totalFear += fear

    // Add blight if invaders deal enough damage to the land
    let blightAdded = false
    if (invaderCount >= 2 && !blightAdded) {
      lands = lands.map((l) =>
        l.id === land.id ? { ...damagedLand } : l
      )
      s = { ...s, lands }
      s = addBlight(s, land.id)
      lands = s.lands
    } else {
      lands = lands.map((l) => (l.id === land.id ? { ...damagedLand } : l))
    }

    s = addLog(s, `  ${land.id}: invaders ravaged, ${dahanKilled} dahan lost`)
  }

  const fearPool = s.fearPool + totalFear
  return { ...s, lands, fearPool }
}

function runBuild(state: SIGameState): SIGameState {
  if (!state.buildCard) return state
  const terrain = state.buildCard.terrain
  let s = addLog(state, `Build: ${terrain}`)

  let lands = [...s.lands]
  for (const land of lands) {
    if (land.terrain !== terrain) continue
    if (land.explorers === 0 && land.towns === 0 && land.cities === 0) continue

    // Rule: if more towns than cities → build city; otherwise → build town
    if (land.towns > land.cities) {
      lands = lands.map((l) =>
        l.id === land.id ? { ...l, cities: l.cities + 1 } : l
      )
      s = addLog(s, `  ${land.id}: town → city`)
    } else {
      lands = lands.map((l) =>
        l.id === land.id ? { ...l, towns: l.towns + 1 } : l
      )
      s = addLog(s, `  ${land.id}: explorer/town → town`)
    }
  }

  return { ...s, lands }
}

function runExplore(state: SIGameState): SIGameState {
  if (state.invaderDeck.length === 0) return state
  const [exploreCard, ...remaining] = state.invaderDeck
  const terrain = exploreCard.terrain
  let s = addLog(state, `Explore: ${terrain}`)
  s = { ...s, invaderDeck: remaining }

  let lands = [...s.lands]
  for (const land of lands) {
    if (land.terrain !== terrain) continue

    // Explore if: coastal, or adjacent to a town or city
    const adjacentHasInvaders = land.adjacent.some((adjId) => {
      const adj = lands.find((l) => l.id === adjId)
      return adj && (adj.towns > 0 || adj.cities > 0)
    })

    if (land.isCoastal || adjacentHasInvaders) {
      lands = lands.map((l) =>
        l.id === land.id ? { ...l, explorers: l.explorers + 1 } : l
      )
      s = addLog(s, `  ${land.id}: explorer added`)
    }
  }

  // Advance card slots: explore → build, build → ravage (old ravage discarded)
  return {
    ...s,
    lands,
    ravageCard: s.buildCard,
    buildCard: exploreCard,
  }
}

// ─── Power card effects ───────────────────────────────────────────────────────

function applyPowerCard(
  state: SIGameState,
  card: PowerCard,
  targetLandId: string | null,
  actingSpiritIdx: number
): SIGameState {
  let s = state
  const land = targetLandId ? s.lands.find((l) => l.id === targetLandId) : null

  switch (card.id) {
    case 'ls-thunderstrike': {
      if (!land) break
      const { land: newLand, fear } = applyDamageToLand(land, 2)
      s = { ...s, lands: updateLand(s.lands, land.id, newLand), fearPool: s.fearPool + fear }
      s = addLog(s, `Thunderstrike → ${land.id}: 2 damage`)
      break
    }
    case 'ls-charged-storm': {
      if (!land) break
      const { land: newLand, fear } = applyDamageToLand(land, 3)
      s = { ...s, lands: updateLand(s.lands, land.id, newLand), fearPool: s.fearPool + fear + 1 }
      s = addLog(s, `Charged Storm → ${land.id}: 3 damage, +1 fear`)
      break
    }
    case 'ls-raging-lightning': {
      if (!land) break
      const { land: newLand, fear } = applyDamageToLand(land, 4)
      s = { ...s, lands: updateLand(s.lands, land.id, newLand), fearPool: s.fearPool + fear }
      s = addLog(s, `Raging Lightning → ${land.id}: 4 damage`)
      break
    }
    case 'ls-flash': {
      if (!land) break
      // 1 damage to each piece individually
      let damage = land.explorers + land.towns + land.cities
      const { land: newLand, fear } = applyDamageToLand(land, damage)
      // Push 1 explorer if any remain
      let finalLand = newLand
      if (finalLand.explorers > 0 && finalLand.adjacent.length > 0) {
        const adjId = finalLand.adjacent[0]
        finalLand = { ...finalLand, explorers: finalLand.explorers - 1 }
        const adjLand = getLand(s.lands, adjId)
        s = { ...s, lands: updateLand(s.lands, adjId, { ...adjLand, explorers: adjLand.explorers + 1 }) }
      }
      s = { ...s, lands: updateLand(s.lands, land.id, finalLand), fearPool: s.fearPool + fear }
      s = addLog(s, `Flash of Lightning → ${land.id}: 1 damage to each piece`)
      break
    }
    case 'rs-bounty': {
      if (!land || land.terrain !== 'wetland') break
      s = { ...s, lands: updateLand(s.lands, land.id, { ...land, dahan: land.dahan + 1 }) }
      s = addLog(s, `River's Bounty → ${land.id}: +1 Dahan`)
      break
    }
    case 'rs-wash-away': {
      if (!land || !land.isCoastal) break
      if (land.explorers === 0) break
      const adjId = land.adjacent.find((id) => {
        const adj = s.lands.find((l) => l.id === id)
        return adj && !adj.isCoastal
      }) ?? land.adjacent[0]
      const adjLand = getLand(s.lands, adjId)
      s = {
        ...s,
        lands: updateLand(
          updateLand(s.lands, land.id, { ...land, explorers: 0 }),
          adjId,
          { ...adjLand, explorers: adjLand.explorers + land.explorers }
        ),
      }
      s = addLog(s, `Wash Away → ${land.id}: pushed ${land.explorers} explorers to ${adjId}`)
      break
    }
    case 'rs-flash-floods': {
      if (!land || land.terrain !== 'wetland') break
      const { land: newLand, fear } = applyDamageToLand(land, 2)
      s = { ...s, lands: updateLand(s.lands, land.id, newLand), fearPool: s.fearPool + fear + 1 }
      s = addLog(s, `Flash Floods → ${land.id}: 2 damage, +1 fear`)
      break
    }
    case 'rs-boon-of-vigor': {
      if (!land) break
      // Give 2 energy to the spirit with presence in that land
      const beneficiary = s.spirits.findIndex((sp) => sp.presenceLands.includes(land.id))
      if (beneficiary !== -1) {
        const spirits = s.spirits.map((sp, i) =>
          i === beneficiary ? { ...sp, energy: sp.energy + 2 } : sp
        )
        s = { ...s, spirits }
        s = addLog(s, `Boon of Vigor → ${land.id}: spirit gains 2 energy`)
      }
      break
    }
    default:
      break
  }

  return s
}

function resolvePowers(state: SIGameState, speed: 'fast' | 'slow'): SIGameState {
  let s = state
  for (let i = 0; i < s.spirits.length; i++) {
    const spirit = s.spirits[i]
    for (const played of spirit.playedThisTurn) {
      if (played.card.speed === speed) {
        s = applyPowerCard(s, played.card, played.targetLandId, i)
      }
    }
  }
  return s
}

function timePasses(state: SIGameState): SIGameState {
  let s = state
  // Move played cards to discard, reset ready flags, grant energy income
  const spirits = s.spirits.map((spirit) => {
    const income = getEnergyIncome(spirit, spirit.id)
    return {
      ...spirit,
      discard: [...spirit.discard, ...spirit.playedThisTurn.map((p) => p.card)],
      playedThisTurn: [],
      ready: false,
      hasGrown: false,
      cardPlaysUsed: 0,
      energy: spirit.energy + income,
    }
  })
  s = { ...s, spirits }
  s = addLog(s, `--- Turn ${s.turn} complete. Starting Turn ${s.turn + 1} ---`)
  return s
}

function checkWinLose(state: SIGameState): SIGameState {
  // Win: fear pool reaches threshold
  if (state.fearPool >= state.fearThreshold) {
    return { ...state, phase: 'ended', winner: 'spirits' }
  }
  // Lose: too much blight
  if (state.blight >= state.blightCap) {
    return { ...state, phase: 'ended', winner: 'invaders' }
  }
  // Lose: any spirit has no presence remaining
  for (const spirit of state.spirits) {
    if (spirit.presenceLands.length === 0) {
      return { ...state, phase: 'ended', winner: 'invaders' }
    }
  }
  return state
}

function runFullInvaderCycle(state: SIGameState): SIGameState {
  let s: SIGameState = { ...state, phase: 'invader' }
  s = runRavage(s)
  s = runBuild(s)
  s = runExplore(s)
  return s
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function initSIGame(
  players: { id: string; name: string }[],
  spiritAssignments: Record<string, string> // playerId → spiritId
): SIGameState {
  const lands: Land[] = BOARD_A_LANDS.map((l) => ({ ...l, presence: [] }))

  const spirits: SpiritState[] = players.map((p) => {
    const spiritId = spiritAssignments[p.id]
    const def = SPIRIT_DEFS.find((d) => d.id === spiritId)
    if (!def) throw new Error(`Unknown spirit: ${spiritId}`)

    // Place starting presence
    const presenceLands = [...def.startingPresenceLands]
    for (const landId of presenceLands) {
      const land = lands.find((l) => l.id === landId)
      if (land) land.presence.push(spiritId)
    }

    return {
      id: spiritId,
      name: def.name,
      color: def.color,
      playerId: p.id,
      presenceLands,
      energyTrackRevealed: 0,
      cardPlayRevealed: 0,
      energy: 0,
      cardPlaysUsed: 0,
      hand: [...def.startingCards],
      discard: [],
      playedThisTurn: [],
      ready: false,
      hasGrown: false,
    }
  })

  const invaderDeck = shuffle([...BASE_INVADER_DECK])
  const fearThreshold = players.length * 4 + 6 // ~10–14 fear to win

  // Initial explore: draw first card and place explorers
  const [firstExplore, ...remainingDeck] = invaderDeck
  let initialLands = [...lands]
  for (const land of initialLands) {
    if (land.terrain === firstExplore.terrain && land.isCoastal) {
      land.explorers += 1
    }
  }

  return {
    phase: 'spirit',
    turn: 1,
    spirits,
    lands: initialLands,
    invaderDeck: remainingDeck,
    ravageCard: null,
    buildCard: firstExplore,
    fearPool: 0,
    fearThreshold,
    blight: 0,
    blightCap: players.length * 2 + 4,
    winner: null,
    log: [`Game started! Fear needed to win: ${fearThreshold}. Invaders explore ${firstExplore.terrain}.`],
  }
}

export function applySIAction(
  state: SIGameState,
  playerId: string,
  action: SIAction
): SIGameState {
  if (state.phase === 'ended') throw new Error('Game is over')

  const spiritIdx = state.spirits.findIndex((s) => s.playerId === playerId)
  if (spiritIdx === -1) throw new Error('Player not in this game')

  const spirit = state.spirits[spiritIdx]

  if (state.phase !== 'spirit') {
    throw new Error('Actions only allowed during spirit phase')
  }
  if (spirit.ready) throw new Error('You already confirmed ready')

  let s = state

  if (action.type === 'grow') {
    if (spirit.hasGrown) throw new Error('Already grew this turn')

    if (action.option === 'addPresence') {
      const targetLand = getLand(s.lands, action.landId)

      // Must be adjacent to existing presence OR be a land already with presence
      const validTargets = getValidPresenceLands(s, spiritIdx)
      if (!validTargets.includes(action.landId)) {
        throw new Error('Cannot place presence there')
      }

      const updatedPresence = [...spirit.presenceLands, action.landId]
      const newLands = updateLand(s.lands, action.landId, {
        ...targetLand,
        presence: [...targetLand.presence, spirit.id],
      })

      // Reveal next track slot
      const newEnergyRevealed = Math.min(spirit.energyTrackRevealed + 1, 5)
      const newCardPlayRevealed = spirit.cardPlayRevealed // only one track advances per grow

      const updatedSpirit: SpiritState = {
        ...spirit,
        presenceLands: updatedPresence,
        energyTrackRevealed: newEnergyRevealed,
        hasGrown: true,
      }
      const spirits = s.spirits.map((sp, i) => (i === spiritIdx ? updatedSpirit : sp))
      s = { ...s, spirits, lands: newLands }
      s = addLog(s, `${spirit.name} placed presence on ${action.landId}`)
    } else if (action.option === 'reclaimAll') {
      const updatedSpirit: SpiritState = {
        ...spirit,
        hand: [...spirit.hand, ...spirit.discard],
        discard: [],
        hasGrown: true,
      }
      const spirits = s.spirits.map((sp, i) => (i === spiritIdx ? updatedSpirit : sp))
      s = { ...s, spirits }
      s = addLog(s, `${spirit.name} reclaimed all cards`)
    }
  } else if (action.type === 'playCard') {
    const cardIdx = spirit.hand.findIndex((c) => c.id === action.cardId)
    if (cardIdx === -1) throw new Error('Card not in hand')

    const maxPlays = getCardPlays(spirit, spirit.id)
    if (spirit.cardPlaysUsed >= maxPlays) throw new Error('No card plays remaining')

    const card = spirit.hand[cardIdx]
    if (spirit.energy < card.cost) throw new Error('Not enough energy')

    // Validate target
    validateTarget(s, card, action.targetLandId, spiritIdx)

    const newHand = spirit.hand.filter((_, i) => i !== cardIdx)
    const updatedSpirit: SpiritState = {
      ...spirit,
      hand: newHand,
      energy: spirit.energy - card.cost,
      cardPlaysUsed: spirit.cardPlaysUsed + 1,
      playedThisTurn: [...spirit.playedThisTurn, { card, targetLandId: action.targetLandId }],
    }
    const spirits = s.spirits.map((sp, i) => (i === spiritIdx ? updatedSpirit : sp))
    s = { ...s, spirits }
    s = addLog(s, `${spirit.name} plays ${card.name} targeting ${action.targetLandId}`)
  } else if (action.type === 'confirmReady') {
    const updatedSpirit: SpiritState = { ...spirit, ready: true }
    const spirits = s.spirits.map((sp, i) => (i === spiritIdx ? updatedSpirit : sp))
    s = { ...s, spirits }
    s = addLog(s, `${spirit.name} is ready`)

    // Check if ALL spirits are ready → advance phases automatically
    const allReady = spirits.every((sp) => sp.ready)
    if (allReady) {
      // Fast powers
      s = { ...s, spirits, phase: 'fast-powers' }
      s = resolvePowers(s, 'fast')

      // Invader phase
      s = { ...s, phase: 'invader' }
      s = runFullInvaderCycle(s)

      // Slow powers
      s = { ...s, phase: 'slow-powers' }
      s = resolvePowers(s, 'slow')

      // Time passes
      s = { ...s, phase: 'time-passes' }
      s = timePasses(s)

      // Check win/lose
      s = checkWinLose(s)

      // Start next turn if game still going
      if (s.phase !== 'ended') {
        s = { ...s, phase: 'spirit', turn: s.turn + 1 }
      }
    }
  }

  return s
}

export function getValidPresenceLands(state: SIGameState, spiritIdx: number): string[] {
  const spirit = state.spirits[spiritIdx]
  const reachable = new Set<string>()

  for (const landId of spirit.presenceLands) {
    reachable.add(landId)
    const land = state.lands.find((l) => l.id === landId)
    if (land) {
      for (const adjId of land.adjacent) {
        reachable.add(adjId)
      }
    }
  }

  return [...reachable]
}

function validateTarget(
  state: SIGameState,
  card: PowerCard,
  targetLandId: string,
  spiritIdx: number
): void {
  const land = state.lands.find((l) => l.id === targetLandId)
  if (!land) throw new Error(`Target land ${targetLandId} not found`)

  switch (card.id) {
    case 'rs-bounty':
      if (land.terrain !== 'wetland') throw new Error('Target must be a wetland')
      break
    case 'rs-wash-away':
      if (!land.isCoastal) throw new Error('Target must be coastal')
      break
    case 'rs-flash-floods':
      if (land.terrain !== 'wetland') throw new Error('Target must be a wetland')
      break
    default:
      break
  }
}
