import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-emerald-300/50 bg-emerald-300 text-black shadow-[0_0_28px_rgba(57,255,136,0.22)] hover:bg-emerald-200",
  secondary:
    "border-white/10 bg-white/[0.07] text-white hover:border-emerald-300/40 hover:bg-white/[0.1]",
  ghost: "border-transparent bg-transparent text-zinc-300 hover:bg-white/[0.06] hover:text-white",
  danger:
    "border-rose-400/40 bg-rose-500/12 text-rose-100 hover:bg-rose-500/20",
};

export function Button({
  className,
  variant = "secondary",
  icon,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
