"use client";

import { useState } from "react";
import Link from "next/link";
import { brands, products } from "@/lib/mock-data";
import { productMomentumData, architectInfluenceData } from "@/lib/intelligence-data";
import {
  Search, Package, Eye, Heart, Download, TrendingUp, ArrowUpRight,
  ArrowDownRight, Grid3x3, List, Building2, Users, BarChart3,
  MessageCircle, Star, Award, ChevronRight, Globe, Filter
} from "lucide-react";

// Brand analytics
const brandAnalytics: Record<string, { views: number; saves: number; downloads: number; enquiries: number; growth: number; architectAdoption: number; projectsTagged: number; avgMomentum: number; responseTime: string }> = {
  "brand-1": { views: 6420, saves: 276, downloads: 198, enquiries: 34, growth: 14, architectAdoption: 67, projectsTagged: 4, avgMomentum: 72, responseTime: "2.4h" },
  "brand-2": { views: 12680, saves: 601, downloads: 423, enquiries: 62, growth: 38, architectAdoption: 83, projectsTagged: 5, avgMomentum: 75, responseTime: "1.8h" },
  "brand-3": { views: 9870, saves: 470, downloads: 312, enquiries: 48, growth: 28, architectAdoption: 78, projectsTagged: 5, avgMomentum: 88, responseTime: "3.1h" },
  "brand-4": { views: 6500, saves: 365, downloads: 198, enquiries: 29, growth: 22, architectAdoption: 50, projectsTagged: 3, avgMomentum: 70, responseTime: "4.2h" },
  "brand-5": { views: 4520, saves: 180, downloads: 142, enquiries: 21, growth: 8, architectAdoption: 50, projectsTagged: 2, avgMomentum: 65, responseTime: "5.8h" },
  "brand-6": { views: 2780, saves: 119, downloads: 87, enquiries: 18, growth: -2, architectAdoption: 33, projectsTagged: 3, avgMomentum: 47, responseTime: "6.1h" },
};

