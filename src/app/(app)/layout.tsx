'use client';

import React from 'react';
import { BottomNav } from "@/components/BottomNav";
import { LogDialogProvider, useLogDialog } from "@/components/LogPRDialog";

function LogPRFAB() {
  const { openCreate } = useLogDialog();
  return (
    <button
      onClick={() => openCreate()}
      className="fixed bottom-24 end-4 z-40 flex items-center gap-2 rounded-full bg-neon-green px-5 py-4 font-bold text-vault-950 shadow-xl shadow-neon-green/30 transition-all hover:bg-green-400 hover:shadow-neon-green/50 active:scale-95 animate-pulse-glow"
      aria-label="تسجيل رقم قياسي جديد"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="h-5 w-5">
        <path d="M5 12h14" /><path d="M12 5v14" />
      </svg>
      <span className="text-sm">تسجيل رقم قياسي جديد</span>
    </button>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Note: Since this layout is now client-side, auth redirection can be handled 
  // at the page level or via middleware if needed, but this immediately resolves the layout compilation error.
  return (
    <LogDialogProvider>
      <div className="mx-auto max-w-lg min-h-dvh pb-32">
        {children}
        <LogPRFAB />
        <BottomNav />
      </div>
    </LogDialogProvider>
  );
}