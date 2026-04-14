// ============================================================
// WishlistPage.jsx — Wishlist / Saved Items Page
// ============================================================
// Shows all products the user has wishlisted.
// Each item shows:
//   - Product image, name, price, rating
//   - "Add to Cart" button
//   - "Remove" button (heart icon to un-wishlist)
//   - Link to product detail page
//
// Requires authentication — redirects to sign-in if not signed in.
//
// API calls:
//   GET    /api/wishlist              → fetch all wishlisted items
//   DELETE /api/wishlist/:productId   → remove from wishlist
//   POST   /api/cart                  → add to cart
// ============================================================

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import API from "../api";

function WishlistPage({ onCartUpdate }) {
  const { isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate("/sign-in");
    }
  }, [isLoaded, isSignedIn, navigate]);

  // Fetch wishlist items
  useEffect(() => {
    if (isSignedIn) {
      fetchWishlist();
    }
  }, [isSignedIn]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await API.get("/api/wishlist");
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  // Remove from wishlist
  const removeFromWishlist = async (productId) => {
    try {
      await API.delete(`/api/wishlist/${productId}`);
      setItems(items.filter((item) => item.product_id !== productId));
      showToast("Removed from wishlist");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  // Add to cart from wishlist
  const addToCart = async (item) => {
    try {
      await API.post("/api/cart", { product_id: item.product_id, quantity: 1 });
      showToast(`${item.name} added to cart`);
      if (onCartUpdate) onCartUpdate(item);
    } catch (error) {
      console.error("Error adding to cart:", error);
      showToast("Failed to add to cart");
    }
  };

  const showToast = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 2000);
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="page">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page">
      {message && <div className="toast">{message}</div>}

      <div className="page-header">
        <h1>Your Wishlist</h1>
        <p className="wishlist-count">
          {items.length} {items.length === 1 ? "item" : "items"}
        </p>
      </div>

      {loading ? (
        <div className="loading">Loading wishlist...</div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">♡</div>
          <h2>Your wishlist is empty</h2>
          <p>Save items you love to your wishlist.</p>
          <Link to="/products" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {items.map((item) => (
            <div key={item.id} className="wishlist-item">
              <Link
                to={`/products/${item.product_id}`}
                className="wishlist-item-image-link"
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="wishlist-item-image"
                />
              </Link>

              <div className="wishlist-item-info">
                <Link
                  to={`/products/${item.product_id}`}
                  className="wishlist-item-name"
                >
                  {item.name}
                </Link>

                <div className="wishlist-item-price">
                  ₹{Number(item.price).toLocaleString("en-IN")}
                </div>

                <div className="wishlist-item-meta">
                  <span className="wishlist-item-rating">
                    ⭐ {item.rating || "4.0"}
                  </span>
                  <span
                    className={`wishlist-item-stock ${
                      item.stock > 0 ? "in-stock" : "out-of-stock"
                    }`}
                  >
                    {item.stock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </div>

                <div className="wishlist-item-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => addToCart(item)}
                    disabled={item.stock <= 0}
                  >
                    Add to Cart
                  </button>
                  <button
                    className="btn btn-outline wishlist-remove-btn"
                    onClick={() => removeFromWishlist(item.product_id)}
                  >
                    ♥ Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WishlistPage;
