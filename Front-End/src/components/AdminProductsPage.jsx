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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Product Management</h1>
          <p className="text-gray-600">Manage your product inventory</p>
        </div>
        <button onClick={handleAdd} className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
          + Add New Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
          <div className="text-blue-600 text-sm font-medium mb-1">Total Products</div>
          <div className="text-3xl font-bold text-blue-800">{products.length}</div>
        </div>
        <div className="bg-green-50 p-6 rounded-xl border border-green-200">
          <div className="text-green-600 text-sm font-medium mb-1">Available</div>
          <div className="text-3xl font-bold text-green-800">{products.filter((p) => p.status === "available").length}</div>
        </div>
        <div className="bg-red-50 p-6 rounded-xl border border-red-200">
          <div className="text-red-600 text-sm font-medium mb-1">Out of Stock</div>
          <div className="text-3xl font-bold text-red-800">{products.filter((p) => p.status === "out_of_stock").length}</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product._id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {/* Product Image */}
            <div className="h-48 bg-gray-200 relative overflow-hidden">
              {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>}
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${product.status === "available" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{product.status === "available" ? "Available" : "Out of Stock"}</span>
              </div>
            </div>

            {/* Product Details */}
            <div className="p-4">
              {editingProduct === product._id ? (
                // Edit Form
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Product name" className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required />

                  <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Description" rows="2" className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />

                  <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="Price" step="0.01" min="0" className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                    <div className="space-y-2">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" disabled={uploadingImage} />
                      <div className="text-xs text-gray-500">Or enter image URL manually:</div>
                      <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder="https://example.com/image.jpg" className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" disabled={uploadingImage} />
                      {uploadingImage && <div className="text-sm text-blue-600">Uploading image...</div>}
                      {formData.imageUrl && (
                        <div className="mt-2">
                          <img
                            src={formData.imageUrl}
                            alt="Preview"
                            className="w-20 h-20 object-cover rounded border"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="available">Available</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>

                  {/* Sizes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sizes</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.sizes.map((size) => (
                        <span key={size} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm flex items-center">
                          {size}
                          <button type="button" onClick={() => removeSize(size)} className="ml-1 text-red-500 hover:text-red-700">
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" value={newSize} onChange={(e) => setNewSize(e.target.value)} placeholder="Add size" className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm" onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSize())} />
                      <button type="button" onClick={addSize} className="bg-gray-200 px-2 py-1 rounded text-sm hover:bg-gray-300">
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Colors */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Colors</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.colors.map((color) => (
                        <span key={color} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm flex items-center">
                          {color}
                          <button type="button" onClick={() => removeColor(color)} className="ml-1 text-red-500 hover:text-red-700">
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" value={newColor} onChange={(e) => setNewColor(e.target.value)} placeholder="Add color" className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm" onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addColor())} />
                      <button type="button" onClick={addColor} className="bg-gray-200 px-2 py-1 rounded text-sm hover:bg-gray-300">
                        Add
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">
                      Save
                    </button>
                    <button type="button" onClick={handleCancel} className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-400">
                      Cancel
                    </button>
                    <button type="button" onClick={() => handleDelete(product._id)} className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700">
                      Delete
                    </button>
                  </div>
                </form>
              ) : (
                // Display Mode
                <>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="text-2xl font-bold text-indigo-600 mb-3">${product.price}</div>

                  {/* Sizes and Colors */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="mb-2">
                      <span className="text-sm text-gray-500">Sizes: </span>
                      <span className="text-sm">{product.sizes.join(", ")}</span>
                    </div>
                  )}

                  {product.colors && product.colors.length > 0 && (
                    <div className="mb-4">
                      <span className="text-sm text-gray-500">Colors: </span>
                      <span className="text-sm">{product.colors.join(", ")}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(product)} className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors">
                      Edit Product
                    </button>
                    <button onClick={() => handleDelete(product._id)} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Product name *" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required />

                <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Description" rows="3" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />

                <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="Price *" step="0.01" min="0" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                  <div className="space-y-2">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" disabled={uploadingImage} />
                    <div className="text-xs text-gray-500">Or enter image URL manually:</div>
                    <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder="https://example.com/image.jpg" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" disabled={uploadingImage} />
                    {uploadingImage && (
                      <div className="text-sm text-blue-600 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
                        Uploading image...
                      </div>
                    )}
                    {formData.imageUrl && (
                      <div className="mt-2">
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          className="w-24 h-24 object-cover rounded-lg border"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="available">Available</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>

                {/* Sizes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sizes</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.sizes.map((size) => (
                      <span key={size} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm flex items-center">
                        {size}
                        <button type="button" onClick={() => removeSize(size)} className="ml-1 text-red-500 hover:text-red-700">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={newSize} onChange={(e) => setNewSize(e.target.value)} placeholder="Add size" className="flex-1 px-3 py-2 border border-gray-300 rounded" onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSize())} />
                    <button type="button" onClick={addSize} className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300">
                      Add
                    </button>
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Colors</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.colors.map((color) => (
                      <span key={color} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm flex items-center">
                        {color}
                        <button type="button" onClick={() => removeColor(color)} className="ml-1 text-red-500 hover:text-red-700">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={newColor} onChange={(e) => setNewColor(e.target.value)} placeholder="Add color" className="flex-1 px-3 py-2 border border-gray-300 rounded" onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addColor())} />
                    <button type="button" onClick={addColor} className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300">
                      Add
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                    Add Product
                  </button>
                  <button type="button" onClick={handleCancel} className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}

export default AdminProductsPage;
