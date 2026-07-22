/*
 File: server/db.js
 Purpose: Server-side Node.js code for API, database, or app setup.
 Main exports: pool
 */

import mysql from 'mysql2/promise'
import { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } from './config.js'


// pool: Helper or component used in this file.
export const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
  ssl: DB_HOST !== '127.0.0.1' && DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : undefined,
})

// query: Helper or component used in this file.
export async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params)
  return rows
}