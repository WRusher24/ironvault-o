"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Category, Exercise } from "@/db/schema";

interface ExerciseFormModalProps {
  open: boolean;
  onClose: () => void;
  exercise?: Exercise | null; // when provided, the modal edits instead of creates
}

export function ExerciseFormModal({ open, onClose, exercise }: ExerciseFormModalProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [notes, setNotes] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const editing = Boolean(exercise);

  useEffect(() => {
    if (!open) return;
    fetch("/api/categories")
      .then((r) => (r.ok ? r.json() : { categories: [] }))
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => setCategories([]));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (exercise) {
      setName(exercise.name);
      setNameEn(exercise.nameEn ?? "");
      setCategoryId(exercise.categoryId ?? "");
      setNotes(exercise.notes ?? "");
      setImageUrl(exercise.imageUrl);
      setImagePreview(exercise.imageUrl);
    } else {
      setName("");
      setNameEn("");
      setCategoryId("");
      setNotes("");
      setImageUrl(null);
      setImagePreview(null);
    }
  }, [open, exercise]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("اختر ملف صورة صالحاً");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("حجم الصورة كبير جداً (الحد الأقصى 5 ميجابايت)");
      return;
    }
    setError(null);
    setImagePreview(URL.createObjectURL(file));
    setImageUrl(null); // mark for re-upload
    uploadFile(file);
  }

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "فشل رفع الصورة");
        setImagePreview(null);
        return;
      }
      setImageUrl(data.url);
    } catch {
      setError("تعذر رفع الصورة");
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(editing ? `/api/exercises/${exercise!.id}` : "/api/exercises", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          nameEn: nameEn.trim() || null,
          categoryId: categoryId || null,
          imageUrl,
          notes: notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "حدث خطأ غير متوقع");
        return;
      }
      onClose();
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative card w-full max-w-md max-h-[92dvh] overflow-y-auto rounded-b-none sm:rounded-b-2xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-extrabold">{editing ? "تعديل التمرين" : "تمرين جديد"}</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-vault-800 hover:text-slate-200 transition-colors" aria-label="إغلاق">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-5 w-5">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Photo upload */}
          <div>
            <label className="label">صورة التمرين (اختياري)</label>
            <div
              onClick={() => fileRef.current?.click()}
              className={cn(
                "relative flex h-36 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors",
                imagePreview ? "border-transparent" : "border-vault-700 hover:border-neon-green/50"
              )}
            >
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="صورة التمرين" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                  <span className="text-xs font-semibold">اضغط لرفع صورة (قبضة، وضعية جهاز...)</span>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon-green border-t-transparent" />
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={onFileChange} />
            {imagePreview && (
              <button
                type="button"
                onClick={() => { setImagePreview(null); setImageUrl(null); }}
                className="mt-2 text-xs font-semibold text-red-400 hover:underline"
              >
                إزالة الصورة
              </button>
            )}
          </div>

          <div>
            <label className="label">اسم التمرين (عربي)</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} placeholder="مثال: سحب عريض بالبار" />
          </div>
          <div>
            <label className="label">الاسم الإنجليزي (اختياري)</label>
            <input className="input text-left" dir="ltr" value={nameEn} onChange={(e) => setNameEn(e.target.value)} maxLength={120} placeholder="Wide Lat Pulldown" />
          </div>
          <div>
            <label className="label">التصنيف</label>
            <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">بدون تصنيف</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}{c.nameEn ? ` (${c.nameEn})` : ""}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">ملاحظات (اختياري)</label>
            <textarea
              className="input min-h-[80px] resize-y"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              placeholder="قبضة، وضعية، أو أي تفاصيل مهمة..."
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading || uploading}>
            {loading ? "جارٍ الحفظ..." : editing ? "حفظ التعديلات" : "إضافة التمرين"}
          </button>
        </form>
      </div>
    </div>
  );
}
