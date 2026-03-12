import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Notification from "./components/Notification";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingSkeleton from "./components/LoadingSkeleton";

// Lazy-loaded pages — only downloaded when the user navigates to them
const HomePage = lazy(() => import("./components/HomePage"));
const ProductDetailPage = lazy(() => import("./components/ProductDetailPage"));
const RegisterPage = lazy(() => import("./components/RegisterPage"));
const LoginPage = lazy(() => import("./components/LoginPage"));
const VerifyPage = lazy(() => import("./components/VerifyPage"));
const ForgotPasswordPage = lazy(() => import("./components/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./components/ResetPasswordPage"));
const GoogleAuthCallbackPage = lazy(() => import("./components/GoogleAuthCallbackPage"));
const CartPage = lazy(() => import("./components/CartPage"));
const OrderHistoryPage = lazy(() => import("./components/OrderHistoryPage"));
const CheckoutPage = lazy(() => import("./components/CheckoutPage"));
const UserProfilePage = lazy(() => import("./components/UserProfilePage"));
const AdminOrdersPage = lazy(() => import("./components/AdminOrdersPage"));
const AdminProductsPage = lazy(() => import("./components/AdminProductsPage"));
const AdminUsersPage = lazy(() => import("./components/AdminUsersPage"));
const NotFoundPage = lazy(() => import("./components/NotFoundPage"));

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Notification />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<LoadingSkeleton />}>
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
