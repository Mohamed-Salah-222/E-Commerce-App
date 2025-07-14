import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

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
  if (orders.length === 0) return <div className="text-center p-10">You have no past orders.</div>;

  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">My Order History</h1>
      <div className="space-y-8">
        {orders.map((order) => (
          <div key={order._id} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <div>
                <h2 className="text-lg font-semibold">Order ID: {order._id}</h2>
                <p className="text-sm text-gray-600">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right space-y-1">
                {order.discount > 0 && (
                  <>
                    <p className="text-sm text-gray-500 line-through">${order.totalAmount.toFixed(2)}</p>
                    <p className="text-sm text-green-600">
                      Promo <strong>{order.promoCode}</strong> applied ({(order.discount * 100).toFixed(0)}% off)
                    </p>
                  </>
                )}
                <p className="text-lg font-bold">${order.discountedTotal?.toFixed(2) ?? order.totalAmount.toFixed(2)}</p>
                <span className="text-sm font-medium text-white bg-green-500 px-2 py-1 rounded-full">{order.status}</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Items:</h3>
              <ul className="space-y-2">
                {order.products.map((item) => (
                  <li key={item.productId?._id || Math.random()} className="flex justify-between items-center text-sm">
                    <span>
                      {item.productId?.name || "Product not available"}
                      <span className="text-gray-500"> (x{item.quantity})</span>
                    </span>
                    <span className="text-gray-700">${(item.quantity * item.price).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderHistoryPage;
