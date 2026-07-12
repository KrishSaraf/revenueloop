"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Dialog({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      className={cn(
        "m-auto w-full max-w-lg rounded-xl border border-white/10 bg-[#17171b] p-0 text-zinc-100 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm",
        className,
      )}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3.5">
        <h2 className="text-sm font-semibold">{title}</h2>
        <button
          onClick={onClose}
          className="grid h-7 w-7 cursor-pointer place-items-center rounded-md text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-200"
          aria-label="Close dialog"
        >
          <X size={15} />
        </button>
      </div>
      <div className="px-5 py-4">{children}</div>
    </dialog>
  );
}
