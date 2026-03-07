"use client";

import { useState } from "react";
import Link from "next/link";
import { projects, architects, products } from "@/lib/mock-data";
import { specifications, designBoards, productMomentumData, architectInfluenceData } from "@/lib/intelligence-data";
import {
  MapPin, Search, Plus, FolderKanban, Layers, ClipboardList,
  Grid3x3, List, Eye, Heart, MessageCircle, TrendingUp,
  Package, Activity, BarChart3, Kanban
} from "lucide-react";

const projectPhases = [
  { key: "briefing", label: "Briefing", color: "bg-blue-light text-blue" },
  { key: "design", label: "Design", color: "bg-amber-light text-amber" },
  { key: "construction", label: "Construction", color: "bg-emerald-light text-emerald" },
  { key: "complete", label: "Complete", color: "bg-surface text-muted" },
];

const projectPhaseMap: Record<string, string> = {
  "proj-1": "construction", "proj-2": "design", "proj-3": "complete",
  "proj-4": "construction", "proj-5": "complete", "proj-6": "design",
};

const projectMetrics: Record<string, { views: number; saves: number; enquiries: number; budget: string; completion: number }> = {
  "proj-1": { views: 4820, saves: 187, enquiries: 12, budget: "$850k", completion: 65 },
  "proj-2": { views: 2890, saves: 98, enquiries: 6, budget: "$1.2M", completion: 35 },
  "proj-3": { views: 3400, saves: 156, enquiries: 9, budget: "$420k", completion: 100 },
  "proj-4": { views: 3910, saves: 203, enquiries: 15, budget: "$1.8M", completion: 45 },
  "proj-5": { views: 1870, saves: 72, enquiries: 4, budget: "$2.1M", completion: 100 },
  "proj-6": { views: 2340, saves: 118, enquiries: 8, budget: "$380k", completion: 25 },
};

