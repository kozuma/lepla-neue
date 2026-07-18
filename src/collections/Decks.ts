import type { CollectionConfig } from 'payload'

/**
 * デッキ(設計書 §2, §3.4)。
 * archetypeAlignment は推奨表示・フィルタ用の親和性(数値の関連度は持たない)。
 */
export const Decks: CollectionConfig = {
  slug: 'decks',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'status', 'level'],
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: ['draft', 'published'],
      admin: {
        description: '学習者向け一覧には published のみ出す(旧実装の「飾りステータス」を繰り返さない)',
      },
    },
    {
      name: 'level',
      type: 'select',
      defaultValue: 'easy',
      options: ['easy', 'medium', 'hard'],
    },
    {
      name: 'cardTemplate',
      type: 'relationship',
      relationTo: 'card-templates',
      required: true,
    },
    {
      name: 'archetypeAlignment',
      type: 'group',
      fields: [
        {
          name: 'primary',
          type: 'relationship',
          relationTo: 'archetypes',
          required: true,
        },
        {
          name: 'secondary',
          type: 'relationship',
          relationTo: 'archetypes',
          hasMany: true,
        },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'ローカルでは public/ 配下、本番は R2(後続フェーズ)' },
    },
  ],
}
