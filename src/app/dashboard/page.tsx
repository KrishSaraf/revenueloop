import { Suspense } from "react";
import { CommandCentreView } from "@/components/dashboard/command-centre-view";

export const metadata = { title: "Command centre — VentureMint" };

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="skeleton h-64 rounded-xl" aria-hidden />}>
      <CommandCentreView />
    </Suspense>
  );
}