export default function MyProjectsPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "kanban">("grid");
  const [sort, setSort] = useState<"recent" | "name" | "progress">("recent");
  const tags = ["All", "Residential", "Commercial", "Heritage", "Sustainable", "Luxury", "Urban"];

  let filtered = filter === "All" ? projects : projects.filter((p) => p.tags.includes(filter));
  if (search) filtered = filtered.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()) || p.architect.toLowerCase().includes(search.toLowerCase()));

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "name") return a.title.localeCompare(b.title);
    if (sort === "progress") return (projectMetrics[b.id]?.completion || 0) - (projectMetrics[a.id]?.completion || 0);
    return b.year - a.year;
  });

  const activeProjects = projects.filter(p => projectPhaseMap[p.id] !== "complete").length;
  const totalProducts = projects.reduce((s, p) => s + p.products.length, 0);
  const totalBoards = designBoards.length;
  const totalSpecs = specifications.length;
  const avgCompletion = Math.round(Object.values(projectMetrics).reduce((s, m) => s + m.completion, 0) / projects.length);

  return (
    <div className="min-h-screen bg-surface/50">
      <div className="border-b border-border bg-white px-8 py-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">Workspace</p>
            <h1 className="mt-1 text-[28px] font-semibold tracking-tight">My Projects</h1>
            <p className="mt-1 text-[13px] text-muted">Manage your architecture projects, track progress, and coordinate specifications.</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-[13px] font-medium text-white hover:opacity-90">
            <Plus size={14} /> New Project
          </button>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          {[
            { label: "Total Projects", value: projects.length.toString(), icon: FolderKanban },
            { label: "Active", value: activeProjects.toString(), icon: Activity, accent: "text-emerald" },
            { label: "Avg Completion", value: `${avgCompletion}%`, icon: BarChart3 },
            { label: "Products Tagged", value: totalProducts.toString(), icon: Package },
            { label: "Design Boards", value: totalBoards.toString(), icon: Layers },
            { label: "Specifications", value: totalSpecs.toString(), icon: ClipboardList },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-white p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="rounded-lg bg-surface p-1.5"><s.icon size={13} className={"accent" in s ? String(s.accent) : "text-muted"} /></div>
              </div>
              <p className="text-[20px] font-semibold tracking-tight">{s.value}</p>
              <p className="text-[11px] text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Phase overview bar */}
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-semibold">Project Pipeline</h3>
            <span className="text-[11px] text-muted">{projects.length} projects total</span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden bg-surface">
            {projectPhases.map((phase) => {
              const count = projects.filter(p => projectPhaseMap[p.id] === phase.key).length;
              return <div key={phase.key} className={`${phase.key === "briefing" ? "bg-blue" : phase.key === "design" ? "bg-amber" : phase.key === "construction" ? "bg-emerald" : "bg-border"} transition-all`} style={{ width: `${(count / projects.length) * 100}%` }} />;
            })}
          </div>
          <div className="flex items-center gap-4 mt-2">
            {projectPhases.map((phase) => {
              const count = projects.filter(p => projectPhaseMap[p.id] === phase.key).length;
              return (
                <span key={phase.key} className="flex items-center gap-1.5 text-[10px] text-muted">
                  <span className={`h-2 w-2 rounded-full ${phase.key === "briefing" ? "bg-blue" : phase.key === "design" ? "bg-amber" : phase.key === "construction" ? "bg-emerald" : "bg-border"}`} />
                  {phase.label} ({count})
                </span>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg border border-border bg-white p-1">
              {tags.map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${filter === f ? "bg-foreground text-white" : "text-muted hover:bg-surface"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="rounded-lg border border-border bg-white px-3 py-2 text-[12px] text-muted focus:outline-none focus:ring-1 focus:ring-foreground">
              <option value="recent">Sort: Recent</option>
              <option value="name">Sort: Name</option>
              <option value="progress">Sort: Progress</option>
            </select>
            <div className="flex rounded-lg border border-border bg-white p-0.5">
              <button onClick={() => setViewMode("grid")} className={`rounded-md p-1.5 ${viewMode === "grid" ? "bg-foreground text-white" : "text-muted"}`}><Grid3x3 size={14} /></button>
              <button onClick={() => setViewMode("list")} className={`rounded-md p-1.5 ${viewMode === "list" ? "bg-foreground text-white" : "text-muted"}`}><List size={14} /></button>
              <button onClick={() => setViewMode("kanban")} className={`rounded-md p-1.5 ${viewMode === "kanban" ? "bg-foreground text-white" : "text-muted"}`}><Kanban size={14} /></button>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input type="text" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-lg border border-border bg-white pl-9 pr-3 py-2 text-[12px] w-48 placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-foreground" />
            </div>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((project) => {
              const spec = specifications.find((s) => s.projectId === project.id);
              const boards = designBoards.filter((b) => b.projectId === project.id);
              const metrics = projectMetrics[project.id] || { views: 0, saves: 0, enquiries: 0, budget: "—", completion: 0 };
              const phase = projectPhaseMap[project.id] || "briefing";
              const phaseConfig = projectPhases.find(p => p.key === phase)!;

              return (
                <Link key={project.id} href={`/projects/${project.id}`} className="group rounded-2xl border border-border bg-white overflow-hidden transition-all hover:shadow-md hover:border-foreground/10">
                  <div className="aspect-[16/10] bg-surface relative">
                    <div className="absolute inset-0 flex items-center justify-center text-muted text-[11px]">{project.title}</div>
                    <div className={`absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${phaseConfig.color}`}>{phaseConfig.label}</div>
                    {spec && (
                      <div className={`absolute top-3 right-3 rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                        spec.status === "approved" ? "bg-emerald-light text-emerald" : spec.status === "review" ? "bg-amber-light text-amber" : "bg-surface text-muted"
                      }`}>{spec.status}</div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-[11px] text-muted">
                      <span>{project.architect}</span><span>·</span><span>{project.year}</span><span>·</span><span>{metrics.budget}</span>
                    </div>
                    <h3 className="mt-1 text-[15px] font-semibold tracking-tight group-hover:text-foreground">{project.title}</h3>
                    <p className="mt-0.5 flex items-center gap-1 text-[12px] text-muted"><MapPin size={11} />{project.location}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-surface overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${metrics.completion === 100 ? "bg-emerald" : "bg-foreground"}`} style={{ width: `${metrics.completion}%` }} />
                      </div>
                      <span className="text-[10px] font-semibold text-muted">{metrics.completion}%</span>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-[10px] text-muted">
                      <span className="flex items-center gap-0.5"><Eye size={9} />{metrics.views.toLocaleString()}</span>
                      <span className="flex items-center gap-0.5"><Heart size={9} />{metrics.saves}</span>
                      <span className="flex items-center gap-0.5"><MessageCircle size={9} />{metrics.enquiries}</span>
                      <span className="flex items-center gap-0.5"><Package size={9} />{project.products.length}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex flex-wrap gap-1.5">
                        {project.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-muted">{tag}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted"><Layers size={9} />{boards.length}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="rounded-2xl border border-border bg-white overflow-hidden">
            <table className="w-full table-premium">
              <thead>
                <tr>
                  <th>Project</th><th>Architect</th><th>Location</th><th className="text-center">Phase</th>
                  <th className="text-right">Budget</th><th className="text-right">Progress</th>
                  <th className="text-right">Views</th><th className="text-right">Products</th>
                  <th className="text-right">Boards</th><th className="text-center">Spec</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((project) => {
                  const spec = specifications.find((s) => s.projectId === project.id);
                  const boards = designBoards.filter((b) => b.projectId === project.id);
                  const metrics = projectMetrics[project.id] || { views: 0, saves: 0, enquiries: 0, budget: "—", completion: 0 };
                  const phase = projectPhaseMap[project.id] || "briefing";
                  const phaseConfig = projectPhases.find(p => p.key === phase)!;
                  return (
                    <tr key={project.id} className="group">
                      <td>
                        <Link href={`/projects/${project.id}`} className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-surface shrink-0 flex items-center justify-center"><FolderKanban size={12} className="text-muted" /></div>
                          <div>
                            <span className="text-[13px] font-medium group-hover:underline">{project.title}</span>
                            <p className="text-[10px] text-muted">{project.year}</p>
                          </div>
                        </Link>
                      </td>
                      <td><span className="text-[12px] text-muted">{project.architect}</span></td>
                      <td><span className="text-[12px] text-muted">{project.location}</span></td>
                      <td className="text-center"><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${phaseConfig.color}`}>{phaseConfig.label}</span></td>
                      <td className="text-right"><span className="text-[12px] font-semibold">{metrics.budget}</span></td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="w-12 h-1.5 rounded-full bg-surface overflow-hidden">
                            <div className={`h-full rounded-full ${metrics.completion === 100 ? "bg-emerald" : "bg-foreground"}`} style={{ width: `${metrics.completion}%` }} />
                          </div>
                          <span className="text-[11px] font-semibold w-8 text-right">{metrics.completion}%</span>
                        </div>
                      </td>
                      <td className="text-right"><span className="text-[12px]">{metrics.views.toLocaleString()}</span></td>
                      <td className="text-right"><span className="text-[12px]">{project.products.length}</span></td>
                      <td className="text-right"><span className="text-[12px]">{boards.length}</span></td>
                      <td className="text-center">
                        {spec ? (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            spec.status === "approved" ? "bg-emerald-light text-emerald" : spec.status === "review" ? "bg-amber-light text-amber" : "bg-surface text-muted"
                          }`}>{spec.status}</span>
                        ) : <span className="text-[11px] text-muted">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Kanban View */}
        {viewMode === "kanban" && (
          <div className="grid grid-cols-4 gap-4">
            {projectPhases.map((phase) => {
              const phaseProjects = sorted.filter(p => projectPhaseMap[p.id] === phase.key);
              return (
                <div key={phase.key} className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${phase.color}`}>{phase.label}</span>
                      <span className="text-[11px] text-muted">{phaseProjects.length}</span>
                    </div>
                  </div>
                  <div className="space-y-3 min-h-[200px]">
                    {phaseProjects.map((project) => {
                      const spec = specifications.find((s) => s.projectId === project.id);
                      const boards = designBoards.filter((b) => b.projectId === project.id);
                      const metrics = projectMetrics[project.id] || { views: 0, saves: 0, enquiries: 0, budget: "—", completion: 0 };
                      return (
                        <Link key={project.id} href={`/projects/${project.id}`} className="block rounded-xl border border-border bg-white p-3 hover:shadow-md hover:border-foreground/10 transition-all">
                          <div className="flex items-center justify-between text-[10px] text-muted mb-1.5">
                            <span>{project.architect}</span><span>{project.year}</span>
                          </div>
                          <h4 className="text-[13px] font-semibold">{project.title}</h4>
                          <p className="text-[11px] text-muted flex items-center gap-1 mt-0.5"><MapPin size={9} />{project.location}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-1 rounded-full bg-surface overflow-hidden">
                              <div className={`h-full rounded-full ${metrics.completion === 100 ? "bg-emerald" : "bg-foreground"}`} style={{ width: `${metrics.completion}%` }} />
                            </div>
                            <span className="text-[9px] font-semibold text-muted">{metrics.completion}%</span>
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-[9px] text-muted">
                            <span className="flex items-center gap-0.5"><Package size={8} />{project.products.length}</span>
                            <span className="flex items-center gap-0.5"><Layers size={8} />{boards.length}</span>
                            {spec && <span className={`rounded-full px-1 py-0.5 text-[8px] font-semibold ${
                              spec.status === "approved" ? "bg-emerald-light text-emerald" : spec.status === "review" ? "bg-amber-light text-amber" : "bg-surface"
                            }`}>{spec.status}</span>}
                            <span className="ml-auto font-semibold">{metrics.budget}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Benchmarks */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-6">
            <h3 className="text-[14px] font-semibold mb-1">Project Engagement</h3>
            <p className="text-[11px] text-muted mb-4">Views and saves across your projects</p>
            <div className="space-y-3">
              {projects.sort((a, b) => (projectMetrics[b.id]?.views || 0) - (projectMetrics[a.id]?.views || 0)).map((p) => {
                const m = projectMetrics[p.id];
                const maxViews = Math.max(...Object.values(projectMetrics).map(pm => pm.views));
                return (
                  <div key={p.id}>
                    <div className="flex items-center justify-between text-[12px] mb-1">
                      <span className="font-medium">{p.title}</span>
                      <div className="flex items-center gap-2 text-muted">
                        <span className="flex items-center gap-0.5"><Eye size={10} />{m.views.toLocaleString()}</span>
                        <span className="flex items-center gap-0.5"><Heart size={10} />{m.saves}</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-surface overflow-hidden">
                      <div className="h-full rounded-full bg-foreground/60" style={{ width: `${(m.views / maxViews) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6">
            <h3 className="text-[14px] font-semibold mb-1">Architect Performance</h3>
            <p className="text-[11px] text-muted mb-4">Influence scores of architects on your projects</p>
            <div className="space-y-3">
              {architects.sort((a, b) => {
                const iA = architectInfluenceData.find(i => i.architectId === a.id)?.influenceScore || 0;
                const iB = architectInfluenceData.find(i => i.architectId === b.id)?.influenceScore || 0;
                return iB - iA;
              }).slice(0, 5).map((arch) => {
                const influence = architectInfluenceData.find(i => i.architectId === arch.id);
                const archProjects = projects.filter(p => p.architectId === arch.id);
                return (
                  <div key={arch.id} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-surface flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-semibold text-muted">{arch.name.split(" ").map(n => n[0]).join("")}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium">{arch.name}</span>
                        <div className="flex items-center gap-1.5">
                          {influence && <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                            influence.tier === "Platinum" ? "bg-foreground text-white" : influence.tier === "Gold" ? "bg-amber-light text-amber" : "bg-surface text-muted"
                          }`}>{influence.tier}</span>}
                          <span className="text-[11px] font-semibold">{influence?.influenceScore || "—"}</span>
                        </div>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-surface overflow-hidden">
                        <div className="h-full rounded-full bg-foreground" style={{ width: `${influence?.influenceScore || 0}%` }} />
                      </div>
                      <p className="text-[10px] text-muted mt-0.5">{archProjects.length} project{archProjects.length !== 1 ? "s" : ""} · {arch.firm}</p>
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
