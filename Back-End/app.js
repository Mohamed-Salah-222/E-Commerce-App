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

const cloudinary = require("cloudinary").v2;
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
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

app.post("/api/admin/products", authMiddleware, upload.single("productImage"), async (req, res) => {
  try {
    const { name, description, price, imageUrl, sizes, colors, status } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required." });
    }

    let finalImageUrl = imageUrl?.trim() || "";

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "products",
      });
      finalImageUrl = result.secure_url;
    }

    // FIX: Handle both string and array formats for sizes/colors
    let sizesArray = [];
    let colorsArray = [];

    if (typeof sizes === "string") {
      sizesArray = sizes
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "");
    } else if (Array.isArray(sizes)) {
      sizesArray = sizes.filter((s) => s.trim() !== "");
    }

    if (typeof colors === "string") {
      colorsArray = colors
        .split(",")
        .map((c) => c.trim())
        .filter((c) => c !== "");
    } else if (Array.isArray(colors)) {
      colorsArray = colors.filter((c) => c.trim() !== "");
    }

    const newProduct = new Product({
      name: name.trim(),
      description: description?.trim() || "",
      price: parseFloat(price),
      imageUrl: finalImageUrl,
      sizes: sizesArray,
      colors: colorsArray,
      status: status || "available",
    });

    const savedProduct = await newProduct.save();
    res.status(201).json({ product: savedProduct });
  } catch (error) {
    console.error("Error creating product:", error);
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
app.delete("/api/admin/products/:productId", authMiddleware, async (req, res) => {
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

    const { username, address } = req.body;

    const userToUpdate = await User.findById(userId);

    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found." });
    }

    if (username) userToUpdate.username = username;
    if (address) userToUpdate.address = address;

    const updatedUser = await userToUpdate.save();

    const userResponse = {
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
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
//*--------Admin Section
app.get("/api/admin/orders", authMiddleware, async (req, res) => {
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
});

app.patch("/api/admin/orders/:id", authMiddleware, async (req, res) => {
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
});

app.patch("/api/admin/user/:id", authMiddleware, async (req, res) => {
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
});

app.get("/api/admin/users", authMiddleware, async (req, res) => {
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
});

app.patch("/api/admin/product/:id", authMiddleware, async (req, res) => {
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
});

app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      address: user.address,
      admin: user.admin,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user data" });
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

  res.redirect(`https://e-commerce-app-neon-eight.vercel.app/auth/google/callback?token=${token}`);
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

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country || !shippingAddress.phone) {
      return res.status(400).json({ error: "Complete shipping address is required" });
    }

    console.log("Looking for cart with userId:", userId);
    console.log("userId type:", typeof userId);

    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart) {
      return res.status(400).json({ error: "No cart found for user" });
    }

    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const validItems = cart.items.filter((item) => item.productId);
    console.log("Valid items count:", validItems.length);

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
});

app.post("/api/confirm-payment", authMiddleware, async (req, res) => {
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
});

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
