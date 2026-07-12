import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { RevenueLoopProvider } from "@/lib/store/revenue-loop-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "RevenueLoop | Autonomous AI Agency",
  description:
    "A hackathon-ready AI agent that finds customers, builds websites, sells and tracks revenue.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <RevenueLoopProvider>
          <AppShell>{children}</AppShell>
        </RevenueLoopProvider>
      </body>
    </html>
  );
}
