-- ============================================================
-- schema.sql — Database Table Definitions
-- ============================================================
-- Run this ONCE when setting up the project.
-- Command: psql -d ecommerce -f schema.sql
-- ============================================================

-- ============================
-- TABLE 1: products
-- ============================
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    category VARCHAR(100),
    stock INTEGER DEFAULT 0,
    rating DECIMAL(2, 1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================
-- TABLE 2: product_images
-- ============================
-- Stores multiple images per product for the image carousel.
CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

-- ============================
-- TABLE 3: cart_items
-- ============================
-- user_id is set when a signed-in user adds to cart.
-- session_id is set for guest users (UUID from localStorage).
-- At checkout, guests must sign in — their session cart is merged.
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    user_id VARCHAR(255),
    session_id VARCHAR(255),
    added_at TIMESTAMP DEFAULT NOW()
);

-- ============================
-- TABLE 4: orders
-- ============================
-- user_id is required (checkout requires authentication).
-- customer_email stores the email for the confirmation notification.
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    total_amount DECIMAL(10, 2) NOT NULL,
    shipping_address TEXT,
    status VARCHAR(50) DEFAULT 'placed',
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================
-- TABLE 5: order_items
-- ============================
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- ============================
-- TABLE 6: wishlist_items
-- ============================
-- Each user can wishlist a product exactly once (UNIQUE constraint).
CREATE TABLE IF NOT EXISTS wishlist_items (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- ============================
-- MIGRATION: Add columns to existing tables
-- ============================
-- Safe to re-run: IF NOT EXISTS / IF NOT prevents errors.
DO $$
BEGIN
    -- Add user_id to cart_items if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'cart_items' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE cart_items ADD COLUMN user_id VARCHAR(255);
    END IF;

    -- Add session_id to cart_items if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'cart_items' AND column_name = 'session_id'
    ) THEN
        ALTER TABLE cart_items ADD COLUMN session_id VARCHAR(255);
    END IF;

    -- Add user_id to orders if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE orders ADD COLUMN user_id VARCHAR(255);
    END IF;

    -- Add customer_email to orders if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'customer_email'
    ) THEN
        ALTER TABLE orders ADD COLUMN customer_email VARCHAR(255);
    END IF;

    -- Add rating to products if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'rating'
    ) THEN
        ALTER TABLE products ADD COLUMN rating DECIMAL(2, 1) DEFAULT 0;
    END IF;

    -- Add review_count to products if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'review_count'
    ) THEN
        ALTER TABLE products ADD COLUMN review_count INTEGER DEFAULT 0;
    END IF;
END $$;

