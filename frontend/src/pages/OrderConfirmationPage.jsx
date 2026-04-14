// ============================================================
// OrderConfirmationPage.jsx — Order Success Page
// ============================================================
// The assignment specifically asks for an order confirmation page
// that displays the order ID. This page handles that requirement.
//
// Flow:
//   1. CheckoutPage creates an order using POST /api/orders.
//   2. Backend returns the new order id.
//   3. CheckoutPage navigates to /order-confirmation/:id.
//   4. This page fetches that order and shows the success summary.
// ============================================================

import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api";
import { formatPrice } from "../data/amazonExtras";

function OrderConfirmationPage() {
  // The order id is part of the route: /order-confirmation/:id.
  const { id } = useParams();

  // Store order data from the backend.
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch one order by id. useCallback keeps the function stable for
  // React's effect dependency rules.
  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.get(`/api/orders/${id}`);
      setOrder(response.data);
    } catch (error) {
      console.error("Error fetching order confirmation:", error);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading) {
    return (
      <div className="page">
        <div className="loading">Loading order confirmation...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page">
        <div className="empty-state">
          <p>We could not find this order.</p>
          <Link to="/products" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="confirmation-page">
      <div className="confirmation-card">
        <div className="confirmation-icon">✓</div>
        <h1 className="confirmation-title">Order placed, thank you!</h1>
        <p className="confirmation-subtitle">
          Confirmation will be sent to your registered email address.
        </p>

        {/* The assignment-required order ID is shown clearly here. */}
        <div className="order-confirmation-box">
          <span>Order ID</span>
          <strong>#{order.id}</strong>
        </div>

        <div className="confirmation-details-grid">
          <div>
            <span>Estimated delivery</span>
            <strong>Tomorrow by 9 PM</strong>
          </div>
          <div>
            <span>Total paid</span>
            <strong>{formatPrice(order.total_amount)}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{order.status}</strong>
          </div>
        </div>

        <div className="confirmation-items">
          <h2>Items in this order</h2>
          {order.items?.map((item) => (
            <div key={item.id} className="confirmation-item">
              <img src={item.image_url} alt={item.name} />
              <div>
                <span>{item.name || "Product unavailable"}</span>
                <p>Qty: {item.quantity} × {formatPrice(item.price)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="confirmation-actions">
          <Link to="/orders" className="btn btn-amazon-orange">
            View Your Orders
          </Link>
          <Link to="/products" className="btn btn-outline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmationPage;
