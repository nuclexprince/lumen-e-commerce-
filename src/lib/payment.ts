import Razorpay from "razorpay";
import crypto from "crypto";

export function isRazorpayConfigured() {
  return Boolean(
    process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET &&
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  );
}

export function getRazorpayInstance() {
  if (!isRazorpayConfigured()) return null;
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

// Verify the payment signature returned by Razorpay Checkout
export function verifyRazorpaySignature({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");
  // timing-safe compare
  if (expected.length !== razorpaySignature.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(razorpaySignature)
  );
}

export function generateOrderNumber() {
  const d = new Date();
  const y = d.getFullYear().toString().slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `LUMN-${y}${m}${dd}-${rand}`;
}

export const SHIPPING_FLAT = 0; // complimentary shipping
export const FREE_SHIPPING_THRESHOLD = 0;
export const LOW_STOCK_THRESHOLD = 5;
// COD is a real payment method (pay on delivery) — not a simulated online payment.
// Enable by default so the checkout flow is fully testable without payment keys.
// Set COD_ENABLED=false in .env to disable.
export const COD_ENABLED = process.env.COD_ENABLED !== "false";
