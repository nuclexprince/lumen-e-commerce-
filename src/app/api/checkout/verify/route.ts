import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { verifyCartItems } from "@/lib/catalog";
import {
  verifyRazorpaySignature,
  generateOrderNumber,
  SHIPPING_FLAT,
} from "@/lib/payment";

// POST /api/checkout/verify
// Guest checkout supported — userId attached only if logged in.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id || null;

  const body = await req.json();
  const {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    items,
    contact,
    delivery,
    coupon,
  } = body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
  }

  // Duplicate payment protection: if an order already exists for this payment, return it
  const existing = await db.order.findFirst({
    where: { razorpayOrderId },
  });
  if (existing && existing.paymentStatus === "Paid") {
    return NextResponse.json({ orderNumber: existing.orderNumber, duplicate: true });
  }

  // 1. Verify signature (cryptographic proof the payment is genuine)
  const signatureValid = verifyRazorpaySignature({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });
  if (!signatureValid) {
    return NextResponse.json(
      { error: "Payment signature verification failed" },
      { status: 400 }
    );
  }

  // 2. Verify cart items + prices server-side (never trust client prices)
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }
  const { verified, valid } = await verifyCartItems(items);
  if (!valid || verified.length === 0) {
    return NextResponse.json({ error: "Some items are unavailable" }, { status: 400 });
  }
  const oos = verified.filter((v) => !v.inStock);
  if (oos.length) {
    return NextResponse.json(
      { error: `Insufficient stock: ${oos.map((o) => o.name).join(", ")}` },
      { status: 400 }
    );
  }

  // 3. Compute totals server-side
  const subtotal = verified.reduce((s, v) => s + v.price * v.quantity, 0);
  const shipping = SHIPPING_FLAT;
  let discount = 0;
  let couponCode: string | null = null;
  if (coupon?.code && typeof coupon.discount === "number") {
    const dbCoupon = await db.coupon.findUnique({ where: { code: coupon.code } });
    if (dbCoupon?.active && (!dbCoupon.expiresAt || dbCoupon.expiresAt > new Date())) {
      if (subtotal >= dbCoupon.minSubtotal) {
        discount = Math.min(coupon.discount, subtotal);
        couponCode = dbCoupon.code;
      }
    }
  }
  const total = subtotal + shipping - discount;

  // 4. Validate contact + delivery
  if (!contact?.fullName || !contact?.email || !contact?.phone) {
    return NextResponse.json({ error: "Contact information incomplete" }, { status: 400 });
  }
  if (!delivery?.address || !delivery?.city || !delivery?.state || !delivery?.pincode) {
    return NextResponse.json({ error: "Delivery information incomplete" }, { status: 400 });
  }

  // 5. Create order + items + payment in a transaction; decrement inventory
  const orderNumber = generateOrderNumber();
  const order = await db.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        orderNumber,
        userId,
        fullName: contact.fullName,
        email: contact.email,
        phone: contact.phone,
        address: delivery.address,
        apartment: delivery.apartment || null,
        city: delivery.city,
        state: delivery.state,
        pincode: delivery.pincode,
        instructions: delivery.instructions || null,
        subtotal,
        shipping,
        discount,
        couponCode,
        total,
        status: "Confirmed",
        paymentStatus: "Paid",
        paymentMethod: "razorpay",
        razorpayOrderId,
        razorpayPaymentId,
      },
    });

    for (const v of verified) {
      const item = items.find((i) => i.productId === v.productId);
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: v.productId,
          name: v.name,
          image: v.image,
          price: v.price,
          quantity: v.quantity,
          size: item?.size || null,
          color: item?.color || null,
        },
      });
      // decrement inventory (floor at 0)
      await tx.product.update({
        where: { id: v.productId },
        data: { inventory: { decrement: v.quantity } },
      });
    }

    await tx.payment.create({
      data: {
        orderId: order.id,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        amount: total,
        currency: "INR",
        method: "razorpay",
        status: "paid",
      },
    });

    if (couponCode) {
      await tx.coupon.update({
        where: { code: couponCode },
        data: { usedCount: { increment: 1 } },
      });
    }

    return order;
  });

  return NextResponse.json({ orderNumber, orderId: order.id, total });
}
