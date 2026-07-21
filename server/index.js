// index.js (Chaitra Real Estate - MySQL + Image Upload)
// -----------------------------------------------------
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2/promise");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
require("dotenv").config();

const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const CORS_ORIGIN = (
  process.env.CORS_ORIGIN ||
  "http://localhost:5173,https://chairaventures.vertexsoftware.in"
)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const IS_PRODUCTION = process.env.NODE_ENV === "production";

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || CORS_ORIGIN.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// -----------------------------
// Uploads (serve uploaded images)
// -----------------------------
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use("/uploads", express.static(UPLOAD_DIR));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const safeExt = [".jpg", ".jpeg", ".png", ".webp"].includes(ext) ? ext : ".jpg";
    const name = `img_${Date.now()}_${Math.random().toString(16).slice(2)}${safeExt}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /image\/(jpeg|png|webp)/.test(file.mimetype);
    cb(allowed ? null : new Error("Only JPG/PNG/WEBP images are allowed"), allowed);
  },
});

// -----------------------------
// MySQL Pool
// -----------------------------
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// -----------------------------
// Helpers
// -----------------------------
const ok = (res, data) => res.json(data);

function logServerError(scope, error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[${scope}] ${message}`);
}

function sendServerError(res, scope, error) {
  logServerError(scope, error);
  res.status(500).json({
    success: false,
    message: IS_PRODUCTION ? "Internal server error" : error?.message || "Internal server error",
  });
}

function ensureAuthConfig(res) {
  if (!JWT_SECRET || !ADMIN_USERNAME || !ADMIN_PASSWORD) {
    res.status(500).json({
      success: false,
      message: "Authentication is not configured on the server",
    });
    return false;
  }
  return true;
}

function auth(req, res, next) {
  if (!ensureAuthConfig(res)) return;

  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ success: false, message: "Missing token" });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
}

function asJsonArray(value) {
  if (value == null) return [];
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  if (typeof value === "object") {
    return Array.isArray(value) ? value : [];
  }

  return [];
}

function normEnum(value) {
  return String(value ?? "").trim().toLowerCase();
}

function toListingType(value) {
  const normalized = normEnum(value);
  if (!normalized) return "";
  if (normalized === "sale" || normalized === "buy" || normalized === "selling") return "sale";
  if (normalized === "rent" || normalized === "rental") return "rent";
  return normalized;
}

function toPropertyType(value) {
  const normalized = normEnum(value);
  if (!normalized) return "apartment";
  if (normalized === "apt" || normalized === "apartment") return "apartment";
  if (normalized === "villa") return "villa";
  if (normalized === "plot" || normalized === "land") return "plot";
  if (normalized === "commercial") return "commercial";
  return "apartment";
}

function toStatus(value) {
  const normalized = normEnum(value);
  if (!normalized) return "available";
  if (normalized === "available") return "available";
  if (normalized === "sold") return "sold";
  if (normalized === "rented") return "rented";
  return "available";
}

function titleCase(value) {
  const text = String(value ?? "");
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

function publicBase(req) {
  return (process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
}

function toPublicUrl(req, url) {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  const base = publicBase(req);
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

function rowToProperty(req, row) {
  const listing_type = row.listing_type;
  const property_type = row.property_type;
  const status = row.status;

  const images = asJsonArray(row.images).map((url) => toPublicUrl(req, url));
  const amenities = asJsonArray(row.amenities);

  return {
    id: row.id,
    title: row.title,
    location: row.location,
    description: row.description,
    price: row.price,
    listing_type,
    category: listing_type === "rent" ? "rent" : "buy",
    property_type,
    type: titleCase(property_type),
    status: titleCase(status),
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    area: row.area,
    featured: !!row.featured,
    images,
    amenities,
    created_at: row.created_at,
  };
}

// -----------------------------
// Status
// -----------------------------
app.get("/", (_req, res) => {
  ok(res, { success: true, message: "Chaitra Ventures API is running" });
});

app.get("/api/health", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    ok(res, {
      success: true,
      service: "Chaitra Ventures API",
      timestamp: new Date().toISOString(),
      database: rows?.[0]?.ok === 1 ? "connected" : "unavailable",
    });
  } catch (error) {
    logServerError("health", error);
    ok(res, {
      success: true,
      service: "Chaitra Ventures API",
      timestamp: new Date().toISOString(),
      database: "unavailable",
    });
  }
});

// -----------------------------
// Public APIs
// -----------------------------
app.get("/api/properties/featured", async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 6), 50);

  try {
    const [rows] = await pool.query(
      "SELECT * FROM properties WHERE featured=1 ORDER BY created_at DESC LIMIT ?",
      [limit]
    );
    ok(res, rows.map((row) => rowToProperty(req, row)));
  } catch (error) {
    sendServerError(res, "featured-properties", error);
  }
});

