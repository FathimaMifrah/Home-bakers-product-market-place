/*
 File: server/index.js
 Purpose: Server-side Node.js code for API, database, or app setup.
 Main exports: Exports or main definitions
 */

import cors from 'cors'
import express from 'express'
import multer from 'multer'
import path from 'path'
import crypto from 'crypto'
import { APP_PORT } from './config.js'
import { fileURLToPath } from 'url'
import { pool, query } from './db.js'


// __filename: Helper or component used in this file.
const __filename = fileURLToPath(import.meta.url)
// __dirname: Helper or component used in this file.
const __dirname = path.dirname(__filename)

// app: Helper or component used in this file.
const app = express()
app.use(cors())
app.use(express.json())

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'))
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})
// upload: Helper or component used in this file.
const upload = multer({ storage })

// dateValue: Helper or component used in this file.
const dateValue = (value) => {
  if (value instanceof Date) return value.toISOString()
  return value ?? null
}

// parseJson: Helper or component used in this file.
const parseJson = (value) => {
  if (value == null) return undefined
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return undefined
    }
  }
  return value
}

// mapUser: Converts database rows into frontend objects.
const mapUser = (row) => ({
  id: row.id,
  referenceId: row.reference_id,
  name: row.name,
  email: row.email,
  role: row.role,
  phone: row.phone,
  address: row.address,
  avatar: row.avatar,
  isActive: Boolean(row.is_active),
  bakeryName: row.bakery_name,
  specialties: parseJson(row.specialties),
  latitude: row.latitude === null ? undefined : Number(row.latitude),
  longitude: row.longitude === null ? undefined : Number(row.longitude),
  rating: row.role === 'delivery_partner'
    ? (row.delivery_rating === null ? 5.00 : Number(row.delivery_rating))
    : (row.rating === null ? undefined : Number(row.rating)),
  totalOrders: row.total_orders === null ? undefined : row.total_orders,
  isApproved: row.is_approved === null ? undefined : Boolean(row.is_approved),
  createdAt: dateValue(row.created_at),
  vehicleType: row.vehicle_type || undefined,
  licenseNumber: row.license_number || undefined,
  availabilityStatus: row.availability_status || undefined,
  totalDeliveriesCompleted: row.total_deliveries_completed !== undefined ? row.total_deliveries_completed : undefined,
})

const generateRefIdForRole = async (role) => {
  const prefixes = {
    customer: 'CUS-',
    baker: 'BAK-',
    delivery_partner: 'DEL-',
    admin: 'ADM-'
  }
  const prefix = prefixes[role] || 'USR-'
  
  const [rows] = await pool.query(
    `SELECT reference_id FROM users 
     WHERE role = ? AND reference_id LIKE ? 
     ORDER BY CAST(SUBSTRING(reference_id, 5) AS UNSIGNED) DESC LIMIT 1`,
    [role, `${prefix}%`]
  )

  let nextNum = 1
  if (rows.length > 0 && rows[0].reference_id) {
    const match = rows[0].reference_id.match(/^([A-Z]+)-(\d+)$/)
    if (match) {
      nextNum = parseInt(match[2], 10) + 1
    }
  }

  const padNum = String(nextNum).padStart(3, '0')
  return `${prefix}${padNum}`
}


// mapProduct: Business logic helper or component for products/orders/reviews.
const mapProduct = (row) => ({
  id: row.id,
  bakerId: row.baker_id,
  name: row.name,
  description: row.description,
  price: Number(row.price),
  category: row.category,
  imageUrl: row.image_url,
  stock: row.stock,
  isAvailable: Boolean(row.is_available),
  rating: row.rating === null ? undefined : Number(row.rating),
  reviewCount: row.review_count,
  createdAt: dateValue(row.created_at),
})

// mapOrderItem: Business logic helper or component for products/orders/reviews.
const mapOrderItem = (row) => ({
  productId: row.product_id,
  name: row.name,
  price: Number(row.price),
  quantity: row.quantity,
})

// mapOrder: Business logic helper or component for products/orders/reviews.
const mapOrder = (row) => ({
  id: row.id,
  customerId: row.customer_id,
  customerName: row.customer_name,
  bakerId: row.baker_id,
  bakerName: row.baker_name,
  subtotal: Number(row.subtotal),
  deliveryFee: Number(row.delivery_fee),
  total: Number(row.total),
  status: row.status,
  deliveryAddress: row.delivery_address,
  distanceKm: row.distance_km === null ? 0 : Number(row.distance_km),
  paymentMethod: row.payment_method,
  payment_method: row.payment_method,
  paymentStatus: row.payment_status,
  payment_status: row.payment_status,
  createdAt: dateValue(row.created_at),
  updatedAt: dateValue(row.updated_at),
})

// mapReview: Business logic helper or component for products/orders/reviews.
const mapReview = (row) => ({
  id: row.id,
  orderId: row.order_id,
  productId: row.product_id,
  customerId: row.customer_id,
  customerName: row.customer_name,
  rating: row.rating,
  comment: row.comment,
  createdAt: dateValue(row.created_at),
})

// mapDeliveryAssignment: Converts DeliveryAssignments rows to camelCase frontend objects
const mapDeliveryAssignment = (row) => ({
  id: row.id,
  orderId: row.order_id,
  order_id: row.order_id,
  deliveryPartnerId: row.delivery_partner_id,
  delivery_partner_id: row.delivery_partner_id,
  assignedBy: row.assigned_by,
  status: row.status,
  assignedAt: dateValue(row.assigned_at),
  pickedUpAt: dateValue(row.picked_up_at),
  deliveredAt: dateValue(row.delivered_at),
  failedAt: dateValue(row.failed_at),
  failureReason: row.failure_reason,
  createdAt: dateValue(row.created_at),
  updatedAt: dateValue(row.updated_at),
  // Joined fields
  customerName: row.customer_name,
  bakerName: row.baker_name,
  bakeryName: row.bakery_name,
  deliveryAddress: row.delivery_address,
  total: row.total !== undefined && row.total !== null ? Number(row.total) : undefined,
  orderStatus: row.order_status,
  distanceKm: row.distance_km !== undefined && row.distance_km !== null ? Number(row.distance_km) : undefined,
  subtotal: row.subtotal !== undefined && row.subtotal !== null ? Number(row.subtotal) : undefined,
  deliveryFee: row.delivery_fee !== undefined && row.delivery_fee !== null ? Number(row.delivery_fee) : undefined,
  orderDate: dateValue(row.order_date),
  customerPhone: row.customer_phone,
  bakerPhone: row.baker_phone,
  partnerName: row.partner_name,
  partnerPhone: row.partner_phone,
})

const validateEmail = (email) => {
  const emailRegex = /^(?!\.)(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

const validatePhone = (phone) => {
  const phoneRegex = /^\d{10}$/
  return phoneRegex.test(phone)
}

app.get('/api/ping', (_req, res) => {
  res.json({ status: 'ok' })
})

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
  res.json({ url: imageUrl })
})

// ── DB connection health check ──────────────────────────────
app.get('/api/db-check', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok')
    res.json({ status: 'connected', result: rows })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message })
  }
})

// Mock Sri Lankan locations for geocoding
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
  if (!address) return null
  const normalized = address.toLowerCase().trim()
  for (const [location, coords] of Object.entries(SRI_LANKAN_LOCATIONS)) {
    if (normalized.includes(location)) {
      return coords
    }
  }
  return SRI_LANKAN_LOCATIONS['colombo']
}

