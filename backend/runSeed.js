// ============================================================
// runSeed.js — Run schema.sql + seed.sql via Node.js
// ============================================================
// Usage: node runSeed.js
// This avoids needing psql on your PATH.
// ============================================================

const fs = require("fs");
const path = require("path");
const db = require("./db");

async function run() {
  try {
    // 1. Run schema.sql to create tables (IF NOT EXISTS makes it safe to re-run)
    const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
    console.log("⏳ Running schema.sql ...");
    await db.query(schema);
    console.log("✅ Schema created successfully.");

    // 2. Run seed.sql to insert sample products
    const seed = fs.readFileSync(path.join(__dirname, "seed.sql"), "utf8");
    console.log("⏳ Running seed.sql ...");
    await db.query(seed);
    console.log("✅ Seed data inserted successfully.");

    // 3. Verify
    const result = await db.query("SELECT COUNT(*) FROM products");
    console.log(`🎉 Done! ${result.rows[0].count} products in the database.`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await db.end();
  }
}

run();
