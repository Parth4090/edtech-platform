import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { StudentLayout } from './layouts/StudentLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Student Pages
import { LandingPage } from './pages/LandingPage';
import { CataloguePage } from './pages/CataloguePage';
import { CartPage } from './pages/CartPage';
import { MyLibraryPage } from './pages/MyLibraryPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminCataloguePage } from './pages/admin/AdminCataloguePage';
import { AdminMaterialsPage } from './pages/admin/AdminMaterialsPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminCouponsPage } from './pages/admin/AdminCouponsPage';
import { AdminAccessPage } from './pages/admin/AdminAccessPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Student & Public Portal */}
            <Route path="/" element={<StudentLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="catalogue" element={<CataloguePage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="library" element={<MyLibraryPage />} />
              <Route path="dashboard" element={<StudentDashboardPage />} />
              <Route path="orders" element={<OrderHistoryPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            {/* Admin Management Dashboard */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="boards" element={<AdminCataloguePage />} />
              <Route path="classes" element={<AdminCataloguePage />} />
              <Route path="subjects" element={<AdminCataloguePage />} />
              <Route path="chapters" element={<AdminCataloguePage />} />
              <Route path="materials" element={<AdminMaterialsPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="coupons" element={<AdminCouponsPage />} />
              <Route path="students" element={<AdminAccessPage />} />
              <Route path="access" element={<AdminAccessPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
