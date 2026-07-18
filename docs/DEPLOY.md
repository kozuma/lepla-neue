# デプロイ手順(Vercel + Supabase)

## 1. Vercel の環境変数(Project Settings → Environment Variables)

| 変数 | 値 |
|---|---|
| `DATABASE_URL` | Supabase の接続文字列(Session pooler / ポート5432 のもの) |
| `PAYLOAD_SECRET` | ランダム文字列(`openssl rand -hex 32` で生成) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / publishable key |

設定後、Deployments から Redeploy(または main に push)。

## 2. 本番 DB の初期化(ローカルから1回だけ実行)

```sh
DATABASE_URL='<Supabaseの接続文字列>' pnpm db:migrate
DATABASE_URL='<Supabaseの接続文字列>' pnpm db:seed
```

- `db:migrate` は Drizzle マイグレーション(public スキーマ)を適用する
- `db:seed` は Payload テーブル(payload スキーマ)の自動作成 + アーキタイプ・サンプルデッキ・管理ユーザーを投入する
- **`db:reset` は本番に対して実行しないこと**(全データ破棄)

## 3. Supabase Auth の設定(ダッシュボード)

- Authentication → URL Configuration → Site URL に Vercel の本番URL(`https://xxx.vercel.app`)を設定
  (サインアップ確認メールのリンク先に使われる)

## 4. 動作確認

1. 本番URLを開く → `/login` にリダイレクトされる
2. アカウント登録 → 確認メールのリンクを開く → ログイン
3. オンボーディング → 学習 → 完了画面まで一巡
4. `/admin` で Payload 管理画面にログイン(シードの管理ユーザー。**本番ではパスワードを即変更すること**)

## 運用メモ

- ローカル開発は従来どおり(Docker Postgres + 開発ユーザー)。`.env` に Supabase のキーを入れるとローカルでも本物の認証モードになる
- 画像(R2)は未接続。デッキ画像はプレースホルダー表示
