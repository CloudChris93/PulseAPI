const express = require("express");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const ingestRoutes = require("./routes/ingestRoutes");

const app = express();

const allowedOrigins = process.env.CLIENT_URL.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/ingest", ingestRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PulseAPI backend is running",
    data: null,
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PulseAPI API is healthy",
    data: {
      status: "ok",
    },
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    data: null,
  });
});

app.use(errorHandler);

module.exports = app;