// ── Register ────────────────────────────────────────────────
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, address, bakeryName, specialties, latitude, longitude, vehicleType, licenseNumber } = req.body

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required.' })
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' })
    }

    if (phone && !validatePhone(phone)) {
      return res.status(400).json({ error: 'Phone number must contain exactly 10 digits.' })
    }

    if (role === 'delivery_partner') {
      if (!vehicleType || !licenseNumber) {
        return res.status(400).json({ error: 'Vehicle type and license number are required for delivery partners.' })
      }
    }

    // Check for duplicate email
    const existingUser = await query('SELECT id FROM users WHERE email = ?', [email])
    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'This email is already registered.' })
    }

        const id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const referenceId = await generateRefIdForRole(role)
    const isApproved = role === 'baker' ? false : null
    const rating = role === 'baker' ? 0 : null
    const totalOrders = role === 'baker' ? 0 : null

    // Determine latitude/longitude
    let resolvedLatitude = latitude
    let resolvedLongitude = longitude
    if ((resolvedLatitude === undefined || resolvedLongitude === undefined) && address) {
      const coords = getCoordinatesFromAddress(address)
      if (coords) {
        resolvedLatitude = coords.latitude
        resolvedLongitude = coords.longitude
      }
    }

    // Build INSERT dynamically to avoid referencing columns that may not exist
    const insertCols = [
      'id', 'reference_id', 'name', 'email', 'password_hash', 'role', 'phone', 'address', 'bakery_name', 'specialties', 'is_active', 'is_approved', 'rating', 'total_orders', 'latitude', 'longitude'
    ]
    const insertPlaceholders = insertCols.map(() => '?').join(', ')
    const insertSql = `INSERT INTO users (${insertCols.join(', ')}) VALUES (${insertPlaceholders})`
    const insertParams = [
      id,
      referenceId,
      name,
      email,
      password, // NOTE: In production, hash with bcrypt
      role,
      phone || null,
      address || null,
      bakeryName || null,
      specialties ? JSON.stringify(specialties) : null,
      1, // is_active
      isApproved,
      rating,
      totalOrders,
      resolvedLatitude ?? null,
      resolvedLongitude ?? null,
    ]

    await query(insertSql, insertParams)

    // If baker, also create default delivery settings
    if (role === 'baker') {
      await query(
        `INSERT INTO delivery_settings (baker_id, min_order_value, max_delivery_km, delivery_fee_per_km, base_delivery_fee)
         VALUES (?, 500, 10, 50, 150)`,
        [id]
      )
    }

    // If delivery partner, create record in DeliveryPartners table
    if (role === 'delivery_partner') {
      await query(
        `INSERT INTO DeliveryPartners (id, vehicle_type, license_number, availability_status, rating, total_deliveries_completed)
         VALUES (?, ?, ?, 'available', 5.00, 0)`,
        [id, vehicleType, licenseNumber]
      )
    }

    // Return the created user (without password)
    const [created] = await query(
      `SELECT u.*, dp.vehicle_type, dp.license_number, dp.availability_status, dp.rating AS delivery_rating, dp.total_deliveries_completed
       FROM users u
       LEFT JOIN DeliveryPartners dp ON u.id = dp.id
       WHERE u.id = ?`,
      [id]
    )
    res.status(201).json(mapUser(created))
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Registration failed. ' + err.message })
  }
})

// ── Login ───────────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
  try {
    const { email, password, role } = req.body

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required.' })
    }

    const rows = await query(
      `SELECT u.*, dp.vehicle_type, dp.license_number, dp.availability_status, dp.rating AS delivery_rating, dp.total_deliveries_completed
       FROM users u
       LEFT JOIN DeliveryPartners dp ON u.id = dp.id
       WHERE u.email = ? AND u.password_hash = ? AND u.role = ? AND u.is_active = TRUE`,
      [email, password, role]
    )

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials or account not active.' })
    }

    const user = rows[0]
    if (user.role === 'baker' && user.is_approved === 0) {
      return res.status(403).json({ error: 'Baker account not yet approved.' })
    }

    res.json(mapUser(user))
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Login failed. ' + err.message })
  }
})

app.get('/api/users', async (_req, res) => {
  const rows = await query(
    `SELECT u.*, dp.vehicle_type, dp.license_number, dp.availability_status, dp.rating AS delivery_rating, dp.total_deliveries_completed
     FROM users u
     LEFT JOIN DeliveryPartners dp ON u.id = dp.id`
  )
  res.json(rows.map(mapUser))
})

app.get('/api/users/:id', async (req, res) => {
  const rows = await query(
    `SELECT u.*, dp.vehicle_type, dp.license_number, dp.availability_status, dp.rating AS delivery_rating, dp.total_deliveries_completed
     FROM users u
     LEFT JOIN DeliveryPartners dp ON u.id = dp.id
     WHERE u.id = ?`,
    [req.params.id]
  )
  if (!rows.length) return res.status(404).json({ error: 'User not found' })
  res.json(mapUser(rows[0]))
})

app.patch('/api/users/:id', async (req, res) => {
  const conn = await pool.getConnection()
  try {
    const updates = req.body
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No updates provided' })
    
    if (updates.email && !validateEmail(updates.email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' })
    }

    if (updates.phone && updates.phone !== '' && !validatePhone(updates.phone)) {
      return res.status(400).json({ error: 'Phone number must contain exactly 10 digits.' })
    }

    await conn.beginTransaction()

    const userFields = []
    const userParams = []
    const partnerFields = []
    const partnerParams = []

    for (const [key, value] of Object.entries(updates)) {
      if (key === 'isActive') {
        userFields.push('is_active = ?')
        userParams.push(value ? 1 : 0)
        // If deactivating a delivery partner, set availability status to offline
        if (!value) {
          partnerFields.push('availability_status = ?')
          partnerParams.push('offline')
        }
      } else if (key === 'isApproved') {
        userFields.push('is_approved = ?')
        userParams.push(value === null ? null : (value ? 1 : 0))
      } else if (key === 'name') {
        userFields.push('name = ?')
        userParams.push(value)
      } else if (key === 'phone') {
        userFields.push('phone = ?')
        userParams.push(value || null)
      } else if (key === 'address') {
        userFields.push('address = ?')
        userParams.push(value || null)
      } else if (key === 'vehicleType') {
        partnerFields.push('vehicle_type = ?')
        partnerParams.push(value)
      } else if (key === 'licenseNumber') {
        partnerFields.push('license_number = ?')
        partnerParams.push(value)
      } else if (key === 'availabilityStatus') {
        partnerFields.push('availability_status = ?')
        partnerParams.push(value)
      }
    }

    if (userFields.length > 0) {
      userParams.push(req.params.id)
      await conn.query(`UPDATE users SET ${userFields.join(', ')} WHERE id = ?`, userParams)
    }

    if (partnerFields.length > 0) {
      partnerParams.push(req.params.id)
      await conn.query(`UPDATE DeliveryPartners SET ${partnerFields.join(', ')} WHERE id = ?`, partnerParams)
    }

    await conn.commit()
    
    const [rows] = await conn.query(
      `SELECT u.*, dp.vehicle_type, dp.license_number, dp.availability_status, dp.rating AS delivery_rating, dp.total_deliveries_completed
       FROM users u
       LEFT JOIN DeliveryPartners dp ON u.id = dp.id
       WHERE u.id = ?`,
      [req.params.id]
    )
    
    if (!rows.length) return res.status(404).json({ error: 'User not found' })
    res.json(mapUser(rows[0]))
  } catch (err) {
    await conn.rollback()
    console.error('Update user error:', err)
    res.status(500).json({ error: 'Update failed. ' + err.message })
  } finally {
    conn.release()
  }
})

app.get('/api/products', async (req, res) => {
  const { bakerId, category } = req.query
  let sql = 'SELECT * FROM products'
  const params = []
  const filters = []
  if (bakerId) {
    filters.push('baker_id = ?')
    params.push(bakerId)
  }
  if (category) {
    filters.push('category = ?')
    params.push(category)
  }
  if (filters.length) sql += ' WHERE ' + filters.join(' AND ')
  const rows = await query(sql, params)
  res.json(rows.map(mapProduct))
})

app.get('/api/products/:id', async (req, res) => {
  const rows = await query('SELECT * FROM products WHERE id = ?', [req.params.id])
  if (!rows.length) return res.status(404).json({ error: 'Product not found' })
  res.json(mapProduct(rows[0]))
})

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await query('SELECT * FROM orders')
    const orderItems = await query('SELECT * FROM order_items')

    const itemsByOrderId = {}
    for (const item of orderItems) {
      if (!itemsByOrderId[item.order_id]) {
        itemsByOrderId[item.order_id] = []
      }
      itemsByOrderId[item.order_id].push(mapOrderItem(item))
    }

    const mappedOrders = orders.map(row => ({
      ...mapOrder(row),
      items: itemsByOrderId[row.id] || []
    }))

    res.json(mappedOrders)
  } catch (err) {
    console.error('Fetch orders error:', err)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

app.get('/api/orders/:id', async (req, res) => {
  const rows = await query('SELECT * FROM orders WHERE id = ?', [req.params.id])
  if (!rows.length) return res.status(404).json({ error: 'Order not found' })
  const items = await query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id])
  res.json({ ...mapOrder(rows[0]), items: items.map(mapOrderItem) })
})

