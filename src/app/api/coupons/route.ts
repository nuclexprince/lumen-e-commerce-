import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET /api/coupons
export async function GET() {
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ coupons });
}

// POST /api/coupons — admin create
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { code, type, value, minSubtotal, maxDiscount, active, usageLimit, expiresAt } = body;
  if (!code || !type || !value) {
    return NextResponse.json({ error: "Code, type and value required" }, { status: 400 });
  }
  const existing = await db.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (existing) return NextResponse.json({ error: "Coupon code exists" }, { status: 409 });
  const coupon = await db.coupon.create({
    data: {
      code: code.toUpperCase(),
      type,
      value: parseInt(value),
      minSubtotal: parseInt(minSubtotal) || 0,
      maxDiscount: maxDiscount ? parseInt(maxDiscount) : null,
      active: active !== false,
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });
  return NextResponse.json({ coupon }, { status: 201 });
}

// PATCH /api/coupons — toggle active by id
export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, active } = await req.json();
  const coupon = await db.coupon.update({ where: { id }, data: { active } });
  return NextResponse.json({ coupon });
}
