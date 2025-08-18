const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../services/emailServices");
//*---------------------------------------------------------------------------------Register---------------------------------------------------------------------------------
const registerUser = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;
    let user = req.user;
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
    next(error);
  }
};
//*---------------------------------------------------------------------------------Verify---------------------------------------------------------------------------------
const verifyUser = async (req, res, next) => {
  try {
    const user = req.user;
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Account verified successfully! You can now log in." });
  } catch (error) {
    next(error);
  }
};
//*---------------------------------------------------------------------------------Login---------------------------------------------------------------------------------
const loginUser = async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = req.user;
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const payload = { userId: user._id, email: user.email, username: user.username };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ message: "Logged in successfully!", token });
  } catch (error) {
    next(error);
  }
};
//*---------------------------------------------------------------------------Forgot-Password--------------------------------------------------------------------------------
const forgotPassword = async (req, res, next) => {
  try {
    let user = req.user;
    const resetSecret = process.env.JWT_SECRET + user.password;
    const payload = { email: user.email, id: user._id };
    const token = jwt.sign(payload, resetSecret, { expiresIn: "15m" });
    await sendPasswordResetEmail(user.email, user._id, token);
    res.status(200).json({ message: "If an account with that email exists, a password reset link has been sent." });
  } catch (error) {
    next(error);
  }
};
//*-------------------------------------------------------------------------------Reset-Password------------------------------------------------------------------------------
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = req.user;
    const resetSecret = process.env.JWT_SECRET + user.password;
    jwt.verify(token, resetSecret);
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error) {
    next(error);
  }
};
//*-------------------------------------------------------------------------------Google------------------------------------------------------------------------------
const googleCallback = (req, res, next) => {
  const payload = {
    userId: req.user._id,
    email: req.user.email,
    username: req.user.username,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.redirect(`https://e-commerce-app-neon-eight.vercel.app/auth/google/callback?token=${token}`);
};
//*-------------------------------------------------------------------------------Fresh------------------------------------------------------------------------------
const getFreshUser = async (req, res, next) => {
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
    next(error);
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
