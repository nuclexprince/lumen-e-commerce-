import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// POST /api/auth/register  { name, email, password }
export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();
  const cleanEmail = email?.trim().toLowerCase();
  if (!cleanEmail || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }
  if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { email: cleanEmail } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: { name: name?.trim() || null, email: cleanEmail, passwordHash, role: "CUSTOMER" },
  });

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}
