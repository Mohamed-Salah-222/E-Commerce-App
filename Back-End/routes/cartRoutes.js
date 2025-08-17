const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, cartController.getCart);
router.post("/", authMiddleware, cartController.AddToCart);
router.delete("/items/:productId", authMiddleware, cartController.deleteItemFromCart);
router.patch("/promo", authMiddleware, cartController.promoCode);
module.exports = router;
