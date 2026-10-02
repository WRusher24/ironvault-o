import { NextResponse } from "next/server";
import { db } from "@/db";
import { exercises } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { exerciseSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const user = await requireUser();
  const { id } = await params;
  const row = await db.query.exercises.findFirst({
    where: (e, { and, eq }) => and(eq(e.id, id), eq(e.userId, user.id)),
  });
  if (!row) return NextResponse.json({ error: "التمرين غير موجود" }, { status: 404 });
  return NextResponse.json({ exercise: row });
}

export async function PATCH(req: Request, { params }: Params) {
  const user = await requireUser();
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "جسم الطلب غير صالح" }, { status: 400 });
  }

  const parsed = exerciseSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" },
      { status: 400 }
    );
  }

  const existing = await db.query.exercises.findFirst({
    where: (e, { and, eq }) => and(eq(e.id, id), eq(e.userId, user.id)),
  });
  if (!existing) {
    return NextResponse.json({ error: "التمرين غير موجود" }, { status: 404 });
  }

  if (parsed.data.categoryId) {
    const cat = await db.query.categories.findFirst({
      where: (c, { and, eq }) => and(eq(c.id, parsed.data.categoryId!), eq(c.userId, user.id)),
    });
    if (!cat) {
      return NextResponse.json({ error: "التصنيف غير موجود" }, { status: 400 });
    }
  }

  const [updated] = await db
    .update(exercises)
    .set({
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.nameEn !== undefined && { nameEn: parsed.data.nameEn || null }),
      ...(parsed.data.categoryId !== undefined && { categoryId: parsed.data.categoryId }),
      ...(parsed.data.imageUrl !== undefined && { imageUrl: parsed.data.imageUrl }),
      ...(parsed.data.notes !== undefined && { notes: parsed.data.notes }),
    })
    .where(eq(exercises.id, id))
    .returning();

  return NextResponse.json({ exercise: updated });
}

export async function DELETE(_req: Request, { params }: Params) {
  const user = await requireUser();
  const { id } = await params;

  const existing = await db.query.exercises.findFirst({
    where: (e, { and, eq }) => and(eq(e.id, id), eq(e.userId, user.id)),
  });
  if (!existing) {
    return NextResponse.json({ error: "التمرين غير موجود" }, { status: 404 });
  }

  // pr_logs rows cascade via FK; delete the exercise itself.
  await db.delete(exercises).where(eq(exercises.id, id));
  return NextResponse.json({ ok: true });
}
