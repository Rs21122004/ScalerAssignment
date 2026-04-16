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

// All 28 states + 8 union territories of India
const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  // Union Territories
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

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

  // Track which fields the user has interacted with.
  // Errors are only shown AFTER a field is touched (blur event).
  const [touched, setTouched] = useState({});

  // Payment method selection (mocked — no real payment processing)
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // Geolocation state for "Use current location" button
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

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
    const { name, value } = e.target;

    // For pincode: allow only digits, max 6
    if (name === "pincode") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 6);
      setAddress({ ...address, [name]: digitsOnly });
      return;
    }

    // For phone: allow only digits, max 10
    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setAddress({ ...address, [name]: digitsOnly });
      return;
    }

    setAddress({ ...address, [name]: value });
  };

  // Mark a field as "touched" when the user clicks away from it.
  // This prevents errors from showing on fields the user hasn't
  // interacted with yet.
  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  // ============================
  // USE CURRENT LOCATION
  // ============================
  // Uses browser Geolocation API → OpenStreetMap Nominatim for
  // free reverse geocoding. Auto-fills city, state, and pincode.
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Free reverse geocoding via OpenStreetMap Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const addr = data.address || {};

          // Extract city (Nominatim returns it under various keys)
          const city =
            addr.city ||
            addr.town ||
            addr.village ||
            addr.suburb ||
            addr.county ||
            "";

          // Extract state and match to dropdown
          const rawState = addr.state || "";
          const matchedState = INDIAN_STATES.find(
            (s) => s.toLowerCase() === rawState.toLowerCase()
          );

          const pincode = addr.postcode || "";

          setAddress((prev) => ({
            ...prev,
            city: city,
            state: matchedState || "",
            pincode: pincode.replace(/\D/g, "").slice(0, 6),
          }));

          // Mark these fields as touched so validation runs
          setTouched((prev) => ({
            ...prev,
            city: true,
            state: true,
            pincode: true,
          }));
        } catch {
          setLocationError("Could not fetch address. Please enter manually.");
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError("Location access denied. Please allow it in browser settings.");
        } else {
          setLocationError("Could not get your location. Please try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ============================
  // FIELD-LEVEL VALIDATION
  // ============================
  // Returns an object with error messages for each invalid field.
  // An empty string means the field is valid.
  const getErrors = () => {
    const errors = {};

    // Full Name: required, letters & spaces only, at least 2 chars
    if (!address.fullName.trim()) {
      errors.fullName = "Full name is required.";
    } else if (address.fullName.trim().length < 2) {
      errors.fullName = "Name must be at least 2 characters.";
    } else if (!/^[a-zA-Z\s.]+$/.test(address.fullName.trim())) {
      errors.fullName = "Name can only contain letters, spaces, and dots.";
    }

    // Address Line: required, at least 5 chars
    if (!address.addressLine.trim()) {
      errors.addressLine = "Address is required.";
    } else if (address.addressLine.trim().length < 5) {
      errors.addressLine = "Address must be at least 5 characters.";
    }

    // City: required, letters & spaces only
    if (!address.city.trim()) {
      errors.city = "City is required.";
    } else if (!/^[a-zA-Z\s]+$/.test(address.city.trim())) {
      errors.city = "City can only contain letters.";
    }

    // State: must be selected from dropdown
    if (!address.state) {
      errors.state = "Please select a state.";
    }

    // Pincode: exactly 6 digits
    if (!address.pincode) {
      errors.pincode = "Pincode is required.";
    } else if (!/^\d{6}$/.test(address.pincode)) {
      errors.pincode = "Pincode must be exactly 6 digits.";
    }

    // Phone: exactly 10 digits, must start with 6-9 (Indian mobile)
    if (!address.phone) {
      errors.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(address.phone)) {
      errors.phone = "Phone number must be exactly 10 digits.";
    } else if (!/^[6-9]/.test(address.phone)) {
      errors.phone = "Phone number must start with 6, 7, 8, or 9.";
    }

    return errors;
  };

  const errors = getErrors();

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
  // Form is valid only when there are ZERO errors.
  const isFormValid = () => Object.keys(errors).length === 0;

  // ============================
  // PLACE ORDER (THE MAIN ACTION)
  // ============================
  const placeOrder = async () => {
    // Don't proceed if form is incomplete
    if (!isFormValid()) {
      // Mark ALL fields as touched so errors become visible
      setTouched({
        fullName: true,
        addressLine: true,
        city: true,
        state: true,
        pincode: true,
        phone: true,
      });
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
            {/* Use current location button */}
            <button
              type="button"
              className="btn-use-location"
              onClick={useCurrentLocation}
              disabled={locating}
            >
              {locating ? (
                <>
                  <span className="location-spinner"></span>
                  Detecting location…
                </>
              ) : (
                <>
                  📍 Use current location
                </>
              )}
            </button>
            {locationError && (
              <span className="field-error" style={{ marginBottom: "0.3rem" }}>{locationError}</span>
            )}

            {/* Full Name */}
            <div className={`form-group ${touched.fullName && errors.fullName ? "has-error" : ""}`}>
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Enter your full name"
                value={address.fullName}
                onChange={handleInputChange}
                onBlur={handleBlur}
              />
              {touched.fullName && errors.fullName && (
                <span className="field-error">{errors.fullName}</span>
              )}
            </div>

            {/* Address Line */}
            <div className={`form-group ${touched.addressLine && errors.addressLine ? "has-error" : ""}`}>
              <label htmlFor="addressLine">Address</label>
              <input
                type="text"
                id="addressLine"
                name="addressLine"
                placeholder="House no, Street, Area"
                value={address.addressLine}
                onChange={handleInputChange}
                onBlur={handleBlur}
              />
              {touched.addressLine && errors.addressLine && (
                <span className="field-error">{errors.addressLine}</span>
              )}
            </div>

            {/* City and State — side by side */}
            <div className="form-row">
              <div className={`form-group ${touched.city && errors.city ? "has-error" : ""}`}>
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  placeholder="City"
                  value={address.city}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                />
                {touched.city && errors.city && (
                  <span className="field-error">{errors.city}</span>
                )}
              </div>
              <div className={`form-group ${touched.state && errors.state ? "has-error" : ""}`}>
                <label htmlFor="state">State</label>
                <select
                  id="state"
                  name="state"
                  value={address.state}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {touched.state && errors.state && (
                  <span className="field-error">{errors.state}</span>
                )}
              </div>
            </div>

            {/* Pincode and Phone — side by side */}
            <div className="form-row">
              <div className={`form-group ${touched.pincode && errors.pincode ? "has-error" : ""}`}>
                <label htmlFor="pincode">Pincode</label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  placeholder="6-digit pincode"
                  inputMode="numeric"
                  maxLength="6"
                  value={address.pincode}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                />
                {touched.pincode && errors.pincode && (
                  <span className="field-error">{errors.pincode}</span>
                )}
              </div>
              <div className={`form-group ${touched.phone && errors.phone ? "has-error" : ""}`}>
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  placeholder="10-digit mobile number"
                  inputMode="numeric"
                  maxLength="10"
                  value={address.phone}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                />
                {touched.phone && errors.phone && (
                  <span className="field-error">{errors.phone}</span>
                )}
              </div>
            </div>
          </div>

          {/* Payment is mocked because the backend does not store payments yet. */}
          <div className="payment-method-box">
            <h2 className="checkout-section-title">2. Payment Method</h2>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Cash on Delivery / Pay on Delivery
            </label>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === "card"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
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
