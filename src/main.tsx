/*
 File: src/main.tsx
 Purpose: Beginner-friendly source file.
 Main exports: Exports or main definitions
 */

import './index.css'
import App from './App'
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)