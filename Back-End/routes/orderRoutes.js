const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, orderController.addOrder);
router.get("/", authMiddleware, orderController.getOrders);
module.exports = router;
