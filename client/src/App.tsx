import { useEffect, useState } from 'react'
import { useGameStore } from './store/gameStore'
import { useSIGameStore } from './store/siGameStore'
import { useTutorialStore } from './store/tutorialStore'
import { useSITutorialStore } from './store/siTutorialStore'
import socket from './socket'
import HomeScreen from './components/Home/HomeScreen'
import LobbyScreen from './components/Lobby/LobbyScreen'
import WaitingRoom from './components/Lobby/WaitingRoom'
import GameBoard from './components/Game/GameBoard'
import GameOver from './components/Game/GameOver'
import SILobbyScreen from './components/SpiritIsland/SILobbyScreen'
import SIBoard from './components/SpiritIsland/SIBoard'
import SIGameOver from './components/SpiritIsland/SIGameOver'
import ErrorToast from './components/UI/ErrorToast'

export default function App() {
  const { setPlayerId, setRoom, clearRoom, setGameState, setError, room, gameState } = useGameStore()
  const { siGameState, setSIGameState } = useSIGameStore()
  const tutorialActive = useTutorialStore((s) => s.active)
  const siTutorialActive = useSITutorialStore((s) => s.active)
  const siTutorialState = useSITutorialStore((s) => s.siGameState)
  const [selectedGame, setSelectedGame] = useState<string | null>(null)

  useEffect(() => {
    socket.on('player_id', setPlayerId)
    socket.on('room_update', setRoom)
    socket.on('game_state', setGameState)
    socket.on('error', (msg) => setError(msg))
    socket.on('si_game_state', setSIGameState)

    return () => {
      socket.off('player_id', setPlayerId)
      socket.off('room_update', setRoom)
      socket.off('game_state', setGameState)
      socket.off('error')
      socket.off('si_game_state', setSIGameState)
    }
  }, [setPlayerId, setRoom, setGameState, setError, setSIGameState])

  const handleBackFromSI = () => {
    setSelectedGame(null)
    clearRoom()
    setSIGameState(null)
  }

  const renderScreen = () => {
    if (tutorialActive) return <GameBoard />

    // SI tutorial — SIBoard reads state from siTutorialStore internally
    if (siTutorialActive && siTutorialState) {
      return <SIBoard state={siTutorialState} />
    }

    // Splendor flow
    if (gameState?.phase === 'ended') return <GameOver />
    if (gameState?.phase === 'playing') return <GameBoard />

    // Spirit Island flow
    if (siGameState?.phase === 'ended') {
      return <SIGameOver state={siGameState} onBack={handleBackFromSI} />
    }
    if (siGameState) {
      return <SIBoard state={siGameState} />
    }

    // Lobby routing
    if (room && selectedGame === 'spirit-island') {
      return <SILobbyScreen onBack={handleBackFromSI} />
    }
    if (room) return <WaitingRoom />
    if (selectedGame === 'splendor') return <LobbyScreen onBack={() => setSelectedGame(null)} />
    if (selectedGame === 'spirit-island') return <SILobbyScreen onBack={() => setSelectedGame(null)} />
    return <HomeScreen onSelectGame={setSelectedGame} />
  }

  return (
    <>
      {renderScreen()}
      <ErrorToast />
    </>
  )
}
