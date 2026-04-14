// ============================================================
// ProductsPage.jsx — Amazon-Style Search Results Page
// ============================================================
// This page is the "search results" experience of the clone.
// It now behaves more like Amazon by including:
//   1. URL-driven search and category filters
//   2. A left sidebar with department, price, rating, and Prime filters
//   3. A sort dropdown
//   4. Product cards that can open the cart drawer after Add to Cart
//
// IMPORTANT IDEA:
// The backend currently supports search/category query params.
// Price/rating/Prime filters are applied on the frontend for now.
// That keeps the feature simple while still making the UI realistic.
// ============================================================

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api";
import ProductCard from "../components/ProductCard";

function ProductsPage({ onCartUpdate }) {
  // Products from the API before client-side filters are applied.
  const [products, setProducts] = useState([]);

  // Loading and message states keep the user informed during API calls.
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Extra filters that Amazon usually shows in the left sidebar.
  const [priceFilter, setPriceFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [primeOnly, setPrimeOnly] = useState(false);
  const [sortBy, setSortBy] = useState("featured");

  // React Router tools for reading and writing query parameters.
  const location = useLocation();
  const navigate = useNavigate();

  // URLSearchParams lets this page react to /products?search=x&category=y.
  const queryParams = new URLSearchParams(location.search);
  const search = queryParams.get("search") || "";
  const category = queryParams.get("category") || "";

  // Departments shown in the sidebar.
  const categories = ["All", "Electronics", "Books", "Clothing", "Home"];

  // ============================
  // Fetch products from backend
  // ============================
  // The API handles search/category. Client filters are applied later.
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      // Build query parameters for the backend API.
      const params = {};
      if (search) params.search = search;
      if (category && category !== "All") params.category = category;

      const response = await API.get("/api/products", { params });
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ============================
  // Update category in URL
  // ============================
  // Keeping category/search in the URL makes search shareable and lets
  // the navbar/homepage link directly into filtered product results.
  const updateCategory = (nextCategory) => {
    const nextParams = new URLSearchParams(location.search);

    if (nextCategory === "All") {
      nextParams.delete("category");
    } else {
      nextParams.set("category", nextCategory);
    }

    navigate(`/products?${nextParams.toString()}`);
  };

  // ============================
  // Add a product to cart
  // ============================
  // After the backend succeeds, App.jsx opens the cart drawer using
  // the product object passed to onCartUpdate(product).
  const addToCart = async (productId) => {
    try {
      const product = products.find((item) => item.id === productId);
      await API.post("/api/cart", { product_id: productId, quantity: 1 });

      setMessage("Added to cart");
      setTimeout(() => setMessage(""), 1800);

      if (onCartUpdate) onCartUpdate(product);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setMessage("Failed to add to cart");
      setTimeout(() => setMessage(""), 1800);
    }
  };

  // ============================
  // Client-side filter + sort
  // ============================
  // useMemo avoids recalculating the filtered list unless its inputs
  // actually change.
  const visibleProducts = useMemo(() => {
    let nextProducts = [...products];

    // Price ranges mimic Amazon sidebar filters.
    if (priceFilter === "under1000") {
      nextProducts = nextProducts.filter((product) => Number(product.price) < 1000);
    }
    if (priceFilter === "1000to5000") {
      nextProducts = nextProducts.filter(
        (product) => Number(product.price) >= 1000 && Number(product.price) <= 5000
      );
    }
    if (priceFilter === "above5000") {
      nextProducts = nextProducts.filter((product) => Number(product.price) > 5000);
    }

    // The seed data has ratings for many products. If rating is missing,
    // fall back to a generated rating so the filter still works.
    if (ratingFilter !== "all") {
      const minimumRating = Number(ratingFilter);
      nextProducts = nextProducts.filter((product) => {
        const rating = Number(product.rating || ((product.id % 5) * 0.4 + 3.5));
        return rating >= minimumRating;
      });
    }

    // Prime is simulated here: most Amazon cards show Prime delivery.
    // We mark alternating products as Prime-eligible to make the filter useful.
    if (primeOnly) {
      nextProducts = nextProducts.filter((product) => product.id % 2 === 0);
    }

    // Sorting changes display order without asking the backend again.
    if (sortBy === "priceLow") {
      nextProducts.sort((a, b) => Number(a.price) - Number(b.price));
    }
    if (sortBy === "priceHigh") {
      nextProducts.sort((a, b) => Number(b.price) - Number(a.price));
    }
    if (sortBy === "rating") {
      nextProducts.sort((a, b) => Number(b.rating || 4) - Number(a.rating || 4));
    }
    if (sortBy === "newest") {
      nextProducts.sort((a, b) => Number(b.id) - Number(a.id));
    }

    return nextProducts;
  }, [products, priceFilter, ratingFilter, primeOnly, sortBy]);

  return (
    <div className="page">
      {/* Toast is still useful, but drawer is the main confirmation. */}
      {message && <div className="toast">{message}</div>}

      {/* Search result header mirrors Amazon's result-count language. */}
      <div className="results-toolbar">
        <div>
          <p className="breadcrumbs">Amazon.in / {category || "All Departments"}</p>
          <h1>
            {search ? `Results for "${search}"` : category || "All Products"}
          </h1>
          {!loading && (
            <span className="results-count">
              {visibleProducts.length} results
            </span>
          )}
        </div>

        {/* Sort control on the right side of the toolbar. */}
        <label className="sort-control">
          Sort by:
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="priceLow">Price: Low to High</option>
            <option value="priceHigh">Price: High to Low</option>
            <option value="rating">Avg. Customer Review</option>
            <option value="newest">Newest Arrivals</option>
          </select>
        </label>
      </div>

      <div className="products-layout">
        {/* ============================
            LEFT SIDEBAR FILTERS
            ============================ */}
        <aside className="filters-sidebar">
          <h2>Filters</h2>

          <div className="filter-group">
            <h3>Department</h3>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`filter-link ${
                  (cat === "All" && !category) || cat === category ? "active" : ""
                }`}
                onClick={() => updateCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="filter-group">
            <h3>Price</h3>
            <label>
              <input
                type="radio"
                name="price"
                checked={priceFilter === "all"}
                onChange={() => setPriceFilter("all")}
              />
              All prices
            </label>
            <label>
              <input
                type="radio"
                name="price"
                checked={priceFilter === "under1000"}
                onChange={() => setPriceFilter("under1000")}
              />
              Under ₹1,000
            </label>
            <label>
              <input
                type="radio"
                name="price"
                checked={priceFilter === "1000to5000"}
                onChange={() => setPriceFilter("1000to5000")}
              />
              ₹1,000 - ₹5,000
            </label>
            <label>
              <input
                type="radio"
                name="price"
                checked={priceFilter === "above5000"}
                onChange={() => setPriceFilter("above5000")}
              />
              Above ₹5,000
            </label>
          </div>

          <div className="filter-group">
            <h3>Customer Review</h3>
            {["all", "4", "3"].map((rating) => (
              <button
                key={rating}
                className={`filter-link ${ratingFilter === rating ? "active" : ""}`}
                onClick={() => setRatingFilter(rating)}
              >
                {rating === "all" ? "All ratings" : `${rating}★ & up`}
              </button>
            ))}
          </div>

          <div className="filter-group">
            <h3>Delivery</h3>
            <label>
              <input
                type="checkbox"
                checked={primeOnly}
                onChange={(e) => setPrimeOnly(e.target.checked)}
              />
              Prime eligible
            </label>
          </div>
        </aside>

        {/* ============================
            RIGHT SIDE PRODUCT GRID
            ============================ */}
        <section className="products-results">
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : visibleProducts.length === 0 ? (
            <div className="empty-state">No products found.</div>
          ) : (
            <div className="product-grid">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default ProductsPage;
