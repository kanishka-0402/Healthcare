
const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
    patientId: {
        type: String,
        required: true
    },
    testName: {
        type: String,
        required: true
    },
    result: {
        type: String,
        required: true
    },
    reportDate: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Report", reportSchema);