app.get('/api/reviews', async (req, res) => {
  const { productId, customerId } = req.query
  let sql = 'SELECT * FROM reviews'
  const params = []
  const filters = []
  if (productId) {
    filters.push('product_id = ?')
    params.push(productId)
  }
  if (customerId) {
    filters.push('customer_id = ?')
    params.push(customerId)
  }
  if (filters.length) sql += ' WHERE ' + filters.join(' AND ')
  const rows = await query(sql, params)
  res.json(rows.map(mapReview))
})

app.get('/api/reviews/:id', async (req, res) => {
  const rows = await query('SELECT * FROM reviews WHERE id = ?', [req.params.id])
  if (!rows.length) return res.status(404).json({ error: 'Review not found' })
  res.json(mapReview(rows[0]))
})

app.get('/api/delivery-settings', async (req, res) => {
  const rows = await query('SELECT * FROM delivery_settings')
  res.json(rows.map((row) => ({
    bakerId: row.baker_id,
    minOrderValue: Number(row.min_order_value),
    maxDeliveryKm: Number(row.max_delivery_km),
    deliveryFeePerKm: Number(row.delivery_fee_per_km),
    baseDeliveryFee: Number(row.base_delivery_fee),
  })))
})

app.get('/api/delivery-settings/:bakerId', async (req, res) => {
  const rows = await query('SELECT * FROM delivery_settings WHERE baker_id = ?', [req.params.bakerId])
  if (!rows.length) return res.status(404).json({ error: 'Delivery settings not found' })
  const row = rows[0]
  res.json({
    bakerId: row.baker_id,
    minOrderValue: Number(row.min_order_value),
    maxDeliveryKm: Number(row.max_delivery_km),
    deliveryFeePerKm: Number(row.delivery_fee_per_km),
    baseDeliveryFee: Number(row.base_delivery_fee),
  })
})

// Haversine formula to calculate distance between two coordinates (in km)
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Calculate distance between baker and customer
app.post('/api/calculate-distance', async (req, res) => {
  try {
    const { bakerId, customerLatitude, customerLongitude } = req.body

    if (!bakerId || customerLatitude === undefined || customerLongitude === undefined) {
      return res.status(400).json({ error: 'Baker ID, customer latitude and longitude are required.' })
    }

    const rows = await query('SELECT latitude, longitude FROM users WHERE id = ?', [bakerId])
    if (!rows.length || rows[0].latitude === null || rows[0].longitude === null) {
      return res.status(400).json({ error: 'Baker location not found. Ensure baker has set their location.' })
    }

    const bakerLat = Number(rows[0].latitude)
    const bakerLon = Number(rows[0].longitude)
    const distance = calculateHaversineDistance(bakerLat, bakerLon, customerLatitude, customerLongitude)

    res.json({ distance: Math.round(distance * 100) / 100 }) // Round to 2 decimal places
  } catch (err) {
    console.error('Calculate distance error:', err)
    res.status(500).json({ error: 'Failed to calculate distance: ' + err.message })
  }
})

// VALID_CATEGORIES: Helper or component used in this file.
const VALID_CATEGORIES = ['sweet', 'savory', 'cakes', 'seasonal']

async function assertBakerExists(bakerId) {
  const rows = await query(
    'SELECT id FROM users WHERE id = ? AND role = ? AND is_active = TRUE',
    [bakerId, 'baker'],
  )
  return rows.length > 0
}

