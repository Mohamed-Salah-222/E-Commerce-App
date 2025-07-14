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
      message: "Amazing products and super fast delivery!",
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
    <div>
      {/* The search and sort UI */}
      <div className="flex items-center justify-center md:justify-between mb-8 gap-4 px-4">
        <div className="hidden md:block w-48"></div>
        <div className="flex-grow max-w-lg">
          <input type="text" placeholder="Search for products..." className="w-full p-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="w-48 flex justify-end">
          <select className="p-3 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
            <option value="newest">Sort by Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Product List */}
      <ProductList products={displayedProducts} />

      {/* Promo Code Section */}
      <div className="bg-indigo-50 mt-16 py-8 px-4 text-center rounded-lg max-w-4xl mx-auto">
        <h2 className="text-xl md:text-2xl font-semibold text-indigo-800 mb-2">🎉 Special Offer!</h2>
        <p className="text-gray-700">
          Use promo code <span className="font-bold text-indigo-600">CROW10</span> at checkout and get <span className="font-bold">10% OFF</span> your entire order!
        </p>
      </div>

      {/* Customer Reviews Section */}
      <div className="mt-12 max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-700 mb-4">"{review.message}"</p>
              <p className="text-sm font-semibold text-indigo-700">– {review.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
