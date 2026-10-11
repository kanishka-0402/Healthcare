require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("../backend/routes/reportRoutes")

const app = express();

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
    res.send("healthcare web is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("server is running");
});