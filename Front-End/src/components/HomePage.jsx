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
    <div className="space-y-32 overflow-hidden pt-4">
      {/* --- Hero Section --- */}
      <div className="relative text-center py-24 px-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-3xl shadow-xl overflow-hidden animate-fade-in-up">
        {/* Background Decorations */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full transform -translate-x-48 -translate-y-48 animate-float"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-purple-200/30 to-pink-200/30 rounded-full transform translate-x-40 translate-y-40 animate-float-delayed"></div>

        <div className="relative z-0">
          <h1 className="text-4xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 animate-gradient-x leading-tight">Find Your Perfect Style</h1>
          <div className="mt-2 flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-expand-width"></div>
          </div>

          <p className="mt-8 max-w-2xl mx-auto text-xl text-gray-600 leading-relaxed animate-fade-in-delayed">Browse our curated collection of high-quality apparel and accessories.</p>

          <div className="mt-12 relative animate-slide-up-delayed">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-xl opacity-0 animate-search-glow"></div>
            <input
              type="text"
              placeholder="Search all products..."
              className="relative w-full max-w-2xl p-6 text-lg border-2 border-gray-200 rounded-full shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-400/50 focus:border-indigo-400 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:shadow-xl transform hover:scale-[1.02]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* --- Main Products Section --- */}
      <div className="animate-slide-in-up">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="relative">
            <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-gray-800 to-indigo-600 bg-clip-text">Our Collection</h2>
            <div className="absolute -bottom-2 left-0 w-16 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-expand-width-delayed"></div>
          </div>

          <div className="flex items-center gap-6 animate-fade-in-right">
            <label htmlFor="sort" className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              Sort by:
            </label>
            <div className="relative">
              <select id="sort" className="appearance-none p-4 pr-10 border-2 border-gray-200 rounded-xl shadow-lg bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 hover:shadow-xl cursor-pointer font-medium" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="animate-products-grid">
          <ProductList products={displayedProducts} />
        </div>
      </div>

      {/* --- Promo Code Section --- */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 py-16 px-8 text-center rounded-3xl shadow-2xl overflow-hidden animate-bounce-in transform hover:scale-[1.02] transition-all duration-500">
        {/* Background Animations */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/10 via-transparent to-white/10 animate-shimmer-infinite"></div>
        <div className="absolute top-4 left-4 w-8 h-8 bg-white/20 rounded-full animate-float"></div>
        <div className="absolute bottom-4 right-4 w-6 h-6 bg-white/20 rounded-full animate-float-delayed"></div>
        <div className="absolute top-1/2 left-8 w-4 h-4 bg-white/30 rounded-full animate-pulse"></div>
        <div className="absolute top-8 right-8 w-3 h-3 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: "1s" }}></div>

        <div className="relative z-10">
          <div className="animate-bounce-emoji">
            <span className="text-6xl animate-spin-slow">🎉</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-glow-text">Get 10% Off!</h2>
          <p className="text-indigo-100 text-xl leading-relaxed max-w-2xl mx-auto">
            Use promo code <span className="inline-block font-bold text-white bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm transform hover:scale-110 transition-transform duration-200 animate-pulse-code">CROW10</span> at checkout for a special discount!
          </p>
        </div>
      </div>

      {/* --- Customer Reviews Section --- */}
      <div className="max-w-7xl mx-auto px-4 animate-fade-in-up-delayed">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-gradient-to-r from-gray-800 to-indigo-600 bg-clip-text">What Our Customers Say</h2>
          <div className="flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-expand-width-delayed"></div>
          </div>
          <p className="mt-6 text-gray-600 text-lg max-w-2xl mx-auto">Don't just take our word for it - hear from our satisfied customers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <div key={index} className="group relative bg-white p-8 rounded-2xl shadow-xl border-t-4 border-indigo-500 transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl animate-review-card overflow-hidden" style={{ animationDelay: `${index * 0.2}s` }}>
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-indigo-50 to-purple-50 rounded-full transform translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-500"></div>

              {/* Quote Icon */}
              <div className="absolute top-4 left-4 text-indigo-200 text-4xl font-serif transform group-hover:scale-110 transition-transform duration-300">"</div>

              <div className="relative z-10">
                <p className="text-gray-700 mb-6 italic text-lg leading-relaxed pt-6">{review.message}</p>

                <div className="flex items-center justify-end space-x-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                  <p className="text-lg font-bold text-gray-900">{review.name}</p>
                </div>

                {/* Star Rating Visual */}
                <div className="flex justify-end mt-2 space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-star-twinkle" style={{ animationDelay: `${i * 0.1}s` }}></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(50px);
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

        @keyframes slide-up-delayed {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in-up-delayed {
          from {
            opacity: 0;
            transform: translateY(60px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes expand-width {
          from {
            width: 0;
          }
          to {
            width: 6rem;
          }
        }

        @keyframes expand-width-delayed {
          from {
            width: 0;
          }
          to {
            width: 4rem;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(-180deg);
          }
        }

        @keyframes bounce-in {
          from {
            opacity: 0;
            transform: scale(0.3) translateY(50px);
          }
          50% {
            transform: scale(1.05) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes bounce-emoji {
          0%,
          100% {
            transform: scale(1) rotate(0deg);
          }
          50% {
            transform: scale(1.2) rotate(10deg);
          }
        }

        @keyframes shimmer-infinite {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes glow-text {
          0%,
          100% {
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
          }
          50% {
            text-shadow: 0 0 30px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.6);
          }
        }

        @keyframes pulse-code {
          0%,
          100% {
            background-color: rgba(255, 255, 255, 0.2);
          }
          50% {
            background-color: rgba(255, 255, 255, 0.3);
          }
        }

        @keyframes review-card {
          from {
            opacity: 0;
            transform: translateY(50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes star-twinkle {
          0%,
          100% {
            opacity: 0.7;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        @keyframes gradient-x {
          0%,
          100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }

        @keyframes search-glow {
          0%,
          100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }

        .animate-fade-in-delayed {
          animation: fade-in-delayed 1s ease-out 0.5s both;
        }

        .animate-slide-up-delayed {
          animation: slide-up-delayed 1s ease-out 0.8s both;
        }

        .animate-slide-in-up {
          animation: slide-in-up 1s ease-out 0.3s both;
        }

        .animate-fade-in-right {
          animation: fade-in-right 1s ease-out 0.5s both;
        }

        .animate-fade-in-up-delayed {
          animation: fade-in-up-delayed 1s ease-out 1s both;
        }

        .animate-expand-width {
          animation: expand-width 1s ease-out 0.3s both;
        }

        .animate-expand-width-delayed {
          animation: expand-width-delayed 1s ease-out 0.5s both;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite 2s;
        }

        .animate-bounce-in {
          animation: bounce-in 1.2s ease-out 0.2s both;
        }

        .animate-bounce-emoji {
          animation: bounce-emoji 2s ease-in-out infinite;
        }

        .animate-shimmer-infinite {
          animation: shimmer-infinite 3s ease-in-out infinite;
        }

        .animate-glow-text {
          animation: glow-text 2s ease-in-out infinite;
        }

        .animate-pulse-code {
          animation: pulse-code 2s ease-in-out infinite;
        }

        .animate-review-card {
          animation: review-card 0.8s ease-out both;
        }

        .animate-star-twinkle {
          animation: star-twinkle 2s ease-in-out infinite;
        }

        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }

        .animate-search-glow {
          animation: search-glow 3s ease-in-out infinite 1s;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-products-grid {
          animation: fade-in-up 1s ease-out 0.6s both;
        }
      `}</style>
    </div>
  );
}

export default HomePage;
