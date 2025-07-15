import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";

function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState("");

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

  useEffect(() => {
    setLoading(true);
    fetchCart();
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
      fetchCart(); // Re-fetch to update UI
    } catch (error) {
      showNotification("Error removing item.", "error");
      console.error("Error removing item:", error);
    }
  };

  const handleCheckout = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create order.");
      }
      showNotification("Order placed successfully!", "success");
      navigate("/orders");
    } catch (error) {
      showNotification(error.message, "error");
      console.error("Checkout error:", error);
    }
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

      setCart(data); // Update the cart state with the response
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
  const cartTotal = validItems.reduce((total, item) => total + item.quantity * item.productId.price, 0);
  const discountAmount = cart?.promoCode === "CROW10" ? cartTotal * 0.1 : 0;
  const discountedTotal = cartTotal - discountAmount;

  if (!cart || validItems.length === 0) {
    return (
      <div className="text-center p-10 space-y-4">
        <h1 className="text-3xl font-bold">Your Cart is Empty</h1>
        <p className="text-gray-500">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/" className="inline-block bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-indigo-700">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {validItems.map((item) => (
            <div key={item.productId._id + item.size + item.color} className="flex items-center bg-white p-4 rounded-xl shadow-md">
              <img src={item.productId.imageUrl} alt={item.productId.name} className="w-24 h-24 object-contain rounded-lg mr-4 bg-gray-100" />
              <div className="flex-grow">
                <h2 className="text-lg font-semibold">{item.productId.name}</h2>
                <p className="text-sm text-gray-500">
                  {item.size && `Size: ${item.size}`}
                  {item.size && item.color && ", "}
                  {item.color && `Color: ${item.color}`}
                </p>
                <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-800">${(item.quantity * item.productId.price).toFixed(2)}</p>
                <button onClick={() => handleRemoveItem(item)} className="text-xs text-red-500 hover:text-red-700 font-medium mt-1">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-lg sticky top-24">
            <h2 className="text-xl font-bold mb-4 border-b pb-4">Order Summary</h2>
            <div className="space-y-2 text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount (10%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-4 mt-4">
                <span>Total</span>
                <span>${discountedTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Promo Code</label>
              <div className="flex space-x-2">
                <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} className="w-full p-2 border rounded-md" placeholder="CROW10" />
                <button onClick={handleApplyPromoCode} className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900">
                  Apply
                </button>
              </div>
              {promoMessage && <p className={`mt-2 text-xs ${discountAmount > 0 ? "text-green-600" : "text-red-600"}`}>{promoMessage}</p>}
            </div>

            <button onClick={handleCheckout} className="w-full mt-6 py-3 font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:opacity-90 transition-opacity">
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
