import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { LOW_STOCK_THRESHOLD } from "@/lib/payment";

// GET /api/admin/stats — dashboard overview
export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [
    totalOrders,
    paidOrders,
    totalCustomers,
    totalProducts,
    pendingOrders,
    lowStockProducts,
    revenueAgg,
    recentOrdersRaw,
    bestSellersRaw,
    recentCustomers,
    last30Orders,
  ] = await Promise.all([
    db.order.count(),
    db.order.count({ where: { paymentStatus: "Paid" } }),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.product.count(),
    db.order.count({ where: { status: { in: ["Pending", "Confirmed", "Processing"] } } }),
    db.product.findMany({
      where: { inventory: { lte: LOW_STOCK_THRESHOLD }, published: true },
      select: { id: true, name: true, inventory: true, primaryImage: true },
    }),
    db.payment.aggregate({ _sum: { amount: true }, where: { status: "paid" } }),
    db.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    db.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    db.user.findMany({
      where: { role: "CUSTOMER" },
      take: 6,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, createdAt: true },
    }),
    db.order.findMany({
      where: { paymentStatus: "Paid", createdAt: { gte: new Date(Date.now() - 30 * 86400000) } },
      select: { total: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // best sellers → fetch product details
  const bestSellerIds = bestSellersRaw.map((b) => b.productId);
  const bestSellerProducts = await db.product.findMany({
    where: { id: { in: bestSellerIds } },
    select: { id: true, name: true, primaryImage: true, price: true },
  });
  const bestSellers = bestSellersRaw
    .map((b) => {
      const p = bestSellerProducts.find((pp) => pp.id === b.productId);
      if (!p) return null;
      return { ...p, sold: b._sum.quantity };
    })
    .filter(Boolean);

  // revenue chart (last 14 days)
  const days: { date: string; revenue: number; orders: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    const dayOrders = last30Orders.filter(
      (o) => o.createdAt >= day && o.createdAt < next
    );
    days.push({
      date: day.toISOString().slice(0, 10),
      revenue: dayOrders.reduce((s, o) => s + o.total, 0),
      orders: dayOrders.length,
    });
  }

  return NextResponse.json({
    revenue: revenueAgg._sum.amount || 0,
    totalOrders,
    paidOrders,
    totalCustomers,
    totalProducts,
    pendingOrders,
    lowStockProducts,
    recentOrders: recentOrdersRaw,
    bestSellers,
    recentCustomers,
    revenueChart: days,
  });
}
