require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/appointments", appointmentRoutes);


app.get("/", (req, res) => {
    res.send("healthcare web is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.get("/api/reports-debug", (req, res) => {
  res.json({ message: "Server reports path working" });
});
app.get("/api/reports-test", (req, res) => {
  res.json({ message: "Reports route test working" });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("server is running");
});