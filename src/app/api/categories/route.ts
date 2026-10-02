import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { categorySchema } from "@/lib/validations";

export async function GET() {
  const user = await requireUser();
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, user.id))
    .orderBy(asc(categories.sortOrder));
  return NextResponse.json({ categories: rows });
}

export async function POST(req: Request) {
  const user = await requireUser();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "جسم الطلب غير صالح" }, { status: 400 });
  }

  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" },
      { status: 400 }
    );
  }

  const maxRow = await db
    .select({ max: categories.sortOrder })
    .from(categories)
    .where(eq(categories.userId, user.id))
    .orderBy(categories.sortOrder)
    .limit(1);
  const nextOrder = maxRow.length > 0 ? (maxRow[0].max ?? 0) + 1 : 0;

  const [created] = await db
    .insert(categories)
    .values({
      userId: user.id,
      name: parsed.data.name,
      nameEn: parsed.data.nameEn || null,
      color: parsed.data.color,
      icon: parsed.data.icon,
      sortOrder: nextOrder,
    })
    .returning();

  return NextResponse.json({ category: created }, { status: 201 });
}
