/**
 * 物語層の組み立て(二層構造の実装。憲法 §3-4、設計書 §1)。
 * API レスポンスに出せるのはここが返す物語(称号・詩的表現)のみ。
 * 生の投票数・strength・しきい値は返さない。
 */
import type { Archetype } from '@/payload-types'

import { formatPoeticNumber } from './voting'

export interface JourneyState {
  archetypeId: string
  currentStage: number
  totalVotes: number
  currentStreak: number
  activeDays: number
  startedAt: Date
}

export interface JourneyNarrative {
  archetype: {
    slug: string
    name: string
    nameEn: string
    subtitle: string
    description: string
    artwork: string
  }
  stage: {
    title: string
    description: string
    milestone: string
  }
  poetic: {
    votes: string // 「着実な歩み」
    streak: string // 「7日の道程」
    since: string // 「数週前より」
  }
  // 今日すでに歩んだか(数値でなく事実のみ。「今日の一歩」の文言切り替え用)
  hasWalkedToday: boolean
}

export function buildJourneyNarrative(
  journey: JourneyState,
  archetype: Archetype,
  today: Date,
): JourneyNarrative {
  const stage =
    archetype.growthStages?.find((s) => s.stage === journey.currentStage) ??
    archetype.growthStages?.[0]

  const daysSinceStart = Math.max(
    0,
    Math.floor((today.getTime() - journey.startedAt.getTime()) / (1000 * 60 * 60 * 24)),
  )

  return {
    archetype: {
      slug: archetype.slug,
      name: archetype.name,
      nameEn: archetype.nameEn,
      subtitle: archetype.subtitle,
      description: archetype.description,
      artwork: archetype.artwork,
    },
    stage: {
      title: stage?.title ?? '',
      description: stage?.description ?? '',
      milestone: stage?.milestone ?? '',
    },
    poetic: {
      votes: formatPoeticNumber(journey.totalVotes, 'votes'),
      streak: formatPoeticNumber(journey.currentStreak, 'streak'),
      since: formatPoeticNumber(daysSinceStart, 'days'),
    },
    // 現ストリークは「今日の投票がなければ0」なので、>0 は今日歩んだことと同値
    hasWalkedToday: journey.currentStreak > 0,
  }
}
