import { Link } from "react-router-dom";

function ProductCard({ product }) {
  return (
    <Link to={`/products/${product._id}`} className="product-link group">
      <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 bg-white flex flex-col h-full">
        <div className="overflow-hidden">
          <img src={product.imageUrl} alt={product.name} className="w-full  object-contain" />
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <h2 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h2>
          <p className="text-xl font-bold text-gray-900 mt-4">${product.price.toFixed(2)}</p>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
