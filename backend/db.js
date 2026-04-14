// ============================================================
// db.js — Database Connection
// ============================================================
// This file creates a CONNECTION to our PostgreSQL database.
// Think of it like plugging a cable from our app to the database.
// We use the "pg" library which gives us a "Pool" object.
// A Pool keeps multiple connections ready so our app is fast.
// We export this pool so other files can use it to run SQL queries.
// ============================================================

// Load backend/.env when db.js is imported directly in scripts/tests.
require("./loadEnv");

// Import Pool from the "pg" (node-postgres) library
const { Pool } = require("pg");

// Create a new pool (group of database connections).
// For local development, the individual PG* variables are easy to use.
// For deployment, most hosts provide a single DATABASE_URL, so we support
// that too. This makes the backend ready for Railway/Render/Neon/Supabase.
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.DB_SSL === "true"
          ? { rejectUnauthorized: false }
          : false,
    }
  : {
      user: process.env.PGUSER || "rs",
      host: process.env.PGHOST || "localhost",
      database: process.env.PGDATABASE || "ecommerce",
      password: process.env.PGPASSWORD || "",
      port: Number(process.env.PGPORT) || 5432,
    };

const pool = new Pool(poolConfig);

// Export the pool so other files can use it
// Example usage in other files: const db = require("./db");
//                                db.query("SELECT * FROM products");
module.exports = pool;
