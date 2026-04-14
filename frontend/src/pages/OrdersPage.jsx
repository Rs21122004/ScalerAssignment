// ============================================================
// OrdersPage.jsx — Order History Page
// ============================================================
// Shows all past orders for the signed-in user.
// Each order shows:
//   - Order ID and date
//   - Status (placed/shipped/delivered)
//   - List of items in the order
//   - Total amount
//
// Requires authentication — redirects to sign-in if not signed in.
//
// API calls:
//   GET /api/orders → fetch all past orders with items (user-scoped)
// ============================================================

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import API from "../api";

function OrdersPage() {
  const { isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);      // Array of past orders
  const [loading, setLoading] = useState(true);   // Loading state
  const [filter, setFilter] = useState("all");    // Time filter

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate("/sign-in");
    }
  }, [isLoaded, isSignedIn, navigate]);

  // Fetch orders when the page loads
  useEffect(() => {
    if (isSignedIn) {
      fetchOrders();
    }
  }, [isSignedIn]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await API.get("/api/orders");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format date to a readable string
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter orders by time range
  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    const orderDate = new Date(order.created_at);
    const now = new Date();
    const daysDiff = (now - orderDate) / (1000 * 60 * 60 * 24);

    switch (filter) {
      case "30": return daysDiff <= 30;
      case "90": return daysDiff <= 90;
      case "180": return daysDiff <= 180;
      case "365": return daysDiff <= 365;
      default: return true;
    }
  });

  // Get status color class
  const getStatusClass = (status) => {
    switch (status) {
      case "placed": return "status-placed";
      case "shipped": return "status-shipped";
      case "delivered": return "status-delivered";
      case "cancelled": return "status-cancelled";
      default: return "status-placed";
    }
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="page">
        <div className="loading">Redirecting to sign in...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header orders-page-header">
        <h1>Your Orders</h1>
        <div className="order-filter-bar">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="order-filter-select"
          >
            <option value="all">All Orders</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="180">Last 6 months</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h2>No orders found</h2>
          <p>
            {orders.length === 0
              ? "You haven't placed any orders yet. Start shopping!"
              : "No orders match the selected time period."}
          </p>
          <Link to="/products" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => (
            <div key={order.id} className="order-card">
              {/* Order header — Amazon style with background */}
              <div className="order-header">
                <div className="order-header-left">
                  <div className="order-header-row">
                    <div className="order-header-item">
                      <span className="order-header-label">ORDER PLACED</span>
                      <span className="order-header-value">
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                    <div className="order-header-item">
                      <span className="order-header-label">TOTAL</span>
                      <span className="order-header-value">
                        ₹{Number(order.total_amount).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="order-header-item">
                      <span className="order-header-label">SHIP TO</span>
                      <span className="order-header-value order-address-short">
                        {order.shipping_address
                          ? order.shipping_address.split(",")[0]
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="order-header-right">
                  <span className="order-id">ORDER # {order.id}</span>
                  <Link
                    to={`/order-confirmation/${order.id}`}
                    className="order-details-link"
                  >
                    View order details
                  </Link>
                </div>
              </div>

              {/* Order body */}
              <div className="order-body">
                <div className="order-status-row">
                  <span className={`order-status ${getStatusClass(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  {order.shipping_address && (
                    <p className="order-address">📦 {order.shipping_address}</p>
                  )}
                </div>

                {/* Order items */}
                <div className="order-items">
                  {order.items &&
                    order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <Link to={`/products/${item.product_id}`}>
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="order-item-image"
                          />
                        </Link>
                        <div className="order-item-details">
                          <Link
                            to={`/products/${item.product_id}`}
                            className="order-item-name"
                          >
                            {item.name}
                          </Link>
                          <span className="order-item-qty">
                            Qty: {item.quantity} × ₹{item.price}
                          </span>
                          <Link
                            to={`/products/${item.product_id}`}
                            className="btn btn-outline btn-sm"
                          >
                            Buy it again
                          </Link>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
