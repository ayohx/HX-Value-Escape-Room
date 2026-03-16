'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProgressBar from '@/components/ui/ProgressBar'

// HX brand logos — cycling every 5 seconds
const HX_LOGOS = [
  {
    src: 'https://static1.holidayextras.com/images/holidayextras/holiday-extras-logo-415.png',
    alt: 'Holiday Extras',
  },
  {
    src: 'https://dmy0b9oeprz0f.cloudfront.net/holidayextras.co.uk/brand-guidelines/logos-anim.gif',
    alt: 'Holiday Extras animated',
  },
  {
    src: 'https://hximagecloud.imgix.net/holidayextras.co.uk/brand-guidelines/holiday-extras-brand-stacked-logo-usage-background-colour.png',
    alt: 'Holiday Extras on colour',
  },
  {
    src: 'https://hximagecloud.imgix.net/holidayextras.co.uk/brand-guidelines/holiday-extras-brand-stacked-logo-usage-background-yellow.png',
    alt: 'Holiday Extras on yellow',
  },
]

interface HeaderProps {
  currentRoomIndex?: number
  totalRooms?: number
  onPause?: () => void
  onExit?: () => void
  onReset?: () => void
  showProgress?: boolean
}

export default function Header({
  currentRoomIndex = 0,
  totalRooms = 5,
  onPause,
  onExit,
  onReset,
  showProgress = true,
}: HeaderProps) {
  const progress = totalRooms > 0 ? (currentRoomIndex / totalRooms) * 100 : 0
  const [logoIndex, setLogoIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setLogoIndex((prev) => (prev + 1) % HX_LOGOS.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="text-white border-b border-gray-700/50"
      style={{ background: 'linear-gradient(90deg, #2d1550 0%, #1a0d30 50%, #0f0820 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left: Rotating HX Logo */}
          <div className="flex items-center">
            <div className="relative w-36 h-10 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={logoIndex}
                  src={HX_LOGOS[logoIndex].src}
                  alt={HX_LOGOS[logoIndex].alt}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 w-full h-full object-contain object-left"
                  onError={(e) => {
                    // Fallback to next logo if image fails to load
                    setLogoIndex((prev) => (prev + 1) % HX_LOGOS.length)
                  }}
                />
              </AnimatePresence>
            </div>
          </div>

          {/* Center: Progress */}
          {showProgress && (
            <div className="hidden md:flex items-center space-x-3 flex-1 max-w-md mx-8">
              <span className="text-sm font-bold whitespace-nowrap" style={{ color: 'rgba(253,220,6,0.9)' }}>
                Room {currentRoomIndex} / {totalRooms}
              </span>
              <div className="flex-1">
                <ProgressBar
                  value={progress}
                  size="sm"
                  variant="success"
                  animate={false}
                />
              </div>
            </div>
          )}

          {/* Right: Actions */}
          <div className="flex items-center space-x-1">
            {/* Reset button */}
            {onReset && (
              <button
                onClick={onReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all hover:bg-white/10 active:scale-95"
                style={{ color: 'rgba(253,220,6,0.85)' }}
                aria-label="Reset game"
                title="Reset to Room 1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}

            {onPause && (
              <button
                onClick={onPause}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all hover:bg-white/10 active:scale-95 text-white"
                aria-label="Pause"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">Pause</span>
              </button>
            )}

            {onExit && (
              <button
                onClick={onExit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all hover:bg-white/10 active:scale-95 text-white/80"
                aria-label="Exit"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Exit</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile progress */}
        {showProgress && (
          <div className="md:hidden pb-3">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-bold whitespace-nowrap" style={{ color: 'rgba(253,220,6,0.9)' }}>
                Room {currentRoomIndex} / {totalRooms}
              </span>
              <div className="flex-1">
                <ProgressBar value={progress} size="sm" variant="success" animate={false} />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
