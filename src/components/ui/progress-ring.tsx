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
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("shrink-0 -rotate-90", className)}
      aria-label={`Score ${Math.round(value)} out of 100`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgb(57,255,136)"
        strokeLinecap="round"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
}
