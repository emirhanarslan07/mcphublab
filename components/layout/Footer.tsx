import { Layers } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0 px-4 md:px-8">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-2 md:px-0">
          <Layers className="h-5 w-5 text-emerald-500" />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by{" "}
            <a
              href="#"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              MCPHub Lab
            </a>
            . The Security & Discovery Layer for AI Agents.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <a href="#" target="_blank" rel="noreferrer" className="text-sm font-medium hover:underline underline-offset-4">
            GitHub
          </a>
          <a href="#" target="_blank" rel="noreferrer" className="text-sm font-medium hover:underline underline-offset-4">
            Twitter
          </a>
          <a href="#" target="_blank" rel="noreferrer" className="text-sm font-medium hover:underline underline-offset-4">
            Discord
          </a>
        </div>
      </div>
    </footer>
  );
}
