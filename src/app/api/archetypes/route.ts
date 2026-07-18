import { getPayloadClient } from '@/lib/payload'

/**
 * アーキタイプ定義一覧(オンボーディングの選択画面用)。
 * 定義は公開コンテンツ。昇格しきい値・解放条件はコレクション自体が持たないため露出しない
 */
export async function GET() {
  const payload = await getPayloadClient()
  const archetypes = await payload.find({
    collection: 'archetypes',
    where: { rarity: { equals: 'common' } },
    limit: 50,
    sort: 'createdAt',
  })

  return Response.json({
    archetypes: archetypes.docs.map((a) => ({
      slug: a.slug,
      name: a.name,
      nameEn: a.nameEn,
      subtitle: a.subtitle,
      description: a.description,
      historicalFigures: (a.historicalFigures ?? []).map((f) => ({
        name: f.name,
        description: f.description,
      })),
      relatedFields: (a.relatedFields ?? []).map((f) => f.value),
      qualities: (a.qualities ?? []).map((q) => q.value),
      growthStages: (a.growthStages ?? []).map((s) => ({
        stage: s.stage,
        title: s.title,
        description: s.description,
        milestone: s.milestone,
      })),
      artwork: a.artwork,
    })),
  })
}
