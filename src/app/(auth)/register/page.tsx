"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const contactFilled = email.trim() !== "" || phone.trim() !== "";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!contactFilled) {
      setError("أدخل بريداً إلكترونياً أو رقم جوال واحد على الأقل");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          password,
        }),
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
      <h1 className="text-2xl font-extrabold text-center mb-1">إنشاء حساب جديد</h1>
      <p className="text-slate-400 text-sm text-center mb-6">
        وصول فوري — بدون انتظار موافقة
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="label">الاسم</label>
          <input
            id="name"
            type="text"
            className="input"
            placeholder="اسمك أو لقبك في الجيم"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            maxLength={80}
          />
        </div>
        <div>
          <label htmlFor="email" className="label">البريد الإلكتروني (اختياري)</label>
          <input
            id="email"
            type="email"
            dir="ltr"
            className="input text-left"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="phone" className="label">رقم الجوال (اختياري)</label>
          <input
            id="phone"
            type="tel"
            dir="ltr"
            className="input text-left"
            placeholder="05xxxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
        </div>
        <div>
          <label htmlFor="password" className="label">كلمة المرور</label>
          <input
            id="password"
            type="password"
            dir="ltr"
            className="input text-left"
            placeholder="8 أحرف على الأقل"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            maxLength={100}
            autoComplete="new-password"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "جارٍ إنشاء الحساب..." : "إنشاء الحساب والبدء"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        لديك حساب بالفعل؟{" "}
        <Link href="/login" className="text-neon-green font-bold hover:underline">
          سجّل دخولك
        </Link>
      </p>
    </div>
  );
}
