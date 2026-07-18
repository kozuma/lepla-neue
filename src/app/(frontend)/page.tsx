'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useJourney } from '@/lib/hooks'

export default function Home() {
  const router = useRouter()
  const { data: journey, isLoading } = useJourney()

  // オンボーディングが完了していない場合はリダイレクト
  useEffect(() => {
    if (journey && !journey.onboardingCompleted) {
      router.push('/onboarding/welcome')
    }
  }, [journey, router])

  if (isLoading || !journey) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-secondary">読み込んでいます…</p>
      </div>
    )
  }

  if (!journey.onboardingCompleted || !journey.archetype || !journey.stage) {
    return (
      <div className="flex flex-col items-center py-24">
        <div className="mx-auto w-full max-w-ceremonial px-6 text-center">
          <p className="text-latin-label mb-6">Lepla</p>
          <h1 className="text-ceremonial text-2xl text-primary mb-4">Lepla へようこそ</h1>
          <p className="text-ceremonial text-sm text-secondary mb-12">
            なりたい自分へと歩む、学びの旅を始めましょう。
          </p>
          <button
            type="button"
            onClick={() => router.push('/onboarding/welcome')}
            className="w-full max-w-xs rounded-md bg-accent px-8 py-4 font-ceremonial text-sm tracking-ceremonial text-on-accent transition-colors duration-quick hover:bg-accent-hover"
          >
            旅を始める
          </button>
        </div>
      </div>
    )
  }

  const { archetype, stage, poetic, hasWalkedToday } = journey

  return (
    <div className="mx-auto w-full max-w-2xl px-6 pb-24">
      {/* 上部(儀式的): いまの姿と歩み */}
      <section className="mx-auto max-w-ceremonial pt-16 pb-24 text-center sm:pt-24">
        <Image
          src={archetype.artwork}
          alt={`${archetype.name}のカード`}
          width={320}
          height={512}
          className="mx-auto mb-8 h-auto w-20 rounded-sm shadow-card"
        />
        <p className="text-latin-label mb-2">{archetype.nameEn}</p>
        <h1 className="text-ceremonial text-2xl text-primary">{archetype.name}</h1>
        <p className="text-ceremonial mt-1 text-sm text-secondary">{stage.title}</p>
        {/* 歩みは数値でなく言葉で示す(二層構造) */}
        <p className="text-ceremonial mt-10 text-base text-primary">
          これまでの歩み — {poetic?.votes}
        </p>
      </section>

      {/* 下部(機能的): 今日の一歩 */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <h2 className="shrink-0 text-sm font-medium tracking-wide text-secondary">
            今日の一歩
          </h2>
          <div className="h-px flex-1 bg-line-strong" />
        </div>

        <div className="rounded-card bg-surface p-6 shadow-card sm:flex sm:items-center sm:justify-between sm:gap-6">
          {hasWalkedToday ? (
            <>
              <div>
                <p className="text-base text-primary">今日も歩みを重ねました。</p>
                <p className="mt-1 text-sm text-secondary">{poetic?.streak}</p>
              </div>
              <Link
                href="/decks"
                className="mt-4 inline-block shrink-0 text-sm text-secondary transition-colors duration-quick hover:text-primary sm:mt-0"
              >
                続きを学ぶ →
              </Link>
            </>
          ) : (
            <>
              <p className="text-base text-primary">
                今日の学びを始めましょう。
                <br />
                {archetype.name}の道は、一歩ずつ続いていきます。
              </p>
              <Link
                href="/decks"
                className="mt-6 inline-block shrink-0 rounded-md bg-accent px-6 py-3 text-sm text-on-accent transition-colors duration-quick hover:bg-accent-hover sm:mt-0"
              >
                学習を始める
              </Link>
            </>
          )}
        </div>
      </section>

      {/* 下部(機能的): 書庫へ */}
      <section className="mt-16">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="shrink-0 text-sm font-medium tracking-wide text-secondary">
            学びを探す
          </h2>
          <div className="h-px flex-1 bg-line-strong" />
        </div>

        <Link
          href="/decks"
          className="block rounded-card border border-line bg-surface p-6 shadow-card transition-colors duration-quick hover:border-line-strong"
        >
          <p className="text-base font-medium text-primary">書庫を開く</p>
          <p className="mt-1 text-sm text-secondary">
            {archetype.name}の道に合った教材を探せます。
          </p>
        </Link>
      </section>

      {/* 引用 */}
      <section className="mt-24 border-y border-line py-12 text-center">
        <p className="font-latin mx-auto max-w-lg text-lg italic text-secondary">
          Every action is a vote for the type of person you wish to become
        </p>
        <p className="text-latin-label mt-4">James Clear — Atomic Habits</p>
      </section>
    </div>
  )
}
