'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'

import type { SessionCompleteResponse } from '@/types/content'

interface StudyCompletionProps {
  deckId: number
  result: SessionCompleteResponse | null
  onRestart: () => void
}

const COMPLETION_MESSAGES: Record<string, string[]> = {
  thinker: [
    '深き洞察への一歩を踏み出されたり',
    '真理への探求が続く',
    '思索の道を歩みたまえ',
  ],
  creator: [
    '創造の源泉が育まれたり',
    '新たなる表現への道筋',
    '美の探求者よ、歩み続けよ',
  ],
  scientist: [
    '真実への好奇心が満たされたり',
    '知識の扉が開かれたり',
    '探求者よ、更なる発見を',
  ],
  explorer: [
    '未知への一歩が刻まれたり',
    '地平の先に道は続く',
    '旅人よ、歩みを止めるな',
  ],
  sage: [
    '智の一片が結ばれたり',
    '学びは静かに熟していく',
    '賢き者よ、灯を絶やすな',
  ],
}

// 学習完了のフルスクリーンメッセージ(儀式的レジスタ)。
// 歩みは数値でなく言葉で示す(二層構造)。数値層はサーバーが返さない
export function StudyCompletion({ deckId, result, onRestart }: StudyCompletionProps) {
  const prefersReducedMotion = useReducedMotion()
  const slug = result?.archetype?.slug

  const completionMessage = useMemo(() => {
    const messages = (slug && COMPLETION_MESSAGES[slug]) || ['学びを納めたり']
    return messages[Math.floor(Math.random() * messages.length)]!
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <motion.div
      className="flex min-h-screen flex-col items-center justify-center bg-base py-24"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto w-full max-w-ceremonial px-6 text-center">
        <h1 className="text-ceremonial text-2xl text-primary mb-6">今日の歩みを納めたり</h1>
        <p className="text-ceremonial text-sm text-secondary mb-16">{completionMessage}</p>

        {/* 昇格(称号の授与)は物語で伝える(設計書 §5.3) */}
        {result?.advanced && result.stage && (
          <div className="mb-16">
            <p className="text-latin-label mb-4">A New Chapter</p>
            <p className="text-ceremonial text-lg text-primary mb-2">
              汝はいま、「{result.stage.title}」となりたり
            </p>
            <p className="text-ceremonial text-sm text-secondary">{result.stage.description}</p>
          </div>
        )}

        {result && (
          <div className="mb-16 border-y border-line py-8">
            <p className="text-ceremonial text-sm text-primary mb-2">
              これまでの歩み — {result.poetic.votes}
            </p>
            <p className="text-ceremonial text-sm text-secondary">{result.poetic.streak}</p>
          </div>
        )}

        <div className="flex flex-col items-center gap-6">
          <Link
            href="/decks"
            className="w-full max-w-xs rounded-md bg-accent px-8 py-4 font-ceremonial text-sm tracking-ceremonial text-on-accent transition-colors duration-quick hover:bg-accent-hover"
          >
            旅を続ける
          </Link>
          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={onRestart}
              className="text-sm text-secondary transition-colors duration-quick hover:text-primary"
            >
              もう一度めくる
            </button>
            <Link
              href={`/decks/${deckId}`}
              className="text-sm text-secondary transition-colors duration-quick hover:text-primary"
            >
              書物の詳細へ
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
