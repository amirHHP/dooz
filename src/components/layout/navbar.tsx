import Link from "next/link";
import { Scissors, Ruler, ShoppingBag, Sparkles, User, Palette } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
              <Scissors className="h-5 w-5 transform -rotate-45" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-foreground">دوز</span>
              <span className="text-[10px] text-muted-foreground -mt-1 font-medium">استودیو الگوسازی پارامتریک</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              href="/studio"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
            >
              <Ruler className="h-4 w-4 text-primary" />
              <span>استودیو الگو</span>
            </Link>
            <Link
              href="/clients"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
            >
              <User className="h-4 w-4 text-primary" />
              <span>پرونده مشتریان</span>
            </Link>
            <Link
              href="/marketplace"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
            >
              <ShoppingBag className="h-4 w-4 text-primary" />
              <span>مارکت‌پلیس الگو</span>
            </Link>
            <Link
              href="/ai-analyzer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>دستیار هوش مصنوعی</span>
            </Link>
            <Link
              href="/creator"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
            >
              <Palette className="h-4 w-4 text-primary" />
              <span>پنل طراحان</span>
            </Link>
          </nav>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/studio"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Scissors className="h-4 w-4" />
            <span>شروع الگوسازی</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
