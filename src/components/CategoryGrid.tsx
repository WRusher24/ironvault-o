import Link from "next/link";
import { formatWeight } from "@/lib/utils";
import type { DashboardData } from "@/lib/queries";

const ICONS: Record<string, React.ReactNode> = {
  dumbbell: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M6.5 6.5 17.5 17.5" /><path d="m21 21-1-1" /><path d="m3 3 1 1" />
      <path d="m18 22 4-4" /><path d="m2 6 4-4" /><path d="m3 10 7-7" /><path d="m14 21 7-7" />
    </svg>
  ),
  chest: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M4 10v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" /><path d="M2 12h2" /><path d="M20 12h2" />
      <path d="M9 8h6" /><path d="M9 16h6" />
    </svg>
  ),
  back: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M12 3v18" /><path d="m7 8 5-5 5 5" /><path d="m7 16 5 5 5-5" />
    </svg>
  ),
  shoulders: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <circle cx="6" cy="7" r="3" /><circle cx="18" cy="7" r="3" /><path d="M6 10v5a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4v-5" />
    </svg>
  ),
  arms: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M7 11V7a5 5 0 0 1 10 0v4" /><path d="M4 11a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6v-3z" />
    </svg>
  ),
  legs: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M7 4v8l3 8" /><path d="M17 4v8l-3 8" /><path d="M7 8h10" />
    </svg>
  ),
  core: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" />
    </svg>
  ),
};

export function CategoryGrid({ categories }: { categories: DashboardData["categories"] }) {
  if (categories.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-lg font-extrabold text-slate-200">مجموعات العضلات</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/dashboard?q=${encodeURIComponent(cat.name)}`}
            className="card group p-4 transition-all hover:border-vault-700 hover:bg-vault-900 active:scale-[0.98]"
          >
            <div
              className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
              style={{ backgroundColor: `${cat.color}1f`, color: cat.color }}
            >
              {ICONS[cat.icon] ?? ICONS.dumbbell}
            </div>
            <div className="font-bold text-white">{cat.name}</div>
            {cat.nameEn && (
              <div className="text-xs text-slate-500" dir="ltr">{cat.nameEn}</div>
            )}
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-400">{cat.exerciseCount} تمرين</span>
              {cat.latestPr !== null && (
                <span className="font-bold" style={{ color: cat.color }} dir="ltr">
                  {formatWeight(cat.latestPr)} كجم
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
