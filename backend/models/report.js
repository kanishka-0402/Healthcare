const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    testName: {
      type: String,
      required: true,
      trim: true,
    },

    result: {
      type: String,
      required: true,
      trim: true,
    },

    reportDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Report", reportSchema);