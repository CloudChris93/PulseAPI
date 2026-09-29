const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const protect = require("../middleware/auth");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Authenticated user retrieved successfully",
    data: {
      user: req.user,
    },
  });
});

module.exports = router;
