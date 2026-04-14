-- ============================================================
-- seed.sql — Sample Product Data (Amazon-style)
-- ============================================================
-- Run AFTER schema.sql: psql -d ecommerce -f seed.sql
-- ============================================================

-- Clear existing data
DELETE FROM wishlist_items;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM cart_items;
DELETE FROM product_images;
DELETE FROM products;

-- Reset sequences
ALTER SEQUENCE products_id_seq RESTART WITH 1;
ALTER SEQUENCE product_images_id_seq RESTART WITH 1;

-- ============================================================
-- INSERT PRODUCTS
-- ============================================================
INSERT INTO products (name, description, price, image_url, category, stock, rating, review_count) VALUES

-- ===== Electronics =====
('boAt Rockerz 450 Bluetooth Headphones',
 'boAt Rockerz 450 wireless headphones with 40mm drivers, 300 mAh battery providing up to 15 hours of playback. Padded ear cushions for comfort. Dual connectivity modes — Bluetooth and AUX. Lightweight design at just 224g.',
 1499.00,
 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
 'Electronics', 25, 4.1, 48562),

('Samsung Galaxy M14 5G (6GB RAM, 128GB)',
 'Samsung Galaxy M14 5G smartphone with 6.6 inch FHD+ display, 50MP triple camera, 6000mAh battery, Exynos 1330 Octa Core processor. Android 13 with One UI 5.1. Dual SIM 5G connectivity.',
 10999.00,
 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
 'Electronics', 15, 4.0, 23891),

('boAt Airdopes 141 TWS Earbuds',
 'boAt Airdopes 141 truly wireless earbuds with 42H total playtime, 8mm drivers, ENx technology for clear calls, IPX4 water resistance, IWP technology, and Type-C fast charging. Bluetooth v5.1.',
 1299.00,
 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400',
 'Electronics', 50, 3.9, 156243),

('Ambrane 10000mAh Power Bank',
 'Ambrane 10000mAh Li-Polymer power bank with 20W fast charging. Dual output ports (USB-A + Type-C). Slim profile at just 12.5mm thickness. LED battery indicator. Multi-layer protection.',
 799.00,
 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400',
 'Electronics', 40, 4.2, 34521),

('HP 15s Laptop (12th Gen Intel i5)',
 'HP 15s laptop with 12th Gen Intel Core i5-1235U, 8GB DDR4 RAM, 512GB SSD, 15.6 inch FHD anti-glare display. Intel Iris Xe Graphics. Windows 11 Home. Thin and light at 1.69 kg.',
 52990.00,
 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
 'Electronics', 8, 4.3, 8923),

-- ===== Books =====
('Atomic Habits by James Clear',
 'The #1 bestselling book on building good habits and breaking bad ones. Atomic Habits offers a proven framework for improving every day. Learn how tiny changes in behavior can lead to remarkable results.',
 399.00,
 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
 'Books', 100, 4.6, 187432),

('The Psychology of Money by Morgan Housel',
 'Timeless lessons on wealth, greed, and happiness. Morgan Housel shares 19 short stories exploring the strange ways people think about money. A must-read for understanding personal finance.',
 350.00,
 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
 'Books', 80, 4.5, 98234),

('Clean Code by Robert C. Martin',
 'A handbook of agile software craftsmanship. Learn to write code that is easy to read, understand, and maintain. Covers meaningful names, functions, comments, formatting, and error handling.',
 550.00,
 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400',
 'Books', 30, 4.4, 12567),

-- ===== Clothing =====
('Allen Solly Men Slim Fit Shirt',
 'Allen Solly men''s slim fit formal shirt in solid pattern. 100% premium cotton fabric. Regular collar with full sleeves. Machine washable. Perfect for office and formal occasions.',
 1199.00,
 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
 'Clothing', 60, 3.9, 15678),

('Levi''s Men 511 Slim Fit Jeans',
 'Levi''s 511 slim fit jeans in classic dark blue wash. Sits below waist with a slim fit from hip to ankle. Stretch denim for comfort. 5-pocket styling. Machine washable.',
 2499.00,
 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
 'Clothing', 45, 4.2, 24532),

('Nike Dri-FIT Cotton T-Shirt',
 'Nike men''s Dri-FIT cotton blend t-shirt. Sweat-wicking technology keeps you dry. Standard fit for a relaxed feel. Ribbed crew neck collar. Iconic Nike Swoosh at left chest.',
 1495.00,
 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
 'Clothing', 75, 4.3, 32190),

('Puma Unisex Sneakers',
 'Puma Unisex-Adult casual sneakers with synthetic upper and rubber outsole. Lace-up closure for secure fit. SoftFoam+ sockliner for step-in comfort. Available in multiple colors.',
 2999.00,
 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
 'Clothing', 30, 4.1, 19876),

