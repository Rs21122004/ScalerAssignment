// ============================================================
// routes/cart.js — Shopping Cart API Routes
// ============================================================
// This file handles all API requests related to the CART.
//
// GUEST CART (Amazon-style):
//   Guests don't have a user_id, so we use a session_id instead.
//   The frontend generates a UUID and stores it in localStorage.
//   Every cart request sends this UUID in the X-Cart-Session header.
//   When the user signs in, we merge their session cart into their
//   user cart via POST /api/cart/merge.
//
// Routes:
//   POST   /api/cart        → Add a product to the cart
//   GET    /api/cart        → Get all items in the cart
//   PUT    /api/cart/:id    → Update quantity of a cart item
//   DELETE /api/cart/:id    → Remove an item from the cart
//   POST   /api/cart/merge  → Merge guest session cart into user cart
// ============================================================

const express = require("express");
const router = express.Router();
const db = require("../db");

// ============================
// HELPER: Get cart owner filters
// ============================
// Returns the WHERE clause + params to scope cart queries.
// If the user is signed in, we filter by user_id.
// If not, we filter by the X-Cart-Session header.
function getCartOwner(req) {
  const userId = req.auth?.userId;
  const sessionId = req.headers["x-cart-session"];

  if (userId) {
    return { column: "user_id", value: userId };
  }
  if (sessionId) {
    return { column: "session_id", value: sessionId };
  }
  return null;
}

// ============================
// POST /api/cart
// ============================
// Adds a product to the cart.
// Request body must include: { product_id: 5, quantity: 2 }
// If the product is ALREADY in the cart, we increase the quantity instead.

router.post("/", async (req, res) => {
  try {
    const owner = getCartOwner(req);
    if (!owner) {
      return res
        .status(400)
        .json({ error: "Sign in or enable cookies to use the cart" });
    }

    // Get product_id and quantity from the request body
    const { product_id, quantity } = req.body;

    // Validate: make sure product_id is provided
    if (!product_id) {
      return res.status(400).json({ error: "product_id is required" });
    }

    // Default quantity to 1 if not provided
    const qty = quantity || 1;

    // Check if this product is already in the cart for this user/session
    const existing = await db.query(
      `SELECT * FROM cart_items WHERE product_id = $1 AND ${owner.column} = $2`,
      [product_id, owner.value]
    );

    if (existing.rows.length > 0) {
      // Product already in cart → UPDATE the quantity (add to existing)
      const newQty = existing.rows[0].quantity + qty;
      const result = await db.query(
        "UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *",
        [newQty, existing.rows[0].id]
      );
      return res.json(result.rows[0]);
    }

    // Product not in cart → INSERT a new row
    const result = await db.query(
      `INSERT INTO cart_items (product_id, quantity, ${owner.column}) VALUES ($1, $2, $3) RETURNING *`,
      [product_id, qty, owner.value]
    );

    // 201 means "Created" — we created a new cart item
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

// ============================
// POST /api/cart/merge
// ============================
// Called when a guest signs in. Moves all session cart items to the
// user's cart. If the product already exists in the user cart, we
// add the quantities together.
// Body: { session_id: "abc-123-..." }

router.post("/merge", async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Sign in to merge cart" });
    }

    const { session_id } = req.body;
    if (!session_id) {
      return res.json({ message: "No session to merge" });
    }

    console.log(`🛒 Merging guest cart (${session_id}) into user cart (${userId})`);
    
    // Get all session cart items
    const sessionItems = await db.query(
      "SELECT * FROM cart_items WHERE session_id = $1",
      [session_id]
    );

    console.log(`📦 Found ${sessionItems.rows.length} items to merge.`);

    for (const item of sessionItems.rows) {
      // Check if this product already exists in the user's cart
      const existing = await db.query(
        "SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2",
        [userId, item.product_id]
      );

      if (existing.rows.length > 0) {
        // Merge: add guest quantity to existing user quantity
        await db.query(
          "UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2",
          [item.quantity, existing.rows[0].id]
        );
        // Remove the old session item
        await db.query("DELETE FROM cart_items WHERE id = $1", [item.id]);
        console.log(`✅ Merged product ${item.product_id} (added quantity)`);
      } else {
        // Transfer: change ownership from session to user
        await db.query(
          "UPDATE cart_items SET user_id = $1, session_id = NULL WHERE id = $2",
          [userId, item.id]
        );
        console.log(`✅ Transferred product ${item.product_id} to user`);
      }
    }

    res.json({ message: "Cart merged successfully" });
  } catch (error) {
    console.error("Error merging cart:", error);
    res.status(500).json({ error: "Failed to merge cart" });
  }
});

// ============================
// GET /api/cart
// ============================
// Returns all items in the cart WITH product details (name, price, image).
// We use a JOIN to combine cart_items with products table.
// This way the frontend gets all the info it needs in ONE request.

router.get("/", async (req, res) => {
  try {
    const owner = getCartOwner(req);
    if (!owner) {
      return res.json([]); // No cart identity → empty cart
    }

    const result = await db.query(
      `SELECT 
        cart_items.id,
        cart_items.quantity,
        products.id AS product_id,
        products.name,
        products.price,
        products.image_url,
        products.stock
      FROM cart_items
      JOIN products ON cart_items.product_id = products.id
      WHERE cart_items.${owner.column} = $1
      ORDER BY cart_items.added_at DESC`,
      [owner.value]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// ============================
// PUT /api/cart/:id
// ============================
// Updates the quantity of a cart item.
// :id is the cart_item id (NOT the product id).
// Request body: { quantity: 3 }

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    // Validate: quantity must be at least 1
    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: "Quantity must be at least 1" });
    }

    const owner = getCartOwner(req);
    if (!owner) {
      return res.status(400).json({ error: "Cart identity missing" });
    }

    // Verify ownership before updating
    const result = await db.query(
      `UPDATE cart_items SET quantity = $1 WHERE id = $2 AND ${owner.column} = $3 RETURNING *`,
      [quantity, id, owner.value]
    );

    // If no rows updated, the cart item doesn't exist
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ error: "Failed to update cart" });
  }
});

// ============================
// DELETE /api/cart/:id
// ============================
// Removes an item from the cart.
// :id is the cart_item id.

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const owner = getCartOwner(req);
    if (!owner) {
      return res.status(400).json({ error: "Cart identity missing" });
    }

    // Verify ownership before deleting
    const result = await db.query(
      `DELETE FROM cart_items WHERE id = $1 AND ${owner.column} = $2 RETURNING *`,
      [id, owner.value]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    // Send back the deleted item as confirmation
    res.json({ message: "Item removed from cart", item: result.rows[0] });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ error: "Failed to remove from cart" });
  }
});

// Export the router
module.exports = router;
