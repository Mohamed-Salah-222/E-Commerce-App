import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import HomePage from "./components/HomePage";
import ProductDetailPage from "./components/ProductDetailPage";
import RegisterPage from "./components/RegisterPage";
import LoginPage from "./components/LoginPage";
import CartPage from "./components/CartPage";
import OrderHistoryPage from "./components/OrderHistoryPage";
import AdminOrdersPage from "./components/AdminOrdersPage";
import AdminUsersPage from "./components/AdminUsersPage"; // New admin users component
import AdminProductsPage from "./components/AdminProductsPage"; // New admin products component
import ProtectedRoute from "./components/ProtectedRoute";
import VerifyPage from "./components/VerifyPage";
import Notification from "./components/Notification";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import GoogleAuthCallbackPage from "./components/GoogleAuthCallbackPage";
import CheckoutPage from "./components/CheckoutPage";
import UserProfilePage from "./components/UserProfilePage";
import PaymentPopup from "./components/PaymentPopup";

function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isAdmin = user?.admin === true; // Check if user is admin

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Notification />

      <nav className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                E-Store
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {/* Admin Navigation */}
                  {isAdmin ? (
                    <>
                      <Link to="/admin/orders" className="text-gray-500 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                        Orders
                      </Link>
                      <Link to="/admin/products" className="text-gray-500 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                        Products
                      </Link>
                      <Link to="/admin/users" className="text-gray-500 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                        Users
                      </Link>
                      <span className="text-gray-300 hidden sm:block">|</span>
                      <span className="text-sm text-gray-700 hidden sm:block">
                        <span className="font-bold text-indigo-600">{user.username}</span>
                      </span>
                    </>
                  ) : (
                    /* Regular User Navigation */
                    <>
                      <Link to="/profile" className="text-gray-500 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                        My Profile
                      </Link>
                      <Link to="/cart" className="text-gray-500 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                        My Cart
                      </Link>
                      <Link to="/orders" className="text-gray-500 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                        My Orders
                      </Link>
                      <span className="text-gray-300 hidden sm:block">|</span>
                      <span className="text-sm text-gray-700 hidden sm:block">
                        <span className="font-bold text-gray-900">{user.username}</span>
                      </span>
                    </>
                  )}
                  <button onClick={handleLogout} className="bg-stone-100 hover:bg-stone-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/register" className="text-gray-500 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                    Register
                  </Link>
                  <Link to="/login" className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-4 md:p-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:userId/:token" element={<ResetPasswordPage />} />
          <Route path="/auth/google/callback" element={<GoogleAuthCallbackPage />} />

          {/* Regular User Routes */}
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

          {/* Admin Routes */}
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute>
                <AdminOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute>
                <AdminProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
