'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'

interface Pair {
  left: string
  right: string
}

interface PowerUp {
  id: string
  label: string
}

interface MatchingChoiceProps {
  pairs: Pair[]
  powerUpChoices: PowerUp[]
  onSubmit: (powerUpChoice: string) => void
  disabled?: boolean
}

export default function MatchingChoice({
  pairs,
  powerUpChoices,
  onSubmit,
  disabled = false,
}: MatchingChoiceProps) {
  // Extract left and right values
  const leftTraits = pairs.map(p => p.left)
  const rightTraits = pairs.map(p => p.right)
  
  // Shuffle right traits for the challenge
  const [shuffledRight] = useState(() => [...rightTraits].sort(() => Math.random() - 0.5))
  
  // Track matches: { "Hesitant": "Proactive", "Comfortable": null }
  const [matches, setMatches] = useState<Record<string, string | null>>(() => {
    const initial: Record<string, string | null> = {}
    leftTraits.forEach(trait => initial[trait] = null)
    return initial
  })
  
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [selectedRight, setSelectedRight] = useState<string | null>(null)
  const [usedRight, setUsedRight] = useState<Set<string>>(new Set())
  const [showPowerUps, setShowPowerUps] = useState(false)
  const [selectedPowerUp, setSelectedPowerUp] = useState<string | null>(null)

  // Check if all matches are correct
  const checkMatches = useCallback(() => {
    return pairs.every(pair => matches[pair.left] === pair.right)
  }, [pairs, matches])

  // Handle clicking a left trait
  const handleLeftClick = (trait: string) => {
    if (disabled) return
    setSelectedLeft(trait)
    setSelectedRight(null)
  }

  // Handle clicking a right trait
  const handleRightClick = (trait: string) => {
    if (disabled || usedRight.has(trait)) return
    
    if (selectedLeft) {
      // Make the match
      setMatches(prev => ({ ...prev, [selectedLeft]: trait }))
      setUsedRight(prev => new Set([...prev, trait]))
      setSelectedLeft(null)
      setSelectedRight(null)
    } else {
      setSelectedRight(trait)
    }
  }

  // Handle unmatching
  const handleUnmatch = (leftTrait: string) => {
    if (disabled) return
    const matchedRight = matches[leftTrait]
    if (matchedRight) {
      setMatches(prev => ({ ...prev, [leftTrait]: null }))
      setUsedRight(prev => {
        const newSet = new Set(prev)
        newSet.delete(matchedRight)
        return newSet
      })
    }
  }

  // Check if all correct when matches change
  useEffect(() => {
    if (Object.values(matches).every(m => m !== null)) {
      const allCorrect = checkMatches()
      if (allCorrect) {
        setTimeout(() => setShowPowerUps(true), 500)
      }
    }
  }, [matches, checkMatches])

  const isCorrectMatch = (left: string, right: string | null) => {
    if (!right) return false
    const pair = pairs.find(p => p.left === left)
    return pair?.right === right
  }

  const allMatched = Object.values(matches).every(m => m !== null)
  const allCorrect = checkMatches()

  const handleSubmit = () => {
    if (selectedPowerUp && !disabled) {
      onSubmit(selectedPowerUp)
    }
  }

  return (
    <div className="space-y-8">
      {/* Instructions */}
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
          Match your &quot;old you&quot; to your upgraded self
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Click a trait on the left, then click its match on the right
        </p>
      </div>

      {/* Matching Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Left Side - Old You */}
        <div className="space-y-4">
          <h3 className="text-center font-bold text-gray-700 dark:text-gray-300 mb-4">
            Old You
          </h3>
          {leftTraits.map((trait) => {
            const matchedRight = matches[trait]
            const isSelected = selectedLeft === trait
            const isMatched = matchedRight !== null
            const isCorrect = isCorrectMatch(trait, matchedRight)

            return (
              <motion.button
                key={trait}
                onClick={() => isMatched ? handleUnmatch(trait) : handleLeftClick(trait)}
                disabled={disabled}
                className={`
                  w-full p-4 rounded-lg border-2 text-left transition-all relative
                  ${isSelected ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 scale-105' : ''}
                  ${isMatched && isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}
                  ${isMatched && !isCorrect ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}
                  ${!isSelected && !isMatched ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-purple-400' : ''}
                  ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                `}
                whileHover={!disabled && !isMatched ? { scale: 1.02 } : {}}
                whileTap={!disabled ? { scale: 0.98 } : {}}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {trait}
                  </span>
                  
                  {isMatched && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-2"
                    >
                      {isCorrect ? (
                        <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </motion.div>
                  )}
                </div>
                
                {/* Show matched trait */}
                {isMatched && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mt-2 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                      {matchedRight}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleUnmatch(trait)
                      }}
                      className="ml-auto text-xs text-gray-500 hover:text-red-500"
                    >
                      ✕ Remove
                    </button>
                  </motion.div>
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Right Side - Upgraded You */}
        <div className="space-y-4">
          <h3 className="text-center font-bold text-gray-700 dark:text-gray-300 mb-4">
            Upgraded You
          </h3>
          {shuffledRight.map((trait) => {
            const isUsed = usedRight.has(trait)
            const isSelected = selectedRight === trait

            return (
              <motion.button
                key={trait}
                onClick={() => handleRightClick(trait)}
                disabled={disabled || isUsed}
                className={`
                  w-full p-4 rounded-lg border-2 text-center transition-all
                  ${isSelected ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 scale-105' : ''}
                  ${isUsed ? 'opacity-30 border-gray-200 dark:border-gray-700 cursor-not-allowed' : ''}
                  ${!isSelected && !isUsed ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-purple-400' : ''}
                  ${disabled ? 'cursor-not-allowed' : !isUsed ? 'cursor-pointer' : ''}
                `}
                whileHover={!disabled && !isUsed ? { scale: 1.02 } : {}}
                whileTap={!disabled && !isUsed ? { scale: 0.98 } : {}}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: isUsed ? 0.3 : 1, x: 0 }}
                transition={{ delay: shuffledRight.indexOf(trait) * 0.1 }}
              >
                <span className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                  {trait}
                </span>
                {isUsed && (
                  <span className="block text-xs text-gray-500 mt-1">✓ Matched</span>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Feedback */}
      {allMatched && !allCorrect && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-500 rounded-lg"
        >
          <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
            🤔 Not quite right! Try matching again.
          </p>
        </motion.div>
      )}

      {allMatched && allCorrect && !showPowerUps && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-500 rounded-lg"
        >
          <p className="text-purple-800 dark:text-purple-200 font-semibold">
            ✨ Perfect matching! Now choose your power-up...
          </p>
        </motion.div>
      )}

      {/* Power-up selection */}
      <AnimatePresence>
        {showPowerUps && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <p className="text-lg font-medium text-gray-800 dark:text-gray-200 text-center mb-4">
              Choose your power-up trait
            </p>

            <div
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
              role="radiogroup"
              aria-label="Choose a power-up trait"
            >
              {powerUpChoices.map((powerUp, index) => {
                const isSelected = selectedPowerUp === powerUp.id

                return (
                  <motion.button
                    key={powerUp.id}
                    onClick={() => !disabled && setSelectedPowerUp(powerUp.id)}
                    disabled={disabled}
                    className={`
                      p-6 rounded-lg border-2 transition-all
                      ${
                        isSelected
                          ? 'border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 shadow-lg'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-yellow-400 hover:shadow-md'
                      }
                      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    whileHover={!disabled ? { scale: 1.05 } : {}}
                    whileTap={!disabled ? { scale: 0.95 } : {}}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    role="radio"
                    aria-checked={isSelected}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <div
                        className={`
                          w-8 h-8 rounded-full border-2 flex items-center justify-center
                          ${
                            isSelected
                              ? 'border-yellow-600 bg-yellow-600'
                              : 'border-gray-400 dark:border-gray-500'
                          }
                        `}
                      >
                        {isSelected && (
                          <motion.div
                            className="w-4 h-4 rounded-full bg-white"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          />
                        )}
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {powerUp.label}
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={handleSubmit}
          disabled={!allCorrect || !selectedPowerUp || disabled}
          size="lg"
          className="min-w-[200px]"
        >
          Complete Upgrade
        </Button>
      </div>
    </div>
  )
}
