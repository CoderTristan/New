// lib/db.ts
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

import {
  Ideas,
  Scripts,
  UserSettings,
  Reviews,
  UserProfiles,
  Subscriptions,
} from './schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required')
}

const sql = neon(process.env.DATABASE_URL)

export const db = drizzle(sql, {
  schema: {
    Ideas,
    Scripts,
    UserSettings,
    Reviews,
    UserProfiles,
    Subscriptions,
  },
})
