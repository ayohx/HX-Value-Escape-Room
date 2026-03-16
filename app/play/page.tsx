'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { gameEngine } from '@/lib/GameEngine'
import { useGameStore } from '@/stores/gameStore'
import Header from '@/components/layout/Header'
import HUD from '@/components/layout/HUD'
import RoomStage from '@/components/layout/RoomStage'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import Toast from '@/components/ui/Toast'

// Import puzzle components
import ReorderPuzzle from '@/components/puzzles/ReorderPuzzle'
import TimedChoice from '@/components/puzzles/TimedChoice'
import ConnectNodesPuzzle from '@/components/puzzles/ConnectNodesPuzzle'
import MatchingChoice from '@/components/puzzles/MatchingChoice'
import FinalPuzzle from '@/components/puzzles/FinalPuzzle'

export default function PlayPage() {
  const router = useRouter()
  const {
    gameState,
    currentRoomId,
    playerProgress,
    currentRoomConfig,
    setGameState,
    setCurrentRoom,
    setPlayerProgress,
    startRoomTimer,
    getRoomElapsedTime,
  } = useGameStore()

  const [showBriefing, setShowBriefing] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [resultData, setResultData] = useState<{
    success: boolean
    message: string
    learning?: string
  } | null>(null)
  const [showPauseModal, setShowPauseModal] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: any } | null>(null)
  const [additionalEvent, setAdditionalEvent] = useState<any>(null)
  const [timeRemaining, setTimeRemaining] = useState<number | undefined>(undefined)

  // Initialize game on mount
  useEffect(() => {
    const progress = gameEngine.startGame()
    setPlayerProgress(progress)
    
    if (progress.currentRoomId) {
      const room = gameEngine.getRoomById(progress.currentRoomId)
      if (room) {
        setCurrentRoom(progress.currentRoomId, room)
        setGameState('briefing')
        setShowBriefing(true)
      }
    }
  }, [setPlayerProgress, setCurrentRoom, setGameState])

  // Start room after briefing
  const startCurrentRoom = useCallback(() => {
    if (currentRoomId) {
      gameEngine.startRoom(currentRoomId)
      setGameState('playing')
      setShowBriefing(false)
      startRoomTimer()
    }
  }, [currentRoomId, setGameState, startRoomTimer])

  // Handle room submission
  const handleRoomSubmit = useCallback(async (payload: any) => {
    if (!currentRoomId) return

    const timeTaken = getRoomElapsedTime()
    const result = gameEngine.submitRoomResult(currentRoomId, payload, timeTaken)

    if (result.success) {
      setGameState('result_success')
      setResultData({
        success: true,
        message: result.message,
        learning: result.learning,
      })
      setShowResult(true)

      // Check if there's an additional event (Room 2 red button)
      if (result.nextEvent) {
        setAdditionalEvent(result.nextEvent)
      }

      // Check if all rooms completed
      if (gameEngine.checkAllRoomsCompleted()) {
        setTimeout(() => {
          setShowCompletionModal(true)
        }, 2000)
      }
    } else {
      setGameState('result_fail')
      setResultData({
        success: false,
        message: result.message,
      })
      setShowResult(true)
    }

    // Reload progress
    const updatedProgress = gameEngine.getGameState()
    if (updatedProgress) {
      setPlayerProgress(updatedProgress)
    }
  }, [currentRoomId, getRoomElapsedTime, setGameState, setPlayerProgress])

  // Handle additional event submission
  const handleAdditionalEventSubmit = useCallback((eventChoiceId: string) => {
    if (!additionalEvent || !currentRoomId) return

    const outcome = additionalEvent.outcomes[eventChoiceId]
    if (outcome) {
      setToast({ message: outcome.learning, type: 'success' })
    }

    setAdditionalEvent(null)
  }, [additionalEvent, currentRoomId])

  // Continue to next room
  const continueToNextRoom = useCallback(() => {
    setShowResult(false)
    setResultData(null)

    const progress = gameEngine.getGameState()
    if (progress && progress.currentRoomId) {
      const room = gameEngine.getRoomById(progress.currentRoomId)
      if (room) {
        setCurrentRoom(progress.currentRoomId, room)
        setGameState('briefing')
        setShowBriefing(true)
      }
    }
  }, [setCurrentRoom, setGameState])

  // Retry current room
  const retryRoom = useCallback(() => {
    setShowResult(false)
    setResultData(null)
    setGameState('playing')
    startRoomTimer()
  }, [setGameState, startRoomTimer])

  // Handle pause
  const handlePause = useCallback(() => {
    setShowPauseModal(true)
  }, [])

  // Handle exit
  const handleExit = useCallback(() => {
    router.push('/')
  }, [router])

  // Render puzzle based on room type
  const renderPuzzle = () => {
    if (!currentRoomConfig) return null

    switch (currentRoomConfig.type) {
      case 'reorder':
        return (
          <ReorderPuzzle
            items={currentRoomConfig.task.items}
            correctOrder={currentRoomConfig.task.correctOrder}
            onSubmit={(order) => handleRoomSubmit({ order })}
            disabled={gameState !== 'playing'}
          />
        )

      case 'timed-choice':
        return (
          <TimedChoice
            choices={currentRoomConfig.task.choices}
            timeLimit={currentRoomConfig.task.timeLimitSeconds}
            onSubmit={(choiceId) => handleRoomSubmit({ choiceId })}
            onTimeout={() => handleRoomSubmit({ choiceId: 'timeout' })}
            disabled={gameState !== 'playing'}
          />
        )

      case 'multi-step':
        return (
          <ConnectNodesPuzzle
            step1Choices={currentRoomConfig.task.steps[0].choices}
            onSubmit={(step1Choice, puzzleCompleted) =>
              handleRoomSubmit({ step1Choice, puzzleCompleted })
            }
            disabled={gameState !== 'playing'}
          />
        )

      case 'matching-choice':
        return (
          <MatchingChoice
            pairs={currentRoomConfig.task.pairs}
            powerUpChoices={currentRoomConfig.task.powerUpChoices}
            onSubmit={(powerUpChoice) => handleRoomSubmit({ powerUpChoice })}
            disabled={gameState !== 'playing'}
          />
        )

      case 'choice-final':
        return (
          <FinalPuzzle
            mainChoices={currentRoomConfig.task.choices}
            finalQuestion={currentRoomConfig.finalPuzzle.instruction}
            finalChoices={currentRoomConfig.finalPuzzle.choices}
            onSubmit={(mainChoice, finalChoice) =>
              handleRoomSubmit({ mainChoice, finalChoice })
            }
            disabled={gameState !== 'playing'}
          />
        )

      default:
        return <div className="text-center">Unknown puzzle type</div>
    }
  }

  // Get rooms for HUD
  const rooms = gameEngine.getRooms().map((room) => ({
    id: room.id,
    title: room.roomTitle,
    value: room.value,
    status: playerProgress?.rooms[room.id]?.status || 'locked',
  }))

  const currentRoomIndex = currentRoomId
    ? gameEngine.getRoomIds().indexOf(currentRoomId) + 1
    : 0

  // Map room IDs to badge images
  const roomBadges: Record<string, string> = {
    room1_helm: '/assets/placeholders/room-helm.gif',
    room2_firewall: '/assets/placeholders/room-firewall.gif',
    room3_one_team: '/assets/placeholders/room-connection.gif',
    room4_upgrade: '/assets/placeholders/room-upgrade.gif',
    room5_innovation: '/assets/placeholders/room-innovation.gif',
  }

  return (
    <>
      <Header
        currentRoomIndex={currentRoomIndex}
        totalRooms={5}
        onPause={handlePause}
        onExit={handleExit}
        showProgress={true}
      />

      <HUD rooms={rooms} currentRoomId={currentRoomId || undefined}>
        {gameState === 'playing' && currentRoomConfig && (
          <RoomStage
            roomTitle={currentRoomConfig.roomTitle}
            roomValue={currentRoomConfig.value}
            instruction={currentRoomConfig.task.instruction}
            onHint={() => {
              if (currentRoomId) {
                gameEngine.useHint(currentRoomId)
                const hint = currentRoomConfig?.onSuccess?.learning || 'Think carefully about the values — what would a great teammate do?'
                setToast({ message: `💡 Hint: ${hint}`, type: 'info' })
              }
            }}
            hintAvailable={true}
            hintsUsed={playerProgress?.rooms[currentRoomId!]?.hintsUsed || 0}
            showTimer={currentRoomConfig.task.timeLimitSeconds !== null}
            timeRemaining={timeRemaining}
          >
            {renderPuzzle()}
          </RoomStage>
        )}

        {gameState === 'briefing' && <div className="text-center">Loading briefing...</div>}
      </HUD>

      {/* Mission Briefing — HX Branded */}
      <AnimatePresence>
        {showBriefing && currentRoomConfig && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />

            {/* Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl shadow-2xl font-nunito"
              style={{ boxShadow: '0 25px 60px rgba(84,46,145,0.45), 0 8px 24px rgba(0,0,0,0.4)' }}
            >
              {/* ── Purple Header ── */}
              <div
                className="relative px-8 pt-8 pb-10 text-white text-center overflow-hidden"
                style={{ background: 'linear-gradient(140deg, #6b3aad 0%, #542E91 45%, #3a1d6e 100%)' }}
              >
                {/* Decorative blobs */}
                <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(253,220,6,0.18) 0%, transparent 70%)' }} />
                <div className="absolute -bottom-16 -left-10 w-52 h-52 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(253,220,6,0.12) 0%, transparent 70%)' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 60%)' }} />

                {/* MISSION BRIEFING badge */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-5 text-xs font-black tracking-widest uppercase relative"
                  style={{ background: 'rgba(253,220,6,0.15)', border: '1px solid rgba(253,220,6,0.5)', color: '#FDDC06' }}
                >
                  <span>⚡</span> Mission Briefing
                </motion.div>

                {/* GIF — on dark purple, now fully visible */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex justify-center mb-5 relative"
                >
                  <div
                    className="w-32 h-32 relative rounded-2xl overflow-hidden"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '2px solid rgba(253,220,6,0.4)',
                      boxShadow: '0 0 30px rgba(253,220,6,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                    }}
                  >
                    <Image
                      src={roomBadges[currentRoomConfig.id] || '/assets/placeholders/room-helm.gif'}
                      alt={currentRoomConfig.value}
                      fill
                      className="object-contain p-2"
                      unoptimized
                    />
                  </div>
                </motion.div>

                {/* Room number */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-xs font-bold tracking-widest uppercase mb-1"
                  style={{ color: 'rgba(253,220,6,0.75)' }}
                >
                  Room {currentRoomIndex} of 5
                </motion.p>

                {/* Room title */}
                <motion.h2
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22 }}
                  className="text-3xl font-black tracking-tight mb-4 leading-tight"
                >
                  {currentRoomConfig.roomTitle}
                </motion.h2>

                {/* Value pill */}
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.28 }}
                  className="inline-flex items-center px-5 py-1.5 rounded-full text-sm font-black"
                  style={{ background: '#FDDC06', color: '#232323' }}
                >
                  {currentRoomConfig.value}
                </motion.span>

                {/* Room progress dots */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.32 }}
                  className="flex justify-center gap-2 mt-5"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div
                      key={n}
                      className="rounded-full transition-all"
                      style={{
                        width: n === currentRoomIndex ? 20 : 8,
                        height: 8,
                        background: n < currentRoomIndex
                          ? '#FDDC06'
                          : n === currentRoomIndex
                          ? '#FDDC06'
                          : 'rgba(255,255,255,0.25)',
                        opacity: n < currentRoomIndex ? 0.6 : 1,
                      }}
                    />
                  ))}
                </motion.div>
              </div>

              {/* ── White Body ── */}
              <div className="bg-white px-7 py-6 space-y-5">
                {/* Objective */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                  className="rounded-xl p-4"
                  style={{ background: '#F0F0F0', borderLeft: '4px solid #542E91' }}
                >
                  <p className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: '#542E91' }}>
                    Your Objective
                  </p>
                  <p className="text-gray-700 font-semibold leading-relaxed text-sm">
                    {currentRoomConfig.task.instruction}
                  </p>
                </motion.div>

                {/* CTA */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={startCurrentRoom}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-4 rounded-2xl text-lg font-black tracking-wide transition-shadow"
                  style={{
                    background: '#FDDC06',
                    color: '#232323',
                    boxShadow: '0 4px 20px rgba(253,220,6,0.5)',
                  }}
                >
                  ⚡ Start Challenge
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Result Modal */}
      <Modal
        isOpen={showResult}
        onClose={() => {}}
        closeOnOverlayClick={false}
        showCloseButton={false}
        title={resultData?.success ? '✅ Mission Success' : '⚠️ Try Again'}
        size="lg"
      >
        {resultData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">
                {resultData.success ? '🎉' : '🔄'}
              </div>
              <p className="text-xl font-semibold mb-4">{resultData.message}</p>

              {resultData.learning && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-500 p-4 rounded-lg">
                  <p className="text-blue-800 dark:text-blue-200 italic">
                    &quot;{resultData.learning}&quot;
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-center">
              {resultData.success ? (
                <Button size="lg" onClick={continueToNextRoom}>
                  Continue
                </Button>
              ) : (
                <>
                  <Button variant="secondary" onClick={handleExit}>
                    Exit
                  </Button>
                  <Button size="lg" onClick={retryRoom}>
                    Retry
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </Modal>

      {/* Additional Event Modal (Room 2 Red Button) */}
      <Modal
        isOpen={!!additionalEvent}
        onClose={() => {}}
        closeOnOverlayClick={false}
        showCloseButton={false}
        title={additionalEvent?.instruction}
        size="md"
      >
        {additionalEvent && (
          <div className="space-y-6">
            <div className="text-center text-6xl">🔴</div>

            <div className="flex gap-3 justify-center">
              {additionalEvent.choices.map((choice: any) => (
                <Button
                  key={choice.id}
                  size="lg"
                  onClick={() => handleAdditionalEventSubmit(choice.id)}
                >
                  {choice.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Pause Modal */}
      <Modal
        isOpen={showPauseModal}
        onClose={() => setShowPauseModal(false)}
        title="Game Paused"
      >
        <div className="space-y-4 text-center">
          <p className="text-gray-700 dark:text-gray-300">
            Your progress is automatically saved. Take your time!
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => setShowPauseModal(false)}>Resume</Button>
            <Button variant="secondary" onClick={handleExit}>
              Exit to Menu
            </Button>
          </div>
        </div>
      </Modal>

      {/* Completion Modal */}
      <Modal
        isOpen={showCompletionModal}
        onClose={() => {}}
        closeOnOverlayClick={false}
        showCloseButton={false}
        title="🏆 Mission Complete"
        size="xl"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="text-8xl"
          >
            🎉
          </motion.div>

          <div>
            <h2 className="text-3xl font-bold mb-4">
              All Five HX Values Restored!
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
              The AI Core is now fully operational. You&apos;ve successfully demonstrated all 
              five Holiday Extras values through your choices and problem-solving.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg border border-blue-500">
            <h3 className="font-semibold text-lg mb-3">Your Score</h3>
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {playerProgress?.totalScore || 0}
            </p>
          </div>

          <div className="flex gap-3 justify-center pt-4">
            <Button size="lg" onClick={handleExit}>
              Back to Menu
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                gameEngine.resetGame()
                window.location.reload()
              }}
            >
              Play Again
            </Button>
          </div>
        </motion.div>
      </Modal>

      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={true}
          onClose={() => setToast(null)}
          duration={3000}
        />
      )}
    </>
  )
}
