import React, { useState, useEffect } from "react";
import { Search, Filter, Eye, Package, Truck, CheckCircle, Clock, AlertCircle, X } from "lucide-react";

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const statusOptions = [
    { value: "processing", label: "Processing", color: "bg-yellow-100 text-yellow-800", icon: Clock },
    { value: "shipped", label: "Shipped", color: "bg-blue-100 text-blue-800", icon: Truck },
    { value: "delivered", label: "Delivered", color: "bg-green-100 text-green-800", icon: CheckCircle },
    { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800", icon: X },
  ];

  const getStatusInfo = (status) => {
    return statusOptions.find((option) => option.value === status) || statusOptions[0];
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token"); 

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      const token = localStorage.getItem("token");

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderStatus: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      const updatedOrder = await response.json();

      setOrders(orders.map((order) => (order._id === orderId ? { ...order, ...updatedOrder, userId: order.userId, user: order.user } : order)));

      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, ...updatedOrder, userId: selectedOrder.userId, user: selectedOrder.user });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase()) || order.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) || order._id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };


  const getUserData = (order) => {

    const user = order.userId || order.user;
    return {
      username: user?.username || "N/A",
      email: user?.email || "N/A",
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-red-700">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 p-6 space-y-10">
 
      <div className="backdrop-blur-md bg-white/80 rounded-3xl p-8 shadow-xl border border-white/20">
        <div className="text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-4 tracking-tight">Order Management</h1>
          <p className="text-slate-600 text-lg font-medium">Manage and track all customer orders with style</p>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mx-auto mt-4"></div>
        </div>
      </div>

  
      <div className="backdrop-blur-md bg-white/90 rounded-3xl p-8 shadow-xl border border-white/20">
        <div className="flex flex-col md:flex-row gap-6">

          <div className="flex-1">
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors duration-300 group-focus-within:text-purple-500">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-purple-500" />
              </div>
              <input type="text" placeholder="Search by customer name or order ID..." className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-lg placeholder-slate-400 shadow-sm hover:shadow-md" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

     
          <div className="md:w-56">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-6 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-lg font-medium shadow-sm hover:shadow-md">
              <option value="all">All Statuses</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/50">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
              <tr>
                <th className="px-8 py-6 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Order ID</th>
                <th className="px-8 py-6 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Customer</th>
                <th className="px-8 py-6 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Date</th>
                <th className="px-8 py-6 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Total</th>
                <th className="px-8 py-6 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Status</th>
                <th className="px-8 py-6 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredOrders.map((order, index) => {
                const statusInfo = getStatusInfo(order.orderStatus);
                const StatusIcon = statusInfo.icon;
                const userData = getUserData(order);

                return (
                  <tr key={order._id} className={`group transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 ${index !== filteredOrders.length - 1 ? "border-b border-slate-100" : ""}`}>
                    <td className="px-8 py-6">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="text-sm font-mono font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">#{order._id.slice(-8).toUpperCase()}</div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <div className="text-sm font-semibold text-slate-900 group-hover:text-purple-700 transition-colors duration-300">{userData.username}</div>
                        <div className="text-sm text-slate-500">{userData.email}</div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-medium text-slate-700">{formatDate(order.createdAt)}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">{formatCurrency(order.totalAmount)}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-md backdrop-blur-sm ${statusInfo.color} transition-all duration-300 hover:scale-105`}>
                        <StatusIcon className="w-4 h-4 mr-2" />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-3">
    
                        <select value={order.orderStatus} onChange={(e) => updateOrderStatus(order._id, e.target.value)} disabled={updatingOrderId === order._id} className="text-sm border-2 border-slate-200 rounded-xl px-3 py-2 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 font-medium shadow-sm hover:shadow-md disabled:opacity-50">
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>

                        <button onClick={() => setSelectedOrder(order)} className="group/btn relative p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-110">
                          <Eye className="w-4 h-4 transition-transform duration-300 group-hover/btn:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 rounded-xl"></div>
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
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full mb-8">
              <Package className="w-14 h-14 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-600 mb-3">No orders found</h3>
            <p className="text-slate-500 text-lg max-w-md mx-auto">{searchTerm || statusFilter !== "all" ? "Try adjusting your search or filter criteria to find what you're looking for." : "No orders have been placed yet. Once customers start ordering, they'll appear here."}</p>
          </div>
        )}
      </div>


      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
  
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-6 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-white">Order Details</h3>
                <div className="text-purple-100 font-mono text-lg">#{selectedOrder._id.slice(-8).toUpperCase()}</div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-white hover:bg-white/20 rounded-xl transition-all duration-300 transform hover:scale-110">
                <X className="w-6 h-6" />
              </button>
            </div>


            <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
 
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                  <h4 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Customer Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-blue-600 font-medium">Name:</span>
                      <span className="text-blue-900 font-semibold">{getUserData(selectedOrder).username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-600 font-medium">Email:</span>
                      <span className="text-blue-900 font-semibold">{getUserData(selectedOrder).email}</span>
                    </div>
                  </div>
                </div>


                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                  <h4 className="text-lg font-bold text-green-800 mb-4 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Order Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-green-600 font-medium">Date:</span>
                      <span className="text-green-900 font-semibold">{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600 font-medium">Total:</span>
                      <span className="text-green-900 font-bold text-xl">{formatCurrency(selectedOrder.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600 font-medium">Status:</span>
                      <span className="text-green-900 font-semibold">{getStatusInfo(selectedOrder.orderStatus).label}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
                <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                  <div className="w-2 h-2 bg-slate-500 rounded-full mr-2"></div>
                  Order Items
                </h4>
                <div className="space-y-4">
                  {selectedOrder.products?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300">
                      <div className="flex-1">
                        <p className="text-lg font-bold text-slate-900 mb-1">{item.productId?.name || "Product"}</p>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full font-medium">Qty: {item.quantity}</span>
                          <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full font-medium">Unit: {formatCurrency(item.price)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Package className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500 text-lg">No items found in this order</p>
                    </div>
                  )}
                </div>


                {selectedOrder.products && selectedOrder.products.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-slate-800">Order Total:</span>
                      <span className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{formatCurrency(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
