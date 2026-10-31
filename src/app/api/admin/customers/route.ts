import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET /api/admin/customers — list customers with order stats
export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const customers = await db.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  // attach order count + total spent
  const withStats = await Promise.all(
    customers.map(async (c) => {
      const agg = await db.order.aggregate({
        where: { userId: c.id, paymentStatus: "Paid" },
        _sum: { total: true },
        _count: true,
      });
      return {
        ...c,
        orderCount: agg._count,
        totalSpent: agg._sum.total || 0,
      };
    })
  );

  return NextResponse.json({ customers: withStats });
}