-- ===== Home & Kitchen =====
('Milton Thermosteel Flask 1 Litre',
 'Milton Thermosteel Duo DLX 1000 vacuum insulated flask. Keeps beverages hot for 24 hours and cold for 24 hours. 18/8 stainless steel construction. BPA-free. Leak-proof lid.',
 799.00,
 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
 'Home', 55, 4.3, 67890),

('Philips LED Desk Lamp',
 'Philips Dossel LED desk lamp with 4 brightness levels and 3 color modes. Flexible gooseneck design. Touch controls. USB charging port. Eye-comfort technology reduces flicker.',
 1899.00,
 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400',
 'Home', 35, 4.4, 5678),

('Prestige Iris 750W Mixer Grinder',
 'Prestige Iris 750 Watt mixer grinder with 3 stainless steel jars. Powerful motor for efficient grinding. Super efficient blades. 3-speed control with pulse function. ISI certified.',
 2999.00,
 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400',
 'Home', 20, 4.0, 45123),

('Amazon Basics Bamboo Cutting Board Set',
 'Amazon Basics bamboo cutting board set of 3. Eco-friendly and sustainable bamboo construction. Knife-friendly surface. Built-in juice groove. Easy to clean — hand wash recommended.',
 899.00,
 'https://images.unsplash.com/photo-1594226801341-41427b4e5c22?w=400',
 'Home', 40, 4.2, 23456);

-- ============================================================
-- INSERT PRODUCT IMAGES (for carousel)
-- ============================================================
-- Each product gets 3-4 images for the detail page carousel

-- Product 1: boAt Headphones
INSERT INTO product_images (product_id, image_url, display_order) VALUES
(1, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', 1),
(1, 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600', 2),
(1, 'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=600', 3);

-- Product 2: Samsung Phone
INSERT INTO product_images (product_id, image_url, display_order) VALUES
(2, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600', 1),
(2, 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600', 2),
(2, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600', 3);

-- Product 3: boAt Earbuds
INSERT INTO product_images (product_id, image_url, display_order) VALUES
(3, 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=600', 1),
(3, 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600', 2),
(3, 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600', 3);

-- Product 4: Power Bank
INSERT INTO product_images (product_id, image_url, display_order) VALUES
(4, 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600', 1),
(4, 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600', 2),
(4, 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600', 3);

-- Product 5: HP Laptop
INSERT INTO product_images (product_id, image_url, display_order) VALUES
(5, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600', 1),
(5, 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600', 2),
(5, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600', 3);

-- Product 6: Atomic Habits
INSERT INTO product_images (product_id, image_url, display_order) VALUES
(6, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600', 1),
(6, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600', 2),
(6, 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600', 3);

-- Product 7: Psychology of Money
INSERT INTO product_images (product_id, image_url, display_order) VALUES
(7, 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600', 1),
(7, 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600', 2),
(7, 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600', 3);

-- Product 8: Clean Code
INSERT INTO product_images (product_id, image_url, display_order) VALUES
(8, 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=600', 1),
(8, 'https://images.unsplash.com/photo-1461360228754-6e81c478b882?w=600', 2),
(8, 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=600', 3);

-- Product 9: Allen Solly Shirt
INSERT INTO product_images (product_id, image_url, display_order) VALUES
(9, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600', 1),
(9, 'https://images.unsplash.com/photo-1598033129183-c4f50c736c10?w=600', 2),
(9, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600', 3);

-- Product 10: Levi Jeans
INSERT INTO product_images (product_id, image_url, display_order) VALUES
(10, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600', 1),
(10, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600', 2),
(10, 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=600', 3);

-- Product 11: Nike T-Shirt
INSERT INTO product_images (product_id, image_url, display_order) VALUES
(11, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', 1),
(11, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600', 2),
(11, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600', 3);

-- Product 12: Puma Sneakers
INSERT INTO product_images (product_id, image_url, display_order) VALUES
(12, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 1),
(12, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600', 2),
(12, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600', 3);

-- Product 13: Milton Flask
INSERT INTO product_images (product_id, image_url, display_order) VALUES
(13, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600', 1),
(13, 'https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?w=600', 2),
(13, 'https://images.unsplash.com/photo-1610824352934-c10d87b700cc?w=600', 3);

-- Product 14: Philips Desk Lamp
INSERT INTO product_images (product_id, image_url, display_order) VALUES
(14, 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600', 1),
(14, 'https://images.unsplash.com/photo-1534105615256-13940a56ff44?w=600', 2),
(14, 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600', 3);

-- Product 15: Mixer Grinder
INSERT INTO product_images (product_id, image_url, display_order) VALUES
(15, 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600', 1),
(15, 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600', 2),
(15, 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600', 3);

-- Product 16: Cutting Board
INSERT INTO product_images (product_id, image_url, display_order) VALUES
(16, 'https://images.unsplash.com/photo-1594226801341-41427b4e5c22?w=600', 1),
(16, 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600', 2),
(16, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600', 3);
