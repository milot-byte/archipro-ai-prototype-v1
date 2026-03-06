import { PageHeader } from "@/components/ui/page-header";
import { Card, CardImage, CardBody } from "@/components/ui/card";
import { brands } from "@/lib/mock-data";

export default function BrandsPage() {
  return (
    <>
      <PageHeader
        title="Brand Directory"
        subtitle="Explore product libraries from architecture's leading suppliers and manufacturers."
      />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => (
            <Card key={brand.id}>
              <CardImage src={brand.coverImage} alt={brand.name} aspect="wide" />
              <CardBody>
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="h-12 w-12 rounded-lg bg-foreground object-cover"
                  />
                  <div>
                    <h3 className="text-base font-semibold">{brand.name}</h3>
                    <p className="text-xs text-muted">{brand.category}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {brand.description}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <span className="text-xs text-muted">
                    {brand.productCount} products
                  </span>
                  <span className="text-xs font-medium text-foreground">
                    View library &rarr;
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
