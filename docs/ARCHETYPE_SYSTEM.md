# アーキタイプシステム設計書

作成日: 2026-07-18 / 対象: 新リポジトリ（Lepla v2）

**本文書の位置づけ**: `docs/CLAUDE.md`（開発憲法）§7 および `docs/salvage/API_CONTRACT.md` が「新スキーマの正」として参照する設計書の実体である。旧リポジトリの `apps/web-new/docs/lepla-v2-implementation-guide.md`（2025-10-27版）をベースに、以下を反映してリライトした:

- 開発憲法で確定した技術スタック（Payload CMS 3.x / Drizzle / Supabase / Route Handlers）
- 現行 web-new に実装済みのドメインロジック（`lib/archetypes/` 配下。挙動の詳細は `docs/salvage/DOMAIN_KNOWLEDGE.md` §5 に file:line 付きで記録済み）
- 「静かな美術館」デザイン移行（feature/design-migration ブランチ）で確立したレジスター規約

旧ガイドとの差分は §9 にまとめた。矛盾がある場合は本文書を正とする。

---

## 1. コンセプト

**アイデンティティ変容を支援する学習プラットフォーム。**

- ユーザーは「アーキタイプ（理想像）」を選び、日々の学習をその理想への**投票**として積み重ねる（James Clear『Atomic Habits』: "Every action is a vote for the type of person you wish to become"）
- 「〇〇を学ぶ」ではなく「〇〇な人になる」。知識定着はその結果
- アーキタイプは「becoming（〜になる）」の道具であり、「you are（あなたは〜だ）」という診断・分類ではない。文言・UI・APIの命名すべてで「変容・道・旅」の語彙を使う
- 美学は「静かな美術館」。ゲーミフィケーション（ランキング・ポイント・プログレスバー・達成率）は採用しない。理由は `why-not-gamification.md` を参照

### 二層構造（最重要の設計原則）

システムは内部で詳細なメトリクスを記録するが、ユーザーに見せるのは**物語**（段階、称号、詩的メッセージ）のみ。

| 層 | 内容 | 露出 |
|---|---|---|
| 物語層 | 成長段階の称号、詩的表現（「23の足跡」「深き歩み」）、儀式的メッセージ | UI・APIレスポンスに出す |
| 数値層 | 投票数、投票強度、品質スコア、昇格しきい値、解放条件 | DBと `services/` 内部のみ。APIレスポンスに含めない |

「データがあるから表示する」は禁止。表示には物語上の必然性が要る（憲法 §3-4）。

---

## 2. ドメインモデル概観

```
┌─ コンテンツ（静的・Payload CMS で管理）─────────────┐
│  Archetype定義（名前、描写、成長段階の称号、史上の人物…） │
│  デッキ・カードテンプレート・TopicStructure              │
└──────────────────────────────────────┘
┌─ 動的データ（Drizzle スキーマ + Route Handlers）───────┐
│  UserArchetype   … ユーザーとアーキタイプの旅の状態        │
│  IdentityVote    … 投票（学習行動の記録）                │
│  StudySession    … 学習セッション                        │
└──────────────────────────────────────┘
```

- **アーキタイプ定義はコンテンツである**。Payload のコレクションとして管理し、コード内ハードコード（旧 `definitions.ts`）から脱却する。シードには全アーキタイプ定義を含める（憲法 §6）
- **投票・進捗はサーバー永続化する**。旧実装は localStorage 完結（サーバー非接続のプロトタイプ）だったが、新リポジトリでは初めからDBに置く
- 投票強度計算・昇格判定は `services/voting.ts` / `services/session.ts` の**純粋関数**として実装し、Vitest でテストする（憲法 §5）

---

## 3. アーキタイプ定義（コンテンツモデル）

### 3.1 フィールド

```typescript
Archetype {
  id: string              // 'thinker' 等の安定スラッグ。UI・投票の外部キー
  name: string            // 「思想家」
  nameEn: string          // 'THE THINKER'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  subtitle: string        // 「物事の本質を見抜く」
  description: string     // 儀式的レジスターの描写文
  historicalFigures: { name: string; description: string }[]
  relatedFields: string[] // 関連分野（哲学、倫理学…）
  qualities: string[]     // 資質（深く考える、本質を問う…）
  growthStages: GrowthStage[]  // 3段階（§5）
  artwork: string         // カードアートワーク（SVG）への参照
  unlockCondition?: ...   // レア用。§3.3
}

GrowthStage {
  stage: 0 | 1 | 2
  title: string           // 称号: 「問いを持つ者」→「探求者」→「思想家」
  description: string
  milestone: string       // 表示用の詩的表現。実際の条件は書かない
}
```

