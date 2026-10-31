import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPublishedProducts, serializeProduct } from "@/lib/catalog";
import { requireAdmin } from "@/lib/auth";

// GET /api/products — public list (published only) with optional filters
// ?all=true returns ALL products (admin only, including unpublished)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || undefined;
  const collection = searchParams.get("collection") || undefined;
  const search = searchParams.get("search") || undefined;
  const sort = (searchParams.get("sort") as any) || undefined;
  const limit = searchParams.get("limit")
    ? parseInt(searchParams.get("limit")!)
    : undefined;
  const all = searchParams.get("all") === "true";

  if (all) {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const products = await db.product.findMany({
      include: { category: true, images: true, variants: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ products: products.map(serializeProduct) });
  }

  const products = await getPublishedProducts({
    category,
    collection,
    search,
    sort,
    limit,
  });
  return NextResponse.json({ products });
}

// POST /api/products — admin create
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const {
    name, slug, shortDescription, description, price, compareAtPrice,
    categorySlug, primaryImage, badge, collection, tags, sizes, colors,
    inventory, featured, trending, isNew, editorsPick, published, gallery,
  } = body;

  if (!name || !slug || !price || !categorySlug || !primaryImage) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const category = await db.category.findUnique({ where: { slug: categorySlug } });
  if (!category) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }
  const existing = await db.product.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }

  const product = await db.product.create({
    data: {
      name, slug, shortDescription: shortDescription || "",
      description: description || "",
      price: parseInt(price), compareAtPrice: compareAtPrice ? parseInt(compareAtPrice) : null,
      categoryId: category.id, primaryImage,
      badge: badge || null, collection: collection || null,
      tags: tags || "", sizes: sizes || "One Size",
      colors: Array.isArray(colors) ? colors.map((c: any) => (typeof c === "string" ? c : c.name)).join(",") : (colors || ""),
      inventory: parseInt(inventory) || 0,
      featured: !!featured, trending: !!trending, isNew: !!isNew,
      editorsPick: !!editorsPick, published: published !== false,
    },
    include: { category: true, images: true, variants: true },
  });

  if (Array.isArray(gallery)) {
    for (let i = 0; i < gallery.length; i++) {
      await db.productImage.create({ data: { productId: product.id, url: gallery[i], position: i } });
    }
  }
  const colorList: any[] = Array.isArray(colors) ? colors : (colors ? colors.split(",") : []);
  for (const c of colorList) {
    const name = typeof c === "string" ? c.split(":")[0] : c.name;
    const hex = typeof c === "string" ? c.split(":")[1] || "#2b2b2e" : c.hex;
    await db.productVariant.create({
      data: { productId: product.id, name: name?.trim(), type: "color", value: hex || "#2b2b2e", inventory: parseInt(inventory) || 0 },
    });
  }

  const fresh = await db.product.findUnique({
    where: { id: product.id },
    include: { category: true, images: true, variants: true },
  });
  return NextResponse.json({ product: serializeProduct(fresh) }, { status: 201 });
}
