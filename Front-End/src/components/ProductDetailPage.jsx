import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import Skeleton from "./Skeleton";

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { showNotification } = useNotification();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
        if (!response.ok) throw new Error("Product not found");
        const data = await response.json();
        setProduct(data);
        if (data.sizes?.length > 0) setSelectedSize(data.sizes[0]);
        if (data.colors?.length > 0) setSelectedColor(data.colors[0]);
      } catch {
        setProduct(null);
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
    if (product.sizes?.length > 0 && !selectedSize) {
      showNotification("Please select a size.", "error");
      return;
    }
    if (product.colors?.length > 0 && !selectedColor) {
      showNotification("Please select a color.", "error");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
          size: selectedSize || null,
          color: selectedColor || null,
        }),
      });
      if (!response.ok) throw new Error("Failed to add item to cart.");
      showNotification(`Added "${product.name}" to your cart!`, "success");
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        <Skeleton className="aspect-square rounded-2xl" />
        <div className="space-y-4 py-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-7 w-24" />
          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="flex gap-2 pt-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-16 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-13 w-full rounded-xl mt-6" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-900 font-semibold text-lg">Product not found</p>
        <p className="text-gray-500 mt-1">This product may have been removed.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Image */}
          <div className="bg-gray-50 p-8 flex items-center justify-center">
            <img src={product.imageUrl} alt={product.name} className="w-full max-h-[500px] object-contain" />
          </div>

          {/* Details */}
          <div className="p-8 flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-2xl font-bold text-gray-900 mt-3">${product.price.toFixed(2)}</p>
            <p className="mt-4 text-gray-600 leading-relaxed">{product.description}</p>

            <div className="mt-8 space-y-5">
              {product.sizes?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button key={size} onClick={() => setSelectedSize(size)} className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${selectedSize === size ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"}`}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.colors?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Color</p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button key={color} onClick={() => setSelectedColor(color)} className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${selectedColor === color ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"}`}>
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-auto pt-8">
              <button onClick={handleAddToCart} className="w-full py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
