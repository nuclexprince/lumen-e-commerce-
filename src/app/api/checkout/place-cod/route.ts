import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { verifyCartItems } from "@/lib/catalog";
import { generateOrderNumber, SHIPPING_FLAT, COD_ENABLED } from "@/lib/payment";

// POST /api/checkout/place-cod  (only when COD is enabled by admin)
// Guest checkout supported.
export async function POST(req: NextRequest) {
  if (!COD_ENABLED) {
    return NextResponse.json({ error: "Cash on Delivery is not available" }, { status: 403 });
  }
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id || null;

  const body = await req.json();
  const { items, contact, delivery, coupon } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }
  const { verified, valid } = await verifyCartItems(items);
  if (!valid || !verified.length) {
    return NextResponse.json({ error: "Some items are unavailable" }, { status: 400 });
  }
  const oos = verified.filter((v) => !v.inStock);
  if (oos.length) {
    return NextResponse.json({ error: `Insufficient stock: ${oos.map((o) => o.name).join(", ")}` }, { status: 400 });
  }

  const subtotal = verified.reduce((s, v) => s + v.price * v.quantity, 0);
  const shipping = SHIPPING_FLAT;
  let discount = 0;
  let couponCode: string | null = null;
  if (coupon?.code && typeof coupon.discount === "number") {
    const dbCoupon = await db.coupon.findUnique({ where: { code: coupon.code } });
    if (dbCoupon?.active && (!dbCoupon.expiresAt || dbCoupon.expiresAt > new Date()) && subtotal >= dbCoupon.minSubtotal) {
      discount = Math.min(coupon.discount, subtotal);
      couponCode = dbCoupon.code;
    }
  }
  const total = subtotal + shipping - discount;

  if (!contact?.fullName || !contact?.email || !contact?.phone || !delivery?.address || !delivery?.city || !delivery?.state || !delivery?.pincode) {
    return NextResponse.json({ error: "Contact and delivery information incomplete" }, { status: 400 });
  }

  const orderNumber = generateOrderNumber();
  const order = await db.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        orderNumber, userId,
        fullName: contact.fullName, email: contact.email, phone: contact.phone,
        address: delivery.address, apartment: delivery.apartment || null,
        city: delivery.city, state: delivery.state, pincode: delivery.pincode,
        instructions: delivery.instructions || null,
        subtotal, shipping, discount, couponCode, total,
        status: "Confirmed", paymentStatus: "COD pending", paymentMethod: "cod",
      },
    });
    for (const v of verified) {
      const item = items.find((i) => i.productId === v.productId);
      await tx.orderItem.create({
        data: {
          orderId: order.id, productId: v.productId, name: v.name, image: v.image,
          price: v.price, quantity: v.quantity, size: item?.size || null, color: item?.color || null,
        },
      });
      await tx.product.update({ where: { id: v.productId }, data: { inventory: { decrement: v.quantity } } });
    }
    if (couponCode) {
      await tx.coupon.update({ where: { code: couponCode }, data: { usedCount: { increment: 1 } } });
    }
    return order;
  });

  return NextResponse.json({ orderNumber, orderId: order.id, total });
}
