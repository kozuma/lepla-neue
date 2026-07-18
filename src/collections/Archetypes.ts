import type { CollectionConfig } from 'payload'

/**
 * アーキタイプ定義(設計書 §3)— コンテンツとして Payload で管理する。
 * 動的データ(user_archetypes / identity_votes)からは slug で参照される。
 *
 * 命名は「変容・道・旅」の語彙を守る(憲法 §3-1)。growthStages.milestone は
 * 表示用の詩的表現であり、実際の昇格条件(しきい値)はここに書かない。
 */
export const Archetypes: CollectionConfig = {
  slug: 'archetypes',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['slug', 'name', 'rarity'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: '安定スラッグ(thinker 等)。投票・UIの外部キーになるため変更しない',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: '「思想家」など' },
    },
    {
      name: 'nameEn',
      type: 'text',
      required: true,
      admin: { description: 'THE THINKER など(ラテン語小ラベル表示用)' },
    },
    {
      name: 'rarity',
      type: 'select',
      required: true,
      defaultValue: 'common',
      options: ['common', 'rare', 'epic', 'legendary'],
    },
    {
      name: 'subtitle',
      type: 'text',
      required: true,
      admin: { description: '「物事の本質を見抜く」など' },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: { description: '儀式的レジスターの描写文' },
    },
    {
      name: 'historicalFigures',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text', required: true },
      ],
    },
    {
      name: 'relatedFields',
      type: 'array',
      labels: { singular: '関連分野', plural: '関連分野' },
      fields: [{ name: 'value', type: 'text', required: true }],
    },
    {
      name: 'qualities',
      type: 'array',
      labels: { singular: '資質', plural: '資質' },
      fields: [{ name: 'value', type: 'text', required: true }],
    },
    {
      name: 'growthStages',
      type: 'array',
      minRows: 3,
      maxRows: 3,
      fields: [
        {
          name: 'stage',
          type: 'number',
          required: true,
          min: 0,
          max: 2,
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: { description: '称号(「問いを持つ者」など)' },
        },
        { name: 'description', type: 'text', required: true },
        {
          name: 'milestone',
          type: 'text',
          required: true,
          admin: { description: '詩的表現。実際の昇格条件は書かない(秘匿)' },
        },
      ],
    },
    {
      name: 'artwork',
      type: 'text',
      required: true,
      admin: { description: 'カードアートワークのパス(/archetypes/archetype-thinker.svg 等)' },
    },
  ],
}
