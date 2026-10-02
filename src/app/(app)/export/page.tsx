import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getExportRows } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ExportPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const rows = await getExportRows(user.id);

  return (
    <main className="space-y-6 px-4 pt-6">
      <header>
        <h1 className="text-2xl font-extrabold">تصدير البيانات</h1>
        <p className="mt-1 text-sm text-slate-400">
          حمّل جميع سجلاتك وأرقامك القياسية كملف CSV — بياناتك ملكك وحدك.
        </p>
      </header>

      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-neon-cyan/15">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-neon-cyan">
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              <path d="M10 13h4" /><path d="M10 17h4" /><path d="M10 9h1" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="font-bold text-white">ملف CSV شامل</div>
            <div className="text-sm text-slate-400">
              {rows.length} سجل · يتضمن التمارين والتصنيفات والأوزان والتكرارات والملاحظات والتواريخ
            </div>
          </div>
        </div>

        <a href="/api/export" className="btn-primary mt-5 w-full" download>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="15" y2="3" />
          </svg>
          تحميل الملف الآن
        </a>

        <p className="mt-3 text-center text-xs text-slate-500">
          يفتح مباشرة في Excel وGoogle Sheets مع دعم كامل للعربية (UTF-8)
        </p>
      </div>

      {/* Preview of the most recent entries */}
      {rows.length > 0 && (
        <div className="card p-5">
          <h2 className="mb-3 font-bold text-slate-200">معاينة — آخر السجلات</h2>
          <div className="space-y-2">
            {rows.slice(-5).reverse().map((r, i) => (
              <div key={i} className="flex items-center justify-between gap-3 rounded-xl bg-vault-800/50 px-3 py-2.5 text-sm">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-slate-200">{r.exercise}</div>
                  <div className="text-xs text-slate-500">
                    {r.category ?? "بدون تصنيف"} · {new Date(r.loggedAt).toLocaleDateString("ar", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
                <div className="shrink-0 font-black text-neon-green" dir="ltr">
                  {r.weightKg} كجم
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
