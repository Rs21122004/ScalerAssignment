// ============================================================
// middleware/auth.js — Authentication Middleware
// ============================================================
// This file provides TWO pieces of middleware:
//
// 1. clerkAuth  — Runs on EVERY request. If the request has a
//    valid Clerk JWT (Authorization: Bearer <token>), it populates
//    req.auth.userId. Otherwise req.auth is empty — the request
//    still goes through (guest access).
//
// 2. requireAuth — A stricter guard used on routes that MUST
//    have a signed-in user (checkout, orders, wishlist).
//    Returns 401 if no userId is present.
//
// GRACEFUL DEGRADATION:
// If CLERK_SECRET_KEY or CLERK_PUBLISHABLE_KEY is not set, the
// middleware skips Clerk entirely. This lets the app run without
// auth during early development.
//
// HOW IT WORKS WITH GUEST CARTS:
// - Guest users send an X-Cart-Session header (UUID from localStorage).
// - The cart route uses req.auth?.userId if available, otherwise
//   falls back to the session header. This is the same pattern
//   Amazon uses: you can browse and add to cart without signing in,
//   but you must sign in to checkout.
// ============================================================

const clerkConfigured =
  process.env.CLERK_SECRET_KEY && process.env.CLERK_PUBLISHABLE_KEY;

let clerkAuth;
if (clerkConfigured) {
  // Clerk is fully configured — use real middleware.
  const { clerkMiddleware } = require("@clerk/express");
  console.log("✅ Clerk middleware initialized with explicit keys.");
  clerkAuth = clerkMiddleware({
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  });
} else {
  // Clerk keys missing — log a warning and pass through.
  console.warn(
    "⚠️  CLERK_SECRET_KEY or CLERK_PUBLISHABLE_KEY is not set.\n" +
      "   Auth middleware is disabled. Set both keys in backend/.env."
  );
  clerkAuth = (req, _res, next) => {
    req.auth = {};
    next();
  };
}

// Wrapper for clerkAuth to add logging per-request
const originalClerkAuth = clerkAuth;
clerkAuth = (req, res, next) => {
  originalClerkAuth(req, res, () => {
    if (req.auth && req.auth.userId) {
      console.log(`👤 User identified: ${req.auth.userId}`);
    } else {
      const authHeader = req.headers["authorization"];
      const sessionId = req.headers["x-cart-session"];
      if (authHeader) {
        console.log(`🌐 Guest request with AUTH HEADER: ${authHeader.slice(0, 20)}... (Session: ${sessionId?.slice(0, 8)})`);
      } else {
        console.log(`🌐 Guest request WITHOUT auth header (Session: ${sessionId?.slice(0, 8)})`);
      }
    }
    next();
  });
};

// requireAuth: blocks the request if the user is NOT signed in.
const requireAuth = (req, res, next) => {
  // Try to use a fallback identification if req.auth is empty
  if (!req.auth || !req.auth.userId) {
    const { getAuth } = require("@clerk/express");
    const auth = getAuth(req);
    
    if (auth && auth.userId) {
      console.log(`💡 getAuth() recovered user: ${auth.userId}`);
      req.auth = auth;
    } else {
      console.error("🚫 Auth failed. Reason:", auth?.reason);
      return res.status(401).json({ 
        error: "Sign in to continue",
        details: auth?.reason || "Verify token failed"
      });
    }
  }
  next();
};

module.exports = { clerkAuth, requireAuth };
