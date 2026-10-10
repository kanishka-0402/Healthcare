const express = require("express");
const { createInitialAdmin } = require("../controllers/adminSetupController");
const router = express.Router();

const {
  register,
  login,
  getPatient,
  getAllUsers,
  createDoctor
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/setup-admin", createInitialAdmin);

router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "You are authenticated",
    user: req.user
  });
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
    message: "Auth route is working"
  });
});

module.exports = router;

