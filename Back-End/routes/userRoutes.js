const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.put("/profile", authMiddleware, userController.updateUser);
router.get("/me", authMiddleware, userController.getUser);
router.put("/adress", authMiddleware, userController.updateAdress);

module.exports = router;
