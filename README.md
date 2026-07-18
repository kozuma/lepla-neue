# Lepla

アイデンティティ変容を核とした学習プラットフォーム。
開発の判断基準は [CLAUDE.md](./CLAUDE.md)(開発憲法)、デザインは [STYLE_GUIDE.md](./STYLE_GUIDE.md) に従う。

## セットアップ

```sh
docker compose up -d   # ローカル Postgres 起動
pnpm install
pnpm dev               # http://localhost:3000 / 管理画面 http://localhost:3000/admin
```

Node は `.node-version` で固定。環境変数は `.env.example` をコピーして `.env` を作る。

## よく使うコマンド

| コマンド | 内容 |
|---|---|
| `pnpm dev` | 開発サーバー起動 |
| `pnpm test` | Vitest(`services/` の純粋関数テスト) |
| `pnpm db:reset && pnpm db:seed` | DB を初期状態に戻す(セーブポイント) |
| `pnpm db:generate` / `db:migrate` | Drizzle マイグレーション生成 / 適用 |
| `pnpm generate:types` | Payload の型生成 |

## 構成

```
src/
├─ app/
│   ├─ (frontend)/          # 学習者向け画面
│   ├─ (payload)/           # Payload 管理画面(/admin)と内部API(/payload-api)
│   └─ api/                 # Route Handlers(ビジネスロジック API)
├─ collections/             # Payload コレクション(コンテンツ管理専用)
├─ db/schema.ts             # Drizzle スキーマ(動的データの単一の真実)
├─ services/                # 純粋関数のビジネスロジック(テスト最優先)
└─ payload.config.ts
```

旧リポジトリからの引き継ぎ資料は `docs/salvage/` を参照(移植元ではなく参照資料)。
