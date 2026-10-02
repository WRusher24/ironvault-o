import { NextResponse } from "next/server";
import { db } from "@/db";
import { prLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { logSchema } from "@/lib/validations";
import { previousMaxWeight } from "@/lib/queries";

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

  const parsed = logSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" },
      { status: 400 }
    );
  }

  const existing = await db.query.prLogs.findFirst({
    where: (l, { and, eq }) => and(eq(l.id, id), eq(l.userId, user.id)),
  });
  if (!existing) {
    return NextResponse.json({ error: "السجل غير موجود" }, { status: 404 });
  }

  const newExerciseId = parsed.data.exerciseId ?? existing.exerciseId;
  const newWeight = parsed.data.weightKg ?? existing.weightKg;

  const exercise = await db.query.exercises.findFirst({
    where: (e, { and, eq }) => and(eq(e.id, newExerciseId), eq(e.userId, user.id)),
  });
  if (!exercise) {
    return NextResponse.json({ error: "التمرين غير موجود" }, { status: 404 });
  }

  const prevMax = await previousMaxWeight(newExerciseId, id);
  const isNewPR = newWeight > prevMax;

  const [updated] = await db
    .update(prLogs)
    .set({
      ...(parsed.data.exerciseId !== undefined && { exerciseId: parsed.data.exerciseId }),
      ...(parsed.data.weightKg !== undefined && { weightKg: parsed.data.weightKg }),
      ...(parsed.data.reps !== undefined && { reps: parsed.data.reps }),
      ...(parsed.data.note !== undefined && { note: parsed.data.note }),
      ...(parsed.data.loggedAt !== undefined && { loggedAt: parsed.data.loggedAt }),
    })
    .where(eq(prLogs.id, id))
    .returning();

  return NextResponse.json({ log: updated, isNewPR });
}

export async function DELETE(_req: Request, { params }: Params) {
  const user = await requireUser();
  const { id } = await params;

  const existing = await db.query.prLogs.findFirst({
    where: (l, { and, eq }) => and(eq(l.id, id), eq(l.userId, user.id)),
  });
  if (!existing) {
    return NextResponse.json({ error: "السجل غير موجود" }, { status: 404 });
  }

  await db.delete(prLogs).where(eq(prLogs.id, id));
  return NextResponse.json({ ok: true });
}
