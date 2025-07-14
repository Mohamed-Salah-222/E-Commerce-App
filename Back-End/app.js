// app.js - Final Version with all routes

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendVerificationEmail } = require("./services/emailServices");

// --- Import All Models & Middleware ---
const User = require("./models/user");
const Product = require("./models/product");
const Cart = require("./models/cart");
const Order = require("./models/order");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();
const port = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

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

// --- API ROUTES ---

// --- AUTH ROUTES ---
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

// --- PRODUCT ROUTES ---
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

// --- CART & ORDER ROUTES (The final piece) ---
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
    // Get size and color from the URL's query string
    const { size, color } = req.query;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    // Filter items, keeping everything that does NOT match
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

    // --- THIS IS THE CRUCIAL FIX ---
    // We first filter the cart items to only include valid ones where the product exists.
    const validItems = cart.items.filter((item) => item.productId);

    if (validItems.length === 0) {
      return res.status(400).json({ message: "Cart contains no valid items to order." });
    }
    // --- END OF FIX ---

    // Now, we use the 'validItems' array for all calculations and for creating the order.
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
      // We map over 'validItems' now, not 'cart.items'
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

    // Clear the cart completely
    cart.items = [];
    cart.promoCode = "";
    await cart.save();

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Server error while creating order." });
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

// PATCH /api/cart/promo - Apply a promo code to the cart
app.patch("/api/cart/promo", authMiddleware, async (req, res) => {
  try {
    const { promoCode } = req.body;
    const userId = req.user.userId;

    if (typeof promoCode !== "string") {
      return res.status(400).json({ message: "Promo code must be a string." });
    }

    // Find the user's cart and update the promoCode field
    // { new: true } ensures the updated document is returned
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

// --- Database Connection & Server Start ---
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
