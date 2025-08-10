import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

function AdminProductsPage() {
  const { token } = useAuth();
  const { showNotification } = useNotification();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Form state for editing/adding products
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    sizes: [],
    colors: [],
    status: "available",
  });

  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      showNotification(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      imageUrl: "",
      sizes: [],
      colors: [],
      status: "available",
    });
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

  const handleAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setShowAddModal(false);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showNotification("Please select an image file", "error");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification("Image size should be less than 5MB", "error");
      return;
    }

    setUploadingImage(true);

    try {
      // Method 1: Convert to Base64 (simple but not recommended for production)
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          imageUrl: event.target.result,
        }));
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);

      // Note: For production, you'd want to upload to a service like:
      // - AWS S3
      // - Cloudinary
      // - Your own file server
      //
      // Example with FormData for file upload:
      // const uploadData = new FormData();
      // uploadData.append('image', file);
      // const response = await fetch('/api/upload', {
      //   method: 'POST',
      //   body: uploadData,
      // });
      // const data = await response.json();
      // setFormData(prev => ({ ...prev, imageUrl: data.url }));
    } catch (error) {
      console.error("Image upload error:", error);
      showNotification("Failed to upload image", "error");
      setUploadingImage(false);
    }
  };

  const addSize = () => {
    if (newSize.trim() && !formData.sizes.includes(newSize.trim())) {
      setFormData((prev) => ({
        ...prev,
        sizes: [...prev.sizes, newSize.trim()],
      }));
      setNewSize("");
    }
  };

  const removeSize = (sizeToRemove) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((size) => size !== sizeToRemove),
    }));
  };

  const addColor = () => {
    if (newColor.trim() && !formData.colors.includes(newColor.trim())) {
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, newColor.trim()],
      }));
      setNewColor("");
    }
  };

  const removeColor = (colorToRemove) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((color) => color !== colorToRemove),
    }));
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || "Failed to delete product";
        } catch {
          errorMessage = `Server error: ${response.status} - ${errorText}`;
        }
        throw new Error(errorMessage);
      }

      // Remove the product from the local state
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      showNotification("Product deleted successfully!", "success");
    } catch (error) {
      console.error("Delete error:", error);
      showNotification(error.message, "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.price) {
      showNotification("Name and price are required", "error");
      return;
    }

    // Validate price
    const price = parseFloat(formData.price);
    if (isNaN(price) || price < 0) {
      showNotification("Please enter a valid price", "error");
      return;
    }

    try {
      let response;

      if (editingProduct) {
        // Update existing product - keep your existing JSON approach for updates
        const submitData = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: price,
          imageUrl: formData.imageUrl.trim(),
          sizes: formData.sizes.filter((size) => size.trim() !== ""),
          colors: formData.colors.filter((color) => color.trim() !== ""),
          status: formData.status,
        };

        response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/product/${editingProduct}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(submitData),
        });
      } else {
        // Add new product - use FormData for file upload
        const formDataToSend = new FormData();

        formDataToSend.append("name", formData.name.trim());
        formDataToSend.append("description", formData.description.trim());
        formDataToSend.append("price", price.toString());

        // Handle sizes and colors as comma-separated strings
        if (formData.sizes.length > 0) {
          formDataToSend.append("sizes", formData.sizes.join(","));
        }
        if (formData.colors.length > 0) {
          formDataToSend.append("colors", formData.colors.join(","));
        }

        // Handle image file
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput && fileInput.files[0]) {
          formDataToSend.append("productImage", fileInput.files[0]);
        } else if (!formData.imageUrl) {
          showNotification("Please select an image file", "error");
          return;
        }

        response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type - let the browser set it for FormData
          },
          body: formDataToSend,
        });
      }

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);

        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || "Failed to save product";
        } catch {
          errorMessage = `Server error: ${response.status} - ${errorText}`;
        }

        throw new Error(errorMessage);
      }

      const savedProduct = await response.json();
      console.log("Saved product:", savedProduct);

      if (editingProduct) {
        setProducts((prev) => prev.map((p) => (p._id === editingProduct ? savedProduct.product || savedProduct : p)));
        showNotification("Product updated successfully!", "success");
      } else {
        setProducts((prev) => [savedProduct.product || savedProduct, ...prev]);
        showNotification("Product added successfully!", "success");
      }

      handleCancel();
    } catch (error) {
      console.error("Submit error:", error);
      showNotification(error.message, "error");
    }
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || product.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-10">
      {/* Header with Glassmorphism Effect */}
      <div className="backdrop-blur-md bg-white/80 rounded-3xl p-8 shadow-xl border border-white/20">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-3 tracking-tight">Product Management</h1>
            <p className="text-slate-600 text-lg font-medium">Manage your product inventory with style</p>
          </div>
          <button onClick={handleAdd} className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:shadow-2xl hover:shadow-indigo-500/25 transition-all duration-300 font-semibold text-lg transform hover:scale-105 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">+</div>
              Add New Product
            </span>
          </button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="relative">
            <div className="text-blue-100 text-sm font-semibold mb-2 uppercase tracking-wider">Total Products</div>
            <div className="text-4xl font-black text-white mb-2">{products.length}</div>
            <div className="w-16 h-1 bg-blue-300 rounded-full"></div>
          </div>
        </div>
        <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-green-600 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="relative">
            <div className="text-emerald-100 text-sm font-semibold mb-2 uppercase tracking-wider">Available</div>
            <div className="text-4xl font-black text-white mb-2">{products.filter((p) => p.status === "available").length}</div>
            <div className="w-16 h-1 bg-emerald-300 rounded-full"></div>
          </div>
        </div>
        <div className="group relative overflow-hidden bg-gradient-to-br from-rose-500 to-red-600 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="relative">
            <div className="text-rose-100 text-sm font-semibold mb-2 uppercase tracking-wider">Out of Stock</div>
            <div className="text-4xl font-black text-white mb-2">{products.filter((p) => p.status === "out_of_stock").length}</div>
            <div className="w-16 h-1 bg-rose-300 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filter */}
      <div className="backdrop-blur-md bg-white/90 rounded-3xl p-8 shadow-xl border border-white/20">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 text-lg placeholder-slate-400 shadow-sm hover:shadow-md" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-6 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 text-lg font-medium shadow-sm hover:shadow-md min-w-[180px]">
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Enhanced Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map((product) => (
          <div key={product._id} className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white/50 transform hover:scale-105 hover:-translate-y-2">
            {/* Enhanced Product Image */}
            <div className="h-56 relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 bg-gradient-to-br from-slate-100 to-slate-200">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 rounded-2xl bg-slate-300 flex items-center justify-center">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="font-medium">No Image</div>
                  </div>
                </div>
              )}
              <div className="absolute top-4 right-4">
                <span className={`px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md ${product.status === "available" ? "bg-emerald-500/90 text-white shadow-lg shadow-emerald-500/25" : "bg-rose-500/90 text-white shadow-lg shadow-rose-500/25"}`}>{product.status === "available" ? "Available" : "Out of Stock"}</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Enhanced Product Details */}
            <div className="p-6">
              {editingProduct === product._id ? (
                // Enhanced Edit Form
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Product name" className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300" required />

                  <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Description" rows="2" className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 resize-none" />

                  <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="Price" step="0.01" min="0" className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300" required />

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">Product Image</label>
                    <div className="space-y-3">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300" disabled={uploadingImage} />
                      <div className="text-xs text-slate-500 text-center">Or enter image URL manually:</div>
                      <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder="https://example.com/image.jpg" className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300" disabled={uploadingImage} />
                      {uploadingImage && (
                        <div className="text-sm text-indigo-600 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent mr-2"></div>
                          Uploading image...
                        </div>
                      )}
                      {formData.imageUrl && (
                        <div className="flex justify-center">
                          <img
                            src={formData.imageUrl}
                            alt="Preview"
                            className="w-20 h-20 object-cover rounded-2xl border-2 border-slate-200 shadow-md"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300">
                    <option value="available">Available</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>

                  {/* Enhanced Sizes */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">Sizes</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.sizes.map((size) => (
                        <span key={size} className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 px-3 py-2 rounded-full text-sm flex items-center font-medium shadow-sm hover:shadow-md transition-all duration-200">
                          {size}
                          <button type="button" onClick={() => removeSize(size)} className="ml-2 w-5 h-5 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center hover:bg-rose-600 transition-colors duration-200">
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" value={newSize} onChange={(e) => setNewSize(e.target.value)} placeholder="Add size" className="flex-1 px-3 py-2 border-2 border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300" onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSize())} />
                      <button type="button" onClick={addSize} className="bg-gradient-to-r from-slate-200 to-slate-300 px-4 py-2 rounded-xl text-sm hover:from-slate-300 hover:to-slate-400 transition-all duration-200 font-medium">
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Enhanced Colors */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">Colors</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.colors.map((color) => (
                        <span key={color} className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 px-3 py-2 rounded-full text-sm flex items-center font-medium shadow-sm hover:shadow-md transition-all duration-200">
                          {color}
                          <button type="button" onClick={() => removeColor(color)} className="ml-2 w-5 h-5 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center hover:bg-rose-600 transition-colors duration-200">
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" value={newColor} onChange={(e) => setNewColor(e.target.value)} placeholder="Add color" className="flex-1 px-3 py-2 border-2 border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300" onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addColor())} />
                      <button type="button" onClick={addColor} className="bg-gradient-to-r from-slate-200 to-slate-300 px-4 py-2 rounded-xl text-sm hover:from-slate-300 hover:to-slate-400 transition-all duration-200 font-medium">
                        Add
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="submit" className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 font-semibold flex-1">
                      Save
                    </button>
                    <button type="button" onClick={handleCancel} className="bg-gradient-to-r from-slate-300 to-slate-400 text-slate-700 px-6 py-3 rounded-xl text-sm hover:from-slate-400 hover:to-slate-500 transition-all duration-300 font-semibold flex-1">
                      Cancel
                    </button>
                    <button type="button" onClick={() => handleDelete(product._id)} className="bg-gradient-to-r from-rose-500 to-red-600 text-white px-6 py-3 rounded-xl text-sm hover:shadow-lg hover:shadow-rose-500/25 transition-all duration-300 font-semibold">
                      Delete
                    </button>
                  </div>
                </form>
              ) : (
                // Enhanced Display Mode
                <>
                  <h3 className="font-bold text-xl text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors duration-300">{product.name}</h3>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">{product.description}</p>
                  <div className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">${product.price}</div>

                  {/* Enhanced Sizes and Colors */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="mb-3">
                      <span className="text-sm text-slate-500 font-semibold">Sizes: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.sizes.map((size, index) => (
                          <span key={index} className="bg-slate-100 text-slate-700 px-2 py-1 rounded-lg text-xs font-medium">
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {product.colors && product.colors.length > 0 && (
                    <div className="mb-6">
                      <span className="text-sm text-slate-500 font-semibold">Colors: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.colors.map((color, index) => (
                          <span key={index} className="bg-slate-100 text-slate-700 px-2 py-1 rounded-lg text-xs font-medium">
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => handleEdit(product)} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 font-semibold transform hover:scale-105">
                      Edit Product
                    </button>
                    <button onClick={() => handleDelete(product._id)} className="bg-gradient-to-r from-rose-500 to-red-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-rose-500/25 transition-all duration-300 font-semibold transform hover:scale-105">
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Add New Product</h2>
                <div className="w-16 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mx-auto mt-3"></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Product name *" className="w-full px-4 py-4 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 text-lg placeholder-slate-400" required />

                <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Description" rows="3" className="w-full px-4 py-4 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 resize-none placeholder-slate-400" />

                <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="Price *" step="0.01" min="0" className="w-full px-4 py-4 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 text-lg placeholder-slate-400" required />

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Product Image</label>
                  <div className="space-y-3">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full px-4 py-4 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300" disabled={uploadingImage} />
                    <div className="text-xs text-slate-500 text-center">Or enter image URL manually:</div>
                    <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder="https://example.com/image.jpg" className="w-full px-4 py-4 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 placeholder-slate-400" disabled={uploadingImage} />
                    {uploadingImage && (
                      <div className="text-sm text-indigo-600 flex items-center justify-center py-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 border-t-transparent mr-3"></div>
                        Uploading image...
                      </div>
                    )}
                    {formData.imageUrl && (
                      <div className="flex justify-center pt-2">
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          className="w-28 h-28 object-cover rounded-3xl border-2 border-slate-200 shadow-lg"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-4 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 text-lg font-medium">
                  <option value="available">Available</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>

                {/* Enhanced Sizes */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Sizes</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.sizes.map((size) => (
                      <span key={size} className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 px-3 py-2 rounded-full text-sm flex items-center font-medium shadow-sm">
                        {size}
                        <button type="button" onClick={() => removeSize(size)} className="ml-2 w-5 h-5 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center hover:bg-rose-600 transition-colors duration-200">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <input type="text" value={newSize} onChange={(e) => setNewSize(e.target.value)} placeholder="Add size" className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300" onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSize())} />
                    <button type="button" onClick={addSize} className="bg-gradient-to-r from-slate-200 to-slate-300 px-6 py-3 rounded-xl hover:from-slate-300 hover:to-slate-400 transition-all duration-200 font-medium">
                      Add
                    </button>
                  </div>
                </div>

                {/* Enhanced Colors */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Colors</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.colors.map((color) => (
                      <span key={color} className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 px-3 py-2 rounded-full text-sm flex items-center font-medium shadow-sm">
                        {color}
                        <button type="button" onClick={() => removeColor(color)} className="ml-2 w-5 h-5 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center hover:bg-rose-600 transition-colors duration-200">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <input type="text" value={newColor} onChange={(e) => setNewColor(e.target.value)} placeholder="Add color" className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300" onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addColor())} />
                    <button type="button" onClick={addColor} className="bg-gradient-to-r from-slate-200 to-slate-300 px-6 py-3 rounded-xl hover:from-slate-300 hover:to-slate-400 transition-all duration-200 font-medium">
                      Add
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button type="submit" className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl hover:shadow-xl hover:shadow-indigo-500/25 transition-all duration-300 font-bold text-lg transform hover:scale-105">
                    Add Product
                  </button>
                  <button type="button" onClick={handleCancel} className="flex-1 bg-gradient-to-r from-slate-300 to-slate-400 text-slate-700 py-4 rounded-2xl hover:from-slate-400 hover:to-slate-500 transition-all duration-300 font-bold text-lg transform hover:scale-105">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Empty State */}
      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full mb-6">
            <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-600 mb-2">No products found</h3>
          <p className="text-slate-500 text-lg">Try adjusting your search criteria or add a new product</p>
        </div>
      )}
    </div>
  );
}

export default AdminProductsPage;
