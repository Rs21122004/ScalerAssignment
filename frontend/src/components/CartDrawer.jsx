// ============================================================
// CartDrawer.jsx — Amazon-Style Add-To-Cart Drawer
// ============================================================
// Amazon does not only show a tiny toast after adding an item.
// It gives the user a clear confirmation panel with next actions.
//
// This component creates that same feeling:
//   1. It slides in from the right side.
//   2. It confirms which product was added.
//   3. It shows quick cart totals and action buttons.
//   4. It suggests related products so the page feels richer.
//
// The drawer is controlled by App.jsx because multiple pages can
// add items to the cart. That makes App.jsx the best parent for it.
// ============================================================

import { useNavigate } from "react-router-dom";
import { formatPrice, recommendationProducts } from "../data/amazonExtras";

function CartDrawer({ isOpen, addedProduct, cartCount, onClose }) {
  // navigate lets buttons move the user to cart/checkout/product pages.
  const navigate = useNavigate();

  // If the drawer is closed and no product was added yet, keep the
  // markup minimal. The overlay still gets a class when open.
  const productPrice = addedProduct ? Number(addedProduct.price) : 0;

  // Pick a few products that are not the product just added. This is
  // the "Customers also bought" style row inside the drawer.
  const suggestions = recommendationProducts
    .filter((product) => product.id !== addedProduct?.id)
    .slice(0, 3);

  // This helper closes the drawer before navigation so the new page
  // does not appear hidden behind the side panel.
  const goTo = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <>
      {/* The overlay darkens the page and lets the user click outside. */}
      <div
        className={`cart-drawer-overlay${isOpen ? " open" : ""}`}
        onClick={onClose}
      />

      {/* The aside is the visible right-side drawer. */}
      <aside className={`cart-drawer${isOpen ? " open" : ""}`}>
        {/* Header area: confirmation and close button. */}
        <div className="cart-drawer-header">
          <div>
            <p className="cart-drawer-success">✓ Added to Cart</p>
            <p className="cart-drawer-subtitle">
              {cartCount} {cartCount === 1 ? "item" : "items"} in your cart
            </p>
          </div>
          <button className="drawer-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Product summary: image, name, price, and delivery copy. */}
        {addedProduct && (
          <div className="drawer-product">
            <img
              src={addedProduct.image_url}
              alt={addedProduct.name}
              className="drawer-product-image"
            />
            <div className="drawer-product-info">
              <h3>{addedProduct.name}</h3>
              <p className="drawer-product-price">{formatPrice(productPrice)}</p>
              <p className="drawer-product-delivery">Eligible for FREE delivery</p>
            </div>
          </div>
        )}

        {/* Action buttons mirror Amazon's post-add flow. */}
        <div className="drawer-actions">
          <button className="btn btn-amazon-orange btn-full" onClick={() => goTo("/checkout")}>
            Proceed to Buy
          </button>
          <button className="btn btn-primary btn-full" onClick={() => goTo("/cart")}>
            Go to Cart
          </button>
          <button className="btn btn-outline btn-full" onClick={onClose}>
            Continue Shopping
          </button>
        </div>

        {/* Recommendations make the drawer feel like a shopping surface. */}
        <div className="drawer-recommendations">
          <h3>Customers also bought</h3>
          {suggestions.map((product) => (
            <button
              key={product.id}
              className="drawer-rec-item"
              onClick={() => goTo(`/products/${product.id}`)}
            >
              <img src={product.image_url} alt={product.name} />
              <span>{product.name}</span>
              <strong>{formatPrice(product.price)}</strong>
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}

export default CartDrawer;
