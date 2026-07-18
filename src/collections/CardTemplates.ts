import type { CollectionConfig } from 'payload'

/**
 * カードテンプレート(設計書 §2)。
 * content は {{variable}} プレースホルダを含む HTML。カードは variables を直接埋める
 * (旧実装の「デッキ属性⇔テンプレート変数」マッピング層は簡素化のため持たない)。
 */
export const CardTemplates: CollectionConfig = {
  slug: 'card-templates',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      admin: { description: '{{variable}} プレースホルダを含むHTML(デザイントークンのクラスを使う)' },
    },
    {
      name: 'variables',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: { description: 'content 内の {{name}} と一致させる' },
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'string',
          options: ['string', 'number', 'boolean', 'date'],
        },
        { name: 'isRequired', type: 'checkbox', defaultValue: true },
        { name: 'placeholder', type: 'text' },
        { name: 'description', type: 'text' },
      ],
    },
  ],
}
