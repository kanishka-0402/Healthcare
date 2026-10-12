
const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getPatient,
  getAllUsers,
  createDoctor,
} = require("../controllers/authController");

const { createInitialAdmin } = require("../controllers/adminSetupController");
const User = require("../models/User");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/setup-admin", createInitialAdmin);

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("name email role");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    console.log("PROFILE ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
});
router.get(
  "/patient",
  authMiddleware,
  roleMiddleware("patient"),
  getPatient
);
router.get(
  "/admin/users",
  authMiddleware,
  roleMiddleware("admin"),
  getAllUsers
);
router.post(
  "/admin/doctors",
  authMiddleware,
  roleMiddleware("admin"),
  createDoctor
);

router.get("/test", (req, res) => {
  res.json({
    message: "Auth route is working",
  });
});

module.exports = router;
