/**
 * シードデータ投入(開発憲法 §6: セーブポイント)
 * 冪等: 既存データ(slug / name / email で検索)があれば再利用する。
 * 含むもの: アーキタイプ3種・カードテンプレート「英単語」・サンプルデッキ・テスト用カード・開発用管理ユーザー
 */
import 'dotenv/config'
import { getPayload } from 'payload'

import config from '../src/payload.config'
import { ARCHETYPE_SEEDS } from './seed-data/archetypes'

const payload = await getPayload({ config })

// --- 開発用 Payload 管理ユーザー ---
const ADMIN_EMAIL = 'admin@lepla.local'
const existingAdmin = await payload.find({
  collection: 'users',
  where: { email: { equals: ADMIN_EMAIL } },
})
if (existingAdmin.totalDocs === 0) {
  await payload.create({
    collection: 'users',
    data: { email: ADMIN_EMAIL, password: 'lepla-admin' },
  })
  console.log(`管理ユーザーを作成: ${ADMIN_EMAIL} / lepla-admin(ローカル開発専用)`)
} else {
  console.log(`管理ユーザーは既存: ${ADMIN_EMAIL}`)
}

// --- アーキタイプ3種 ---
for (const seed of ARCHETYPE_SEEDS) {
  const existing = await payload.find({
    collection: 'archetypes',
    where: { slug: { equals: seed.slug } },
  })
  if (existing.totalDocs > 0) {
    console.log(`アーキタイプは既存: ${seed.slug}`)
    continue
  }
  await payload.create({
    collection: 'archetypes',
    data: {
      slug: seed.slug,
      name: seed.name,
      nameEn: seed.nameEn,
      rarity: seed.rarity,
      subtitle: seed.subtitle,
      description: seed.description,
      historicalFigures: seed.historicalFigures,
      relatedFields: seed.relatedFields.map((value) => ({ value })),
      qualities: seed.qualities.map((value) => ({ value })),
      growthStages: seed.growthStages,
      artwork: seed.artwork,
    },
  })
  console.log(`アーキタイプを作成: ${seed.slug}(${seed.name})`)
}

// --- カードテンプレート「英単語」 ---
const TEMPLATE_NAME = '英単語'
let template = (
  await payload.find({
    collection: 'card-templates',
    where: { name: { equals: TEMPLATE_NAME } },
  })
).docs[0]

if (!template) {
  template = await payload.create({
    collection: 'card-templates',
    data: {
      name: TEMPLATE_NAME,
      description: '英単語学習用の基本テンプレート(表: 単語、裏: 意味と例文)',
      content: [
        '<div class="flex flex-col gap-4">',
        '  <p class="font-latin-display text-2xl">{{title}}</p>',
        '  <p class="text-secondary text-sm">{{phonetic}}</p>',
        '  <p class="font-functional">{{meaning}}</p>',
        '  <p class="font-latin-display text-sm">{{example_en}}</p>',
        '  <p class="text-secondary text-sm">{{example_ja}}</p>',
        '</div>',
      ].join('\n'),
      variables: [
        { name: 'title', type: 'string', isRequired: true, placeholder: '単語' },
        { name: 'phonetic', type: 'string', isRequired: true, placeholder: '発音記号' },
        { name: 'meaning', type: 'string', isRequired: true, placeholder: '意味' },
        { name: 'example_en', type: 'string', isRequired: true, placeholder: '例文(英)' },
        { name: 'example_ja', type: 'string', isRequired: true, placeholder: '例文(日)' },
      ],
    },
  })
  console.log(`カードテンプレートを作成: ${TEMPLATE_NAME}`)
} else {
  console.log(`カードテンプレートは既存: ${TEMPLATE_NAME}`)
}

// --- サンプルデッキ ---
const DECK_NAME = '基礎英単語'
const thinker = (
  await payload.find({ collection: 'archetypes', where: { slug: { equals: 'thinker' } } })
).docs[0]
const scientist = (
  await payload.find({ collection: 'archetypes', where: { slug: { equals: 'scientist' } } })
).docs[0]

let deck = (
  await payload.find({ collection: 'decks', where: { name: { equals: DECK_NAME } } })
).docs[0]

if (!deck) {
  deck = await payload.create({
    collection: 'decks',
    data: {
      name: DECK_NAME,
      description: '日々の学びの最初の一歩となる、基礎的な英単語。',
      status: 'published',
      level: 'easy',
      cardTemplate: template.id,
      archetypeAlignment: {
        primary: thinker!.id,
        secondary: [scientist!.id],
      },
    },
  })
  console.log(`デッキを作成: ${DECK_NAME}`)
} else {
  console.log(`デッキは既存: ${DECK_NAME}`)
}

// --- テスト用カード ---
const CARD_SEEDS = [
  {
    label: 'contemplate',
    order: 1,
    values: [
      { variable: 'title', value: 'contemplate' },
      { variable: 'phonetic', value: '/ˈkɒntəmpleɪt/' },
      { variable: 'meaning', value: '熟考する、沈思する' },
      { variable: 'example_en', value: 'She sat quietly, contemplating the question.' },
      { variable: 'example_ja', value: '彼女は静かに座り、その問いについて熟考した。' },
    ],
  },
  {
    label: 'observe',
    order: 2,
    values: [
      { variable: 'title', value: 'observe' },
      { variable: 'phonetic', value: '/əbˈzɜːv/' },
      { variable: 'meaning', value: '観察する、気づく' },
      { variable: 'example_en', value: 'He observed the stars every night.' },
      { variable: 'example_ja', value: '彼は毎晩星を観察した。' },
    ],
  },
  {
    label: 'create',
    order: 3,
    values: [
      { variable: 'title', value: 'create' },
      { variable: 'phonetic', value: '/kriˈeɪt/' },
      { variable: 'meaning', value: '創造する、生み出す' },
      { variable: 'example_en', value: 'She creates something new every day.' },
      { variable: 'example_ja', value: '彼女は毎日新しい何かを生み出す。' },
    ],
  },
]

for (const card of CARD_SEEDS) {
  const existing = await payload.find({
    collection: 'cards',
    where: {
      and: [{ label: { equals: card.label } }, { deck: { equals: deck.id } }],
    },
  })
  if (existing.totalDocs > 0) {
    console.log(`カードは既存: ${card.label}`)
    continue
  }
  await payload.create({
    collection: 'cards',
    data: { deck: deck.id, ...card },
  })
  console.log(`カードを作成: ${card.label}`)
}

console.log('シード完了')
process.exit(0)
