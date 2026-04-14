// ============================================================
// CartPage.jsx — Shopping Cart Page
// ============================================================
// Shows all items the user has added to their cart.
// Features:
//   - List of cart items with quantity controls
//   - Update quantity (+ / -)
//   - Remove items
//   - Total price calculation
//   - "Proceed to Checkout" button → navigates to /checkout
//
// HOW CART STATE SYNCS WITH BACKEND:
//   The cart is NOT stored in React state permanently.
//   Every time we load this page, we FETCH the cart from the backend.
//   When we update/remove an item, we:
//     1. Send the change to the backend (PUT or DELETE)
//     2. Re-fetch the cart (fetchCart) to get the updated data
//   This keeps frontend and backend always in sync.
//
// HOW UPDATES WORK:
//   - User clicks "+" → updateQuantity(id, currentQty + 1)
//   - We send PUT /api/cart/:id { quantity: newQty } to the backend
//   - The backend updates the database row
//   - We call fetchCart() again → React re-renders with new data
//   - We call onCartUpdate() → App.jsx refreshes the navbar badge
//
// API calls:
//   GET    /api/cart      → fetch cart items
//   PUT    /api/cart/:id  → update quantity
//   DELETE /api/cart/:id  → remove item
// ============================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import CartItem from "../components/CartItem";

function CartPage({ onCartUpdate }) {
  const [cartItems, setCartItems] = useState([]);  // Items in the cart
  const [loading, setLoading] = useState(true);     // Loading state
  const navigate = useNavigate();                   // For navigation

  // Fetch cart items when the page loads
  useEffect(() => {
    fetchCart();
  }, []);

  // ============================
  // Fetch all cart items
  // ============================
  // Calls GET /api/cart which JOINs cart_items with products
  // so we get product name, price, image along with quantity.
  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await API.get("/api/cart");
      // response.data is an array of cart items with product details
      // We store it in state → React re-renders → UI updates
      setCartItems(response.data);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // Update quantity of a cart item
  // ============================
  // Called when user clicks + or - buttons.
  // Sends PUT /api/cart/:id { quantity: newQuantity } to backend.
  // Then re-fetches cart so UI shows the updated data.
  const updateQuantity = async (cartItemId, newQuantity) => {
    try {
      // Don't allow quantity less than 1
      if (newQuantity < 1) return;

      // Send update to backend
      await API.put(`/api/cart/${cartItemId}`, { quantity: newQuantity });

      // Refresh the cart to show updated data
      fetchCart();
      // Update navbar badge count
      if (onCartUpdate) onCartUpdate();
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };

  // ============================
  // Remove an item from the cart
  // ============================
  // Sends DELETE /api/cart/:id to backend.
  // Backend removes that row from cart_items table.
  // Then we re-fetch to update the UI.
  const removeItem = async (cartItemId) => {
    try {
      await API.delete(`/api/cart/${cartItemId}`);
      fetchCart();
      if (onCartUpdate) onCartUpdate();
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  // ============================
  // Calculate total price
  // ============================
  // reduce() loops through all items and sums up (price × quantity).
  // This is calculated on every render, so it's always up-to-date.
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
  <div className="page">
    {loading ? (
      <div className="loading">Loading cart...</div>
    ) : cartItems.length === 0 ? (
      <div className="empty-state">
        <p>Your cart is empty.</p>
        <button className="btn btn-primary" onClick={() => navigate("/")}>
          Continue Shopping
        </button>
      </div>
    ) : (
      <div className="cart-layout">
        {/* Left: Cart items */}
        <div className="cart-main">
          <div className="cart-main-header">
            <h1>Shopping Cart</h1>
            <span className="cart-price-label">Price</span>
          </div>

          <div className="cart-list">
            {cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdate={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          <div style={{ textAlign: "right", paddingTop: "1rem", fontSize: "1.1rem" }}>
            Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items):{" "}
            <strong>₹{totalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
          </div>
        </div>

        {/* Right: Summary sidebar */}
        <div className="cart-sidebar">
          <p style={{ color: "var(--success)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
            ✔ Your order qualifies for FREE Delivery.
          </p>
          <p className="subtotal-text">
            Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items):{" "}
            <span className="subtotal-amount">
              ₹{totalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </p>
          <button
            className="btn btn-amazon-orange btn-full"
            style={{ marginTop: "0.5rem" }}
            onClick={() => navigate("/checkout")}
          >
            Proceed to Buy
          </button>
        </div>
      </div>
    )}
  </div>
);
}

export default CartPage;
