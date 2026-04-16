# E-Commerce Project API Documentation

This document provides a detailed overview of all the API endpoints available in the backend of the E-Commerce application. The base URL for all routes is typically `http://localhost:5001`.

## Authentication & Authorization Context
- **Public Routes:** Anyone can access these routes (e.g., getting products).
- **Guest-Session Routes:** Specifically for the Cart. If a user is not logged in via Clerk, a generated UUID (`X-Cart-Session` header) operates as their temporary identification.
- **Protected Routes:** Requires a valid Clerk JWT passed in the `Authorization: Bearer <token>` header. Used for Orders and Wishlist endpoints.

---

## 1. Products API (`/api/products`)

### `GET /api/products`
- **Description:** Retrieves a list of all products.
- **Query Parameters (Optional):**
  - `search` (string): Filters the products by name (case-insensitive).
  - `category` (string): Filters the products by a specific category (e.g., "Electronics").
- **Auth Required:** No.
- **Returns:** An array of product objects, ordered by newest first.

### `GET /api/products/:id`
- **Description:** Retrieves the details of a single product.
- **Auth Required:** No.
- **Returns:** A product object, along with an `images` array (fetched from the `product_images` table) containing all images for that product's carousel, ordered by display precedence.

---

## 2. Cart API (`/api/cart`)

### `GET /api/cart`
- **Description:** Retrieves all items currently in the user's cart (or guest's session cart).
- **Auth Required:** No (Uses user ID from Clerk if logged in, otherwise uses `X-Cart-Session` header UUID).
- **Returns:** An array of cart items, joined with product details (name, price, image).

### `POST /api/cart`
- **Description:** Adds a product to the cart. If the exact product is already in the cart, it increments the quantity instead of duplicating rows.
- **Auth Required:** No (Supports Guest UUID).
- **Request Body:**
  ```json
  {
    "product_id": 5,
    "quantity": 2
  }
  ```
- **Returns:** The newly created (or updated) cart item object.

### `POST /api/cart/merge`
- **Description:** Executed immediately when a guest user signs in. It transfers items from the temporary "session" cart into the authenticated "user_id" cart. If a product overlaps, quantities are added together.
- **Auth Required:** Yes (Must be signed in to specify destination).
- **Request Body:**
  ```json
  {
    "session_id": "crypto-uuid-from-localstorage"
  }
  ```

### `PUT /api/cart/:id`
- **Description:** Updates the quantity of a specific cart item row. Note: `:id` refers to the `cart_items` table ID, not the product ID.
- **Auth Required:** No (Supports Guest UUID).
- **Request Body:** `{ "quantity": 3 }`

### `DELETE /api/cart/:id`
- **Description:** Removes a specific item from the cart. Note: `:id` refers to the `cart_items` table ID, not the product ID.
- **Auth Required:** No (Supports Guest UUID).

---

## 3. Orders API (`/api/orders`)

### `POST /api/orders`
- **Description:** Places a new order (Checkout Flow). This uses an SQL Transaction to carefully calculate the total cart value, insert the order, transfer items from `cart_items` to `order_items`, clear the cart, and send a confirmation email. If any step fails, the entire database transaction rolls back.
- **Auth Required:** Yes.
- **Request Body:**
  ```json
  {
    "shipping_address": "123 Main St, Springfield",
    "customer_email": "hello@example.com"
  }
  ```
- **Returns:** A success message along with the created Order instance.

### `GET /api/orders`
- **Description:** Retrieves all past orders made by the currently signed-in user, sorted newest first.
- **Auth Required:** Yes.
- **Returns:** An array of order objects. Each order object includes a nested `items` array representing the purchased products.

### `GET /api/orders/:id`
- **Description:** Retrieves the details of a specific order, including its items. Used heavily for the Order Confirmation page.
- **Auth Required:** Yes (Validates that the given order actually belongs to the requesting user ID).
- **Returns:** A single order object containing a nested `items` array.

---

## 4. Wishlist API (`/api/wishlist`)

### `GET /api/wishlist`
- **Description:** Retrieves all products the authenticated user has wishlisted.
- **Auth Required:** Yes.
- **Returns:** An array of wishlist items joined with their respective product details (name, price, stock, ratings).

### `POST /api/wishlist`
- **Description:** Adds a product to the user's wishlist. Safe to call multiple times for the same product, as the database enforces a `UNIQUE(user_id, product_id)` constraint via SQL `ON CONFLICT DO NOTHING`.
- **Auth Required:** Yes.
- **Request Body:** `{ "product_id": 10 }`

### `GET /api/wishlist/check/:productId`
- **Description:** A quick status check used by frontend components (like the heart icon on Product Cards) to determine if the specific product is already wishlisted by the current user.
- **Auth Required:** Yes.
- **Returns:** `{ "wishlisted": true }` or `{ "wishlisted": false }`

### `DELETE /api/wishlist/:productId`
- **Description:** Removes a specific product from the user's wishlist. Uses the standard `productId` to locate the row instead of the wishlist row ID, making it easier for the frontend.
- **Auth Required:** Yes.
