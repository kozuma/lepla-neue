/**
 * アーキタイプ3種のシード原稿。
 * 文言は旧リポジトリ lib/archetypes/definitions.ts を正典として移植
 * (FRONTEND_ASSETS.md の持ち出し許可リスト。絵文字 icon は設計書 §3.1 に無いため持ち込まない)
 */
export const ARCHETYPE_SEEDS = [
  {
    slug: 'thinker',
    name: '思想家',
    nameEn: 'THE THINKER',
    rarity: 'common' as const,
    subtitle: '物事の本質を見抜く',
    description:
      '表面的な事象にとどまらず、その奥にある真理を探求する人。\n深い洞察と論理的思考で、世界を理解しようとします。',
    historicalFigures: [
      { name: 'ソクラテス', description: '「無知の知」を説き、対話を通じて真理を探求' },
      { name: 'カント', description: '純粋理性で認識の限界を問う' },
      { name: '老子', description: '「道」の思想で宇宙の本質に迫る' },
    ],
    relatedFields: ['哲学', '倫理学', '論理学', '形而上学'],
    qualities: ['深く考える', '本質を問う', '対話する', '疑問を持つ'],
    growthStages: [
      { stage: 0, title: '問いを持つ者', description: '最初の一歩を踏み出した', milestone: '旅の始まり' },
      { stage: 1, title: '探求者', description: '問いを深め続けている', milestone: '継続的な探求' },
      { stage: 2, title: '思想家', description: '本質を見抜く者となった', milestone: '深き洞察' },
    ],
    artwork: '/archetypes/archetype-thinker.svg',
  },
  {
    slug: 'creator',
    name: '創作家',
    nameEn: 'THE CREATOR',
    rarity: 'common' as const,
    subtitle: '新しいものを生み出す',
    description:
      '想像力と技術で、世界に新しい価値を創造する人。\n表現することで、自分と世界を繋ぎます。',
    historicalFigures: [
      { name: 'レオナルド・ダ・ヴィンチ', description: '芸術と科学を融合' },
      { name: '宮崎駿', description: '想像力で新しい世界を創造' },
      { name: 'バッハ', description: '音楽の建築家として調和を追求' },
    ],
    relatedFields: ['芸術', 'デザイン', '文学', '音楽'],
    qualities: ['創造する', '表現する', '美を追求する', '実験する'],
    growthStages: [
      { stage: 0, title: '見習い', description: '創作の道を歩み始めた', milestone: '最初の作品' },
      { stage: 1, title: '職人', description: '技術を磨いている', milestone: '継続的な創作' },
      { stage: 2, title: '創作家', description: '独自の表現を確立した', milestone: '唯一無二の作品' },
    ],
    artwork: '/archetypes/archetype-creator.svg',
  },
  {
    slug: 'scientist',
    name: '科学者',
    nameEn: 'THE SCIENTIST',
    rarity: 'common' as const,
    subtitle: '世界の仕組みを解き明かす',
    description:
      '観察と実験を通じて、自然界の法則を理解しようとする人。\n好奇心と論理で、真実に迫ります。',
    historicalFigures: [
      { name: 'アインシュタイン', description: '相対性理論で時空を再定義' },
      { name: 'マリー・キュリー', description: '放射能の研究でノーベル賞を2度受賞' },
      { name: 'ダーウィン', description: '進化論で生物界の真理を解明' },
    ],
    relatedFields: ['物理学', '化学', '生物学', '数学'],
    qualities: ['観察する', '仮説を立てる', '検証する', '発見する'],
    growthStages: [
      { stage: 0, title: '観察者', description: '世界を観る目を得た', milestone: '最初の発見' },
      { stage: 1, title: '研究者', description: '探求を深めている', milestone: '継続的な研究' },
      { stage: 2, title: '科学者', description: '真理に迫る者となった', milestone: '深き理解' },
    ],
    artwork: '/archetypes/archetype-scientist.svg',
  },
  // --- 以下2種はアートワーク先行分の定義【原案】。文言は Hiroshi のレビューを経て確定する ---
  {
    slug: 'explorer',
    name: '探検家',
    nameEn: 'THE EXPLORER',
    rarity: 'common' as const,
    subtitle: '未知の地平へ踏み出す',
    description:
      'まだ見ぬ世界に心を惹かれ、自らの足で確かめようとする人。\n好奇心と勇気で、地図の外側へと歩みを進めます。',
    historicalFigures: [
      { name: '伊能忠敬', description: '55歳から日本全土を歩き、実測の地図を作り上げた' },
      { name: 'マゼラン', description: '世界周航で地球の広がりを証明' },
      { name: 'アメリア・イアハート', description: '大西洋単独横断飛行で空の未知に挑んだ' },
    ],
    relatedFields: ['地理', '歴史', '語学', '文化人類学'],
    qualities: ['踏み出す', '確かめる', '出会う', '地図を描く'],
    growthStages: [
      { stage: 0, title: '旅立つ者', description: '最初の一歩を踏み出した', milestone: '旅の始まり' },
      { stage: 1, title: '道を行く者', description: '未知への歩みを続けている', milestone: '続く足あと' },
      { stage: 2, title: '探検家', description: '自らの地図を描く者となった', milestone: '新たな地平' },
    ],
    artwork: '/archetypes/archetype-explorer.svg',
  },
  {
    slug: 'sage',
    name: '賢者',
    nameEn: 'THE SAGE',
    rarity: 'common' as const,
    subtitle: '知を集め、意味を結ぶ',
    description:
      '学びを蓄え、それらを結びつけて智慧へと昇華させる人。\n静かな時間の中で、知識は理解へと熟していきます。',
    historicalFigures: [
      { name: '孔子', description: '学びと徳を結び、後世に道を示した' },
      { name: 'ヒュパティア', description: '古代アレクサンドリアで数学と哲学を講じた' },
      { name: '空海', description: '諸学を修め、思想と実践を結んだ' },
    ],
    relatedFields: ['古典', '宗教学', '文学', '思想史'],
    qualities: ['蓄える', '結びつける', '熟成させる', '伝える'],
    growthStages: [
      { stage: 0, title: '学びの徒', description: '智慧への道を歩み始めた', milestone: '旅の始まり' },
      { stage: 1, title: '識る者', description: '知を結び続けている', milestone: '深まる理解' },
      { stage: 2, title: '賢者', description: '智慧を灯す者となった', milestone: '結ばれた智' },
    ],
    artwork: '/archetypes/archetype-sage.svg',
  },
]
