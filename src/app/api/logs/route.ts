import { NextResponse } from "next/server";
import { db } from "@/db";
import { prLogs } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { logSchema } from "@/lib/validations";
import { previousMaxWeight } from "@/lib/queries";

export async function GET(req: Request) {
  const user = await requireUser();
  const { searchParams } = new URL(req.url);
  const exerciseId = searchParams.get("exerciseId");

  const rows = exerciseId
    ? await db
        .select()
        .from(prLogs)
        .where(eq(prLogs.exerciseId, exerciseId))
        .orderBy(desc(prLogs.loggedAt))
    : await db
        .select()
        .from(prLogs)
        .where(eq(prLogs.userId, user.id))
        .orderBy(desc(prLogs.loggedAt));

  return NextResponse.json({ logs: rows });
}

export async function POST(req: Request) {
  const user = await requireUser();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "جسم الطلب غير صالح" }, { status: 400 });
  }

  const parsed = logSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" },
      { status: 400 }
    );
  }

  const { exerciseId, weightKg, reps, note, loggedAt } = parsed.data;

  const exercise = await db.query.exercises.findFirst({
    where: (e, { and, eq }) => and(eq(e.id, exerciseId), eq(e.userId, user.id)),
  });
  if (!exercise) {
    return NextResponse.json({ error: "التمرين غير موجود" }, { status: 404 });
  }

  const prevMax = await previousMaxWeight(exerciseId);
  const isNewPR = weightKg > prevMax;

  const [created] = await db
    .insert(prLogs)
    .values({ userId: user.id, exerciseId, weightKg, reps, note: note ?? null, loggedAt })
    .returning();

  return NextResponse.json({ log: created, isNewPR }, { status: 201 });
}