export default function BrandsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState<"popular" | "growth" | "adoption">("popular");

  const categories = ["All", ...Array.from(new Set(brands.map(b => b.category)))];

  let filtered = categoryFilter === "All" ? brands : brands.filter(b => b.category === categoryFilter);
  if (search) filtered = filtered.filter(b => b.name.toLowerCase().includes(search.toLowerCase()) || b.category.toLowerCase().includes(search.toLowerCase()));

  const sorted = [...filtered].sort((a, b) => {
    const aA = brandAnalytics[a.id], bA = brandAnalytics[b.id];
    if (sort === "popular") return (bA?.views || 0) - (aA?.views || 0);
    if (sort === "growth") return (bA?.growth || 0) - (aA?.growth || 0);
    return (bA?.architectAdoption || 0) - (aA?.architectAdoption || 0);
  });

  const totalViews = Object.values(brandAnalytics).reduce((s, a) => s + a.views, 0);
  const totalProducts = brands.reduce((s, b) => s + b.productCount, 0);
  const avgGrowth = Math.round(Object.values(brandAnalytics).reduce((s, a) => s + a.growth, 0) / brands.length);
  const avgAdoption = Math.round(Object.values(brandAnalytics).reduce((s, a) => s + a.architectAdoption, 0) / brands.length);
  const maxViews = Math.max(...Object.values(brandAnalytics).map(a => a.views));

  return (
    <div className="min-h-screen bg-surface/50">
      <div className="border-b border-border bg-white px-8 py-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">Discovery</p>
            <h1 className="mt-1 text-[28px] font-semibold tracking-tight">Brands</h1>
            <p className="mt-1 text-[13px] text-muted">Explore suppliers and manufacturers — product catalogues, architect adoption, and performance analytics.</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {[
            { label: "Total Brands", value: brands.length.toString(), icon: Building2 },
            { label: "Total Products", value: totalProducts.toString(), icon: Package },
            { label: "Platform Views", value: totalViews.toLocaleString(), icon: Eye, change: `+${avgGrowth}%` },
            { label: "Avg Adoption", value: `${avgAdoption}%`, icon: Users },
            { label: "Avg Growth", value: `+${avgGrowth}%`, icon: TrendingUp },
          ].map(kpi => (
            <div key={kpi.label} className="rounded-2xl border border-border bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="rounded-lg bg-surface p-1.5"><kpi.icon size={13} className="text-muted" /></div>
                {"change" in kpi && kpi.change && <span className="text-[10px] font-semibold text-emerald flex items-center gap-0.5"><ArrowUpRight size={9} />{kpi.change}</span>}
              </div>
              <p className="text-[20px] font-semibold tracking-tight">{kpi.value}</p>
              <p className="text-[11px] text-muted">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-white p-1">
            {categories.map(c => (
              <button key={c} onClick={() => setCategoryFilter(c)} className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${categoryFilter === c ? "bg-foreground text-white" : "text-muted hover:bg-surface"}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <select value={sort} onChange={e => setSort(e.target.value as typeof sort)} className="rounded-lg border border-border bg-white px-3 py-2 text-[12px] text-muted focus:outline-none focus:ring-1 focus:ring-foreground">
              <option value="popular">Most Viewed</option>
              <option value="growth">Highest Growth</option>
              <option value="adoption">Architect Adoption</option>
            </select>
            <div className="flex rounded-lg border border-border bg-white p-0.5">
              <button onClick={() => setViewMode("grid")} className={`rounded-md p-1.5 ${viewMode === "grid" ? "bg-foreground text-white" : "text-muted"}`}><Grid3x3 size={14} /></button>
              <button onClick={() => setViewMode("list")} className={`rounded-md p-1.5 ${viewMode === "list" ? "bg-foreground text-white" : "text-muted"}`}><List size={14} /></button>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input type="text" placeholder="Search brands..." value={search} onChange={e => setSearch(e.target.value)} className="rounded-lg border border-border bg-white pl-9 pr-3 py-2 text-[12px] w-48 placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-foreground" />
            </div>
          </div>
        </div>

        {/* Grid */}
        {viewMode === "grid" && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map(brand => {
              const analytics = brandAnalytics[brand.id];
              const brandProducts = products.filter(p => p.brandId === brand.id);
              const momentum = productMomentumData.filter(p => p.brandId === brand.id);
              const topMomentum = momentum.sort((a, b) => b.momentumScore - a.momentumScore)[0];

              return (
                <div key={brand.id} className="group rounded-2xl border border-border bg-white overflow-hidden transition-all hover:shadow-md hover:border-foreground/10">
                  <div className="h-24 bg-surface relative flex items-center justify-center">
                    <div className="h-14 w-14 rounded-xl bg-foreground flex items-center justify-center">
                      <span className="text-sm font-bold text-white">{brand.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
                    </div>
                    <span className="absolute top-3 right-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-muted">{brand.category}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-[15px] font-semibold tracking-tight">{brand.name}</h3>
                    <p className="mt-0.5 text-[12px] text-muted line-clamp-2">{brand.description}</p>

                    {/* Key metrics */}
                    <div className="mt-3 grid grid-cols-4 gap-2 pt-3 border-t border-border">
                      {[
                        { label: "Products", value: brand.productCount },
                        { label: "Views", value: analytics?.views.toLocaleString() || "0" },
                        { label: "Adoption", value: `${analytics?.architectAdoption || 0}%` },
                        { label: "Growth", value: `${analytics?.growth >= 0 ? "+" : ""}${analytics?.growth || 0}%` },
                      ].map(m => (
                        <div key={m.label} className="text-center">
                          <p className="text-[13px] font-semibold">{m.value}</p>
                          <p className="text-[9px] text-muted">{m.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Top product momentum */}
                    {topMomentum && (
                      <div className="mt-3 rounded-lg bg-surface/50 p-2.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] text-muted">Top Product</p>
                            <p className="text-[12px] font-medium">{topMomentum.productName}</p>
                          </div>
                          <div className="text-right">
                            <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                              topMomentum.trend === "surging" ? "bg-rose-light text-rose" : topMomentum.trend === "rising" ? "bg-emerald-light text-emerald" : "bg-surface text-muted"
                            }`}>{topMomentum.trend}</span>
                            <p className="text-[11px] font-semibold mt-0.5">{topMomentum.momentumScore}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sample products */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex -space-x-1">
                        {brandProducts.slice(0, 4).map((p, i) => (
                          <div key={p.id} className="h-6 w-6 rounded-full bg-surface border-2 border-white flex items-center justify-center">
                            <Package size={8} className="text-muted" />
                          </div>
                        ))}
                        {brandProducts.length > 4 && (
                          <div className="h-6 w-6 rounded-full bg-foreground border-2 border-white flex items-center justify-center">
                            <span className="text-[7px] font-bold text-white">+{brandProducts.length - 4}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-muted flex items-center gap-0.5">
                        <MessageCircle size={9} />{analytics?.enquiries || 0} enquiries
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List */}
        {viewMode === "list" && (
          <div className="rounded-2xl border border-border bg-white overflow-hidden">
            <table className="w-full table-premium">
              <thead>
                <tr>
                  <th>Brand</th><th>Category</th><th className="text-right">Products</th>
                  <th className="text-right">Views</th><th className="text-right">Saves</th>
                  <th className="text-right">Downloads</th><th className="text-right">Enquiries</th>
                  <th className="text-right">Adoption</th><th className="text-right">Growth</th>
                  <th className="text-right">Resp. Time</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(brand => {
                  const analytics = brandAnalytics[brand.id];
                  return (
                    <tr key={brand.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center shrink-0">
                            <span className="text-[8px] font-bold text-white">{brand.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
                          </div>
                          <div>
                            <span className="text-[12px] font-medium">{brand.name}</span>
                            <p className="text-[10px] text-muted">{analytics?.projectsTagged || 0} projects</p>
                          </div>
                        </div>
                      </td>
                      <td><span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-muted">{brand.category}</span></td>
                      <td className="text-right"><span className="text-[12px] font-semibold">{brand.productCount}</span></td>
                      <td className="text-right"><span className="text-[12px]">{analytics?.views.toLocaleString()}</span></td>
                      <td className="text-right"><span className="text-[12px]">{analytics?.saves}</span></td>
                      <td className="text-right"><span className="text-[12px]">{analytics?.downloads}</span></td>
                      <td className="text-right"><span className="text-[12px]">{analytics?.enquiries}</span></td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="w-12 h-1.5 rounded-full bg-surface overflow-hidden">
                            <div className="h-full rounded-full bg-foreground" style={{ width: `${analytics?.architectAdoption || 0}%` }} />
                          </div>
                          <span className="text-[11px] font-semibold w-8 text-right">{analytics?.architectAdoption}%</span>
                        </div>
                      </td>
                      <td className="text-right">
                        <span className={`flex items-center justify-end gap-0.5 text-[12px] font-semibold ${(analytics?.growth || 0) >= 0 ? "text-emerald" : "text-rose"}`}>
                          {(analytics?.growth || 0) >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}{Math.abs(analytics?.growth || 0)}%
                        </span>
                      </td>
                      <td className="text-right"><span className="text-[12px] text-muted">{analytics?.responseTime}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Brand benchmarks */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-6">
            <h3 className="text-[14px] font-semibold mb-1">Views Benchmark</h3>
            <p className="text-[11px] text-muted mb-4">Total platform engagement by brand</p>
            <div className="space-y-3">
              {sorted.map((brand, i) => {
                const a = brandAnalytics[brand.id];
                return (
                  <div key={brand.id}>
                    <div className="flex items-center justify-between text-[12px] mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-muted w-4">{i + 1}</span>
                        <span className="font-medium">{brand.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${a.growth >= 0 ? "text-emerald" : "text-rose"}`}>
                          {a.growth >= 0 ? "+" : ""}{a.growth}%
                        </span>
                        <span className="font-semibold">{a.views.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-surface overflow-hidden">
                      <div className="h-full rounded-full bg-foreground/60" style={{ width: `${(a.views / maxViews) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6">
            <h3 className="text-[14px] font-semibold mb-1">Architect Adoption Rate</h3>
            <p className="text-[11px] text-muted mb-4">% of active architects engaging with brand products</p>
            <div className="space-y-3">
              {sorted.sort((a, b) => (brandAnalytics[b.id]?.architectAdoption || 0) - (brandAnalytics[a.id]?.architectAdoption || 0)).map((brand, i) => {
                const a = brandAnalytics[brand.id];
                return (
                  <div key={brand.id}>
                    <div className="flex items-center justify-between text-[12px] mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-muted w-4">{i + 1}</span>
                        <span className="font-medium">{brand.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted">{a.enquiries} enquiries</span>
                        <span className="font-semibold">{a.architectAdoption}%</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-surface overflow-hidden">
                      <div className="h-full rounded-full bg-emerald/60" style={{ width: `${a.architectAdoption}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
