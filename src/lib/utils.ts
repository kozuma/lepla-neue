import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 数値を詩的な表現に変換
 */
export function poeticNumber(num: number, context: 'steps' | 'days' | 'cards' | 'count'): string {
  if (num === 0) {
    switch (context) {
      case 'steps':
        return '足跡なし'
      case 'days':
        return '旅の始まり'
      case 'cards':
        return 'まだ学んでいない'
      case 'count':
        return 'なし'
    }
  }

  const baseText = num.toString()

  switch (context) {
    case 'steps':
      return `${baseText}の足跡`
    case 'days':
      return num === 1 ? '一つの日' : `${baseText}つの日`
    case 'cards':
      return num === 1 ? '一枚の学び' : `${baseText}枚の学び`
    case 'count':
      return `${baseText}つ`
    default:
      return baseText
  }
}

/**
 * 日付を相対的な表現に変換
 */
export function relativeDate(date: Date): string {
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) {
    return '今日'
  } else if (diffInDays === 1) {
    return '昨日'
  } else if (diffInDays < 7) {
    return `${diffInDays}日前`
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7)
    return `${weeks}週間前`
  } else {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
}
