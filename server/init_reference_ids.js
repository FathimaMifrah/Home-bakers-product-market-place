/*
 File: server/init_reference_ids.js
 Purpose: Add reference_id column to users table and backfill unique reference IDs for all existing users.
 */

import mysql from 'mysql2/promise'
import { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } from './config.js'

async function main() {
  console.log('Connecting to MySQL database...')
  const conn = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  })

  // 1. Check if reference_id column exists
  console.log('Checking users table columns...')
  const [columns] = await conn.query("SHOW COLUMNS FROM users LIKE 'reference_id'")
  if (columns.length === 0) {
    console.log('Adding reference_id column to users table...')
    await conn.query('ALTER TABLE users ADD COLUMN reference_id VARCHAR(32) UNIQUE AFTER id')
    console.log('✅ Added reference_id column')
  } else {
    console.log('✅ reference_id column already exists')
  }

  // 2. Fetch all users
  const [users] = await conn.query('SELECT id, role, reference_id FROM users ORDER BY created_at ASC, id ASC')
  console.log(`Found ${users.length} total users in database`)

  // Define prefixes
  const prefixes = {
    customer: 'CUS-',
    baker: 'BAK-',
    delivery_partner: 'DEL-',
    admin: 'ADM-'
  }

  // Counter per prefix to start numbering
  const counters = {
    customer: 1,
    baker: 1,
    delivery_partner: 1,
    admin: 1
  }

  // First, find max counters from already assigned reference_ids (in case script runs multiple times)
  for (const user of users) {
    if (user.reference_id) {
      const match = user.reference_id.match(/^([A-Z]+)-(\d+)$/)
      if (match) {
        const prefix = match[1]
        const num = parseInt(match[2], 10)
        const role = Object.keys(prefixes).find(k => prefixes[k] === prefix + '-')
        if (role && num >= counters[role]) {
          counters[role] = num + 1;
        }
      }
    }
  }

  console.log('Starting counters for new assignments:', counters)

  // 3. Backfill reference_id for users who don't have it
  let updatedCount = 0
  for (const user of users) {
    if (!user.reference_id) {
      const prefix = prefixes[user.role] || 'USR-'
      const roleKey = user.role in prefixes ? user.role : 'customer' // fallback
      
      const num = counters[roleKey]
      counters[roleKey]++
      
      // format with 3 digit padding
      const padNum = String(num).padStart(3, '0')
      const refId = `${prefix}${padNum}`

      console.log(`Assigning ${refId} to user ${user.id} (${user.role})`)
      await conn.query('UPDATE users SET reference_id = ? WHERE id = ?', [refId, user.id])
      updatedCount++
    }
  }

  await conn.end()
  console.log(`\n✅ Database migration completed. Updated ${updatedCount} users.`)
}

main().catch(err => {
  console.error('❌ Error initializing reference IDs:', err)
  process.exit(1)
})
