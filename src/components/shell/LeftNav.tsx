"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  SlidersHorizontal,
  FileSearch,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useData } from "@/hooks/useData";

// Dark left nav sidebar (240px). Workspace identity on top, nav items in the
// middle, controller profile chip at the bottom. Part of the v2 shell.

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

const NAV: NavItem[] = [
  { href: "/", label: "Command Center", icon: LayoutDashboard },
  { href: "/fleet", label: "Agent Fleet", icon: Users },
  { href: "/policies", label: "Policies", icon: SlidersHorizontal },
  { href: "/evidence", label: "Evidence", icon: FileSearch },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function LeftNav() {
  const pathname = usePathname();
  const { period } = useData();

  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col overflow-hidden rounded-2xl border border-neutral-900 bg-neutral-950 text-neutral-200 shadow-sm">
      {/* Workspace identity */}
      <div className="flex items-center gap-2.5 border-b border-white/5 px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-lane-emerald-500 to-lane-sky-500 text-white">
          <Sparkles className="size-4" />
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold text-white">
            {period.entityName}
          </span>
          <span className="truncate text-[11px] text-neutral-400">
            {period.period}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="px-2 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
          Workspace
        </div>
        <ul className="flex flex-col gap-0.5">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                    active
                      ? "bg-white/10 text-white"
                      : "text-neutral-400 hover:bg-white/5 hover:text-neutral-100",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Controller profile */}
      <div className="border-t border-white/5 px-3 py-3">
        <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5">
          <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-lane-violet-500 to-lane-sky-500 text-[11px] font-semibold text-white">
            MC
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[13px] font-medium text-white">
              M. Cavalcanti
            </span>
            <span className="truncate text-[11px] text-neutral-500">
              Controller
            </span>
          </div>
        </div>
        <div className="mt-2 rounded-md bg-white/5 px-2.5 py-1.5 text-[10px] leading-relaxed text-neutral-400">
          <span className="font-medium text-neutral-300">Space</span> pause ·{" "}
          <span className="font-medium text-neutral-300">P</span> policy ·{" "}
          <span className="font-medium text-neutral-300">2</span>–
          <span className="font-medium text-neutral-300">4</span> moments
        </div>
      </div>
    </aside>
  );
}
