import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

function CheckoutPage() {
  const [address, setAddress] = useState({
    street: "",
    city: "",
    postalCode: "",
    country: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { token } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchUserAddress = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch user data.");

        const userData = await response.json();
        if (userData.address) {
          setAddress(userData.address);
        }
      } catch (err) {
        console.error(err);
        setError("Could not load your address. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserAddress();
  }, [token]);

  const handleChange = (e) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const addressResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/user/address`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(address),
      });

      if (!addressResponse.ok) {
        throw new Error("Failed to save your address.");
      }

      const orderResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create your order after saving address.");
      }

      showNotification("Order placed successfully!", "success");
      navigate("/orders");
    } catch (err) {
      setError(err.message);
      console.error("Checkout process error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="flex justify-center items-start py-16 bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 min-h-screen animate-fade-in">
      <div className="w-full max-w-3xl p-10 space-y-8 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-100 transform hover:shadow-3xl transition-all duration-500 animate-slide-up">

        <div className="text-center relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 w-16 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-expand-width"></div>

          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text animate-gradient-text">Checkout</h1>

          <p className="mt-4 text-lg text-gray-600 leading-relaxed animate-fade-in-delayed">Please confirm your shipping address to complete your order.</p>


          <div className="flex justify-center mt-6 space-x-2 animate-fade-in-delayed">
            <div className="w-8 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
            <div className="w-8 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
            <div className="w-4 h-2 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 animate-form-appear">

          <div className="group animate-slide-in-item" style={{ animationDelay: "0.1s" }}>
            <label htmlFor="street" className="block text-sm font-bold text-gray-700 mb-3 group-focus-within:text-indigo-600 transition-colors duration-200 flex items-center space-x-2">
              <span>Street Address</span>
              <div className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
            </label>
            <div className="relative">
              <input
                type="text"
                name="street"
                id="street"
                value={address.street}
                onChange={handleChange}
                required
                className="w-full p-4 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-300 hover:border-gray-300 bg-gradient-to-br from-white to-gray-50/50 text-lg"
                placeholder="Enter your street address"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
            </div>
          </div>


          <div className="group animate-slide-in-item" style={{ animationDelay: "0.2s" }}>
            <label htmlFor="city" className="block text-sm font-bold text-gray-700 mb-3 group-focus-within:text-indigo-600 transition-colors duration-200 flex items-center space-x-2">
              <span>City</span>
              <div className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
            </label>
            <div className="relative">
              <input type="text" name="city" id="city" value={address.city} onChange={handleChange} required className="w-full p-4 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-300 hover:border-gray-300 bg-gradient-to-br from-white to-gray-50/50 text-lg" placeholder="Enter your city" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-in-item" style={{ animationDelay: "0.3s" }}>
            <div className="group">
              <label htmlFor="postalCode" className="block text-sm font-bold text-gray-700 mb-3 group-focus-within:text-indigo-600 transition-colors duration-200 flex items-center space-x-2">
                <span>Postal Code</span>
                <div className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="postalCode"
                  id="postalCode"
                  value={address.postalCode}
                  onChange={handleChange}
                  required
                  className="w-full p-4 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-300 hover:border-gray-300 bg-gradient-to-br from-white to-gray-50/50 text-lg"
                  placeholder="12345"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
              </div>
            </div>

            <div className="group">
              <label htmlFor="country" className="block text-sm font-bold text-gray-700 mb-3 group-focus-within:text-indigo-600 transition-colors duration-200 flex items-center space-x-2">
                <span>Country</span>
                <div className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="country"
                  id="country"
                  value={address.country}
                  onChange={handleChange}
                  required
                  className="w-full p-4 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-300 hover:border-gray-300 bg-gradient-to-br from-white to-gray-50/50 text-lg"
                  placeholder="United States"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
              </div>
            </div>
          </div>


          {error && (
            <div className="animate-shake">
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center space-x-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            </div>
          )}


          <div className="pt-4 animate-slide-in-item" style={{ animationDelay: "0.4s" }}>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full px-8 py-5 font-bold text-lg text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
            >
  
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-shimmer-infinite"></div>


              {loading && (
                <div className="absolute left-6 top-1/2 transform -translate-y-1/2">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              )}


              <span className={`relative flex items-center justify-center space-x-3 ${loading ? "ml-8" : ""} transition-all duration-300`}>
                <span>{loading ? "Processing..." : "Place Order"}</span>
                {!loading && (
                  <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center group-hover:rotate-180 transition-transform duration-500">
                    <div className="w-2 h-2 bg-white rounded-full transform group-hover:scale-150 transition-transform duration-300"></div>
                  </div>
                )}
              </span>

              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 group-hover:w-24 h-1 bg-white/30 rounded-full transition-all duration-300"></div>
            </button>
          </div>
        </form>


        <div className="flex justify-center items-center space-x-2 pt-6 text-gray-500 animate-fade-in-delayed">
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-sm font-medium">Your information is secure and encrypted</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-delayed {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-in-item {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes form-appear {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes expand-width {
          from {
            width: 0;
          }
          to {
            width: 4rem;
          }
        }

        @keyframes gradient-text {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes shimmer-infinite {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 1s ease-out 0.2s both;
        }

        .animate-fade-in-delayed {
          animation: fade-in-delayed 1s ease-out 0.6s both;
        }

        .animate-slide-in-item {
          animation: slide-in-item 0.8s ease-out both;
        }

        .animate-form-appear {
          animation: form-appear 1s ease-out 0.4s both;
        }

        .animate-expand-width {
          animation: expand-width 1s ease-out 0.3s both;
        }

        .animate-gradient-text {
          background-size: 200% 200%;
          animation: gradient-text 3s ease infinite;
        }

        .animate-shimmer-infinite {
          animation: shimmer-infinite 2s ease-in-out infinite;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default CheckoutPage;
