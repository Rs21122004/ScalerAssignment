// ============================================================
// api.js — API Helper (Axios Configuration)
// ============================================================
// This file sets up Axios with:
//   1. Base URL so we don't repeat "http://localhost:5001"
//   2. Auth interceptor that attaches the Clerk JWT token
//   3. Cart session header for guest users
//
// GUEST CART FLOW:
//   - A UUID is generated and stored in localStorage as "cartSessionId"
//   - Every request sends it as X-Cart-Session header
//   - The backend uses this to scope the guest's cart
//   - On sign-in, the frontend calls /api/cart/merge to transfer items
// ============================================================

import axios from "axios";

// Create an Axios instance with the backend URL pre-configured.
// Vite exposes environment variables that start with VITE_.
// Locally, it falls back to http://localhost:5001.
// In deployment, set VITE_API_BASE_URL to your hosted backend URL.
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5001",
});

// ============================
// Cart Session ID (for guests)
// ============================
// Generate or retrieve a persistent session ID for guest cart.
function getCartSessionId() {
  let sessionId = localStorage.getItem("cartSessionId");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("cartSessionId", sessionId);
  }
  return sessionId;
}

// ============================
// Request Interceptor
// ============================
// Runs before EVERY API call. Attaches:
//   1. Authorization header with Clerk JWT (if signed in)
//   2. X-Cart-Session header with guest session UUID
//
// We dynamically import Clerk's session so this file doesn't
// depend on React hooks (it's a plain JS module).
let _getToken = null;

// Called once from App.jsx after Clerk initializes.
export function setAuthTokenGetter(fn) {
  _getToken = fn;
}

API.interceptors.request.use(async (config) => {
  // Attach Clerk JWT if available
  if (_getToken) {
    try {
      const token = await _getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Not signed in — that's fine
    }
  }

  // Always attach the cart session ID for guest cart support
  config.headers["X-Cart-Session"] = getCartSessionId();

  return config;
});

export function getSessionId() {
  return getCartSessionId();
}

export default API;
