"use client";

import { useState } from "react";
import { products, brands } from "@/lib/mock-data";
import { productMomentumData } from "@/lib/intelligence-data";
import { Download, Heart, Search, Grid3x3, List, Filter, ExternalLink, TrendingUp } from "lucide-react";

export default function ProductsPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const categories = ["All", "Kitchen", "Lighting", "Surfaces", "Furniture", "Roofing", "Outdoor", "Hardware", "Decking"];

  let filtered = filter === "All" ? products : products.filter((p) => p.category === filter);
  if (search) filtered = filtered.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-surface/50">
      <div className="border-b border-border bg-white px-8 py-6">
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">Library</p>
        <h1 className="mt-1 text-[28px] font-semibold tracking-tight">Saved Products</h1>
        <p className="mt-1 text-[13px] text-muted">Browse and download specifications for architecture products.</p>
      </div>

      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg border border-border bg-white p-1">
              {categories.slice(0, 7).map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${filter === f ? "bg-foreground text-white" : "text-muted hover:bg-surface"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-lg border border-border bg-white pl-9 pr-3 py-2 text-[12px] w-48 placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-foreground" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => {
            const momentum = productMomentumData.find((m) => m.productId === product.id);
            return (
              <div key={product.id} className="group rounded-2xl border border-border bg-white overflow-hidden transition-all hover:shadow-md hover:border-foreground/10">
                <div className="aspect-square bg-surface relative flex items-center justify-center">
                  <span className="text-[11px] text-muted">{product.category}</span>
                  {momentum && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold">
                      <TrendingUp size={10} className="text-emerald" />
                      {momentum.momentumScore}
                    </div>
                  )}
                  <button className="absolute top-2 left-2 rounded-full bg-white/90 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart size={14} className="text-muted" />
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-muted">{product.brand}</p>
                  <h3 className="mt-0.5 text-[13px] font-semibold leading-tight">{product.name}</h3>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[14px] font-semibold">{product.price}</span>
                    {product.specSheet && (
                      <button className="flex items-center gap-1.5 rounded-lg bg-surface px-3 py-1.5 text-[11px] font-medium text-muted hover:bg-foreground hover:text-white transition-colors">
                        <Download size={12} /> Spec
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
