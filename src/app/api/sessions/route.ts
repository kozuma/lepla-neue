import { z } from 'zod'

import { startSession } from '@/db/journey'
import { getUserId } from '@/lib/auth'

const bodySchema = z.object({
  deckId: z.number().int().positive(),
})

/**
 * 学習セッション開始
 */
export async function POST(request: Request) {
  const userId = await getUserId()
  if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'invalid_body' }, { status: 400 })

  const session = await startSession(userId, parsed.data.deckId)
  return Response.json({ sessionId: session.id }, { status: 201 })
}