### 3.2 初期アーキタイプ

Phase 1 は **common 3種**。定義本文（描写・史上の人物・成長段階の称号）は旧 `apps/web-new/lib/archetypes/definitions.ts` を正として移植し、Payload シードに変換する。

| id | 名前 | 成長段階の称号 (0→1→2) | アートワーク |
|---|---|---|---|
| `thinker` | 思想家 | 問いを持つ者 → 探求者 → 思想家 | `archetype-thinker.svg` |
| `creator` | 創作家 | 見習い → 職人 → 創作家 | `archetype-creator.svg` |
| `scientist` | 科学者 | 観察者 → 研究者 → 科学者 | `archetype-scientist.svg` |

アートワークは旧リポジトリに `explorer` / `sage` 分も作成済み（`FRONTEND_ASSETS.md` の持ち出しリスト参照）。Phase 2 以降のアーキタイプ追加候補として温存する。

### 3.3 レアアーキタイプ（Phase 3）

- レアアーキタイプは「目指すもの」ではなく「**授かるもの**」（憲法 §3-1）
- 解放条件はサーバー内部でのみ判定し、**原則秘匿**。「あとX回で解放」のような逆算可能な表示・進捗バー化は禁止
- ユーザーへの予兆は「何かが近づいている…」程度の神秘的なヒントに留める（Phase 2 の hints 機能）

### 3.4 デッキとの関連

デッキはアーキタイプとの親和性を持つ（推奨表示・フィルタに使用）:

```typescript
Deck.archetypeAlignment {
  primary: string        // 主要アーキタイプid
  secondary?: string[]
}
```

旧設計にあった `affinity: number`（0-100の関連度）は、数値管理のコストに見合う用途が未定のため Phase 1 では持たない。必要になったら追加する。

---

## 4. 投票システム

### 4.1 投票（IdentityVote）

学習行動1回を、選択中アーキタイプへの1票として記録する。

```typescript
IdentityVote {
  id: string
  userId: string
  archetypeId: string
  action: VoteAction
  strength: number        // 1.0〜2.0（下記）
  createdAt: Date
  metadata: {             // 内部記録用。API露出しない
    deckId?: string
    cardsStudied?: number
    sessionDuration?: number   // 秒
    averageCardTime?: number   // 秒
    flippedCards?: number
  }
}

VoteAction =
  | 'daily_study'          // 毎日の学習（Phase 1 はこれのみ）
  | 'deep_engagement'      // 深い関与
  | 'return_after_break'   // 中断後の再開
  | 'explore_new_topic'    // 新しいトピック
  | 'review_old_material'  // 復習
  | 'complete_deck'        // デッキ完了
  | 'consistent_week'      // 1週間継続
```

### 4.2 投票強度の計算式（正典）

**「量より質」**（憲法 §3-3）。流し見は base のまま、深い学習が加点される。旧 `lib/archetypes/vote-calculator.ts` の実装を正とし、`services/voting.ts` に純粋関数として移植する。

```
strength = 1.0（base）
  + 0.3  if セッション時間 ≥ 10分
  + 0.2  if 学習カード数 ≥ 5
  + 0.2  if 平均カード時間 ≥ 30秒
  + 0.2  if 裏返し率（flipped/studied）≥ 0.5
  + 0.1  if 前日も学習していた（連続日）
→ min(2.0, strength)      // 範囲は 1.0〜2.0
```

アクション補正（乗算後、上限2.0でクランプ）:

| action | 補正 |
|---|---|
| daily_study / review_old_material | ×1.0 |
| return_after_break | ×1.1 |
| explore_new_topic | ×1.15 |
| deep_engagement | ×1.2 |
| complete_deck / consistent_week | 常に 2.0（最大値固定） |

**重要**: 計算はサーバー側（Route Handler → service）で行う。クライアントはセッションの生メタデータ（時間、カード数、裏返し数）だけを送り、strength を自己申告させない。旧実装は3つの別計算式が併存していた（§9）。この式のみを残す。

### 4.3 投票の記録タイミング

- 学習セッション完了時に1票（Phase 1）
- 同日複数セッションの扱い: 票は毎回記録するが、ストリーク・アクティブ日数は日単位で重複除去（§6）

---

