const User = require("../models/user");
const Cart = require("../models/cart");
const Order = require("../models/order");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
//*------------------------------------------------------------------------------Create Payment-------------------------------------------------------------------------------
const createPaymentIntent = async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    const userId = req.user.userId;
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country || !shippingAddress.phone) {
      return res.status(400).json({ error: "Complete shipping address is required" });
    }
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart) {
      return res.status(400).json({ error: "No cart found for user" });
    }
    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }
    const validItems = cart.items.filter((item) => item.productId);
    if (validItems.length === 0) {
      return res.status(400).json({ error: "No valid items in cart" });
    }
    const cartTotal = validItems.reduce((total, item) => total + item.quantity * item.productId.price, 0);
    const discountAmount = cart.promoCode === "CROW10" ? cartTotal * 0.1 : 0;
    const discountedTotal = cartTotal - discountAmount;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(discountedTotal * 100),
      currency: "usd",
      metadata: {
        userId: userId.toString(),
        itemCount: validItems.length.toString(),
        promoCode: cart.promoCode || "",
      },
    });
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: discountedTotal,
    });
  } catch (error) {
    console.error("Payment intent creation error:", error);
    res.status(500).json({ error: "Payment creation failed" });
  }
};
//*------------------------------------------------------------------------------Confirm Payment-------------------------------------------------------------------------------
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, shippingAddress } = req.body;
    const userId = req.user.userId;
    if (!paymentIntentId || !shippingAddress) {
      return res.status(400).json({ error: "Payment ID and shipping address are required" });
    }
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ error: "Payment not successful" });
    }
    if (paymentIntent.metadata.userId !== userId.toString()) {
      return res.status(403).json({ error: "Payment verification failed" });
    }
    const existingOrder = await Order.findOne({ paymentIntentId });
    if (existingOrder) {
      return res.status(400).json({ error: "Order already exists for this payment" });
    }
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }
    const validItems = cart.items.filter((item) => item.productId);
    const cartTotal = validItems.reduce((total, item) => total + item.quantity * item.productId.price, 0);
    const discountAmount = cart.promoCode === "CROW10" ? cartTotal * 0.1 : 0;
    const discountedTotal = cartTotal - discountAmount;
    const order = new Order({
      userId,
      products: validItems.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.productId.price,
        size: item.size,
        color: item.color,
      })),
      totalAmount: cartTotal,
      discountedTotal,
      discount: discountAmount,
      promoCode: cart.promoCode,
      paymentIntentId,
      paymentStatus: "succeeded",
      paymentMethod: "card",
      shippingAddress,
      orderStatus: "processing",
    });
    await order.save();
    await User.findByIdAndUpdate(userId, {
      address: shippingAddress,
    });
    await Cart.findOneAndUpdate({ userId }, { items: [], promoCode: null });
    res.json({
      success: true,
      orderId: order._id,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("Payment confirmation error:", error);
    res.status(500).json({ error: "Order creation failed" });
  }
};

const paymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount,
    });
  } catch (error) {
    console.error("Payment status check error:", error);
    res.status(500).json({ error: "Failed to check payment status" });
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  paymentStatus,
};
