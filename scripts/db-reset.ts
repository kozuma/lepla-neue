/**
 * DB を初期状態に戻す(開発憲法 §6: AI との高速試行錯誤のセーブポイント)
 * 使い方: pnpm db:reset && pnpm db:seed
 *
 * - public スキーマ(Drizzle 管轄)と payload スキーマ(Payload 管轄)を破棄して作り直す
 * - Drizzle マイグレーションがあれば適用する
 * - Payload のテーブルは次回 `pnpm dev` 起動時に自動作成される(dev push)
 */
import 'dotenv/config'
import { execSync } from 'child_process'
import { existsSync, readdirSync } from 'fs'
import { Client } from 'pg'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL が設定されていません(.env を確認)')
  process.exit(1)
}

const client = new Client({ connectionString: url })
await client.connect()

console.log('スキーマを初期化しています...')
await client.query('DROP SCHEMA IF EXISTS public CASCADE')
await client.query('DROP SCHEMA IF EXISTS payload CASCADE')
await client.query('CREATE SCHEMA public')
await client.end()

const hasMigrations =
  existsSync('src/db/migrations') &&
  readdirSync('src/db/migrations').some((f) => f.endsWith('.sql'))

if (hasMigrations) {
  console.log('Drizzle マイグレーションを適用しています...')
  execSync('pnpm drizzle-kit migrate', { stdio: 'inherit' })
} else {
  console.log('Drizzle マイグレーションはまだありません(スキーマ未定義)')
}

console.log('完了。続けて `pnpm db:seed` を実行してください')
