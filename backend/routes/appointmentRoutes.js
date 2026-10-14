const express = require("express");
const router = express.Router();

const {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getDoctors,
  getAllAppointments,
} = require("../controllers/appointmentController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/", authMiddleware, bookAppointment);

router.get("/my-appointments", authMiddleware, getMyAppointments);

router.get("/doctor", authMiddleware, getDoctorAppointments);

router.get("/doctors", authMiddleware, getDoctors);

router.get(
  "/admin/all",
  authMiddleware,
  roleMiddleware("admin"),
  getAllAppointments
);

module.exports = router;
