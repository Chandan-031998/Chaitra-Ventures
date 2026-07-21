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
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "chaitraventures";

const CORS_ORIGIN = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const app = express();
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "10mb" }));

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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (_req, file, cb) => {
    const ok = /image\/(jpeg|png|webp)/.test(file.mimetype);
    cb(ok ? null : new Error("Only JPG/PNG/WEBP images are allowed"), ok);
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
  connectionLimit: 10,
  queueLimit: 0,
});

// -----------------------------
// Helpers
// -----------------------------
const ok = (res, data) => res.json(data);

function auth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).send("Missing token");
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).send("Invalid token");
  }
}

function asJsonArray(v) {
  if (v == null) return [];
  if (Array.isArray(v)) return v;

  // mysql2 may return JSON columns as string or object depending on config
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  if (typeof v === "object") {
    return Array.isArray(v) ? v : [];
  }
  return [];
}

function normEnum(v) {
  return String(v ?? "").trim().toLowerCase();
}

function toListingType(v) {
  const s = normEnum(v);
  if (!s) return "";
  if (s === "sale" || s === "buy" || s === "selling") return "sale";
  if (s === "rent" || s === "rental") return "rent";
  return s;
}

function toPropertyType(v) {
  const s = normEnum(v);
  if (!s) return "apartment";
  if (s === "apt" || s === "apartment") return "apartment";
  if (s === "villa") return "villa";
  if (s === "plot" || s === "land") return "plot";
  if (s === "commercial") return "commercial";
  return "apartment";
}

function toStatus(v) {
  const s = normEnum(v);
  if (!s) return "available";
  if (s === "available") return "available";
  if (s === "sold") return "sold";
  if (s === "rented") return "rented";
  return "available";
}

function titleCase(v) {
  const s = String(v ?? "");
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

// ---- IMPORTANT FIX: absolute URL for uploaded images
function publicBase(req) {
  return (process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
}

function toPublicUrl(req, url) {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url; // already absolute
  const base = publicBase(req);
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

// DB -> Frontend shape
function rowToProperty(req, r) {
  const listing_type = r.listing_type;
  const property_type = r.property_type;
  const status = r.status;

  const images = asJsonArray(r.images).map((u) => toPublicUrl(req, u));
  const amenities = asJsonArray(r.amenities);

  return {
    id: r.id,
    title: r.title,
    location: r.location,
    description: r.description,
    price: r.price,
    listing_type: listing_type, // "sale" | "rent"

    // UI friendly fields (if your UI uses them)
    category: listing_type === "rent" ? "rent" : "buy",
    property_type: property_type, // "apartment" | "villa" | "plot" | "commercial"
    type: titleCase(property_type),
    status: titleCase(status),

    bedrooms: r.bedrooms,
    bathrooms: r.bathrooms,
    area: r.area,

    featured: !!r.featured,
    images,
    amenities,
    created_at: r.created_at,
  };
}

// -----------------------------
// Health
// -----------------------------
app.get("/api/health", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 as ok");
    ok(res, { ok: true, db: rows?.[0]?.ok === 1 });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

// -----------------------------
// Public APIs
// -----------------------------

// Featured properties
app.get("/api/properties/featured", async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 6), 50);
  try {
    const [rows] = await pool.query(
      "SELECT * FROM properties WHERE featured=1 ORDER BY created_at DESC LIMIT ?",
      [limit]
    );
    ok(res, rows.map((r) => rowToProperty(req, r)));
  } catch (e) {
    res.status(500).send(e.message || "DB error");
  }
});

// List properties with filters
// Required query: listing_type=sale|rent
app.get("/api/properties", async (req, res) => {
  const listing_type = toListingType(req.query.listing_type);
  if (!listing_type) return res.status(400).send("listing_type is required (sale|rent)");

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
    if (bedrooms >= 4) where.push("bedrooms >= 4");
    else {
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
    ok(res, rows.map((r) => rowToProperty(req, r)));
  } catch (e) {
    res.status(500).send(e.message || "DB error");
  }
});

// Property details
app.get("/api/properties/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const [rows] = await pool.query("SELECT * FROM properties WHERE id = ? LIMIT 1", [id]);
    const row = rows?.[0];
    if (!row) return res.status(404).send("Not found");
    ok(res, rowToProperty(req, row));
  } catch (e) {
    res.status(500).send(e.message || "DB error");
  }
});

// Projects
app.get("/api/projects", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM projects ORDER BY created_at DESC");
    ok(res, rows);
  } catch (e) {
    res.status(500).send(e.message || "DB error");
  }
});

// Testimonials
app.get("/api/testimonials", async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 3), 50);
  try {
    const [rows] = await pool.query(
      "SELECT * FROM testimonials ORDER BY created_at DESC LIMIT ?",
      [limit]
    );
    ok(res, rows);
  } catch (e) {
    res.status(500).send(e.message || "DB error");
  }
});

// Enquiries
app.post("/api/enquiries", async (req, res) => {
  const { name, email, phone, message, property_id = null } = req.body || {};
  if (!name || !email || !phone || !message) return res.status(400).send("Missing fields");
  try {
    const [result] = await pool.query(
      "INSERT INTO enquiries (property_id, name, email, phone, message) VALUES (?,?,?,?,?)",
      [property_id, name, email, phone, message]
    );
    ok(res, { ok: true, id: result.insertId });
  } catch (e) {
    res.status(500).send(e.message || "DB error");
  }
});

// -----------------------------
// Admin APIs
// -----------------------------
app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).send("Invalid credentials");
  }
  const token = jwt.sign({ role: "admin", username }, JWT_SECRET, { expiresIn: "7d" });
  ok(res, { token });
});

