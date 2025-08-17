const User = require("../models/user");
const Order = require("../models/order");
const multer = require("multer");
const Product = require("../models/product");
//*---------------------------------------------------------------------------Delete Product---------------------------------------------------------------------------------
const deleteProductAdmin = async (req, res) => {
  try {
    const productId = req.params.productId;
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product deleted successfully",
      deletedProduct,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server error while deleting product" });
  }
};
//*---------------------------------------------------------------------------Get Orders--------------------------------------------------------------------------------
const getOrdersAdmin = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    if (user.admin === false) {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    const orders = await Order.find().populate("userId", "username email").sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.log("Server error while loading orders", error);
    res.status(500).json({ message: "Server error while loading orders", error });
  }
};
//*---------------------------------------------------------------------------Update Order--------------------------------------------------------------------------------
const updateOrderStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    if (user.admin === false) {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    const orderId = req.params.id;
    const { orderStatus } = req.body;
    if (!orderStatus) {
      return res.status(400).json({ message: "orderStatus is required" });
    }
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { orderStatus }, { new: true, runValidators: false });
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error Updating order:", error);
    res.status(500).json({ message: "Server error while updating order." });
  }
};
//*---------------------------------------------------------------------------Update User--------------------------------------------------------------------------------
const updateUserStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.admin === false) {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    const userToUpdateId = req.params.id;
    if (!userToUpdateId) {
      return res.status(400).json({ message: "User ID parameter is required" });
    }
    const userToUpdate = await User.findById(userToUpdateId);
    if (!userToUpdate) {
      return res.status(404).json({ message: "User to update not found" });
    }
    if (userToUpdate.admin === true) {
      return res.status(400).json({ message: "User is already an admin" });
    }
    const updatedUser = await User.findByIdAndUpdate(userToUpdateId, { admin: true }, { new: true, runValidators: true }).select("-password");
    res.status(200).json({
      message: "User successfully promoted to admin",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        admin: updatedUser.admin,
      },
    });
  } catch (error) {
    console.error("Error updating user to admin:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Validation error", details: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};
//*---------------------------------------------------------------------------Get Users--------------------------------------------------------------------------------
const getUsers = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.admin === false) {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({
      message: "Users retrieved successfully",
      count: users.length,
      users: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    if (error.name === "MongoError" || error.name === "MongoServerError") {
      return res.status(503).json({ message: "Database connection error" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};
//*---------------------------------------------------------------------------Update Product--------------------------------------------------------------------------------
const updateProduct = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.admin === false) {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    const productId = req.params.id;
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const { name, description, price, imageUrl, sizes, colors, status } = req.body;
    if (price !== undefined && (typeof price !== "number" || price < 0)) {
      return res.status(400).json({ message: "Price must be a positive number" });
    }
    if (status && !["available", "out_of_stock"].includes(status)) {
      return res.status(400).json({ message: "Status must be either 'available' or 'out_of_stock'" });
    }
    if (sizes && !Array.isArray(sizes)) {
      return res.status(400).json({ message: "Sizes must be an array" });
    }
    if (colors && !Array.isArray(colors)) {
      return res.status(400).json({ message: "Colors must be an array" });
    }
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (price !== undefined) updateData.price = price;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl.trim();
    if (sizes !== undefined) updateData.sizes = sizes.filter((size) => size.trim() !== "");
    if (colors !== undefined) updateData.colors = colors.filter((color) => color.trim() !== "");
    if (status !== undefined) updateData.status = status;
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No valid fields provided for update" });
    }
    const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, {
      new: true,
      runValidators: true,
    });
    console.log(`Product ${productId} updated by admin ${user.username}:`, updateData);
    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid product ID format" });
    }
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: "Validation error",
        details: errors,
      });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = {
  deleteProductAdmin,
  getOrdersAdmin,
  updateOrderStatus,
  updateUserStatus,
  getUsers,
  updateProduct,
};
