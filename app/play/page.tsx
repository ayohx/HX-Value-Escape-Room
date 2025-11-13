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
                setToast({ message: 'Hint available in next version!', type: 'info' })
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

      {/* Briefing Modal */}
      <Modal
        isOpen={showBriefing}
        onClose={() => {}}
        closeOnOverlayClick={false}
        showCloseButton={false}
        title="Mission Briefing"
        size="lg"
      >
        {currentRoomConfig && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 relative">
                  <Image
                    src={roomBadges[currentRoomConfig.id] || '/assets/placeholders/room-helm.gif'}
                    alt={currentRoomConfig.value}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">{currentRoomConfig.roomTitle}</h3>
              <p className="text-lg text-blue-600 dark:text-blue-400 font-semibold">
                {currentRoomConfig.value}
              </p>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">
                {currentRoomConfig.task.instruction}
              </p>
            </div>

            <div className="flex justify-center">
              <Button size="lg" onClick={startCurrentRoom}>
                Start Challenge
              </Button>
            </div>
          </motion.div>
        )}
      </Modal>

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
                    "{resultData.learning}"
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
              The AI Core is now fully operational. You've successfully demonstrated all 
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