// Upload images (multipart/form-data: images[])
app.post("/api/admin/upload", auth, upload.array("images", 10), async (req, res) => {
  try {
    const files = Array.isArray(req.files) ? req.files : [];
    if (!files.length) return res.status(400).send("No files uploaded");
    const urls = files.map((f) => toPublicUrl(req, `/uploads/${f.filename}`)); // ✅ absolute
    ok(res, { urls });
  } catch (e) {
    res.status(500).send(e.message || "Upload error");
  }
});

// List properties (admin)
app.get("/api/admin/properties", auth, async (req, res) => {
  const listing_type = req.query.listing_type ? toListingType(req.query.listing_type) : null;

  const where = [];
  const params = [];
  if (listing_type) {
    where.push("listing_type = ?");
    params.push(listing_type);
  }

  const sql = `SELECT * FROM properties ${
    where.length ? "WHERE " + where.join(" AND ") : ""
  } ORDER BY created_at DESC`;

  try {
    const [rows] = await pool.query(sql, params);
    ok(res, rows.map((r) => rowToProperty(req, r)));
  } catch (e) {
    res.status(500).send(e.message || "DB error");
  }
});

// Create/Update property (admin)
// Works with your schema columns: bedrooms, bathrooms, area, images, amenities
app.post("/api/admin/properties", auth, async (req, res) => {
  const p = req.body || {};

  // Accept both UI names and DB names
  const listing_type = toListingType(p.listing_type ?? p.category);
  const property_type = toPropertyType(p.property_type ?? p.type);
  const status = toStatus(p.status);

  const title = String(p.title ?? "").trim();
  const location = String(p.location ?? "").trim();
  if (!listing_type) return res.status(400).send("Missing: listing_type");
  if (!title) return res.status(400).send("Missing: title");
  if (!location) return res.status(400).send("Missing: location");

  // schema uses bedrooms/bathrooms/area
  const bedrooms = Number(p.bedrooms ?? p.beds ?? 0);
  const bathrooms = Number(p.bathrooms ?? p.baths ?? 0);
  const area = Number(p.area ?? p.area_sqft ?? 0);

  const imagesArr = Array.isArray(p.images) ? p.images : [];
  const amenitiesArr = Array.isArray(p.amenities) ? p.amenities : [];

  // Store JSON columns
  const images = JSON.stringify(imagesArr);
  const amenities = JSON.stringify(amenitiesArr);

  const featured = p.featured ? 1 : 0;
  const price = Number(p.price ?? 0);

  const id = p.id ? Number(p.id) : null;

  try {
    if (!id) {
      const [r] = await pool.query(
        `INSERT INTO properties
          (title, description, price, listing_type, property_type, location, bedrooms, bathrooms, area, images, amenities, featured, status)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          title,
          String(p.description ?? ""),
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
      return ok(res, { ok: true, id: r.insertId });
    }

    await pool.query(
      `UPDATE properties SET
        title=?, description=?, price=?, listing_type=?, property_type=?, location=?,
        bedrooms=?, bathrooms=?, area=?, images=?, amenities=?, featured=?, status=?
       WHERE id=?`,
      [
        title,
        String(p.description ?? ""),
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
  } catch (e) {
    res.status(500).send(e.message || "DB error");
  }
});

app.delete("/api/admin/properties/:id", auth, async (req, res) => {
  const id = Number(req.params.id);
  try {
    await pool.query("DELETE FROM properties WHERE id = ?", [id]);
    ok(res, { ok: true });
  } catch (e) {
    res.status(500).send(e.message || "DB error");
  }
});

// Projects (admin)
app.get("/api/admin/projects", auth, async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM projects ORDER BY created_at DESC");
    ok(res, rows);
  } catch (e) {
    res.status(500).send(e.message || "DB error");
  }
});

app.post("/api/admin/projects", auth, async (req, res) => {
  const p = req.body || {};
  const required = ["name", "location", "image", "status", "completion_year", "type", "description"];
  for (const k of required) {
    if (p[k] == null || p[k] === "") return res.status(400).send(`Missing: ${k}`);
  }

  const id = p.id ? Number(p.id) : null;

  try {
    if (!id) {
      const [r] = await pool.query(
        `INSERT INTO projects (name, location, image, status, completion_year, units, type, description)
         VALUES (?,?,?,?,?,?,?,?)`,
        [
          String(p.name),
          String(p.location),
          String(p.image),
          String(p.status),
          String(p.completion_year),
          Number(p.units || 0),
          String(p.type),
          String(p.description),
        ]
      );
      return ok(res, { ok: true, id: r.insertId });
    }

    await pool.query(
      `UPDATE projects SET name=?, location=?, image=?, status=?, completion_year=?, units=?, type=?, description=? WHERE id=?`,
      [
        String(p.name),
        String(p.location),
        String(p.image),
        String(p.status),
        String(p.completion_year),
        Number(p.units || 0),
        String(p.type),
        String(p.description),
        id,
      ]
    );
    ok(res, { ok: true, id });
  } catch (e) {
    res.status(500).send(e.message || "DB error");
  }
});

app.delete("/api/admin/projects/:id", auth, async (req, res) => {
  const id = Number(req.params.id);
  try {
    await pool.query("DELETE FROM projects WHERE id = ?", [id]);
    ok(res, { ok: true });
  } catch (e) {
    res.status(500).send(e.message || "DB error");
  }
});

// -----------------------------
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
  console.log(`Uploads served at http://localhost:${PORT}/uploads`);
});
