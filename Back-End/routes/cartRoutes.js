const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const authMiddleware = require("../middleware/authMiddleware");
const { attachCart } = require("../middleware/cartMiddleWare");

router.get("/", authMiddleware, attachCart, cartController.getCart);
router.post("/", authMiddleware, attachCart, cartController.AddToCart);
router.delete("/items/:productId", attachCart, authMiddleware, cartController.deleteItemFromCart);
router.patch("/promo", authMiddleware, attachCart, cartController.promoCode);
module.exports = router;
