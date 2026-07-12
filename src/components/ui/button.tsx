import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-emerald-500 text-emerald-950 hover:bg-emerald-400 shadow-[0_1px_12px_rgba(16,185,129,0.25)]",
  secondary:
    "border-white/10 bg-white/[0.06] text-zinc-100 hover:border-white/20 hover:bg-white/[0.1]",
  ghost:
    "border-transparent bg-transparent text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100",
  danger:
    "border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

export function Button({
  className,
  variant = "secondary",
  size = "md",
  icon,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
