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

// --- カードテンプレート「四字熟語」 ---
const YOJI_TEMPLATE_NAME = '四字熟語'
let yojiTemplate = (
  await payload.find({
    collection: 'card-templates',
    where: { name: { equals: YOJI_TEMPLATE_NAME } },
  })
).docs[0]

if (!yojiTemplate) {
  yojiTemplate = await payload.create({
    collection: 'card-templates',
    data: {
      name: YOJI_TEMPLATE_NAME,
      description: '四字熟語学習用テンプレート(表: 四字熟語、裏: 読み・意味・例)',
      content: [
        '<div class="flex flex-col gap-4">',
        '  <p class="font-ceremonial text-2xl">{{idiom}}</p>',
        '  <p class="text-secondary text-sm">{{reading}}</p>',
        '  <p class="font-functional">{{meaning}}</p>',
        '  <p class="text-secondary text-sm">{{example}}</p>',
        '</div>',
      ].join('\n'),
      variables: [
        { name: 'idiom', type: 'string', isRequired: true, placeholder: '四字熟語' },
        { name: 'reading', type: 'string', isRequired: true, placeholder: '読み(ひらがな)' },
        { name: 'meaning', type: 'string', isRequired: true, placeholder: '意味' },
        { name: 'example', type: 'string', isRequired: true, placeholder: '例' },
      ],
    },
  })
  console.log(`カードテンプレートを作成: ${YOJI_TEMPLATE_NAME}`)
} else {
  console.log(`カードテンプレートは既存: ${YOJI_TEMPLATE_NAME}`)
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

// --- サンプルデッキ「四字熟語」 ---
const YOJI_DECK_NAME = '四字熟語'
const sage = (
  await payload.find({ collection: 'archetypes', where: { slug: { equals: 'sage' } } })
).docs[0]

let yojiDeck = (
  await payload.find({ collection: 'decks', where: { name: { equals: YOJI_DECK_NAME } } })
).docs[0]

if (!yojiDeck) {
  yojiDeck = await payload.create({
    collection: 'decks',
    data: {
      name: YOJI_DECK_NAME,
      description: '古人の知恵が凝縮された四字熟語。言葉を通じて、ものの見方を養う。',
      status: 'published',
      level: 'easy',
      cardTemplate: yojiTemplate.id,
      archetypeAlignment: {
        primary: sage!.id,
        secondary: [thinker!.id],
      },
    },
  })
  console.log(`デッキを作成: ${YOJI_DECK_NAME}`)
} else {
  console.log(`デッキは既存: ${YOJI_DECK_NAME}`)
}

const YOJI_CARD_SEEDS = [
  { idiom: '一衣帯水', reading: 'いちいたいすい', meaning: '非常に近い関係にあること', example: '日本と韓国は一衣帯水の隣国関係にある。' },
  { idiom: '犬馬之労', reading: 'けんばのろう', meaning: 'ごくわずかな労力や奉仕', example: '私にできることは些細な犬馬之労に過ぎませんが、お手伝いさせてください。' },
  { idiom: '羊頭狗肉', reading: 'ようとうくにく', meaning: '見かけは立派だが中身がそれに伴わないこと', example: 'この店は外観は立派だが、料理は羊頭狗肉だ。' },
  { idiom: '鶏鳴狗盗', reading: 'けいめいくとう', meaning: '取るに足らない些細な悪事', example: '彼の行為は鶏鳴狗盗の類いで、まともな仕事とは言えない。' },
  { idiom: '切磋琢磨', reading: 'せっさたくま', meaning: 'お互いに励まし合い、磨き合うこと', example: '二人は常に切磋琢磨し、互いに高め合っている。' },
  { idiom: '他山之石', reading: 'たざんのいし', meaning: '他人の優れた点や失敗を戒めとして自分の向上に役立てること', example: '先輩の失敗は、私たちにとって他山之石となった。' },
  { idiom: '一意専心', reading: 'いちいせんしん', meaning: 'ひたすら一つのことに専念すること', example: '彼は研究に一意専心し、ついに大発見をした。' },
  { idiom: '粒粒辛苦', reading: 'りゅうりゅうしんく', meaning: '一つ一つの物事に苦労を重ねること', example: '両親の粒粒辛苦の末に、私は大学に進学できた。' },
  { idiom: '傍若無人', reading: 'ぼうじゃくぶじん', meaning: '周りを気にせず、自分勝手な振る舞いをすること', example: '彼は電車内で傍若無人な態度を取り、周囲の人々の顰蹙を買った。' },
  { idiom: '行雲流水', reading: 'こううんりゅうすい', meaning: '物事が自然に滞りなく進むさま', example: '彼女のピアノ演奏は行雲流水のごとく美しかった。' },
]

let yojiOrder = 1
for (const card of YOJI_CARD_SEEDS) {
  const existing = await payload.find({
    collection: 'cards',
    where: {
      and: [{ label: { equals: card.idiom } }, { deck: { equals: yojiDeck.id } }],
    },
  })
  if (existing.totalDocs > 0) {
    console.log(`カードは既存: ${card.idiom}`)
    yojiOrder++
    continue
  }
  await payload.create({
    collection: 'cards',
    data: {
      deck: yojiDeck.id,
      label: card.idiom,
      order: yojiOrder++,
      values: [
        { variable: 'idiom', value: card.idiom },
        { variable: 'reading', value: card.reading },
        { variable: 'meaning', value: card.meaning },
        { variable: 'example', value: card.example },
      ],
    },
  })
  console.log(`カードを作成: ${card.idiom}`)
}

console.log('シード完了')
process.exit(0)
