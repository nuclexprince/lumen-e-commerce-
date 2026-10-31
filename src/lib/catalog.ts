import { db } from "@/lib/db";

// Storefront-facing product shape (keeps existing frontend types working)
export interface StoreProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryName: string;
  shortDescription: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  gallery: string[];
  badge?: string;
  collection?: string;
  colors: { name: string; hex: string }[];
  sizes: string[];
  tags: string[];
  rating: number;
  reviews: number;
  inStock: boolean;
  inventory: number;
  featured: boolean;
  trending: boolean;
  isNew: boolean;
  editorsPick: boolean;
  published: boolean;
}

export interface StoreCategory {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  span: string;
}

export function serializeProduct(
  p: any
): StoreProduct {
  const colorVariants = (p.variants ?? []).filter((v: any) => v.type === "color");
  const colors = colorVariants.length
    ? colorVariants.map((v: any) => ({ name: v.name, hex: v.value }))
    : (p.colors ? p.colors.split(",").filter(Boolean).map((c: string) => ({ name: c.trim(), hex: "#2b2b2e" })) : []);
  const gallery = (p.images ?? []).length
    ? [...p.images].sort((a: any, b: any) => a.position - b.position).map((i: any) => i.url)
    : [p.primaryImage];
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category?.slug ?? "",
    categoryName: p.category?.name ?? "",
    shortDescription: p.shortDescription,
    description: p.description,
    price: p.price,
    originalPrice: p.compareAtPrice ?? undefined,
    image: p.primaryImage,
    gallery,
    badge: p.badge ?? undefined,
    collection: p.collection ?? undefined,
    colors,
    sizes: p.sizes ? p.sizes.split(",").filter(Boolean).map((s) => s.trim()) : [],
    tags: p.tags ? p.tags.split(",").filter(Boolean).map((t) => t.trim()) : [],
    rating: p.rating,
    reviews: p.reviewCount,
    inStock: p.inventory > 0,
    inventory: p.inventory,
    featured: p.featured,
    trending: p.trending,
    isNew: p.isNew,
    editorsPick: p.editorsPick,
    published: p.published,
  };
}

export function serializeCategory(c: any): StoreCategory {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    tagline: c.tagline,
    description: c.description,
    image: c.image,
    span: c.span,
  };
}

export async function getPublishedProducts(opts?: {
  category?: string;
  collection?: string;
  search?: string;
  sort?: "featured" | "price-asc" | "price-desc" | "newest";
  limit?: number;
}) {
  const where: any = { published: true };
  if (opts?.category && opts.category !== "all") {
    where.category = { slug: opts.category };
  }
  if (opts?.collection) {
    where.collection = opts.collection;
  }
  if (opts?.search) {
    where.OR = [
      { name: { contains: opts.search } },
      { shortDescription: { contains: opts.search } },
      { tags: { contains: opts.search } },
    ];
  }
  let orderBy: any = { createdAt: "desc" };
  if (opts?.sort === "price-asc") orderBy = { price: "asc" };
  if (opts?.sort === "price-desc") orderBy = { price: "desc" };
  if (opts?.sort === "newest") orderBy = [{ isNew: "desc" }, { createdAt: "desc" }];

  const products = await db.product.findMany({
    where,
    include: { category: true, images: true, variants: true },
    orderBy,
    take: opts?.limit,
  });
  return products.map(serializeProduct);
}

export async function getProductBySlug(slug: string) {
  const p = await db.product.findUnique({
    where: { slug },
    include: { category: true, images: true, variants: true },
  });
  return p ? serializeProduct(p) : null;
}

export async function getCategories() {
  const cats = await db.category.findMany({ orderBy: { name: "asc" } });
  return cats.map(serializeCategory);
}

export async function getByCollection(collection: string) {
  return getPublishedProducts({ collection });
}

// Server-side authoritative price lookup (prevents client tampering)
export async function verifyCartItems(items: { productId: string; quantity: number }[]) {
  const verified: {
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    inventory: number;
    inStock: boolean;
  }[] = [];
  let valid = true;
  for (const item of items) {
    const p = await db.product.findUnique({
      where: { id: item.productId },
      select: { id: true, name: true, primaryImage: true, price: true, inventory: true, published: true },
    });
    if (!p || !p.published) {
      valid = false;
      continue;
    }
    verified.push({
      productId: p.id,
      name: p.name,
      image: p.primaryImage,
      price: p.price,
      quantity: item.quantity,
      inventory: p.inventory,
      inStock: p.inventory >= item.quantity,
    });
  }
  return { verified, valid };
}
