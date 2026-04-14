// ============================================================
// SignUpPage.jsx — Amazon-Style Sign Up Page
// ============================================================
// Uses Clerk's <SignUp /> component for account creation.
// Styled to match the sign-in page and Amazon's branding.
// ============================================================

import { SignUp } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

function SignUpPage() {
  return (
    <div className="auth-page">
      <div className="auth-page-inner">
        {/* Amazon logo */}
        <Link to="/" className="auth-logo">
          <span className="brand-text">amazon</span>
          <span className="brand-domain">.in</span>
        </Link>

        {/* Clerk's SignUp component handles the entire form */}
        <div className="auth-card">
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
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

export default SignUpPage;
