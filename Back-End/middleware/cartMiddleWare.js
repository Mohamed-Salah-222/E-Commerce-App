const Cart = require("../models/cart");

const attachCart = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    let cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart) {
      cart = new Cart({ userId, items: [] });
      await cart.save();
    }
    req.cart = cart;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { attachCart };
