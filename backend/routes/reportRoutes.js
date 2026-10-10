const express = require('express')
const { addReport, getMyReports } = require("../controllers/reportController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const router =express.Router();
router.post(
    "/",
    authMiddleware,
    roleMiddleware("doctor","admin"),
    addReport
);
module.exports = router;