"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Cpu,
  Gauge,
  HardDrive,
  Layers3,
  LayoutDashboard,
  LockKeyhole
} from "lucide-react";

import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/cpu", label: "CPU Scheduling", icon: Cpu },
  { href: "/dashboard/page-replacement", label: "Page Replacement", icon: Layers3 },
  { href: "/dashboard/disk", label: "Disk Scheduling", icon: HardDrive },
  { href: "/dashboard/deadlock", label: "Banker Safety", icon: LockKeyhole }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card/80 backdrop-blur lg:block">
      <div className="flex h-16 items-center gap-3 border-b px-5">
        <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Gauge className="size-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">OS Algorithm</p>
          <p className="text-xs text-muted-foreground">Simulator Studio</p>
        </div>
      </div>
      <nav className="space-y-1 p-3">
        {nav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                active && "bg-primary/10 text-primary"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mx-3 mt-4 rounded-lg border bg-background p-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Activity className="size-4 text-primary" />
          Portfolio mode
        </div>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          Every simulator exposes playback controls, live state, metrics, and
          decision traces for OS lab practice.
        </p>
      </div>
    </aside>
  );
}
