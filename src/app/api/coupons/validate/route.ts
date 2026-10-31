import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/coupons/validate  { code, subtotal }
export async function POST(req: NextRequest) {
  const { code, subtotal } = await req.json();
  if (!code || typeof subtotal !== "number") {
    return NextResponse.json({ valid: false, error: "Invalid request" }, { status: 400 });
  }
  const coupon = await db.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (!coupon || !coupon.active) {
    return NextResponse.json({ valid: false, error: "Coupon not found or inactive" });
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return NextResponse.json({ valid: false, error: "Coupon expired" });
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return NextResponse.json({ valid: false, error: "Coupon usage limit reached" });
  }
  if (subtotal < coupon.minSubtotal) {
    return NextResponse.json({
      valid: false,
      error: `Minimum subtotal ₹${coupon.minSubtotal} required`,
    });
  }

  let discount = 0;
  if (coupon.type === "percent") {
    discount = Math.round((subtotal * coupon.value) / 100);
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  } else {
    discount = coupon.value;
  }
  discount = Math.min(discount, subtotal);

  return NextResponse.json({
    valid: true,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discount,
    maxDiscount: coupon.maxDiscount ?? undefined,
  });
}
