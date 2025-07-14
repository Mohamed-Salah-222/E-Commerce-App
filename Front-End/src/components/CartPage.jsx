// frontend/src/components/CartPage.jsx (Final, Robust Version)
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");

  const { token } = useAuth();
  const navigate = useNavigate();

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

      if (data.promoCode === "CROW10") {
        setDiscount(0.1);
        setPromoMessage("Promo applied! 10% discount.");
      } else {
        setDiscount(0);
        setPromoMessage("");
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

  const handleRemoveItem = async (itemToRemove) => {
    // This function now correctly passes the whole item object
    if (!itemToRemove.productId) return; // Safety check
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
      fetchCart();
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleCheckout = async () => {
    setMessage("Processing your order...");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create order.");
      }
      navigate("/orders");
    } catch (error) {
      console.error("Checkout error:", error);
      setMessage(error.message);
    }
  };

  const handleApplyPromoCode = async () => {
    const code = promoCode.trim().toUpperCase();
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
      if (!response.ok) {
        throw new Error(data.message || "Failed to apply promo code");
      }
      setCart(data);
      if (data.promoCode === "CROW10") {
        setDiscount(0.1);
        setPromoMessage("Promo applied! 10% discount.");
      } else {
        setDiscount(0);
        setPromoMessage("Invalid promo code.");
      }
    } catch (err) {
      console.error(err);
      setDiscount(0);
      setPromoMessage(err.message || "Something went wrong applying promo.");
    }
  };

  if (loading) return <div className="text-center p-10">Loading your cart...</div>;

  // --- NEW SAFETY CHECK ---
  // We filter out any items where the product might have been deleted.
  const validItems = cart ? cart.items.filter((item) => item.productId) : [];

  if (!cart || validItems.length === 0) return <div className="text-center p-10">Your shopping cart is empty.</div>;

  const cartTotal = validItems.reduce((total, item) => {
    return total + item.quantity * item.productId.price;
  }, 0);

  const discountedTotal = cartTotal - cartTotal * discount;

  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {/* We now map over the 'validItems' array */}
          {validItems.map((item) => (
            <div key={item.productId._id + item.size + item.color} className="flex items-center bg-white p-4 rounded-lg shadow-sm">
              <img src={item.productId.imageUrl} alt={item.productId.name} className="w-20 h-20 object-cover rounded-md mr-4" />
              <div className="flex-grow">
                <h2 className="text-lg font-semibold">{item.productId.name}</h2>
                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                {item.size && <p className="text-sm text-gray-600">Size: {item.size}</p>}
                {item.color && <p className="text-sm text-gray-600">Color: {item.color}</p>}
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">${(item.quantity * item.productId.price).toFixed(2)}</p>
                {/* The button now correctly passes the whole item object */}
                <button onClick={() => handleRemoveItem(item)} className="text-sm text-red-500 hover:text-red-700 font-medium mt-2">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="md:col-span-1">
          {/* ... The cart summary JSX remains the same ... */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">Cart Summary</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Promo Code</label>
              <div className="flex space-x-2">
                <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} className="flex-1 p-2 border rounded-md" placeholder="Enter code" />
                <button onClick={handleApplyPromoCode} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Apply
                </button>
              </div>
              {promoMessage && <p className={`mt-2 text-sm ${discount > 0 ? "text-green-600" : "text-red-600"}`}>{promoMessage}</p>}
            </div>
            <div className="flex justify-between items-center border-t pt-4">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold">${discountedTotal.toFixed(2)}</span>
            </div>
            {discount > 0 && <p className="text-sm text-gray-500 text-right">(You saved ${(cartTotal * discount).toFixed(2)})</p>}
            <button onClick={handleCheckout} className="w-full mt-6 px-6 py-3 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors duration-300">
              Proceed to Checkout
            </button>
            {message && <p className="mt-4 text-center text-green-600">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
