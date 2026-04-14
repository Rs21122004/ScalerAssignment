// ============================================================
// App.jsx — Root Component
// ============================================================
// This is the TOP-LEVEL component that wraps the entire app.
// It does 5 things:
//   1. Sets up React Router (page navigation)
//   2. Renders the Navbar on every page
//   3. Manages the cart count (shown in the navbar badge)
//   4. Connects the Clerk auth token to our API helper
//   5. Merges guest cart into user cart on sign-in
//
// React Router renders DIFFERENT pages based on the URL:
//   /                       → HomePage
//   /products               → ProductsPage
//   /products/:id           → ProductDetailPage
//   /cart                   → CartPage
//   /checkout               → CheckoutPage (auth required)
//   /order-confirmation/:id → OrderConfirmationPage
//   /orders                 → OrdersPage (auth required)
//   /wishlist               → WishlistPage (auth required)
//   /sign-in/*              → SignInPage
//   /sign-up/*              → SignUpPage
// ============================================================

import { useCallback, useEffect, useState, useRef } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import Navbar from "./components/Navbar";
import CartDrawer from "./components/CartDrawer";
import ProductsPage from "./pages/ProductsPage";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import WishlistPage from "./pages/WishlistPage";
import API, { setAuthTokenGetter, getSessionId } from "./api";
import "./App.css";

function App() {
  // Cart count for the navbar badge
  const [cartCount, setCartCount] = useState(0);

  // The cart drawer opens after a product is added, just like Amazon's
  // post-add confirmation panel. We store both whether it is open and
  // which product should be displayed inside the drawer.
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState(null);

  // ============================
  // Clerk Auth Integration
  // ============================
  // useAuth gives us getToken() to get the JWT for API calls.
  // useUser gives us the user object (name, email, signed-in state).
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();

  // Track the previous sign-in state so we can detect the moment
  // a user signs in (transitions from false → true) and merge their
  // guest cart.
  const prevSignedIn = useRef(false);

  // Connect the Clerk token getter to our API helper (api.js).
  // This runs once and gives the Axios interceptor access to getToken.
  useEffect(() => {
    setAuthTokenGetter(() => getToken());
  }, [getToken]);

  // ============================
  // Merge guest cart on sign-in
  // ============================
  // When the user signs in, transfer any items from their anonymous
  // session cart into their authenticated cart.
  useEffect(() => {
    if (isSignedIn && !prevSignedIn.current) {
      // User just signed in — merge the guest cart
      const sessionId = getSessionId();
      API.post("/api/cart/merge", { session_id: sessionId })
        .then(() => fetchCartCount())
        .catch((err) => console.error("Cart merge error:", err));
    }
    prevSignedIn.current = isSignedIn;
  }, [isSignedIn]);

  // ============================
  // Fetch how many items are in the cart
  // ============================
  // useCallback keeps the function stable so React's effect dependency
  // rules know it is safe to call from useEffect.
  const fetchCartCount = useCallback(async () => {
    try {
      const response = await API.get("/api/cart");
      // Count total items (sum of all quantities)
      const total = response.data.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(total);
      return total;
    } catch (error) {
      // If the backend isn't running, don't crash — just show 0
      console.error("Could not fetch cart count:", error);
      return 0;
    }
  }, []);

  // Fetch cart count when the app loads.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCartCount();
  }, [fetchCartCount]);

  // ============================
  // Handle cart updates from child pages
  // ============================
  // Product cards and detail pages call this after a successful add.
  // If they pass the product, we open the drawer. Cart/checkout pages can
  // call it without a product when they only need the badge refreshed.
  const handleCartUpdate = async (addedProduct = null) => {
    const total = await fetchCartCount();

    if (addedProduct) {
      setLastAddedProduct(addedProduct);
      setIsCartDrawerOpen(true);
      setCartCount(total);
    }
  };

  return (
    <BrowserRouter>
      <AppContent
        cartCount={cartCount}
        isCartDrawerOpen={isCartDrawerOpen}
        lastAddedProduct={lastAddedProduct}
        setIsCartDrawerOpen={setIsCartDrawerOpen}
        handleCartUpdate={handleCartUpdate}
      />
    </BrowserRouter>
  );
}

// Inner component to access useLocation
function AppContent({
  cartCount,
  isCartDrawerOpen,
  lastAddedProduct,
  setIsCartDrawerOpen,
  handleCartUpdate,
}) {
  const location = useLocation();
  const isAuthPage =
    location.pathname.startsWith("/sign-in") ||
    location.pathname.startsWith("/sign-up");

  return (
    <>
      {/* Navbar is only shown on NON-auth pages */}
      {!isAuthPage && <Navbar cartCount={cartCount} />}

      {/* CartDrawer is also hidden on auth pages */}
      {!isAuthPage && (
        <CartDrawer
          isOpen={isCartDrawerOpen}
          addedProduct={lastAddedProduct}
          cartCount={cartCount}
          onClose={() => setIsCartDrawerOpen(false)}
        />
      )}

      {/* Main content area — switches based on URL */}
      <main className={isAuthPage ? "auth-main-layout" : "main-content"}>
        <Routes>
          {/* / → Home page */}
          <Route path="/" element={<HomePage />} />
          <Route
            path="/products"
            element={<ProductsPage onCartUpdate={handleCartUpdate} />}
          />

          {/* /products/:id → Product detail page */}
          <Route
            path="/products/:id"
            element={<ProductDetailPage onCartUpdate={handleCartUpdate} />}
          />

          {/* /cart → Cart page */}
          <Route
            path="/cart"
            element={<CartPage onCartUpdate={handleCartUpdate} />}
          />

          {/* /checkout → Checkout page (auth required — page handles redirect) */}
          <Route
            path="/checkout"
            element={<CheckoutPage onCartUpdate={handleCartUpdate} />}
          />

          {/* /order-confirmation/:id → order success page with order ID */}
          <Route
            path="/order-confirmation/:id"
            element={<OrderConfirmationPage />}
          />

          {/* /orders → Orders page (auth required — page handles redirect) */}
          <Route path="/orders" element={<OrdersPage />} />

          {/* /wishlist → Wishlist page (auth required — handled inside) */}
          <Route
            path="/wishlist"
            element={<WishlistPage onCartUpdate={handleCartUpdate} />}
          />

          {/* Auth pages — Clerk handles the forms, we provide layout */}
          <Route path="/sign-in/*" element={<SignInPage />} />
          <Route path="/sign-up/*" element={<SignUpPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
