'use client'

import { motion, useReducedMotion } from 'framer-motion'

interface StudyIntroProps {
  deckName: string
  onBegin: () => void
}

// 学習開始のフルスクリーンメッセージ(儀式的レジスタ)
export function StudyIntro({ deckName, onBegin }: StudyIntroProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className="flex min-h-screen flex-col items-center justify-center bg-base py-24"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto w-full max-w-ceremonial px-6 text-center">
        <p className="text-latin-label mb-12">Lepla</p>
        <h1 className="text-ceremonial text-xl sm:text-2xl text-primary mb-6">
          『{deckName}』
        </h1>
        <p className="text-ceremonial text-sm text-secondary mb-16">
          静けさの中、頁を開く。
          <br />
          一枚一枚が、汝の望む姿への一票となる。
        </p>
        <button
          type="button"
          onClick={onBegin}
          className="w-full max-w-xs rounded-md bg-accent px-8 py-4 font-ceremonial text-sm tracking-ceremonial text-on-accent transition-colors duration-quick hover:bg-accent-hover"
        >
          歩み始める
        </button>
      </div>
    </motion.div>
  )
}
