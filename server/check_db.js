/*
 File: server/check_db.js
 Purpose: Server-side Node.js code for API, database, or app setup.
 Main exports: Exports or main definitions
 */

import mysql from 'mysql2/promise'


async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'home_bakers_marketplace',
  })

  // Check if delivery_settings table exists
  const [tables] = await conn.query('SHOW TABLES LIKE ?', ['delivery_settings'])
  if (tables.length === 0) {
    console.log('Creating missing delivery_settings table...')
    await conn.query(`
      CREATE TABLE delivery_settings (
        baker_id VARCHAR(64) PRIMARY KEY,
        min_order_value DECIMAL(10,2) DEFAULT 0,
        max_delivery_km DECIMAL(6,2) DEFAULT 0,
        delivery_fee_per_km DECIMAL(10,2) DEFAULT 0,
        base_delivery_fee DECIMAL(10,2) DEFAULT 0,
        CONSTRAINT fk_delivery_baker FOREIGN KEY (baker_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)
    console.log('✅ delivery_settings table created')
  } else {
    console.log('✅ delivery_settings table already exists')
  }

  // Show existing users
  const [users] = await conn.query('SELECT id, name, email, role, is_active FROM users')
  console.log('\nExisting users:')
  users.forEach(u => console.log(`  [${u.role}] ${u.name} (${u.email}) - active: ${u.is_active}`))

  await conn.end()
  console.log('\n✅ Database is ready!')
}

main().catch(err => console.error('Error:', err.message))