## 5. 成長段階と昇格

### 5.1 段階

各アーキタイプにつき Stage 0 → 1 → 2 の3段階。Stage 2 が最終。昇格は投票記録のたびにサーバーで自動判定し、**1回の判定で1段のみ**上がる。

### 5.2 昇格条件（隠しパラメータ — UI・API露出禁止）

| 昇格 | 総投票数 | 平均品質（strength平均） | アクティブ日数 |
|---|---|---|---|
| 0 → 1 | ≥ 15 | ≥ 1.3 | ≥ 7 |
| 1 → 2 | ≥ 50 | ≥ 1.5 | ≥ 21 |

3条件すべてを満たしたとき昇格。しきい値は `services/` 内の定数とし、APIレスポンス・クライアントコードに一切出さない（グラインド誘発の防止。憲法 §3-1）。

### 5.3 昇格の演出

昇格時は数値ではなく物語で伝える。「探求者となった」という称号の授与と儀式的メッセージのみ。「あと○票で昇格」系の表示は禁止事項（`why-not-gamification.md`）。

---

## 6. ストリークとアクティブ日数

- **アカウント単位・日単位**で判定する。投票日の重複除去後、「今日」から遡って連続日数を数える（今日未学習なら現ストリークは0）
- 旧バックエンドの連続学習日数ロジックは**カード単位・他ユーザー混入のバグ**があった（`DOMAIN_KNOWLEDGE.md` §3.3）。持ち込まず、上記で再設計する
- 表示は詩的表現のみ:「7つの日を歩みたり」。途切れた時は罪悪感を与えず「また今日から」。ストリーク数の強調・煽りは禁止（憲法 §8）

### 数値の詩的翻訳

投票数・日数は `formatPoeticNumber` 系の変換を通してのみ表示する（旧 `vote-calculator.ts:6-38` を移植）:

```
投票数: 始まりの時(0) / 僅かな歩み(<10) / 着実な歩み(<30) / 確かな歩み(<50)
        / 深き歩み(<100) / 豊かな歩み(<200) / 偉大なる歩み(≥200)
```

この変換は UI 都合の整形ではなく**二層構造の実装**なので、`services/` に置いてテスト対象とする。

---

## 7. データ設計（Drizzle スキーマ方針）

動的データのテーブル案。詳細な型は `db/schema.ts` 実装時に確定する。

```
user_archetypes            -- ユーザー×アーキタイプの旅
  user_id, archetype_id, is_primary, started_at
  current_stage (0-2)
  -- 集計キャッシュ（内部用）: total_votes, quality_avg, active_days,
  --                          current_streak, longest_streak

identity_votes             -- 投票の一次記録（append-only）
  id, user_id, archetype_id, action, strength, metadata(jsonb), created_at

study_sessions             -- 学習セッション
  id, user_id, deck_id, started_at, ended_at,
  cards_studied, flipped_cards
```

方針:

- `identity_votes` が一次データ。`user_archetypes` の集計列は投票記録時に service が更新するキャッシュであり、投票ログから常に再計算可能にしておく（集計バッチは Vercel Cron から叩ける構成。憲法 §5）
- 昇格判定・ストリーク計算は「投票ログ＋現在時刻」を入力とする純粋関数にし、DBアクセスと分離する
- 旧 `UserArchetype.hidden`（contemplationDepth / consistency / curiosityIndex）は品質平均・ストリーク・日数の単純な派生値だったため、**独立カラムとしては持たない**。必要なら派生計算で足りる
- Phase 1 は primary アーキタイプ1つのみ（`is_primary`）。複数保有は Phase 3

### API 方針（Route Handlers）

- `POST /api/sessions/:id/complete` … セッション完了 → 投票記録・昇格判定・ストリーク更新をサーバーで実行
- `GET /api/me/journey` … ホーム/プロフィール用。返すのは**物語層のみ**: 選択アーキタイプ、現在の段階と称号、詩的表現に変換済みの歩み・日数。生の投票数・strength・しきい値は返さない
- ハンドラは4行構成（認証 → Zod → service → レスポンス）を守る（憲法 §5）

---

## 8. オンボーディングとUI原則

### 8.1 オンボーディングフロー（実装済みの流れを踏襲）

```
/（未完了時リダイレクト）
  → /onboarding/welcome            … ウェルカム（儀式的レジスター）
  → /onboarding/archetype-select   … タロット風・1枚ずつのカード送りで選択
  → /onboarding/confirmation       … 確認 + 儀式的静止（2秒 / reduced-motion時は0秒）
  → /                              … 旅の始まり
```

