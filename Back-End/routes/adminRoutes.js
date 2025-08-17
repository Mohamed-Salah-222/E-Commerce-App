const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");

router.delete("/products/:productId", authMiddleware, adminController.deleteProductAdmin);
router.get("/orders", authMiddleware, adminController.getOrdersAdmin);
router.patch("/orders/:id", authMiddleware, adminController.updateOrderStatus);
router.patch("/user/:id", authMiddleware, adminController.updateUserStatus);
router.get("/users", authMiddleware, adminController.getUsers);
router.patch("/product/:id", authMiddleware, adminController.updateProduct);

module.exports = router;
