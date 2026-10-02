import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a weight value: trims trailing .0, keeps up to 1 decimal. */
export function formatWeight(kg: number): string {
  return Number.isInteger(kg) ? String(kg) : kg.toFixed(1);
}

/** Format a date for display in Arabic locale. */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ar", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** Format a date as YYYY-MM-DD for <input type="date">. */
export function toDateInputValue(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Today's date as YYYY-MM-DD in local time. */
export function todayInputValue(): string {
  return toDateInputValue(new Date());
}

/** ISO week key like "2026-W40" for streak calculations. */
export function isoWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

/** Count consecutive weeks (ending at the current week) that appear in the set. */
export function consecutiveWeeksStreak(weekKeys: Set<string>): number {
  let streak = 0;
  const cursor = new Date();
  // Walk back week by week; allow the current week to be empty without breaking the streak.
  for (let i = 0; i < 52; i++) {
    const key = isoWeekKey(cursor);
    if (weekKeys.has(key)) {
      streak++;
    } else if (i > 0) {
      break;
    }
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

/** Deterministic pick from an array (used for the featured exercise). */
export function pickRandom<T>(arr: T[], seed: number): T {
  if (arr.length === 0) throw new Error("pickRandom: empty array");
  return arr[Math.abs(seed) % arr.length];
}

/** Motivational sentences keyed by recent-PR count. */
export function motivationalSentence(recentPrs: number, streakWeeks: number): string {
  if (recentPrs >= 3) return `حطمتَ ${recentPrs} أرقام قياسية مؤخراً — أنت في أفضل حالاتك!`;
  if (recentPrs === 2) return "رقمان قياسيان جديدان — الزخم معك، واصل!";
  if (recentPrs === 1) return "رقم قياسي جديد في جعبتك — كل تريب يقربك من القمة.";
  if (streakWeeks >= 4) return `${streakWeeks} أسابيع متواصلة من التدريب — الانضباط هو قوتك.`;
  if (streakWeeks >= 2) return `${streakWeeks} أسابيع نشطة — الاستمرارية تصنع الأبطال.`;
  return "كل رقم قياسي يبدأ بخطوة — سجّل تمرينك اليوم.";
}
