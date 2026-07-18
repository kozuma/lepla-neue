import { z } from 'zod'

import { getUserId } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'

/**
 * デッキのカード一覧(order 昇順)
 */
export async function GET(_request: Request, { params }: { params: Promise<{ deckId: string }> }) {
  const userId = await getUserId()
  if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const { deckId } = await params
  const parsed = z.coerce.number().int().positive().safeParse(deckId)
  if (!parsed.success) return Response.json({ error: 'not_found' }, { status: 404 })

  const payload = await getPayloadClient()
  const cards = await payload.find({
    collection: 'cards',
    where: { deck: { equals: parsed.data } },
    sort: 'order',
    limit: 500,
    depth: 0,
  })

  return Response.json({
    cards: cards.docs.map((card) => ({
      id: card.id,
      label: card.label,
      values: card.values.map((v) => ({ variable: v.variable, value: v.value })),
    })),
  })
}
