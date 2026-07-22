/*
 File: server/create_notifications_table.js
 Purpose: Server-side Node.js code for API, database, or app setup.
 Main exports: Exports or main definitions
 */

import { query, pool } from './db.js'


async function create() {
  try {
    await query(`CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64),
      type VARCHAR(64) NOT NULL,
      message TEXT NOT NULL,
      data JSON,
      is_read BOOLEAN NOT NULL DEFAULT FALSE,
      order_id VARCHAR(64),
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_notifications_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`)
    console.log('notifications table created')
  } catch (err) {
    console.error('failed to create notifications table', err)
  } finally {
    await pool.end()
  }
}

create()