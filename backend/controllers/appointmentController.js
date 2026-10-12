const Appointment = require("../models/appointment");
const User = require("../models/User");

// Book an appointment (Patient)
const bookAppointment = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({
        message: "Only patients can book appointments",
      });
    }

    const { doctor, appointmentDate, timeSlot, reason } = req.body;
    const patient = req.user.userId;

    if (!doctor || !appointmentDate || !timeSlot) {
      return res.status(400).json({
        message: "Doctor, appointment date and time slot are required",
      });
    }

    const selectedDoctor = await User.findOne({
      _id: doctor,
      role: "doctor",
    });

    if (!selectedDoctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    const date = new Date(appointmentDate);

    if (Number.isNaN(date.getTime()) || date <= new Date()) {
      return res.status(400).json({
        message: "Please select a valid future appointment date",
      });
    }

    const existingAppointment = await Appointment.findOne({
      doctor,
      appointmentDate: date,
      timeSlot,
      status: { $ne: "cancelled" },
    });

    if (existingAppointment) {
      return res.status(409).json({
        message: "This time slot is already booked",
      });
    }

    const appointment = await Appointment.create({
      patient,
      doctor,
      appointmentDate: date,
      timeSlot,
      reason,
    });

    return res.status(201).json({
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This time slot is already booked",
      });
    }

    console.error("Book appointment error:", error);

    return res.status(500).json({
      message: "Failed to book appointment",
    });
  }
};

// Get appointments for the logged-in patient
const getMyAppointments = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const appointments = await Appointment.find({
      patient: req.user.userId,
    })
      .populate("doctor", "name email")
      .sort({ appointmentDate: 1 });

    return res.status(200).json({ appointments });
  } catch (error) {
    console.error("Get patient appointments error:", error);

    return res.status(500).json({
      message: "Failed to fetch appointments",
    });
  }
};

// Get appointments for the logged-in doctor
const getDoctorAppointments = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({
        message: "Only doctors can access these appointments",
      });
    }

    const appointments = await Appointment.find({
      doctor: req.user.userId,
    })
      .populate("patient", "name email")
      .sort({ appointmentDate: 1 });

    return res.status(200).json({ appointments });
  } catch (error) {
    console.error("Get doctor appointments error:", error);

    return res.status(500).json({
      message: "Failed to fetch doctor appointments",
    });
  }
};

// Get all doctors for appointment booking
const getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({
      role: "doctor",
    }).select("_id name email");

    return res.status(200).json({ doctors });
  } catch (error) {
    console.error("Get doctors error:", error);

    return res.status(500).json({
      message: "Failed to fetch doctors",
    });
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getDoctors,
};
