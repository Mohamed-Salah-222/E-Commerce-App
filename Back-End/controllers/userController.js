const User = require("../models/user");
//*------------------------------------------------------------------------------Update User Profile-------------------------------------------------------------------------------
const updateUser = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { username, address } = req.body;
    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found." });
    }
    if (username) userToUpdate.username = username;
    if (address) userToUpdate.address = address;
    const updatedUser = await userToUpdate.save();
    const userResponse = {
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      address: updatedUser.address,
    };
    res.status(200).json({
      message: "Profile updated successfully!",
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};
//*------------------------------------------------------------------------------Update User Profile-------------------------------------------------------------------------------
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
//*------------------------------------------------------------------------------Update User Profile-------------------------------------------------------------------------------
const updateAdress = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { street, city, postalCode, country } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    user.address = {
      street,
      city,
      postalCode,
      country,
    };
    const updatedUser = await user.save();
    res.status(200).json({
      message: "Address updated successfully!",
      address: updatedUser.address,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateUser,
  getUser,
  updateAdress,
};
