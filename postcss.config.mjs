/*
 File: postcss.config.mjs
 Purpose: Build or tooling configuration file.
 Main exports: Exports or main definitions
 */

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

export default config