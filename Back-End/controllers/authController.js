const User = require("../models/user");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../services/emailServices");
//*---------------------------------------------------------------------------------Register---------------------------------------------------------------------------------
const registerUser = async (req, res) => {
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
};
//*---------------------------------------------------------------------------------Verify---------------------------------------------------------------------------------
const verifyUser = async (req, res) => {
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
};
//*---------------------------------------------------------------------------------Login---------------------------------------------------------------------------------
const loginUser = async (req, res) => {
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
};
//*---------------------------------------------------------------------------Forgot-Password--------------------------------------------------------------------------------
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`Password reset requested for non-existent user: ${email}`);
      return res.status(200).json({ message: "If an account with that email exists, a password reset link has been sent." });
    }
    const resetSecret = process.env.JWT_SECRET + user.password;
    const payload = { email: user.email, id: user._id };
    const token = jwt.sign(payload, resetSecret, { expiresIn: "15m" });
    await sendPasswordResetEmail(user.email, user._id, token);
    res.status(200).json({ message: "If an account with that email exists, a password reset link has been sent." });
  } catch (error) {
    console.error("Error in forgot password process:", error);
    res.status(500).json({ message: "An error occurred. Please try again later." });
  }
};
//*-------------------------------------------------------------------------------Reset-Password------------------------------------------------------------------------------
const resetPassword = async (req, res) => {
  try {
    const { userId, token } = req.params;
    const { password } = req.body;
    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const resetSecret = process.env.JWT_SECRET + user.password;
    jwt.verify(token, resetSecret);
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(400).json({ message: "Invalid or expired password reset link." });
  }
};
//*-------------------------------------------------------------------------------Google------------------------------------------------------------------------------
const googleCallback = (req, res) => {
  const payload = {
    userId: req.user._id,
    email: req.user.email,
    username: req.user.username,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.redirect(`https://e-commerce-app-neon-eight.vercel.app/auth/google/callback?token=${token}`);
};
//*-------------------------------------------------------------------------------Fresh------------------------------------------------------------------------------
const getFreshUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      address: user.address,
      admin: user.admin,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user data" });
  }
};
module.exports = {
  registerUser,
  verifyUser,
  loginUser,
  forgotPassword,
  resetPassword,
  googleCallback,
  getFreshUser,
};
