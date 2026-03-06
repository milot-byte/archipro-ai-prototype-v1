import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold tracking-tight">ArchiPro AI</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Connecting homeowners, architects, and brands through an
              AI-powered architecture platform.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Platform
            </h4>
            <ul className="mt-3 space-y-2">
              {["Discover", "Architects", "Brands", "Products"].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase()}`}
                    className="text-sm text-muted transition-colors hover:text-foreground"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
              AI Tools
            </h4>
            <ul className="mt-3 space-y-2">
              {["Design Brief Generator", "Project Discovery", "Product Matching"].map(
                (item) => (
                  <li key={item}>
                    <span className="text-sm text-muted">{item}</span>
                  </li>
                )
              )}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Company
            </h4>
            <ul className="mt-3 space-y-2">
              {["About", "Contact", "Privacy", "Terms"].map((item) => (
                <li key={item}>
                  <span className="text-sm text-muted">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-16 border-t border-border pt-8 text-center text-xs text-muted">
          &copy; {new Date().getFullYear()} ArchiPro AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
