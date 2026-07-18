'use client'

import Image from 'next/image'
import Link from 'next/link'

import { Card, CardContent } from '@/components/ui/Card'
import { useJourney } from '@/lib/hooks'

export default function ProfilePage() {
  const { data: journey, isLoading } = useJourney()

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-secondary">読み込んでいます…</p>
      </div>
    )
  }

  if (!journey?.onboardingCompleted || !journey.archetype || !journey.stage) {
    return (
      <div className="mx-auto w-full max-w-2xl px-6 py-24 text-center">
        <p className="mb-6 text-sm text-secondary">
          旅の記録は、道を選んでから刻まれていきます。
        </p>
        <Link
          href="/onboarding/welcome"
          className="text-sm text-secondary underline decoration-line underline-offset-4 transition-colors duration-quick hover:text-primary"
        >
          旅を始める
        </Link>
      </div>
    )
  }

  const { archetype, stage, poetic } = journey

  return (
    <div className="mx-auto w-full max-w-2xl px-6 pb-24">
      <div className="mb-10 pt-12">
        <h1 className="mb-3 text-2xl font-medium text-primary">旅の記録</h1>
        <p className="text-sm text-secondary">あなたの歩みと成長の軌跡です。</p>
      </div>

      {/* いまの姿 */}
      <Card className="mb-8">
        <CardContent className="flex items-center gap-6 pt-0">
          <Image
            src={archetype.artwork}
            alt={`${archetype.name}のカード`}
            width={320}
            height={512}
            className="h-auto w-16 shrink-0 rounded-sm shadow-card"
          />
          <div>
            <p className="text-latin-label mb-1">{archetype.nameEn}</p>
            <h2 className="text-lg font-medium text-primary">{archetype.name}</h2>
            <p className="text-sm text-secondary">{stage.title}</p>
          </div>
        </CardContent>
      </Card>

      {/* 歩みのことば(数値でなく言葉で示す) */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card size="small">
          <p className="mb-1 text-xs tracking-wide text-secondary">これまでの歩み</p>
          <p className="text-base text-primary">{poetic?.votes}</p>
        </Card>
        <Card size="small">
          <p className="mb-1 text-xs tracking-wide text-secondary">連なる日々</p>
          <p className="text-base text-primary">{poetic?.streak}</p>
        </Card>
        <Card size="small">
          <p className="mb-1 text-xs tracking-wide text-secondary">旅の始まり</p>
          <p className="text-base text-primary">{poetic?.since}</p>
        </Card>
      </div>

      {/* 道の描写(儀式的) */}
      <Card>
        <CardContent className="pt-0">
          <p className="text-ceremonial whitespace-pre-line text-sm leading-loose text-secondary">
            {archetype.description}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