app.get("/api/properties", async (req, res) => {
  const listing_type = toListingType(req.query.listing_type);
  if (!listing_type) {
    return res.status(400).json({
      success: false,
      message: "listing_type is required (sale|rent)",
    });
  }

  const type = req.query.type ? toPropertyType(req.query.type) : null;
  const search = req.query.search ? String(req.query.search) : null;
  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;
  const bedrooms = req.query.bedrooms ? Number(req.query.bedrooms) : null;

  const where = ["listing_type = ?"];
  const params = [listing_type];

  if (type) {
    where.push("property_type = ?");
    params.push(type);
  }

  if (Number.isFinite(minPrice)) {
    where.push("price >= ?");
    params.push(minPrice);
  }

  if (Number.isFinite(maxPrice) && maxPrice > 0) {
    where.push("price <= ?");
    params.push(maxPrice);
  }

  if (Number.isFinite(bedrooms) && bedrooms > 0) {
    if (bedrooms >= 4) {
      where.push("bedrooms >= 4");
    } else {
      where.push("bedrooms = ?");
      params.push(bedrooms);
    }
  }

  if (search) {
    where.push("(title LIKE ? OR location LIKE ? OR description LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const sql = `SELECT * FROM properties WHERE ${where.join(" AND ")} ORDER BY created_at DESC`;

  try {
    const [rows] = await pool.query(sql, params);
    ok(res, rows.map((row) => rowToProperty(req, row)));
  } catch (error) {
    sendServerError(res, "list-properties", error);
  }
});

app.get("/api/properties/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const [rows] = await pool.query("SELECT * FROM properties WHERE id = ? LIMIT 1", [id]);
    const row = rows?.[0];
    if (!row) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    ok(res, rowToProperty(req, row));
  } catch (error) {
    sendServerError(res, "property-details", error);
  }
});

app.get("/api/projects", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM projects ORDER BY created_at DESC");
    ok(res, rows);
  } catch (error) {
    sendServerError(res, "list-projects", error);
  }
});

app.get("/api/testimonials", async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 3), 50);

  try {
    const [rows] = await pool.query(
      "SELECT * FROM testimonials ORDER BY created_at DESC LIMIT ?",
      [limit]
    );
    ok(res, rows);
  } catch (error) {
    sendServerError(res, "testimonials", error);
  }
});

app.post("/api/enquiries", async (req, res) => {
  const { name, email, phone, message, property_id = null } = req.body || {};
  if (!name || !email || !phone || !message) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO enquiries (property_id, name, email, phone, message) VALUES (?,?,?,?,?)",
      [property_id, name, email, phone, message]
    );
    ok(res, { ok: true, id: result.insertId });
  } catch (error) {
    sendServerError(res, "create-enquiry", error);
  }
});

// -----------------------------
// Admin APIs
// -----------------------------
app.post("/api/admin/login", async (req, res) => {
  if (!ensureAuthConfig(res)) return;

  const { username, password } = req.body || {};
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const token = jwt.sign({ role: "admin", username }, JWT_SECRET, { expiresIn: "7d" });
  ok(res, { token });
});

app.post("/api/admin/upload", auth, upload.array("images", 10), async (req, res) => {
  try {
    const files = Array.isArray(req.files) ? req.files : [];
    if (!files.length) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    const urls = files.map((file) => toPublicUrl(req, `/uploads/${file.filename}`));
    ok(res, { urls });
  } catch (error) {
    sendServerError(res, "admin-upload", error);
  }
});

app.get("/api/admin/properties", auth, async (req, res) => {
  const listing_type = req.query.listing_type ? toListingType(req.query.listing_type) : null;
  const where = [];
  const params = [];

  if (listing_type) {
    where.push("listing_type = ?");
    params.push(listing_type);
  }

  const sql = `SELECT * FROM properties ${
    where.length ? `WHERE ${where.join(" AND ")}` : ""
  } ORDER BY created_at DESC`;

  try {
    const [rows] = await pool.query(sql, params);
    ok(res, rows.map((row) => rowToProperty(req, row)));
  } catch (error) {
    sendServerError(res, "admin-list-properties", error);
  }
});

