// ============================================================
// routes/products.js — Product API Routes
// ============================================================
// GET /api/products      → Get all products (search + category filter)
// GET /api/products/:id  → Get one product with its images
// ============================================================

const express = require("express");
const router = express.Router();
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

// ============================
// GET /api/products
// ============================
// Returns all products with optional search and category filter.
// Query params: ?search=phone&category=Electronics

router.get("/", async (req, res) => {
  try {
    const { search, category } = req.query;

    let query = "SELECT * FROM products";
    const conditions = [];
    const values = [];

    if (search) {
      conditions.push("name ILIKE $" + (values.length + 1));
      values.push("%" + search + "%");
    }

    if (category) {
      conditions.push("category = $" + (values.length + 1));
      values.push(category);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY created_at DESC";

    const result = await db.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// ============================
// GET /api/products/suggestions
// ============================
// Returns up to 6 product suggestions for search autocomplete.
// Query param: ?q=phone

router.get("/suggestions", async (req, res) => {
  try {
    const q = req.query.q || "";
    if (q.trim().length < 2) {
      return res.json([]);
    }

    const result = await db.query(
      "SELECT id, name, image_url, price, category FROM products WHERE name ILIKE $1 ORDER BY name ASC LIMIT 6",
      ["%" + q + "%"]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
});

// ============================
// GET /api/products/:id
// ============================
// Returns ONE product by ID, including its carousel images.
// Images come from product_images table, ordered by display_order.

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Get the product
    const result = await db.query("SELECT * FROM products WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = result.rows[0];

    // Get all images for this product (for the carousel)
    const imagesResult = await db.query(
      "SELECT * FROM product_images WHERE product_id = $1 ORDER BY display_order ASC",
      [id]
    );

    // Attach images array to the product object
    product.images = imagesResult.rows;

    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// ============================
// GET /api/products/:id/reviews
// ============================
// Returns all reviews for a product, newest first.

router.get("/:id/reviews", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC",
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// ============================
// POST /api/products/:id/reviews
// ============================
// Adds a review for a product. Requires authentication.
// Body: { rating, title, body, reviewer_name }

router.post("/:id/reviews", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth.userId;
    const { rating, title, body, reviewer_name } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }
    if (!title || !body) {
      return res.status(400).json({ error: "Title and review body are required" });
    }

    // Check if user already reviewed this product
    const existing = await db.query(
      "SELECT id FROM reviews WHERE product_id = $1 AND user_id = $2",
      [id, userId]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "You have already reviewed this product" });
    }

    // Insert the review
    const result = await db.query(
      `INSERT INTO reviews (product_id, user_id, reviewer_name, rating, title, body)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, userId, reviewer_name || "Amazon Customer", rating, title, body]
    );

    // Update the product's average rating and review count
    await db.query(
      `UPDATE products SET
         rating = (SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE product_id = $1),
         review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = $1)
       WHERE id = $1`,
      [id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ error: "Failed to create review" });
  }
});

module.exports = router;
