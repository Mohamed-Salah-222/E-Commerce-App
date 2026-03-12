import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.admin === true;

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) => `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(path) ? "bg-gray-900 text-white" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`;

  const mobileNavLinkClass = (path) => `block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(path) ? "bg-gray-900 text-white" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`;

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m7.5 4.27 9 5.15" />
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" />
                <path d="M12 22V12" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">E-Store</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {loading ? (
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 w-20 rounded-lg bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : user ? (
              <>
                {isAdmin ? (
                  <>
                    <Link to="/admin/orders" className={navLinkClass("/admin/orders")}>
                      Orders
                    </Link>
                    <Link to="/admin/products" className={navLinkClass("/admin/products")}>
                      Products
                    </Link>
                    <Link to="/admin/users" className={navLinkClass("/admin/users")}>
                      Users
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/profile" className={navLinkClass("/profile")}>
                      Profile
                    </Link>
                    <Link to="/cart" className={navLinkClass("/cart")}>
                      Cart
                    </Link>
                    <Link to="/orders" className={navLinkClass("/orders")}>
                      Orders
                    </Link>
                  </>
                )}

                <div className="w-px h-6 bg-gray-200 mx-2" />

                <span className="text-sm text-gray-500 px-2">{user.username}</span>

                <button onClick={handleLogout} className="ml-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/register" className={navLinkClass("/register")}>
                  Register
                </Link>
                <Link to="/login" className="ml-2 bg-gray-900 text-white hover:bg-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Toggle menu">
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200/60 bg-white/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            {loading ? (
              <div className="space-y-2 py-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 rounded-lg bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : user ? (
              <>
                <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100 mb-2">
                  Signed in as <span className="font-semibold text-gray-900">{user.username}</span>
                </div>
                {isAdmin ? (
                  <>
                    <Link to="/admin/orders" className={mobileNavLinkClass("/admin/orders")} onClick={() => setMobileMenuOpen(false)}>
                      Orders
                    </Link>
                    <Link to="/admin/products" className={mobileNavLinkClass("/admin/products")} onClick={() => setMobileMenuOpen(false)}>
                      Products
                    </Link>
                    <Link to="/admin/users" className={mobileNavLinkClass("/admin/users")} onClick={() => setMobileMenuOpen(false)}>
                      Users
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/profile" className={mobileNavLinkClass("/profile")} onClick={() => setMobileMenuOpen(false)}>
                      Profile
                    </Link>
                    <Link to="/cart" className={mobileNavLinkClass("/cart")} onClick={() => setMobileMenuOpen(false)}>
                      Cart
                    </Link>
                    <Link to="/orders" className={mobileNavLinkClass("/orders")} onClick={() => setMobileMenuOpen(false)}>
                      Orders
                    </Link>
                  </>
                )}
                <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-2">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/register" className={mobileNavLinkClass("/register")} onClick={() => setMobileMenuOpen(false)}>
                  Register
                </Link>
                <Link to="/login" className={mobileNavLinkClass("/login")} onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
