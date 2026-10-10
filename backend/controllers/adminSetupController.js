const bcrypt = require("bcryptjs");
const User = require("../models/User");

const createInitialAdmin = async (req, res) => {
  try {
    const { name, email, password, setupKey } = req.body;

    if (setupKey !== process.env.ADMIN_SETUP_KEY) {
      return res.status(403).json({
        message: "Invalid setup key"
      });
    }

    const adminExists = await User.findOne({ role: "admin" });

    if (adminExists) {
      return res.status(403).json({
        message: "An admin account already exists"
      });
    }

    if (!name || !email || !password || password.length < 8) {
      return res.status(400).json({
        message: "Provide name, email and a password of at least 8 characters"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "This email is already registered. Use a different email."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin"
    });

    return res.status(201).json({
      message: "Initial admin created successfully",
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error("ADMIN SETUP ERROR:", error.message);

    return res.status(500).json({
      message: "Failed to create initial admin"
    });
  }
};

module.exports = { createInitialAdmin };

