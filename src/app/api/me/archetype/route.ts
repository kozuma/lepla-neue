import { z } from 'zod'

import { selectArchetype } from '@/db/journey'
import { getUserId } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'

const bodySchema = z.object({
  archetype: z.string().min(1).max(64),
})

/**
 * アーキタイプを選ぶ(オンボーディング/変更)。同じスラッグの再選択は no-op(設計書 §8.1)
 */
export async function POST(request: Request) {
  const userId = await getUserId()
  if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'invalid_body' }, { status: 400 })

  const payload = await getPayloadClient()
  const exists = await payload.find({
    collection: 'archetypes',
    where: { slug: { equals: parsed.data.archetype } },
  })
  if (exists.totalDocs === 0) return Response.json({ error: 'unknown_archetype' }, { status: 400 })

  await selectArchetype(userId, parsed.data.archetype)
  return Response.json({ ok: true })
}
