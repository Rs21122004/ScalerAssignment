// ============================================================
// utils/mailer.js — Email Notification Service
// ============================================================
// Sends an order confirmation email after a successful checkout.
//
// SETUP STEPS:
//   1. Enable 2-Factor Authentication on your Gmail account
//   2. Go to https://myaccount.google.com/apppasswords
//   3. Generate an App Password for "Mail"
//   4. Put it in backend/.env as EMAIL_PASS
//
// HOW IT WORKS:
//   1. Creates a Nodemailer transporter using Gmail SMTP
//   2. sendOrderConfirmation() builds a styled HTML email
//   3. Sends it to the customer's email address
//   4. Returns silently on error (email failure should NOT
//      break the order — the order is already committed)
// ============================================================

const nodemailer = require("nodemailer");

// Create the SMTP transporter.
// Gmail's SMTP server is smtp.gmail.com on port 587 (TLS).
// "secure: false" means we use STARTTLS, not direct SSL.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your.email@gmail.com
    pass: process.env.EMAIL_PASS, // 16-char app password from Google
  },
});

// ============================
// Send Order Confirmation
// ============================
// Parameters:
//   toEmail — customer's email address (from Clerk profile)
//   order   — { id, total_amount, shipping_address, created_at }
//   items   — [{ name, quantity, price, image_url }]
//
// The email is HTML-formatted to look like an Amazon order email.
async function sendOrderConfirmation(toEmail, order, items) {
  // If email credentials are not configured, skip silently.
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("⚠️  EMAIL_USER / EMAIL_PASS not set — skipping email.");
    return;
  }

  // Build the items table rows
  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e7e7e7;">
          <img src="${item.image_url}" alt="${item.name}"
               style="width: 60px; height: 60px; object-fit: contain; border-radius: 4px;" />
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e7e7e7;">
          ${item.name}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e7e7e7; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e7e7e7; text-align: right;">
          ₹${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>`
    )
    .join("");

  const orderDate = new Date(order.created_at).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Full HTML email template
  const html = `
  <div style="max-width: 600px; margin: 0 auto; font-family: 'Amazon Ember', Arial, sans-serif; color: #0f1111;">
    <!-- Header -->
    <div style="background: #232f3e; padding: 16px 24px; text-align: center;">
      <span style="color: #ff9900; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
        amazon<span style="color: #ffffff;">.in</span>
      </span>
    </div>

    <!-- Body -->
    <div style="padding: 24px; background: #ffffff; border: 1px solid #d5d9d9;">
      <h1 style="font-size: 20px; color: #0f1111; margin: 0 0 8px;">
        Order Confirmed!
      </h1>
      <p style="color: #565959; margin: 0 0 20px;">
        Hi, thank you for your order. We'll let you know once your items have shipped.
      </p>

      <!-- Order meta -->
      <div style="background: #f0f2f2; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <table style="width: 100%; font-size: 14px;">
          <tr>
            <td><strong>Order #</strong></td>
            <td style="text-align: right;">${order.id}</td>
          </tr>
          <tr>
            <td><strong>Order Date</strong></td>
            <td style="text-align: right;">${orderDate}</td>
          </tr>
          <tr>
            <td><strong>Order Total</strong></td>
            <td style="text-align: right; color: #b12704; font-weight: 700;">
              ₹${Number(order.total_amount).toFixed(2)}
            </td>
          </tr>
        </table>
      </div>

      ${
        order.shipping_address
          ? `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 14px; margin: 0 0 6px;">Shipping Address</h3>
        <p style="color: #565959; margin: 0; font-size: 14px;">${order.shipping_address}</p>
      </div>`
          : ""
      }

      <!-- Items table -->
      <h3 style="font-size: 14px; margin: 0 0 8px;">Items Ordered</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="background: #f0f2f2;">
            <th style="padding: 8px; text-align: left;"></th>
            <th style="padding: 8px; text-align: left;">Product</th>
            <th style="padding: 8px; text-align: center;">Qty</th>
            <th style="padding: 8px; text-align: right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding: 12px; text-align: right; font-weight: 700;">
              Total:
            </td>
            <td style="padding: 12px; text-align: right; font-weight: 700; color: #b12704;">
              ₹${Number(order.total_amount).toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Footer -->
    <div style="background: #f0f2f2; padding: 16px 24px; text-align: center; font-size: 12px; color: #565959;">
      <p style="margin: 0;">
        This email was sent from a demo e-commerce application.
      </p>
    </div>
  </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Amazon.in Clone" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `Order Confirmed — #${order.id}`,
      html: html,
    });
    console.log(`📧 Confirmation email sent to ${toEmail}`);
  } catch (error) {
    // Log but don't throw — order is already placed successfully.
    console.error("❌ Failed to send email:", error.message);
  }
}

module.exports = { sendOrderConfirmation };
