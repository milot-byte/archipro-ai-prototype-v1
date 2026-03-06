import { ReactNode } from "react";

interface SectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function Section({ title, subtitle, children, action, className = "" }: SectionProps) {
  return (
    <section className={`py-20 ${className}`}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
            {subtitle && (
              <p className="mt-2 text-base text-muted">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
        {children}
      </div>
    </section>
  );
}
