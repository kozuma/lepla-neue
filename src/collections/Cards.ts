import type { CollectionConfig } from 'payload'

/**
 * カード(設計書 §2)。デッキのテンプレートの変数を values で直接埋める。
 */
export const Cards: CollectionConfig = {
  slug: 'cards',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'deck', 'order'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'deck',
      type: 'relationship',
      relationTo: 'decks',
      required: true,
      index: true,
    },
    { name: 'label', type: 'text', required: true },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: { description: 'デッキ内の表示順' },
    },
    {
      name: 'values',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'variable',
          type: 'text',
          required: true,
          admin: { description: 'テンプレートの variables.name と一致させる' },
        },
        { name: 'value', type: 'textarea', required: true },
      ],
    },
  ],
}
