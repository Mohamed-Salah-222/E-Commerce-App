import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import Skeleton from "./Skeleton";

const STATUS_OPTIONS = [
  { value: "processing", label: "Processing", style: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "shipped", label: "Shipped", style: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "delivered", label: "Delivered", style: "bg-green-50 text-green-700 border-green-200" },
  { value: "cancelled", label: "Cancelled", style: "bg-red-50 text-red-700 border-red-200" },
];

const getStatusStyle = (status) => STATUS_OPTIONS.find((o) => o.value === status)?.style || STATUS_OPTIONS[0].style;

const getStatusLabel = (status) => STATUS_OPTIONS.find((o) => o.value === status)?.label || status;

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatCurrency = (amount) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

const getUserData = (order) => {
  const user = order.userId || order.user;
  return { username: user?.username || "N/A", email: user?.email || "N/A" };
};

function AdminOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) throw new Error("Failed to fetch orders");
        setOrders(await response.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      if (!response.ok) throw new Error("Failed to update order status");

      const updatedOrder = await response.json();
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, ...updatedOrder, userId: o.userId, user: o.user } : o)));
      if (selectedOrder?._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, ...updatedOrder, userId: prev.userId, user: prev.user }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = order.userId?.username?.toLowerCase().includes(term) || order.user?.username?.toLowerCase().includes(term) || order._id.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || order.orderStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="flex gap-4">
          <Skeleton className="h-11 flex-1 max-w-md rounded-xl" />
          <Skeleton className="h-11 w-40 rounded-xl" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-6 bg-white rounded-xl p-5 border border-gray-100">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-700 text-sm font-medium">Error: {error}</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
        <p className="text-sm text-gray-500 mt-1">{orders.length} total orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input type="text" placeholder="Search by customer or order ID..." className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-900/10">
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const userData = getUserData(order);
                return (
                  <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">#{order._id.slice(-8).toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{userData.username}</p>
                      <p className="text-xs text-gray-500">{userData.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(order.createdAt)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(order.orderStatus)}`}>{getStatusLabel(order.orderStatus)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <select value={order.orderStatus} onChange={(e) => updateOrderStatus(order._id, e.target.value)} disabled={updatingOrderId === order._id} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-900/10 disabled:opacity-50">
                          {STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        <button onClick={() => setSelectedOrder(order)} className="px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors">
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 font-medium">No orders found</p>
            <p className="text-sm text-gray-400 mt-1">{searchTerm || statusFilter !== "all" ? "Try adjusting your search or filter" : "No orders have been placed yet"}</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Order Details</h3>
                <p className="text-xs font-mono text-gray-500">#{selectedOrder._id.slice(-8).toUpperCase()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)] space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">Customer</p>
                  <p className="text-sm font-semibold text-gray-900">{getUserData(selectedOrder).username}</p>
                  <p className="text-xs text-gray-500">{getUserData(selectedOrder).email}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">Order Info</p>
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(selectedOrder.totalAmount)}</p>
                  <p className="text-xs text-gray-500">{formatDate(selectedOrder.createdAt)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3">Items</p>
                <div className="space-y-3">
                  {selectedOrder.products?.map((item, i) => (
                    <div key={i} className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.productId?.name || "Product"}</p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity} x {formatCurrency(item.price)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-sm font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(selectedOrder.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrdersPage;
