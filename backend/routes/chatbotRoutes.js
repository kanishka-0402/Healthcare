const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { testChatbot } = require("../controllers/chatbotController");

router.post("/", authMiddleware, (req, res, next) => {
  console.log("CHATBOT ROUTE HIT");
  next();
}, testChatbot);

module.exports = router;