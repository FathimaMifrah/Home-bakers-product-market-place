/*
 File: server/seed_users.js
 Purpose: Server-side Node.js code for API, database, or app setup.
 Main exports: Exports or main definitions
 */

import { query, pool } from './db.js';


async function seed() {
  try {
    console.log('Seeding users...');
    const users = [
      {
        id: 'user_admin_1',
        name: 'Admin User',
        email: 'admin@example.com',
        password_hash: 'admin123',
        role: 'admin',
        phone: '1234567890',
        address: 'Admin Office',
        bakery_name: null,
        specialties: null,
        is_active: 1,
        is_approved: 1,
      },
      {
        id: 'user_baker_1',
        name: 'Sarah the Baker',
        email: 'sarah@example.com',
        password_hash: 'baker123',
        role: 'baker',
        phone: '0987654321',
        address: '123 Sweet Street',
        bakery_name: 'Sarahs Sweets',
        specialties: JSON.stringify(['Cakes', 'Cookies']),
        is_active: 1,
        is_approved: 1, // Pre-approved
      },
      {
        id: 'user_baker_2',
        name: 'John Dough',
        email: 'john@example.com',
        password_hash: 'baker123',
        role: 'baker',
        phone: '5551112233',
        address: '456 Savory Avenue',
        bakery_name: 'The Dough House',
        specialties: JSON.stringify(['Bread', 'Pastries']),
        is_active: 1,
        is_approved: 1, // Pre-approved
      },
      {
        id: 'user_customer_1',
        name: 'Alice Customer',
        email: 'alice@example.com',
        password_hash: 'customer123',
        role: 'customer',
        phone: '5559998888',
        address: '789 Tasting Lane',
        bakery_name: null,
        specialties: null,
        is_active: 1,
        is_approved: null,
      },
      {
        id: 'user_customer_2',
        name: 'Bob Customer',
        email: 'bob@example.com',
        password_hash: 'customer123',
        role: 'customer',
        phone: '5557776666',
        address: '101 Buyer Blvd',
        bakery_name: null,
        specialties: null,
        is_active: 1,
        is_approved: null,
      }
    ];

    for (const u of users) {
      // Check if exists
      const exists = await query('SELECT id FROM users WHERE email = ?', [u.email]);
      if (exists.length > 0) {
        console.log(`User ${u.email} already exists, skipping.`);
        continue;
      }

      await query(
        `INSERT INTO users 
        (id, name, email, password_hash, role, phone, address, bakery_name, specialties, is_active, is_approved, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [u.id, u.name, u.email, u.password_hash, u.role, u.phone, u.address, u.bakery_name, u.specialties, u.is_active, u.is_approved]
      );
      console.log(`Added user: ${u.email} (${u.role})`);
    }

    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding users:', err);
  } finally {
    await pool.end();
  }
}

seed();