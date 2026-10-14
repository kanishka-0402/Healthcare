const Report = require("../models/report");
const User = require("../models/User");

const addReport = async (req, res) => {
  try {
    const { patientId, testName, result, reportDate } = req.body;

    if (!patientId || !testName || !result || !reportDate) {
      return res.status(400).json({
        message: "Please provide all report details",
      });
    }

    const patient = await User.findById(patientId);

    if (!patient || patient.role !== "patient") {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    const report = await Report.create({
      patientId,
      testName,
      result,
      reportDate,
      doctorId: req.user.userId,
    });

    return res.status(201).json({
      message: "Report added successfully",
      report,
    });
  } catch (error) {
    console.error("Add report error:", error);

    return res.status(500).json({
      message: "Failed to add report",
    });
  }
};


const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({
      patientId: req.user.userId,
    }).sort({ reportDate: -1 });

    return res.status(200).json({
      message: "Reports fetched successfully",
      reports,
    });
  } catch (error) {
    console.error("Get patient reports error:", error);

    return res.status(500).json({
      message: "Failed to fetch reports",
    });
  }
};

const getDoctorReports = async (req, res) => {
  try {
    const reports = await Report.find({
      doctorId: req.user.userId,
    })
      .populate("patientId", "name email")
      .sort({ reportDate: -1 });

    const formattedReports = reports.map((report) => ({
      _id: report._id,
      patient: report.patientId
        ? {
            _id: report.patientId._id,
            name: report.patientId.name,
            email: report.patientId.email,
          }
        : null,
      testName: report.testName,
      result: report.result,
      reportDate: report.reportDate,
    }));

    return res.status(200).json({
      message: "Doctor reports fetched successfully",
      reports: formattedReports,
    });
  } catch (error) {
    console.error("Get doctor reports error:", error);

    return res.status(500).json({
      message: "Failed to fetch doctor reports",
    });
  }
};

module.exports = {
  addReport,
  getMyReports,
  getDoctorReports,
};
