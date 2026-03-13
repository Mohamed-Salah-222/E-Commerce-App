import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import Skeleton from "../layout/Skeleton";

const INITIAL_FORM = {
  name: "",
  description: "",
  price: "",
  imageUrl: "",
  sizes: [],
  colors: [],
  status: "available",
};

function AdminProductsPage() {
  const { token } = useAuth();
  const { showNotification } = useNotification();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
        if (!response.ok) throw new Error("Failed to fetch products");
        setProducts(await response.json());
      } catch (err) {
        showNotification(err.message, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setNewSize("");
    setNewColor("");
  };

  const handleEdit = (product) => {
    setEditingProduct(product._id);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      imageUrl: product.imageUrl || "",
      sizes: product.sizes || [],
      colors: product.colors || [],
      status: product.status || "available",
    });
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setShowAddModal(false);
    resetForm();
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showNotification("Please select an image file", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showNotification("Image must be under 5MB", "error");
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({ ...prev, imageUrl: event.target.result }));
      setUploadingImage(false);
    };
    reader.onerror = () => {
      showNotification("Failed to upload image", "error");
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const addTag = (type, value, setter) => {
    const trimmed = value.trim();
    if (trimmed && !formData[type].includes(trimmed)) {
      setFormData((prev) => ({ ...prev, [type]: [...prev[type], trimmed] }));
      setter("");
    }
  };

  const removeTag = (type, val) => {
    setFormData((prev) => ({ ...prev, [type]: prev[type].filter((v) => v !== val) }));
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/products/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to delete product");
      }
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      showNotification("Product deleted!", "success");
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      showNotification("Name and price are required", "error");
      return;
    }
    const price = parseFloat(formData.price);
    if (isNaN(price) || price < 0) {
      showNotification("Please enter a valid price", "error");
      return;
    }

    try {
      let response;
      if (editingProduct) {
        response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/product/${editingProduct}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            name: formData.name.trim(),
            description: formData.description.trim(),
            price,
            imageUrl: formData.imageUrl.trim(),
            sizes: formData.sizes.filter(Boolean),
            colors: formData.colors.filter(Boolean),
            status: formData.status,
          }),
        });
      } else {
        const fd = new FormData();
        fd.append("name", formData.name.trim());
        fd.append("description", formData.description.trim());
        fd.append("price", price.toString());
        fd.append("status", formData.status);
        if (formData.sizes.length > 0) fd.append("sizes", formData.sizes.join(","));
        if (formData.colors.length > 0) fd.append("colors", formData.colors.join(","));

        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput?.files[0]) {
          fd.append("productImage", fileInput.files[0]);
        } else if (formData.imageUrl) {
          fd.append("imageUrl", formData.imageUrl.trim());
        } else {
          showNotification("Please provide an image", "error");
          return;
        }

        response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/products`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to save product");
      }

      const saved = await response.json();
      const product = saved.product || saved;

      if (editingProduct) {
        setProducts((prev) => prev.map((p) => (p._id === editingProduct ? product : p)));
        showNotification("Product updated!", "success");
      } else {
        setProducts((prev) => [product, ...prev]);
        showNotification("Product added!", "success");
      }
      handleCancel();
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(term) || p.description?.toLowerCase().includes(term);
      const matchesStatus = filterStatus === "all" || p.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [products, searchTerm, filterStatus]);

  const stats = useMemo(
    () => ({
      total: products.length,
      available: products.filter((p) => p.status === "available").length,
      outOfStock: products.filter((p) => p.status === "out_of_stock").length,
    }),
    [products],
  );

  const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 focus:bg-white transition-colors";

  // Shared form component used in both edit and add modal
  const ProductForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Product name *" className={inputClass} required />
      <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Description" rows="2" className={`${inputClass} resize-none`} />
      <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="Price *" step="0.01" min="0" className={inputClass} required />

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Image</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} className={inputClass} disabled={uploadingImage} />
        <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder="Or paste image URL" className={`${inputClass} mt-2`} disabled={uploadingImage} />
        {uploadingImage && <p className="text-xs text-blue-600 mt-1">Uploading...</p>}
        {formData.imageUrl && (
          <img
            src={formData.imageUrl}
            alt="Preview"
            className="w-16 h-16 object-cover rounded-lg mt-2 border"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}
      </div>

      <select name="status" value={formData.status} onChange={handleInputChange} className={inputClass}>
        <option value="available">Available</option>
        <option value="out_of_stock">Out of Stock</option>
      </select>

      {/* Tags: Sizes */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Sizes</label>
        <div className="flex flex-wrap gap-1 mb-2">
          {formData.sizes.map((s) => (
            <span key={s} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs font-medium">
              {s}
              <button type="button" onClick={() => removeTag("sizes", s)} className="text-gray-400 hover:text-red-500">
                &times;
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
            placeholder="Add size"
            className={`${inputClass} flex-1`}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag("sizes", newSize, setNewSize);
              }
            }}
          />
          <button type="button" onClick={() => addTag("sizes", newSize, setNewSize)} className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
            Add
          </button>
        </div>
      </div>

      {/* Tags: Colors */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Colors</label>
        <div className="flex flex-wrap gap-1 mb-2">
          {formData.colors.map((c) => (
            <span key={c} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs font-medium">
              {c}
              <button type="button" onClick={() => removeTag("colors", c)} className="text-gray-400 hover:text-red-500">
                &times;
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            placeholder="Add color"
            className={`${inputClass} flex-1`}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag("colors", newColor, setNewColor);
              }
            }}
          />
          <button type="button" onClick={() => addTag("colors", newColor, setNewColor)} className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
            Add
          </button>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" className="flex-1 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors">
          {editingProduct ? "Save" : "Add Product"}
        </button>
        <button type="button" onClick={handleCancel} className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">
          Cancel
        </button>
        {editingProduct && (
          <button type="button" onClick={() => handleDelete(editingProduct)} className="py-3 px-4 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors">
            Delete
          </button>
        )}
      </div>
    </form>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-56" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
              <Skeleton className="h-3 w-20 mb-3" />
              <Skeleton className="h-8 w-12" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <Skeleton className="h-48 w-full rounded-none" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-sm text-gray-500 mt-1">{products.length} products</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
        >
          + Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total", value: stats.total },
          { label: "Available", value: stats.available },
          { label: "Out of Stock", value: stats.outOfStock },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 px-5 py-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-900/10">
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-48 bg-gray-50 relative">
              {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Image</div>}
              <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold ${product.status === "available" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{product.status === "available" ? "Available" : "Out of Stock"}</span>
            </div>

            <div className="p-4">
              {editingProduct === product._id ? (
                <ProductForm />
              ) : (
                <>
                  <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                  <p className="text-lg font-bold text-gray-900 mt-2">${product.price}</p>

                  {product.sizes?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {product.sizes.map((s, i) => (
                        <span key={i} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <button onClick={() => handleEdit(product)} className="flex-1 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(product._id)} className="py-2 px-4 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors">
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 font-medium">No products found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your search or add a new product</p>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Product</h2>
            <ProductForm />
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProductsPage;
