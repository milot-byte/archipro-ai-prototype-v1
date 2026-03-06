import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardImage, CardBody } from "@/components/ui/card";
import { projects, products as allProducts, architects } from "@/lib/mock-data";
import { ArrowLeft, MapPin, Calendar, User, Tag } from "lucide-react";

export function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = projects.find((p) => p.id === id);
  if (!project) return notFound();

  const architect = architects.find((a) => a.id === project.architectId);
  const taggedProducts = allProducts.filter((p) =>
    project.products.includes(p.id)
  );

  return (
    <>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <Link
          href="/discover"
          className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} /> Back to projects
        </Link>
      </div>

      {/* Image gallery */}
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {project.images.map((img, i) => (
            <div
              key={i}
              className={`overflow-hidden rounded-2xl bg-card ${
                i === 0 ? "sm:col-span-2 aspect-[2/1]" : "aspect-video"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={`${project.title} — image ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-16 lg:grid-cols-3">
          {/* Main */}
          <div className="lg:col-span-2">
            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
            <h1 className="text-4xl font-semibold tracking-tight">
              {project.title}
            </h1>
            <p className="mt-6 text-base leading-relaxed text-muted">
              {project.description}
            </p>

            {/* Tagged Products */}
            {taggedProducts.length > 0 && (
              <div className="mt-16">
                <h2 className="mb-6 text-lg font-semibold flex items-center gap-2">
                  <Tag size={18} /> Tagged Products
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {taggedProducts.map((product) => (
                    <Card key={product.id}>
                      <CardBody className="flex items-center gap-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-16 w-16 rounded-lg bg-card object-cover"
                        />
                        <div>
                          <p className="text-xs text-muted">{product.brand}</p>
                          <h3 className="text-sm font-semibold">
                            {product.name}
                          </h3>
                          <p className="text-sm font-medium">{product.price}</p>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Meta */}
            <div className="rounded-2xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={14} className="text-muted" />
                {project.location}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={14} className="text-muted" />
                {project.year}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User size={14} className="text-muted" />
                {project.architect}
              </div>
            </div>

            {/* Architect card */}
            {architect && (
              <div className="rounded-2xl border border-border p-6">
                <p className="text-xs font-medium uppercase tracking-wider text-muted mb-4">
                  Architect
                </p>
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={architect.avatar}
                    alt={architect.name}
                    className="h-12 w-12 rounded-full bg-card object-cover"
                  />
                  <div>
                    <h3 className="text-sm font-semibold">{architect.name}</h3>
                    <p className="text-xs text-muted">{architect.firm}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {architect.bio}
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
