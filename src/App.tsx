/*
 File: src/App.tsx
 Purpose: Beginner-friendly source file.
 Main exports: App
 */

import { AppRoutes } from '@/routes'
import { AuthProvider } from '@/contexts/AuthContext'
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from '@/contexts/CartContext'
import { MarketplaceProvider } from '@/contexts/MarketplaceContext'
import { ScrollToHash } from '@/components/layout/ScrollToHash'
import { Toaster } from 'sonner'


// App: Helper or component used in this file.
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MarketplaceProvider>
          <CartProvider>
            <ScrollToHash />
            <AppRoutes />
            <Toaster position="top-right" richColors />
          </CartProvider>
        </MarketplaceProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}