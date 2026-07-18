import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from './schema'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Route Handlers から使う Drizzle クライアント。
// services/ からは import しないこと(純粋関数のみ。開発憲法 §5)
export const db = drizzle(pool, { schema })
