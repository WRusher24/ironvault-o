"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { cn, formatWeight, todayInputValue } from "@/lib/utils";
import type { Exercise, PrLog } from "@/db/schema";

// ---------- Types ----------

interface LogDialogState {
  open: boolean;
  mode: "create" | "edit";
  log: PrLog | null;
  presetExerciseId: string | null;
}

interface Celebration {
  exerciseName: string;
  weightKg: number;
  reps: number;
}

interface LogContextValue {
  openCreate: (exerciseId?: string) => void;
  openEdit: (log: PrLog) => void;
  closeDialog: () => void;
  celebration: Celebration | null;
  clearCelebration: () => void;
}

const LogContext = createContext<LogContextValue | null>(null);

export function useLogDialog() {
  const ctx = useContext(LogContext);
  if (!ctx) throw new Error("useLogDialog must be used within LogDialogProvider");
  return ctx;
}

// ---------- Provider ----------

export function LogDialogProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<LogDialogState>({
    open: false,
    mode: "create",
    log: null,
    presetExerciseId: null,
  });
  const [celebration, setCelebration] = useState<Celebration | null>(null);

  const openCreate = useCallback((exerciseId?: string) => {
    setState({ open: true, mode: "create", log: null, presetExerciseId: exerciseId ?? null });
  }, []);

  const openEdit = useCallback((log: PrLog) => {
    setState({ open: true, mode: "edit", log, presetExerciseId: null });
  }, []);

  const closeDialog = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  const clearCelebration = useCallback(() => setCelebration(null), []);

  const value = useMemo(
    () => ({ openCreate, openEdit, closeDialog, celebration, clearCelebration }),
    [openCreate, openEdit, closeDialog, celebration, clearCelebration]
  );

  async function handleSaved(isNewPR: boolean, exerciseName: string, weightKg: number, reps: number) {
    if (isNewPR) {
      setCelebration({ exerciseName, weightKg, reps });
    }
    closeDialog();
    router.refresh();
  }

  return (
    <LogContext.Provider value={value}>
      {children}
      <LogPRDialog state={state} onClose={closeDialog} onSaved={handleSaved} />
      <PRCelebration celebration={celebration} onDone={clearCelebration} />
    </LogContext.Provider>
  );
}

// ---------- Dialog ----------

