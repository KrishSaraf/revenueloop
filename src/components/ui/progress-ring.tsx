import { cn } from "@/lib/utils";

export function ProgressRing({
  value,
  size = 52,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;
  const color =
    value >= 80 ? "#34d399" : value >= 65 ? "#fbbf24" : "#71717a";

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("shrink-0 -rotate-90", className)}
      role="img"
      aria-label={`Opportunity score ${Math.round(value)} out of 100`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 400ms ease" }}
      />
    </svg>
  );
}
