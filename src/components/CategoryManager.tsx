"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Category } from "@/db/schema";
import { ConfirmDialog } from "./ConfirmDialog";

const COLOR_PRESETS = ["#22c55e", "#06b6d4", "#f59e0b", "#ec4899", "#8b5cf6", "#ef4444", "#14b8a6", "#f97316"];
const ICON_PRESETS = ["dumbbell", "chest", "back", "shoulders", "arms", "legs", "core"];

export function CategoryManager({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [color, setColor] = useState(COLOR_PRESETS[0]);
  const [icon, setIcon] = useState("dumbbell");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/categories");
    if (res.ok) {
      const d = await res.json();
      setCategories(d.categories ?? []);
    }
  }

  useEffect(() => {
    if (open) {
      load();
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function resetForm() {
    setName("");
    setNameEn("");
    setColor(COLOR_PRESETS[0]);
    setIcon("dumbbell");
    setError(null);
    setEditingId(null);
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setName(cat.name);
    setNameEn(cat.nameEn ?? "");
    setColor(cat.color);
    setIcon(cat.icon);
    setError(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(editingId ? `/api/categories/${editingId}` : "/api/categories", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), nameEn: nameEn.trim(), color, icon }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "حدث خطأ غير متوقع");
        return;
      }
      resetForm();
      await load();
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete() {
    if (!deleteTarget) return;
    setDeleteError(null);
    const res = await fetch(`/api/categories/${deleteTarget.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setDeleteError(data.error ?? "تعذر الحذف");
      setDeleteTarget(null);
      return;
    }
    setDeleteTarget(null);
    await load();
    router.refresh();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative card w-full max-w-md max-h-[92dvh] overflow-y-auto rounded-b-none sm:rounded-b-2xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-extrabold">إدارة التصنيفات</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-vault-800 hover:text-slate-200 transition-colors" aria-label="إغلاق">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-5 w-5">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Existing categories */}
        <div className="space-y-2 mb-6">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3 rounded-xl border border-vault-700/50 bg-vault-800/40 px-3 py-2.5">
              <span className="h-3.5 w-3.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-slate-100">{cat.name}</div>
                {cat.nameEn && <div className="truncate text-xs text-slate-500" dir="ltr">{cat.nameEn}</div>}
              </div>
              <button
                onClick={() => startEdit(cat)}
                className="rounded-lg p-2 text-slate-400 hover:bg-vault-700 hover:text-neon-cyan transition-colors"
                aria-label="تعديل"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                </svg>
              </button>
              <button
                onClick={() => { setDeleteTarget(cat); setDeleteError(null); }}
                className="rounded-lg p-2 text-slate-400 hover:bg-vault-700 hover:text-red-400 transition-colors"
                aria-label="حذف"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="py-4 text-center text-sm text-slate-500">لا توجد تصنيفات بعد</p>
          )}
        </div>

        {/* Add / edit form */}
        <form onSubmit={onSubmit} className="space-y-4 border-t border-vault-700/50 pt-4">
          <h3 className="font-bold text-slate-200">{editingId ? "تعديل التصنيف" : "تصنيف جديد"}</h3>
          <div>
            <label className="label">اسم التصنيف (عربي)</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} placeholder="مثال: الجذع" />
          </div>
          <div>
            <label className="label">الاسم الإنجليزي (اختياري)</label>
            <input className="input text-left" dir="ltr" value={nameEn} onChange={(e) => setNameEn(e.target.value)} maxLength={60} placeholder="Core" />
          </div>
          <div>
            <label className="label">اللون</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn("h-8 w-8 rounded-full transition-transform", color === c && "ring-2 ring-white ring-offset-2 ring-offset-vault-900 scale-110")}
                  style={{ backgroundColor: c }}
                  aria-label={`لون ${c}`}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="label">الأيقونة</label>
            <div className="flex flex-wrap gap-2">
              {ICON_PRESETS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                    icon === ic
                      ? "border-neon-green/60 bg-neon-green/15 text-neon-green"
                      : "border-vault-700/60 text-slate-400 hover:text-slate-200"
                  )}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
          )}

          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? "جارٍ الحفظ..." : editingId ? "حفظ التعديلات" : "إضافة التصنيف"}
            </button>
            {editingId && (
              <button type="button" className="btn-ghost" onClick={resetForm}>إلغاء التعديل</button>
            )}
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="حذف التصنيف"
        message={`هل أنت متأكد من حذف "${deleteTarget?.name}"؟`}
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
