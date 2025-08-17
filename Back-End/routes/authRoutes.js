const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const passport = require("passport");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", authController.registerUser);
router.post("/verify", authController.verifyUser);
router.post("/login", authController.loginUser);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:userId/:token", authController.resetPassword);
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
router.get("/google/callback", passport.authenticate("google", { session: false, failureRedirect: "/login" }), authController.googleCallback);
router.get("/me", authMiddleware, authController.getFreshUser);

module.exports = router;