// ── Product CRUD ──────────────────────────────────────────
app.post('/api/products', async (req, res) => {
  try {
    const { bakerId, name, description, price, category, imageUrl, stock, isAvailable } = req.body

    if (!bakerId || !name?.trim()) {
      return res.status(400).json({ error: 'Baker and product name are required.' })
    }
    if (!(await assertBakerExists(bakerId))) {
      return res.status(400).json({ error: 'Invalid baker. Select a registered baker account.' })
    }
    const numPrice = Number(price)
    if (!Number.isFinite(numPrice) || numPrice < 0) {
      return res.status(400).json({ error: 'Valid price is required.' })
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid category.' })
    }

    const id = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const numStock = Math.max(0, parseInt(stock, 10) || 0)
    const available = isAvailable !== false && numStock > 0 ? 1 : 0

    await query(
      `INSERT INTO products (id, baker_id, name, description, price, category, image_url, stock, is_available)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, bakerId, name.trim(), description || null, numPrice, category, imageUrl || null, numStock, available]
    )

    const rows = await query('SELECT * FROM products WHERE id = ?', [id])
    if (!rows.length) return res.status(500).json({ error: 'Product created but could not be loaded.' })
    res.status(201).json(mapProduct(rows[0]))
  } catch (err) {
    console.error('Create product error:', err)
    res.status(500).json({ error: 'Failed to create product: ' + err.message })
  }
})

app.put('/api/products/:id', async (req, res) => {
  try {
    const updates = req.body
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No updates provided' })
    
    const fieldMap = {
      name: 'name',
      description: 'description',
      price: 'price',
      category: 'category',
      imageUrl: 'image_url',
      stock: 'stock',
      isAvailable: 'is_available',
      bakerId: 'baker_id',
    }

    const setClause = []
    const params = []

    for (const [k, v] of Object.entries(updates)) {
      const col = fieldMap[k]
      if (!col) continue
      if (k === 'bakerId') {
        if (!(await assertBakerExists(v))) {
          return res.status(400).json({ error: 'Invalid baker selected.' })
        }
        setClause.push('baker_id = ?')
        params.push(v)
      } else if (k === 'isAvailable') {
        setClause.push('is_available = ?')
        params.push(v ? 1 : 0)
      } else if (k === 'price') {
        const numPrice = Number(v)
        if (!Number.isFinite(numPrice) || numPrice < 0) {
          return res.status(400).json({ error: 'Valid price is required.' })
        }
        setClause.push('price = ?')
        params.push(numPrice)
      } else if (k === 'stock') {
        setClause.push('stock = ?')
        params.push(Math.max(0, parseInt(v, 10) || 0))
      } else if (k === 'category') {
        if (!VALID_CATEGORIES.includes(v)) {
          return res.status(400).json({ error: 'Invalid category.' })
        }
        setClause.push('category = ?')
        params.push(v)
      } else if (k === 'name') {
        setClause.push('name = ?')
        params.push(String(v).trim())
      } else {
        setClause.push(`${col} = ?`)
        params.push(v ?? null)
      }
    }

    if (setClause.length === 0) return res.status(400).json({ error: 'No valid fields to update' })
    params.push(req.params.id)

    await query(`UPDATE products SET ${setClause.join(', ')} WHERE id = ?`, params)
    const rows = await query('SELECT * FROM products WHERE id = ?', [req.params.id])
    if (!rows.length) return res.status(404).json({ error: 'Product not found' })
    res.json(mapProduct(rows[0]))
  } catch (err) {
    console.error('Update product error:', err)
    res.status(500).json({ error: 'Failed to update product: ' + err.message })
  }
})

app.delete('/api/products/:id', async (req, res) => {
  try {
    await query('DELETE FROM products WHERE id = ?', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

app.patch('/api/products/:id/stock', async (req, res) => {
  try {
    const { quantityChange } = req.body
    await query(
      `UPDATE products SET stock = GREATEST(0, stock + ?), is_available = CASE WHEN stock + ? > 0 THEN 1 ELSE 0 END WHERE id = ?`,
      [quantityChange, quantityChange, req.params.id]
    )
    const rows = await query('SELECT * FROM products WHERE id = ?', [req.params.id])
    if (!rows.length) return res.status(404).json({ error: 'Product not found' })
    res.json(mapProduct(rows[0]))
  } catch (err) {
    res.status(500).json({ error: 'Failed to update stock' })
  }
})

// ── Order CRUD ────────────────────────────────────────────
app.post('/api/orders', async (req, res) => {
  const conn = await pool.getConnection()
  try {
    const { customerId, customerName, bakerId, bakerName, subtotal, deliveryFee, total, deliveryAddress, distanceKm, items, paymentMethod, paymentStatus } = req.body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items provided' })
    }

    // Validate baker exists
    if (bakerId && !(await assertBakerExists(bakerId))) {
      return res.status(400).json({ error: 'Invalid baker selected' })
    }

    await conn.beginTransaction()

    // Validate product stock and reserve (SELECT FOR UPDATE)
    for (const it of items) {
      const pRows = await conn.query('SELECT id, stock FROM products WHERE id = ? FOR UPDATE', [it.productId])
      const prow = (pRows[0] && pRows[0][0]) || null
      if (!prow) {
        await conn.rollback()
        return res.status(400).json({ error: `Product not found: ${it.productId}` })
      }
      const stock = Number(prow.stock || 0)
      if (stock < it.quantity) {
        await conn.rollback()
        return res.status(400).json({ error: `Insufficient stock for product ${it.name}` })
      }
    }

    // Validate delivery settings: min order value & max distance
    if (bakerId) {
      const dsRows = await conn.query('SELECT * FROM delivery_settings WHERE baker_id = ?', [bakerId])
      const ds = (dsRows[0] && dsRows[0][0]) || null
      if (ds) {
        const minOrder = Number(ds.min_order_value || 0)
        const maxKm = Number(ds.max_delivery_km || 0)
        if (subtotal < minOrder) {
          await conn.rollback()
          return res.status(400).json({ error: `Baker requires a minimum order value of ${minOrder}` })
        }
        if (distanceKm !== undefined && maxKm > 0 && Number(distanceKm) > maxKm) {
          await conn.rollback()
          return res.status(400).json({ error: `Delivery distance exceeds baker's maximum of ${maxKm} km` })
        }
      }
    }

    const id = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    await conn.query(
      `INSERT INTO orders (id, customer_id, customer_name, baker_id, baker_name, subtotal, delivery_fee, total, status, delivery_address, distance_km, payment_method, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)`,
      [id, customerId || null, customerName, bakerId || null, bakerName, subtotal, deliveryFee, total, deliveryAddress, distanceKm || 0, paymentMethod || 'PayHere', paymentStatus || 'Pending']
    )

    // Insert order items and decrement stock
    for (const item of items) {
      const itemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      await conn.query(
        `INSERT INTO order_items (id, order_id, product_id, name, price, quantity) VALUES (?, ?, ?, ?, ?, ?)`,
        [itemId, id, item.productId || null, item.name, item.price, item.quantity]
      )

      await conn.query(
        `UPDATE products SET stock = GREATEST(0, stock - ?), is_available = CASE WHEN GREATEST(0, stock - ?) > 0 THEN 1 ELSE 0 END WHERE id = ?`,
        [item.quantity, item.quantity, item.productId]
      )
    }

    // Create notifications for baker and customer
    const noteId1 = `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    if (bakerId) {
      await conn.query(
        `INSERT INTO notifications (id, user_id, type, message, order_id) VALUES (?, ?, 'order_created', ? , ?)`,
        [noteId1, bakerId, `New order received: ${id}`, id]
      )
    }
    if (customerId) {
      const noteId2 = `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
      await conn.query(
        `INSERT INTO notifications (id, user_id, type, message, order_id) VALUES (?, ?, 'order_created', ? , ?)`,
        [noteId2, customerId, `Order placed: ${id}`, id]
      )
    }

    await conn.commit()

    const rows = await query('SELECT * FROM orders WHERE id = ?', [id])
    res.status(201).json(mapOrder(rows[0]))
  } catch (err) {
    try { await conn.rollback() } catch {};
    console.error('Create order error:', err)
    res.status(500).json({ error: 'Failed to create order' })
  } finally {
    conn.release()
  }
})

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    const rows = await query('SELECT * FROM orders WHERE id = ?', [req.params.id])
    if (!rows.length) return res.status(404).json({ error: 'Order not found' })
    const current = rows[0]

    // Prevent cancelling non-pending orders by customers
    if (status === 'cancelled' && current.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending orders can be cancelled' })
    }

    await query('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', [status, req.params.id])

    // Create notifications for customer and baker about status change
    const updated = await query('SELECT * FROM orders WHERE id = ?', [req.params.id])
    const order = updated[0]
    if (order.baker_id) {
      const noteId = `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
      await query('INSERT INTO notifications (id, user_id, type, message, order_id) VALUES (?, ?, ?, ?, ?)', [noteId, order.baker_id, 'order_status', `Order ${order.id} status updated to ${status}`, order.id])
    }
    if (order.customer_id) {
      const noteId2 = `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
      await query('INSERT INTO notifications (id, user_id, type, message, order_id) VALUES (?, ?, ?, ?, ?)', [noteId2, order.customer_id, 'order_status', `Your order ${order.id} is now ${status}`, order.id])
    }

    // TRIGGER FOR DELIVERY ASSIGNMENT
    if (status === 'ready_for_delivery' && current.status !== 'ready_for_delivery') {
      const conn = await pool.getConnection()
      try {
        await conn.beginTransaction()

        // Check if an assignment already exists for this order
        const [existing] = await conn.query('SELECT * FROM DeliveryAssignments WHERE order_id = ?', [req.params.id])
        if (existing.length === 0) {
          const assignmentId = `asm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
          
          // Find available delivery partners
          const [availablePartners] = await conn.query(`
            SELECT dp.id, dp.rating,
              (SELECT COUNT(*) FROM DeliveryAssignments da WHERE da.delivery_partner_id = dp.id AND da.status IN ('assigned', 'picked_up', 'out_for_delivery')) AS active_load
            FROM DeliveryPartners dp
            JOIN users u ON dp.id = u.id
            WHERE dp.availability_status = 'available' AND u.is_active = TRUE
          `)

          if (availablePartners.length > 0) {
            // Sort by active_load asc, rating desc
            availablePartners.sort((a, b) => {
              if (a.active_load !== b.active_load) {
                return a.active_load - b.active_load
              }
              return b.rating - a.rating
            })

            const assignedPartner = availablePartners[0]
            const assignedPartnerId = assignedPartner.id

            // Insert assignment as assigned
            await conn.query(
              'INSERT INTO DeliveryAssignments (id, order_id, delivery_partner_id, assigned_by, status) VALUES (?, ?, ?, "system", "assigned")',
              [assignmentId, req.params.id, assignedPartnerId]
            )

            // Update partner status to busy
            await conn.query(
              "UPDATE DeliveryPartners SET availability_status = 'busy' WHERE id = ?",
              [assignedPartnerId]
            )

            // Log status history
            const historyId = `hst_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
            await conn.query(
              'INSERT INTO DeliveryStatusHistory (id, delivery_assignment_id, status, comments, updated_by) VALUES (?, ?, "assigned", "Assigned automatically by system", "system")',
              [historyId, assignmentId]
            )

            // Send notification to assigned partner
            const notePartnerId = `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
            await conn.query(
              'INSERT INTO notifications (id, user_id, type, message, order_id) VALUES (?, ?, "delivery_assigned", ?, ?)',
              [notePartnerId, assignedPartnerId, `New delivery assigned: Order #${req.params.id.slice(-6)}`, req.params.id]
            )
            
            // Send notification to customer
            if (order.customer_id) {
              const noteCustId = `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
              await conn.query(
                'INSERT INTO notifications (id, user_id, type, message, order_id) VALUES (?, ?, "delivery_status", ?, ?)',
                [noteCustId, order.customer_id, `Delivery partner assigned for your Order #${req.params.id.slice(-6)}.`, req.params.id]
              )
            }
          } else {
            // Insert assignment as pending_assignment
            await conn.query(
              'INSERT INTO DeliveryAssignments (id, order_id, delivery_partner_id, assigned_by, status) VALUES (?, ?, NULL, "system", "pending_assignment")',
              [assignmentId, req.params.id]
            )

            // Log status history
            const historyId = `hst_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
            await conn.query(
              'INSERT INTO DeliveryStatusHistory (id, delivery_assignment_id, status, comments, updated_by) VALUES (?, ?, "pending_assignment", "Waiting for manual assignment (no partners available)", "system")',
              [historyId, assignmentId]
            )

            // Notify admin
            const [admins] = await conn.query('SELECT id FROM users WHERE role = "admin"')
            for (const admin of admins) {
              const noteAdminId = `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
              await conn.query(
                'INSERT INTO notifications (id, user_id, type, message, order_id) VALUES (?, ?, "delivery_pending", ?, ?)',
                [noteAdminId, admin.id, `Order #${req.params.id.slice(-6)} is ready for delivery but no delivery partners are available.`, req.params.id]
              )
            }
          }
        }
        await conn.commit()
      } catch (err) {
        await conn.rollback()
        console.error('Error during auto-assignment:', err)
      } finally {
        conn.release()
      }
    }

    res.json(mapOrder(order))
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' })
  }
})

