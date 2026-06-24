"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { ChevronRight, Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

function crumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  return parts.map((part, index) => ({
    label: part.replaceAll("-", " "),
    href: `/${parts.slice(0, index + 1).join("/")}`
  }));
}

export function Header() {
  const pathname = usePathname();
  const pathCrumbs = crumbs(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/90 px-4 backdrop-blur">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
          <Menu />
        </Button>
        <nav className="flex items-center gap-1 text-sm capitalize text-muted-foreground">
          {pathCrumbs.map((crumb, index) => (
            <span key={crumb.href} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="size-4" />}
              <Link
                href={crumb.href}
                className={index === pathCrumbs.length - 1 ? "font-medium text-foreground" : ""}
              >
                {crumb.label}
              </Link>
            </span>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}
