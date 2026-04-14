// ============================================================
// ProductDetailPage.jsx — Amazon-Style Product Detail Page
// ============================================================
// This page turns a simple product view into something closer to
// the actual Amazon product page.
//
// It includes:
//   1. Breadcrumbs at the top
//   2. Left image gallery with clickable thumbnails
//   3. Center product title, rating, price, features, and specs
//   4. Right buy box with delivery, quantity, Add to Cart, Buy Now
//   5. Wishlist button (Add to Wish List / ♥ Added)
//   6. Customer reviews section
//   7. Related product recommendations
//
// The backend already returns product.images for the gallery. If a
// product has no extra images, we fall back to the main image.
// ============================================================

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import API from "../api";
import {
  categorySpecs,
  formatPrice,
  getDeliveryPromise,
  getStars,
  recommendationProducts,
  sampleReviews,
} from "../data/amazonExtras";

function ProductDetailPage({ onCartUpdate }) {
  // The product id comes from the URL: /products/:id.
  const { id } = useParams();

  // navigate lets the Buy Now button move directly to checkout.
  const navigate = useNavigate();

  // Clerk auth for wishlist
  const { isSignedIn } = useUser();

  // Main product state from the backend.
  const [product, setProduct] = useState(null);

  // Loading/message states keep the UI clear while requests happen.
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // selectedImage stores which gallery image is currently shown large.
  const [selectedImage, setSelectedImage] = useState("");

  // Quantity selector in the right buy box.
  const [quantity, setQuantity] = useState(1);

  // Wishlist state
  const [wishlisted, setWishlisted] = useState(false);

  // ============================
  // Fetch product details
  // ============================
  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.get(`/api/products/${id}`);
      setProduct(response.data);

      // Start the gallery on the main product image.
      setSelectedImage(response.data.image_url);
    } catch (error) {
      console.error("Error fetching product:", error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Check wishlist status
  useEffect(() => {
    if (isSignedIn && id) {
      API.get(`/api/wishlist/check/${id}`)
        .then((res) => setWishlisted(res.data.wishlisted))
        .catch(() => {});
    }
  }, [isSignedIn, id]);

  // Toggle wishlist
  const toggleWishlist = async () => {
    if (!isSignedIn) {
      navigate("/sign-in");
      return;
    }

    try {
      if (wishlisted) {
        await API.delete(`/api/wishlist/${id}`);
        setWishlisted(false);
        setMessage("Removed from wishlist");
      } else {
        await API.post("/api/wishlist", { product_id: Number(id) });
        setWishlisted(true);
        setMessage("Added to wishlist");
      }
      setTimeout(() => setMessage(""), 1800);
    } catch (error) {
      console.error("Wishlist error:", error);
    }
  };

  // Build a gallery from the main product image plus backend images.
  const galleryImages = useMemo(() => {
    if (!product) return [];

    const images = [
      { image_url: product.image_url, id: "main" },
      ...(product.images || []),
    ];

    // Remove duplicate URLs so the thumbnail strip stays clean.
    return images.filter(
      (image, index, allImages) =>
        allImages.findIndex((item) => item.image_url === image.image_url) === index
    );
  }, [product]);

  // Pick the specs for this product's category. If category is unknown,
  // show the Electronics set because it is the most detailed fallback.
  const specs = categorySpecs[product?.category] || categorySpecs.Electronics;

  // Related products are intentionally simple: same category first,
  // then fill from the shared recommendation list.
  const relatedProducts = recommendationProducts
    .filter((item) => item.id !== Number(id))
    .sort((a, b) => {
      if (a.category === product?.category && b.category !== product?.category) return -1;
      if (b.category === product?.category && a.category !== product?.category) return 1;
      return 0;
    })
    .slice(0, 4);

  // ============================
  // Add to Cart
  // ============================
  // Sends selected quantity to the backend, then asks App.jsx to open
  // the Amazon-style cart drawer with this product.
  const addToCart = async () => {
    try {
      await API.post("/api/cart", {
        product_id: product.id,
        quantity,
      });

      setMessage("Added to cart");
      setTimeout(() => setMessage(""), 1800);

      if (onCartUpdate) onCartUpdate(product);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setMessage("Failed to add to cart");
      setTimeout(() => setMessage(""), 1800);
    }
  };

  // Buy Now adds the product but skips the drawer because the user
  // clearly wants to move straight into checkout.
  const buyNow = async () => {
    try {
      await API.post("/api/cart", {
        product_id: product.id,
        quantity,
      });

      if (onCartUpdate) onCartUpdate();
      navigate("/checkout");
    } catch (error) {
      console.error("Error starting checkout:", error);
      setMessage("Failed to start checkout");
      setTimeout(() => setMessage(""), 1800);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page">
        <div className="empty-state">
          <p>Product not found.</p>
          <button className="btn btn-primary" onClick={() => navigate("/products")}>
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {message && <div className="toast">{message}</div>}

      {/* Breadcrumbs help the page feel like a real Amazon listing. */}
      <div className="product-breadcrumbs">
        <Link to="/products">Products</Link>
        <span>/</span>
        <Link to={`/products?category=${product.category}`}>{product.category}</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <section className="product-detail amazon-detail-layout">
        {/* ============================
            LEFT: Image gallery
            ============================ */}
        <div className="product-gallery">
          <div className="product-thumbnails">
            {galleryImages.map((image) => (
              <button
                key={image.id || image.image_url}
                className={`thumbnail-btn ${
                  selectedImage === image.image_url ? "active" : ""
                }`}
                onClick={() => setSelectedImage(image.image_url)}
              >
                <img src={image.image_url} alt={product.name} />
              </button>
            ))}
          </div>

          <div className="product-main-image-wrapper">
            <img
              src={selectedImage}
              alt={product.name}
              className="product-main-image"
            />
          </div>
        </div>

        {/* ============================
            CENTER: Product information
            ============================ */}
        <div className="product-detail-info">
          <span className="product-category-badge">{product.category}</span>
          <h1 className="product-detail-name">{product.name}</h1>

          <div className="product-detail-rating">
            <span className="review-stars">{getStars(product.rating || 4)}</span>
            <span className="product-detail-rating-text">
              {product.rating || "4.2"} · {Number(product.review_count || 1284).toLocaleString("en-IN")} ratings
            </span>
          </div>

          <div className="product-detail-price-section">
            <div className="product-detail-price-label">Price:</div>
            <div className="detail-price-row">
              <span className="product-detail-price">{formatPrice(product.price)}</span>
              <span className="detail-mrp">
                {formatPrice(Number(product.price) * 1.2)}
              </span>
              <span className="detail-discount">20% off</span>
            </div>
            <p className="tax-copy">Inclusive of all taxes</p>
          </div>

          <div className="offers-strip">
            <div>
              <strong>Bank Offer</strong>
              <span>10% instant discount on select cards</span>
            </div>
            <div>
              <strong>No Cost EMI</strong>
              <span>Available on eligible orders</span>
            </div>
            <div>
              <strong>Partner Offer</strong>
              <span>Get extra savings at checkout</span>
            </div>
          </div>

          <div className="about-product">
            <h2>About this item</h2>
            <p>{product.description}</p>
            <ul>
              <li>Carefully selected product information for easier shopping.</li>
              <li>Fast delivery options with simple returns on eligible orders.</li>
              <li>Secure checkout and order history after purchase.</li>
            </ul>
          </div>

          <div className="product-specs">
            <h2>Product details</h2>
            {specs.map(([label, value]) => (
              <div key={label} className="spec-row">
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* ============================
            RIGHT: Buy box
            ============================ */}
        <aside className="buy-box">
          <p className="buy-box-price">{formatPrice(product.price)}</p>
          <p className="buy-box-delivery">{getDeliveryPromise(product.id)}</p>
          <p className="buy-box-location">Delivering to India</p>
          <p className={`product-detail-stock ${product.stock > 0 ? "in-stock" : "out-of-stock"}`}>
            {product.stock > 0 ? "In stock" : "Currently unavailable"}
          </p>

          <label className="quantity-control">
            Quantity:
            <select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}>
              {[1, 2, 3, 4, 5].map((number) => (
                <option key={number} value={number}>
                  {number}
                </option>
              ))}
            </select>
          </label>

          <button
            className="btn btn-primary btn-full"
            onClick={addToCart}
            disabled={product.stock <= 0}
          >
            Add to Cart
          </button>
          <button
            className="btn btn-amazon-orange btn-full"
            onClick={buyNow}
            disabled={product.stock <= 0}
          >
            Buy Now
          </button>

          {/* Wishlist button */}
          <button
            className={`btn btn-wishlist btn-full ${wishlisted ? "wishlisted" : ""}`}
            onClick={toggleWishlist}
          >
            {wishlisted ? "♥ Added to Wish List" : "♡ Add to Wish List"}
          </button>

          <div className="secure-transaction">🔒 Secure transaction</div>
        </aside>
      </section>

      {/* ============================
          CUSTOMER REVIEWS
          ============================ */}
      <section className="detail-section">
        <h2>Customer reviews</h2>
        <div className="reviews-layout">
          <div className="rating-summary">
            <div className="rating-big">{product.rating || "4.2"} out of 5</div>
            <div className="review-stars">{getStars(product.rating || 4)}</div>
            <p>{Number(product.review_count || 1284).toLocaleString("en-IN")} global ratings</p>
            {[5, 4, 3, 2, 1].map((star, index) => (
              <div key={star} className="rating-bar-row">
                <span>{star} star</span>
                <div className="rating-bar">
                  <div style={{ width: `${70 - index * 13}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="review-list">
            {sampleReviews.map((review) => (
              <article key={review.title} className="review-card">
                <strong>{review.name}</strong>
                <div className="review-stars">{getStars(review.rating)}</div>
                <h3>{review.title}</h3>
                <p className="review-date">{review.date}</p>
                <p>{review.body}</p>
                <button className="btn btn-outline">Helpful</button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============================
          RELATED PRODUCTS
          ============================ */}
      <section className="detail-section">
        <h2>Customers who viewed this item also viewed</h2>
        <div className="related-row">
          {relatedProducts.map((item) => (
            <button
              key={item.id}
              className="related-product"
              onClick={() => navigate(`/products/${item.id}`)}
            >
              <img src={item.image_url} alt={item.name} />
              <span>{item.name}</span>
              <strong>{formatPrice(item.price)}</strong>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default ProductDetailPage;