// Generate PayHere MD5 checkout signature
app.post('/api/payment/hash', (req, res) => {
  try {
    const { orderId, amount } = req.body
    if (!orderId || !amount) {
      return res.status(400).json({ error: 'Order ID and amount are required.' })
    }

    const merchantId = process.env.PAYHERE_MERCHANT_ID || '1236698'
    const merchantSecret = process.env.PAYHERE_SECRET || 'MzU3MzM3NTUwNzcwNDc2MTIzNTMzMTMwNzY2OTYzODM2MzA2MDk2'
    const currency = 'LKR'

    console.log('[PayHere] Using Merchant ID:', merchantId)
    console.log('[PayHere] Merchant Secret loaded:', merchantSecret ? 'YES (length: ' + merchantSecret.length + ')' : 'NO')

    const amountFormatted = Number(amount).toFixed(2)
    const secretHash = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase()
    const hash = crypto
      .createHash('md5')
      .update(merchantId + orderId + amountFormatted + currency + secretHash)
      .digest('hex')
      .toUpperCase()

    console.log('[PayHere] Hash generated for order:', orderId, 'amount:', amountFormatted)

    res.json({ hash, merchantId })
  } catch (err) {
    console.error('Failed to generate PayHere hash:', err)
    res.status(500).json({ error: 'Failed to generate payment signature' })
  }
})

// Confirm payment locally (direct update for frontend during local testing)
app.post('/api/orders/:id/confirm-payment', async (req, res) => {
  try {
    const { id } = req.params
    const rows = await query('SELECT * FROM orders WHERE id = ?', [id])
    if (!rows.length) {
      return res.status(404).json({ error: 'Order not found' })
    }
    const order = rows[0]
    if (order.status !== 'pending') {
      return res.json({ success: true, message: 'Order already processed', status: order.status })
    }

    await query('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', ['confirmed', id])

    // Create notifications for customer and baker
    if (order.baker_id) {
      const noteId = `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
      await query('INSERT INTO notifications (id, user_id, type, message, order_id) VALUES (?, ?, ?, ?, ?)', [noteId, order.baker_id, 'order_status', `Order ${order.id} status updated to confirmed (Paid)`, order.id])
    }
    if (order.customer_id) {
      const noteId2 = `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
      await query('INSERT INTO notifications (id, user_id, type, message, order_id) VALUES (?, ?, ?, ?, ?)', [noteId2, order.customer_id, 'order_status', `Your payment was successful! Your order is now confirmed.`, order.id])
    }

    res.json({ success: true, message: 'Order payment confirmed' })
  } catch (err) {
    console.error('Confirm payment error:', err)
    res.status(500).json({ error: 'Failed to confirm payment' })
  }
})

// PayHere Instant Payment Notification (IPN) webhook
app.post('/api/payment/notify', async (req, res) => {
  try {
    const {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig
    } = req.body

    const merchantSecret = process.env.PAYHERE_SECRET || '4ZGhP2SHfSE48d3l70vBh44Uob3fb0Qy18LN6JGWNGC2'

    // Verify MD5 signature
    const localSig = crypto
      .createHash('md5')
      .update(merchant_id + order_id + payhere_amount + payhere_currency + status_code + crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase())
      .digest('hex')
      .toUpperCase()

    if (localSig !== md5sig) {
      console.warn('Invalid PayHere IPN signature received')
      return res.status(400).send('Invalid signature')
    }

    // Status 2 means success
    if (status_code === '2') {
      const rows = await query('SELECT * FROM orders WHERE id = ?', [order_id])
      if (rows.length > 0) {
        const order = rows[0]
        if (order.status === 'pending') {
          await query('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', ['confirmed', order_id])

          // Create notifications for customer and baker
          if (order.baker_id) {
            const noteId = `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
            await query('INSERT INTO notifications (id, user_id, type, message, order_id) VALUES (?, ?, ?, ?, ?)', [noteId, order.baker_id, 'order_status', `Order ${order.id} status updated to confirmed (Paid via PayHere)`, order.id])
          }
          if (order.customer_id) {
            const noteId2 = `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
            await query('INSERT INTO notifications (id, user_id, type, message, order_id) VALUES (?, ?, ?, ?, ?)', [noteId2, order.customer_id, 'order_status', `Your payment of Rs. ${payhere_amount} was processed! Your order is now confirmed.`, order.id])
          }
        }
      }
    }

    res.send('OK')
  } catch (err) {
    console.error('IPN processing error:', err)
    res.status(500).send('Internal server error')
  }
})


// Notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const { userId } = req.query
    let sql = 'SELECT * FROM notifications'
    const params = []
    if (userId) {
      sql += ' WHERE user_id = ?'
      params.push(userId)
    }
    sql += ' ORDER BY created_at DESC'
    const rows = await query(sql, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' })
  }
})

