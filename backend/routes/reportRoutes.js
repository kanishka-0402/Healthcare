
const express = require("express");

const {
  addReport,
  getMyReports,
  getDoctorReports,
} = require("../controllers/reportController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();



router.post(
  "/",
  authMiddleware,
  roleMiddleware("doctor", "admin"),
  addReport
);


router.get(
  "/",
  authMiddleware,
  roleMiddleware("doctor"),
  getDoctorReports
);


router.get(
  "/my-reports",
  authMiddleware,
  roleMiddleware("patient"),
  getMyReports
);

module.exports = router;

