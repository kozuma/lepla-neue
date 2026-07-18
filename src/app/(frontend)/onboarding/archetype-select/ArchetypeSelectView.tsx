'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { useArchetypes } from '@/lib/hooks'

const SWIPE_THRESHOLD = 50

export function ArchetypeSelectView() {
  const router = useRouter()
  const { data: archetypes, isLoading } = useArchetypes()
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const prefersReducedMotion = useReducedMotion()

  if (isLoading || !archetypes || archetypes.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <p className="text-sm text-secondary">カードを並べています…</p>
      </div>
    )
  }

  const total = archetypes.length
  const archetype = archetypes[index]
  if (!archetype) return null

  const goTo = (dir: 1 | -1) => {
    setDirection(dir)
    setIndex((prev) => (prev + dir + total) % total)
  }

  const handleChoose = () => {
    // 確定はconfirmation画面で行う(儀式的静止のあとにサーバーへ記録)
    router.push(`/onboarding/confirmation?archetype=${archetype.slug}`)
  }

  const slide = prefersReducedMotion ? 0 : 40

  return (
    <motion.div
      className="flex flex-col items-center py-24"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto w-full max-w-ceremonial px-6 text-center">
        {/* 見出し */}
        <p className="text-latin-label mb-6">Archetype</p>
        <h1 className="text-ceremonial text-xl sm:text-2xl text-primary mb-4">
          汝の真なる姿を見つけよ
        </h1>
        <p className="text-ceremonial text-sm text-secondary mb-12">
          カードが汝の前に現れる。
          <br />
          心の声に従い、一枚を選ぶのだ。
        </p>

        {/* カード送り */}
        <div className="flex items-center justify-center gap-2 sm:gap-6 mb-10">
          <button
            type="button"
            onClick={() => goTo(-1)}
            aria-label="前のカード"
            className="shrink-0 p-2 text-secondary transition-colors duration-quick hover:text-primary"
          >
            <ChevronLeft aria-hidden className="h-6 w-6" strokeWidth={1.5} />
          </button>

          <div className="w-56 sm:w-72 overflow-hidden">
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={archetype.slug}
                custom={direction}
                variants={{
                  enter: (dir: number) => ({ opacity: 0, x: dir * slide }),
                  center: { opacity: 1, x: 0 },
                  exit: (dir: number) => ({ opacity: 0, x: dir * -slide }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: [0.4, 0, 0.2, 1] }}
                drag={prefersReducedMotion ? false : 'x'}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -SWIPE_THRESHOLD) goTo(1)
                  else if (info.offset.x > SWIPE_THRESHOLD) goTo(-1)
                }}
              >
                <Image
                  src={archetype.artwork}
                  alt={`${archetype.name}のカード`}
                  width={320}
                  height={512}
                  priority
                  draggable={false}
                  className="h-auto w-full rounded-card shadow-card select-none"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={() => goTo(1)}
            aria-label="次のカード"
            className="shrink-0 p-2 text-secondary transition-colors duration-quick hover:text-primary"
          >
            <ChevronRight aria-hidden className="h-6 w-6" strokeWidth={1.5} />
          </button>
        </div>

        {/* 位置インジケーター */}
        <div className="flex items-center justify-center gap-2 mb-10" aria-hidden>
          {archetypes.map((a, i) => (
            <span
              key={a.slug}
              className={`h-1.5 w-1.5 rounded-full transition-colors duration-quick ${
                i === index ? 'bg-primary' : 'bg-line-strong'
              }`}
            />
          ))}
        </div>

        {/* カードの言葉 */}
        <div aria-live="polite">
          <h2 className="text-ceremonial text-xl text-primary mb-1">{archetype.name}</h2>
          <p className="text-latin-label mb-4">{archetype.nameEn}</p>
          <p className="text-ceremonial text-sm text-secondary mb-12">{archetype.subtitle}</p>
        </div>

        {/* 選択確定 — この画面で金はこのボタンだけ */}
        <button
          type="button"
          onClick={handleChoose}
          className="w-full max-w-xs rounded-md bg-accent px-8 py-4 font-ceremonial text-sm tracking-ceremonial text-on-accent transition-colors duration-quick hover:bg-accent-hover"
        >
          {archetype.name}として、この道を歩む
        </button>
      </div>
    </motion.div>
  )
}
