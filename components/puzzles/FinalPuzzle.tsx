'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'

interface Choice {
  id: string
  label: string
}

interface FinalPuzzleProps {
  mainChoices: Choice[]
  finalQuestion: string
  finalChoices: Choice[]
  onSubmit: (mainChoice: string, finalChoice: string) => void
  disabled?: boolean
}

export default function FinalPuzzle({
  mainChoices,
  finalQuestion,
  finalChoices,
  onSubmit,
  disabled = false,
}: FinalPuzzleProps) {
  const [mainChoice, setMainChoice] = useState<string | null>(null)
  const [showFinalQuestion, setShowFinalQuestion] = useState(false)
  const [finalChoice, setFinalChoice] = useState<string | null>(null)

  const handleMainChoice = (choiceId: string) => {
    if (disabled) return
    setMainChoice(choiceId)
    setTimeout(() => setShowFinalQuestion(true), 800)
  }

  const handleSubmit = () => {
    if (mainChoice && finalChoice && !disabled) {
      onSubmit(mainChoice, finalChoice)
    }
  }

  return (
    <div className="space-y-8">
      {/* Main innovation choice */}
      <div className="space-y-4">
        <p className="text-lg font-medium text-gray-800 dark:text-gray-200 text-center mb-6">
          Which new concept will you develop?
        </p>

        <div className="space-y-3">
          {mainChoices.map((choice, index) => {
            const isSelected = mainChoice === choice.id

            return (
              <motion.button
                key={choice.id}
                onClick={() => handleMainChoice(choice.id)}
                disabled={disabled || mainChoice !== null}
                className={`
                  w-full p-6 rounded-lg border-2 text-left transition-all
                  ${
                    isSelected
                      ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/20 shadow-lg'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-orange-400 hover:shadow-md'
                  }
                  ${disabled || mainChoice !== null ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-600
                `}
                whileHover={!disabled && mainChoice === null ? { scale: 1.02 } : {}}
                whileTap={!disabled && mainChoice === null ? { scale: 0.98 } : {}}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                      ${
                        isSelected
                          ? 'border-orange-600 bg-orange-600'
                          : 'border-gray-400 dark:border-gray-500'
                      }
                    `}
                  >
                    {isSelected && (
                      <motion.div
                        className="w-3 h-3 rounded-full bg-white"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      />
                    )}
                  </div>
                  <div className="flex-1 text-lg font-medium text-gray-900 dark:text-gray-100">
                    {choice.label}
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Final philosophical question */}
      {showFinalQuestion && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 p-6 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-2 border-orange-500 rounded-xl"
        >
          <div className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-block text-6xl mb-4"
            >
              💡
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {finalQuestion}
            </h3>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6"
            role="radiogroup"
            aria-label={finalQuestion}
          >
            {finalChoices.map((choice, index) => {
              const isSelected = finalChoice === choice.id

              return (
                <motion.button
                  key={choice.id}
                  onClick={() => !disabled && setFinalChoice(choice.id)}
                  disabled={disabled}
                  className={`
                    p-6 rounded-lg border-2 transition-all
                    ${
                      isSelected
                        ? 'border-orange-600 bg-white dark:bg-gray-800 shadow-2xl scale-105'
                        : 'border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 hover:border-orange-400 hover:shadow-lg'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-600
                  `}
                  whileHover={!disabled ? { scale: 1.08, y: -5 } : {}}
                  whileTap={!disabled ? { scale: 0.95 } : {}}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  role="radio"
                  aria-checked={isSelected}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">
                      {choice.id === 'success' && '🏆'}
                      {choice.id === 'failure' && '💥'}
                      {choice.id === 'luck' && '🍀'}
                    </div>
                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {choice.label}
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Submit button */}
      {showFinalQuestion && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center pt-4"
        >
          <Button
            onClick={handleSubmit}
            disabled={!mainChoice || !finalChoice || disabled}
            size="lg"
            className="min-w-[250px] text-lg"
          >
            🚀 Complete Innovation
          </Button>
        </motion.div>
      )}
    </div>
  )
}