- 選択は手動（診断テストはしない — 「診断」は "you are" の語彙であり思想に反する）
- アーキタイプ変更時は進捗を初期化する（同じIDの再選択は no-op）

### 8.2 コピーの二レジスター（憲法 §5）

- **機能的ラベル**（ナビ・ボタン・見出し）: 平易な日本語
- **儀式的・物語的場面**（オンボーディング、アーキタイプ描写、成長段階名、学習開始/完了メッセージ）: 荘重な文体（「汝」「〜たり」を適度に）

数値の詩的翻訳・プレッシャー/比較/評価の禁止・神秘性の維持は `why-not-gamification.md` と `STYLE_GUIDE.md` に従う。

### 8.3 実装してはいけない機能（再掲・抜粋）

ランキング / ポイント・経験値 / バッジ / 目標設定 / 達成率プログレスバー / 正解率表示 / 「あとX回で〜」表示 / FOMO通知。全リストは `why-not-gamification.md`。

---

## 9. 旧実装から引き継ぐもの・捨てるもの

| 対象 | 判断 | 備考 |
|---|---|---|
| `lib/archetypes/definitions.ts` の定義本文 | **引き継ぐ** | Payload シードに変換。文言は正典 |
| `lib/archetypes/vote-calculator.ts` の計算式・詩的翻訳 | **引き継ぐ** | `services/voting.ts` に純粋関数として移植（§4.2, §6） |
| 成長段階しきい値（15/1.3/7 → 50/1.5/21） | **引き継ぐ** | サーバー内部の定数に（§5.2） |
| アートワークSVG 5種・オンボーディングUI | **引き継ぐ** | `FRONTEND_ASSETS.md` の持ち出しリストに従う |
| localStorage 永続化（zustand persist / useVoting） | **捨てる** | サーバー永続化に置換（§7）。移行すべき既存ユーザーデータはない |
| `StudyView.tsx` 内の別系統 strength 計算 | **捨てる** | lib版と係数が異なる重複実装。§4.2 に統一 |
| `lib/hooks/useVoting.ts`（confidence 1-5 のカード単位投票） | **捨てる** | 実験実装の残骸。セッション単位投票（§4）を正とする |
| `types/vote.ts` の「strength: 1-5」コメント | **捨てる** | 実装は1.0〜2.0。本文書が正 |
| 旧バックエンドの連続学習日数ロジック | **捨てる** | カード単位・他人混入バグ（§6）。アカウント単位で再設計 |
| `UnlockCondition.check`（クライアント側関数） | **捨てる** | 解放判定はサーバー内部へ（§3.3） |
| 旧ガイドの Zustand+TanStack Query+localStorage 前提 | **捨てる** | 憲法 §4 のスタックが正 |

---

## 10. フェーズ計画

### Phase 1（MVP）

- アーキタイプ: common 3種、手動選択、1つのみ
- 成長: Stage 0 → 1 のみ到達可能（2への昇格判定はサーバーに実装しておくが、コンテンツ演出は後続）
- 投票: セッション完了時の `daily_study` のみ。strength 計算はフル実装（§4.2）
- 画面: ホーム / オンボーディング3画面 / デッキ一覧・詳細 / 学習 / プロフィール
- サーバー永続化（§7）を Phase 1 から行う

### Phase 2

- 新アーキタイプ追加（explorer / sage — アートワーク作成済み）
- Stage 2 への成長演出、神秘的なヒント（「何かが近づいている…」）
- VoteAction の拡充（deep_engagement / complete_deck 等の発火条件実装）

### Phase 3

- レアアーキタイプ（授かるもの。解放条件は秘匿）
- 複数アーキタイプ保有
- ジャーナル機能

---

## 参照文書

- `docs/CLAUDE.md` — 開発憲法（不可侵事項・スタック・規律）
- `docs/salvage/DOMAIN_KNOWLEDGE.md` §5 — 旧実装の挙動記録（file:line 付き）
- `docs/salvage/API_CONTRACT.md` — 旧APIの考古学資料（照合用）
- `docs/salvage/FRONTEND_ASSETS.md` — フロント資産の持ち出し許可リスト
- `apps/web-new/docs/why-not-gamification.md` — ゲーミフィケーション非採用の設計哲学
- `apps/web-new/docs/STYLE_GUIDE.md` — 「静かな美術館」スタイルガイド
