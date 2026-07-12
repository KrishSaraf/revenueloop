import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function currency(value: number) {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function percent(value: number) {
  return `${Math.round(value)}%`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function shortTime(value: string) {
  return new Intl.DateTimeFormat("en-SG", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
