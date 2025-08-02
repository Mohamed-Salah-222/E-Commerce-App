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
    <div className="container mx-auto py-8 px-4">
      <div className="animate-fade-in">
        <h1 className="text-4xl font-bold mb-12 text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text animate-slide-down">My Order History</h1>

        <div className="space-y-8">
          {orders.map((order, orderIndex) => (
            <div key={order._id} className="group bg-white p-8 rounded-3xl shadow-xl border-2 border-gray-100 hover:border-indigo-200 hover:shadow-2xl transform hover:scale-[1.01] transition-all duration-500 backdrop-blur-sm bg-opacity-95 animate-slide-up overflow-hidden relative" style={{ animationDelay: `${orderIndex * 0.1}s` }}>
              {/* Background Gradient */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-50 to-purple-50 rounded-full transform translate-x-16 -translate-y-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Order Header */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b-2 border-gradient-to-r from-gray-100 to-gray-200 pb-6 mb-6 relative">
                <div className="absolute left-0 bottom-0 w-0 group-hover:w-20 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"></div>

                <div className="relative">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Order Placed</p>
                  <p className="font-bold text-xl text-gray-800 mt-1 group-hover:text-indigo-600 transition-colors duration-300">{new Date(order.createdAt).toLocaleDateString()}</p>
                  <div className="absolute -left-2 top-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <div className="text-left sm:text-right mt-6 sm:mt-0 relative">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Order ID</p>
                  <p className="font-mono text-sm text-gray-700 mt-1 p-2 bg-gray-50 rounded-lg border group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-all duration-300">{order._id}</p>
                </div>
              </div>

              {/* Order Body */}
              <div className="space-y-6">
                {order.products.map((item, itemIndex) => (
                  <div key={item.productId?._id || item._id} className="flex items-center space-x-6 p-4 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-indigo-50 transition-all duration-300 group/item animate-fade-in-item" style={{ animationDelay: `${orderIndex * 0.1 + itemIndex * 0.05}s` }}>
                    <div className="relative">
                      <img src={item.productId?.imageUrl} alt={item.productId?.name || "Product Image"} className="w-20 h-20 object-contain rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-md group-hover/item:scale-105 transition-transform duration-300" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-indigo-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">{item.quantity}</div>
                    </div>

                    <div className="flex-grow">
                      <p className="font-bold text-lg text-gray-800 group-hover/item:text-indigo-600 transition-colors duration-300">{item.productId?.name || "Product no longer available"}</p>

                      {(item.size || item.color) && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {item.size && <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 group-hover/item:bg-blue-200 transition-colors duration-200">Size: {item.size}</span>}
                          {item.color && <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 group-hover/item:bg-purple-200 transition-colors duration-200">Color: {item.color}</span>}
                        </div>
                      )}

                      <p className="text-sm text-gray-500 mt-2 font-medium">Quantity: {item.quantity}</p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-xl text-gray-800 group-hover/item:text-transparent group-hover/item:bg-gradient-to-r group-hover/item:from-indigo-600 group-hover/item:to-purple-600 group-hover/item:bg-clip-text transition-all duration-300">${(item.quantity * item.price).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="border-t-2 border-gray-100 mt-8 pt-6 relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>

                <div className="text-right space-y-3">
                  {order.promoCode && (
                    <div className="text-base text-gray-600 flex justify-end items-center animate-fade-in">
                      <span className="mr-4">Subtotal:</span>
                      <span className="font-semibold">${order.totalAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {order.promoCode && (
                    <div className="text-base text-green-600 flex justify-end items-center animate-fade-in">
                      <span className="mr-4">
                        Discount
                        <span className="ml-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">{order.promoCode}</span>:
                      </span>
                      <span className="font-semibold">-${(order.totalAmount - order.discountedTotal).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="text-2xl font-bold text-gray-900 flex justify-end items-center pt-2 animate-number-glow">
                    <span className="mr-4">Total:</span>
                    <span className="text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">${order.discountedTotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-end mt-4">
                    <span
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide shadow-lg transform hover:scale-105 transition-all duration-200 ${
                        order.status === "delivered" ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white" : order.status === "processing" ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white" : order.status === "shipped" ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white" : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                      }`}
                    >
                      <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Corner Decoration */}
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/5 to-transparent rounded-full transform -translate-x-12 translate-y-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-item {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes number-glow {
          0%,
          100% {
            filter: drop-shadow(0 0 5px rgba(99, 102, 241, 0.3));
          }
          50% {
            filter: drop-shadow(0 0 15px rgba(99, 102, 241, 0.6));
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.8s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out both;
        }

        .animate-fade-in-item {
          animation: fade-in-item 0.6s ease-out both;
        }

        .animate-number-glow {
          animation: number-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default OrderHistoryPage;
