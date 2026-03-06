export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="border-b border-border bg-white py-16">
      <div className="mx-auto max-w-7xl px-6">
        <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-lg text-muted">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
