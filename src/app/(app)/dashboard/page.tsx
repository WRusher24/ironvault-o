import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/queries";
import { DashboardHeader } from "@/components/DashboardHeader";
import { SearchBar } from "@/components/SearchBar";
import { CategoryGrid } from "@/components/CategoryGrid";
import { DashboardActions } from "@/components/DashboardActions";
import Link from "next/link";
import { formatWeight } from "@/lib/utils";
import type { DashboardData } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { q } = await searchParams;
  const data = await getDashboardData(user.id, q ?? "");

  return (
    <main className="space-y-6 px-4 pt-6">
      <DashboardHeader data={data} />

      <SearchBar />

      {/* Category management + add exercise */}
      <DashboardActions />

      <CategoryGrid categories={data.categories} />

      {/* Exercise list */}
      <section>
        <h2 className="mb-3 text-lg font-extrabold text-slate-200">
          {q ? `نتائج البحث (${data.exercises.length})` : "التمارين"}
        </h2>
        {data.exercises.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 p-8 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-slate-600">
              <path d="M6.5 6.5 17.5 17.5" /><path d="m21 21-1-1" /><path d="m3 3 1 1" />
              <path d="m18 22 4-4" /><path d="m2 6 4-4" /><path d="m3 10 7-7" /><path d="m14 21 7-7" />
            </svg>
            <p className="text-sm text-slate-400">
              {q ? "لا توجد تمارين مطابقة لبحثك" : "لم تضف أي تمرين بعد — اضغط زر إضافة تمرين أعلاه"}
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {data.exercises.map((ex) => (
              <ExerciseRow key={ex.id} exercise={ex} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function ExerciseRow({ exercise }: { exercise: DashboardData["exercises"][number] }) {
  return (
    <Link
      href={`/exercises/${exercise.id}`}
      className="card group flex items-center gap-3 p-3.5 transition-all hover:border-vault-700 hover:bg-vault-900 active:scale-[0.99]"
    >
      {exercise.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={exercise.imageUrl}
          alt={exercise.name}
          className="h-14 w-14 shrink-0 rounded-xl object-cover"
        />
      ) : (
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${exercise.categoryColor ?? "#22c55e"}1a`, color: exercise.categoryColor ?? "#22c55e" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
            <path d="M6.5 6.5 17.5 17.5" /><path d="m21 21-1-1" /><path d="m3 3 1 1" />
            <path d="m18 22 4-4" /><path d="m2 6 4-4" /><path d="m3 10 7-7" /><path d="m14 21 7-7" />
          </svg>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate font-bold text-white group-hover:text-neon-green transition-colors">
          {exercise.name}
        </div>
        {exercise.nameEn && (
          <div className="truncate text-xs text-slate-500" dir="ltr">{exercise.nameEn}</div>
        )}
        <div className="mt-0.5 text-xs text-slate-500">
          {exercise.categoryName ?? "بدون تصنيف"} · {exercise.logCount} سجل
        </div>
      </div>
      {exercise.prWeight !== null && (
        <div className="shrink-0 text-end">
          <div className="text-lg font-black text-neon-green" dir="ltr">
            {formatWeight(exercise.prWeight)}
            <span className="text-[10px] text-slate-500 font-bold"> كجم</span>
          </div>
          <div className="text-[10px] font-semibold text-slate-500">أفضل رقم</div>
        </div>
      )}
    </Link>
  );
}


