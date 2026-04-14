// ============================================================
// SignInPage.jsx — Amazon-Style Sign In Page
// ============================================================
// Uses Clerk's <SignIn /> component styled to match Amazon's login.
// Clerk handles all the auth logic (email/password, OAuth, etc.)
// — we just provide the page layout and branding.
//
// After successful sign-in, user is redirected to the home page
// (or wherever they came from via the redirect URL).
// ============================================================

import { SignIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

function SignInPage() {
  return (
    <div className="auth-page">
      <div className="auth-page-inner">
        {/* Amazon logo */}
        <Link to="/" className="auth-logo">
          <span className="brand-text">amazon</span>
          <span className="brand-domain">.in</span>
        </Link>

        {/* Clerk's SignIn component handles the entire form */}
        <div className="auth-card">
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            forceRedirectUrl="/"
            appearance={{
              elements: {
                rootBox: "clerk-root-box",
                card: "clerk-card",
                headerTitle: "clerk-title",
                headerSubtitle: "clerk-subtitle",
                formButtonPrimary: "clerk-btn-primary",
                footerActionLink: "clerk-footer-link",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default SignInPage;
