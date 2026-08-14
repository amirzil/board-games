import { useState } from 'react'
import type { TokenColor } from '@splendor/shared'
import { PERSONAL_BOARD_CELLS, ANIMAL_CARDS, MAX_ANIMAL_CARDS_HELD, findHabitatMatches, computeScore } from '@splendor/shared'
import { useGameStore } from '../../store/gameStore'
import { useHGameStore } from '../../store/hGameStore'
import socket from '../../socket'
import styles from './HBoard.module.css'

const HEX_SIZE = 30

function axialToPixel(q: number, r: number) {
  const x = HEX_SIZE * 1.5 * q
  const y = HEX_SIZE * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r)
  return { x, y }
}

const CARD_DEFS = new Map(ANIMAL_CARDS.map((c) => [c.id, c]))

export default function HBoard() {
  const { playerId } = useGameStore()
  const { hGameState, selectedCardId, setSelectedCardId, selectedColor, setSelectedColor } = useHGameStore()
  const [hoverInfo, setHoverInfo] = useState<string | null>(null)

  if (!hGameState) return null
  const state = hGameState
  const currentPlayer = state.players[state.currentPlayerIndex]
  const isMyTurn = currentPlayer?.id === playerId
  const me = state.players.find((p) => p.id === playerId)

  const handleTakeTokens = (spaceIndex: number) => socket.emit('h_action', { type: 'takeTokens', spaceIndex })

  const handlePlaceToken = (q: number, r: number) => {
    if (!selectedColor) return
    socket.emit('h_action', { type: 'placeToken', color: selectedColor as TokenColor, q, r })
    setSelectedColor(null)
  }

  const handleTakeAnimalCard = (cardId: string) => socket.emit('h_action', { type: 'takeAnimalCard', cardId })

  const handlePlaceCube = (cardId: string, anchorQ: number, anchorR: number, rotation: number) => {
    socket.emit('h_action', { type: 'placeAnimalCube', cardId, anchorQ, anchorR, rotation })
  }

  const handleEndTurn = () => socket.emit('h_action', { type: 'endTurn' })

  const myMatches =
    isMyTurn && me && selectedCardId ? findHabitatMatches(me.board, selectedCardId, me.cubedHexes) : []

  const heldActiveCards = me?.animalCards.filter((c) => c.cubesRemainingOnCard > 0).length ?? 0

  return (
    <div className={styles.board}>
      <div className={styles.turnBar}>
        <span className={styles.turnText}>{isMyTurn ? 'Your turn' : `${currentPlayer?.name ?? ''}'s turn`}</span>
        {state.finalRound && <span className={styles.finalRound}>Final Round!</span>}
      </div>

      <div className={styles.mainArea}>
        <div className={styles.center}>
          <h3 className={styles.sectionTitle}>Central Board</h3>
          <div className={styles.spaces}>
            {state.centralBoard.map((space, i) => (
              <div key={i} className={styles.space}>
                <div className={styles.spaceTokens}>
                  {space.map((c, j) => (
                    <span key={j} className={`${styles.token} ${styles[c]}`} />
                  ))}
                </div>
                <button
                  className={styles.draftBtn}
                  disabled={!isMyTurn || state.hasDraftedThisTurn || space.length === 0}
                  onClick={() => handleTakeTokens(i)}
                >
                  Draft
                </button>
              </div>
            ))}
          </div>

          {isMyTurn && state.pendingTokens.length > 0 && (
            <div className={styles.pending}>
              <span className={styles.pendingLabel}>Place these:</span>
              {state.pendingTokens.map((c, i) => (
                <button
                  key={i}
                  className={`${styles.token} ${styles[c]} ${selectedColor === c ? styles.tokenSelected : ''}`}
                  onClick={() => setSelectedColor(c)}
                />
              ))}
            </div>
          )}

          <h3 className={styles.sectionTitle}>Animal Cards</h3>
          <div className={styles.animalRow}>
            {state.animalRow.map((id) => {
              const def = CARD_DEFS.get(id)
              if (!def) return null
              return (
                <div key={id} className={styles.animalCard}>
                  <span className={styles.animalName}>{def.name}</span>
                  <span className={styles.animalTrack}>{def.track.join(' / ')}</span>
                  <button
                    className={styles.smallBtn}
                    disabled={!isMyTurn || state.hasTakenCardThisTurn || heldActiveCards >= MAX_ANIMAL_CARDS_HELD}
                    onClick={() => handleTakeAnimalCard(id)}
                  >
                    Take
                  </button>
                </div>
              )
            })}
          </div>

          {isMyTurn && (
            <button className={styles.endTurnBtn} disabled={state.pendingTokens.length > 0 || !state.hasDraftedThisTurn} onClick={handleEndTurn}>
              End Turn
            </button>
          )}
        </div>

        <div className={styles.myBoardArea}>
          <h3 className={styles.sectionTitle}>Your Landscape {me && `(est. ${computeScore(me)} pts)`}</h3>
          <div className={styles.hexGrid}>
            {PERSONAL_BOARD_CELLS.map(({ q, r }) => {
              const { x, y } = axialToPixel(q, r)
              const key = `${q},${r}`
              const stack = me?.board[key] ?? []
              const top = stack[stack.length - 1]
              const isMatch = myMatches.some((m) => m.q === q && m.r === r)
              const isCubed = me?.cubedHexes.includes(key) ?? false
              return (
                <button
                  key={key}
                  className={`${styles.hex} ${top ? styles[top] : ''} ${isMatch ? styles.hexMatch : ''} ${isCubed ? styles.hexCubed : ''}`}
                  style={{ left: x + 160, top: y + 100 }}
                  disabled={!isMyTurn || !selectedColor || isCubed}
                  onClick={() => handlePlaceToken(q, r)}
                  onMouseEnter={() => setHoverInfo(stack.length ? `${stack.join(' > ')}${isCubed ? ' (cube)' : ''}` : 'empty')}
                  onMouseLeave={() => setHoverInfo(null)}
                >
                  {stack.length > 0 && <span className={styles.hexHeight}>{isCubed ? '●' : stack.length}</span>}
                </button>
              )
            })}
          </div>
          {hoverInfo && <p className={styles.hoverInfo}>{hoverInfo}</p>}

          {me && me.animalCards.length > 0 && (
            <div className={styles.myCards}>
              <h3 className={styles.sectionTitle}>Your Animal Cards</h3>
              {me.animalCards.map((pc) => {
                const def = CARD_DEFS.get(pc.cardId)
                if (!def) return null
                const matches = def.track.length - pc.cubesRemainingOnCard
                const complete = pc.cubesRemainingOnCard === 0
                const currentValue = matches === 0 ? 0 : def.track[def.track.length - matches]
                return (
                  <div key={pc.cardId} className={styles.myCard}>
                    <span>
                      {def.name} — {matches}/{def.track.length} matched
                      {complete ? ' (complete)' : ` · worth ${currentValue} pts now`}
                    </span>
                    <button
                      className={styles.smallBtn}
                      disabled={!isMyTurn || complete}
                      onClick={() => setSelectedCardId(selectedCardId === pc.cardId ? null : pc.cardId)}
                    >
                      {selectedCardId === pc.cardId ? 'Cancel' : 'Match'}
                    </button>
                  </div>
                )
              })}
              {selectedCardId && (
                <div className={styles.matches}>
                  {myMatches.length === 0 && <p>No available matches right now.</p>}
                  {myMatches.map((m, i) => (
                    <button key={i} className={styles.smallBtn} onClick={() => handlePlaceCube(selectedCardId, m.q, m.r, m.rotation)}>
                      Place cube at ({m.q},{m.r})
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.others}>
          <h3 className={styles.sectionTitle}>Players</h3>
          {state.players.map((p) => (
            <div key={p.id} className={`${styles.otherPlayer} ${p.id === currentPlayer?.id ? styles.activePlayer : ''}`}>
              <span>{p.name}{p.id === playerId ? ' (you)' : ''}</span>
              <span>{Object.keys(p.board).length}/{PERSONAL_BOARD_CELLS.length} hexes · {p.animalCards.length} cards</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
