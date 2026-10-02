import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getExerciseDetail } from "@/lib/queries";
import { ProgressChart } from "@/components/ProgressChart";
import { Timeline } from "@/components/Timeline";
import { ExerciseActions, LogForExercise } from "@/components/ExerciseActions";
import { formatWeight } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ExerciseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const data = await getExerciseDetail(user.id, id);
  if (!data) notFound();

  const { exercise, logs, prLogIds, currentPr } = data;

  return (
    <main className="space-y-6 px-4 pt-6">
      {/* Header */}
      <div className="card overflow-hidden">
        {exercise.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={exercise.imageUrl} alt={exercise.name} className="h-44 w-full object-cover" />
        )}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold text-white">{exercise.name}</h1>
              {exercise.nameEn && (
                <p className="text-sm text-slate-500" dir="ltr">{exercise.nameEn}</p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {exercise.categoryName && (
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-bold"
                    style={{ backgroundColor: `${exercise.categoryColor}1f`, color: exercise.categoryColor ?? "#22c55e" }}
                  >
                    {exercise.categoryName}
                  </span>
                )}
                <span className="rounded-full bg-vault-800 px-2.5 py-1 text-xs font-semibold text-slate-400">
                  {logs.length} سجل
                </span>
              </div>
            </div>
            <ExerciseActions exercise={exercise} />
          </div>

          {exercise.notes && (
            <p className="mt-3 rounded-xl bg-vault-800/60 px-4 py-3 text-sm text-slate-300">
              {exercise.notes}
            </p>
          )}

          {currentPr && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-neon-gold/30 bg-neon-gold/10 px-4 py-3">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-neon-gold shrink-0">
                <path d="M12 2l2.9 6.26 6.6.56-5 4.36 1.5 6.45L12 16.9 5.99 19.63l1.5-6.45-5-4.36 6.6-.56L12 2z" />
              </svg>
              <div>
                <div className="text-xs font-semibold text-slate-400">أفضل رقم قياسي حالي</div>
                <div className="text-lg font-black text-neon-gold" dir="ltr">
                  {formatWeight(currentPr.weightKg)} كجم
                  <span className="text-xs text-slate-400 font-bold"> × {currentPr.reps} تكرار</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick log button */}
      <LogForExercise exerciseId={exercise.id} exerciseName={exercise.name} />

      {/* Progress chart */}
      <ProgressChart logs={logs} prLogIds={prLogIds} />

      {/* Timeline */}
      <Timeline logs={logs} prLogIds={prLogIds} />
    </main>
  );
}


