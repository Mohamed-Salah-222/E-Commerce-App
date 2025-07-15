import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch order history.");
        }

        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  if (loading) return <div className="text-center p-10">Loading order history...</div>;

  if (orders.length === 0) {
    return (
      <div className="text-center p-10 space-y-4">
        <h1 className="text-3xl font-bold">You have no past orders.</h1>
        <p className="text-gray-500">Looks like you haven't made a purchase yet.</p>
        <Link to="/" className="inline-block bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-indigo-700">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">My Order History</h1>
      <div className="space-y-8">
        {orders.map((order) => (
          <div key={order._id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            {/* Order Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-200 pb-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Order Placed</p>
                <p className="font-semibold text-gray-800">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-left sm:text-right mt-4 sm:mt-0">
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-mono text-xs text-gray-700">{order._id}</p>
              </div>
            </div>

            {/* Order Body */}
            <div className="space-y-4">
              {order.products.map((item) => (
                <div key={item.productId?._id || item._id} className="flex items-center space-x-4">
                  <img src={item.productId?.imageUrl} alt={item.productId?.name || "Product Image"} className="w-16 h-16 object-contain rounded-md bg-gray-100" />
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-800">{item.productId?.name || "Product no longer available"}</p>
                    <p className="text-sm text-gray-500">
                      {item.size && `Size: ${item.size}`}
                      {item.size && item.color && ", "}
                      {item.color && `Color: ${item.color}`}
                    </p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-800">${(item.quantity * item.price).toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Order Footer */}
            <div className="border-t border-gray-200 mt-4 pt-4 text-right">
              {order.promoCode && (
                <div className="text-sm text-gray-600 mb-2">
                  <span>Subtotal:</span>
                  <span className="ml-2">${order.totalAmount.toFixed(2)}</span>
                </div>
              )}
              {order.promoCode && (
                <div className="text-sm text-green-600 mb-2">
                  <span>Discount ({order.promoCode}):</span>
                  <span className="ml-2">-${(order.totalAmount - order.discountedTotal).toFixed(2)}</span>
                </div>
              )}
              <div className="text-lg font-bold text-gray-900">
                <span>Total:</span>
                <span className="ml-2">${order.discountedTotal.toFixed(2)}</span>
              </div>
              <div className="mt-2">
                <span className="text-xs font-medium text-white bg-indigo-500 px-2 py-1 rounded-full">{order.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderHistoryPage;
