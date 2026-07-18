/**
 * フロントエンドが扱う API レスポンスの型(src/app/api/ の Route Handlers と対応)。
 * 二層構造: 数値層(投票数・strength 等)はここに現れない。物語層のみ
 */

export interface DeckSummary {
  id: number
  name: string
  description: string
  level: 'easy' | 'medium' | 'hard'
  archetype: { slug: string; name: string } | null
}

export interface DeckDetail extends DeckSummary {
  template: {
    content: string
    variables: { name: string; isRequired: boolean }[]
  } | null
}

export interface StudyCard {
  id: number
  label: string
  values: { variable: string; value: string }[]
}

export interface ArchetypeContent {
  slug: string
  name: string
  nameEn: string
  subtitle: string
  description: string
  historicalFigures: { name: string; description: string }[]
  relatedFields: string[]
  qualities: string[]
  growthStages: { stage: number; title: string; description: string; milestone: string }[]
  artwork: string
}

export interface JourneyResponse {
  onboardingCompleted: boolean
  archetype?: {
    slug: string
    name: string
    nameEn: string
    subtitle: string
    description: string
    artwork: string
  }
  stage?: { title: string; description: string; milestone: string }
  poetic?: { votes: string; streak: string; since: string }
  hasWalkedToday?: boolean
}

export interface SessionCompleteResponse {
  archetype: { slug: string; name: string } | null
  advanced: boolean
  stage: { title: string; description: string } | null
  poetic: { votes: string; streak: string }
}
