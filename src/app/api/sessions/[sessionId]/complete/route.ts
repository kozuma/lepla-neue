import { z } from 'zod'

import { completeSession } from '@/db/journey'
import { getUserId } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'
import { formatPoeticNumber } from '@/services/voting'

const bodySchema = z.object({
  cardsStudied: z.number().int().min(0),
  flippedCards: z.number().int().min(0),
})

/**
 * セッション完了 → 投票記録・昇格判定・ストリーク更新(設計書 §7)。
 * レスポンスは物語層のみ: 称号・詩的表現。生の数値・strength は返さない
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const userId = await getUserId()
  if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'invalid_body' }, { status: 400 })

  const { sessionId } = await params
  if (!z.string().uuid().safeParse(sessionId).success)
    return Response.json({ error: 'session_not_found' }, { status: 404 })

  const result = await completeSession(userId, sessionId, parsed.data, new Date())
  if (!result.ok) {
    const status = result.reason === 'no_archetype' ? 409 : 404
    return Response.json({ error: result.reason }, { status })
  }

  const payload = await getPayloadClient()
  const archetype = (
    await payload.find({
      collection: 'archetypes',
      where: { slug: { equals: result.archetypeId } },
    })
  ).docs[0]
  const stage = archetype?.growthStages?.find((s) => s.stage === result.newStage)

  return Response.json({
    archetype: archetype ? { slug: archetype.slug, name: archetype.name } : null,
    advanced: result.advanced,
    stage: stage ? { title: stage.title, description: stage.description } : null,
    poetic: {
      votes: formatPoeticNumber(result.summary.totalVotes, 'votes'),
      streak: formatPoeticNumber(result.summary.currentStreak, 'streak'),
    },
  })
}
