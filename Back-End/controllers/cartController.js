const Cart = require("../models/cart");
//*-------------------------------------------------------------------------------Get the cart-------------------------------------------------------------------------------
const getCart = async (req, res, next) => {
  try {
    res.status(200).json(req.cart);
  } catch (error) {
    next(error);
  }
};
//*----------------------------------------------------------------------------Add Item To Cart------------------------------------------------------------------------------
const AddToCart = async (req, res, next) => {
  try {
    const { productId, quantity, size, color } = req.body;
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Product ID and valid quantity are required." });
    }
    const cart = req.cart;
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
    next(error);
  }
};
//*-------------------------------------------------------------------------Delete Item From Cart----------------------------------------------------------------------------
const deleteItemFromCart = async (req, res, next) => {
  try {
    const productIdToRemove = req.params.productId;
    const { size, color } = req.query;
    const cart = req.cart;
    cart.items = cart.items.filter((item) => !(item.productId.toString() === productIdToRemove && item.size === size && item.color === color));
    const updatedCart = await cart.save();
    const populatedCart = await updatedCart.populate("items.productId");
    res.status(200).json(populatedCart);
  } catch (error) {
    next(error);
  }
};
//*-------------------------------------------------------------------------------Promo Code----------------------------------------------------------------------------
const promoCode = async (req, res, next) => {
  try {
    const { promoCode } = req.body;
    if (typeof promoCode !== "string") {
      return res.status(400).json({ message: "Promo code must be a string." });
    }
    const cart = req.cart;
    cart.promoCode = promoCode.toUpperCase();
    await cart.save();
    res.status(200).json(await cart.populate("items.productId"));
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getCart,
  AddToCart,
  deleteItemFromCart,
  promoCode,
};
