'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/Button'

const WELCOME_MESSAGES = [
  {
    text: '汝、ここに辿り着きし者よ...',
    delay: 1000,
  },
  {
    text: 'この地は知識と智慧の宝庫、\nLeplaの書庫なり',
    delay: 3000,
  },
  {
    text: 'しかし、ただ学ぶだけでは\n真の成長は望めぬ',
    delay: 5000,
  },
  {
    text: '汝自身の本質を知り、\nそれに従いて歩むことこそ\n変容への道なり',
    delay: 7000,
  },
  {
    text: '我は汝の内なる声を\n見つける手助けをしよう...',
    delay: 9000,
  },
]

export function WelcomeView() {
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    if (currentMessageIndex >= WELCOME_MESSAGES.length) {
      const timer = setTimeout(() => {
        setShowButton(true)
      }, 2000)
      return () => clearTimeout(timer)
    }

    const currentMessage = WELCOME_MESSAGES[currentMessageIndex]
    if (!currentMessage) return

    const timer = setTimeout(() => {
      setCurrentMessageIndex(prev => prev + 1)
    }, currentMessage.delay)

    return () => clearTimeout(timer)
  }, [currentMessageIndex])

  const handleContinue = () => {
    router.push('/onboarding/archetype-select')
  }

  const handleSkipIntro = () => {
    setCurrentMessageIndex(WELCOME_MESSAGES.length)
    setShowButton(true)
  }

  const currentMessage = WELCOME_MESSAGES[currentMessageIndex]

  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="mx-auto w-full max-w-ceremonial px-6 text-center">
        {/* メッセージエリア */}
        <div className="mb-16 flex min-h-60 items-center justify-center">
          <AnimatePresence mode="wait">
            {currentMessage && (
              <motion.p
                key={currentMessageIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.9,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="text-ceremonial whitespace-pre-line text-xl text-primary sm:text-2xl"
              >
                {currentMessage.text}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* ボタンエリア */}
        <div className="space-y-6">
          {showButton ? (
            <motion.div
              className="flex flex-col items-center gap-6"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.9,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <button
                type="button"
                onClick={handleContinue}
                className="w-full max-w-xs rounded-md bg-accent px-8 py-4 font-ceremonial text-sm tracking-ceremonial text-on-accent transition-colors duration-quick hover:bg-accent-hover"
              >
                汝の本質を見つける旅に出る
              </button>

              <p className="font-latin text-sm italic text-secondary">
                Every action is a vote for the type of person you wish to become
              </p>
            </motion.div>
          ) : (
            // スキップボタン（最初のメッセージ表示後に表示）
            currentMessageIndex >= 1 && (
              <Button variant="ghost" size="small" onClick={handleSkipIntro}>
                導入をスキップ
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  )
}
