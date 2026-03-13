import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import Notification from "./components/ui/Notification";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PageLoader from "./components/layout/PageLoader";

// Lazy-loaded pages
const HomePage = lazy(() => import("./components/products/HomePage"));
const ProductDetailPage = lazy(() => import("./components/products/ProductDetailPage"));
const RegisterPage = lazy(() => import("./components/auth/RegisterPage"));
const LoginPage = lazy(() => import("./components/auth/LoginPage"));
const VerifyPage = lazy(() => import("./components/auth/VerifyPage"));
const ForgotPasswordPage = lazy(() => import("./components/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./components/auth/ResetPasswordPage"));
const GoogleAuthCallbackPage = lazy(() => import("./components/auth/GoogleAuthCallbackPage"));
const CartPage = lazy(() => import("./components/cart/CartPage"));
const OrderHistoryPage = lazy(() => import("./components/orders/OrderHistoryPage"));
const CheckoutPage = lazy(() => import("./components/cart/CheckoutPage"));
const UserProfilePage = lazy(() => import("./components/profile/UserProfilePage"));
const AdminOrdersPage = lazy(() => import("./components/admin/AdminOrdersPage"));
const AdminProductsPage = lazy(() => import("./components/admin/AdminProductsPage"));
const AdminUsersPage = lazy(() => import("./components/admin/AdminUsersPage"));
const NotFoundPage = lazy(() => import("./components/NotFoundPage"));

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Notification />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/verify-email" element={<VerifyPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:userId/:token" element={<ResetPasswordPage />} />
            <Route path="/auth/google/callback" element={<GoogleAuthCallbackPage />} />

            {/* Protected user routes */}
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrderHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />

            {/* Admin-only routes */}
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute adminOnly>
                  <AdminOrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute adminOnly>
                  <AdminProductsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute adminOnly>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;
