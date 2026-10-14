require("dotenv").config();

const express = require("express");
const cors = require("cors");
require("./config/db");
const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/appointments", appointmentRoutes);
app.use("/api/chatbot", chatbotRoutes);

app.get("/", (req, res) => {
    res.send("healthcare web is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("server is running");
});