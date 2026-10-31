import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCategories } from "@/lib/catalog";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const categories = await getCategories();
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { name, slug, tagline, description, image, span } = body;
  if (!name || !slug) {
    return NextResponse.json({ error: "Name and slug required" }, { status: 400 });
  }
  const cat = await db.category.create({
    data: {
      name, slug, tagline: tagline || "", description: description || "",
      image: image || "/categories/lifestyle.png", span: span || "regular",
    },
  });
  return NextResponse.json({ category: cat }, { status: 201 });
}
