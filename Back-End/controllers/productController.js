const Product = require("../models/product");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

//*-------------------------------------------------------------------------------List All Products---------------------------------------------------------------------------------
const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};
//*-------------------------------------------------------------------------------Get product by ID---------------------------------------------------------------------------------
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ message: "Product not found." });
    }
  } catch (error) {
    next(error);
  }
};
//*-------------------------------------------------------------------------------Create New Product---------------------------------------------------------------------------------
const addProduct = async (req, res, next) => {
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
    next(error);
  }
};
//*-------------------------------------------------------------------------------Get product by ID---------------------------------------------------------------------------------
module.exports = {
  getAllProducts,
  getProductById,
  addProduct,
};
