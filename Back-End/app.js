require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendVerificationEmail, sendPasswordResetEmail } = require("./services/emailServices");
const passport = require("passport");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const User = require("./models/user");
const Product = require("./models/product");
const Cart = require("./models/cart");
const Order = require("./models/order");
const authMiddleware = require("./middleware/authMiddleware");
require("./config/passport-setup");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(passport.initialize());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

const dbURI = process.env.MONGODB_URI;

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    let user = await User.findOne({ email: email });

    if (user && user.isVerified) {
      return res.status(409).json({ message: "This email is already registered and verified." });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    if (user && !user.isVerified) {
      user.password = await bcrypt.hash(password, 10);
      user.verificationCode = verificationCode;
      user.verificationCodeExpires = verificationCodeExpires;
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      user = new User({
        email,
        username,
        password: hashedPassword,
        verificationCode,
        verificationCodeExpires,
      });
    }

    await user.save();

    try {
      await sendVerificationEmail(user.email, verificationCode);
    } catch (emailError) {
      console.error(emailError);
      return res.status(500).json({ message: "User registered, but failed to send verification email. Please try verifying later." });
    }

    res.status(201).json({ message: "Registration successful! Please check your email for a verification code." });
  } catch (error) {
    console.error("Error during registration process:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
});

app.post("/api/auth/verify", async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      return res.status(400).json({ message: "Email and verification code are required." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found. Please register first." });
    }

    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    if (user.verificationCodeExpires < new Date()) {
      return res.status(400).json({ message: "Verification code has expired. Please register again to get a new code." });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Account verified successfully! You can now log in." });
  } catch (error) {
    console.error("Error during account verification:", error);
    res.status(500).json({ message: "Server error during verification." });
  }
});

//&--Login API
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email or password are missing" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const payload = { userId: user._id, email: user.email, username: user.username };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ message: "Logged in successfully!", token });
  } catch (err) {
    res.status(500).json({ message: "Server error during login." });
  }
});

app.post("/api/products", upload.single("productImage"), async (req, res) => {
  try {
    const { name, description, price, sizes, colors } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: "Product image is required." });
    }
    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required." });
    }
    const imageUrl = `${req.protocol}://${req.get("host")}/images/${req.file.filename}`;
    const sizesArray = sizes ? sizes.split(",").map((s) => s.trim()) : [];
    const colorsArray = colors ? colors.split(",").map((c) => c.trim()) : [];
    const newProduct = new Product({ name, description, price, imageUrl, sizes: sizesArray, colors: colorsArray });
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: "Server error while creating product." });
  }
});

app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      console.log(`Password reset requested for non-existent user: ${email}`);
      return res.status(200).json({ message: "If an account with that email exists, a password reset link has been sent." });
    }

    const resetSecret = process.env.JWT_SECRET + user.password;
    const payload = { email: user.email, id: user._id };

    const token = jwt.sign(payload, resetSecret, { expiresIn: "15m" });

    await sendPasswordResetEmail(user.email, user._id, token);

    res.status(200).json({ message: "If an account with that email exists, a password reset link has been sent." });
  } catch (error) {
    console.error("Error in forgot password process:", error);

    res.status(500).json({ message: "An error occurred. Please try again later." });
  }
});

app.post("/api/auth/reset-password/:userId/:token", async (req, res) => {
  try {
    const { userId, token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const resetSecret = process.env.JWT_SECRET + user.password;

    jwt.verify(token, resetSecret);

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(400).json({ message: "Invalid or expired password reset link." });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products." });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ message: "Product not found." });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching product." });
  }
});

app.get("/api/cart", authMiddleware, async (req, res) => {
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
});

app.post("/api/cart", authMiddleware, async (req, res) => {
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
});

app.delete("/api/cart/items/:productId", authMiddleware, async (req, res) => {
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
});

app.post("/api/orders", authMiddleware, async (req, res) => {
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
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Server error while creating order." });
  }
});

app.put("/api/user/profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const { username, phone, address } = req.body;

    const userToUpdate = await User.findById(userId);

    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found." });
    }

    if (username) userToUpdate.username = username;
    if (phone) userToUpdate.phone = phone;
    if (address) userToUpdate.address = address;

    const updatedUser = await userToUpdate.save();

    const userResponse = {
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
    };

    res.status(200).json({
      message: "Profile updated successfully!",
      user: userResponse,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Server error while updating profile." });
  }
});

