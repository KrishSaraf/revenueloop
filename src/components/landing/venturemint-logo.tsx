import { cn } from "@/lib/utils";

export function VentureMintLogo({
  className,
  size = "md",
  theme = "dark",
  showTagline = false,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  theme?: "dark" | "light";
  showTagline?: boolean;
}) {
  const light = theme === "light";
  const iconBox =
    size === "sm" ? "h-7 w-7" : size === "lg" ? "h-9 w-9" : "h-8 w-8";
  const iconPx = size === "sm" ? 14 : size === "lg" ? 18 : 16;
  const titleSize =
    size === "sm" ? "text-sm" : size === "lg" ? "text-base" : "text-sm";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-lg",
          iconBox,
          light ? "bg-emerald-600/15 text-emerald-700" : "bg-emerald-400/15 text-emerald-300",
        )}
        aria-hidden
      >
        {/* Concentric target mark — keep this geometry intact */}
        <svg
          width={iconPx}
          height={iconPx}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            "block font-semibold tracking-tight",
            titleSize,
            light ? "text-emerald-950" : "text-zinc-100",
          )}
        >
          VentureMint
        </span>
        {showTagline ? (
          <span
            className={cn(
              "block font-mono text-[9px] uppercase tracking-[0.16em]",
              light ? "text-emerald-800/60" : "text-zinc-600",
            )}
          >
            Venture engine
          </span>
        ) : null}
      </span>
    </span>
  );
}
