"use client";

import { useState } from "react";
import Link from "next/link";
import { products, brands } from "@/lib/mock-data";
import { productMomentumData, designBoards, specifications } from "@/lib/intelligence-data";
import {
  Download, Heart, Search, Grid3x3, List, Filter, TrendingUp, TrendingDown,
  Package, Eye, FolderKanban, ChevronRight, SlidersHorizontal, ArrowUpDown,
  MessageCircle, ExternalLink, Layers, BarChart3, Star
} from "lucide-react";

export default function ProductsPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"name" | "price" | "momentum">("momentum");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const categories = ["All", "Kitchen", "Lighting", "Surfaces", "Furniture", "Roofing", "Outdoor", "Hardware", "Decking"];

  let filtered = filter === "All" ? products : products.filter((p) => p.category === filter);
  if (search) filtered = filtered.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()));

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "momentum") {
      const mA = productMomentumData.find((m) => m.productId === a.id)?.momentumScore || 0;
      const mB = productMomentumData.find((m) => m.productId === b.id)?.momentumScore || 0;
      return mB - mA;
    }
    if (sort === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  // Stats
  const totalSaves = productMomentumData.reduce((s, p) => s + p.metrics.saves, 0);
  const totalViews = productMomentumData.reduce((s, p) => s + p.metrics.views, 0);
  const avgMomentum = Math.round(productMomentumData.reduce((s, p) => s + p.momentumScore, 0) / productMomentumData.length);
  const withSpec = products.filter((p) => p.specSheet).length;

  // Brand breakdown
  const brandCounts = new Map<string, number>();
  products.forEach((p) => {
    brandCounts.set(p.brand, (brandCounts.get(p.brand) || 0) + 1);
  });

  return (
    <div className="min-h-screen bg-surface/50">
      <div className="border-b border-border bg-white px-8 py-6">
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">Library</p>
        <h1 className="mt-1 text-[28px] font-semibold tracking-tight">Saved Products</h1>
        <p className="mt-1 text-[13px] text-muted">Browse and manage your product library with specifications, momentum data, and project usage.</p>
      </div>

      <div className="p-8 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {[
            { label: "Products Saved", value: products.length.toString(), icon: Package },
            { label: "Total Views", value: totalViews.toLocaleString(), icon: Eye },
            { label: "Total Saves", value: totalSaves.toLocaleString(), icon: Heart },
            { label: "Avg Momentum", value: avgMomentum.toString(), icon: TrendingUp },
            { label: "With Spec Sheet", value: `${withSpec}/${products.length}`, icon: Download },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-white p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="rounded-lg bg-surface p-1.5"><s.icon size={13} className="text-muted" /></div>
              </div>
              <p className="text-[20px] font-semibold tracking-tight">{s.value}</p>
              <p className="text-[11px] text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
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
          <div className="flex items-center gap-2">
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="rounded-lg border border-border bg-white px-3 py-2 text-[12px] text-muted focus:outline-none focus:ring-1 focus:ring-foreground">
              <option value="momentum">Sort by Momentum</option>
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
            </select>
            <div className="flex rounded-lg border border-border bg-white p-0.5">
              <button onClick={() => setViewMode("grid")} className={`rounded-md p-1.5 ${viewMode === "grid" ? "bg-foreground text-white" : "text-muted"}`}><Grid3x3 size={14} /></button>
              <button onClick={() => setViewMode("list")} className={`rounded-md p-1.5 ${viewMode === "list" ? "bg-foreground text-white" : "text-muted"}`}><List size={14} /></button>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-lg border border-border bg-white pl-9 pr-3 py-2 text-[12px] w-48 placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-foreground" />
            </div>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {sorted.map((product) => {
              const momentum = productMomentumData.find((m) => m.productId === product.id);
              const inBoards = designBoards.filter((b) => b.productIds.includes(product.id)).length;
              const inSpecs = specifications.reduce((s, spec) => s + spec.rooms.reduce((rs, r) => rs + r.items.filter(i => i.productId === product.id).length, 0), 0);

              return (
                <Link key={product.id} href={`/products/${product.id}`} className="group rounded-2xl border border-border bg-white overflow-hidden transition-all hover:shadow-md hover:border-foreground/10">
                  <div className="aspect-square bg-surface relative flex items-center justify-center">
                    <span className="text-[11px] text-muted">{product.category}</span>
                    {momentum && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold">
                        <TrendingUp size={10} className="text-emerald" />
                        {momentum.momentumScore}
                      </div>
                    )}
                    {momentum && (
                      <div className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                        momentum.trend === "surging" ? "bg-emerald-light text-emerald" :
                        momentum.trend === "rising" ? "bg-blue-light text-blue" :
                        momentum.trend === "cooling" ? "bg-rose-light text-rose" : "bg-surface text-muted"
                      }`}>{momentum.trend}</div>
                    )}
                    <button className="absolute bottom-2 right-2 rounded-full bg-white/90 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Heart size={14} className="text-rose" />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-muted">{product.brand}</p>
                    <h3 className="mt-0.5 text-[13px] font-semibold leading-tight">{product.name}</h3>

                    {/* Metrics row */}
                    {momentum && (
                      <div className="mt-2 flex items-center gap-3 text-[10px] text-muted">
                        <span className="flex items-center gap-0.5"><Eye size={9} />{momentum.metrics.views.toLocaleString()}</span>
                        <span className="flex items-center gap-0.5"><Heart size={9} />{momentum.metrics.saves}</span>
                        <span className="flex items-center gap-0.5"><FolderKanban size={9} />{inBoards}</span>
                        {inSpecs > 0 && <span className="flex items-center gap-0.5"><Layers size={9} />{inSpecs}</span>}
                      </div>
                    )}

                    {/* Mini sparkline */}
                    {momentum && (
                      <div className="mt-2 flex items-end gap-px h-[20px]">
                        {momentum.weeklyData.map((d, i) => {
                          const max = Math.max(...momentum.weeklyData.map(w => w.views));
                          return <div key={i} className="flex-1 rounded-t-sm bg-foreground/20 hover:bg-foreground/40 transition-colors" style={{ height: `${(d.views / max) * 20}px` }} />;
                        })}
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[14px] font-semibold">{product.price}</span>
                      <div className="flex items-center gap-1">
                        {product.specSheet && (
                          <span className="flex items-center gap-1 rounded-lg bg-surface px-2 py-1 text-[10px] font-medium text-muted">
                            <Download size={10} /> Spec
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="rounded-2xl border border-border bg-white overflow-hidden">
            <table className="w-full table-premium">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th className="text-right">Price</th>
                  <th className="text-right">Momentum</th>
                  <th className="text-right">Views</th>
                  <th className="text-right">Saves</th>
                  <th className="text-center">Spec</th>
                  <th className="text-right">Boards</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((product) => {
                  const momentum = productMomentumData.find((m) => m.productId === product.id);
                  const inBoards = designBoards.filter((b) => b.productIds.includes(product.id)).length;
                  return (
                    <tr key={product.id} className="group">
                      <td>
                        <Link href={`/products/${product.id}`} className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-surface shrink-0 flex items-center justify-center">
                            <Package size={12} className="text-muted" />
                          </div>
                          <span className="text-[13px] font-medium group-hover:underline">{product.name}</span>
                        </Link>
                      </td>
                      <td><span className="text-[12px] text-muted">{product.brand}</span></td>
                      <td><span className="text-[11px] text-muted">{product.category}</span></td>
                      <td className="text-right"><span className="text-[13px] font-semibold">{product.price}</span></td>
                      <td className="text-right">
                        {momentum ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <div className="w-12 h-1.5 rounded-full bg-surface overflow-hidden">
                              <div className="h-full rounded-full bg-foreground" style={{ width: `${momentum.momentumScore}%` }} />
                            </div>
                            <span className="text-[12px] font-semibold w-6 text-right">{momentum.momentumScore}</span>
                          </div>
                        ) : <span className="text-[11px] text-muted">—</span>}
                      </td>
                      <td className="text-right"><span className="text-[12px]">{momentum?.metrics.views.toLocaleString() || "—"}</span></td>
                      <td className="text-right"><span className="text-[12px]">{momentum?.metrics.saves || "—"}</span></td>
                      <td className="text-center">
                        {product.specSheet ? (
                          <span className="inline-flex rounded-full bg-emerald-light px-2 py-0.5 text-[10px] font-medium text-emerald">Yes</span>
                        ) : <span className="text-[11px] text-muted">—</span>}
                      </td>
                      <td className="text-right"><span className="text-[12px]">{inBoards || "—"}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom insights */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Brand breakdown */}
          <div className="rounded-2xl border border-border bg-white p-6">
            <h3 className="text-[14px] font-semibold mb-1">Products by Brand</h3>
            <p className="text-[11px] text-muted mb-4">Distribution across your saved product library</p>
            <div className="space-y-3">
              {Array.from(brandCounts.entries()).sort((a, b) => b[1] - a[1]).map(([brand, count]) => (
                <div key={brand}>
                  <div className="flex items-center justify-between text-[12px] mb-1">
                    <span className="font-medium">{brand}</span>
                    <span className="text-muted">{count} products</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface overflow-hidden">
                    <div className="h-full rounded-full bg-foreground/70" style={{ width: `${(count / products.length) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category breakdown */}
          <div className="rounded-2xl border border-border bg-white p-6">
            <h3 className="text-[14px] font-semibold mb-1">Products by Category</h3>
            <p className="text-[11px] text-muted mb-4">Category distribution in your library</p>
            <div className="space-y-3">
              {(() => {
                const catCounts = new Map<string, number>();
                products.forEach((p) => { catCounts.set(p.category, (catCounts.get(p.category) || 0) + 1); });
                return Array.from(catCounts.entries()).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                  <div key={cat}>
                    <div className="flex items-center justify-between text-[12px] mb-1">
                      <span className="font-medium">{cat}</span>
                      <span className="text-muted">{count} products</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface overflow-hidden">
                      <div className="h-full rounded-full bg-foreground/50" style={{ width: `${(count / products.length) * 100}%` }} />
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
