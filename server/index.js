const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2/promise");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

require("dotenv").config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// const allowedOrigins = (
//   process.env.CORS_ORIGIN ||
//   "http://localhost:5173,https://chaitraventures.vertexsoftware.in"
// )
//   .split(",")
//   .map((origin) => origin.trim())
//   .filter(Boolean);

const allowedOrigins = process.env.CORS_ORIGIN;
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);

// ------------------------------------
// Database pool
// ------------------------------------

const parsedDbPort = Number.parseInt(
  String(process.env.DB_PORT || "3306"),
  10
);

const dbPort =
  Number.isInteger(parsedDbPort) &&
  parsedDbPort > 0 &&
  parsedDbPort <= 65535
    ? parsedDbPort
    : 3306;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: dbPort,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// ------------------------------------
// Health routes
// ------------------------------------

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Chaitra Ventures API is running",
  });
});

app.get("/api/health", async (req, res) => {
  let database = "unavailable";

  try {
    await pool.query("SELECT 1");
    database = "connected";
  } catch (error) {
    console.error("Database health check failed", {
      code: error?.code,
      message: error?.message,
    });
  }

  res.status(200).json({
    success: true,
    service: "Chaitra Ventures API",
    database,
    timestamp: new Date().toISOString(),
  });
});

// ------------------------------------
// Keep all your existing routes here
// ------------------------------------

// Admin login
app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body || {};

  if (!JWT_SECRET || !ADMIN_USERNAME || !ADMIN_PASSWORD) {
    return res.status(500).json({
      success: false,
      message: "Authentication is not configured on the server",
    });
  }

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required",
    });
  }

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({
      success: false,
      message: "Invalid username or password",
    });
  }

  const token = jwt.sign({ role: "admin", username }, JWT_SECRET, {
    expiresIn: "7d",
  });

  return res.status(200).json({
    success: true,
    token,
  });
});

// Public properties
// Admin properties
// Projects
// Enquiries
// Uploads
// Featured properties
// Buy and Rent routes

// ------------------------------------
// JSON 404
// ------------------------------------

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
  });
});

// ------------------------------------
// Error middleware
// ------------------------------------

app.use((error, req, res, next) => {
  console.error("API error", {
    name: error?.name,
    code: error?.code,
    message: error?.message,
  });

  res.status(error.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message,
  });
});

// ------------------------------------
// Local execution
// ------------------------------------

const PORT = Number.parseInt(process.env.PORT || "5001", 10);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Chaitra Ventures API running on port ${PORT}`);
  });
}

// Required by Vercel
module.exports = app;
