/**
 * セッション・成長段階判定 — 純粋関数のみ(開発憲法 §5)
 * 旧リポジトリ lib/archetypes/vote-calculator.ts からの移植。
 * 昇格しきい値は隠しパラメータ(二層構造)。APIレスポンス・UIに露出しないこと(憲法 §3-4)。
 */

import type { VoteStrengthParams } from '@/types/vote'

/**
 * 完了した学習セッションから投票強度パラメータを導出する。
 * strength はクライアントに自己申告させず、生メタデータからサーバーで計算する(設計書 §4.2)
 */
export function deriveVoteParams(
  session: {
    startedAt: Date
    endedAt: Date
    cardsStudied: number
    flippedCards: number
  },
  isConsecutiveDay: boolean,
): VoteStrengthParams {
  const durationSeconds = Math.max(
    0,
    (session.endedAt.getTime() - session.startedAt.getTime()) / 1000,
  )
  const hour = session.endedAt.getHours()
  return {
    sessionDuration: durationSeconds / 60, // 分
    cardsStudied: session.cardsStudied,
    averageCardTime: session.cardsStudied > 0 ? durationSeconds / session.cardsStudied : 0, // 秒
    flippedCards: session.flippedCards,
    isConsecutiveDay,
    timeOfDay: hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening',
  }
}

export interface VoteRecord {
  strength: number
  createdAt: Date
}

/**
 * 投票ログから user_archetypes の集計キャッシュを再計算する。
 * ログが常に正であり、このキャッシュはいつでも作り直せる(設計書 §7)
 */
export function summarizeVotes(
  votes: VoteRecord[],
  today: Date,
): {
  totalVotes: number
  qualityAvg: number
  activeDays: number
  currentStreak: number
  longestStreak: number
} {
  const totalVotes = votes.length
  const qualityAvg =
    totalVotes === 0 ? 0 : votes.reduce((sum, v) => sum + v.strength, 0) / totalVotes
  const uniqueDays = new Set(
    votes.map((v) => {
      const d = v.createdAt
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    }),
  )
  const { currentStreak, longestStreak } = calculateStreak(
    votes.map((v) => v.createdAt),
    today,
  )
  return {
    totalVotes,
    qualityAvg,
    activeDays: uniqueDays.size,
    currentStreak,
    longestStreak,
  }
}

/**
 * 成長段階の判定(Phase 1: シンプル版)
 * 隠しパラメータに基づいて次のステージに上がれるかを判定
 */
export function calculateGrowthProgress(
  totalVotes: number,
  averageQuality: number,
  daysActive: number,
  currentStage: number,
): {
  canAdvance: boolean
  nextStageRequirements?: string
} {
  // Stage 0 → 1 への条件
  if (currentStage === 0) {
    const canAdvance = totalVotes >= 15 && averageQuality >= 1.3 && daysActive >= 7
    return {
      canAdvance,
      nextStageRequirements: canAdvance ? undefined : '継続的な学びを重ねられよ',
    }
  }

  // Stage 1 → 2 への条件
  if (currentStage === 1) {
    const canAdvance = totalVotes >= 50 && averageQuality >= 1.5 && daysActive >= 21
    return {
      canAdvance,
      nextStageRequirements: canAdvance ? undefined : '更なる深みへと歩みを進められよ',
    }
  }

  // Stage 2 は最高段階
  return {
    canAdvance: false,
  }
}

/**
 * ストリーク計算
 * 純粋性のため「今日」を引数で受け取る(旧実装は内部で new Date() していた)
 */
export function calculateStreak(
  voteDates: Date[],
  today: Date,
): {
  currentStreak: number
  longestStreak: number
} {
  if (voteDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  // 日付を降順ソート
  const sortedDates = voteDates
    .map((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()))
    .sort((a, b) => b.getTime() - a.getTime())

  // 重複を除去
  const uniqueDates = sortedDates.filter(
    (date, index) => index === 0 || date.getTime() !== sortedDates[index - 1]?.getTime(),
  )

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 1

  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  // 現在のストリーク計算(今日から遡って連続している日数。今日の投票がなければ0)
  for (let i = 0; i < uniqueDates.length; i++) {
    const expectedDate = new Date(todayStart)
    expectedDate.setDate(todayStart.getDate() - i)
    const currentDate = uniqueDates[i]

    if (currentDate && currentDate.getTime() === expectedDate.getTime()) {
      currentStreak++
    } else {
      break
    }
  }

  // 最長ストリーク計算
  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = uniqueDates[i - 1]
    const currentDate = uniqueDates[i]

    if (prevDate && currentDate) {
      const diffDays = (prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)

      if (diffDays === 1) {
        tempStreak++
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak)

  return { currentStreak, longestStreak }
}
