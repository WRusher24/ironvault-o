import { NextResponse } from "next/server";
import { db } from "@/db";
import { exercises, prLogs } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { exerciseSchema } from "@/lib/validations";

export async function GET() {
  const user = await requireUser();
  const rows = await db
    .select()
    .from(exercises)
    .where(eq(exercises.userId, user.id))
    .orderBy(desc(exercises.createdAt));
  return NextResponse.json({ exercises: rows });
}

export async function POST(req: Request) {
  const user = await requireUser();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "جسم الطلب غير صالح" }, { status: 400 });
  }

  const parsed = exerciseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" },
      { status: 400 }
    );
  }

  // Validate category ownership when provided.
  if (parsed.data.categoryId) {
    const cat = await db.query.categories.findFirst({
      where: (c, { and, eq }) => and(eq(c.id, parsed.data.categoryId!), eq(c.userId, user.id)),
    });
    if (!cat) {
      return NextResponse.json({ error: "التصنيف غير موجود" }, { status: 400 });
    }
  }

  const [created] = await db
    .insert(exercises)
    .values({
      userId: user.id,
      name: parsed.data.name,
      nameEn: parsed.data.nameEn || null,
      categoryId: parsed.data.categoryId ?? null,
      imageUrl: parsed.data.imageUrl ?? null,
      notes: parsed.data.notes ?? null,
    })
    .returning();

  return NextResponse.json({ exercise: created }, { status: 201 });
}
