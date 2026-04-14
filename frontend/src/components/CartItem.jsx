import { useNavigate } from "react-router-dom";

function CartItem({ item, onUpdate, onRemove }) {
  const navigate = useNavigate();

  return (
    <div className="cart-item">
      {/* Image */}
      <img
        src={item.image_url}
        alt={item.name}
        className="cart-item-image"
        onClick={() => navigate(`/products/${item.product_id}`)}
      />

      {/* Details */}
      <div className="cart-item-details">
        <p
          className="cart-item-name"
          onClick={() => navigate(`/products/${item.product_id}`)}
        >
          {item.name}
        </p>
        <p className="cart-item-stock">In Stock</p>
        <p className="cart-item-price">₹{Number(item.price).toLocaleString("en-IN")}</p>

        {/* Actions row */}
        <div className="cart-item-actions">
          {/* Qty dropdown (Amazon style) */}
          <select
            className="qty-select"
            value={item.quantity}
            onChange={(e) => onUpdate(item.id, parseInt(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>Qty: {n}</option>
            ))}
          </select>

          <span className="cart-divider">|</span>
          <button className="btn-link" onClick={() => onRemove(item.id)}>Delete</button>
          <span className="cart-divider">|</span>
          <button className="btn-link">Save for later</button>
        </div>
      </div>

      {/* Subtotal */}
      <div className="cart-item-subtotal">
        ₹{(item.price * item.quantity).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      </div>
    </div>
  );
}

export default CartItem;