/**
 * IronVault seed script.
 * Creates the initial admin account and populates a realistic starter vault.
 *
 * Usage:
 *   1. Copy .env.example to .env.local and fill in DATABASE_URL + AUTH_SECRET
 *   2. Run: npm run db:push   (creates tables)
 *   3. Run: npm run db:seed   (inserts admin + starter data)
 *
 * Admin credentials:
 *   Email:    admin@ironvault.app
 *   Password: IronVault#2024
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";
import { scryptSync, randomBytes } from "crypto";
import { users, categories, exercises, prLogs } from "./schema";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  const email = "admin@ironvault.app";
  const existing = await db.select().from(users).where(sql`${users.email} = ${email}`).limit(1);
  if (existing.length > 0) {
    console.log("Seed already applied — admin account exists. Skipping.");
    await pool.end();
    return;
  }

  console.log("Seeding IronVault...");

  const [admin] = await db
    .insert(users)
    .values({
      name: "مدير آيرون فالت",
      email,
      phone: "+966500000000",
      passwordHash: hashPassword("IronVault#2024"),
    })
    .returning();

  const categoryDefs = [
    { name: "الصدر", nameEn: "Chest", color: "#22c55e", icon: "chest" },
    { name: "الظهر", nameEn: "Back", color: "#06b6d4", icon: "back" },
    { name: "الأكتاف", nameEn: "Shoulders", color: "#f59e0b", icon: "shoulders" },
    { name: "الأذرع", nameEn: "Arms", color: "#ec4899", icon: "arms" },
    { name: "الأرجل", nameEn: "Legs", color: "#8b5cf6", icon: "legs" },
    { name: "الجذع", nameEn: "Core", color: "#ef4444", icon: "core" },
  ];

  const insertedCategories = await db
    .insert(categories)
    .values(categoryDefs.map((c, i) => ({ ...c, userId: admin.id, sortOrder: i })))
    .returning();

  const catMap = new Map(insertedCategories.map((c) => [c.nameEn!, c.id]));

  // [name, nameEn, category, imageUrl, notes, progression]
  // progression: [monthsAgo, weightKg, reps, note?][]
  const exerciseDefs: Array<{
    name: string;
    nameEn: string;
    cat: string;
    notes: string;
    progression: Array<[number, number, number, string?]>;
  }> = [
    {
      name: "سحب عريض بالبار",
      nameEn: "Wide Lat Pulldown",
      cat: "Back",
      notes: "قبضة عريضة، سحب خلف الرقبة",
      progression: [
        [6, 40, 10],
        [5, 45, 10],
        [4, 50, 8],
        [3, 55, 8],
        [2, 60, 8],
        [1, 65, 6],
        [0, 70, 6, "بار + 20 كجم"],
      ],
    },
    {
      name: "تجديف بالكابل",
      nameEn: "Seated Cable Row",
      cat: "Back",
      notes: "قبضة V، شد للبطن",
      progression: [
        [5, 35, 12],
        [4, 40, 10],
        [3, 45, 10],
        [2, 50, 8],
        [1, 55, 8],
        [0, 60, 8, "Inside Hammers"],
      ],
    },
    {
      name: "ضغط الأكتاف",
      nameEn: "Shoulder Press",
      cat: "Shoulders",
      notes: "بار أمامي من الوقوف",
      progression: [
        [6, 30, 10],
        [5, 35, 8],
        [4, 40, 8],
        [3, 45, 6],
        [2, 50, 6],
        [1, 55, 5],
        [0, 60, 5, "بار + 10 كجم"],
      ],
    },
    {
      name: "ضغط الصدر بالبار",
      nameEn: "Barbell Bench Press",
      cat: "Chest",
      notes: "مستوي، قبضة متوسطة",
      progression: [
        [7, 50, 10],
        [6, 55, 8],
        [5, 60, 8],
        [4, 65, 6],
        [3, 70, 6],
        [2, 75, 5],
        [1, 80, 5],
        [0, 85, 3, "بار + 15 كجم"],
      ],
    },
    {
      name: "تفتيح الأكتاف الجانبي",
      nameEn: "Lateral Raise",
      cat: "Shoulders",
      notes: "دمبل خفيف، تحكم كامل",
      progression: [
        [4, 6, 15],
        [3, 8, 12],
        [2, 10, 12],
        [1, 12, 10],
        [0, 14, 10],
      ],
    },
    {
      name: "تجديف بالدمبل",
      nameEn: "Dumbbell Row",
      cat: "Back",
      notes: "ذراع واحدة على المقعد",
      progression: [
        [5, 20, 10],
        [4, 22, 10],
        [3, 24, 8],
        [2, 26, 8],
        [1, 28, 8],
        [0, 30, 8],
      ],
    },
    {
      name: "curl بالبار",
      nameEn: "Barbell Curl",
      cat: "Arms",
      notes: "قبضة متوسطة، بدون تأرجح",
      progression: [
        [5, 20, 12],
        [4, 25, 10],
        [3, 30, 8],
        [2, 35, 8],
        [1, 40, 6],
        [0, 45, 6],
      ],
    },
    {
      name: "ضغط الترايسبس بالكابل",
      nameEn: "Tricep Pushdown",
      cat: "Arms",
      notes: "حبل، كوع ثابت",
      progression: [
        [4, 20, 12],
        [3, 25, 12],
        [2, 30, 10],
        [1, 35, 10],
        [0, 40, 8],
      ],
    },
    {
      name: "سكوات بالبار",
      nameEn: "Barbell Squat",
      cat: "Legs",
      notes: "سكوات خلفي، عميق",
      progression: [
        [8, 60, 10],
        [7, 70, 8],
        [6, 80, 8],
        [5, 90, 6],
        [4, 100, 6],
        [3, 110, 5],
        [2, 120, 5],
        [1, 130, 3],
        [0, 140, 3, "بار + 20 كجم"],
      ],
    },
    {
      name: "رفعة رومانية",
      nameEn: "Romanian Deadlift",
      cat: "Legs",
      notes: "أرجل شبه مستقيمة، شد أوتار الركبة",
      progression: [
        [5, 50, 10],
        [4, 60, 10],
        [3, 70, 8],
        [2, 80, 8],
        [1, 90, 6],
        [0, 100, 6],
      ],
    },
    {
      name: "ضغط الأرجل",
      nameEn: "Leg Press",
      cat: "Legs",
      notes: "قدم متوسطة، نزول عميق",
      progression: [
        [6, 120, 12],
        [5, 140, 10],
        [4, 160, 10],
        [3, 180, 8],
        [2, 200, 8],
        [1, 220, 6],
        [0, 240, 6],
      ],
    },
    {
      name: "كرانش",
      nameEn: "Crunch",
      cat: "Core",
      notes: "على السجادة، بطيء",
      progression: [
        [3, 0, 20],
        [2, 0, 25],
        [1, 0, 30],
        [0, 0, 35],
      ],
    },
  ];

  const now = new Date();

  for (const def of exerciseDefs) {
    const [exercise] = await db
      .insert(exercises)
      .values({
        userId: admin.id,
        categoryId: catMap.get(def.cat) ?? null,
        name: def.name,
        nameEn: def.nameEn,
        notes: def.notes,
      })
      .returning();

    const logs = def.progression.map(([monthsAgo, weightKg, reps, note]) => {
      const d = new Date(now);
      d.setMonth(d.getMonth() - monthsAgo);
      d.setDate(d.getDate() - Math.floor(Math.random() * 3));
      return {
        userId: admin.id,
        exerciseId: exercise.id,
        weightKg,
        reps,
        note: note ?? null,
        loggedAt: d,
      };
    });

    await db.insert(prLogs).values(logs);
  }

  console.log("Seed complete.");
  console.log("  Admin email:    admin@ironvault.app");
  console.log("  Admin password: IronVault#2024");
  console.log(`  Categories:     ${insertedCategories.length}`);
  console.log(`  Exercises:      ${exerciseDefs.length}`);
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
