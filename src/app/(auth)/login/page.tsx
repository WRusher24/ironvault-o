"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "حدث خطأ غير متوقع");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم — حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-6 sm:p-8 animate-slide-up">
      <div className="flex justify-center mb-6">
        <Logo size="sm" />
      </div>
      <h1 className="text-2xl font-extrabold text-center mb-1">تسجيل الدخول</h1>
      <p className="text-slate-400 text-sm text-center mb-6">
        أدخل بريدك الإلكتروني أو رقم جوالك
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="identifier" className="label">البريد الإلكتروني أو رقم الجوال</label>
          <input
            id="identifier"
            type="text"
            dir="ltr"
            className="input text-left"
            placeholder="you@example.com أو 05xxxxxxxx"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
        <div>
          <label htmlFor="password" className="label">كلمة المرور</label>
          <input
            id="password"
            type="password"
            dir="ltr"
            className="input text-left"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "جارٍ تسجيل الدخول..." : "دخول"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        ليس لديك حساب؟{" "}
        <Link href="/register" className="text-neon-green font-bold hover:underline">
          أنشئ حسابك مجاناً
        </Link>
      </p>
    </div>
  );
}
