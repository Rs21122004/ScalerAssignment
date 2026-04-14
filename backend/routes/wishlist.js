// ============================================================
// routes/wishlist.js — Wishlist API Routes
// ============================================================
// This file handles all API requests related to the WISHLIST.
// Every route here requires authentication (requireAuth middleware
// is applied in server.js).
//
// Routes:
//   POST   /api/wishlist           → Add a product to the wishlist
//   GET    /api/wishlist           → Get all wishlist items
//   DELETE /api/wishlist/:productId → Remove a product from wishlist
//   GET    /api/wishlist/check/:productId → Check if product is wishlisted
//
// The wishlist_items table has a UNIQUE(user_id, product_id)
// constraint, so adding the same product twice is idempotent.
// ============================================================

const express = require("express");
const router = express.Router();
const db = require("../db");

// ============================
// POST /api/wishlist
// ============================
// Adds a product to the user's wishlist.
// Uses ON CONFLICT to make it idempotent (no error on duplicate).
router.post("/", async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: "product_id is required" });
    }

    const result = await db.query(
      `INSERT INTO wishlist_items (user_id, product_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, product_id) DO NOTHING
       RETURNING *`,
      [userId, product_id]
    );

    // If ON CONFLICT hit, result.rows is empty — still success.
    res.status(201).json({
      message: "Added to wishlist",
      item: result.rows[0] || null,
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ error: "Failed to add to wishlist" });
  }
});

// ============================
// GET /api/wishlist
// ============================
// Returns all wishlisted products for the signed-in user.
// Joins with products to include name, price, image, etc.
router.get("/", async (req, res) => {
  try {
    const userId = req.auth.userId;

    const result = await db.query(
      `SELECT wishlist_items.id, wishlist_items.added_at,
              products.id AS product_id, products.name,
              products.price, products.image_url, products.rating,
              products.review_count, products.stock, products.category
       FROM wishlist_items
       JOIN products ON wishlist_items.product_id = products.id
       WHERE wishlist_items.user_id = $1
       ORDER BY wishlist_items.added_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
});

// ============================
// GET /api/wishlist/check/:productId
// ============================
// Quick check whether a specific product is in the user's wishlist.
// Returns { wishlisted: true/false }.
// Used by ProductCard and ProductDetailPage to show heart state.
router.get("/check/:productId", async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { productId } = req.params;

    const result = await db.query(
      "SELECT id FROM wishlist_items WHERE user_id = $1 AND product_id = $2",
      [userId, productId]
    );

    res.json({ wishlisted: result.rows.length > 0 });
  } catch (error) {
    console.error("Error checking wishlist:", error);
    res.status(500).json({ error: "Failed to check wishlist" });
  }
});

// ============================
// DELETE /api/wishlist/:productId
// ============================
// Removes a product from the user's wishlist.
// We use product_id (not wishlist_item id) because the frontend
// knows the product_id but not necessarily the wishlist row id.
router.delete("/:productId", async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { productId } = req.params;

    const result = await db.query(
      "DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2 RETURNING *",
      [userId, productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not in wishlist" });
    }

    res.json({ message: "Removed from wishlist", item: result.rows[0] });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({ error: "Failed to remove from wishlist" });
  }
});

module.exports = router;
