import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext"; // 1. Import notification hook

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { showNotification } = useNotification(); // 2. Get the notification function

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  // We no longer need the local 'message' state

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
        if (!response.ok) {
          throw new Error("Product not found");
        }
        const data = await response.json();
        setProduct(data);

        // Set default selections
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
        if (data.colors && data.colors.length > 0) {
          setSelectedColor(data.colors[0]);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      showNotification("Please select a size.", "error");
      return;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      showNotification("Please select a color.", "error");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
          size: selectedSize || null,
          color: selectedColor || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add item to cart.");
      }

      // 3. Use the global notification for success
      showNotification(`Added "${product.name}" to your cart!`, "success");
    } catch (error) {
      console.error("Error adding to cart:", error);
      // And for errors
      showNotification(error.message, "error");
    }
  };

  if (loading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  if (!product) {
    return <div className="text-center p-10">Product not found.</div>;
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 backdrop-blur-sm bg-opacity-95 transform hover:shadow-3xl transition-all duration-500 animate-fade-in-up border border-gray-100">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Column */}
        <div className="w-full group">
          <div className="aspect-w-1 aspect-h-1 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden relative shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-700 ease-out" />
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <div className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                <div className="w-3 h-3 border-2 border-indigo-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Column */}
        <div className="flex flex-col animate-slide-in-right">
          <div className="relative">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent leading-tight">{product.name}</h1>
            <div className="absolute -bottom-1 left-0 w-12 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-expand"></div>
          </div>

          <div className="mt-6 relative">
            <p className="text-3xl font-bold text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text animate-number-glow">${product.price.toFixed(2)}</p>
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75"></div>
          </div>

          <p className="mt-6 text-gray-600 text-base leading-relaxed opacity-0 animate-fade-in-delayed">{product.description}</p>

          <div className="mt-8 space-y-6 animate-slide-up-delayed">
            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                  <span>Size</span>
                  <div className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size, index) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`group relative px-5 py-3 border-2 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 font-medium shadow-sm hover:shadow-md animate-bounce-in ${
                        selectedSize === size ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-500/25" : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50"
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <span className="relative z-10">{size}</span>
                      {selectedSize === size && <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl animate-shimmer"></div>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                  <span>Color</span>
                  <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color, index) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`group relative px-5 py-3 border-2 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 font-medium shadow-sm hover:shadow-md animate-bounce-in ${
                        selectedColor === color ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-lg shadow-purple-500/25" : "bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50"
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <span className="relative z-10">{color}</span>
                      {selectedColor === color && <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl animate-shimmer"></div>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Add to Cart Button */}
          <div className="mt-10 animate-fade-in-up-delayed">
            <button
              onClick={handleAddToCart}
              className="group relative w-full px-8 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold rounded-2xl hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-offset-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-shimmer-infinite"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

              <span className="relative flex items-center justify-center space-x-3">
                <span className="text-lg">Add to Cart</span>
                <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center group-hover:rotate-180 transition-transform duration-500">
                  <div className="w-2 h-2 bg-white rounded-full transform group-hover:scale-150 transition-transform duration-300"></div>
                </div>
              </span>

              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white/30 rounded-full group-hover:w-16 transition-all duration-300"></div>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-up-delayed {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-delayed {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up-delayed {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes expand {
          from {
            width: 0;
          }
          to {
            width: 3rem;
          }
        }

        @keyframes bounce-in {
          from {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            transform: scale(1.05);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes shimmer-infinite {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
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

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.8s ease-out 0.2s both;
        }

        .animate-slide-up-delayed {
          animation: slide-up-delayed 0.6s ease-out 0.4s both;
        }

        .animate-fade-in-delayed {
          animation: fade-in-delayed 0.6s ease-out 0.6s both;
        }

        .animate-fade-in-up-delayed {
          animation: fade-in-up-delayed 0.6s ease-out 0.8s both;
        }

        .animate-expand {
          animation: expand 0.8s ease-out 0.3s both;
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out both;
        }

        .animate-shimmer {
          animation: shimmer 1s ease-in-out;
        }

        .animate-shimmer-infinite {
          animation: shimmer-infinite 2s ease-in-out infinite;
        }

        .animate-number-glow {
          animation: number-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default ProductDetailPage;
