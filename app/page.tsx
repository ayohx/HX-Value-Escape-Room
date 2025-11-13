'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'

export default function Home() {
  const [showHowToPlay, setShowHowToPlay] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 text-white">
      <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
        <motion.div
          className="max-w-3xl text-center space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Title */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-4">
              Holiday Extras <br />
              <span className="text-blue-400">Arcade Escape Room</span>
            </h1>
          </motion.div>

          {/* Mission brief */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 sm:p-8"
          >
            <p className="text-lg sm:text-xl leading-relaxed">
              The AI Core has malfunctioned! Navigate through five interactive challenges, 
              each representing a core Holiday Extras value. Restore all five values to reboot 
              the system and complete your mission.
            </p>
          </motion.div>

          {/* Values preview */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm"
          >
            {[
              'Be At The Helm',
              'Be Courageous',
              'Be One Team',
              'Be The Best Version of You',
              'Be Pioneering in Spirit',
            ].map((value, index) => (
              <motion.div
                key={value}
                className="bg-white/5 border border-white/10 rounded-md p-3 hover:bg-white/10 transition-colors"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="font-medium">{value}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Link href="/play">
              <Button size="lg" className="min-w-[200px] text-lg">
                Enter Arcade
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="lg"
              onClick={() => setShowHowToPlay(true)}
              className="text-white border-2 border-white/30 hover:bg-white/10 min-w-[200px]"
            >
              How to Play
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* How to Play Modal */}
      <Modal
        isOpen={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
        title="How to Play"
        size="lg"
      >
        <div className="space-y-4 text-gray-700 dark:text-gray-300">
          <section>
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
              Objective
            </h3>
            <p>
              Complete all five rooms to restore the Holiday Extras values and reboot the AI Core. 
              Each room represents one of our core values and contains a unique puzzle or challenge.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
              Controls
            </h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Use your mouse to click and interact with elements</li>
              <li>Keyboard: Arrow keys, Enter, and Space for navigation</li>
              <li>Drag and drop items to reorder them in puzzles</li>
              <li>Some rooms are timed - work quickly!</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
              Features
            </h3>
            <ul className="list-disc list-inside space-y-1">
              <li>💡 One hint available per room</li>
              <li>💾 Progress is automatically saved</li>
              <li>♿ Fully keyboard accessible</li>
              <li>📱 Works on mobile and desktop</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
              Tips
            </h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Read the instructions carefully in each room</li>
              <li>Think about the Holiday Extras value each room represents</li>
              <li>Use hints wisely - they reduce your final score</li>
              <li>Some rooms have branching paths based on your choices</li>
            </ul>
          </section>
        </div>
      </Modal>
    </main>
  )
}

