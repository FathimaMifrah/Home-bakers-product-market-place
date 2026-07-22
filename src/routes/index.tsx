/*
 File: src/routes/index.tsx
 Purpose: Beginner-friendly source file.
 Main exports: AppRoutes
 */

import AdminAnalyticsPage from '@/pages/admin/AdminAnalyticsPage'
import AdminBakersPage from '@/pages/admin/AdminBakersPage'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminInventoryPage from '@/pages/admin/AdminInventoryPage'
import AdminOrdersPage from '@/pages/admin/AdminOrdersPage'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'
import AdminDeliveryPage from '@/pages/admin/AdminDeliveryPage'
import BakerAnalyticsPage from '@/pages/baker/BakerAnalyticsPage'
import BakerDashboard from '@/pages/baker/BakerDashboard'
import BakerDeliveryPage from '@/pages/baker/BakerDeliveryPage'
import BakerInventoryPage from '@/pages/baker/BakerInventoryPage'
import BakerOrdersPage from '@/pages/baker/BakerOrdersPage'
import BakerProductsPage from '@/pages/baker/BakerProductsPage'
import BrowsePage from '@/pages/customer/BrowsePage'
import CartPage from '@/pages/customer/CartPage'
import CheckoutPage from '@/pages/customer/CheckoutPage'
import CustomerDashboard from '@/pages/customer/CustomerDashboard'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/auth/LoginPage'
import OrdersPage from '@/pages/customer/OrdersPage'
import OrderTrackingPage from '@/pages/customer/OrderTrackingPage'
import ProductDetailPage from '@/pages/ProductDetailPage'
import ProductsPage from '@/pages/ProductsPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ReviewPage from '@/pages/customer/ReviewPage'
import DeliveryDashboard from '@/pages/delivery/DeliveryDashboard'
import DeliveryOrdersPage from '@/pages/delivery/DeliveryOrdersPage'
import DeliveryProfilePage from '@/pages/delivery/DeliveryProfilePage'
import DeliverySalaryPage from '@/pages/delivery/DeliverySalaryPage'
import AdminSalariesPage from '@/pages/admin/AdminSalariesPage'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { Routes, Route } from 'react-router-dom'



// AppRoutes: Helper or component used in this file.
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />

      <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/customer/browse" element={<BrowsePage />} />
        <Route path="/customer/cart" element={<CartPage />} />
        <Route path="/customer/checkout" element={<CheckoutPage />} />
        <Route path="/customer/orders" element={<OrdersPage />} />
        <Route path="/customer/orders/:id" element={<OrderTrackingPage />} />
        <Route path="/customer/orders/:id/review" element={<ReviewPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['baker']} />}>
        <Route path="/baker" element={<BakerDashboard />} />
        <Route path="/baker/products" element={<BakerProductsPage />} />
        <Route path="/baker/inventory" element={<BakerInventoryPage />} />
        <Route path="/baker/orders" element={<BakerOrdersPage />} />
        <Route path="/baker/delivery" element={<BakerDeliveryPage />} />
        <Route path="/baker/analytics" element={<BakerAnalyticsPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['delivery_partner']} />}>
        <Route path="/delivery" element={<DeliveryDashboard />} />
        <Route path="/delivery/orders" element={<DeliveryOrdersPage />} />
        <Route path="/delivery/salary" element={<DeliverySalaryPage />} />
        <Route path="/delivery/profile" element={<DeliveryProfilePage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/inventory" element={<AdminInventoryPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/bakers" element={<AdminBakersPage />} />
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
        <Route path="/admin/delivery" element={<AdminDeliveryPage />} />
        <Route path="/admin/salaries" element={<AdminSalariesPage />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
      </Route>
    </Routes>
  )
}