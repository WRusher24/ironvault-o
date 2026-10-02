import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { categorySchema } from "@/lib/validations";
import { categoryHasExercises } from "@/lib/queries";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const user = await requireUser();
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "جسم الطلب غير صالح" }, { status: 400 });
  }

  const parsed = categorySchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" },
      { status: 400 }
    );
  }

  const existing = await db.query.categories.findFirst({
    where: (c, { and, eq }) => and(eq(c.id, id), eq(c.userId, user.id)),
  });
  if (!existing) {
    return NextResponse.json({ error: "التصنيف غير موجود" }, { status: 404 });
  }

  const [updated] = await db
    .update(categories)
    .set({
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.nameEn !== undefined && { nameEn: parsed.data.nameEn || null }),
      ...(parsed.data.color !== undefined && { color: parsed.data.color }),
      ...(parsed.data.icon !== undefined && { icon: parsed.data.icon }),
    })
    .where(eq(categories.id, id))
    .returning();

  return NextResponse.json({ category: updated });
}

export async function DELETE(_req: Request, { params }: Params) {
  const user = await requireUser();
  const { id } = await params;

  const existing = await db.query.categories.findFirst({
    where: (c, { and, eq }) => and(eq(c.id, id), eq(c.userId, user.id)),
  });
  if (!existing) {
    return NextResponse.json({ error: "التصنيف غير موجود" }, { status: 404 });
  }

  if (await categoryHasExercises(id)) {
    return NextResponse.json(
      { error: "لا يمكن حذف تصنيف يحتوي على تمارين — انقل التمارين أولاً" },
      { status: 409 }
    );
  }

  await db.delete(categories).where(eq(categories.id, id));
  return NextResponse.json({ ok: true });
}
