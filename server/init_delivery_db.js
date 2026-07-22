/*
 File: server/init_delivery_db.js
 Purpose: Initialize database schema modifications and seed data for the Delivery Partner Module.
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

  console.log('Altering users role ENUM to include delivery_partner...')
  try {
    // MySQL requires modifying the column to change ENUM values
    await conn.query(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('customer', 'baker', 'admin', 'delivery_partner') NOT NULL DEFAULT 'customer'
    `)
    console.log('✅ Altered users table role column')
  } catch (err) {
    console.warn('⚠️ Warning altering users table:', err.message)
  }

  console.log('Creating DeliveryPartners table...')
  await conn.query(`
    CREATE TABLE IF NOT EXISTS DeliveryPartners (
      id VARCHAR(64) PRIMARY KEY,
      vehicle_type ENUM('bike', 'scooter', 'car') NOT NULL,
      license_number VARCHAR(100) NOT NULL,
      availability_status ENUM('available', 'busy', 'offline') NOT NULL DEFAULT 'offline',
      rating DECIMAL(3,2) DEFAULT 5.00,
      total_deliveries_completed INT DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_delivery_partner_user FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)
  console.log('✅ DeliveryPartners table checked/created')

  console.log('Creating DeliveryAssignments table...')
  await conn.query(`
    CREATE TABLE IF NOT EXISTS DeliveryAssignments (
      id VARCHAR(64) PRIMARY KEY,
      order_id VARCHAR(64) NOT NULL,
      delivery_partner_id VARCHAR(64),
      assigned_by ENUM('admin', 'system') NOT NULL DEFAULT 'system',
      status ENUM('pending_assignment', 'assigned', 'picked_up', 'out_for_delivery', 'delivered', 'failed') NOT NULL DEFAULT 'pending_assignment',
      assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      picked_up_at DATETIME,
      delivered_at DATETIME,
      failed_at DATETIME,
      failure_reason VARCHAR(255),
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_assignment_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      CONSTRAINT fk_assignment_partner FOREIGN KEY (delivery_partner_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)
  console.log('✅ DeliveryAssignments table checked/created')

  console.log('Creating DeliveryStatusHistory table...')
  await conn.query(`
    CREATE TABLE IF NOT EXISTS DeliveryStatusHistory (
      id VARCHAR(64) PRIMARY KEY,
      delivery_assignment_id VARCHAR(64) NOT NULL,
      status ENUM('pending_assignment', 'assigned', 'picked_up', 'out_for_delivery', 'delivered', 'failed') NOT NULL,
      comments VARCHAR(255),
      updated_by VARCHAR(64) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_history_assignment FOREIGN KEY (delivery_assignment_id) REFERENCES DeliveryAssignments(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)
  console.log('✅ DeliveryStatusHistory table checked/created')

  console.log('Creating DeliveryRatings table...')
  await conn.query(`
    CREATE TABLE IF NOT EXISTS DeliveryRatings (
      id VARCHAR(64) PRIMARY KEY,
      order_id VARCHAR(64) NOT NULL,
      delivery_partner_id VARCHAR(64) NOT NULL,
      customer_id VARCHAR(64) NOT NULL,
      rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_rating_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      CONSTRAINT fk_rating_partner FOREIGN KEY (delivery_partner_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_rating_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)
  console.log('✅ DeliveryRatings table checked/created')

  // Check if we also need to adjust orders status ENUM
  console.log('Altering orders status ENUM to include ready_for_delivery and failed...')
  try {
    await conn.query(`
      ALTER TABLE orders 
      MODIFY COLUMN status ENUM('pending','confirmed','accepted','preparing','ready_for_delivery','out_for_delivery','delivered','cancelled','failed') NOT NULL DEFAULT 'pending'
    `)
    console.log('✅ Altered orders table status column')
  } catch (err) {
    console.warn('⚠️ Warning altering orders table:', err.message)
  }

  // Seed two delivery partners
  console.log('\nSeeding delivery partners...')
  const partners = [
    {
      id: 'user_driver_1',
      name: 'David Driver',
      email: 'david@example.com',
      password_hash: 'driver123',
      phone: '5555551111',
      address: 'Colombo Central Station',
      vehicle_type: 'bike',
      license_number: 'DL-12345',
    },
    {
      id: 'user_driver_2',
      name: 'Samantha Scooter',
      email: 'samantha@example.com',
      password_hash: 'driver123',
      phone: '5555552222',
      address: 'Dehiwala Junction',
      vehicle_type: 'scooter',
      license_number: 'DL-67890',
    }
  ]

  for (const dp of partners) {
    // Check if user exists
    const [existingUser] = await conn.query('SELECT id FROM users WHERE email = ?', [dp.email])
    if (existingUser.length > 0) {
      console.log(`User ${dp.email} already exists. Checking DeliveryPartners record...`)
      const userId = existingUser[0].id
      
      const [existingDP] = await conn.query('SELECT id FROM DeliveryPartners WHERE id = ?', [userId])
      if (existingDP.length === 0) {
        await conn.query(`
          INSERT INTO DeliveryPartners (id, vehicle_type, license_number, availability_status, rating, total_deliveries_completed)
          VALUES (?, ?, ?, 'available', 5.00, 0)
        `, [userId, dp.vehicle_type, dp.license_number])
        console.log(`✅ Added DeliveryPartner profile for existing user: ${dp.email}`)
      }
      continue
    }

    // Insert into users
    await conn.query(`
      INSERT INTO users (id, name, email, password_hash, role, phone, address, is_active, created_at)
      VALUES (?, ?, ?, ?, 'delivery_partner', ?, ?, 1, NOW())
    `, [dp.id, dp.name, dp.email, dp.password_hash, dp.phone, dp.address])

    // Insert into DeliveryPartners
    await conn.query(`
      INSERT INTO DeliveryPartners (id, vehicle_type, license_number, availability_status, rating, total_deliveries_completed)
      VALUES (?, ?, ?, 'available', 5.00, 0)
    `, [dp.id, dp.vehicle_type, dp.license_number])

    console.log(`✅ Seeded delivery partner: ${dp.name} (${dp.email})`)
  }

  await conn.end()
  console.log('\n✅ Database tables and seeding initialized successfully!')
}

main().catch(err => {
  console.error('❌ Error initializing database:', err)
  process.exit(1)
})
