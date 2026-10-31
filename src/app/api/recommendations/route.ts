import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serializeProduct } from "@/lib/catalog";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/recommendations?type=related|frequently-bought|recently-viewed|personalized|trending|editors&productId=&limit=
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "related";
  const productId = searchParams.get("productId") || undefined;
  const limit = parseInt(searchParams.get("limit") || "8");
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  let products: any[] = [];

  const include = { category: true, images: true, variants: true };

  if (type === "related" && productId) {
    const current = await db.product.findUnique({
      where: { id: productId },
      include: { category: true },
    });
    if (current) {
      const tagSet = current.tags.split(",").filter(Boolean);
      products = await db.product.findMany({
        where: {
          published: true,
          id: { not: current.id },
          OR: [
            { categoryId: current.categoryId },
            ...tagSet.map((t) => ({ tags: { contains: t } })),
          ],
        },
        include,
        take: limit,
      });
    }
  } else if (type === "frequently-bought" && productId) {
    // Co-occurrence: other products that appear in orders containing productId
    const ordersWithProduct = await db.orderItem.findMany({
      where: { productId },
      select: { orderId: true },
    });
    const orderIds = [...new Set(ordersWithProduct.map((o) => o.orderId))];
    if (orderIds.length) {
      const siblings = await db.orderItem.findMany({
        where: { orderId: { in: orderIds }, productId: { not: productId } },
        select: { productId: true },
      });
      const countMap: Record<string, number> = {};
      for (const s of siblings) countMap[s.productId] = (countMap[s.productId] || 0) + 1;
      const ranked = Object.entries(countMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([id]) => id);
      if (ranked.length) {
        products = await db.product.findMany({
          where: { id: { in: ranked }, published: true },
          include,
        });
        // preserve ranked order
        products.sort((a, b) => ranked.indexOf(a.id) - ranked.indexOf(b.id));
      }
    }
    // fallback to related if no co-occurrence data yet
    if (!products.length && productId) {
      const current = await db.product.findUnique({ where: { id: productId }, include: { category: true } });
      if (current) {
        products = await db.product.findMany({
          where: { published: true, id: { not: current.id }, categoryId: current.categoryId },
          include, take: limit,
        });
      }
    }
  } else if (type === "recently-viewed" && userId) {
    const views = await db.productView.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit * 2,
      select: { productId: true },
    });
    const ids = [...new Set(views.map((v) => v.productId))].slice(0, limit);
    if (ids.length) {
      products = await db.product.findMany({
        where: { id: { in: ids }, published: true, ...(productId ? { id: { not: productId } } : {}) },
        include,
      });
      products.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
    }
  } else if (type === "personalized" && userId) {
    // blend viewed categories + purchased categories
    const views = await db.productView.findMany({
      where: { userId },
      select: { product: { select: { categoryId: true } } },
      take: 50,
    });
    const orders = await db.order.findMany({
      where: { userId },
      select: { items: { select: { product: { select: { categoryId: true } } } } },
      take: 50,
    });
    const catCount: Record<string, number> = {};
    for (const v of views) catCount[v.product.categoryId] = (catCount[v.product.categoryId] || 0) + 2;
    for (const o of orders) for (const it of o.items) catCount[it.product.categoryId] = (catCount[it.product.categoryId] || 0) + 3;
    const topCats = Object.entries(catCount).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([c]) => c);
    if (topCats.length) {
      products = await db.product.findMany({
        where: { published: true, categoryId: { in: topCats }, ...(productId ? { id: { not: productId } } : {}) },
        include, take: limit,
      });
    }
  }

  // Trending: trending flag + popularity (reviewCount as proxy), Editors: editorsPick
  if (type === "trending" || !products.length) {
    products = await db.product.findMany({
      where: { published: true, trending: true },
      include, take: limit,
    });
    if (products.length < limit) {
      const extra = await db.product.findMany({
        where: { published: true, id: { notIn: products.map((p) => p.id) } },
        orderBy: { reviewCount: "desc" },
        include, take: limit - products.length,
      });
      products = [...products, ...extra];
    }
  }
  if (type === "editors") {
    products = await db.product.findMany({
      where: { published: true, editorsPick: true },
      include, take: limit,
    });
    if (products.length < limit) {
      const extra = await db.product.findMany({
        where: { published: true, featured: true, id: { notIn: products.map((p) => p.id) } },
        include, take: limit - products.length,
      });
      products = [...products, ...extra];
    }
  }

  // record a view (for recently-viewed / personalized), deduped lightly
  if (productId && userId) {
    db.productView
      .create({ data: { userId, productId } })
      .catch(() => {});
  }

  return NextResponse.json({ products: products.map(serializeProduct), type });
}
