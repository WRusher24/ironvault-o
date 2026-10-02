import { cn } from "@/lib/utils";

export function Logo({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const box = size === "lg" ? "h-14 w-14" : size === "sm" ? "h-10 w-10" : "h-12 w-12";
  const text = size === "lg" ? "text-3xl" : size === "sm" ? "text-xl" : "text-2xl";
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "rounded-2xl bg-gradient-to-br from-neon-green to-neon-cyan flex items-center justify-center shadow-lg shadow-neon-green/20",
          box
        )}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-1/2 w-1/2 text-vault-950" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6.5 6.5 17.5 17.5" />
          <path d="m21 21-1-1" />
          <path d="m3 3 1 1" />
          <path d="m18 22 4-4" />
          <path d="m2 6 4-4" />
          <path d="m3 10 7-7" />
          <path d="m14 21 7-7" />
        </svg>
      </div>
      <div className="leading-tight">
        <div className={cn("font-extrabold tracking-tight", text)}>
          آيرون فالت
        </div>
        <div className="text-[11px] font-semibold tracking-[0.3em] text-neon-green uppercase" dir="ltr">
          IronVault
        </div>
      </div>
    </div>
  );
}
