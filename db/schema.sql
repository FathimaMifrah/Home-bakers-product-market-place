-- File: db/schema.sql
-- Purpose: Database schema or seed script for the project.
-- Main exports: Exports or main definitions

-- MySQL schema for Home Bakers Marketplace
-- Generated from project types and services

CREATE DATABASE IF NOT EXISTS home_bakers_marketplace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE home_bakers_marketplace;

-- Users table
CREATE TABLE users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  role ENUM('customer','baker','admin','delivery_partner') NOT NULL DEFAULT 'customer',
  phone VARCHAR(50),
  address TEXT,
  avatar VARCHAR(1024),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  bakery_name VARCHAR(255),
  specialties JSON,
  rating DECIMAL(3,2) DEFAULT 0,
  total_orders INT DEFAULT 0,
  is_approved BOOLEAN DEFAULT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Products table
CREATE TABLE products (
  id VARCHAR(64) PRIMARY KEY,
  baker_id VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category ENUM('sweet','savory','cakes','seasonal') NOT NULL,
  image_url VARCHAR(1024),
  stock INT DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INT DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_baker FOREIGN KEY (baker_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Orders table
CREATE TABLE orders (
  id VARCHAR(64) PRIMARY KEY,
  customer_id VARCHAR(64),
  customer_name VARCHAR(255) NOT NULL,
  baker_id VARCHAR(64),
  baker_name VARCHAR(255) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status ENUM('pending','confirmed','accepted','preparing','ready_for_delivery','out_for_delivery','delivered','cancelled','failed') NOT NULL DEFAULT 'pending',
  delivery_address TEXT,
  distance_km DECIMAL(6,2) DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_orders_baker FOREIGN KEY (baker_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Order items
CREATE TABLE order_items (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL,
  product_id VARCHAR(64),
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Notifications table for baker/customer/admin alerts
CREATE TABLE notifications (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Reviews
CREATE TABLE reviews (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(64),
  product_id VARCHAR(64) NOT NULL,
  customer_id VARCHAR(64) NOT NULL,
  customer_name VARCHAR(255),
  rating TINYINT NOT NULL,
  comment TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reviews_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Delivery settings per baker
CREATE TABLE delivery_settings (
  baker_id VARCHAR(64) PRIMARY KEY,
  min_order_value DECIMAL(10,2) DEFAULT 0,
  max_delivery_km DECIMAL(6,2) DEFAULT 0,
  delivery_fee_per_km DECIMAL(10,2) DEFAULT 0,
  base_delivery_fee DECIMAL(10,2) DEFAULT 0,
  CONSTRAINT fk_delivery_baker FOREIGN KEY (baker_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Optional: sessions table (simple server-side session store)
CREATE TABLE sessions (
  id VARCHAR(128) PRIMARY KEY,
  user_id VARCHAR(64),
  data JSON,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Indexes for common queries
CREATE INDEX idx_products_baker ON products(baker_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_baker ON orders(baker_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);

-- DeliveryPartners table
CREATE TABLE DeliveryPartners (
  id VARCHAR(64) PRIMARY KEY,
  vehicle_type ENUM('bike', 'scooter', 'car') NOT NULL,
  license_number VARCHAR(100) NOT NULL,
  availability_status ENUM('available', 'busy', 'offline') NOT NULL DEFAULT 'offline',
  rating DECIMAL(3,2) DEFAULT 5.00,
  total_deliveries_completed INT DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_delivery_partner_user FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- DeliveryAssignments table
CREATE TABLE DeliveryAssignments (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- DeliveryStatusHistory table
CREATE TABLE DeliveryStatusHistory (
  id VARCHAR(64) PRIMARY KEY,
  delivery_assignment_id VARCHAR(64) NOT NULL,
  status ENUM('pending_assignment', 'assigned', 'picked_up', 'out_for_delivery', 'delivered', 'failed') NOT NULL,
  comments VARCHAR(255),
  updated_by VARCHAR(64) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_history_assignment FOREIGN KEY (delivery_assignment_id) REFERENCES DeliveryAssignments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- DeliveryRatings table
CREATE TABLE DeliveryRatings (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- End of schema
