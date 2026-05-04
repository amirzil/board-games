import { io, Socket } from 'socket.io-client'
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  SIServerToClientEvents,
  SIClientToServerEvents,
} from '@splendor/shared'

type AllServerEvents = ServerToClientEvents & SIServerToClientEvents
type AllClientEvents = ClientToServerEvents & SIClientToServerEvents

const socket: Socket<AllServerEvents, AllClientEvents> = io('/', {
  autoConnect: true,
})

export default socket
