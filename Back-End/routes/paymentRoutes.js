const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create-payment-intent", authMiddleware, paymentController.createPaymentIntent);
router.post("/confirm-payment", authMiddleware, paymentController.confirmPayment);
router.post("/payment-status/:paymentIntentId", authMiddleware, paymentController.paymentStatus);

module.exports = router;
