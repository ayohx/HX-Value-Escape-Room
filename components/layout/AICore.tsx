'use client'

import { motion } from 'framer-motion'
import { RoomStatus } from '@/lib/types'

interface AICoreProps {
  rooms: {
    id: string
    title: string
    value: string
    status: RoomStatus
    gif?: string
  }[]
  currentRoomId?: string
  onRoomClick?: (roomId: string) => void
}

export default function AICore({ rooms, currentRoomId, onRoomClick }: AICoreProps) {
  const completedCount = rooms.filter((r) => r.status === 'completed').length
  const allCompleted = completedCount === rooms.length

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg border border-gray-700">
      {/* AI Core Visual */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-center">AI Core Status</h3>
        <div className="relative w-32 h-32 mx-auto">
          {/* Central core */}
          <motion.div
            className={`absolute inset-0 rounded-full border-4 ${
              allCompleted
                ? 'border-green-500 bg-green-500/20'
                : 'border-gray-600 bg-gray-700/20'
            }`}
            animate={{
              scale: allCompleted ? [1, 1.05, 1] : 1,
              boxShadow: allCompleted
                ? [
                    '0 0 20px rgba(34, 197, 94, 0.5)',
                    '0 0 40px rgba(34, 197, 94, 0.8)',
                    '0 0 20px rgba(34, 197, 94, 0.5)',
                  ]
                : 'none',
            }}
            transition={{
              duration: 2,
              repeat: allCompleted ? Infinity : 0,
              ease: 'easeInOut',
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">
                {completedCount}/{rooms.length}
              </span>
            </div>
          </motion.div>

          {/* Value indicators around core */}
          {rooms.map((room, index) => {
            const angle = (index / rooms.length) * 360
            const radius = 70
            const x = Math.cos((angle * Math.PI) / 180) * radius
            const y = Math.sin((angle * Math.PI) / 180) * radius

            return (
              <motion.div
                key={room.id}
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    room.status === 'completed'
                      ? 'bg-green-500 animate-pulse-slow'
                      : room.status === 'in_progress'
                      ? 'bg-yellow-500 animate-pulse'
                      : 'bg-gray-600'
                  }`}
                  title={room.value}
                />
              </motion.div>
            )
          })}
        </div>

        <p className="text-center text-sm text-gray-400 mt-4">
          {allCompleted
            ? '🎉 All systems online!'
            : `${completedCount} of ${rooms.length} values restored`}
        </p>
      </div>

      {/* Room list */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-400 mb-3">Mission Progress</h4>
        {rooms.map((room) => {
          const isCurrent = room.id === currentRoomId
          const isClickable = room.status !== 'locked' && onRoomClick

          return (
            <motion.button
              key={room.id}
              onClick={() => isClickable && onRoomClick(room.id)}
              disabled={!isClickable}
              animate={isCurrent ? {
                boxShadow: [
                  '0 0 0px rgba(59,130,246,0)',
                  '0 0 8px rgba(59,130,246,0.6)',
                  '0 0 0px rgba(59,130,246,0)',
                ]
              } : {}}
              transition={isCurrent ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
              className={`
                w-full text-left p-3 rounded-lg border transition-all
                ${
                  isCurrent
                    ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/40'
                    : room.status === 'completed'
                    ? 'border-green-500/50 bg-green-500/5'
                    : room.status === 'locked'
                    ? 'border-gray-700 bg-gray-800/50 opacity-50'
                    : 'border-gray-700 bg-gray-800/50'
                }
                ${isClickable ? 'hover:bg-gray-700/50 cursor-pointer' : 'cursor-default'}
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600
              `}
              aria-label={`${room.value}: ${room.status}`}
              aria-current={isCurrent ? 'location' : undefined}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium">{room.title}</div>
                  <div className="text-xs text-gray-400 mt-1">{room.value}</div>
                </div>
                <div className="ml-3 flex-shrink-0 relative w-10 h-10">
                  {room.gif ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={room.gif}
                        alt=""
                        aria-hidden="true"
                        className="w-10 h-10 rounded-lg object-cover"
                        style={{ opacity: room.status === 'locked' ? 0.25 : 1 }}
                      />
                      {room.status === 'completed' && (
                        <div className="absolute inset-0 rounded-lg bg-green-500/30 flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </>
                  ) : (
                    /* fallback if no gif */
                    <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">
                      {room.status === 'locked' && (
                        <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}


