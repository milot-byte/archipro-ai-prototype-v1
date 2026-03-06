import { PageHeader } from "@/components/ui/page-header";
import { Card, CardImage, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { architects } from "@/lib/mock-data";

export default function ArchitectsPage() {
  return (
    <>
      <PageHeader
        title="Architect Directory"
        subtitle="Find and connect with New Zealand's top architecture studios."
      />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {architects.map((arch) => (
            <Card key={arch.id}>
              <CardImage src={arch.coverImage} alt={arch.name} />
              <CardBody>
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={arch.avatar}
                    alt={arch.name}
                    className="h-12 w-12 rounded-full bg-card object-cover"
                  />
                  <div>
                    <h3 className="text-base font-semibold">{arch.name}</h3>
                    <p className="text-xs text-muted">{arch.firm}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {arch.bio}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {arch.specialties.map((s) => (
                      <Badge key={s}>{s}</Badge>
                    ))}
                  </div>
                  <span className="text-xs text-muted">
                    {arch.projectCount} projects
                  </span>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
