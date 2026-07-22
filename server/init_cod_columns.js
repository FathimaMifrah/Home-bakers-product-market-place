/*
 File: server/init_cod_columns.js
 Purpose: Add payment_method and payment_status columns to orders table.
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

  // 1. Check/Add payment_method column
  console.log('Checking orders table columns for payment_method...')
  const [methodCols] = await conn.query("SHOW COLUMNS FROM orders LIKE 'payment_method'")
  if (methodCols.length === 0) {
    console.log('Adding payment_method column to orders table...')
    await conn.query("ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) NOT NULL DEFAULT 'PayHere' AFTER distance_km")
    console.log('✅ Added payment_method column')
  } else {
    console.log('✅ payment_method column already exists')
  }

  // 2. Check/Add payment_status column
  console.log('Checking orders table columns for payment_status...')
  const [statusCols] = await conn.query("SHOW COLUMNS FROM orders LIKE 'payment_status'")
  if (statusCols.length === 0) {
    console.log('Adding payment_status column to orders table...')
    await conn.query("ALTER TABLE orders ADD COLUMN payment_status VARCHAR(50) NOT NULL DEFAULT 'Pending' AFTER payment_method")
    console.log('✅ Added payment_status column')
  } else {
    console.log('✅ payment_status column already exists')
  }

  await conn.end()
  console.log('✅ Payment columns check & migration complete.')
}

main().catch(err => {
  console.error('❌ Error during payment migration:', err)
  process.exit(1)
})
