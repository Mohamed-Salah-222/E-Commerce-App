const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const validateAdmin = require("../middleware/validateAdmin");

router.delete("/products/:productId", authMiddleware, adminController.deleteProductAdmin);
router.get("/orders", authMiddleware, validateAdmin, adminController.getOrdersAdmin);
router.patch("/orders/:id", authMiddleware, validateAdmin, adminController.updateOrderStatus);
router.patch("/user/:id", authMiddleware, validateAdmin, adminController.updateUserStatus);
router.get("/users", authMiddleware, validateAdmin, adminController.getUsers);
router.patch("/product/:id", authMiddleware, validateAdmin, adminController.updateProduct);

module.exports = router;
