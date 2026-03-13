import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import Skeleton from "../layout/Skeleton";

const STATUS_STYLES = {
  delivered: "bg-green-50 text-green-700 border-green-200",
  processing: "bg-amber-50 text-amber-700 border-amber-200",
  shipped: "bg-blue-50 text-blue-700 border-blue-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

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
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch order history.");
        setOrders(await response.json());
      } catch {
        // Orders will remain empty
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
            {[1, 2].map((j) => (
              <div key={j} className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
            <Skeleton className="h-6 w-24 rounded-full ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-5xl mb-4">📦</p>
        <h1 className="text-2xl font-bold text-gray-900">No orders yet</h1>
        <p className="text-gray-500 mt-2">Once you make a purchase, your orders will appear here.</p>
        <Link to="/" className="inline-block mt-6 px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Order header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div>
                <p className="text-xs text-gray-500">Order placed</p>
                <p className="text-sm font-semibold text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="mt-2 sm:mt-0">
                <p className="text-xs text-gray-500 sm:text-right">Order ID</p>
                <p className="text-xs font-mono text-gray-600">{order._id}</p>
              </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-gray-50">
              {order.products.map((item) => (
                <div key={item.productId?._id || item._id} className="flex items-center gap-4 px-6 py-4">
                  <img src={item.productId?.imageUrl} alt={item.productId?.name || "Product"} className="w-16 h-16 object-contain rounded-lg bg-gray-50" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.productId?.name || "Product no longer available"}</p>
                    {(item.size || item.color) && (
                      <div className="flex gap-2 mt-1">
                        {item.size && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Size: {item.size}</span>}
                        {item.color && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Color: {item.color}</span>}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">${(item.quantity * item.price).toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Order footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border capitalize ${STATUS_STYLES[order.status] || STATUS_STYLES.processing}`}>{order.status}</span>

              <div className="text-right">
                {order.promoCode && (
                  <p className="text-xs text-green-600 mb-1">
                    Promo: {order.promoCode} (-${(order.totalAmount - order.discountedTotal).toFixed(2)})
                  </p>
                )}
                <p className="text-lg font-bold text-gray-900">${order.discountedTotal.toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderHistoryPage;
