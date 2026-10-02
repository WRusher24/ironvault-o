"use client";

import { useState } from "react";
import { formatDate, formatWeight } from "@/lib/utils";
import type { PrLog } from "@/db/schema";
import { useLogDialog } from "./LogPRDialog";
import { ConfirmDialog } from "./ConfirmDialog";

interface TimelineProps {
  logs: PrLog[];
  prLogIds: Set<string>;
}

export function Timeline({ logs, prLogIds }: TimelineProps) {
  const { openEdit } = useLogDialog();
  const [deleteTarget, setDeleteTarget] = useState<PrLog | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function onDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/logs/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setDeleteError(data.error ?? "تعذر الحذف");
        return;
      }
      setDeleteTarget(null);
      window.location.reload();
    } catch {
      setDeleteError("تعذر الاتصال بالخادم");
    } finally {
      setDeleting(false);
    }
  }

  if (logs.length === 0) {
    return (
      <div className="card flex h-32 items-center justify-center p-6 text-sm text-slate-500">
        لا توجد سجلات بعد — سجّل أول رقم قياسي لهذا التمرين
      </div>
    );
  }

  // Newest first for the timeline.
  const sorted = [...logs].sort((a, b) => b.loggedAt.getTime() - a.loggedAt.getTime());

  return (
    <div>
      <h3 className="mb-3 text-lg font-extrabold text-slate-200">السجل الزمني</h3>
      <ol className="relative space-y-3 border-s-2 border-vault-700/60 ps-5">
        {sorted.map((log) => {
          const isPr = prLogIds.has(log.id);
          return (
            <li key={log.id} className="relative">
              {/* Node */}
              <span
                className={`absolute -start-[27px] top-4 h-3.5 w-3.5 rounded-full border-2 ${
                  isPr
                    ? "border-neon-green bg-neon-green shadow-[0_0_10px_rgba(34,197,94,0.6)]"
                    : "border-vault-700 bg-vault-800"
                }`}
              />
              <div className={`card p-4 ${isPr ? "border-neon-green/40" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xl font-black text-white" dir="ltr">
                        {formatWeight(log.weightKg)}
                        <span className="text-xs text-slate-400 font-bold"> كجم</span>
                      </span>
                      <span className="text-sm text-slate-400">× {log.reps} تكرار</span>
                      {isPr && (
                        <span className="rounded-full bg-neon-green/15 px-2 py-0.5 text-[11px] font-black text-neon-green">
                          رقم قياسي
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{formatDate(log.loggedAt)}</div>
                    {log.note && (
                      <div className="mt-2 rounded-lg bg-vault-800/60 px-3 py-2 text-sm text-slate-300">
                        {log.note}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => openEdit(log)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-vault-800 hover:text-neon-cyan transition-colors"
                      aria-label="تعديل السجل"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => { setDeleteTarget(log); setDeleteError(null); }}
                      className="rounded-lg p-2 text-slate-400 hover:bg-vault-800 hover:text-red-400 transition-colors"
                      aria-label="حذف السجل"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="حذف السجل"
        message={`هل أنت متأكد من حذف سجل ${deleteTarget ? formatWeight(deleteTarget.weightKg) : ""} كجم؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="حذف"
        danger
        onConfirm={onDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      {deleteError && (
        <div className="fixed bottom-24 inset-x-0 z-[70] flex justify-center px-4">
          <div className="rounded-xl border border-red-500/40 bg-red-950/90 px-4 py-3 text-sm text-red-300 animate-slide-up">
            {deleteError}
          </div>
        </div>
      )}
    </div>
  );
}
