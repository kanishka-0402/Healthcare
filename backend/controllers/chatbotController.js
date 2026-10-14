const { GoogleGenAI } = require("@google/genai");
const Appointment = require("../models/appointment");
const Report = require("../models/report");

const testChatbot = async (req, res) => {
  try {
    const { message } = req.body;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        message: "Please enter a message",
      });
    }

    const userId = req.user?.userId || req.user?.id || req.user?._id;
    const userRole = req.user?.role;

    if (!userId || !["patient", "doctor", "admin"].includes(userRole)) {
      return res.status(401).json({
        message: "Please log in again.",
      });
    }

    const text = message.trim();
    const lowerMessage = text.toLowerCase();

    const reportKeywords = [
      "report",
      "reports",
      "medical report",
      "medical reports",
      "test result",
      "test results",
    ];

    const asksAboutReports = reportKeywords.some((keyword) =>
      lowerMessage.includes(keyword)
    );

    const appointmentKeywords = [
      "appointment",
      "appointments",
      "schedule",
      "booking",
      "bookings",
      "time slot",
      "time slots",
      "next visit",
      "upcoming",
      "today",
      "tomorrow",
      "patient list",
      "patient names",
      "status",
    ];

    const asksAboutAppointments = appointmentKeywords.some((keyword) =>
      lowerMessage.includes(keyword)
    );

    if (asksAboutReports) {
      let filter = {};

      if (userRole === "patient") {
        filter.patientId = userId;
      } else if (userRole === "doctor") {
        filter.doctorId = userId;
      } else {
        return res.status(200).json({
          reply: "Please use the admin reports section to view reports.",
          userRole,
        });
      }

      const reports = await Report.find(filter)
        .populate("patientId", "name email")
        .sort({ reportDate: -1 })
        .limit(50)
        .lean();

      if (reports.length === 0) {
        return res.status(200).json({
          reply: "No medical reports were found.",
          userRole,
        });
      }

      const reply = reports
        .map((report, index) => {
          const date = new Date(report.reportDate).toLocaleDateString(
            "en-IN"
          );

          return `${index + 1}. Patient: ${
            report.patientId?.name || "Name unavailable"
          }
Email: ${report.patientId?.email || "Email unavailable"}
Test: ${report.testName}
Date: ${date}
Result: ${report.result}`;
        })
        .join("\n\n");

      return res.status(200).json({
        reply: `Here are your medical reports:\n\n${reply}`,
        userRole,
      });
    }

    if (asksAboutAppointments) {
      const filter = {};

      if (userRole === "patient") {
        filter.patient = userId;
      } else if (userRole === "doctor") {
        filter.doctor = userId;
      }

      let appointments = await Appointment.find(filter)
        .populate("patient", "name email")
        .populate("doctor", "name email")
        .sort({ appointmentDate: 1 })
        .limit(100)
        .lean();

      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (/\btoday\b/.test(lowerMessage)) {
        appointments = appointments.filter((appointment) => {
          const date = new Date(appointment.appointmentDate);
          return date >= today && date < tomorrow;
        });
      } else if (/\btomorrow\b/.test(lowerMessage)) {
        const dayAfterTomorrow = new Date(tomorrow);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

        appointments = appointments.filter((appointment) => {
          const date = new Date(appointment.appointmentDate);
          return date >= tomorrow && date < dayAfterTomorrow;
        });
      } else if (
        lowerMessage.includes("upcoming") ||
        lowerMessage.includes("next visit") ||
        lowerMessage.includes("next appointment")
      ) {
        appointments = appointments.filter(
          (appointment) =>
            new Date(appointment.appointmentDate) >= today &&
            !["cancelled", "completed"].includes(appointment.status)
        );
      }

      if (appointments.length === 0) {
        return res.status(200).json({
          reply: "No matching appointments were found.",
          userRole,
        });
      }

      const reply = appointments
        .map((appointment, index) => {
          const date = new Date(
            appointment.appointmentDate
          ).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          if (userRole === "doctor") {
            return `${index + 1}. Patient: ${
              appointment.patient?.name || "Patient unavailable"
            }
Email: ${appointment.patient?.email || "Email unavailable"}
Date: ${date}
Time: ${appointment.timeSlot}
Status: ${appointment.status}`;
          }

          if (userRole === "patient") {
            return `${index + 1}. Doctor: ${
              appointment.doctor?.name || "Doctor unavailable"
            }
Date: ${date}
Time: ${appointment.timeSlot}
Status: ${appointment.status}`;
          }

          return `${index + 1}. Patient: ${
            appointment.patient?.name || "Patient unavailable"
          }
Doctor: ${appointment.doctor?.name || "Doctor unavailable"}
Date: ${date}
Time: ${appointment.timeSlot}
Status: ${appointment.status}`;
        })
        .join("\n\n");

      return res.status(200).json({
        reply: `Here are the matching appointments:\n\n${reply}`,
        userRole,
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        message: "Gemini API key is not configured in backend .env",
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: `You are CarePoint's healthcare assistant.
The logged-in user's role is ${userRole}.
Answer general health education questions in a concise, friendly way.
Do not claim to have reviewed medical records unless the database provided them.
Do not diagnose diseases or replace a qualified healthcare professional's advice.
For medical emergencies, advise the user to contact local emergency services.

User question: ${text}`,
    });

    return res.status(200).json({
      reply: response.text || "Please try asking another question.",
      userRole,
    });
  } catch (error) {
    console.error("Chatbot error:", error);

    if (error.status === 503 || error.status === 429) {
      return res.status(503).json({
        message: "The AI service is temporarily busy. Please try again shortly.",
      });
    }

    return res.status(500).json({
      message: "Chatbot request failed. Please try again.",
    });
  }
};

module.exports = { testChatbot };
