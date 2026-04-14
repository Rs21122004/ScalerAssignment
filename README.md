# Amazon Clone E-Commerce Platform

Fullstack SDE intern assignment: a functional Amazon-style e-commerce web application with product browsing, cart management, checkout, order placement, and order history.

## Tech Stack

- Frontend: React.js, Vite, React Router, Axios
- Backend: Node.js, Express.js
- Database: PostgreSQL
- Styling: Plain CSS with Amazon-inspired layout, colors, cards, filters, product detail page, cart drawer, and responsive rules

## Features

### Core Features

- Product listing page with Amazon-like grid cards
- Product image, name, price, delivery badge, rating UI, and Add to Cart button
- Search products by name
- Filter products by category
- Extra sidebar filters for price, rating, and Prime-style delivery
- Sort products by featured, price, rating, and newest
- Product detail page with image gallery / carousel thumbnails
- Product description, specifications, offers, price, and stock status
- Add to Cart and Buy Now buttons
- Shopping cart page with quantity update and remove item actions
- Cart subtotal and total summary
- Checkout page with shipping address form
- Order summary review before placing order
- Order confirmation page displaying the order ID
- Order history page with past orders and ordered items

### Amazon-Like UX Additions

- Amazon-style dark navbar and secondary nav
- Functional navbar search with category dropdown
- Mobile search row
- Location and Account popovers
- Moving homepage hero carousel
- Homepage product/category visuals
- Right-side "Added to Cart" drawer after adding an item
- Customer reviews section
- Related product recommendations
- Responsive layout for desktop, tablet, and mobile

## Project Structure

```text
.
├── backend
│   ├── db.js
│   ├── routes
│   │   ├── cart.js
│   │   ├── orders.js
│   │   └── products.js
│   ├── schema.sql
│   ├── seed.sql
│   └── server.js
└── frontend
    ├── src
    │   ├── components
    │   ├── data
    │   ├── pages
    │   ├── api.js
    │   └── App.jsx
    └── vite.config.js
```

## Database Design

The database uses five main tables:

### products

Stores product catalog data.

Important columns:

- `id`
- `name`
- `description`
- `price`
- `image_url`
- `category`
- `stock`
- `rating`
- `review_count`

### product_images

Stores multiple images for each product detail carousel.

Relationship:

- `product_images.product_id` references `products.id`

### cart_items

Stores the current default user's cart.

Relationship:

- `cart_items.product_id` references `products.id`

### orders

Stores placed orders.

Important columns:

- `id`
- `total_amount`
- `shipping_address`
- `status`
- `created_at`

### order_items

Stores products that belong to a placed order.

Relationships:

- `order_items.order_id` references `orders.id`
- `order_items.product_id` references `products.id`

## Assumptions

- No login is required, as instructed in the assignment.
- The app assumes one default logged-in user.
- Cart data is stored globally in the `cart_items` table for that default user.
- Some Amazon-like UI details, such as review snippets, delivery promises, and recommendations, are presentation data in the frontend.
- Payments are mocked in the UI. Order placement is handled by the backend.

## Local Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <repository-folder>
```

### 2. Create PostgreSQL Database

```bash
createdb ecommerce
```

### 3. Create Tables and Seed Products

```bash
cd backend
psql -d ecommerce -f schema.sql
psql -d ecommerce -f seed.sql
```

### 4. Configure Backend Environment

Copy the example file:

```bash
cp backend/.env.example backend/.env
```

For local PostgreSQL, update these values if needed:

```text
PGUSER=rs
PGHOST=localhost
PGDATABASE=ecommerce
PGPASSWORD=
PGPORT=5432
```

### 5. Start Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs at:

```text
http://localhost:5001
```

### 6. Configure Frontend Environment

Copy the example file:

```bash
cp frontend/.env.example frontend/.env
```

Default local value:

```text
VITE_API_BASE_URL=http://localhost:5001
```

### 7. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

## Useful Commands

Frontend:

```bash
cd frontend
npm run dev
npm run build
npm run lint
```

Backend:

```bash
cd backend
npm run dev
npm start
```

## API Routes

### Products

- `GET /api/products`
- `GET /api/products?search=headphones`
- `GET /api/products?category=Electronics`
- `GET /api/products/:id`

### Cart

- `GET /api/cart`
- `POST /api/cart`
- `PUT /api/cart/:id`
- `DELETE /api/cart/:id`

### Orders

- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:id`

## Deployment Notes

Recommended deployment:

- Frontend: Vercel or Netlify
- Backend: Render or Railway
- Database: Railway PostgreSQL, Render PostgreSQL, Neon, or Supabase

Set these environment variables in production:

Frontend:

```text
VITE_API_BASE_URL=https://your-backend-url.com
```

Backend:

```text
PORT=5001
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DB_SSL=true
```

Run `schema.sql` and `seed.sql` on the production database before testing the deployed app.

## AI Tools Usage

AI assistance was used during development for implementation guidance, refactoring, UI planning, and code comments. Every submitted file should be reviewed and understood before evaluation, especially:

- React routing and state flow in `App.jsx`
- Product filtering logic in `ProductsPage.jsx`
- Product detail layout in `ProductDetailPage.jsx`
- Cart and order transaction logic in backend routes
- PostgreSQL schema relationships

## Evaluation Checklist

- Product listing works
- Search works
- Category filter works
- Product detail page works
- Image gallery works
- Add to Cart works
- Cart drawer opens after adding item
- Cart quantity update works
- Cart item remove works
- Checkout form works
- Place order works
- Order confirmation page shows order ID
- Order history shows placed orders
- Frontend build passes
- Frontend lint passes
