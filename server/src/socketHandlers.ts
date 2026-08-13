import { Server, Socket } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'
import type { ServerToClientEvents, ClientToServerEvents, GameAction, SIAction, HAction } from '@splendor/shared'
import { initGame, applyAction, initSIGame, applySIAction, initHarmoniesGame, applyHAction } from '@splendor/shared'
import {
  createRoom,
  getRoom,
  joinRoom,
  removePlayer,
  setGameState,
  setSIGameState,
  setHGameState,
  setGameType,
  setSpiritSelection,
  getRoomByPlayerId,
} from './roomManager'

type AllClientEvents = ClientToServerEvents & {
  si_start_game: () => void
  si_select_spirit: (spiritId: string) => void
  si_action: (action: SIAction) => void
  h_start_game: () => void
  h_action: (action: HAction) => void
}
type AllServerEvents = ServerToClientEvents & {
  si_game_state: (state: ReturnType<typeof initSIGame>) => void
  h_game_state: (state: ReturnType<typeof initHarmoniesGame>) => void
}

type IoServer = Server<AllClientEvents, AllServerEvents>
type IoSocket = Socket<AllClientEvents, AllServerEvents>

function roomInfo(room: ReturnType<typeof getRoom>) {
  if (!room) return null
  return {
    code: room.code,
    hostId: room.hostId,
    players: room.players.map((p) => ({ id: p.id, name: p.name })),
    spiritSelections: room.spiritSelections,
  }
}

export function registerHandlers(io: IoServer, socket: IoSocket) {
  const playerId = uuidv4()
  socket.emit('player_id', playerId)

  socket.on('create_room', (name: string) => {
    try {
      const room = createRoom(playerId, name, socket.id)
      socket.join(room.code)
      socket.emit('room_update', roomInfo(room)!)
    } catch (err: unknown) {
      socket.emit('error', (err as Error).message)
    }
  })

  socket.on('join_room', ({ code, name }) => {
    try {
      const upperCode = code.toUpperCase()
      const room = joinRoom(upperCode, playerId, name, socket.id)
      socket.join(upperCode)
      io.to(upperCode).emit('room_update', roomInfo(room)!)
    } catch (err: unknown) {
      socket.emit('error', (err as Error).message)
    }
  })

  socket.on('start_game', () => {
    try {
      const room = getRoomByPlayerId(playerId)
      if (!room) throw new Error('Not in a room')
      if (room.hostId !== playerId) throw new Error('Only the host can start the game')
      if (room.players.length < 2) throw new Error('Need at least 2 players')

      const gameState = initGame(room.players.map((p) => ({ id: p.id, name: p.name })))
      setGameState(room.code, gameState)
      io.to(room.code).emit('game_state', gameState)
    } catch (err: unknown) {
      socket.emit('error', (err as Error).message)
    }
  })

  socket.on('game_action', (action: GameAction) => {
    try {
      const room = getRoomByPlayerId(playerId)
      if (!room || !room.gameState) throw new Error('No active game')

      const newState = applyAction(room.gameState, playerId, action)
      setGameState(room.code, newState)
      io.to(room.code).emit('game_state', newState)
    } catch (err: unknown) {
      socket.emit('error', (err as Error).message)
    }
  })

  socket.on('si_select_spirit', (spiritId: string) => {
    try {
      const room = getRoomByPlayerId(playerId)
      if (!room) throw new Error('Not in a room')
      setSpiritSelection(room.code, playerId, spiritId)
      io.to(room.code).emit('room_update', roomInfo(room)!)
    } catch (err: unknown) {
      socket.emit('error', (err as Error).message)
    }
  })

  socket.on('si_start_game', () => {
    try {
      const room = getRoomByPlayerId(playerId)
      if (!room) throw new Error('Not in a room')
      if (room.hostId !== playerId) throw new Error('Only the host can start the game')
      if (room.players.length < 1) throw new Error('Need at least 1 player')

      const unassigned = room.players.filter((p) => !room.spiritSelections[p.id])
      if (unassigned.length > 0) throw new Error('All players must select a spirit')

      const spirits = Object.values(room.spiritSelections)
      if (new Set(spirits).size !== spirits.length) throw new Error('Each player must choose a different spirit')

      setGameType(room.code, 'spirit-island')
      const siGameState = initSIGame(
        room.players.map((p) => ({ id: p.id, name: p.name })),
        room.spiritSelections
      )
      setSIGameState(room.code, siGameState)
      io.to(room.code).emit('si_game_state', siGameState)
    } catch (err: unknown) {
      socket.emit('error', (err as Error).message)
    }
  })

  socket.on('si_action', (action: SIAction) => {
    try {
      const room = getRoomByPlayerId(playerId)
      if (!room || !room.siGameState) throw new Error('No active Spirit Island game')

      const newState = applySIAction(room.siGameState, playerId, action)
      setSIGameState(room.code, newState)
      io.to(room.code).emit('si_game_state', newState)
    } catch (err: unknown) {
      socket.emit('error', (err as Error).message)
    }
  })

  socket.on('h_start_game', () => {
    try {
      const room = getRoomByPlayerId(playerId)
      if (!room) throw new Error('Not in a room')
      if (room.hostId !== playerId) throw new Error('Only the host can start the game')
      if (room.players.length < 1) throw new Error('Need at least 1 player')

      setGameType(room.code, 'harmonies')
      const hGameState = initHarmoniesGame(room.players.map((p) => ({ id: p.id, name: p.name })))
      setHGameState(room.code, hGameState)
      io.to(room.code).emit('h_game_state', hGameState)
    } catch (err: unknown) {
      socket.emit('error', (err as Error).message)
    }
  })

  socket.on('h_action', (action: HAction) => {
    try {
      const room = getRoomByPlayerId(playerId)
      if (!room || !room.hGameState) throw new Error('No active Harmonies game')

      const newState = applyHAction(room.hGameState, playerId, action)
      setHGameState(room.code, newState)
      io.to(room.code).emit('h_game_state', newState)
    } catch (err: unknown) {
      socket.emit('error', (err as Error).message)
    }
  })

  socket.on('disconnect', () => {
    const result = removePlayer(socket.id)
    if (result) {
      const { room } = result
      if (room.players.length > 0) {
        io.to(room.code).emit('room_update', roomInfo(room)!)
      }
    }
  })
}
