import { io, Socket } from 'socket.io-client'
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  SIServerToClientEvents,
  SIClientToServerEvents,
  HServerToClientEvents,
  HClientToServerEvents,
} from '@splendor/shared'

type AllServerEvents = ServerToClientEvents & SIServerToClientEvents & HServerToClientEvents
type AllClientEvents = ClientToServerEvents & SIClientToServerEvents & HClientToServerEvents

const socket: Socket<AllServerEvents, AllClientEvents> = io('/', {
  autoConnect: true,
})

// The server emits `player_id` immediately on connect, which can happen
// before App.tsx's useEffect has a chance to attach its own listener —
// buffer it here (registered synchronously at module load, before any
// network round-trip can complete) so late-mounting listeners can still
// pick it up.
let bufferedPlayerId: string | null = null
socket.on('player_id', (id: string) => {
  bufferedPlayerId = id
})

export function getBufferedPlayerId(): string | null {
  return bufferedPlayerId
}

export default socket