app.get("/api/orders", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 }).populate("products.productId");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching order history." });
  }
});

app.patch("/api/cart/promo", authMiddleware, async (req, res) => {
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
});

app.get(
  "/api/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

app.get("/api/auth/google/callback", passport.authenticate("google", { session: false, failureRedirect: "/login" }), (req, res) => {
  const payload = {
    userId: req.user._id,
    email: req.user.email,
    username: req.user.username,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

  // Redirect to your deployed frontend
  res.redirect(`https://e-commerce-orfgivnf8-silvercrows-projects.vercel.app/auth/google/callback?token=${token}`);
});

app.get("/api/user/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error while fetching profile." });
  }
});

app.put("/api/user/address", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const { street, city, postalCode, country } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.address = {
      street,
      city,
      postalCode,
      country,
    };

    const updatedUser = await user.save();

    res.status(200).json({
      message: "Address updated successfully!",
      address: updatedUser.address,
    });
  } catch (error) {
    console.error("Error updating user address:", error);
    res.status(500).json({ message: "Server error while updating address." });
  }
});

app.post("/api/create-payment-intent", authMiddleware, async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    const userId = req.user.userId;

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country || !shippingAddress.phone) {
      return res.status(400).json({ error: "Complete shipping address is required" });
    }

    // Debug: Log userId to ensure it's correct
    console.log("Looking for cart with userId:", userId);
    console.log("userId type:", typeof userId);

    // Fetch user's cart
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    // Debug: Log the cart result
    console.log("Cart found:", cart);
    console.log("Cart items:", cart?.items);
    console.log("Cart items length:", cart?.items?.length);

    if (!cart) {
      return res.status(400).json({ error: "No cart found for user" });
    }

    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Debug: Log each item
    cart.items.forEach((item, index) => {
      console.log(`Item ${index}:`, {
        productId: item.productId,
        quantity: item.quantity,
        productExists: !!item.productId,
      });
    });

    // Filter valid items and calculate totals
    const validItems = cart.items.filter((item) => item.productId);
    console.log("Valid items count:", validItems.length);

    if (validItems.length === 0) {
      return res.status(400).json({ error: "No valid items in cart" });
    }

    const cartTotal = validItems.reduce((total, item) => total + item.quantity * item.productId.price, 0);

    const discountAmount = cart.promoCode === "CROW10" ? cartTotal * 0.1 : 0;
    const discountedTotal = cartTotal - discountAmount;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(discountedTotal * 100), // Convert to cents
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
});

// Confirm payment and create order
app.post("/api/confirm-payment", authMiddleware, async (req, res) => {
  try {
    const { paymentIntentId, shippingAddress } = req.body;
    const userId = req.user.userId;

    if (!paymentIntentId || !shippingAddress) {
      return res.status(400).json({ error: "Payment ID and shipping address are required" });
    }

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ error: "Payment not successful" });
    }

    // Verify the payment belongs to this user
    if (paymentIntent.metadata.userId !== userId.toString()) {
      return res.status(403).json({ error: "Payment verification failed" });
    }

    // Check if order already exists (prevent duplicate orders)
    const existingOrder = await Order.findOne({ paymentIntentId });
    if (existingOrder) {
      return res.status(400).json({ error: "Order already exists for this payment" });
    }

    // Fetch user's cart
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const validItems = cart.items.filter((item) => item.productId);

    // Calculate totals
    const cartTotal = validItems.reduce((total, item) => total + item.quantity * item.productId.price, 0);
    const discountAmount = cart.promoCode === "CROW10" ? cartTotal * 0.1 : 0;
    const discountedTotal = cartTotal - discountAmount;

    // Create order
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

    // Update user's address
    await User.findByIdAndUpdate(userId, {
      address: shippingAddress,
    });

    // Clear the cart
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
});

// Get payment status
app.get("/api/payment-status/:paymentIntentId", authMiddleware, async (req, res) => {
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
});

mongoose
  .connect(dbURI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(port, () => {
      console.log(`🚀 Server listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ DATABASE CONNECTION FAILED:", err);
    process.exit(1);
  });
