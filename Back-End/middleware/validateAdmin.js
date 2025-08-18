const User = require("./models/User");

const validateAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No userId found" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.admin) {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = validateAdmin;
