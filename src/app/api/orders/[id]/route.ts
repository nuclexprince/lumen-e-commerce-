import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/orders/[id] — owner or admin
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const isAdmin = (session.user as any).role === "ADMIN";

  const { id } = await params;
  const order = await db.order.findFirst({
    where: {
      OR: [{ id }, { orderNumber: id }],
      ...(isAdmin ? {} : { userId }),
    },
    include: { items: true, payment: true },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ order });
}

// PATCH /api/orders/[id] — admin: update status + tracking
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const allowed = ["status", "paymentStatus", "trackingNumber", "carrier"];
  const data: any = {};
  for (const k of allowed) {
    if (k in body) data[k] = body[k];
  }
  // status transitions affect payment status for refunds/cancels
  if (data.status === "Cancelled" && !data.paymentStatus) {
    data.paymentStatus = "Refunded";
  }
  if (data.status === "Refunded" && !data.paymentStatus) {
    data.paymentStatus = "Refunded";
  }

  const { id } = await params;
  const order = await db.order.update({
    where: { id },
    data,
    include: { items: true, payment: true },
  });
  return NextResponse.json({ order });
}
