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

## Phase 2 以降(仮)

- [ ] Supabase Auth(学習者側認証)導入 + 開発用スタブ
- [ ] Route Handlers(セッション・投票・進捗 API、4行構成)
- [ ] フロントエンド移植(オンボーディング / ホーム / 学習フロー / プロフィール — FRONTEND_ASSETS.md の許可リストに従う)
- [ ] Vercel デプロイ / Supabase 本番 / R2 接続
