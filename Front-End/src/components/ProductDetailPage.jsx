import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

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

    // Validation for size and color selection
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setMessage("Please select a size.");
      return;
    }

    if (product.colors && product.colors.length > 0 && !selectedColor) {
      setMessage("Please select a color.");
      return;
    }

    setMessage("Adding to cart...");

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

      setMessage("Item added to cart successfully!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      setMessage(error.message);
    }
  };

  if (loading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  if (!product) {
    return <div className="text-center p-10">Product not found.</div>;
  }

  return (
    <div className="container mx-auto mt-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="w-full">
          <img src={product.imageUrl} alt={product.name} className="w-full h-96 object-contain rounded-lg" />
        </div>

        <div className="flex flex-col h-full p-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-6 text-lg">{product.description}</p>

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
              <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                {product.sizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                {product.colors.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex-grow"></div>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
            <button onClick={handleAddToCart} className="px-6 py-3 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors duration-300">
              Add to Cart
            </button>
          </div>
          {message && <p className={`mt-4 text-center ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}>{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
