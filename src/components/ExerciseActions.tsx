"use client";

import { useState } from "react";
import { useLogDialog } from "@/components/LogPRDialog";
import { ExerciseFormModal } from "@/components/ExerciseFormModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { Exercise } from "@/db/schema";

export function LogForExercise({ exerciseId, exerciseName }: { exerciseId: string; exerciseName: string }) {
  const { openCreate } = useLogDialog();
  return (
    <button onClick={() => openCreate(exerciseId)} className="btn-primary w-full">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="h-5 w-5">
        <path d="M5 12h14" /><path d="M12 5v14" />
      </svg>
      تسجيل رقم قياسي — {exerciseName}
    </button>
  );
}

export function ExerciseActions({ exercise }: { exercise: Exercise }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/exercises/${exercise.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "تعذر الحذف");
        return;
      }
      window.location.href = "/dashboard";
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="flex shrink-0 gap-1">
        <button
          onClick={() => setEditOpen(true)}
          className="rounded-lg p-2.5 text-slate-400 hover:bg-vault-800 hover:text-neon-cyan transition-colors"
          aria-label="تعديل التمرين"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          </svg>
        </button>
        <button
          onClick={() => { setDeleteOpen(true); setError(null); }}
          className="rounded-lg p-2.5 text-slate-400 hover:bg-vault-800 hover:text-red-400 transition-colors"
          aria-label="حذف التمرين"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>

      <ExerciseFormModal open={editOpen} onClose={() => setEditOpen(false)} exercise={exercise} />

      <ConfirmDialog
        open={deleteOpen}
        title="حذف التمرين"
        message={`سيتم حذف "${exercise.name}" وجميع سجلاته. لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="حذف نهائي"
        danger
        onConfirm={onDelete}
        onCancel={() => setDeleteOpen(false)}
      />
      {error && (
        <div className="fixed bottom-24 inset-x-0 z-[70] flex justify-center px-4">
          <div className="rounded-xl border border-red-500/40 bg-red-950/90 px-4 py-3 text-sm text-red-300 animate-slide-up">
            {error}
          </div>
        </div>
      )}
    </>
  );
}
