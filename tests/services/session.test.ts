import { describe, expect, it } from 'vitest'

import { calculateGrowthProgress, calculateStreak } from '@/services/session'

describe('calculateGrowthProgress', () => {
  it('Stage 0→1: 15票・品質1.3・7日をすべて満たすと昇格可', () => {
    expect(calculateGrowthProgress(15, 1.3, 7, 0).canAdvance).toBe(true)
  })

  it('Stage 0→1: どれか1つでも欠けると昇格不可', () => {
    expect(calculateGrowthProgress(14, 1.3, 7, 0).canAdvance).toBe(false)
    expect(calculateGrowthProgress(15, 1.29, 7, 0).canAdvance).toBe(false)
    expect(calculateGrowthProgress(15, 1.3, 6, 0).canAdvance).toBe(false)
  })

  it('昇格不可のとき理由は詩的メッセージのみ(しきい値を露出しない)', () => {
    const result = calculateGrowthProgress(0, 0, 0, 0)
    expect(result.nextStageRequirements).toBe('継続的な学びを重ねられよ')
    expect(result.nextStageRequirements).not.toMatch(/\d/)
  })

  it('Stage 1→2: 50票・品質1.5・21日で昇格可', () => {
    expect(calculateGrowthProgress(50, 1.5, 21, 1).canAdvance).toBe(true)
    expect(calculateGrowthProgress(49, 1.5, 21, 1).canAdvance).toBe(false)
  })

  it('Stage 2 は最終段階で昇格しない', () => {
    expect(calculateGrowthProgress(1000, 2, 365, 2).canAdvance).toBe(false)
  })
})

describe('calculateStreak', () => {
  const day = (iso: string) => new Date(`${iso}T12:00:00`)
  const today = day('2026-07-18')

  it('投票がなければ0', () => {
    expect(calculateStreak([], today)).toEqual({ currentStreak: 0, longestStreak: 0 })
  })

  it('今日から連続していれば現ストリークが伸びる', () => {
    const dates = [day('2026-07-18'), day('2026-07-17'), day('2026-07-16')]
    expect(calculateStreak(dates, today)).toEqual({ currentStreak: 3, longestStreak: 3 })
  })

  it('今日投票していなければ現ストリークは0(過去分は最長に残る)', () => {
    const dates = [day('2026-07-16'), day('2026-07-15')]
    expect(calculateStreak(dates, today)).toEqual({ currentStreak: 0, longestStreak: 2 })
  })

  it('同日の複数投票は1日として数える', () => {
    const dates = [day('2026-07-18'), new Date('2026-07-18T20:00:00'), day('2026-07-17')]
    expect(calculateStreak(dates, today)).toEqual({ currentStreak: 2, longestStreak: 2 })
  })

  it('途切れた連続の最大長が最長ストリークになる', () => {
    const dates = [
      day('2026-07-18'),
      // 途切れ
      day('2026-07-14'),
      day('2026-07-13'),
      day('2026-07-12'),
    ]
    expect(calculateStreak(dates, today)).toEqual({ currentStreak: 1, longestStreak: 3 })
  })
})
