// ============================================================
// Navbar.jsx — Amazon-Style Header
// ============================================================
// This component is shown on every page.
// It now does more than display links:
//   1. The search bar navigates to /products?search=...
//   2. The category dropdown becomes part of the search URL
//   3. The delivery area opens a small location popover
//   4. Account & Lists shows auth state + Clerk sign-in/sign-out
//   5. Cart keeps showing the live cart count from App.jsx
//   6. Wishlist heart icon with saved items link
// ============================================================

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";

function Navbar({ cartCount }) {
  // Search state is local because the navbar only needs it before
  // sending the user to the products page.
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // These booleans control the small Amazon-like popovers.
  const [showLocation, setShowLocation] = useState(false);
  const [showAccount, setShowAccount] = useState(false);

  // React Router navigate lets the search form change pages.
  const navigate = useNavigate();

  // Clerk hooks for auth state
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut } = useClerk();

  // Display name: first name from Clerk, or "Sign in" for guests
  const displayName = isSignedIn
    ? user?.firstName || user?.username || "User"
    : "Sign in";

  // ============================
  // Submit search
  // ============================
  // We store search/category in the URL so ProductsPage can read it.
  const handleSearch = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set("search", searchTerm.trim());
    if (selectedCategory !== "All") params.set("category", selectedCategory);

    navigate(`/products?${params.toString()}`);
  };

  // ============================
  // Handle sign out
  // ============================
  const handleSignOut = async () => {
    setShowAccount(false);
    await signOut();
    navigate("/");
  };

  return (
    <>
      {/* Main navbar */}
      <nav className="navbar">
        {/* Logo */}
        <Link to="/" className="navbar-brand">
          <span className="brand-text">amazon</span>
          <span className="brand-domain">.in</span>
        </Link>

        {/* Deliver to popover trigger */}
        <button
          className="nav-link nav-popover-trigger"
          onClick={() => setShowLocation(!showLocation)}
          style={{ minWidth: 110 }}
        >
          <span className="nav-link-label">📍 Deliver to</span>
          <span className="nav-link-value">India</span>
        </button>

        {/* Search bar */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <select
            className="search-category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option>All</option>
            <option>Electronics</option>
            <option>Books</option>
            <option>Clothing</option>
            <option>Home</option>
          </select>
          <input
            className="search-input"
            type="text"
            placeholder="Search Amazon.in"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-btn" type="submit">🔍</button>
        </form>

        {/* Nav links */}
        <div className="navbar-links">
          {/* Account & Lists */}
          <button
            className="nav-link nav-popover-trigger"
            onClick={() => setShowAccount(!showAccount)}
          >
            <span className="nav-link-label">
              Hello, {displayName}
            </span>
            <span className="nav-link-value">Account & Lists ▾</span>
          </button>

          {/* Returns & Orders */}
          <Link to="/orders" className="nav-link">
            <span className="nav-link-label">Returns</span>
            <span className="nav-link-value">& Orders</span>
          </Link>

          {/* Wishlist heart */}
          <Link to="/wishlist" className="nav-link nav-wishlist-link">
            <span className="nav-wishlist-icon">♥</span>
            <span className="nav-link-value">Wishlist</span>
          </Link>

          {/* Cart */}
          <Link to="/cart" className="nav-cart">
            <div className="cart-icon-wrapper">
              🛒
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </div>
            <span className="cart-text">Cart</span>
          </Link>
        </div>
      </nav>

      {/* Mobile search row keeps search visible when the desktop navbar
          hides the wide search bar on small screens. */}
      <form className="mobile-search-row" onSubmit={handleSearch}>
        <select
          className="search-category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option>All</option>
          <option>Electronics</option>
          <option>Books</option>
          <option>Clothing</option>
          <option>Home</option>
        </select>
        <input
          className="search-input"
          type="text"
          placeholder="Search Amazon.in"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="search-btn" type="submit">🔍</button>
      </form>

      {/* Location popover */}
      {showLocation && (
        <div className="nav-popover location-popover">
          <h3>Choose your location</h3>
          <p>Delivery options and speed may vary by address.</p>
          <button className="btn btn-primary btn-full">Use current location</button>
          <input placeholder="Enter pincode" />
        </div>
      )}

      {/* Account popover — now dynamic based on auth state */}
      {showAccount && (
        <div className="nav-popover account-popover">
          {isLoaded && !isSignedIn ? (
            <>
              <Link
                to="/sign-in"
                className="btn btn-primary btn-full"
                onClick={() => setShowAccount(false)}
              >
                Sign in
              </Link>
              <p className="account-popover-subtitle">
                New customer?{" "}
                <Link
                  to="/sign-up"
                  onClick={() => setShowAccount(false)}
                >
                  Start here
                </Link>
              </p>
            </>
          ) : (
            <>
              <div className="account-user-info">
                <span className="account-user-name">
                  Hello, {user?.firstName || user?.username || "User"}
                </span>
                <span className="account-user-email">
                  {user?.primaryEmailAddress?.emailAddress}
                </span>
              </div>
              <button
                className="btn btn-outline btn-full"
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </>
          )}
          <div className="account-menu-columns">
            <div>
              <h3>Your Lists</h3>
              <Link
                to="/wishlist"
                onClick={() => setShowAccount(false)}
              >
                Your Wishlist
              </Link>
            </div>
            <div>
              <h3>Your Account</h3>
              <Link
                to="/orders"
                onClick={() => setShowAccount(false)}
              >
                Your Orders
              </Link>
              <span>Your Addresses</span>
            </div>
          </div>
        </div>
      )}

      {/* Sub-navbar */}
      <div className="sub-navbar">
        <Link to="/products" className="sub-nav-link">☰ All</Link>
        <Link to="/products" className="sub-nav-link">Today's Deals</Link>
        <Link to="/products?category=Electronics" className="sub-nav-link">Electronics</Link>
        <Link to="/products?category=Books" className="sub-nav-link">Books</Link>
        <Link to="/products?category=Clothing" className="sub-nav-link">Clothing</Link>
        <Link to="/products?category=Home" className="sub-nav-link">Home & Kitchen</Link>
        <Link to="/" className="sub-nav-link">Customer Service</Link>
      </div>
    </>
  );
}

export default Navbar;
