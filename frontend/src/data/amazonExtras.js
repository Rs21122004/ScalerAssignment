// ============================================================
// amazonExtras.js — Reusable Amazon-Style UI Data
// ============================================================
// This file keeps "presentation data" in one place.
// Presentation data means information that makes the UI feel
// more realistic, but does not need to live in the database yet.
//
// Examples:
//   - Review snippets shown on product detail pages
//   - Technical specifications for each product category
//   - Recommendation rows used around product/cart experiences
//   - Delivery promise text used in cards and buy boxes
//
// Keeping this here prevents pages from becoming huge and keeps
// the app easier to explain during a project review.
// ============================================================

// Category-level specs are used when a product does not have its
// own detailed specs in the database. The UI picks a set based on
// product.category, which keeps the detail page useful for all items.
export const categorySpecs = {
  Electronics: [
    ["Warranty", "1 year manufacturer warranty"],
    ["Connectivity", "Bluetooth / USB depending on product"],
    ["Delivery", "FREE delivery available"],
    ["Return Policy", "7 days replacement"],
  ],
  Books: [
    ["Format", "Paperback"],
    ["Language", "English"],
    ["Publisher", "Popular edition"],
    ["Return Policy", "10 days replacement"],
  ],
  Clothing: [
    ["Fit", "Regular / Slim fit depending on style"],
    ["Material", "Comfort fabric"],
    ["Care", "Machine washable"],
    ["Return Policy", "10 days exchange"],
  ],
  Home: [
    ["Material", "Durable home-grade material"],
    ["Usage", "Daily home and kitchen use"],
    ["Care", "Easy to clean"],
    ["Return Policy", "7 days replacement"],
  ],
};

// Reviews are static for now, but shaped like real review data.
// Later, this exact structure can be replaced with a backend table.
export const sampleReviews = [
  {
    name: "Aarav M.",
    rating: 5,
    title: "Great value for the price",
    body: "The product quality feels reliable, delivery was quick, and the packaging was neat.",
    date: "Reviewed in India on 8 April 2026",
  },
  {
    name: "Priya S.",
    rating: 4,
    title: "Works exactly as expected",
    body: "Good everyday product. I liked the finish and the order arrived earlier than promised.",
    date: "Reviewed in India on 2 April 2026",
  },
  {
    name: "Rohan K.",
    rating: 4,
    title: "Useful and easy to recommend",
    body: "The listing information was clear, and the actual product matched the images well.",
    date: "Reviewed in India on 29 March 2026",
  },
];

// Recommendation products are used in drawer/detail/home rows.
// They intentionally use the same data shape as products from API
// where possible: id, name, price, image_url, and category.
export const recommendationProducts = [
  {
    id: 1,
    name: "boAt Rockerz 450 Bluetooth Headphones",
    price: 1499,
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop",
    category: "Electronics",
  },
  {
    id: 2,
    name: "Samsung Galaxy M14 5G",
    price: 10999,
    image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop",
    category: "Electronics",
  },
  {
    id: 6,
    name: "Atomic Habits by James Clear",
    price: 399,
    image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop",
    category: "Books",
  },
  {
    id: 12,
    name: "Puma Unisex Sneakers",
    price: 2999,
    image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop",
    category: "Clothing",
  },
];

// This helper produces consistent star text.
// Example: getStars(4) returns "★★★★☆".
export const getStars = (rating) => {
  const fullStars = Math.round(Number(rating) || 4);
  return "★".repeat(fullStars) + "☆".repeat(5 - fullStars);
};

// This helper formats prices in Indian Rupees exactly once.
// Pages call this instead of repeating toLocaleString everywhere.
export const formatPrice = (price) => {
  return `₹${Number(price).toLocaleString("en-IN")}`;
};

// This helper gives each product a stable Prime-style delivery line.
// The product id keeps the text varied without needing extra DB fields.
export const getDeliveryPromise = (productId) => {
  const deliveryOptions = [
    "FREE delivery Tomorrow",
    "FREE delivery by Thursday",
    "Prime delivery available",
    "Fastest delivery Today",
  ];

  return deliveryOptions[Number(productId) % deliveryOptions.length];
};
