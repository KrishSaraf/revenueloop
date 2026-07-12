import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("skeleton rounded-md", className)}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#111114] p-4">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-6 w-32" />
      <Skeleton className="mt-2 h-3 w-full" />
      <Skeleton className="mt-1.5 h-3 w-2/3" />
    </div>
  );
}