// ── Review CRUD ───────────────────────────────────────────
app.post('/api/reviews', async (req, res) => {
  try {
    const { orderId, productId, customerId, customerName, rating, comment } = req.body
    const id = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    
    await query(
      `INSERT INTO reviews (id, order_id, product_id, customer_id, customer_name, rating, comment)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, orderId || null, productId, customerId, customerName || null, rating, comment || null]
    )
    
    // Update product rating and review count
    await query(
      `UPDATE products 
       SET rating = (SELECT AVG(rating) FROM reviews WHERE product_id = ?),
           review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = ?)
       WHERE id = ?`,
      [productId, productId, productId]
    )
    
    const rows = await query('SELECT * FROM reviews WHERE id = ?', [id])
    res.status(201).json(mapReview(rows[0]))
  } catch (err) {
    res.status(500).json({ error: 'Failed to create review' })
  }
})

// ── Delivery Settings CRUD ────────────────────────────────
app.put('/api/delivery-settings/:bakerId', async (req, res) => {
  try {
    const { minOrderValue, maxDeliveryKm, deliveryFeePerKm, baseDeliveryFee } = req.body
    
    // Check if delivery settings already exist
    const existingSettings = await query('SELECT baker_id FROM delivery_settings WHERE baker_id = ?', [req.params.bakerId])

    if (existingSettings.length) {
      await query(
        `UPDATE delivery_settings SET min_order_value = ?, max_delivery_km = ?, delivery_fee_per_km = ?, base_delivery_fee = ? WHERE baker_id = ?`,
        [minOrderValue, maxDeliveryKm, deliveryFeePerKm, baseDeliveryFee, req.params.bakerId]
      )
    } else {
      await query(
        `INSERT INTO delivery_settings (baker_id, min_order_value, max_delivery_km, delivery_fee_per_km, base_delivery_fee) VALUES (?, ?, ?, ?, ?)`,
        [req.params.bakerId, minOrderValue, maxDeliveryKm, deliveryFeePerKm, baseDeliveryFee]
      )
    }
    
    const rows = await query('SELECT * FROM delivery_settings WHERE baker_id = ?', [req.params.bakerId])
    if (!rows.length) return res.status(404).json({ error: 'Delivery settings not found' })
    const row = rows[0]
    res.json({
      bakerId: row.baker_id,
      minOrderValue: Number(row.min_order_value),
      maxDeliveryKm: Number(row.max_delivery_km),
      deliveryFeePerKm: Number(row.delivery_fee_per_km),
      baseDeliveryFee: Number(row.base_delivery_fee),
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update delivery settings' })
  }
})

// ── DELIVERY PARTNER ENDPOINTS ──────────────────────────────────

// Get all delivery partners (with vehicle/rating details)
app.get('/api/delivery-partners', async (_req, res) => {
  try {
    const rows = await query(`
      SELECT u.*, dp.vehicle_type, dp.license_number, dp.availability_status, dp.rating AS delivery_rating, dp.total_deliveries_completed
      FROM users u
      JOIN DeliveryPartners dp ON u.id = dp.id
    `)
    res.json(rows.map(mapUser))
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch delivery partners: ' + err.message })
  }
})

// Admin create a delivery partner
app.post('/api/delivery-partners', async (req, res) => {
  const conn = await pool.getConnection()
  try {
    const { name, email, password, phone, address, vehicleType, licenseNumber } = req.body
    if (!name || !email || !password || !vehicleType || !licenseNumber) {
      return res.status(400).json({ error: 'Name, email, password, vehicle type, and license number are required.' })
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' })
    }

    if (phone && !validatePhone(phone)) {
      return res.status(400).json({ error: 'Phone number must contain exactly 10 digits.' })
    }

    await conn.beginTransaction()

    // Duplicate check
    const [existing] = await conn.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length > 0) {
      await conn.rollback()
      return res.status(409).json({ error: 'This email is already registered.' })
    }

    const id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const referenceId = await generateRefIdForRole('delivery_partner')
    
    // Insert into users
    await conn.query(`
      INSERT INTO users (id, reference_id, name, email, password_hash, role, phone, address, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, 'delivery_partner', ?, ?, 1, NOW())
    `, [id, referenceId, name, email, password, phone || null, address || null])

    // Insert into DeliveryPartners
    await conn.query(`
      INSERT INTO DeliveryPartners (id, vehicle_type, license_number, availability_status, rating, total_deliveries_completed)
      VALUES (?, ?, ?, 'available', 5.00, 0)
    `, [id, vehicleType, licenseNumber])

    await conn.commit()

    const [created] = await conn.query(
      `SELECT u.*, dp.vehicle_type, dp.license_number, dp.availability_status, dp.rating AS delivery_rating, dp.total_deliveries_completed
       FROM users u
       LEFT JOIN DeliveryPartners dp ON u.id = dp.id
       WHERE u.id = ?`,
      [id]
    )

    res.status(201).json(mapUser(created[0]))
  } catch (err) {
    await conn.rollback()
    console.error('Create delivery partner error:', err)
    res.status(500).json({ error: 'Failed to create delivery partner: ' + err.message })
  } finally {
    conn.release()
  }
})

// Update delivery partner profile
app.put('/api/delivery-partners/:id', async (req, res) => {
  try {
    const { name, phone, address, vehicleType, licenseNumber, availabilityStatus } = req.body
    
    // Update users table
    await query(
      'UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?',
      [name, phone || null, address || null, req.params.id]
    )
    
    // Update DeliveryPartners table
    await query(
      'UPDATE DeliveryPartners SET vehicle_type = ?, license_number = ?, availability_status = ? WHERE id = ?',
      [vehicleType, licenseNumber, availabilityStatus || 'offline', req.params.id]
    )
    
    const rows = await query(
      `SELECT u.*, dp.vehicle_type, dp.license_number, dp.availability_status, dp.rating AS delivery_rating, dp.total_deliveries_completed
       FROM users u
       LEFT JOIN DeliveryPartners dp ON u.id = dp.id
       WHERE u.id = ?`,
      [req.params.id]
    )
    res.json(mapUser(rows[0]))
  } catch (err) {
    console.error('Update delivery partner error:', err)
    res.status(500).json({ error: 'Failed to update delivery partner profile: ' + err.message })
  }
})

// Update availability status
app.patch('/api/delivery-partners/:id/status', async (req, res) => {
  try {
    const { availabilityStatus } = req.body
    if (!['available', 'busy', 'offline'].includes(availabilityStatus)) {
      return res.status(400).json({ error: 'Invalid availability status' })
    }
    
    await query(
      'UPDATE DeliveryPartners SET availability_status = ? WHERE id = ?',
      [availabilityStatus, req.params.id]
    )
    
    const rows = await query(
      `SELECT u.*, dp.vehicle_type, dp.license_number, dp.availability_status, dp.rating AS delivery_rating, dp.total_deliveries_completed
       FROM users u
       LEFT JOIN DeliveryPartners dp ON u.id = dp.id
       WHERE u.id = ?`,
      [req.params.id]
    )
    res.json(mapUser(rows[0]))
  } catch (err) {
    console.error('Update availability status error:', err)
    res.status(500).json({ error: 'Failed to update status: ' + err.message })
  }
})

// Get all delivery assignments (admin view)
app.get('/api/delivery-assignments', async (_req, res) => {
  try {
    const rows = await query(`
      SELECT da.*, o.customer_name, o.baker_name, o.delivery_address, o.total, o.status AS order_status,
             u.name AS partner_name, u.phone AS partner_phone
      FROM DeliveryAssignments da
      JOIN orders o ON da.order_id = o.id
      LEFT JOIN users u ON da.delivery_partner_id = u.id
      ORDER BY da.created_at DESC
    `)
    res.json(rows.map(mapDeliveryAssignment))
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch delivery assignments: ' + err.message })
  }
})

// Get delivery assignments for a specific delivery partner
app.get('/api/delivery-assignments/partner/:partnerId', async (req, res) => {
  try {
    const rows = await query(`
      SELECT da.*, o.customer_name, o.baker_name, o.delivery_address, o.total, o.status AS order_status,
             o.distance_km, o.subtotal, o.delivery_fee, o.created_at AS order_date,
             c.phone AS customer_phone, b.phone AS baker_phone, b.bakery_name
      FROM DeliveryAssignments da
      JOIN orders o ON da.order_id = o.id
      LEFT JOIN users c ON o.customer_id = c.id
      LEFT JOIN users b ON o.baker_id = b.id
      WHERE da.delivery_partner_id = ?
      ORDER BY da.created_at DESC
    `, [req.params.partnerId])
    res.json(rows.map(mapDeliveryAssignment))
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch partner assignments: ' + err.message })
  }
})

// Manually assign a delivery partner
app.post('/api/delivery-assignments/assign', async (req, res) => {
  const conn = await pool.getConnection()
  try {
    const { orderId, deliveryPartnerId } = req.body
    if (!orderId || !deliveryPartnerId) {
      return res.status(400).json({ error: 'Order ID and Delivery Partner ID are required.' })
    }

    await conn.beginTransaction()

    // 1. Check if assignment exists
    const [assignments] = await conn.query('SELECT * FROM DeliveryAssignments WHERE order_id = ?', [orderId])
    const assignmentId = assignments[0]?.id || `asm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    if (assignments.length > 0) {
      await conn.query(
        'UPDATE DeliveryAssignments SET delivery_partner_id = ?, status = ?, assigned_by = "admin" WHERE order_id = ?',
        [deliveryPartnerId, 'assigned', orderId]
      )
    } else {
      await conn.query(
        'INSERT INTO DeliveryAssignments (id, order_id, delivery_partner_id, assigned_by, status) VALUES (?, ?, ?, "admin", "assigned")',
        [assignmentId, orderId, deliveryPartnerId]
      )
    }

    // 2. Set partner availability to 'busy'
    await conn.query(
      "UPDATE DeliveryPartners SET availability_status = 'busy' WHERE id = ?",
      [deliveryPartnerId]
    )

    // 3. Log status history
    const historyId = `hst_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    await conn.query(
      'INSERT INTO DeliveryStatusHistory (id, delivery_assignment_id, status, comments, updated_by) VALUES (?, ?, "assigned", "Assigned manually by admin", "admin")',
      [historyId, assignmentId]
    )

    // 4. Send notifications
    const noteId = `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    await conn.query(
      'INSERT INTO notifications (id, user_id, type, message, order_id) VALUES (?, ?, "delivery_assigned", ?, ?)',
      [noteId, deliveryPartnerId, `New delivery assigned: Order #${orderId.slice(-6)}`, orderId]
    )

    // Notify customer
    const [orders] = await conn.query('SELECT customer_id FROM orders WHERE id = ?', [orderId])
    const customerId = orders[0]?.customer_id
    if (customerId) {
      const noteCustomer = `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
      await conn.query(
        'INSERT INTO notifications (id, user_id, type, message, order_id) VALUES (?, ?, "delivery_assigned", ?, ?)',
        [noteCustomer, customerId, `A delivery partner has been assigned to your order #${orderId.slice(-6)}`, orderId]
      )
    }

    await conn.commit()
    res.json({ success: true, assignmentId })
  } catch (err) {
    await conn.rollback()
    console.error('Manual assign error:', err)
    res.status(500).json({ error: 'Failed to assign delivery partner: ' + err.message })
  } finally {
    conn.release()
  }
})

