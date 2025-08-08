import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import PaymentPopup from "./PaymentPopup"; // Import the payment popup

function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [userAddress, setUserAddress] = useState(null);

  const { token } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // --- DATA FETCHING ---
  const fetchCart = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch cart");
      const data = await response.json();
      setCart(data);
      if (data.promoCode) {
        setPromoCode(data.promoCode);
        setPromoMessage("Promo applied! 10% discount.");
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAddress = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const userData = await response.json();
        setUserAddress(userData.address);
      }
    } catch (error) {
      console.error("Error fetching user address:", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchCart();
    fetchUserAddress();
  }, [token]);

  // --- ACTION HANDLERS ---
  const handleRemoveItem = async (itemToRemove) => {
    try {
      const params = new URLSearchParams({
        size: itemToRemove.size || "",
        color: itemToRemove.color || "",
      });
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/items/${itemToRemove.productId._id}?${params.toString()}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to remove item");
      showNotification("Item removed from cart.", "success");
      fetchCart();
    } catch (error) {
      showNotification("Error removing item.", "error");
      console.error("Error removing item:", error);
    }
  };

  const handleCheckout = () => {
    // Open payment popup instead of navigating
    setShowPaymentPopup(true);
  };

  const handlePaymentSuccess = (orderData) => {
    setShowPaymentPopup(false);
    showNotification("Order placed successfully! Redirecting...", "success");
    navigate("/orders");
  };

  const handleApplyPromoCode = async () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      setPromoMessage("Please enter a promo code.");
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/promo`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ promoCode: code }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to apply promo code");

      setCart(data);
      if (data.promoCode === "CROW10") {
        setPromoMessage("Promo applied! 10% discount.");
      } else {
        setPromoMessage("Invalid promo code.");
      }
    } catch (err) {
      setPromoMessage(err.message || "Something went wrong.");
      console.error(err);
    }
  };

  // --- RENDER LOGIC ---
  if (loading) return <div className="text-center p-10">Loading your cart...</div>;

  const validItems = cart ? cart.items.filter((item) => item.productId) : [];

  if (!cart || validItems.length === 0) {
    return (
      <div className="text-center p-10 space-y-4">
        <h1 className="text-3xl font-bold">Your Cart is Empty</h1>
        <p className="text-gray-500">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/" className="inline-block bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-700">
          Start Shopping
        </Link>
      </div>
    );
  }

  const cartTotal = validItems.reduce((total, item) => total + item.quantity * item.productId.price, 0);
  const discountAmount = cart?.promoCode === "CROW10" ? cartTotal * 0.1 : 0;
  const discountedTotal = cartTotal - discountAmount;

  return (
    <>
      <div className="container mx-auto py-12 px-4">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-12 text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text animate-slide-down text-center">Shopping Cart</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-6 animate-slide-in-left">
              {validItems.map((item, index) => (
                <div key={item.productId._id + item.size + item.color} className="group flex items-center bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-500 border-2 border-gray-100 hover:border-indigo-200 animate-cart-item overflow-hidden relative" style={{ animationDelay: `${index * 0.1}s` }}>
                  {/* Background Decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-50/50 to-purple-50/50 rounded-full transform translate-x-16 -translate-y-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Product Image */}
                  <div className="relative">
                    <img src={item.productId.imageUrl} alt={item.productId.name} className="w-28 h-28 object-contain rounded-xl mr-8 bg-gradient-to-br from-gray-50 to-gray-100 p-2 shadow-md group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-lg animate-bounce-in">{item.quantity}</div>
                  </div>

                  {/* Product Details */}
                  <div className="flex-grow relative z-10">
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300 mb-2">{item.productId.name}</h2>

                    {(item.size || item.color) && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {item.size && <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 group-hover:bg-blue-200 transition-colors duration-200">Size: {item.size}</span>}
                        {item.color && <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 group-hover:bg-purple-200 transition-colors duration-200">Color: {item.color}</span>}
                      </div>
                    )}

                    <p className="text-base text-gray-600 font-medium">
                      Quantity: <span className="text-indigo-600 font-bold">{item.quantity}</span>
                    </p>
                  </div>

                  {/* Price and Actions */}
                  <div className="text-right relative z-10">
                    <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text mb-3">${(item.quantity * item.productId.price).toFixed(2)}</p>
                    <button onClick={() => handleRemoveItem(item)} className="group/btn inline-flex items-center space-x-2 text-sm text-red-500 hover:text-red-700 font-bold px-3 py-2 rounded-lg hover:bg-red-50 transition-all duration-200 transform hover:scale-105">
                      <svg className="w-4 h-4 group-hover/btn:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Card */}
            <div className="lg:col-span-1 animate-slide-in-right">
              <div className="bg-white/95 backdrop-blur-xl border-2 border-gray-100 rounded-3xl shadow-2xl p-8 sticky top-24 hover:shadow-3xl transition-shadow duration-500 overflow-hidden relative">
                {/* Background Gradient */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-indigo-50 to-purple-50 rounded-full transform translate-x-20 -translate-y-20 opacity-50"></div>

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-center space-x-3 mb-6 pb-6 border-b-2 border-gray-100">
                    <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-gray-800">Order Summary</h2>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-4 text-gray-700">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-lg">Subtotal</span>
                      <span className="text-xl font-semibold">${cartTotal.toFixed(2)}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between items-center py-2 animate-bounce-in">
                        <span className="text-lg text-green-600 font-medium flex items-center space-x-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Discount (10%)</span>
                        </span>
                        <span className="text-xl font-bold text-green-600">-${discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center py-4 border-t-2 border-gray-100 mt-6">
                      <span className="text-2xl font-bold">Total</span>
                      <span className="text-3xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text animate-number-glow">${discountedTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Promo Code Section */}
                  <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-2xl border border-gray-100">
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                      <span>Promo Code</span>
                      <div className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                    </label>

                    <div className="flex space-x-3">
                      <div className="flex-1 relative">
                        <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-300 bg-white text-lg" placeholder="CROW10" />
                      </div>
                      <button onClick={handleApplyPromoCode} className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl hover:from-gray-900 hover:to-black transform hover:scale-105 active:scale-95 transition-all duration-200 font-bold shadow-lg hover:shadow-xl">
                        Apply
                      </button>
                    </div>

                    {promoMessage && (
                      <div className={`mt-3 p-3 rounded-lg flex items-center space-x-2 animate-message-appear ${discountAmount > 0 ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}>
                        {discountAmount > 0 ? (
                          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        <span className="font-medium">{promoMessage}</span>
                      </div>
                    )}
                  </div>

                  {/* Checkout Button */}
                  <button onClick={handleCheckout} className="group w-full mt-8 py-5 font-bold text-xl text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden relative">
                    {/* Button Background Animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-shimmer-infinite"></div>

                    <span className="relative flex items-center justify-center space-x-3">
                      <span>Proceed to Checkout</span>
                      <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center group-hover:rotate-180 transition-transform duration-500">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </span>

                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-16 group-hover:w-32 h-1 bg-white/30 rounded-full transition-all duration-300"></div>
                  </button>
                </div>
              </div>
            </div>
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

          @keyframes slide-down {
            from {
              opacity: 0;
              transform: translateY(-40px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slide-in-left {
            from {
              opacity: 0;
              transform: translateX(-50px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes slide-in-right {
            from {
              opacity: 0;
              transform: translateX(50px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes cart-item {
            from {
              opacity: 0;
              transform: translateY(30px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes bounce-in {
            from {
              opacity: 0;
              transform: scale(0.3);
            }
            50% {
              transform: scale(1.1);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes number-glow {
            0%,
            100% {
              filter: drop-shadow(0 0 5px rgba(99, 102, 241, 0.3));
            }
            50% {
              filter: drop-shadow(0 0 15px rgba(99, 102, 241, 0.6));
            }
          }

          @keyframes message-appear {
            from {
              opacity: 0;
              transform: translateY(-10px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
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

          .animate-fade-in {
            animation: fade-in 1s ease-out;
          }

          .animate-slide-down {
            animation: slide-down 1s ease-out 0.2s both;
          }

          .animate-slide-in-left {
            animation: slide-in-left 1s ease-out 0.4s both;
          }

          .animate-slide-in-right {
            animation: slide-in-right 1s ease-out 0.6s both;
          }

          .animate-cart-item {
            animation: cart-item 0.8s ease-out both;
          }

          .animate-bounce-in {
            animation: bounce-in 0.6s ease-out;
          }

          .animate-number-glow {
            animation: number-glow 2s ease-in-out infinite;
          }

          .animate-message-appear {
            animation: message-appear 0.5s ease-out;
          }

          .animate-shimmer-infinite {
            animation: shimmer-infinite 2s ease-in-out infinite;
          }
        `}</style>
      </div>

      {/* Payment Popup */}
      <PaymentPopup isOpen={showPaymentPopup} onClose={() => setShowPaymentPopup(false)} onSuccess={handlePaymentSuccess} cartTotal={cartTotal} discountedTotal={discountedTotal} userAddress={userAddress} />
    </>
  );
}

export default CartPage;
