'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
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
  const [matchedPairs, setMatchedPairs] = useState<Set<number>>(new Set())
  const [selectedPowerUp, setSelectedPowerUp] = useState<string | null>(null)
  const [showPowerUps, setShowPowerUps] = useState(false)

  const toggleMatch = (index: number) => {
    if (disabled) return

    const newMatched = new Set(matchedPairs)
    if (newMatched.has(index)) {
      newMatched.delete(index)
    } else {
      newMatched.add(index)
    }
    setMatchedPairs(newMatched)

    // Show power-ups when all pairs are matched
    if (newMatched.size === pairs.length) {
      setTimeout(() => setShowPowerUps(true), 500)
    } else {
      setShowPowerUps(false)
    }
  }

  const handleSubmit = () => {
    if (selectedPowerUp && !disabled) {
      onSubmit(selectedPowerUp)
    }
  }

  const allPairsMatched = matchedPairs.size === pairs.length

  return (
    <div className="space-y-8">
      {/* Matching pairs */}
      <div className="space-y-4">
        <p className="text-lg font-medium text-gray-800 dark:text-gray-200 text-center mb-6">
          Match your "old you" to your upgraded self
        </p>

        <div className="space-y-4">
          {pairs.map((pair, index) => {
            const isMatched = matchedPairs.has(index)

            return (
              <motion.button
                key={index}
                onClick={() => toggleMatch(index)}
                disabled={disabled}
                className={`
                  w-full p-6 rounded-lg border-2 transition-all
                  ${
                    isMatched
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 shadow-lg'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-purple-400 hover:shadow-md'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-600
                `}
                whileHover={!disabled ? { scale: 1.02 } : {}}
                whileTap={!disabled ? { scale: 0.98 } : {}}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                aria-label={`${isMatched ? 'Matched' : 'Match'} ${pair.left} to ${pair.right}`}
                aria-pressed={isMatched}
              >
                <div className="flex items-center justify-between gap-6">
                  {/* Left side */}
                  <div className="flex-1 text-left">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Old You
                    </div>
                    <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {pair.left}
                    </div>
                  </div>

                  {/* Arrow / Check */}
                  <motion.div
                    className="flex-shrink-0"
                    animate={isMatched ? { rotate: 360 } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {isMatched ? (
                      <svg
                        className="w-10 h-10 text-purple-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-10 h-10 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    )}
                  </motion.div>

                  {/* Right side */}
                  <div className="flex-1 text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Upgraded You
                    </div>
                    <div className="text-xl font-semibold text-purple-700 dark:text-purple-300">
                      {pair.right}
                    </div>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>

        {allPairsMatched && !showPowerUps && (
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
      </div>

      {/* Power-up selection */}
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
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
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
                    focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-600
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

      {/* Submit button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={handleSubmit}
          disabled={!allPairsMatched || !selectedPowerUp || disabled}
          size="lg"
          className="min-w-[200px]"
        >
          Complete Upgrade
        </Button>
      </div>
    </div>
  )
}

