import { formatWeight, motivationalSentence } from "@/lib/utils";
import type { DashboardData } from "@/lib/queries";

export function DashboardHeader({ data }: { data: DashboardData }) {
  const { totalPrs, streakWeeks, recentPrs, featured } = data;

  return (
    <header className="space-y-4">
      {/* Greeting + motivation */}
      <div className="card p-5 bg-gradient-to-l from-neon-green/10 via-vault-900/80 to-vault-900/80 border-neon-green/20">
        <p className="text-sm text-slate-400">أهلاً بك،</p>
        <h1 className="text-2xl font-extrabold text-white">{data.user.name}</h1>
        <p className="mt-2 text-sm text-neon-green font-semibold">
          {motivationalSentence(recentPrs, streakWeeks)}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <div className="text-3xl font-black text-neon-green" dir="ltr">{totalPrs}</div>
          <div className="mt-1 text-xs font-semibold text-slate-400">رقم قياسي محطم</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-3xl font-black text-neon-cyan" dir="ltr">{streakWeeks}</div>
          <div className="mt-1 text-xs font-semibold text-slate-400">أسابيع متواصلة</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-3xl font-black text-neon-gold" dir="ltr">{recentPrs}</div>
          <div className="mt-1 text-xs font-semibold text-slate-400">أرقام هذا الأسبوع</div>
        </div>
      </div>

      {/* Featured exercise highlight */}
      {featured && (
        <div className="card p-4 flex items-center gap-4 border-neon-gold/30">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neon-gold/15">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-neon-gold">
              <path d="M12 2l2.9 6.26 6.6.56-5 4.36 1.5 6.45L12 16.9 5.99 19.63l1.5-6.45-5-4.36 6.6-.56L12 2z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-slate-400">تمرين مميز</div>
            <div className="truncate font-bold text-white">{featured.exercise.name}</div>
          </div>
          <div className="text-end shrink-0">
            <div className="text-xl font-black text-neon-gold" dir="ltr">
              {formatWeight(featured.weightKg)}
              <span className="text-xs text-slate-400 font-bold"> كجم</span>
            </div>
            <div className="text-xs text-slate-400">{featured.reps} تكرار</div>
          </div>
        </div>
      )}
    </header>
  );
}
