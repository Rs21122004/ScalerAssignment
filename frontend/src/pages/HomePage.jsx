import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatPrice, recommendationProducts } from "../data/amazonExtras";

const categories = [
  {
    name: "Electronics",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop",
    count: "2,400+",
  },
  {
    name: "Clothing",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&auto=format&fit=crop",
    count: "5,800+",
  },
  {
    name: "Books",
    image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&auto=format&fit=crop",
    count: "12,000+",
  },
  {
    name: "Home",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&auto=format&fit=crop",
    count: "3,100+",
  },
  {
    name: "Gaming",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop",
    count: "900+",
  },
  {
    name: "Beauty",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop",
    count: "1,500+",
  },
];

const miniSections = [
  {
    title: "Shop Electronics",
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&auto=format&fit=crop",
    ],
    link: "Electronics",
  },
  {
    title: "Fashion Picks",
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&auto=format&fit=crop",
    ],
    link: "Clothing",
  },
  {
    title: "Home & Kitchen",
    images: [
      "https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400&auto=format&fit=crop",
    ],
    link: "Home",
  },
  {
    title: "Books & More",
    images: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=400&auto=format&fit=crop",
    ],
    link: "Books",
  },
];

const trendingSections = [
  {
    title: "Bestsellers in Electronics",
    items: [
      {
        image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300&auto=format&fit=crop",
        name: "USB-C 65W Charger",
        price: "₹799",
      },
      {
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&auto=format&fit=crop",
        name: "Mechanical Keyboard TKL",
        price: "₹2,499",
      },
      {
        image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300&auto=format&fit=crop",
        name: "Wireless Mouse Silent",
        price: "₹649",
      },
      {
        image: "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=300&auto=format&fit=crop",
        name: "Webcam 1080p HD",
        price: "₹1,299",
      },
    ],
  },
  {
    title: "Top Picks in Books",
    items: [
      {
        image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&auto=format&fit=crop",
        name: "The Psychology of Money",
        price: "₹349",
      },
      {
        image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=300&auto=format&fit=crop",
        name: "Deep Work - Cal Newport",
        price: "₹399",
      },
      {
        image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300&auto=format&fit=crop",
        name: "Zero to One - Peter Thiel",
        price: "₹299",
      },
      {
        image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&auto=format&fit=crop",
        name: "Ikigai - Francesc Miralles",
        price: "₹249",
      },
    ],
  },
];

const todayDeals = [
  {
    image: "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=500&auto=format&fit=crop",
    name: "Wireless Earbuds Pro Max",
    price: "₹1,999",
    original: "₹2,999",
    disc: 32,
    rating: "4.2",
    reviews: "4,821",
  },
  {
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop",
    name: "Laptop Stand Adjustable Aluminum",
    price: "₹899",
    original: "₹1,099",
    disc: 18,
    rating: "4.8",
    reviews: "2,103",
  },
  {
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop",
    name: "Atomic Habits - James Clear",
    price: "₹299",
    original: "₹499",
    disc: 40,
    rating: "4.9",
    reviews: "12,440",
  },
  {
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop",
    name: "Over-Ear Headphones Noise Cancel",
    price: "₹3,749",
    original: "₹4,999",
    disc: 25,
    rating: "4.3",
    reviews: "3,290",
  },
  {
    image: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=500&auto=format&fit=crop",
    name: "Non-Stick Cookware Set 5-piece",
    price: "₹1,274",
    original: "₹1,499",
    disc: 15,
    rating: "4.1",
    reviews: "1,876",
  },
];

// These slides create the Amazon-style moving banner on the landing page.
// Each slide has a background image, short text, and an optional category link.
const heroSlides = [
  {
    title: "Great Indian Deals",
    highlight: "Live Now",
    subtitle: "Top picks across electronics, fashion, books, and home essentials.",
    image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1600&auto=format&fit=crop",
    category: "",
  },
  {
    title: "Upgrade Your Tech",
    highlight: "For Less",
    subtitle: "Headphones, mobiles, laptop accessories, and everyday gadgets.",
    image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1600&auto=format&fit=crop",
    category: "Electronics",
  },
  {
    title: "Refresh Your Home",
    highlight: "Today",
    subtitle: "Kitchen tools, lighting, storage, and home comfort finds.",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1600&auto=format&fit=crop",
    category: "Home",
  },
];

