import { useState, useEffect, useMemo } from "react";
import ProductList from "./ProductList";
import Skeleton from "../layout/Skeleton";

// In a real app, these would come from the backend or a CMS
const TESTIMONIALS = [
  {
    name: "Sarah A.",
    message: "Amazing products and super fast delivery!",
    rating: 5,
  },
  {
    name: "Mohamed E.",
    message: "Customer service was very helpful. Will buy again!",
    rating: 5,
  },
  {
    name: "Lina K.",
    message: "Great quality and prices. Highly recommend.",
    rating: 4,
  },
];

function HomePage() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
        if (!response.ok) throw new Error("Failed to load products");
        const data = await response.json();
        setAllProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const displayedProducts = useMemo(() => {
    let filtered = allProducts;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(term));
    }

    if (sortOption === "price_asc") {
      return [...filtered].sort((a, b) => a.price - b.price);
    }
    if (sortOption === "price_desc") {
      return [...filtered].sort((a, b) => b.price - a.price);
    }

    return filtered;
  }, [allProducts, searchTerm, sortOption]);

  return (
    <div className="space-y-20">
      {/* ── Hero ── */}
      <section className="relative rounded-3xl overflow-hidden bg-gray-900 text-white px-6 py-20 md:py-28">
        {/* Subtle grain overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Accent gradient blob */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl" />

        <div className="relative max-w-3xl mx-auto text-center">
          <p className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-4">Curated Collection</p>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1]">
            Find Your
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Perfect Style</span>
          </h1>
          <p className="mt-6 text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">Browse our handpicked selection of high-quality apparel and accessories delivered to your door.</p>

          {/* Search */}
          <div className="mt-10 max-w-xl mx-auto relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <input type="text" placeholder="Search products..." className="w-full pl-12 pr-5 py-4 bg-white/10 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/[0.12] transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
      </section>

      {/* ── Products Section ── */}
      <section>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Our Collection</h2>
            <p className="text-sm text-gray-500 mt-1">{loading ? "Loading..." : `${displayedProducts.length} product${displayedProducts.length !== 1 ? "s" : ""}`}</p>
          </div>

          <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/10 cursor-pointer">
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
          </select>
        </div>

        {loading ? (
          /* Skeleton that mirrors the actual product grid layout */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <Skeleton className="h-52 w-full rounded-none" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-24 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-500 font-medium">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
              Try again
            </button>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-gray-900 font-semibold text-lg">No products found</p>
            <p className="text-gray-500 mt-1">{searchTerm ? `Nothing matches "${searchTerm}"` : "Check back later for new arrivals."}</p>
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="mt-4 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <ProductList products={displayedProducts} />
        )}
      </section>

      {/* ── Promo Banner ── */}
      <section className="relative bg-gray-900 rounded-3xl px-6 py-14 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="relative">
          <p className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-3">Limited Offer</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Get 10% Off Your Order</h2>
          <p className="mt-4 text-gray-400 text-lg">
            Use code <code className="inline-block bg-white/10 text-indigo-300 px-3 py-1 rounded-lg font-mono font-bold">CROW10</code> at checkout
          </p>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900">What Our Customers Say</h2>
          <p className="text-gray-500 mt-2">Real feedback from real customers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((review, index) => (
            <div key={index} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={i < review.rating ? "#f59e0b" : "#e5e7eb"} stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>

              <p className="text-gray-700 leading-relaxed mb-5 italic">"{review.message}"</p>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-bold">{review.name.charAt(0)}</div>
                <span className="text-sm font-semibold text-gray-900">{review.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
