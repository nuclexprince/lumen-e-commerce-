import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

// GET /api/addresses — list current user's addresses
export async function GET() {
  const session = await requireUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const addresses = await db.address.findMany({
    where: { userId: (session.user as any).id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ addresses });
}

// POST /api/addresses — create
export async function POST(req: NextRequest) {
  const session = await requireUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const body = await req.json();
  const { label, fullName, phone, address, apartment, city, state, pincode, isDefault } = body;
  if (!fullName || !phone || !address || !city || !state || !pincode) {
    return NextResponse.json({ error: "Incomplete address" }, { status: 400 });
  }
  if (isDefault) {
    await db.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }
  const addr = await db.address.create({
    data: {
      userId, label: label || "Home", fullName, phone, address,
      apartment: apartment || null, city, state, pincode, isDefault: !!isDefault,
    },
  });
  return NextResponse.json({ address: addr }, { status: 201 });
}

// PATCH /api/addresses — update by id (in body)
export async function PATCH(req: NextRequest) {
  const session = await requireUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const body = await req.json();
  const { id, ...rest } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const existing = await db.address.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (rest.isDefault) {
    await db.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }
  const addr = await db.address.update({ where: { id }, data: rest });
  return NextResponse.json({ address: addr });
}

export async function DELETE(req: NextRequest) {
  const session = await requireUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const existing = await db.address.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db.address.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