app.post("/api/admin/properties", auth, async (req, res) => {
  const property = req.body || {};
  const listing_type = toListingType(property.listing_type ?? property.category);
  const property_type = toPropertyType(property.property_type ?? property.type);
  const status = toStatus(property.status);
  const title = String(property.title ?? "").trim();
  const location = String(property.location ?? "").trim();

  if (!listing_type) {
    return res.status(400).json({ success: false, message: "Missing: listing_type" });
  }
  if (!title) {
    return res.status(400).json({ success: false, message: "Missing: title" });
  }
  if (!location) {
    return res.status(400).json({ success: false, message: "Missing: location" });
  }

  const bedrooms = Number(property.bedrooms ?? property.beds ?? 0);
  const bathrooms = Number(property.bathrooms ?? property.baths ?? 0);
  const area = Number(property.area ?? property.area_sqft ?? 0);
  const images = JSON.stringify(Array.isArray(property.images) ? property.images : []);
  const amenities = JSON.stringify(Array.isArray(property.amenities) ? property.amenities : []);
  const featured = property.featured ? 1 : 0;
  const price = Number(property.price ?? 0);
  const id = property.id ? Number(property.id) : null;

  try {
    if (!id) {
      const [result] = await pool.query(
        `INSERT INTO properties
          (title, description, price, listing_type, property_type, location, bedrooms, bathrooms, area, images, amenities, featured, status)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          title,
          String(property.description ?? ""),
          price,
          listing_type,
          property_type,
          location,
          bedrooms,
          bathrooms,
          area,
          images,
          amenities,
          featured,
          status,
        ]
      );
      return ok(res, { ok: true, id: result.insertId });
    }

    await pool.query(
      `UPDATE properties SET
        title=?, description=?, price=?, listing_type=?, property_type=?, location=?,
        bedrooms=?, bathrooms=?, area=?, images=?, amenities=?, featured=?, status=?
       WHERE id=?`,
      [
        title,
        String(property.description ?? ""),
        price,
        listing_type,
        property_type,
        location,
        bedrooms,
        bathrooms,
        area,
        images,
        amenities,
        featured,
        status,
        id,
      ]
    );

    ok(res, { ok: true, id });
  } catch (error) {
    sendServerError(res, "admin-upsert-property", error);
  }
});

app.delete("/api/admin/properties/:id", auth, async (req, res) => {
  const id = Number(req.params.id);

  try {
    await pool.query("DELETE FROM properties WHERE id = ?", [id]);
    ok(res, { ok: true });
  } catch (error) {
    sendServerError(res, "admin-delete-property", error);
  }
});

app.get("/api/admin/projects", auth, async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM projects ORDER BY created_at DESC");
    ok(res, rows);
  } catch (error) {
    sendServerError(res, "admin-list-projects", error);
  }
});

app.post("/api/admin/projects", auth, async (req, res) => {
  const project = req.body || {};
  const required = ["name", "location", "image", "status", "completion_year", "type", "description"];

  for (const field of required) {
    if (project[field] == null || project[field] === "") {
      return res.status(400).json({ success: false, message: `Missing: ${field}` });
    }
  }

  const id = project.id ? Number(project.id) : null;

  try {
    if (!id) {
      const [result] = await pool.query(
        `INSERT INTO projects (name, location, image, status, completion_year, units, type, description)
         VALUES (?,?,?,?,?,?,?,?)`,
        [
          String(project.name),
          String(project.location),
          String(project.image),
          String(project.status),
          String(project.completion_year),
          Number(project.units || 0),
          String(project.type),
          String(project.description),
        ]
      );
      return ok(res, { ok: true, id: result.insertId });
    }

    await pool.query(
      `UPDATE projects SET name=?, location=?, image=?, status=?, completion_year=?, units=?, type=?, description=? WHERE id=?`,
      [
        String(project.name),
        String(project.location),
        String(project.image),
        String(project.status),
        String(project.completion_year),
        Number(project.units || 0),
        String(project.type),
        String(project.description),
        id,
      ]
    );
    ok(res, { ok: true, id });
  } catch (error) {
    sendServerError(res, "admin-upsert-project", error);
  }
});

app.delete("/api/admin/projects/:id", auth, async (req, res) => {
  const id = Number(req.params.id);

  try {
    await pool.query("DELETE FROM projects WHERE id = ?", [id]);
    ok(res, { ok: true });
  } catch (error) {
    sendServerError(res, "admin-delete-project", error);
  }
});

app.use((error, _req, res, next) => {
  if (!error) {
    next();
    return;
  }

  if (error instanceof multer.MulterError) {
    res.status(400).json({ success: false, message: error.message });
    return;
  }

  if (
    error.message === "Origin not allowed by CORS" ||
    error.message === "Only JPG/PNG/WEBP images are allowed"
  ) {
    res.status(error.message === "Origin not allowed by CORS" ? 403 : 400).json({
      success: false,
      message: error.message,
    });
    return;
  }

  sendServerError(res, "unhandled", error);
});

if (require.main === module) {
  app.listen(process.env.PORT || 5001);
}

module.exports = app;