// Update delivery assignment status
app.patch('/api/delivery-assignments/:id/status', async (req, res) => {
  const conn = await pool.getConnection()
  try {
    const { status, comments, updatedBy, failureReason } = req.body
    if (!['pending_assignment', 'assigned', 'picked_up', 'out_for_delivery', 'delivered', 'failed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid delivery status' })
    }

    await conn.beginTransaction()

    // 1. Get current assignment details
    const [assignments] = await conn.query('SELECT * FROM DeliveryAssignments WHERE id = ?', [req.params.id])
    if (assignments.length === 0) {
      await conn.rollback()
      return res.status(404).json({ error: 'Delivery assignment not found' })
    }
    const assignment = assignments[0]
    const orderId = assignment.order_id
    const partnerId = assignment.delivery_partner_id

    // 2. Update assignment fields
    const updates = []
    const params = []

    updates.push('status = ?')
    params.push(status)

    if (status === 'picked_up') {
      updates.push('picked_up_at = NOW()')
    } else if (status === 'delivered') {
      updates.push('delivered_at = NOW()')
    } else if (status === 'failed') {
      updates.push('failed_at = NOW()')
      updates.push('failure_reason = ?')
      params.push(failureReason || 'Failed to deliver')
    }

    params.push(req.params.id)
    await conn.query(`UPDATE DeliveryAssignments SET ${updates.join(', ')} WHERE id = ?`, params)

    // 3. Log status history
    const historyId = `hst_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    await conn.query(
      'INSERT INTO DeliveryStatusHistory (id, delivery_assignment_id, status, comments, updated_by) VALUES (?, ?, ?, ?, ?)',
      [historyId, req.params.id, status, comments || null, updatedBy || partnerId]
    )

    // 4. Update the corresponding order status
    let orderStatus = 'ready_for_delivery'
    if (status === 'out_for_delivery') {
      orderStatus = 'out_for_delivery'
    } else if (status === 'delivered') {
      orderStatus = 'delivered'
    } else if (status === 'failed') {
      orderStatus = 'failed'
    }

    await conn.query('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', [orderStatus, orderId])

    // 5. Update partner availability/stats if delivered or failed
    if (status === 'delivered') {
      await conn.query(
        'UPDATE DeliveryPartners SET total_deliveries_completed = total_deliveries_completed + 1, availability_status = "available" WHERE id = ?',
        [partnerId]
      )
    } else if (status === 'failed') {
      await conn.query(
        'UPDATE DeliveryPartners SET availability_status = "available" WHERE id = ?',
        [partnerId]
      )
    }

    // 6. Create notifications for customer, baker, and admins
    const [orderRows] = await conn.query('SELECT customer_id, baker_id FROM orders WHERE id = ?', [orderId])
    const orderObj = orderRows[0]
    const label = status.replace('_', ' ').toUpperCase()
    const msg = `Delivery status for Order #${orderId.slice(-6)} updated to ${label}.`

    // Notify customer
    if (orderObj?.customer_id) {
      const noteCustId = `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
      await conn.query(
        'INSERT INTO notifications (id, user_id, type, message, order_id) VALUES (?, ?, "delivery_status", ?, ?)',
        [noteCustId, orderObj.customer_id, msg, orderId]
      )
    }

    // Notify baker
    if (orderObj?.baker_id) {
      const noteBakerId = `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
      await conn.query(
        'INSERT INTO notifications (id, user_id, type, message, order_id) VALUES (?, ?, "delivery_status", ?, ?)',
        [noteBakerId, orderObj.baker_id, msg, orderId]
      )
    }

    // Notify admin
    const [adminRows] = await conn.query('SELECT id FROM users WHERE role = "admin"')
    for (const admin of adminRows) {
      const noteAdminId = `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
      await conn.query(
        'INSERT INTO notifications (id, user_id, type, message, order_id) VALUES (?, ?, "delivery_status", ?, ?)',
        [noteAdminId, admin.id, msg, orderId]
      )
    }

    await conn.commit()
    res.json({ success: true, status })
  } catch (err) {
    await conn.rollback()
    console.error('Update assignment status error:', err)
    res.status(500).json({ error: 'Failed to update delivery status: ' + err.message })
  } finally {
    conn.release()
  }
})

// Submit customer rating for a delivery partner
app.post('/api/delivery-ratings', async (req, res) => {
  const conn = await pool.getConnection()
  try {
    const { orderId, deliveryPartnerId, customerId, rating, comment } = req.body
    if (!orderId || !deliveryPartnerId || !customerId || !rating) {
      return res.status(400).json({ error: 'Order ID, Partner ID, Customer ID, and Rating are required.' })
    }

    await conn.beginTransaction()

    // Check if rating already exists
    const [existing] = await conn.query('SELECT id FROM DeliveryRatings WHERE order_id = ? AND customer_id = ?', [orderId, customerId])
    if (existing.length > 0) {
      await conn.rollback()
      return res.status(400).json({ error: 'You have already rated the delivery for this order.' })
    }

    const id = `drat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    await conn.query(
      'INSERT INTO DeliveryRatings (id, order_id, delivery_partner_id, customer_id, rating, comment) VALUES (?, ?, ?, ?, ?, ?)',
      [id, orderId, deliveryPartnerId, customerId, rating, comment || null]
    )

    // Recalculate partner rating
    await conn.query(`
      UPDATE DeliveryPartners 
      SET rating = (SELECT AVG(rating) FROM DeliveryRatings WHERE delivery_partner_id = ?)
      WHERE id = ?
    `, [deliveryPartnerId, deliveryPartnerId])

    await conn.commit()
    res.json({ success: true, ratingId: id })
  } catch (err) {
    await conn.rollback()
    console.error('Submit rating error:', err)
    res.status(500).json({ error: 'Failed to submit rating: ' + err.message })
  } finally {
    conn.release()
  }
})

