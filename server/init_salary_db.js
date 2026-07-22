/*
 File: server/init_salary_db.js
 Purpose: Initialize database schema modifications and seed data for the Delivery Partner Salary Management Module.
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

  console.log('Creating DeliverySalaries table...')
  await conn.query(`
    CREATE TABLE IF NOT EXISTS DeliverySalaries (
      id VARCHAR(64) PRIMARY KEY,
      delivery_partner_id VARCHAR(64) NOT NULL,
      month TINYINT NOT NULL,
      year INT NOT NULL,
      base_salary DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      bonus DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      deduction DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      final_salary DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      payment_status ENUM('pending', 'paid') NOT NULL DEFAULT 'pending',
      payment_date DATETIME,
      remarks TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_salary_partner FOREIGN KEY (delivery_partner_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_partner_month_year (delivery_partner_id, month, year)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)
  console.log('✅ DeliverySalaries table checked/created')

  await conn.end()
  console.log('\n✅ Database tables for Salary Management initialized successfully!')
}

main().catch(err => {
  console.error('❌ Error initializing database:', err)
  process.exit(1)
})
