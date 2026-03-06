import { PageHeader } from "@/components/ui/page-header";
import { Card, CardImage, CardBody } from "@/components/ui/card";
import { products } from "@/lib/mock-data";
import { Download } from "lucide-react";

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        title="Product Library"
        subtitle="Browse and download specifications for architecture products across every category."
      />
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Category filters */}
        <div className="mb-10 flex flex-wrap gap-2">
          {["All", "Kitchen", "Lighting", "Surfaces", "Furniture", "Roofing", "Outdoor", "Hardware"].map(
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

        {/* Product grid */}
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <Card key={product.id}>
              <CardImage src={product.image} alt={product.name} aspect="square" />
              <CardBody>
                <p className="text-xs text-muted">{product.brand}</p>
                <h3 className="mt-1 text-sm font-semibold">{product.name}</h3>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-medium">{product.price}</span>
                  {product.specSheet && (
                    <button className="flex items-center gap-1 rounded-full bg-card px-3 py-1 text-xs text-muted transition-colors hover:bg-foreground hover:text-white">
                      <Download size={12} />
                      Spec
                    </button>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
