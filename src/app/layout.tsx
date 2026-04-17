import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppStateProvider } from "@/state/AppStateContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "IES Controller Command Center",
  description: "Continuous close in action — prototype",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(inter.variable, "font-sans")}>
      <body className="antialiased">
        <AppStateProvider>
          <TooltipProvider delayDuration={150}>{children}</TooltipProvider>
        </AppStateProvider>
      </body>
    </html>
  );
}