function HomePage() {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-advance the hero every few seconds so the landing page feels
  // like Amazon's moving promotional banner.
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  // Move to the previous or next slide when the user clicks arrow buttons.
  const moveSlide = (direction) => {
    setActiveSlide((current) => {
      const next = current + direction;
      if (next < 0) return heroSlides.length - 1;
      return next % heroSlides.length;
    });
  };

  // Clicking a slide CTA can either open all products or a category.
  const openSlide = (slide) => {
    const query = slide.category ? `?category=${slide.category}` : "";
    navigate(`/products${query}`);
  };

  return (
    <div style={{ background: "#EAEDED", minHeight: "100vh" }}>

      {/* ── MOVING HERO BANNER ── */}
      <div className="hero-carousel">
        <div
          className="hero-carousel-track"
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
        >
          {heroSlides.map((slide) => (
            <div
              key={slide.title}
              className="hero-slide"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="hero-slide-overlay" />
              <div className="hero-text">
                <h1>{slide.title} <span>{slide.highlight}</span></h1>
                <p>{slide.subtitle}</p>
                <button className="hero-btn" onClick={() => openSlide(slide)}>
                  Shop Now →
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className="hero-arrow hero-arrow-left" onClick={() => moveSlide(-1)}>
          ‹
        </button>
        <button className="hero-arrow hero-arrow-right" onClick={() => moveSlide(1)}>
          ›
        </button>

        <div className="hero-dots">
          {heroSlides.map((slide, i) => (
            <button
              key={slide.title}
              className={`hero-dot${i === activeSlide ? " active" : ""}`}
              onClick={() => setActiveSlide(i)}
            />
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="home-content">

        {/* Mini category cards */}
        <div className="home-mini-grid">
          {miniSections.map((sec) => (
            <div
              key={sec.title}
              className="home-mini-card"
              onClick={() => navigate(`/products?category=${sec.link}`)}
            >
              <h3>{sec.title}</h3>
              <div className="home-mini-imgs">
                {sec.images.map((image, i) => (
                  <div key={image} className="home-mini-img">
                    <img src={image} alt={`${sec.title} ${i + 1}`} />
                  </div>
                ))}
              </div>
              <span className="home-mini-link">See all deals →</span>
            </div>
          ))}
        </div>

        {/* Today's Deals — static showcase */}
        <h2 className="home-section-title">Today's Deals</h2>
        <div className="home-deals-row">
          {todayDeals.map((d, i) => (
            <div key={i} className="home-deal-card" onClick={() => navigate("/products")}>
              <div className="home-deal-img">
                <img src={d.image} alt={d.name} />
              </div>
              <div className="home-deal-info">
                <span className="home-deal-badge">-{d.disc}%</span>
                <p className="home-deal-name">{d.name}</p>
                <div className="home-deal-stars">
                  {"★".repeat(Math.floor(parseFloat(d.rating)))}{"☆".repeat(5 - Math.floor(parseFloat(d.rating)))}
                  <span className="home-deal-reviews">{d.reviews}</span>
                </div>
                <div>
                  <span className="home-deal-price">{d.price}</span>
                  <span className="home-deal-original">{d.original}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Free delivery banner */}
        <div className="home-promo-banner">
          <div>
            <h2>Free Delivery on your first order</h2>
            <p>Sign up today and get free delivery on all eligible orders above ₹499.</p>
          </div>
          <button className="hero-btn" onClick={() => navigate("/products")}>
            Start Shopping →
          </button>
        </div>

        {/* Amazon homepages usually include horizontal product shelves. */}
        <h2 className="home-section-title">Inspired by your browsing history</h2>
        <div className="home-product-shelf">
          {recommendationProducts.map((product) => (
            <button
              key={product.id}
              className="home-shelf-item"
              onClick={() => navigate(`/products/${product.id}`)}
            >
              <img src={product.image_url} alt={product.name} />
              <span>{product.name}</span>
              <strong>{formatPrice(product.price)}</strong>
            </button>
          ))}
        </div>

        {/* Shop by Category */}
        <h2 className="home-section-title">Shop by Category</h2>
        <div className="home-cats-grid">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="home-cat-card"
              onClick={() => navigate(`/products?category=${cat.name}`)}
            >
              <div className="home-cat-img">
                <img src={cat.image} alt={cat.name} />
              </div>
              <div className="home-cat-name">{cat.name}</div>
              <div className="home-cat-count">{cat.count} products</div>
            </div>
          ))}
        </div>

        {/* Trending sections */}
        <div className="home-trending-grid">
          {trendingSections.map((sec) => (
            <div key={sec.title} className="home-trending-card">
              <h3>{sec.title}</h3>
              <div className="home-trending-items">
                {sec.items.map((item, i) => (
                  <div key={i} className="home-trending-item" onClick={() => navigate("/products")}>
                    <div className="home-trending-img">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div>
                      <div className="home-trending-name">{item.name}</div>
                      <div className="home-trending-price">{item.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ── FOOTER ── */}
      <footer className="home-footer">
        <div className="home-footer-links">
          {["About Amazon","Careers","Press","Help","Sell on Amazon"].map(l => (
            <span key={l}>{l}</span>
          ))}
        </div>
        <p>Amazon.in</p>
        <p>© 2026 Amazon Clone Project</p>
      </footer>
    </div>
  );
}

export default HomePage;
