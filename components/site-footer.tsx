import Link from "next/link";
import { Github, Linkedin } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SiteFooter() {
  return (
    <footer className="border-t bg-card/70">
      <div className="container flex flex-col gap-3 py-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          Made by <span className="font-semibold text-foreground">Harshith M</span>
        </p>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link
              href="https://github.com/harshith-murali/"
              target="_blank"
              rel="noreferrer"
            >
              <Github /> GitHub
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link
              href="https://www.linkedin.com/in/harshith-m-dev/"
              target="_blank"
              rel="noreferrer"
            >
              <Linkedin /> LinkedIn
            </Link>
          </Button>
        </div>
      </div>
    </footer>
  );
}
