"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

const mainLinks = [
  { href: "/discover", label: "Discover" },
  { href: "/boards", label: "Boards" },
  { href: "/specifications", label: "Specs" },
  { href: "/brief", label: "AI Brief" },
];

const intelligenceLinks = [
  { href: "/activity", label: "Live Activity" },
  { href: "/influence", label: "Architect Influence" },
  { href: "/momentum", label: "Product Momentum" },
  { href: "/network", label: "Influence Network" },
  { href: "/dashboard", label: "Analytics" },
];

const directoryLinks = [
  { href: "/architects", label: "Architects" },
  { href: "/brands", label: "Brands" },
  { href: "/products", label: "Products" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          ArchiPro<span className="text-muted ml-1 font-light">Intelligence</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 lg:flex">
          {mainLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-1.5 text-sm text-muted transition-colors hover:bg-card hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}

          {/* Intelligence dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setDropdown("intelligence")}
            onMouseLeave={() => setDropdown(null)}
          >
            <button className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-muted transition-colors hover:bg-card hover:text-foreground">
              Intelligence <ChevronDown size={12} />
            </button>
            {dropdown === "intelligence" && (
              <div className="absolute left-0 top-full pt-1">
                <div className="w-52 rounded-xl border border-border bg-white p-1.5 shadow-lg">
                  {intelligenceLinks.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="block rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-card hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Directory dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setDropdown("directory")}
            onMouseLeave={() => setDropdown(null)}
          >
            <button className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-muted transition-colors hover:bg-card hover:text-foreground">
              Directory <ChevronDown size={12} />
            </button>
            {dropdown === "directory" && (
              <div className="absolute left-0 top-full pt-1">
                <div className="w-44 rounded-xl border border-border bg-white p-1.5 shadow-lg">
                  {directoryLinks.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="block rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-card hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button className="ml-2 rounded-full bg-foreground px-4 py-1.5 text-sm text-white transition-opacity hover:opacity-80">
            Sign in
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border bg-white px-6 pb-6 lg:hidden">
          <p className="pb-1 pt-4 text-[10px] font-semibold uppercase tracking-wider text-muted">
            Platform
          </p>
          {mainLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block py-2 text-sm text-muted transition-colors hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <p className="pb-1 pt-4 text-[10px] font-semibold uppercase tracking-wider text-muted">
            Intelligence
          </p>
          {intelligenceLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block py-2 text-sm text-muted transition-colors hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <p className="pb-1 pt-4 text-[10px] font-semibold uppercase tracking-wider text-muted">
            Directory
          </p>
          {directoryLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block py-2 text-sm text-muted transition-colors hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
