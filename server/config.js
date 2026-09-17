/*
 File: server/config.js
 Purpose: Server-side Node.js code for API, database, or app setup.
 Main exports: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
 */

import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

// getEnv: Fetches data or reads values for the application.
const getEnv = (name, fallback) => process.env[name] ?? fallback

// DB_HOST: Helper or component used in this file.
export const DB_HOST = getEnv('DB_HOST', '127.0.0.1')
// DB_PORT: Helper or component used in this file.
export const DB_PORT = Number(getEnv('DB_PORT', '3306'))
// DB_USER: Helper or component used in this file.
export const DB_USER = getEnv('DB_USER', 'root')
// DB_PASSWORD: Helper or component used in this file.
export const DB_PASSWORD = getEnv('DB_PASSWORD', '')
// DB_NAME: Helper or component used in this file.
export const DB_NAME = getEnv('DB_NAME', 'home_bakers_marketplace')
// APP_PORT: Helper or component used in this file.
export const APP_PORT = Number(getEnv('PORT', '4000'))