// ============================================================
// server.js — Main Entry Point
// ============================================================
// This is the FIRST file that runs when we start the backend.
// It does 3 things:
//   1. Creates an Express app
//   2. Sets up middleware (cors, json parsing, Clerk auth)
//   3. Connects our route files to URL paths
//   4. Starts the server on port 5000
// ============================================================

// Load backend/.env before reading PORT or database settings.
require("./loadEnv");

// --- LOGGING HELPER (for remote debugging) ---
const fs = require("fs");
const path = require("path");
const logFilePath = path.join(__dirname, "server.log");
const logStream = fs.createWriteStream(logFilePath, { flags: "a" });
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

function logToFile(type, args) {
  const message = `[${new Date().toISOString()}] [${type}] ${args.map(a => 
    typeof a === 'object' ? JSON.stringify(a, null, 2) : a
  ).join(" ")}\n`;
  logStream.write(message);
}

console.log = (...args) => { originalLog(...args); logToFile("LOG", args); };
console.warn = (...args) => { originalWarn(...args); logToFile("WARN", args); };
console.error = (...args) => { originalError(...args); logToFile("ERROR", args); };
console.log("📝 Logging initialized. Check server.log for details.");
// ----------------------------------------------

// Import required packages
const express = require("express");  // Web framework for creating APIs
const cors = require("cors");        // Allows frontend (port 5173) to talk to backend (port 5000)

// Import Clerk authentication middleware.
// clerkAuth verifies JWTs on every request (non-blocking for guests).
// requireAuth blocks unauthenticated requests (used on protected routes).
const { clerkAuth, requireAuth } = require("./middleware/auth");

// Create the Express app
const app = express();

// Define the port our server will run on.
// Hosting providers set PORT automatically; local dev falls back to 5001.
const PORT = process.env.PORT || 5001;

// ============================
// MIDDLEWARE
// ============================
// Middleware = functions that run BEFORE our route handlers.
// They process the incoming request first.

// Clerk auth middleware runs on EVERY request.
// It reads the Authorization header, verifies the JWT with Clerk,
// and sets req.auth.userId for signed-in users.
// For guests (no token), req.auth is empty — the request still proceeds.
app.use(clerkAuth);

// cors() allows requests from different origins (ports).
// Without this, the browser would BLOCK our frontend from calling the backend.
// Why? Frontend is on localhost:5173, backend is on localhost:5000 — different ports = different origins.
app.use(cors());

// express.json() parses incoming JSON request bodies.
// Without this, req.body would be undefined when the frontend sends JSON data.
app.use(express.json());

// ============================
// ROUTES
// ============================
// We connect each route file to a URL path.
// All routes in products.js will start with /api/products
// All routes in cart.js will start with /api/cart
// All routes in orders.js will start with /api/orders
// All routes in wishlist.js will start with /api/wishlist (protected)

const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");
const wishlistRoutes = require("./routes/wishlist");

app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

// Orders and wishlist require authentication.
// requireAuth runs BEFORE the route handlers and blocks guests.
app.use("/api/orders", requireAuth, orderRoutes);
app.use("/api/wishlist", requireAuth, wishlistRoutes);

// ============================
// HEALTH CHECK ROUTE
// ============================
// A simple route to check if the server is running.
// Visit http://localhost:5000/ in the browser to test.
app.get("/", (req, res) => {
  res.json({ message: "E-Commerce API is running!" });
});

// ============================
// START THE SERVER
// ============================
// app.listen() starts the server and waits for incoming requests.
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
