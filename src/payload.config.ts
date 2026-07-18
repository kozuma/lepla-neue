import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Payload はコンテンツ管理専用(開発憲法 §5)。
// 学習セッション・投票・進捗などの動的データは src/app/api/ の
// Route Handlers + Drizzle(src/db/schema.ts)が担当し、Payload を経由しない。
export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  routes: {
    // /api は Route Handlers(ビジネスロジック)の領域。Payload の REST は分離する
    api: '/payload-api',
  },
  collections: [Users, Media],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    // Payload 管理テーブルを専用スキーマに隔離し、
    // Drizzle 管理の public スキーマと衝突させない
    schemaName: 'payload',
  }),
  sharp,
  plugins: [],
})
