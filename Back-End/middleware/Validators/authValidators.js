const { body, param } = require("express-validator");
const User = require("../../models/user");
const handleValidationErrors = require("../handleValidationErrors");
//*>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Register
const validateRegistration = [
  body("email", "Please include a valid email")
    .isEmail()
    .custom(async (email, { req }) => {
      const user = await User.findOne({ email: email });
      if (user && user.isVerified) {
        return Promise.reject("This email is already registered and verified.");
      }
      req.user = user;
    }),
  body("username", "Username is required").not().isEmpty(),
  body("password", "Password must be 8 or more characters").isLength({ min: 8 }),

  handleValidationErrors,
];
//*>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Verify
const validateVerifying = [
  body("email", "Please include a valid email")
    .isEmail()
    .custom(async (email, { req }) => {
      const user = await User.findOne({ email });
      if (!user) {
        return Promise.reject("User not found. Please register first.");
      }
      req.user = user;
    }),
  body("verificationCode", "Verification code is required")
    .not()
    .isEmpty()
    .custom(async (verificationCode, { req }) => {
      const user = req.user;
      if (user.verificationCode !== verificationCode) {
        return Promise.reject("Invalid verification code.");
      }
      if (user.verificationCodeExpires < new Date()) {
        return Promise.reject("Verification code has expired.");
      }
    }),
  handleValidationErrors,
];
//*>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Login
const validateLogin = [
  body("email", "Please include a valid email")
    .isEmail()
    .custom(async (email, { req }) => {
      const user = await User.findOne({ email: email });
      if (!user) {
        return Promise.reject("Invalid Credentials.");
      }
      req.user = user;
    }),
  body("password", "Invalid Password").not().isEmpty(),
  handleValidationErrors,
];
//*>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Forgot-Password
const validateForgotPassword = [
  body("email", "Please include a valid email")
    .isEmail()
    .custom(async (email, { req }) => {
      const user = await User.findOne({ email });
      if (!user) {
        return Promise.reject("Email doesn't exist");
      }
      req.user = user;
    }),
  handleValidationErrors,
];
//*>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Reset-Password
const validateResetPassword = [
  param("userId", "Invalid user ID")
    .isMongoId()
    .custom(async (userId, { req }) => {
      const user = await User.findById(userId);
      if (!user) {
        return Promise.reject("User not found");
      }
      req.user = user;
    }),
  body("password", "Password must be 8 or more characters").isLength({ min: 8 }),
  handleValidationErrors,
];
module.exports = { validateRegistration, validateVerifying, validateLogin, validateForgotPassword, validateResetPassword };
