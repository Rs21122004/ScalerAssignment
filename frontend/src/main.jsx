// ============================================================
// main.jsx — Application Entry Point
// ============================================================
// Wraps the entire app in:
//   1. StrictMode — helps catch bugs during development
//   2. ClerkProvider — gives every component access to auth state
//      (useUser, useAuth, SignedIn, SignedOut, etc.)
//
// The publishable key comes from your Clerk dashboard.
// Store it in frontend/.env as VITE_CLERK_PUBLISHABLE_KEY.
// ============================================================

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import "./index.css";
import App from "./App.jsx";

// Vite exposes env vars prefixed with VITE_.
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  console.warn(
    "⚠️  VITE_CLERK_PUBLISHABLE_KEY is missing. Auth features will not work.\n" +
      "   Add it to frontend/.env (see .env.example)."
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {PUBLISHABLE_KEY ? (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    ) : (
      // Fallback: app still works without Clerk (no auth features)
      <App />
    )}
  </StrictMode>
);
