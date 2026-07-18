import { describe, expect, it } from 'vitest'

import type { Archetype } from '@/payload-types'
import { buildJourneyNarrative } from '@/services/narrative'
import { deriveVoteParams, summarizeVotes } from '@/services/session'

const archetype = {
  id: 1,
  slug: 'thinker',
  name: '思想家',
  nameEn: 'THE THINKER',
  rarity: 'common',
  subtitle: '物事の本質を見抜く',
  description: '描写',
  growthStages: [
    { stage: 0, title: '問いを持つ者', description: '最初の一歩を踏み出した', milestone: '旅の始まり' },
    { stage: 1, title: '探求者', description: '問いを深め続けている', milestone: '継続的な探求' },
    { stage: 2, title: '思想家', description: '本質を見抜く者となった', milestone: '深き洞察' },
  ],
  artwork: '/archetypes/archetype-thinker.svg',
  updatedAt: '',
  createdAt: '',
} as Archetype

describe('buildJourneyNarrative', () => {
  const journey = {
    archetypeId: 'thinker',
    currentStage: 1,
    totalVotes: 23,
    currentStreak: 7,
    activeDays: 10,
    startedAt: new Date('2026-07-01T09:00:00'),
  }

  it('現在の段階の称号を返す', () => {
    const n = buildJourneyNarrative(journey, archetype, new Date('2026-07-18T12:00:00'))
    expect(n.stage.title).toBe('探求者')
    expect(n.archetype.slug).toBe('thinker')
  })

  it('数値は詩的表現に変換され、生の値を含まない(二層構造)', () => {
    const n = buildJourneyNarrative(journey, archetype, new Date('2026-07-18T12:00:00'))
    expect(n.poetic.votes).toBe('着実な歩み')
    expect(n.poetic.streak).toBe('一週の継続')
    expect(n.poetic.since).toBe('数週前より')
    expect(JSON.stringify(n)).not.toContain('23')
  })

  it('不正な stage はステージ0にフォールバック', () => {
    const n = buildJourneyNarrative(
      { ...journey, currentStage: 9 },
      archetype,
      new Date('2026-07-18T12:00:00'),
    )
    expect(n.stage.title).toBe('問いを持つ者')
  })
})

describe('deriveVoteParams', () => {
  it('セッション時間(分)と平均カード時間(秒)を導出する', () => {
    const params = deriveVoteParams(
      {
        startedAt: new Date('2026-07-18T10:00:00'),
        endedAt: new Date('2026-07-18T10:12:00'),
        cardsStudied: 6,
        flippedCards: 4,
      },
      true,
    )
    expect(params.sessionDuration).toBe(12)
    expect(params.averageCardTime).toBe(120)
    expect(params.isConsecutiveDay).toBe(true)
    expect(params.timeOfDay).toBe('morning')
  })

  it('カード0枚でも0除算しない', () => {
    const params = deriveVoteParams(
      {
        startedAt: new Date('2026-07-18T10:00:00'),
        endedAt: new Date('2026-07-18T10:05:00'),
        cardsStudied: 0,
        flippedCards: 0,
      },
      false,
    )
    expect(params.averageCardTime).toBe(0)
  })
})

describe('summarizeVotes', () => {
  const at = (iso: string) => new Date(iso)

  it('投票ログから集計を再計算する', () => {
    const summary = summarizeVotes(
      [
        { strength: 1.0, createdAt: at('2026-07-16T10:00:00') },
        { strength: 2.0, createdAt: at('2026-07-17T10:00:00') },
        { strength: 1.5, createdAt: at('2026-07-18T10:00:00') },
        { strength: 1.5, createdAt: at('2026-07-18T20:00:00') },
      ],
      at('2026-07-18T21:00:00'),
    )
    expect(summary.totalVotes).toBe(4)
    expect(summary.qualityAvg).toBeCloseTo(1.5)
    expect(summary.activeDays).toBe(3)
    expect(summary.currentStreak).toBe(3)
    expect(summary.longestStreak).toBe(3)
  })

  it('投票ゼロなら全て0', () => {
    expect(summarizeVotes([], at('2026-07-18T12:00:00'))).toEqual({
      totalVotes: 0,
      qualityAvg: 0,
      activeDays: 0,
      currentStreak: 0,
      longestStreak: 0,
    })
  })
})
