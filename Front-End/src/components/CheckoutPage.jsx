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
    <div className="flex justify-center items-start py-12 bg-gray-50">
      <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800">Checkout</h1>
        <p className="text-center text-gray-500">Please confirm your shipping address.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
         
          <div>
            <label htmlFor="street" className="block text-sm font-medium text-gray-700">
              Street Address
            </label>
            <input type="text" name="street" id="street" value={address.street} onChange={handleChange} required className="w-full mt-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input type="text" name="city" id="city" value={address.city} onChange={handleChange} required className="w-full mt-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                Postal Code
              </label>
              <input type="text" name="postalCode" id="postalCode" value={address.postalCode} onChange={handleChange} required className="w-full mt-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <input type="text" name="country" id="country" value={address.country} onChange={handleChange} required className="w-full mt-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          {error && <p className="text-sm text-center text-red-600">{error}</p>}

          <div>
            <button type="submit" disabled={loading} className="w-full px-4 py-3 font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50">
              {loading ? "Processing..." : "Place Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CheckoutPage;
