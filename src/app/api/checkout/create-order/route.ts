import { NextRequest, NextResponse } from "next/server";
import { getRazorpayInstance, isRazorpayConfigured, SHIPPING_FLAT } from "@/lib/payment";
import { verifyCartItems } from "@/lib/catalog";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/checkout/create-order
// Body: { items: [{productId, quantity}] }
// Returns: { razorpayOrderId, amount, currency, keyId } (amount in paise)
// Guest checkout supported — userId attached only if logged in.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      {
        error: "Razorpay is not configured. Add RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET and NEXT_PUBLIC_RAZORPAY_KEY_ID to .env to enable payments.",
        configured: false,
      },
      { status: 503 }
    );
  }

  const body = await req.json();
  const { items } = body as { items: { productId: string; quantity: number }[] };
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // Server-side authoritative price calculation
  const { verified, valid } = await verifyCartItems(items);
  if (!valid || verified.length === 0) {
    return NextResponse.json({ error: "Some items are unavailable" }, { status: 400 });
  }
  // block out-of-stock
  const oos = verified.filter((v) => !v.inStock);
  if (oos.length) {
    return NextResponse.json(
      { error: `Insufficient stock: ${oos.map((o) => o.name).join(", ")}` },
      { status: 400 }
    );
  }

  const subtotal = verified.reduce((s, v) => s + v.price * v.quantity, 0);
  const amount = (subtotal + SHIPPING_FLAT) * 100; // paise

  const razorpay = getRazorpayInstance()!;
  try {
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `lumen_${Date.now()}`,
      notes: {
        userId: (session?.user as any)?.id || "guest",
        itemCount: String(verified.length),
      },
    });
    return NextResponse.json({
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      subtotal,
      shipping: SHIPPING_FLAT,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Failed to create payment order", detail: e?.message },
      { status: 500 }
    );
  }
}
