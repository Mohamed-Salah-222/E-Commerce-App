import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import Skeleton from "./Skeleton";

function CheckoutPage() {
  const [address, setAddress] = useState({ street: "", city: "", postalCode: "", country: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
        if (userData.address) setAddress(userData.address);
      } catch {
        setError("Could not load your address. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserAddress();
  }, [token]);

  const handleChange = (e) => {
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const addressResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/user/address`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(address),
      });
      if (!addressResponse.ok) throw new Error("Failed to save your address.");

      const orderResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!orderResponse.ok) throw new Error("Failed to create your order.");

      showNotification("Order placed successfully!", "success");
      navigate("/orders");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 focus:bg-white transition-colors";

  if (loading) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          {[1, 2].map((i) => (
            <div key={i}>
              <Skeleton className="h-3 w-24 mb-2" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i}>
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            ))}
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Checkout</h1>
      <p className="text-sm text-gray-500 mb-8">Confirm your shipping address to complete your order.</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="street" className="block text-sm font-medium text-gray-600 mb-1">
              Street Address
            </label>
            <input type="text" name="street" id="street" value={address.street} onChange={handleChange} required className={inputClass} />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-600 mb-1">
              City
            </label>
            <input type="text" name="city" id="city" value={address.city} onChange={handleChange} required className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-600 mb-1">
                Postal Code
              </label>
              <input type="text" name="postalCode" id="postalCode" value={address.postalCode} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-600 mb-1">
                Country
              </label>
              <input type="text" name="country" id="country" value={address.country} onChange={handleChange} required className={inputClass} />
            </div>
          </div>

          {error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">{error}</div>}

          <button type="submit" disabled={submitting} className="w-full py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50">
            {submitting ? "Processing..." : "Place Order"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CheckoutPage;
