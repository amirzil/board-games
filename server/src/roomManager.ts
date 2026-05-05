import type { GameState, SIGameState } from '@splendor/shared'

export interface RoomPlayer {
  id: string
  name: string
  socketId: string
}

export type GameType = 'splendor' | 'spirit-island'

export interface Room {
  code: string
  hostId: string
  players: RoomPlayer[]
  gameType: GameType
  gameState: GameState | null
  siGameState: SIGameState | null
  spiritSelections: Record<string, string> // playerId → spiritId
}

const rooms = new Map<string, Room>()

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function createRoom(hostId: string, hostName: string, socketId: string): Room {
  let code = generateCode()
  while (rooms.has(code)) code = generateCode()

  const room: Room = {
    code,
    hostId,
    players: [{ id: hostId, name: hostName, socketId }],
    gameType: 'splendor',
    gameState: null,
    siGameState: null,
    spiritSelections: {},
  }
  rooms.set(code, room)
  return room
}

export function getRoom(code: string): Room | undefined {
  return rooms.get(code)
}

export function getRoomByPlayerId(playerId: string): Room | undefined {
  for (const room of rooms.values()) {
    if (room.players.some((p) => p.id === playerId)) return room
  }
  return undefined
}

export function getRoomBySocketId(socketId: string): Room | undefined {
  for (const room of rooms.values()) {
    if (room.players.some((p) => p.socketId === socketId)) return room
  }
  return undefined
}

export function joinRoom(code: string, playerId: string, playerName: string, socketId: string): Room {
  const room = rooms.get(code)
  if (!room) throw new Error('Room not found')
  if (room.gameState && room.gameState.phase === 'playing') throw new Error('Game already started')
  if (room.players.length >= 4) throw new Error('Room is full')
  if (room.players.some((p) => p.id === playerId)) throw new Error('Already in room')

  room.players.push({ id: playerId, name: playerName, socketId })
  return room
}

export function removePlayer(socketId: string): { room: Room; playerId: string } | null {
  const room = getRoomBySocketId(socketId)
  if (!room) return null

  const player = room.players.find((p) => p.socketId === socketId)
  if (!player) return null

  room.players = room.players.filter((p) => p.socketId !== socketId)

  if (room.players.length === 0) {
    rooms.delete(room.code)
  } else if (room.hostId === player.id && room.players.length > 0) {
    room.hostId = room.players[0].id
  }

  return { room, playerId: player.id }
}

export function setGameState(code: string, state: GameState): void {
  const room = rooms.get(code)
  if (room) room.gameState = state
}

export function setSIGameState(code: string, state: SIGameState): void {
  const room = rooms.get(code)
  if (room) room.siGameState = state
}

export function setGameType(code: string, gameType: GameType): void {
  const room = rooms.get(code)
  if (room) room.gameType = gameType
}

export function setSpiritSelection(code: string, playerId: string, spiritId: string): void {
  const room = rooms.get(code)
  if (room) room.spiritSelections[playerId] = spiritId
}
