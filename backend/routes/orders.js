// ============================================================
// routes/orders.js — Order API Routes
// ============================================================
// This file handles all API requests related to ORDERS.
// ALL routes here require authentication (enforced by server.js).
//
// Routes:
//   POST /api/orders     → Place a new order (checkout)
//   GET  /api/orders     → Get all past orders for this user
//   GET  /api/orders/:id → Get one order for confirmation page
//
// CHECKOUT FLOW:
// 1. Get all items from the user's cart
// 2. Calculate total price
// 3. Create a new order with user_id
// 4. Move cart items into order_items
// 5. Clear the user's cart
// 6. Send confirmation email
// All of this happens inside a TRANSACTION (all or nothing).
// ============================================================

const express = require("express");
const router = express.Router();
const db = require("../db");
const { sendOrderConfirmation } = require("../utils/mailer");

// ============================
// POST /api/orders
// ============================
// Places a new order (checkout).
// This is the most complex route — it uses a TRANSACTION.
// A transaction means: if ANY step fails, ALL changes are rolled back.
// This prevents situations like "order created but cart not cleared".

router.post("/", async (req, res) => {
  // Get a dedicated client from the pool for our transaction
  const client = await db.connect();

  // Get shipping address and email from request body
  const { shipping_address, customer_email } = req.body;

  // Identities from Clerk and headers
  const userId = req.auth.userId;
  const sessionId = req.headers["x-cart-session"];

  try {
    // START the transaction
    await client.query("BEGIN");
    console.log(`🏦 Starting transaction for user: ${userId}`);

    // Step 1: Get all items from the user's cart (with product prices)
    const cartResult = await client.query(
      `SELECT cart_items.id, cart_items.quantity, 
              products.id AS product_id, products.price, products.name, products.image_url
       FROM cart_items
       JOIN products ON cart_items.product_id = products.id
       WHERE cart_items.user_id = $1 OR cart_items.session_id = $2`,
      [userId, sessionId || null]
    );

    const cartItems = cartResult.rows;

    // Check if cart is empty
    if (cartItems.length === 0) {
      console.warn(`⚠️  Empty cart for user: ${userId}`);
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Cart is empty" });
    }

    console.log(`🛒 Found ${cartItems.length} items in cart. Totaling...`);

    // Step 2: Calculate total price
    // For each item: price × quantity, then add them all up
    let totalAmount = 0;
    for (const item of cartItems) {
      totalAmount += parseFloat(item.price) * item.quantity;
    }

    // Step 3: Create the order (with user_id and optional email/address)
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, customer_email, total_amount, shipping_address) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, customer_email || null, totalAmount, shipping_address || null]
    );
    const order = orderResult.rows[0];
    console.log(`📝 Order #${order.id} created.`);

    // Step 4: Move each cart item into order_items
    for (const item of cartItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price) 
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.product_id, item.quantity, item.price]
      );
    }

    // Step 5: Clear the user's cart (both guest and user items)
    await client.query(
      "DELETE FROM cart_items WHERE user_id = $1 OR session_id = $2", 
      [userId, sessionId || null]
    );

    // COMMIT the transaction — make all changes permanent
    await client.query("COMMIT");
    console.log("✅ Transaction committed successfully.");

    // Step 6: Send confirmation email (after commit so order is safe)
    // This runs asynchronously — if it fails, the order is still placed.
    if (customer_email) {
      sendOrderConfirmation(customer_email, order, cartItems).catch((err) =>
        console.error("Email send error:", err)
      );
    }

    // Send back the created order
    res.status(201).json({
      message: "Order placed successfully!",
      order: order,
    });
  } catch (error) {
    // If anything goes wrong, ROLLBACK — undo all changes
    if (client) await client.query("ROLLBACK");
    console.error("❌ Error placing order:", error.message);
    res.status(500).json({ 
      error: "Failed to place order", 
      details: error.message 
    });
  } finally {
    // Always release the client back to the pool
    client.release();
  }
});

// ============================
// GET /api/orders
// ============================
// Returns all past orders for the signed-in user.
// Each order includes its items (with product names).
// We fetch orders first, then fetch items for each order.

router.get("/", async (req, res) => {
  try {
    const userId = req.auth.userId;

    // Step 1: Get all orders for this user, newest first
    const ordersResult = await db.query(
      "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    const orders = ordersResult.rows;

    // Step 2: For each order, get its items
    for (const order of orders) {
      const itemsResult = await db.query(
        `SELECT order_items.*, products.name, products.image_url
         FROM order_items
         JOIN products ON order_items.product_id = products.id
         WHERE order_items.order_id = $1`,
        [order.id]
      );
      // Attach items array to the order object
      order.items = itemsResult.rows;
    }

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// ============================
// GET /api/orders/:id
// ============================
// Returns ONE order with its items.
// The order confirmation page uses this route so the user can refresh
// /order-confirmation/12 and still see the order ID + summary.
// Verifies the order belongs to the requesting user.

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth.userId;

    // Step 1: Fetch the order row — only if it belongs to this user.
    const orderResult = await db.query(
      "SELECT * FROM orders WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orderResult.rows[0];

    // Step 2: Fetch all products that were part of this order.
    const itemsResult = await db.query(
      `SELECT order_items.*, products.name, products.image_url
       FROM order_items
       LEFT JOIN products ON order_items.product_id = products.id
       WHERE order_items.order_id = $1`,
      [id]
    );

    order.items = itemsResult.rows;

    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// Export the router
module.exports = router;
