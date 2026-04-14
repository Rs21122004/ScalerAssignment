# 📦 Amazon Clone — Fullstack SDE Portfolio Project

[![Fullstack Project](https://img.shields.io/badge/Stack-Fullstack-brightgreen.svg)]()
[![React](https://img.shields.io/badge/Frontend-React-61DAFB.svg)]()
[![Node.js](https://img.shields.io/badge/Backend-Node-339933.svg)]()
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791.svg)]()
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF.svg)]()

A high-performance, visually stunning e-commerce platform that replicates the Amazon shopping experience. Built as a part of an SDE Intern assessment, this project goes beyond basic CRUD functionality by implementing advanced features like **Clerk Authentication**, **Asynchronous Cart Merging**, and **Transactional Order Management**.

---

## 🚀 Live Demo & Repository
- **Frontend**: [Deploy Link Here]
- **Backend API**: [API Link Here]
- **GitHub**: [https://github.com/Rs21122004/ScalerAssignment](https://github.com/Rs21122004/ScalerAssignment)

---

## ✨ Key Features

### 🛒 The Shopping Experience (Must-Haves)
- **Dynamic Product Grid**: Amazon-style product cards with price logic, delivery badges, and rating stars.
- **Advanced Search & Filtering**: Instant search by name and multi-category filtering.
- **Seamless Cart Management**: Add/Remove items, update quantities, and live subtotal calculations.
- **Streamlined Checkout**: A structured flow including address collection and order review.
- **Product Detail View**: High-fidelity product pages featuring image galleries and detailed specifications.

### 🔥 Advanced Engineering (Bonus Features)
- **Clerk Authentication**: Robust user management (Sign In/Up) powered by Clerk SDK.
- **Smart Cart Merging**: Proprietary logic that automatically merges guest items into a user's account upon signing in.
- **Transactional Consistency**: PostgreSQL transactions ensure orders are only created if inventory and cart clearing succeed.
- **Wishlist System**: Persistent user-scoped wishlist for saved-for-later items.
- **Order History**: A dedicated dashboard for tracking past purchases and confirmation statuses.
- **Responsive Design**: Fully optimized for Desktop, Tablet, and Mobile devices.

---

## 🛠️ Technical Architecture

### Tech Stack
- **Frontend**: React.js 18 (Vite), React Router 6, Axios, Clerk React SDK.
- **Backend**: Node.js, Express.js.
- **Database**: PostgreSQL (Relational schema designed for scalability).
- **Communication**: RESTful API with JSON Bearer Token authentication.

### Database Schema
The database is modeled for high consistency:
- `products`: Product catalog with categories, ratings, and stock.
- `cart_items`: Handles both authenticated `user_id` and anonymous `session_id`.
- `orders` & `order_items`: Permanent record of transactions.
- `wishlist`: User-scoped saved items.

---

## 💡 Implementation Decisions (For Interviewers)

### 1. The "Shadow Cart" Strategy
To replicate Amazon's UX, I implemented a custom middleware that tracks guest sessions via a UUID. Upon sign-in, the backend detects the transition and triggers a **Cart Merge Operation**, ensuring users don't lose their guest items after logging in.

### 2. Atomic Order Placement
Checkout is processed inside a **PostgreSQL Transaction Block**. This prevents "phantom orders" by ensuring that order creation, item movement, and cart clearing all happen as a single atomic unit.

### 3. Verification & Reliability
My `requireAuth` middleware includes a fallback diagnostic layer using `getAuth(req)` to provide detailed reasons for any token verification failures (e.g., expired tokens or cross-origin issues).

---

## ⚙️ Local Setup

### 1. Prerequisites
- Node.js (v16+)
- PostgreSQL installed and running

### 2. Database Initialization
```bash
cd backend
# Create your database in psql: 'CREATE DATABASE ecommerce;'
node runSeed.js  # This will automatically create tables and seed 16+ products
```

### 3. Environment Configuration
Create a `.env` file in both `/frontend` and `/backend` based on the provided `.env.example` files.

**Backend `.env`:**
```text
PORT=5001
CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret
DATABASE_URL=postgres://USER:PASS@localhost:5432/ecommerce
```

### 4. Run the Application
```bash
# In /backend
npm install && node server.js

# In /frontend
npm install && npm run dev
```

---

## 🖼️ Screenshots
*(Add your own screenshots here to showcase the stunning UI!)*

---

## 👤 Author
**Rishi Sharma**  
[GitHub Profile](https://github.com/Rs21122004) | [Portfolio] | [LinkedIn]

---
*Developed for the Scaler SDE Intern Fullstack Assignment.*
