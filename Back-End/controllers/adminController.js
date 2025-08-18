const User = require("../models/user");
const Order = require("../models/order");
const multer = require("multer");
const Product = require("../models/product");
//*---------------------------------------------------------------------------Delete Product---------------------------------------------------------------------------------
const deleteProductAdmin = async (req, res, next) => {
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
    next(error);
  }
};
//*---------------------------------------------------------------------------Get Orders--------------------------------------------------------------------------------
const getOrdersAdmin = async (req, res, next) => {
  try {
    const orders = await Order.find().populate("userId", "username email").sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};
//*---------------------------------------------------------------------------Update Order--------------------------------------------------------------------------------
const updateOrderStatus = async (req, res, next) => {
  try {
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
    next(error);
  }
};
//*---------------------------------------------------------------------------Update User--------------------------------------------------------------------------------
const updateUserStatus = async (req, res, next) => {
  try {
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
    next(error);
  }
};
//*---------------------------------------------------------------------------Get Users--------------------------------------------------------------------------------
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({
      message: "Users retrieved successfully",
      count: users.length,
      users: users,
    });
  } catch (error) {
    next(error);
  }
};
//*---------------------------------------------------------------------------Update Product--------------------------------------------------------------------------------
const updateProduct = async (req, res, next) => {
  try {
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
    next(error);
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
