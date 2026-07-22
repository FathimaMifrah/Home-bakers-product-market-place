/*
 File: server/update_coordinates.js
 Purpose: Server-side Node.js code for API, database, or app setup.
 Main exports: Exports or main definitions
 */

import { query, pool } from './db.js'


// SRI_LANKAN_LOCATIONS: Helper or component used in this file.
const SRI_LANKAN_LOCATIONS = {
  'colombo': { latitude: 6.9271, longitude: 80.7789 },
  'mount lavinia': { latitude: 6.8397, longitude: 80.7667 },
  'dehiwala': { latitude: 6.8653, longitude: 80.7714 },
  'ratmalana': { latitude: 6.8256, longitude: 80.7947 },
  'moratuwa': { latitude: 6.8097, longitude: 80.7899 },
  'kalutara': { latitude: 6.5854, longitude: 80.3506 },
  'negombo': { latitude: 7.2064, longitude: 79.8601 },
  'kandy': { latitude: 7.2906, longitude: 80.6337 },
  'galle': { latitude: 6.0535, longitude: 80.2147 },
  'matara': { latitude: 5.7489, longitude: 80.5380 },
}

// getCoordinatesFromAddress: Fetches data or reads values for the application.
const getCoordinatesFromAddress = (address) => {
  if (!address) return SRI_LANKAN_LOCATIONS['colombo']
  const normalized = address.toLowerCase().trim()
  for (const [location, coords] of Object.entries(SRI_LANKAN_LOCATIONS)) {
    if (normalized.includes(location)) {
      return coords
    }
  }
  return SRI_LANKAN_LOCATIONS['colombo']
}

async function run() {
  try {
    const users = await query('SELECT id, name, address FROM users')
    console.log(`Updating coordinates for ${users.length} users...`)
    for (const u of users) {
      const coords = getCoordinatesFromAddress(u.address)
      await query('UPDATE users SET latitude = ?, longitude = ? WHERE id = ?', [coords.latitude, coords.longitude, u.id])
      console.log(`Updated user ${u.name}: lat=${coords.latitude}, lon=${coords.longitude}`)
    }
    console.log('✅ Coordinate updates completed successfully!')
  } catch (err) {
    console.error('Error updating coordinates:', err)
  } finally {
    await pool.end()
  }
}

run()