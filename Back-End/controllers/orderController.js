const Order = require("../models/order");
const Cart = require("../models/cart");
//*-------------------------------------------------------------------------------Add Order---------------------------------------------------------------------------------
const addOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cannot create an order with an empty cart." });
    }
    const validItems = cart.items.filter((item) => item.productId);
    if (validItems.length === 0) {
      return res.status(400).json({ message: "Cart contains no valid items to order." });
    }
    const totalAmount = validItems.reduce((total, item) => {
      return total + item.quantity * item.productId.price;
    }, 0);
    let discount = 0;
    if (cart.promoCode === "CROW10") {
      discount = 0.1;
    }
    const discountedTotal = totalAmount - totalAmount * discount;
    const newOrder = new Order({
      userId: userId,
      products: validItems.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.productId.price,
        size: item.size,
        color: item.color,
      })),
      totalAmount: totalAmount,
      discountedTotal: discountedTotal,
      discount: discount,
      promoCode: cart.promoCode || "",
    });
    const savedOrder = await newOrder.save();
    cart.items = [];
    cart.promoCode = "";
    await cart.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    next(error);
  }
};
//*-------------------------------------------------------------------------------Get Orders---------------------------------------------------------------------------------
const getOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 }).populate("products.productId");
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};
module.exports = {
  addOrder,
  getOrders,
};
