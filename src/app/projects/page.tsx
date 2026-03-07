"use client";

import { useState } from "react";
import Link from "next/link";
import { projects, architects, products, brands } from "@/lib/mock-data";
import { specifications, productMomentumData, architectInfluenceData, activityFeed } from "@/lib/intelligence-data";
import {
  Search, MapPin, Calendar, Eye, Heart, Download, MessageCircle,
  Grid3x3, List, Filter, ArrowUpRight, ArrowDownRight, Package,
  Users, Building2, FolderKanban, TrendingUp, ChevronRight, BarChart3,
  Globe, Tag, Award
} from "lucide-react";

// Extended project analytics
const projectAnalytics: Record<string, { views: number; saves: number; enquiries: number; downloads: number; growth: number; avgTimeOnPage: string; conversionRate: number }> = {
  "proj-1": { views: 4820, saves: 187, enquiries: 12, downloads: 89, growth: 24, avgTimeOnPage: "3:42", conversionRate: 3.8 },
  "proj-2": { views: 2890, saves: 98, enquiries: 6, downloads: 54, growth: 12, avgTimeOnPage: "2:18", conversionRate: 2.1 },
  "proj-3": { views: 3400, saves: 156, enquiries: 9, downloads: 72, growth: -3, avgTimeOnPage: "4:05", conversionRate: 4.6 },
  "proj-4": { views: 3910, saves: 203, enquiries: 15, downloads: 98, growth: 31, avgTimeOnPage: "3:56", conversionRate: 5.1 },
  "proj-5": { views: 1870, saves: 72, enquiries: 4, downloads: 38, growth: 8, avgTimeOnPage: "2:45", conversionRate: 2.0 },
  "proj-6": { views: 2340, saves: 118, enquiries: 8, downloads: 62, growth: 18, avgTimeOnPage: "3:12", conversionRate: 3.4 },
};

