// ============================================================
// routes/products.js — Product API Routes
// ============================================================
// GET /api/products      → Get all products (search + category filter)
// GET /api/products/:id  → Get one product with its images
// ============================================================

const express = require("express");
const router = express.Router();
const db = require("../db");

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

module.exports = router;