// Get overall delivery stats (for admin)
app.get('/api/delivery-stats', async (req, res) => {
  try {
    const [totalPartners] = await query('SELECT COUNT(*) AS count FROM DeliveryPartners')
    const [activePartners] = await query('SELECT COUNT(*) AS count FROM DeliveryPartners WHERE availability_status = "available"')
    const [busyPartners] = await query('SELECT COUNT(*) AS count FROM DeliveryPartners WHERE availability_status = "busy"')
    const [offlinePartners] = await query('SELECT COUNT(*) AS count FROM DeliveryPartners WHERE availability_status = "offline"')
    
    const [assignmentsStats] = await query(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'pending_assignment' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'assigned' THEN 1 ELSE 0 END) AS assigned,
        SUM(CASE WHEN status = 'picked_up' THEN 1 ELSE 0 END) AS pickedUp,
        SUM(CASE WHEN status = 'out_for_delivery' THEN 1 ELSE 0 END) AS outForDelivery,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed
      FROM DeliveryAssignments
    `)

    const [earnings] = await query(`
      SELECT SUM(o.delivery_fee) AS todayEarnings
      FROM DeliveryAssignments da
      JOIN orders o ON da.order_id = o.id
      WHERE da.status = 'delivered' AND DATE(da.delivered_at) = CURRENT_DATE()
    `)

    res.json({
      partners: {
        total: totalPartners[0]?.count || 0,
        available: activePartners[0]?.count || 0,
        busy: busyPartners[0]?.count || 0,
        offline: offlinePartners[0]?.count || 0
      },
      deliveries: {
        total: assignmentsStats[0]?.total || 0,
        pending: assignmentsStats[0]?.pending || 0,
        assigned: assignmentsStats[0]?.assigned || 0,
        pickedUp: assignmentsStats[0]?.pickedUp || 0,
        outForDelivery: assignmentsStats[0]?.outForDelivery || 0,
        completed: assignmentsStats[0]?.completed || 0,
        failed: assignmentsStats[0]?.failed || 0,
      },
      todayEarnings: Number(earnings[0]?.todayEarnings || 0)
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch delivery statistics: ' + err.message })
  }
})

// Get delivery stats for a specific partner
app.get('/api/delivery-stats/partner/:partnerId', async (req, res) => {
  try {
    const partnerId = req.params.partnerId
    const [stats] = await query(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN da.status = 'assigned' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN da.status IN ('picked_up', 'out_for_delivery') THEN 1 ELSE 0 END) AS inTransit,
        SUM(CASE WHEN da.status = 'delivered' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN da.status = 'failed' THEN 1 ELSE 0 END) AS failed
      FROM DeliveryAssignments da
      WHERE da.delivery_partner_id = ?
    `, [partnerId])

    const [earnings] = await query(`
      SELECT SUM(o.delivery_fee) AS todayEarnings
      FROM DeliveryAssignments da
      JOIN orders o ON da.order_id = o.id
      WHERE da.delivery_partner_id = ? AND da.status = 'delivered' AND DATE(da.delivered_at) = CURRENT_DATE()
    `, [partnerId])

    res.json({
      total: stats[0]?.total || 0,
      pending: stats[0]?.pending || 0,
      inTransit: stats[0]?.inTransit || 0,
      completed: stats[0]?.completed || 0,
      failed: stats[0]?.failed || 0,
      todayEarnings: Number(earnings[0]?.todayEarnings || 0)
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch partner statistics: ' + err.message })
  }
})


// ── DELIVERY PARTNER SALARY ENDPOINTS ──────────────────────────────────

// Get all delivery partners with salary details for selected month/year
app.get('/api/admin/salaries/partners', async (req, res) => {
  try {
    const { month, year } = req.query
    const parsedMonth = parseInt(month)
    const parsedYear = parseInt(year)
    if (!parsedMonth || !parsedYear) {
      return res.status(400).json({ error: 'Month and year are required.' })
    }

    const rows = await query(`
      SELECT u.id, u.reference_id, u.name, u.email, u.phone, dp.vehicle_type, dp.total_deliveries_completed,
             ds.id AS salary_id, ds.base_salary, ds.bonus, ds.deduction, ds.final_salary,
             ds.payment_status, ds.payment_date, ds.remarks
      FROM users u
      JOIN DeliveryPartners dp ON u.id = dp.id
      LEFT JOIN DeliverySalaries ds ON u.id = ds.delivery_partner_id AND ds.month = ? AND ds.year = ?
    `, [parsedMonth, parsedYear])

    res.json(rows.map(row => ({
      id: row.id,
      referenceId: row.reference_id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      vehicleType: row.vehicle_type,
      totalDeliveriesCompleted: row.total_deliveries_completed,
      salary: row.salary_id ? {
        id: row.salary_id,
        baseSalary: Number(row.base_salary),
        bonus: Number(row.bonus),
        deduction: Number(row.deduction),
        finalSalary: Number(row.final_salary),
        paymentStatus: row.payment_status,
        paymentDate: dateValue(row.payment_date),
        remarks: row.remarks
      } : null
    })))
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch delivery partners salary stats: ' + err.message })
  }
})

// Create or update a salary record (UPSERT style)
app.post('/api/admin/salaries', async (req, res) => {
  try {
    const { deliveryPartnerId, month, year, baseSalary, bonus, deduction, remarks } = req.body
    if (!deliveryPartnerId || !month || !year) {
      return res.status(400).json({ error: 'Delivery partner ID, month, and year are required.' })
    }

    const base = Number(baseSalary || 0)
    const bon = Number(bonus || 0)
    const ded = Number(deduction || 0)
    const finalSalary = base + bon - ded
    const salaryId = `sal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    await query(`
      INSERT INTO DeliverySalaries (id, delivery_partner_id, month, year, base_salary, bonus, deduction, final_salary, payment_status, remarks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
      ON DUPLICATE KEY UPDATE
        base_salary = VALUES(base_salary),
        bonus = VALUES(bonus),
        deduction = VALUES(deduction),
        final_salary = VALUES(final_salary),
        remarks = VALUES(remarks)
    `, [salaryId, deliveryPartnerId, month, year, base, bon, ded, finalSalary, remarks || null])

    res.status(201).json({ success: true, salaryId })
  } catch (err) {
    res.status(500).json({ error: 'Failed to save salary record: ' + err.message })
  }
})

// Update salary record details (only if pending)
app.put('/api/admin/salaries/:id', async (req, res) => {
  try {
    const { baseSalary, bonus, deduction, remarks, month, year } = req.body
    const base = Number(baseSalary || 0)
    const bon = Number(bonus || 0)
    const ded = Number(deduction || 0)
    const finalSalary = base + bon - ded

    const rows = await query('SELECT payment_status FROM DeliverySalaries WHERE id = ?', [req.params.id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Salary record not found' })
    }
    if (rows[0].payment_status === 'paid') {
      return res.status(400).json({ error: 'Cannot edit a salary record that has already been paid' })
    }

    await query(`
      UPDATE DeliverySalaries
      SET base_salary = ?, bonus = ?, deduction = ?, final_salary = ?, remarks = ?, month = ?, year = ?
      WHERE id = ?
    `, [base, bon, ded, finalSalary, remarks || null, month, year, req.params.id])

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update salary record: ' + err.message })
  }
})

// Mark salary as Paid
app.patch('/api/admin/salaries/:id/pay', async (req, res) => {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const [rows] = await conn.query('SELECT * FROM DeliverySalaries WHERE id = ?', [req.params.id])
    if (rows.length === 0) {
      await conn.rollback()
      return res.status(404).json({ error: 'Salary record not found' })
    }
    const salary = rows[0]
    if (salary.payment_status === 'paid') {
      await conn.rollback()
      return res.status(400).json({ error: 'Salary is already paid' })
    }

    await conn.query('UPDATE DeliverySalaries SET payment_status = "paid", payment_date = NOW() WHERE id = ?', [req.params.id])

    const noteId = `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const monthName = monthNames[salary.month] || `Month ${salary.month}`
    const msg = `Your salary of Rs. ${Number(salary.final_salary).toLocaleString('en-LK')} for ${monthName} ${salary.year} has been processed and paid!`
    
    await conn.query('INSERT INTO notifications (id, user_id, type, message) VALUES (?, ?, "salary_paid", ?)', [noteId, salary.delivery_partner_id, msg])

    await conn.commit()
    res.json({ success: true })
  } catch (err) {
    await conn.rollback()
    res.status(500).json({ error: 'Failed to process salary payment: ' + err.message })
  } finally {
    conn.release()
  }
})

// Get all salary records with search and filter
app.get('/api/admin/salaries', async (req, res) => {
  try {
    const { search, month, year, status } = req.query
    let sql = `
      SELECT ds.*, u.name AS partner_name, u.email AS partner_email, u.phone AS partner_phone, u.reference_id
      FROM DeliverySalaries ds
      JOIN users u ON ds.delivery_partner_id = u.id
      WHERE 1=1
    `
    const params = []

    if (month) {
      sql += ' AND ds.month = ?'
      params.push(parseInt(month))
    }
    if (year) {
      sql += ' AND ds.year = ?'
      params.push(parseInt(year))
    }
    if (status) {
      sql += ' AND ds.payment_status = ?'
      params.push(status)
    }
    if (search) {
      sql += ' AND (u.name LIKE ? OR u.email LIKE ? OR u.reference_id LIKE ?)'
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    sql += ' ORDER BY ds.year DESC, ds.month DESC, ds.created_at DESC'
    const rows = await query(sql, params)
    res.json(rows.map(row => ({
      id: row.id,
      deliveryPartnerId: row.delivery_partner_id,
      partnerName: row.partner_name,
      partnerEmail: row.partner_email,
      partnerPhone: row.partner_phone,
      partnerReferenceId: row.reference_id,
      month: row.month,
      year: row.year,
      baseSalary: Number(row.base_salary),
      bonus: Number(row.bonus),
      deduction: Number(row.deduction),
      finalSalary: Number(row.final_salary),
      paymentStatus: row.payment_status,
      paymentDate: dateValue(row.payment_date),
      remarks: row.remarks,
      createdAt: dateValue(row.created_at)
    })))
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch salary records: ' + err.message })
  }
})

// Get salary records for a specific delivery partner
app.get('/api/salaries/partner/:partnerId', async (req, res) => {
  try {
    const rows = await query(`
      SELECT ds.*, u.name AS partner_name
      FROM DeliverySalaries ds
      JOIN users u ON ds.delivery_partner_id = u.id
      WHERE ds.delivery_partner_id = ?
      ORDER BY ds.year DESC, ds.month DESC
    `, [req.params.partnerId])

    res.json(rows.map(row => ({
      id: row.id,
      deliveryPartnerId: row.delivery_partner_id,
      partnerName: row.partner_name,
      month: row.month,
      year: row.year,
      baseSalary: Number(row.base_salary),
      bonus: Number(row.bonus),
      deduction: Number(row.deduction),
      finalSalary: Number(row.final_salary),
      paymentStatus: row.payment_status,
      paymentDate: dateValue(row.payment_date),
      remarks: row.remarks,
      createdAt: dateValue(row.created_at)
    })))
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch partner salary records: ' + err.message })
  }
})

app.use((req, res) => {

  res.status(404).json({ error: 'Unknown API endpoint' })
})

app.listen(APP_PORT, () => {
  console.log(`Server started: http://localhost:${APP_PORT}`)
})