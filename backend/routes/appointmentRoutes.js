const express = require("express");
const router = express.Router();

const {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getDoctors,
} = require("../controllers/appointmentController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, bookAppointment);

router.get("/my-appointments", authMiddleware, getMyAppointments);

router.get("/doctor", authMiddleware, getDoctorAppointments);

router.get("/doctors", authMiddleware, getDoctors);

module.exports = router;
