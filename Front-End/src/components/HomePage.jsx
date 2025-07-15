import { useState, useEffect } from "react";
import ProductList from "./ProductList";

function HomePage() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setAllProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  let displayedProducts = [...allProducts];

  if (searchTerm) {
    displayedProducts = displayedProducts.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }

  if (sortOption === "price_asc") {
    displayedProducts = [...displayedProducts].sort((a, b) => a.price - b.price);
  } else if (sortOption === "price_desc") {
    displayedProducts = [...displayedProducts].sort((a, b) => b.price - a.price);
  }

  const reviews = [
    {
      name: "Sarah A.",
      message: "Amazing products and super fast delivery! 💖💖",
    },
    {
      name: "Mohamed E.",
      message: "Customer service was very helpful. Will buy again!",
    },
    {
      name: "Lina K.",
      message: "Great quality and prices. Highly recommend.",
    },
  ];

  if (loading) {
    return <div className="text-center p-10">Loading products...</div>;
  }

  return (
    <div className="space-y-20">
      {/* --- Hero Section --- */}
      <div className="text-center py-20 px-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl shadow-sm">
        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Find Your Perfect Style</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">Browse our curated collection of high-quality apparel and accessories.</p>
        <div className="mt-8">
          <input type="text" placeholder="Search all products..." className="w-full max-w-xl p-4 border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* --- Main Products Section --- */}
      <div>
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <h2 className="text-3xl font-bold text-gray-800">Our Collection</h2>
          <div className="flex items-center gap-4">
            <label htmlFor="sort" className="text-sm font-medium text-gray-700">
              Sort by:
            </label>
            <select id="sort" className="p-2 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
        <ProductList products={displayedProducts} />
      </div>

      {/* --- Promo Code Section --- */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 mt-16 py-12 px-6 text-center rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-white mb-2">🎉 Get 10% Off!</h2>
        <p className="text-indigo-100 text-lg">
          Use promo code <span className="font-bold text-white bg-white/20 px-2 py-1 rounded">CROW10</span> at checkout for a special discount!
        </p>
      </div>

      {/* --- Customer Reviews Section --- */}
      <div className="mt-16 max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-10 text-center text-gray-800">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md border-t-4 border-indigo-500 transform hover:scale-105 transition-transform duration-300">
              <p className="text-gray-700 mb-4 italic text-lg">"{review.message}"</p>
              <p className="text-md font-semibold text-gray-900 text-right">– {review.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
