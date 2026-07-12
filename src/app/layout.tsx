import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AppShell } from "@/components/app-shell";
import { RevenueLoopProvider } from "@/lib/store/revenue-loop-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "VentureMint — Turn business gaps into solutions you can sell",
  description:
    "VentureMint finds underserved businesses, diagnoses what they are missing, builds the solution, and prepares a personalised deal for human approval.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="min-h-full">
        <RevenueLoopProvider>
          <AppShell>{children}</AppShell>
        </RevenueLoopProvider>
      </body>
    </html>
  );
}
