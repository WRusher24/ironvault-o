import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getExportRows } from "@/lib/queries";

function csvCell(value: string | number | Date | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = value instanceof Date ? value.toISOString() : String(value);
  // Escape quotes and wrap when needed so Arabic/English text survives Excel.
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  const user = await requireUser();
  const rows = await getExportRows(user.id);

  const header = ["التمرين", "التمرين (إنجليزي)", "التصنيف", "الوزن (كجم)", "التكرارات", "ملاحظة", "التاريخ"];
  const lines = [header.map(csvCell).join(",")];

  for (const r of rows) {
    lines.push(
      [
        r.exercise,
        r.exerciseEn,
        r.category,
        r.weightKg,
        r.reps,
        r.note,
        r.loggedAt,
      ]
        .map(csvCell)
        .join(",")
    );
  }

  // BOM prefix so Excel opens the file with correct UTF-8 (Arabic) encoding.
  const csv = "\uFEFF" + lines.join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ironvault-export-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
