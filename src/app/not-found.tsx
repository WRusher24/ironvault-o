import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="text-6xl font-black text-neon-green" dir="ltr">404</div>
      <h1 className="text-xl font-extrabold">الصفحة غير موجودة</h1>
      <p className="text-sm text-slate-400">يبدو أنك وصلت إلى رابط غير صحيح</p>
      <Link href="/dashboard" className="btn-primary">
        العودة للرئيسية
      </Link>
    </div>
  );
}
