// ============================================================
// CheckoutPage.jsx — Checkout / Place Order Page
// ============================================================
// This is the FINAL step before placing an order.
// The user arrives here from the Cart page ("Proceed to Checkout").
//
// AUTHENTICATION REQUIRED:
//   Like Amazon, checkout requires sign-in. If the user isn't
//   signed in, they are redirected to /sign-in. After sign-in,
//   they return here automatically.
//
// WHAT THIS PAGE DOES:
//   1. Fetches the current cart items from the backend
//   2. Shows an ORDER SUMMARY (items, quantities, prices, total)
//   3. Shows a SHIPPING ADDRESS FORM (name, address, city, pincode)
//   4. On clicking "Place Order":
//      a. Sends the address + email to POST /api/orders
//      b. Backend creates the order, moves cart items, clears cart
//      c. Backend sends confirmation email
//      d. Frontend redirects to /order-confirmation page
// ============================================================

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import API from "../api";

function CheckoutPage({ onCartUpdate }) {
  // ============================
  // AUTH CHECK
  // ============================
  const { isSignedIn, isLoaded, user } = useUser();
  const navigate = useNavigate();

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate("/sign-in");
    }
  }, [isLoaded, isSignedIn, navigate]);

  // ============================
  // STATE VARIABLES
  // ============================

  // Cart items fetched from backend
  const [cartItems, setCartItems] = useState([]);

  // Loading state while fetching cart
  const [loading, setLoading] = useState(true);

  // "Placing order..." state to prevent double-clicks
  const [placing, setPlacing] = useState(false);

  // Shipping address form fields
  // We use ONE object to group all address fields together
  const [address, setAddress] = useState({
    fullName: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      // GET /api/cart → returns cart items with product details (via JOIN)
      const response = await API.get("/api/cart");
      setCartItems(response.data);

      // If cart is empty, redirect back to cart page
      if (response.data.length === 0) {
        navigate("/cart");
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // ============================
  // FETCH CART ITEMS ON PAGE LOAD
  // ============================
  useEffect(() => {
    if (isSignedIn) {
      fetchCart();
    }
  }, [fetchCart, isSignedIn]);

  // Pre-fill name from Clerk profile
  useEffect(() => {
    if (user && !address.fullName) {
      setAddress((prev) => ({
        ...prev,
        fullName: user.fullName || user.firstName || "",
      }));
    }
  }, [user]);

  // ============================
  // HANDLE FORM INPUT CHANGES
  // ============================
  const handleInputChange = (e) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value,
    });
  };

  // ============================
  // CALCULATE TOTAL PRICE
  // ============================
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // ============================
  // VALIDATE THE FORM
  // ============================
  const isFormValid = () => {
    return (
      address.fullName.trim() !== "" &&
      address.addressLine.trim() !== "" &&
      address.city.trim() !== "" &&
      address.state.trim() !== "" &&
      address.pincode.trim() !== "" &&
      address.phone.trim() !== ""
    );
  };

  // ============================
  // PLACE ORDER (THE MAIN ACTION)
  // ============================
  const placeOrder = async () => {
    // Don't proceed if form is incomplete
    if (!isFormValid()) {
      alert("Please fill in all shipping details.");
      return;
    }

    try {
      setPlacing(true);

      // Get user's email from Clerk profile for the confirmation email
      const customerEmail = user?.primaryEmailAddress?.emailAddress || "";

      // Send the order to the backend
      const response = await API.post("/api/orders", {
        shipping_address: `${address.fullName}, ${address.addressLine}, ${address.city}, ${address.state} - ${address.pincode}, Phone: ${address.phone}`,
        customer_email: customerEmail,
      });

      // Tell App.jsx to refresh the navbar cart count (now 0)
      if (onCartUpdate) onCartUpdate();

      // Redirect to the confirmation page.
      navigate(`/order-confirmation/${response.data.order.id}`);
    } catch (error) {
      console.error("Error placing order:", error);
      const msg = error.response?.data?.error || "Failed to place order";
      const details = error.response?.data?.details || "";
      alert(`${msg}. ${details}\nPlease try again.`);
    } finally {
      setPlacing(false);
    }
  };

  // ============================
  // RENDER
  // ============================
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="page">
        <div className="loading">Redirecting to sign in...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page">
        <div className="loading">Loading checkout...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Checkout</h1>
      </div>

      {/* Amazon checkout is shown as clear review steps. */}
      <div className="checkout-steps">
        <div className="checkout-step active">
          <span>1</span>
          <strong>Delivery address</strong>
        </div>
        <div className="checkout-step active">
          <span>2</span>
          <strong>Payment method</strong>
        </div>
        <div className="checkout-step active">
          <span>3</span>
          <strong>Review items</strong>
        </div>
      </div>

      <div className="checkout-layout">
        {/* ============================
            LEFT SIDE: Shipping Address Form
            ============================ */}
        <div className="checkout-form-section">
          <h2 className="checkout-section-title">1. Delivery Address</h2>

          {/* Show signed-in user info */}
          <div className="checkout-user-info">
            <span>Signed in as: <strong>{user?.primaryEmailAddress?.emailAddress}</strong></span>
          </div>

          <div className="checkout-form">
            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Enter your full name"
                value={address.fullName}
                onChange={handleInputChange}
              />
            </div>

            {/* Address Line */}
            <div className="form-group">
              <label htmlFor="addressLine">Address</label>
              <input
                type="text"
                id="addressLine"
                name="addressLine"
                placeholder="House no, Street, Area"
                value={address.addressLine}
                onChange={handleInputChange}
              />
            </div>

            {/* City and State — side by side */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  placeholder="City"
                  value={address.city}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  placeholder="State"
                  value={address.state}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Pincode and Phone — side by side */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pincode">Pincode</label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  placeholder="6-digit pincode"
                  value={address.pincode}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  placeholder="10-digit phone"
                  value={address.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Payment is mocked because the backend does not store payments yet. */}
          <div className="payment-method-box">
            <h2 className="checkout-section-title">2. Payment Method</h2>
            <label>
              <input type="radio" checked readOnly />
              Cash on Delivery / Pay on Delivery
            </label>
            <label>
              <input type="radio" readOnly />
              Credit or Debit Card
            </label>
            <p>Payment UI is shown for realism; order placement still uses the existing backend.</p>
          </div>
        </div>

        {/* ============================
            RIGHT SIDE: Order Summary
            ============================ */}
        <div className="checkout-summary-section">
          <h2 className="checkout-section-title">3. Review Items and Delivery</h2>

          {/* List of items */}
          <div className="checkout-items">
            {cartItems.map((item) => (
              <div key={item.id} className="checkout-item">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="checkout-item-image"
                />
                <div className="checkout-item-info">
                  <span className="checkout-item-name">{item.name}</span>
                  <span className="checkout-item-qty">
                    Qty: {item.quantity} × ₹{item.price}
                  </span>
                </div>
                <span className="checkout-item-subtotal">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Price breakdown */}
          <div className="checkout-price-breakdown">
            <div className="price-row">
              <span>Subtotal</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
            <div className="price-row">
              <span>Shipping</span>
              <span className="free-shipping">FREE</span>
            </div>
            <div className="price-row total-row">
              <span>Total</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Place Order button */}
          <button
            className="btn btn-success btn-lg btn-full"
            onClick={placeOrder}
            disabled={placing || !isFormValid()}
          >
            {placing ? "Placing Order..." : `Place Order — ₹${totalPrice.toFixed(2)}`}
          </button>

          <p className="checkout-email-note">
            📧 A confirmation email will be sent to {user?.primaryEmailAddress?.emailAddress || "your email"}.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
