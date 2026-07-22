/*
 File: vite.config.js
 Purpose: Build or tooling configuration file.
 Main exports: Exports or main definitions
 */

import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

// __dirname: Helper or component used in this file.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});