// ============================================================
// ProductCard.jsx — Product Card with Wishlist Heart
// ============================================================
// Each product card in the grid now has a heart icon in the top-right
// corner. Clicking it toggles the product in/out of the wishlist.
//
// For signed-in users, the heart state comes from the backend.
// For guests, the heart is shown but clicking it opens sign-in.
// ============================================================

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { formatPrice, getDeliveryPromise } from "../data/amazonExtras";
import API from "../api";

// Simple star rating renderer
function StarRating({ rating = 4.2 }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="stars">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={`star ${i < full ? "" : i === full && half ? "star-half" : "star-empty"}`}>
          {i < full ? "★" : i === full && half ? "⯨" : "☆"}
        </span>
      ))}
    </span>
  );
}

function ProductCard({ product, onAddToCart }) {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(false);

  // These values make the card feel more like Amazon even when the
  // database does not yet provide real review/discount data for every row.
  const fakeRating = ((product.id % 5) * 0.4 + 3.5).toFixed(1);
  const fakeReviews = ((product.id * 137) % 4800 + 120);
  const fakeOriginal = (product.price * 1.2).toFixed(0);
  const discount = Math.round(((fakeOriginal - product.price) / fakeOriginal) * 100);

  // Check wishlist status for signed-in users
  useEffect(() => {
    if (isSignedIn) {
      API.get(`/api/wishlist/check/${product.id}`)
        .then((res) => setWishlisted(res.data.wishlisted))
        .catch(() => {}); // Silently fail
    }
  }, [isSignedIn, product.id]);

  // Toggle wishlist
  const toggleWishlist = async (e) => {
    e.preventDefault(); // Don't navigate if inside a link
    e.stopPropagation();

    if (!isSignedIn) {
      navigate("/sign-in");
      return;
    }

    try {
      if (wishlisted) {
        await API.delete(`/api/wishlist/${product.id}`);
        setWishlisted(false);
      } else {
        await API.post("/api/wishlist", { product_id: product.id });
        setWishlisted(true);
      }
    } catch (error) {
      console.error("Wishlist toggle error:", error);
    }
  };

  return (
    <div className="product-card">
      {/* Wishlist heart icon */}
      <button
        className={`heart-btn ${wishlisted ? "active" : ""}`}
        onClick={toggleWishlist}
        title={wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
      >
        {wishlisted ? "♥" : "♡"}
      </button>

      {/* Product image */}
      <Link to={`/products/${product.id}`} className="product-image-link">
        <img src={product.image_url} alt={product.name} className="product-image" />
      </Link>

      <div className="product-info">
        {/* Category */}
        <span className="product-category-badge">{product.category}</span>

        {/* Name */}
        <Link to={`/products/${product.id}`} className="product-name-link">
          <h3 className="product-name">{product.name}</h3>
        </Link>

        {/* Star rating */}
        <div className="product-rating">
          <StarRating rating={parseFloat(fakeRating)} />
          <span className="product-rating-count">{fakeReviews.toLocaleString()}</span>
        </div>

        {/* Prime-style badges are small but make cards feel very Amazon. */}
        <div className="product-card-badges">
          <span className="prime-badge">prime</span>
          <span className="deal-mini-badge">Limited time deal</span>
        </div>

        {/* Price section */}
        <div className="product-price-section">
          <span className="product-price">
            {formatPrice(product.price)}
          </span>
          <span className="product-price-original">₹{Number(fakeOriginal).toLocaleString("en-IN")}</span>
          <span style={{ color: "#CC0C39", fontSize: "0.8rem", marginLeft: "0.3rem" }}>
            ({discount}% off)
          </span>
        </div>

        {/* Delivery */}
        <p className="product-delivery">
          <strong>{getDeliveryPromise(product.id)}</strong>
        </p>

        {/* Add to Cart */}
        <button
          className="btn btn-amazon"
          style={{ width: "100%", marginTop: "0.6rem" }}
          onClick={() => onAddToCart(product.id)}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
