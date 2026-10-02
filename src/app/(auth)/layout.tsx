import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Logo } from "@/components/Logo";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8 animate-fade-in">
          <Logo size="lg" />
          <p className="mt-3 text-slate-400 text-sm text-center">
            خزنتك الخاصة لتتبع الأرقام القياسية في رفع الأثقال
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
