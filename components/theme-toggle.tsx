"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const modes = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" }
  ];
  const currentIndex = Math.max(
    0,
    modes.findIndex((mode) => mode.value === theme)
  );
  const next = modes[(currentIndex + 1) % modes.length];
  const Icon = next.icon;

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={`Switch to ${next.label} theme`}
      title={`Switch to ${next.label} theme`}
      onClick={() => setTheme(next.value)}
    >
      <Icon />
    </Button>
  );
}
