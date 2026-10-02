import { db } from "@/db";
import { categories, exercises, prLogs, type Category, type Exercise, type PrLog } from "@/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { consecutiveWeeksStreak, isoWeekKey, pickRandom } from "./utils";

export interface DashboardData {
  user: { id: string; name: string; email: string | null; phone: string | null };
  totalPrs: number;
  streakWeeks: number;
  recentPrs: number;
  featured: { exercise: Exercise; weightKg: number; reps: number } | null;
  categories: Array<Category & { exerciseCount: number; latestPr: number | null }>;
  exercises: Array<Exercise & { categoryName: string | null; categoryColor: string | null; prWeight: number | null; prReps: number | null; logCount: number }>;
}

export async function getDashboardData(userId: string, search: string): Promise<DashboardData> {
  const userRows = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, userId),
    columns: { id: true, name: true, email: true, phone: true },
  });
  if (!userRows) throw new Error("User not found");

  const allLogs = await db.select().from(prLogs).where(eq(prLogs.userId, userId));

  // Total PRs = number of logs that broke the previous max for their exercise.
  const byExercise = new Map<string, PrLog[]>();
  for (const log of allLogs) {
    const list = byExercise.get(log.exerciseId) ?? [];
    list.push(log);
    byExercise.set(log.exerciseId, list);
  }
  let totalPrs = 0;
  const weekKeys = new Set<string>();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  let recentPrs = 0;

  for (const list of byExercise.values()) {
    const sorted = [...list].sort((a, b) => a.loggedAt.getTime() - b.loggedAt.getTime());
    let max = -Infinity;
    for (const log of sorted) {
      weekKeys.add(isoWeekKey(log.loggedAt));
      if (log.weightKg > max) {
        totalPrs++;
        max = log.weightKg;
        if (log.loggedAt >= sevenDaysAgo) recentPrs++;
      }
    }
  }

  const streakWeeks = consecutiveWeeksStreak(weekKeys);

  // Featured exercise: random one that has at least one PR.
  const prExercises = [...byExercise.entries()]
    .filter(([, list]) => list.length > 0)
    .map(([exerciseId, list]) => {
      const best = list.reduce((a, b) => (b.weightKg > a.weightKg ? b : a));
      return { exerciseId, weightKg: best.weightKg, reps: best.reps };
    });
  const featuredPick = prExercises.length > 0 ? pickRandom(prExercises, Date.now()) : null;
  let featured: DashboardData["featured"] = null;
  if (featuredPick) {
    const ex = await db.query.exercises.findFirst({ where: (e, { eq }) => eq(e.id, featuredPick.exerciseId) });
    if (ex) featured = { exercise: ex, weightKg: featuredPick.weightKg, reps: featuredPick.reps };
  }

  const q = search.trim();
  const allCategories = await db.select().from(categories).where(eq(categories.userId, userId));
  const allExercises = await db.select().from(exercises).where(eq(exercises.userId, userId));

  const exerciseCountByCat = new Map<string, number>();
  for (const ex of allExercises) {
    if (ex.categoryId) {
      exerciseCountByCat.set(ex.categoryId, (exerciseCountByCat.get(ex.categoryId) ?? 0) + 1);
    }
  }

  const latestPrByCat = new Map<string, number>();
  for (const [exerciseId, list] of byExercise) {
    const ex = allExercises.find((e) => e.id === exerciseId);
    if (!ex?.categoryId) continue;
    const best = list.reduce((a, b) => (b.weightKg > a.weightKg ? b : a));
    const prev = latestPrByCat.get(ex.categoryId);
    if (prev === undefined || best.weightKg > prev) latestPrByCat.set(ex.categoryId, best.weightKg);
  }

  const categoriesWithMeta = allCategories
    .map((c) => ({
      ...c,
      exerciseCount: exerciseCountByCat.get(c.id) ?? 0,
      latestPr: latestPrByCat.get(c.id) ?? null,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const catById = new Map(allCategories.map((c) => [c.id, c]));
  const exercisesWithMeta = allExercises
    .map((ex) => {
      const list = byExercise.get(ex.id) ?? [];
      const best = list.length > 0 ? list.reduce((a, b) => (b.weightKg > a.weightKg ? b : a)) : null;
      const cat = ex.categoryId ? catById.get(ex.categoryId) : undefined;
      return {
        ...ex,
        categoryName: cat?.name ?? null,
        categoryColor: cat?.color ?? null,
        prWeight: best?.weightKg ?? null,
        prReps: best?.reps ?? null,
        logCount: list.length,
      };
    })
    .filter((ex) => {
      if (!q) return true;
      const hay = `${ex.name} ${ex.nameEn ?? ""} ${ex.categoryName ?? ""}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    })
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  return {
    user: userRows,
    totalPrs,
    streakWeeks,
    recentPrs,
    featured,
    categories: categoriesWithMeta,
    exercises: exercisesWithMeta,
  };
}

export interface ExerciseDetailData {
  exercise: Exercise & { categoryName: string | null; categoryColor: string | null };
  logs: PrLog[];
  prLogIds: Set<string>;
  currentPr: PrLog | null;
}

export async function getExerciseDetail(userId: string, exerciseId: string): Promise<ExerciseDetailData | null> {
  const exercise = await db.query.exercises.findFirst({
    where: (e, { and, eq }) => and(eq(e.id, exerciseId), eq(e.userId, userId)),
  });
  if (!exercise) return null;

  const catId = exercise.categoryId;
  const cat = catId
    ? await db.query.categories.findFirst({ where: (c, { eq }) => eq(c.id, catId) })
    : null;

  const logs = await db
    .select()
    .from(prLogs)
    .where(and(eq(prLogs.exerciseId, exerciseId), eq(prLogs.userId, userId)))
    .orderBy(prLogs.loggedAt);

  const prLogIds = new Set<string>();
  let max = -Infinity;
  let currentPr: PrLog | null = null;
  for (const log of logs) {
    if (log.weightKg > max) {
      prLogIds.add(log.id);
      max = log.weightKg;
      currentPr = log;
    }
  }

  return {
    exercise: { ...exercise, categoryName: cat?.name ?? null, categoryColor: cat?.color ?? null },
    logs,
    prLogIds,
    currentPr,
  };
}

/** All logs for CSV export, joined with exercise + category names. */
export async function getExportRows(userId: string) {
  const rows = await db
    .select({
      exercise: exercises.name,
      exerciseEn: exercises.nameEn,
      category: categories.name,
      weightKg: prLogs.weightKg,
      reps: prLogs.reps,
      note: prLogs.note,
      loggedAt: prLogs.loggedAt,
    })
    .from(prLogs)
    .innerJoin(exercises, eq(prLogs.exerciseId, exercises.id))
    .leftJoin(categories, eq(exercises.categoryId, categories.id))
    .where(eq(prLogs.userId, userId))
    .orderBy(prLogs.loggedAt);
  return rows;
}

/** Check whether a category has exercises (used to guard deletion). */
export async function categoryHasExercises(categoryId: string): Promise<boolean> {
  const rows = await db
    .select({ id: exercises.id })
    .from(exercises)
    .where(eq(exercises.categoryId, categoryId))
    .limit(1);
  return rows.length > 0;
}

/** Previous max weight for an exercise, excluding a given log id (for PR detection). */
export async function previousMaxWeight(exerciseId: string, excludeLogId?: string): Promise<number> {
  const conditions = [eq(prLogs.exerciseId, exerciseId)];
  if (excludeLogId) conditions.push(sql`${prLogs.id} != ${excludeLogId}`);
  const rows = await db
    .select({ weightKg: prLogs.weightKg })
    .from(prLogs)
    .where(and(...conditions));
  return rows.reduce((m, r) => Math.max(m, r.weightKg), -Infinity);
}
