import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serializeProduct } from "@/lib/catalog";
import { requireAdmin } from "@/lib/auth";

// Resolve by id OR slug
async function resolveProduct(param: string) {
  return db.product.findFirst({
    where: { OR: [{ id: param }, { slug: param }] },
    include: { category: true, images: true, variants: true },
  });
}

// GET /api/products/[id] — public (only if published) OR admin (any)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await resolveProduct(id);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const session = await requireAdmin();
  if (!product.published && !session) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ product: serializeProduct(product) });
}

// PUT /api/products/[id] — admin update
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const product = await resolveProduct(id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const data: any = {};
  const fields = [
    "name", "slug", "shortDescription", "description", "primaryImage",
    "badge", "collection", "tags", "sizes", "published",
    "featured", "trending", "isNew", "editorsPick",
  ];
  for (const f of fields) {
    if (f in body) data[f] = body[f];
  }
  if ("price" in body) data.price = parseInt(body.price);
  if ("compareAtPrice" in body) data.compareAtPrice = body.compareAtPrice ? parseInt(body.compareAtPrice) : null;
  if ("inventory" in body) data.inventory = parseInt(body.inventory) || 0;
  if ("colors" in body) {
    data.colors = Array.isArray(body.colors) ? body.colors.map((c: any) => (typeof c === "string" ? c : c.name)).join(",") : body.colors;
  }
  if ("categorySlug" in body) {
    const cat = await db.category.findUnique({ where: { slug: body.categorySlug } });
    if (cat) data.categoryId = cat.id;
  }
  if ("slug" in body && body.slug !== product.slug) {
    const clash = await db.product.findUnique({ where: { slug: body.slug } });
    if (clash) return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }

  await db.product.update({ where: { id: product.id }, data });

  // gallery + colors sync if provided
  if (Array.isArray(body.gallery)) {
    await db.productImage.deleteMany({ where: { productId: product.id } });
    for (let i = 0; i < body.gallery.length; i++) {
      await db.productImage.create({ data: { productId: product.id, url: body.gallery[i], position: i } });
    }
  }

  const fresh = await db.product.findUnique({
    where: { id: product.id },
    include: { category: true, images: true, variants: true },
  });
  return NextResponse.json({ product: serializeProduct(fresh) });
}

// DELETE /api/products/[id] — admin delete
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const product = await resolveProduct(id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Unpublish instead of hard-delete if product has been ordered
  const ordered = await db.orderItem.findFirst({ where: { productId: product.id } });
  if (ordered) {
    await db.product.update({ where: { id: product.id }, data: { published: false, inventory: 0 } });
    return NextResponse.json({ softDeleted: true });
  }
  await db.product.delete({ where: { id: product.id } });
  return NextResponse.json({ deleted: true });
}
