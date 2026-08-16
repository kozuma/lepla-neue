'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { CardViewer } from '@/components/study/CardViewer'
import { StudyCompletion } from '@/components/study/StudyCompletion'
import { StudyExitButton } from '@/components/study/StudyExitButton'
import { StudyIntro } from '@/components/study/StudyIntro'
import { Button } from '@/components/ui/Button'
import { useCards, useCompleteSession, useDeck, useStartSession } from '@/lib/hooks'
import type { SessionCompleteResponse } from '@/types/content'

interface StudyViewProps {
  deckId: string
}

// 学習フロー: 開始時にセッションを作成し、完了時にサーバーが投票を記録する。
// 投票強度はサーバー計算(設計書 §4.2)。クライアントは生メタデータのみ送る
export function StudyView({ deckId }: StudyViewProps) {
  const router = useRouter()
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  // 表示用: 現在裏返っているカード(クリックでトグル)
  const [flippedCards, setFlippedCards] = useState(new Set<number>())
  // 集計用: 一度でも裏を見たカード(投票メタデータ。トグルで戻しても減らさない)
  const [revealedCards, setRevealedCards] = useState(new Set<number>())
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [completionResult, setCompletionResult] = useState<SessionCompleteResponse | null>(null)
  const [isComplete, setIsComplete] = useState(false)

  const { data: deck, isLoading: isDeckLoading } = useDeck(deckId)
  const { data: cards, isLoading: isCardsLoading } = useCards(deckId)
  const startSession = useStartSession()
  const completeSession = useCompleteSession()

  const isLoading = isDeckLoading || isCardsLoading
  const totalCards = cards?.length ?? 0
  const currentCard = cards?.[currentCardIndex]
  const isLastCard = currentCardIndex === totalCards - 1

  const handleBegin = async () => {
    if (!deck) return
    const { sessionId: id } = await startSession.mutateAsync(deck.id)
    setSessionId(id)
  }

  const handleCardFlip = () => {
    if (!currentCard) return
    // 表示は表裏トグル
    setFlippedCards((prev) => {
      const next = new Set(prev)
      if (next.has(currentCardIndex)) next.delete(currentCardIndex)
      else next.add(currentCardIndex)
      return next
    })
    // 集計は一度でも裏を見たら記録(戻しても取り消さない)
    setRevealedCards((prev) => new Set(prev).add(currentCardIndex))
  }

  const handleNextCard = async () => {
    if (!isLastCard) {
      setCurrentCardIndex((prev) => prev + 1)
      return
    }
    // 最後のカード → セッション完了。サーバーが投票を記録する
    setIsComplete(true)
    if (sessionId) {
      const result = await completeSession
        .mutateAsync({
          sessionId,
          cardsStudied: totalCards,
          flippedCards: revealedCards.size,
        })
        .catch(() => null)
      setCompletionResult(result)
    }
  }

  const handlePreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1)
    }
  }

  const handleRestart = () => {
    setCurrentCardIndex(0)
    setFlippedCards(new Set())
    setRevealedCards(new Set())
    setSessionId(null)
    setCompletionResult(null)
    setIsComplete(false)
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-secondary">学びの準備中…</p>
      </div>
    )
  }

  if (!deck || !cards || cards.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="space-y-4 text-center">
          <p className="mb-4 text-sm text-secondary">この書物にはまだカードがありません。</p>
          <Link href={`/decks/${deckId}`}>
            <Button variant="secondary">詳細に戻る</Button>
          </Link>
        </div>
      </div>
    )
  }

  // 学習開始のフルスクリーンメッセージ(儀式的レジスタ)
  if (!sessionId && !isComplete) {
    return <StudyIntro deckName={deck.name} onBegin={handleBegin} />
  }

  if (isComplete) {
    return (
      <StudyCompletion deckId={deck.id} result={completionResult} onRestart={handleRestart} />
    )
  }

  if (!currentCard) {
    return null
  }

  return (
    <div className="relative flex flex-1 flex-col">
      <StudyExitButton
        currentCardIndex={currentCardIndex}
        totalCards={totalCards}
        onExit={() => router.push(`/decks/${deckId}`)}
      />

      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <CardViewer
            card={currentCard}
            template={deck.template}
            cardIndex={currentCardIndex}
            totalCards={totalCards}
            isFlipped={flippedCards.has(currentCardIndex)}
            onFlip={handleCardFlip}
            onNext={handleNextCard}
            onPrevious={handlePreviousCard}
            canGoNext={true}
            canGoPrevious={currentCardIndex > 0}
          />
        </div>
      </div>
    </div>
  )
}
