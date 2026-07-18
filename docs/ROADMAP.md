# Lepla 開発ロードマップ

## Phase 0: プロジェクト基盤 — ✅ 完了 (2026-07-18)

- [x] pnpm + Next.js (App Router) + TypeScript、`.node-version` 固定
- [x] Docker Compose の Postgres 1コンテナ(`compose.yml`)、`.env.example`
- [x] Payload CMS 3.86 マウント(`/admin`、内部APIは `/payload-api` に分離、`payload` スキーマに隔離)
- [x] Drizzle + drizzle-kit セットアップ(`src/db/schema.ts` は Phase 1 で本設計)
- [x] `pnpm db:reset` / `pnpm db:seed` の枠組み
- [x] Vitest + `services/` 移植: 旧 `vote-calculator.ts` → `services/voting.ts` / `services/session.ts`(テスト27件)
- [x] デザイン基盤の持ち出し: `globals.css`(トークン正典)/ `STYLE_GUIDE.md` / アーキタイプSVG 5点 / フォント設定

## Phase 1: スキーマ本設計 + コンテンツ管理 — ✅ 完了 (2026-07-18)

正: `docs/ARCHETYPE_SYSTEM.md`(アーキタイプシステム設計書)

- [x] Drizzle スキーマ設計(`identity_votes` / `user_archetypes` / `study_sessions`、マイグレーション `0000_goofy_sleeper.sql`)
- [x] Payload コレクション定義(Archetypes / CardTemplates / Decks / Cards)
  - カードは「テンプレート変数を直接埋める」簡素化モデルを採用(旧2層メタモデルのマッピング層は持たない。Hiroshi 承認済み)
- [x] シード実装(アーキタイプ3種 + テンプレート「英単語」+ サンプルデッキ + カード3枚 + 開発用管理ユーザー)。冪等性確認済み
- [→] Supabase Auth は実配線を Phase 2 に後送り(Hiroshi 承認済み)。スキーマは `user_id uuid` で受け入れ準備済み

## Phase 2: API + フロントエンド — ✅ 完了 (2026-07-18)

- [x] 認証ヘルパー `src/lib/auth.ts`(Supabase 環境変数があれば JWT 検証、ローカルは固定開発ユーザー。本番では未設定を許さない)
- [x] Route Handlers(4行構成):
  - `POST /api/me/archetype`(選択・変更。再選択は no-op、変更は進捗初期化)
  - `GET /api/me/journey`(物語層のみ: 称号・詩的表現・hasWalkedToday)
  - `POST /api/sessions` / `POST /api/sessions/:id/complete`(strength はサーバー計算、二重完了ガード)
  - `GET /api/archetypes` / `GET /api/decks` / `GET /api/decks/:id` / `GET /api/decks/:id/cards`
- [x] DB オーケストレーション層 `src/db/journey.ts`(純粋関数 services と DB を接続)
- [x] services 拡張: `deriveVoteParams` / `summarizeVotes` / `buildJourneyNarrative`(テスト34件)
- [x] フロントエンド移植(許可リスト準拠): ホーム / オンボーディング3画面 / 書庫(一覧・詳細) / 学習フロー(Intro→カード送り→完了・昇格演出) / 旅の記録。React Query + 同一オリジン fetch。localStorage 永続は廃止しサーバーが唯一の真実
- 補足: 旧 profile の「最近の足あと」一覧は未移植(投票履歴の露出設計を Phase 3 で検討)

## Phase 3 以降(仮)

- [ ] Supabase Auth 実配線(ログイン画面・middleware)+ Vercel デプロイ / Supabase 本番 / R2 接続
- [ ] テンプレート content HTML を使ったカード本レンダリング
- [ ] 新アーキタイプ(explorer / sage)、Stage 2 演出、VoteAction 拡充(設計書 Phase 2)
