'use client'

import { useState } from 'react'
import { CardFace } from './CardFace'
import { CardNavigation } from './CardNavigation'

import type { StudyCard as Card } from '@/types/content'

interface CardViewerProps {
  card: Card
  template?: { content: string } | null
  cardIndex: number
  totalCards: number
  isFlipped: boolean
  onFlip: () => void
  onNext: () => void
  onPrevious: () => void
  canGoNext: boolean
  canGoPrevious: boolean
}

export function CardViewer({
  card,
  template,
  cardIndex,
  totalCards,
  isFlipped,
  onFlip,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious
}: CardViewerProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleFlip = () => {
    if (isAnimating) return

    setIsAnimating(true)
    onFlip()

    // アニメーション完了を待つ(duration-calm = 400ms)
    setTimeout(() => {
      setIsAnimating(false)
    }, 400)
  }

  const handleNext = () => {
    if (isAnimating) return
    onNext()
  }

  const handlePrevious = () => {
    if (isAnimating) return
    onPrevious()
  }

  // キーボードショートカット
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      handleFlip()
    } else if (e.key === 'ArrowLeft' && canGoPrevious) {
      e.preventDefault()
      handlePrevious()
    } else if (e.key === 'ArrowRight' && canGoNext) {
      e.preventDefault()
      handleNext()
    }
  }

  return (
    <div
      className="space-y-6 focus:outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* カードエリア */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-2xl">
          <CardFace
            card={card}
            template={template}
            isFlipped={isFlipped}
            onClick={handleFlip}
            isAnimating={isAnimating}
            className="w-full h-80 md:h-96"
          />
        </div>
      </div>

      {/* ナビゲーション(index/total + ラベルなしの左右ボタンのみ) */}
      <div className="flex justify-center">
        <CardNavigation
          currentIndex={cardIndex}
          totalCards={totalCards}
          onPrevious={handlePrevious}
          onNext={handleNext}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
        />
      </div>
    </div>
  )
}