export default function ProjectsDiscoveryPage() {
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState<"popular" | "recent" | "engagement">("popular");

  const allTags = ["All", ...Array.from(new Set(projects.flatMap(p => p.tags)))];
  const allLocations = ["All", ...Array.from(new Set(projects.map(p => p.location.split(", ")[1] || p.location)))];

  let filtered = projects;
  if (tagFilter !== "All") filtered = filtered.filter(p => p.tags.includes(tagFilter));
  if (locationFilter !== "All") filtered = filtered.filter(p => p.location.includes(locationFilter));
  if (search) filtered = filtered.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.architect.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase()));

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "popular") return (projectAnalytics[b.id]?.views || 0) - (projectAnalytics[a.id]?.views || 0);
    if (sort === "engagement") return (projectAnalytics[b.id]?.conversionRate || 0) - (projectAnalytics[a.id]?.conversionRate || 0);
    return b.year - a.year;
  });

  const totalViews = Object.values(projectAnalytics).reduce((s, a) => s + a.views, 0);
  const totalSaves = Object.values(projectAnalytics).reduce((s, a) => s + a.saves, 0);
  const avgConversion = (Object.values(projectAnalytics).reduce((s, a) => s + a.conversionRate, 0) / projects.length).toFixed(1);
  const totalProducts = projects.reduce((s, p) => s + p.products.length, 0);
  const maxViews = Math.max(...Object.values(projectAnalytics).map(a => a.views));

  return (
    <div className="min-h-screen bg-surface/50">
      <div className="border-b border-border bg-white px-8 py-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">Discovery</p>
            <h1 className="mt-1 text-[28px] font-semibold tracking-tight">Projects</h1>
            <p className="mt-1 text-[13px] text-muted">Browse architecture projects across New Zealand — explore products, specifications, and performance data.</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {[
            { label: "Total Projects", value: projects.length.toString(), icon: FolderKanban },
            { label: "Total Views", value: totalViews.toLocaleString(), icon: Eye, change: "+18%" },
            { label: "Total Saves", value: totalSaves.toLocaleString(), icon: Heart },
            { label: "Avg Conversion", value: `${avgConversion}%`, icon: TrendingUp },
            { label: "Products Featured", value: totalProducts.toString(), icon: Package },
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
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-border bg-white p-1">
              {allTags.slice(0, 8).map(t => (
                <button key={t} onClick={() => setTagFilter(t)} className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${tagFilter === t ? "bg-foreground text-white" : "text-muted hover:bg-surface"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className="rounded-lg border border-border bg-white px-3 py-2 text-[12px] text-muted focus:outline-none focus:ring-1 focus:ring-foreground">
              {allLocations.map(l => <option key={l} value={l}>{l === "All" ? "All Regions" : l}</option>)}
            </select>
            <select value={sort} onChange={e => setSort(e.target.value as typeof sort)} className="rounded-lg border border-border bg-white px-3 py-2 text-[12px] text-muted focus:outline-none focus:ring-1 focus:ring-foreground">
              <option value="popular">Most Viewed</option>
              <option value="recent">Most Recent</option>
              <option value="engagement">Highest Engagement</option>
            </select>
            <div className="flex rounded-lg border border-border bg-white p-0.5">
              <button onClick={() => setViewMode("grid")} className={`rounded-md p-1.5 ${viewMode === "grid" ? "bg-foreground text-white" : "text-muted"}`}><Grid3x3 size={14} /></button>
              <button onClick={() => setViewMode("list")} className={`rounded-md p-1.5 ${viewMode === "list" ? "bg-foreground text-white" : "text-muted"}`}><List size={14} /></button>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input type="text" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} className="rounded-lg border border-border bg-white pl-9 pr-3 py-2 text-[12px] w-48 placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-foreground" />
            </div>
          </div>
        </div>

        {/* Grid */}
        {viewMode === "grid" && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map(project => {
              const analytics = projectAnalytics[project.id];
              const architect = architects.find(a => a.id === project.architectId);
              const influence = architectInfluenceData.find(a => a.architectId === project.architectId);
              const spec = specifications.find(s => s.projectId === project.id);
              const projectProducts = project.products.map(pid => products.find(p => p.id === pid)).filter(Boolean);

              return (
                <Link key={project.id} href={`/projects/${project.id}`} className="group rounded-2xl border border-border bg-white overflow-hidden transition-all hover:shadow-md hover:border-foreground/10">
                  <div className="aspect-[16/10] bg-surface relative">
                    <div className="absolute inset-0 flex items-center justify-center text-muted text-[11px]">{project.title}</div>
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      {project.tags.slice(0, 2).map(t => (
                        <span key={t} className="rounded-full bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-foreground">{t}</span>
                      ))}
                    </div>
                    {analytics && (
                      <div className="absolute bottom-3 right-3 rounded-full bg-foreground/80 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-white flex items-center gap-1">
                        <Eye size={9} />{analytics.views.toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-[15px] font-semibold tracking-tight group-hover:text-foreground">{project.title}</h3>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-muted">
                      <span className="flex items-center gap-1"><Users size={10} />{project.architect}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><MapPin size={10} />{project.location}</span>
                    </div>
                    <p className="mt-2 text-[12px] text-muted line-clamp-2">{project.description}</p>

                    {/* Metrics */}
                    <div className="mt-3 grid grid-cols-4 gap-2 pt-3 border-t border-border">
                      {[
                        { label: "Saves", value: analytics?.saves || 0 },
                        { label: "Enquiries", value: analytics?.enquiries || 0 },
                        { label: "Products", value: project.products.length },
                        { label: "Conv.", value: `${analytics?.conversionRate || 0}%` },
                      ].map(m => (
                        <div key={m.label} className="text-center">
                          <p className="text-[13px] font-semibold">{typeof m.value === "number" ? m.value.toLocaleString() : m.value}</p>
                          <p className="text-[9px] text-muted">{m.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Growth indicator */}
                    {analytics && (
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {influence && <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                            influence.tier === "Platinum" ? "bg-foreground text-white" : influence.tier === "Gold" ? "bg-amber-light text-amber" : "bg-surface text-muted"
                          }`}>{influence.tier}</span>}
                          {spec && <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                            spec.status === "approved" ? "bg-emerald-light text-emerald" : spec.status === "review" ? "bg-amber-light text-amber" : "bg-surface text-muted"
                          }`}>Spec: {spec.status}</span>}
                        </div>
                        <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${analytics.growth >= 0 ? "text-emerald" : "text-rose"}`}>
                          {analytics.growth >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}{Math.abs(analytics.growth)}%
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
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
                  <th>Project</th><th>Architect</th><th>Location</th><th>Year</th>
                  <th className="text-right">Views</th><th className="text-right">Saves</th>
                  <th className="text-right">Enquiries</th><th className="text-right">Conv.</th>
                  <th className="text-right">Growth</th><th className="text-right">Products</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(project => {
                  const analytics = projectAnalytics[project.id];
                  return (
                    <tr key={project.id} className="group">
                      <td>
                        <Link href={`/projects/${project.id}`} className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-surface flex items-center justify-center shrink-0"><FolderKanban size={12} className="text-muted" /></div>
                          <div>
                            <span className="text-[13px] font-medium group-hover:underline">{project.title}</span>
                            <div className="flex gap-1 mt-0.5">
                              {project.tags.slice(0, 2).map(t => <span key={t} className="rounded-full bg-surface px-1.5 py-0.5 text-[9px] font-medium text-muted">{t}</span>)}
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td><span className="text-[12px] text-muted">{project.architect}</span></td>
                      <td><span className="text-[12px] text-muted">{project.location}</span></td>
                      <td><span className="text-[12px]">{project.year}</span></td>
                      <td className="text-right"><span className="text-[12px] font-semibold">{analytics?.views.toLocaleString()}</span></td>
                      <td className="text-right"><span className="text-[12px]">{analytics?.saves}</span></td>
                      <td className="text-right"><span className="text-[12px]">{analytics?.enquiries}</span></td>
                      <td className="text-right"><span className="text-[12px] font-medium">{analytics?.conversionRate}%</span></td>
                      <td className="text-right">
                        <span className={`flex items-center justify-end gap-0.5 text-[12px] font-semibold ${(analytics?.growth || 0) >= 0 ? "text-emerald" : "text-rose"}`}>
                          {(analytics?.growth || 0) >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}{Math.abs(analytics?.growth || 0)}%
                        </span>
                      </td>
                      <td className="text-right"><span className="text-[12px]">{project.products.length}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Architect Leaderboard */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-6">
            <h3 className="text-[14px] font-semibold mb-1">Project Views Benchmark</h3>
            <p className="text-[11px] text-muted mb-4">Ranked by total platform views</p>
            <div className="space-y-3">
              {sorted.map((p, i) => {
                const a = projectAnalytics[p.id];
                return (
                  <div key={p.id}>
                    <div className="flex items-center justify-between text-[12px] mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-muted w-4">{i + 1}</span>
                        <span className="font-medium">{p.title}</span>
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
            <h3 className="text-[14px] font-semibold mb-1">Featured Architects</h3>
            <p className="text-[11px] text-muted mb-4">Architects with projects on the platform</p>
            <div className="space-y-3">
              {architects.map(arch => {
                const influence = architectInfluenceData.find(a => a.architectId === arch.id);
                const archProjects = projects.filter(p => p.architectId === arch.id);
                const totalViews = archProjects.reduce((s, p) => s + (projectAnalytics[p.id]?.views || 0), 0);
                return (
                  <Link key={arch.id} href={`/architects/${arch.id}`} className="flex items-center gap-3 rounded-lg p-2 -mx-2 hover:bg-surface/50 transition-colors">
                    <div className="h-9 w-9 rounded-full bg-surface flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-semibold text-muted">{arch.name.split(" ").map(n => n[0]).join("")}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium">{arch.name}</span>
                        <div className="flex items-center gap-2">
                          {influence && <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                            influence.tier === "Platinum" ? "bg-foreground text-white" : influence.tier === "Gold" ? "bg-amber-light text-amber" : "bg-surface text-muted"
                          }`}>{influence.tier}</span>}
                          <span className="text-[11px] font-semibold">{influence?.influenceScore || "—"}</span>
                        </div>
                      </div>
                      <div className="text-[10px] text-muted mt-0.5">
                        {arch.firm} · {arch.location} · {archProjects.length} projects · {totalViews.toLocaleString()} views
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
