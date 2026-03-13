import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import PaymentPopup from "./PaymentPopup";
import Skeleton from "./Skeleton";

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
    } catch {
      // Cart may not exist yet
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
    } catch {
      // Address is optional
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchCart();
    fetchUserAddress();
  }, [token]);

  const handleRemoveItem = async (itemToRemove) => {
    try {
      const params = new URLSearchParams({
        size: itemToRemove.size || "",
        color: itemToRemove.color || "",
      });
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/items/${itemToRemove.productId._id}?${params.toString()}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error("Failed to remove item");
      showNotification("Item removed from cart.", "success");
      fetchCart();
    } catch {
      showNotification("Error removing item.", "error");
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentPopup(false);
    showNotification("Order placed successfully!", "success");
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
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ promoCode: code }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to apply promo code");
      setCart(data);
      setPromoMessage(data.promoCode === "CROW10" ? "Promo applied! 10% discount." : "Invalid promo code.");
    } catch (err) {
      setPromoMessage(err.message || "Something went wrong.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4">
                <Skeleton className="h-20 w-20 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const validItems = cart ? cart.items.filter((item) => item.productId) : [];

  if (!cart || validItems.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-5xl mb-4">🛒</p>
        <h1 className="text-2xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="text-gray-500 mt-2">Add some products to get started.</p>
        <Link to="/" className="inline-block mt-6 px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  const cartTotal = validItems.reduce((t, item) => t + item.quantity * item.productId.price, 0);
  const discountAmount = cart?.promoCode === "CROW10" ? cartTotal * 0.1 : 0;
  const discountedTotal = cartTotal - discountAmount;

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {validItems.map((item) => (
              <div key={item.productId._id + item.size + item.color} className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4">
                <img src={item.productId.imageUrl} alt={item.productId.name} className="w-20 h-20 object-contain rounded-lg bg-gray-50" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{item.productId.name}</h3>
                  {(item.size || item.color) && (
                    <div className="flex gap-2 mt-1">
                      {item.size && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Size: {item.size}</span>}
                      {item.color && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Color: {item.color}</span>}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">${(item.quantity * item.productId.price).toFixed(2)}</p>
                  <button onClick={() => handleRemoveItem(item)} className="text-xs text-red-500 hover:text-red-700 font-medium mt-1 transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24 space-y-5">
              <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${cartTotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount (10%)</span>
                    <span className="font-medium">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-gray-100 text-base">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-gray-900">${discountedTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Promo Code */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Promo Code</p>
                <div className="flex gap-2 w-full">
                  <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" placeholder="CROW10" />
                  <button onClick={handleApplyPromoCode} className="px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors shrink-0">
                    Apply
                  </button>
                </div>
                {promoMessage && <p className={`text-xs mt-2 font-medium ${discountAmount > 0 ? "text-green-600" : "text-red-500"}`}>{promoMessage}</p>}
              </div>

              <button onClick={() => setShowPaymentPopup(true)} className="w-full py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors">
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>

      <PaymentPopup isOpen={showPaymentPopup} onClose={() => setShowPaymentPopup(false)} onSuccess={handlePaymentSuccess} cartTotal={cartTotal} discountedTotal={discountedTotal} userAddress={userAddress} />
    </>
  );
}

export default CartPage;
