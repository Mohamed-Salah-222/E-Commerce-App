import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";

function ProductCard({ product }) {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const isOutOfStock = product.status === "out_of_stock";

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }
    if (isOutOfStock) {
      showNotification("This product is currently out of stock", "error");
      return;
    }

    const size = product.sizes?.length > 0 ? product.sizes[0] : null;
    const color = product.colors?.length > 0 ? product.colors[0] : null;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId: product._id, quantity: 1, size, color }),
      });
      if (!response.ok) throw new Error("Failed to add item to cart.");
      showNotification(`Added "${product.name}" to your cart!`, "success");
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const content = (
    <>
      <div className="aspect-square w-full overflow-hidden bg-gray-50 relative">
        <img src={product.imageUrl} alt={product.name} className={`w-full h-full object-contain transition-transform duration-300 ${isOutOfStock ? "grayscale opacity-50" : "group-hover:scale-105"}`} />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-gray-900/30 flex items-center justify-center">
            <span className="bg-gray-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className={`text-sm font-semibold transition-colors ${isOutOfStock ? "text-gray-500" : "text-gray-900 group-hover:text-gray-600"}`}>{product.name}</h3>
        <p className={`mt-1.5 text-lg font-bold ${isOutOfStock ? "text-gray-400" : "text-gray-900"}`}>${product.price.toFixed(2)}</p>
      </div>
    </>
  );

  return (
    <div className={`group relative bg-white border rounded-xl overflow-hidden transition-all duration-200 ${isOutOfStock ? "border-gray-200 bg-gray-50 cursor-not-allowed" : "border-gray-200 hover:shadow-lg hover:border-gray-300"}`}>
      {isOutOfStock ? <div>{content}</div> : <Link to={`/products/${product._id}`}>{content}</Link>}
      {!isOutOfStock && (
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={handleAddToCart} className="p-2.5 bg-gray-900 rounded-full text-white shadow-lg hover:bg-gray-800 transition-colors" aria-label="Add to cart">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.922.778h9.449a.997.997 0 00.922-.778L16.78 3H18a1 1 0 000-2H3zM5.093 7l.21 1a1 1 0 00.927.75h9.54a1 1 0 00.927-.75l.21-1H5.093zM5.5 13a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm9 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductCard;
