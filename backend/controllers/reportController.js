
const Report = require("../models/report");
const User = require("../models/User");

const addReport = async (req, res) => {
    try {
        const { patientId, testName, result, reportDate } = req.body;

        if (!patientId || !testName || !result || !reportDate) {
            return res.status(400).json({
                message: "Please provide all report details"
            });
        }

        const patient = await User.findById(patientId);

        if (!patient || patient.role !== "patient") {
            return res.status(404).json({
                message: "Patient not found"
            });
        }

        const report = await Report.create({
            patientId,
            testName,
            result,
            reportDate
        });

        return res.status(201).json({
            message: "Report added successfully",
            report
        });

    } catch (error) {
        console.log("ADD REPORT ERROR:", error);

        return res.status(500).json({
            message: "Failed to add report"
        });
    }
};

module.exports = { addReport };