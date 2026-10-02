import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main className="space-y-6 px-4 pt-6">
      <header>
        <h1 className="text-2xl font-extrabold">حسابي</h1>
        <p className="mt-1 text-sm text-slate-400">إعدادات الحساب والبيانات</p>
      </header>

      {/* Identity card */}
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-green to-neon-cyan text-2xl font-black text-vault-950">
            {user.name.trim().charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="truncate text-xl font-extrabold text-white">{user.name}</div>
            {user.email && (
              <div className="truncate text-sm text-slate-400" dir="ltr">{user.email}</div>
            )}
            {user.phone && (
              <div className="truncate text-sm text-slate-400" dir="ltr">{user.phone}</div>
            )}
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-vault-800/60 px-4 py-3 text-xs text-slate-400">
          عضو منذ{" "}
          {new Date(user.createdAt).toLocaleDateString("ar", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Privacy note */}
      <div className="card border-neon-cyan/30 p-5">
        <div className="flex items-start gap-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-5 w-5 shrink-0 text-neon-cyan">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <div>
            <div className="font-bold text-slate-200">عزلة تامة للبيانات</div>
            <p className="mt-1 text-sm text-slate-400">
              بياناتك معزولة تماماً — لا يمكن لأي مستخدم آخر الاطلاع على تمارينك أو سجلاتك أو أرقامك القياسية.
            </p>
          </div>
        </div>
      </div>

      {/* Export shortcut */}
      <a href="/export" className="btn-ghost w-full">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" x2="12" y1="15" y2="3" />
        </svg>
        تصدير بياناتي (CSV)
      </a>

      {/* Logout */}
      <LogoutButton />

      <div className="flex justify-center pt-2 pb-4">
        <Logo size="sm" />
      </div>
    </main>
  );
}