function LogPRDialog({
  state,
  onClose,
  onSaved,
}: {
  state: LogDialogState;
  onClose: () => void;
  onSaved: (isNewPR: boolean, exerciseName: string, weightKg: number, reps: number) => void;
}) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseId, setExerciseId] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("1");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayInputValue());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const editing = state.mode === "edit" && state.log;

  // Load exercises whenever the dialog opens.
  useEffect(() => {
    if (!state.open) return;
    fetch("/api/exercises")
      .then((r) => (r.ok ? r.json() : { exercises: [] }))
      .then((d) => setExercises(d.exercises ?? []))
      .catch(() => setExercises([]));
  }, [state.open]);

  // Reset fields when opened.
  useEffect(() => {
    if (!state.open) return;
    setError(null);
    setFilter("");
    setShowDropdown(false);
    if (state.mode === "edit" && state.log) {
      setExerciseId(state.log.exerciseId);
      setWeight(String(state.log.weightKg));
      setReps(String(state.log.reps));
      setNote(state.log.note ?? "");
      setDate(toInputDate(state.log.loggedAt));
    } else {
      setExerciseId(state.presetExerciseId ?? "");
      setWeight("");
      setReps("1");
      setNote("");
      setDate(todayInputValue());
    }
  }, [state.open, state.mode, state.log, state.presetExerciseId]);

  // Close exercise dropdown on outside click.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const filtered = exercises.filter((ex) => {
    if (!filter.trim()) return true;
    const hay = `${ex.name} ${ex.nameEn ?? ""}`.toLowerCase();
    return hay.includes(filter.trim().toLowerCase());
  });

  const selectedExercise = exercises.find((ex) => ex.id === exerciseId) ?? null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!exerciseId) {
      setError("اختر التمرين أولاً");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        exerciseId,
        weightKg: Number(weight),
        reps: Number(reps),
        note: note.trim() || null,
        loggedAt: new Date(`${date}T12:00:00`),
      };
      const res = await fetch(editing ? `/api/logs/${state.log!.id}` : "/api/logs", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "حدث خطأ غير متوقع");
        return;
      }
      onSaved(data.isNewPR === true, selectedExercise?.name ?? "", payload.weightKg, payload.reps);
    } catch {
      setError("تعذر الاتصال بالخادم — حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  }

  if (!state.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative card w-full max-w-md max-h-[92dvh] overflow-y-auto rounded-b-none sm:rounded-b-2xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-extrabold">
            {editing ? "تعديل السجل" : "تسجيل رقم قياسي جديد"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-vault-800 hover:text-slate-200 transition-colors"
            aria-label="إغلاق"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-5 w-5">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Exercise picker */}
          <div ref={dropdownRef} className="relative">
            <label className="label">التمرين</label>
            <button
              type="button"
              className="input flex items-center justify-between text-start"
              onClick={() => setShowDropdown((v) => !v)}
            >
              <span className={selectedExercise ? "text-slate-100" : "text-slate-500"}>
                {selectedExercise ? selectedExercise.name : "اختر تمريناً..."}
              </span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={cn("h-4 w-4 transition-transform", showDropdown && "rotate-180")}>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {showDropdown && (
              <div className="absolute z-10 mt-2 w-full card p-2 max-h-56 overflow-y-auto animate-fade-in">
                <input
                  type="text"
                  className="input mb-2 py-2 text-sm"
                  placeholder="ابحث عن تمرين..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  autoFocus
                />
                {filtered.length === 0 && (
                  <p className="px-3 py-4 text-sm text-slate-500 text-center">لا توجد نتائج</p>
                )}
                {filtered.map((ex) => (
                  <button
                    key={ex.id}
                    type="button"
                    className={cn(
                      "w-full text-start rounded-lg px-3 py-2.5 text-sm transition-colors",
                      ex.id === exerciseId
                        ? "bg-neon-green/15 text-neon-green font-bold"
                        : "hover:bg-vault-800 text-slate-200"
                    )}
                    onClick={() => {
                      setExerciseId(ex.id);
                      setShowDropdown(false);
                      setFilter("");
                    }}
                  >
                    {ex.name}
                    {ex.nameEn && <span className="block text-xs text-slate-500" dir="ltr">{ex.nameEn}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">الوزن (كجم)</label>
              <input
                type="number"
                inputMode="decimal"
                dir="ltr"
                className="input text-left"
                placeholder="0.0"
                min="0.5"
                max="600"
                step="0.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">التكرارات</label>
              <input
                type="number"
                inputMode="numeric"
                dir="ltr"
                className="input text-left"
                placeholder="1"
                min="1"
                max="100"
                step="1"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">ملاحظة (اختياري)</label>
            <input
              type="text"
              className="input"
              placeholder='مثال: "بار + 30 كجم" أو "Inside Hamsters"'
              maxLength={300}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div>
            <label className="label">التاريخ</label>
            <input
              type="date"
              dir="ltr"
              className="input text-left [color-scheme:dark]"
              value={date}
              max={todayInputValue()}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "جارٍ الحفظ..." : editing ? "حفظ التعديلات" : "حفظ الرقم القياسي"}
          </button>
        </form>
      </div>
    </div>
  );
}

function toInputDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ---------- Celebration overlay ----------

const CONFETTI_COLORS = ["#22c55e", "#06b6d4", "#f59e0b", "#ec4899", "#8b5cf6"];

function PRCelebration({ celebration, onDone }: { celebration: Celebration | null; onDone: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!celebration) return;
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 400);
    }, 3200);
    return () => clearTimeout(t);
  }, [celebration, onDone]);

  if (!celebration || !visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden pointer-events-none">
      {/* Confetti */}
      {Array.from({ length: 40 }).map((_, i) => (
        <span
          key={i}
          className="absolute top-0 w-2 h-3 rounded-sm animate-confetti-fall"
          style={{
            insetInlineStart: `${(i * 97) % 100}%`,
            backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animationDelay: `${(i % 12) * 0.12}s`,
            animationDuration: `${2 + (i % 5) * 0.3}s`,
          }}
        />
      ))}

      <div className="relative card px-8 py-10 text-center animate-pr-pop pointer-events-auto border-neon-green/40 shadow-2xl shadow-neon-green/20">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-neon-green to-neon-cyan animate-pulse-glow">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10 text-vault-950">
            <path d="M12 2l2.9 6.26 6.6.56-5 4.36 1.5 6.45L12 16.9 5.99 19.63l1.5-6.45-5-4.36 6.6-.56L12 2z" />
          </svg>
        </div>
        <div className="text-3xl font-extrabold text-neon-green mb-1">رقم قياسي جديد!</div>
        <div className="text-slate-300 mb-3">{celebration.exerciseName}</div>
        <div className="text-5xl font-black text-white mb-1" dir="ltr">
          {formatWeight(celebration.weightKg)}
          <span className="text-xl text-slate-400 font-bold"> كجم</span>
        </div>
        <div className="text-slate-400 text-sm">{celebration.reps} تكرار</div>
      </div>
    </div>
  );
}
