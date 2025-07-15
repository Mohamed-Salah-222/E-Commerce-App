import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

function ProductCard({ product }) {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    const size = product.sizes && product.sizes.length > 0 ? product.sizes[0] : null;
    const color = product.colors && product.colors.length > 0 ? product.colors[0] : null;

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
          size: size,
          color: color,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add item to cart.");
      }

      showNotification(`Added "${product.name}" to your cart!`, "success");
    } catch (error) {
      console.error("Error adding to cart:", error);

      showNotification("Error: Could not add item to cart.", "error");
    }
  };

  return (
    <div className="group relative border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      <Link to={`/products/${product._id}`} className="block">
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-100">
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-300" />
        </div>

        <div className="p-4">
          <h3 className="text-md font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">{product.name}</h3>
          <p className="mt-2 text-lg font-bold text-gray-900">${product.price.toFixed(2)}</p>
        </div>
      </Link>

      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button onClick={handleAddToCart} className="p-2 bg-indigo-600 rounded-full text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-label="Add to cart">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.922.778h9.449a.997.997 0 00.922-.778L16.78 3H18a1 1 0 000-2H3zM5.093 7l.21 1a1 1 0 00.927.75h9.54a1 1 0 00.927-.75l.21-1H5.093zM5.5 13a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm9 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
