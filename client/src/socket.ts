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

export default socket
