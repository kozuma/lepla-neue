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
  isLastCard: boolean
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
  canGoPrevious,
  isLastCard
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

          {/* カード操作ヒント */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
            <div className="space-y-1 text-center">
              <p className="text-xs text-secondary">
                {isFlipped ? '覚えたら次のカードへ' : 'クリックして裏面を見る'}
              </p>
              <p className="text-xs text-disabled">
                スペースキー または クリック
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ナビゲーション */}
      <div className="flex justify-center">
        <CardNavigation
          currentIndex={cardIndex}
          totalCards={totalCards}
          onPrevious={handlePrevious}
          onNext={handleNext}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
          isLastCard={isLastCard}
          hasFlipped={isFlipped}
        />
      </div>

      {/* 操作説明 */}
      <div className="flex justify-center">
        <div className="grid grid-cols-1 gap-4 text-center text-xs text-secondary md:grid-cols-3">
          <div className="flex items-center justify-center gap-1.5">
            <kbd className="rounded-sm border border-line bg-surface px-2 py-1 text-xs">←</kbd>
            <span>前のカード</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <kbd className="rounded-sm border border-line bg-surface px-2 py-1 text-xs">Space</kbd>
            <span>カードを裏返す</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <kbd className="rounded-sm border border-line bg-surface px-2 py-1 text-xs">→</kbd>
            <span>次のカード</span>
          </div>
        </div>
      </div>
    </div>
  )
}