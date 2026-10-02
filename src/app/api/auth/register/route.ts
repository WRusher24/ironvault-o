import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { hashPassword, setSessionToken } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "جسم الطلب غير صالح" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" },
      { status: 400 }
    );
  }

  const { name, email, phone, password } = parsed.data;

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(or(email ? eq(users.email, email) : undefined, phone ? eq(users.phone, phone) : undefined))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json(
      { error: "البريد الإلكتروني أو رقم الجوال مسجل مسبقاً" },
      { status: 409 }
    );
  }

  const [user] = await db
    .insert(users)
    .values({
      name,
      email: email ?? null,
      phone: phone ?? null,
      passwordHash: hashPassword(password),
    })
    .returning({ id: users.id });

  await setSessionToken(user.id);
  return NextResponse.json({ ok: true, userId: user.id });
}
