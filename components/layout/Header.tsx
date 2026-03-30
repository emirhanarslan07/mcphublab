import Link from "next/link";
import { Search, ShieldAlert, Zap, Layers, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4 md:px-8">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Layers className="h-6 w-6 text-emerald-500" />
            <span className="hidden font-black sm:inline-block tracking-tighter text-[16px]">
              MCPHub <span className="text-emerald-500 italic">Lab</span>
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/servers"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Servers
            </Link>
            <Link
              href="/security"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Security
            </Link>
            <Link
              href="/compare"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Compare
            </Link>
          </nav>
        </div>
        
        {/* Mobile Nav Toggle */}
        <Button variant="ghost" size="icon" className="md:hidden mr-2">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>

        {/* Actions Only */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          {/* Login removed for a more minimalist, focused search experience */}
        </div>
      </div>
    </header>
  );
}
