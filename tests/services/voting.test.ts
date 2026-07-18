import { describe, expect, it } from 'vitest'

import {
  adjustStrengthByAction,
  calculateVoteStrength,
  formatPoeticNumber,
} from '@/services/voting'
import type { VoteStrengthParams } from '@/types/vote'

const baseParams: VoteStrengthParams = {
  sessionDuration: 0,
  cardsStudied: 0,
  averageCardTime: 0,
  flippedCards: 0,
  isConsecutiveDay: false,
  timeOfDay: 'morning',
}

describe('calculateVoteStrength', () => {
  it('何も満たさなければ基礎値1', () => {
    expect(calculateVoteStrength(baseParams)).toBe(1)
  })

  it('セッション10分以上で+0.3', () => {
    expect(calculateVoteStrength({ ...baseParams, sessionDuration: 10 })).toBeCloseTo(1.3)
  })

  it('カード5枚以上で+0.2', () => {
    expect(calculateVoteStrength({ ...baseParams, cardsStudied: 5 })).toBeCloseTo(1.2)
  })

  it('平均カード時間30秒以上で+0.2', () => {
    expect(calculateVoteStrength({ ...baseParams, averageCardTime: 30 })).toBeCloseTo(1.2)
  })

  it('裏返し率50%以上で+0.2', () => {
    expect(
      calculateVoteStrength({ ...baseParams, cardsStudied: 4, flippedCards: 2 }),
    ).toBeCloseTo(1.2)
  })

  it('裏返し率50%未満は加算なし', () => {
    expect(calculateVoteStrength({ ...baseParams, cardsStudied: 4, flippedCards: 1 })).toBe(1)
  })

  it('カード0枚なら裏返し加算は発生しない(0除算なし)', () => {
    expect(calculateVoteStrength({ ...baseParams, flippedCards: 3 })).toBe(1)
  })

  it('連続日で+0.1', () => {
    expect(calculateVoteStrength({ ...baseParams, isConsecutiveDay: true })).toBeCloseTo(1.1)
  })

  it('全条件を満たしても上限は2', () => {
    const result = calculateVoteStrength({
      sessionDuration: 60,
      cardsStudied: 20,
      averageCardTime: 45,
      flippedCards: 20,
      isConsecutiveDay: true,
      timeOfDay: 'evening',
    })
    expect(result).toBe(2)
  })
})

describe('adjustStrengthByAction', () => {
  it('daily_study / review_old_material はそのまま', () => {
    expect(adjustStrengthByAction(1.5, 'daily_study')).toBe(1.5)
    expect(adjustStrengthByAction(1.5, 'review_old_material')).toBe(1.5)
  })

  it('deep_engagement は20%ボーナス(上限2)', () => {
    expect(adjustStrengthByAction(1.5, 'deep_engagement')).toBeCloseTo(1.8)
    expect(adjustStrengthByAction(1.9, 'deep_engagement')).toBe(2)
  })

  it('return_after_break は10%ボーナス', () => {
    expect(adjustStrengthByAction(1.0, 'return_after_break')).toBeCloseTo(1.1)
  })

  it('explore_new_topic は15%ボーナス', () => {
    expect(adjustStrengthByAction(1.0, 'explore_new_topic')).toBeCloseTo(1.15)
  })

  it('complete_deck / consistent_week は常に最高値2', () => {
    expect(adjustStrengthByAction(1.0, 'complete_deck')).toBe(2)
    expect(adjustStrengthByAction(1.0, 'consistent_week')).toBe(2)
  })
})

describe('formatPoeticNumber', () => {
  it('投票数を詩的表現に変換する(生数値を見せない)', () => {
    expect(formatPoeticNumber(0, 'votes')).toBe('始まりの時')
    expect(formatPoeticNumber(9, 'votes')).toBe('僅かな歩み')
    expect(formatPoeticNumber(29, 'votes')).toBe('着実な歩み')
    expect(formatPoeticNumber(49, 'votes')).toBe('確かな歩み')
    expect(formatPoeticNumber(99, 'votes')).toBe('深き歩み')
    expect(formatPoeticNumber(199, 'votes')).toBe('豊かな歩み')
    expect(formatPoeticNumber(200, 'votes')).toBe('偉大なる歩み')
  })

  it('ストリークの段階語彙', () => {
    expect(formatPoeticNumber(0, 'streak')).toBe('新たな始まり')
    expect(formatPoeticNumber(1, 'streak')).toBe('第一歩')
    expect(formatPoeticNumber(3, 'streak')).toBe('3日の道程')
    expect(formatPoeticNumber(7, 'streak')).toBe('一週の継続')
    expect(formatPoeticNumber(100, 'streak')).toBe('永き継続')
  })

  it('日数の段階語彙', () => {
    expect(formatPoeticNumber(0, 'days')).toBe('今日より')
    expect(formatPoeticNumber(1, 'days')).toBe('昨日より')
    expect(formatPoeticNumber(5, 'days')).toBe('5日前より')
    expect(formatPoeticNumber(45, 'days')).toBe('数月前より')
    expect(formatPoeticNumber(365, 'days')).toBe('遠き日より')
  })
})
