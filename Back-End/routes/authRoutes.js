const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const passport = require("passport");
const authMiddleware = require("../middleware/authMiddleware");
const { validateRegistration, validateVerifying, validateLogin, validateForgotPassword, validateResetPassword } = require("../middleware/Validators/authValidators");

router.post("/register", validateRegistration, authController.registerUser);
router.post("/verify", validateVerifying, authController.verifyUser);
router.post("/login", validateLogin, authController.loginUser);
router.post("/forgot-password", validateForgotPassword, authController.forgotPassword);
router.post("/reset-password/:userId/:token", validateResetPassword, authController.resetPassword);
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
router.get("/google/callback", passport.authenticate("google", { session: false, failureRedirect: "/login" }), authController.googleCallback);
router.get("/me", authMiddleware, authController.getFreshUser);

module.exports = router;
