// ============================================================
// loadEnv.js — Tiny .env Loader
// ============================================================
// We avoid adding an extra dependency for this assignment.
// This helper reads backend/.env and copies KEY=value pairs into
// process.env before db.js/server.js use them.
//
// It intentionally keeps the format simple:
//   PORT=5001
//   PGDATABASE=ecommerce
// Lines starting with # are treated as comments.
// ============================================================

const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, ".env");

if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf8").split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}
