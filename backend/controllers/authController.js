const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "patient",
    });

    return res.status(201).json({
      message: "Patient registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("REGISTER ERROR:", error);

    return res.status(500).json({
      message: "Registration failed",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "Server authentication is not configured",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("LOGIN ERROR:", error);

    return res.status(500).json({
      message: "Login failed",
    });
  }
};

const getPatient = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "name email role"
    );

    if (!user || user.role !== "patient") {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    return res.status(200).json({
      message: "Welcome Patient",
      user,
    });
  } catch (error) {
    console.log("GET PATIENT ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch patient details",
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: ["patient", "doctor"] },
    })
      .select("name email role")
      .sort({ name: 1 });

    const patients = users.filter(
      (user) => user.role === "patient"
    );

    const doctors = users.filter(
      (user) => user.role === "doctor"
    );

    return res.status(200).json({
      message: "Users fetched successfully",
      patients,
      doctors,
    });
  } catch (error) {
    console.log("GET USERS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch users",
    });
  }
};

const createDoctor = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const doctor = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "doctor",
    });

    return res.status(201).json({
      message: "Doctor account created successfully",
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        role: doctor.role,
      },
    });
  } catch (error) {
    console.log("CREATE DOCTOR ERROR:", error);

    return res.status(500).json({
      message: "Failed to create doctor account",
    });
  }
};

module.exports = {
  register,
  login,
  getPatient,
  getAllUsers,
  createDoctor,
};

