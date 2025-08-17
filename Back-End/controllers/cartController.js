const Cart = require("../models/cart");
//*-------------------------------------------------------------------------------Get the cart-------------------------------------------------------------------------------
const getCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    let cart = await Cart.findOne({ userId: userId }).populate("items.productId");
    if (!cart) {
      const newCart = new Cart({ userId: userId, items: [] });
      await newCart.save();
      return res.status(200).json(newCart);
    }
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching cart." });
  }
};
//*----------------------------------------------------------------------------Add Item To Cart------------------------------------------------------------------------------
const AddToCart = async (req, res) => {
  try {
    const { productId, quantity, size, color } = req.body;
    const userId = req.user.userId;
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Product ID and valid quantity are required." });
    }
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }
    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId && item.size === size && item.color === color);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity, size, color });
    }
    const updatedCart = await cart.save();
    const populatedCart = await updatedCart.populate("items.productId");
    res.status(200).json(populatedCart);
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ message: "Server error while adding item to cart." });
  }
};
//*-------------------------------------------------------------------------Delete Item From Cart----------------------------------------------------------------------------
const deleteItemFromCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const productIdToRemove = req.params.productId;
    const { size, color } = req.query;
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }
    cart.items = cart.items.filter((item) => !(item.productId.toString() === productIdToRemove && item.size === size && item.color === color));
    const updatedCart = await cart.save();
    const populatedCart = await updatedCart.populate("items.productId");
    res.status(200).json(populatedCart);
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({ message: "Server error while removing item from cart." });
  }
};
//*-------------------------------------------------------------------------------Promo Code----------------------------------------------------------------------------
const promoCode = async (req, res) => {
  try {
    const { promoCode } = req.body;
    const userId = req.user.userId;
    if (typeof promoCode !== "string") {
      return res.status(400).json({ message: "Promo code must be a string." });
    }
    const cart = await Cart.findOneAndUpdate({ userId }, { promoCode: promoCode.toUpperCase() }, { new: true }).populate("items.productId");
    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error applying promo code:", error);
    res.status(500).json({ message: "Server error while applying promo code." });
  }
};
module.exports = {
  getCart,
  AddToCart,
  deleteItemFromCart,
  promoCode,
};
