"use client";

import { useMemo, useState } from "react";
import { formatWeight } from "@/lib/utils";
import type { PrLog } from "@/db/schema";

interface ProgressChartProps {
  logs: PrLog[];
  prLogIds: Set<string>;
}

const W = 640;
const H = 260;
const PAD = { top: 36, right: 20, bottom: 34, left: 48 };

export function ProgressChart({ logs, prLogIds }: ProgressChartProps) {
  const [hoverId, setHoverId] = useState<string | null>(null);

  const model = useMemo(() => {
    if (logs.length === 0) return null;

    const sorted = [...logs].sort((a, b) => a.loggedAt.getTime() - b.loggedAt.getTime());
    const weights = sorted.map((l) => l.weightKg);
    const minW = Math.min(...weights);
    const maxW = Math.max(...weights);
    const lo = Math.max(0, minW - Math.max(5, (maxW - minW) * 0.15));
    const hi = maxW + Math.max(5, (maxW - minW) * 0.15);

    const t0 = sorted[0].loggedAt.getTime();
    const t1 = sorted[sorted.length - 1].loggedAt.getTime();
    const span = Math.max(t1 - t0, 1);

    const x = (i: number) =>
      sorted.length === 1
        ? PAD.left + (W - PAD.left - PAD.right) / 2
        : PAD.left + ((sorted[i].loggedAt.getTime() - t0) / span) * (W - PAD.left - PAD.right);
    const y = (w: number) => PAD.top + (1 - (w - lo) / (hi - lo)) * (H - PAD.top - PAD.bottom);

    const points = sorted.map((l, i) => ({ log: l, cx: x(i), cy: y(l.weightKg), isPr: prLogIds.has(l.id) }));

    // Smooth path (Catmull-Rom → cubic bezier).
    let d = "";
    points.forEach((p, i) => {
      if (i === 0) {
        d = `M ${p.cx} ${p.cy}`;
        return;
      }
      const prev = points[i - 1];
      const c1x = prev.cx + (p.cx - prev.cx) / 3;
      const c2x = p.cx - (p.cx - prev.cx) / 3;
      d += ` C ${c1x} ${prev.cy}, ${c2x} ${p.cy}, ${p.cx} ${p.cy}`;
    });

    const yTicks = 4;
    const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => lo + ((hi - lo) / yTicks) * i);

    return { points, d, yLabels, lo, hi };
  }, [logs, prLogIds]);

  if (!model) {
    return (
      <div className="card flex h-48 items-center justify-center p-6 text-sm text-slate-500">
        لا توجد بيانات كافية لعرض الرسم البياني — سجّل أول رقم قياسي
      </div>
    );
  }

  const { points, d, yLabels } = model;
  const hover = points.find((p) => p.log.id === hoverId) ?? null;

  return (
    <div className="card p-4" dir="ltr">
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-slate-300" dir="rtl">تطور الوزن عبر الزمن</h3>
        <span className="text-xs text-slate-500">كجم</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" onMouseLeave={() => setHoverId(null)}>
        {/* Grid lines + Y labels */}
        {yLabels.map((w, i) => {
          const yy = PAD.top + (1 - (w - model.lo) / (model.hi - model.lo)) * (H - PAD.top - PAD.bottom);
          return (
            <g key={i}>
              <line x1={PAD.left} x2={W - PAD.right} y1={yy} y2={yy} stroke="#334155" strokeWidth={1} strokeDasharray="3 5" />
              <text x={PAD.left - 8} y={yy + 4} textAnchor="end" fontSize={11} fill="#64748b">
                {formatWeight(Math.round(w * 10) / 10)}
              </text>
            </g>
          );
        })}

        {/* Area fill under the line */}
        <path
          d={`${d} L ${points[points.length - 1].cx} ${H - PAD.bottom} L ${points[0].cx} ${H - PAD.bottom} Z`}
          fill="url(#areaGrad)"
          opacity={0.35}
        />
        {/* The line */}
        <path d={d} fill="none" stroke="#06b6d4" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Data points */}
        {points.map((p) => (
          <g key={p.log.id}>
            {p.isPr && (
              <>
                {/* Star badge above PR points */}
                <circle cx={p.cx} cy={p.cy - 18} r={9} fill="#f59e0b" stroke="#0f172a" strokeWidth={2} />
                <text x={p.cx} y={p.cy - 14.5} textAnchor="middle" fontSize={9} fontWeight={900} fill="#0f172a">
                  PR
                </text>
              </>
            )}
            <circle
              cx={p.cx}
              cy={p.cy}
              r={p.isPr ? 6 : 4}
              fill={p.isPr ? "#22c55e" : "#0f172a"}
              stroke={p.isPr ? "#22c55e" : "#06b6d4"}
              strokeWidth={2.5}
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoverId(p.log.id)}
            />
            {/* Larger invisible hit area for touch */}
            <circle cx={p.cx} cy={p.cy} r={14} fill="transparent" onMouseEnter={() => setHoverId(p.log.id)} />
          </g>
        ))}

        {/* Hover tooltip */}
        {hover && (
          <g>
            <rect
              x={Math.min(Math.max(hover.cx - 52, 4), W - 108)}
              y={hover.cy - 52}
              width={104}
              height={36}
              rx={8}
              fill="#1e293b"
              stroke="#475569"
            />
            <text
              x={Math.min(Math.max(hover.cx - 52, 4), W - 108) + 52}
              y={hover.cy - 36}
              textAnchor="middle"
              fontSize={12}
              fontWeight={800}
              fill="#fff"
            >
              {formatWeight(hover.log.weightKg)} كجم × {hover.log.reps}
            </text>
            <text
              x={Math.min(Math.max(hover.cx - 52, 4), W - 108) + 52}
              y={hover.cy - 21}
              textAnchor="middle"
              fontSize={10}
              fill="#94a3b8"
            >
              {new Date(hover.log.loggedAt).toLocaleDateString("ar", { day: "numeric", month: "short" })}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
