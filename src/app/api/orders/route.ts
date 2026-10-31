import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/orders — customer: own orders; admin: all (with filters)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const isAdmin = (session.user as any).role === "ADMIN";

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const paymentStatus = searchParams.get("paymentStatus");
  const q = searchParams.get("q");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: any = isAdmin ? {} : { userId };
  if (status) where.status = status;
  if (paymentStatus) where.paymentStatus = paymentStatus;
  if (q) {
    where.OR = [
      { orderNumber: { contains: q } },
      { fullName: { contains: q } },
      { email: { contains: q } },
    ];
  }
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to + "T23:59:59");
  }

  const orders = await db.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: isAdmin ? 200 : 50,
  });
  return NextResponse.json({ orders });
}
