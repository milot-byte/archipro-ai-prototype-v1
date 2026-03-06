import { PageHeader } from "@/components/ui/page-header";
import { Card, CardImage, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { projects } from "@/lib/mock-data";

export default function DiscoverPage() {
  return (
    <>
      <PageHeader
        title="Discover Projects"
        subtitle="Browse architecture projects from New Zealand's leading studios. Filter by style, location, and type."
      />
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Filter bar */}
        <div className="mb-10 flex flex-wrap gap-2">
          {["All", "Residential", "Commercial", "Heritage", "Sustainable", "Luxury", "Urban"].map(
            (f) => (
              <button
                key={f}
                className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                  f === "All"
                    ? "bg-foreground text-white"
                    : "bg-card text-muted hover:bg-foreground hover:text-white"
                }`}
              >
                {f}
              </button>
            )
          )}
        </div>

        {/* Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} href={`/projects/${project.id}`}>
              <CardImage src={project.images[0]} alt={project.title} />
              <CardBody>
                <p className="text-xs text-muted">
                  {project.architect} &middot; {project.year}
                </p>
                <h3 className="mt-1 text-lg font-semibold tracking-tight">
                  {project.title}
                </h3>
                <p className="mt-1 text-sm text-muted">{project.location}</p>
                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted">
                  {project.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
