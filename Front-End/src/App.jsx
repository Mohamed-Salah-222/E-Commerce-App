// src/App.jsx
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import HomePage from "./components/HomePage";
import ProductDetailPage from "./components/ProductDetailPage";
import RegisterPage from "./components/RegisterPage";
import LoginPage from "./components/LoginPage";
import { useAuth } from "./context/AuthContext";
import CartPage from "./components/CartPage";
import ProtectedRoute from "./components/ProtectedRoute";
import OrderHistoryPage from "./components/OrderHistoryPage";
import VerifyPage from "./components/VerifyPage";

function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-xl font-bold text-gray-800">
            E-Store
          </Link>
          <span className="text-gray-300">|</span>
          <Link to="/" className="text-gray-600 hover:text-indigo-600">
            Products
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/cart" className="text-gray-600 hover:text-indigo-600">
                My Cart
              </Link>
              <Link to="/orders" className="text-gray-600 hover:text-indigo-600">
                My Orders
              </Link>
              <span className="text-gray-300">|</span>
              <span>
                <span className="font-bold text-gray-900">{user.username}</span>
              </span>
              <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/register" className="text-gray-600 hover:text-indigo-600">
                Register
              </Link>
              <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md text-sm">
                Login
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="container mx-auto p-4 md:p-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyPage />} />
          <Route path="/login" element={<LoginPage />} />

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
        </Routes>
      </main>
    </div>
  );
}

export default App;
