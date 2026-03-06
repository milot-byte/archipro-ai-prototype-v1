"use client";

import { useState } from "react";
import Link from "next/link";
import { architects, projects, products } from "@/lib/mock-data";
import { architectInfluenceData, designBoards, specifications } from "@/lib/intelligence-data";
import {
  Search, MapPin, FolderOpen, Crown, Heart, ExternalLink, Grid3x3, List,
  TrendingUp, Users, Star, ChevronRight, BarChart3, Eye, MessageCircle,
  Building2, Award, Filter
} from "lucide-react";

export default function ArchitectsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState<"influence" | "projects" | "name">("influence");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const specialties = ["All", ...new Set(architects.flatMap((a) => a.specialties))];

  let filtered = architects;
  if (filter !== "All") filtered = filtered.filter((a) => a.specialties.includes(filter));
  if (search) filtered = filtered.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.firm.toLowerCase().includes(search.toLowerCase()));

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "influence") {
      const iA = architectInfluenceData.find((i) => i.architectId === a.id)?.influenceScore || 0;
      const iB = architectInfluenceData.find((i) => i.architectId === b.id)?.influenceScore || 0;
      return iB - iA;
    }
    if (sort === "projects") return b.projectCount - a.projectCount;
    return a.name.localeCompare(b.name);
  });

  // Stats
  const avgInfluence = Math.round(architectInfluenceData.reduce((s, a) => s + a.influenceScore, 0) / architectInfluenceData.length);
  const totalProjects = architects.reduce((s, a) => s + a.projectCount, 0);
  const totalEnquiries = architectInfluenceData.reduce((s, a) => s + a.metrics.enquiriesGenerated, 0);
  const platinumCount = architectInfluenceData.filter((a) => a.tier === "Platinum").length;

  return (
    <div className="min-h-screen bg-surface/50">
      <div className="border-b border-border bg-white px-8 py-6">
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">Directory</p>
        <h1 className="mt-1 text-[28px] font-semibold tracking-tight">Saved Professionals</h1>
        <p className="mt-1 text-[13px] text-muted">Architecture studios and professionals you&apos;ve connected with, with influence intelligence.</p>
      </div>

      <div className="p-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {[
            { label: "Professionals", value: architects.length.toString(), icon: Users },
            { label: "Total Projects", value: totalProjects.toString(), icon: FolderOpen },
            { label: "Avg Influence", value: avgInfluence.toString(), icon: Star },
            { label: "Enquiries Generated", value: totalEnquiries.toString(), icon: MessageCircle },
            { label: "Platinum Tier", value: platinumCount.toString(), icon: Crown },
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
              {specialties.slice(0, 8).map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${filter === f ? "bg-foreground text-white" : "text-muted hover:bg-surface"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="rounded-lg border border-border bg-white px-3 py-2 text-[12px] text-muted focus:outline-none focus:ring-1 focus:ring-foreground">
              <option value="influence">Sort by Influence</option>
              <option value="projects">Sort by Projects</option>
              <option value="name">Sort by Name</option>
            </select>
            <div className="flex rounded-lg border border-border bg-white p-0.5">
              <button onClick={() => setViewMode("grid")} className={`rounded-md p-1.5 ${viewMode === "grid" ? "bg-foreground text-white" : "text-muted"}`}><Grid3x3 size={14} /></button>
              <button onClick={() => setViewMode("list")} className={`rounded-md p-1.5 ${viewMode === "list" ? "bg-foreground text-white" : "text-muted"}`}><List size={14} /></button>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-lg border border-border bg-white pl-9 pr-3 py-2 text-[12px] w-48 placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-foreground" />
            </div>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === "grid" ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((arch) => {
              const influence = architectInfluenceData.find((a) => a.architectId === arch.id);
              const archProjects = projects.filter((p) => p.architectId === arch.id);
              const archBoards = designBoards.filter((b) => b.owner.name === arch.name);

              return (
                <Link key={arch.id} href={`/architects/${arch.id}`} className="group rounded-2xl border border-border bg-white overflow-hidden transition-all hover:shadow-md hover:border-foreground/10">
                  <div className="h-28 bg-surface relative">
                    {influence && (
                      <div className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                        influence.tier === "Platinum" ? "bg-foreground text-white" :
                        influence.tier === "Gold" ? "bg-amber-light text-amber" :
                        "bg-surface text-muted"
                      }`}>{influence.tier}</div>
                    )}
                  </div>
                  <div className="p-4 -mt-8 relative">
                    <div className="flex items-end gap-3">
                      <div className="h-14 w-14 rounded-full bg-white border-4 border-white shadow-sm flex items-center justify-center bg-surface shrink-0">
                        <span className="text-[11px] font-semibold text-muted">{arch.name.split(" ").map((n) => n[0]).join("")}</span>
                      </div>
                      {influence && (
                        <div className="mb-1 flex items-center gap-1.5">
                          <div className="flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold">
                            <Star size={10} className="text-amber" />
                            {influence.influenceScore}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-2">
                      <h3 className="text-[15px] font-semibold group-hover:text-foreground">{arch.name}</h3>
                      <p className="text-[12px] text-muted">{arch.firm}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted"><MapPin size={10} />{arch.location}</p>
                    </div>
                    <p className="mt-2 text-[12px] text-muted line-clamp-2 leading-relaxed">{arch.bio}</p>

                    {/* Influence trend mini bar */}
                    {influence && (
                      <div className="mt-3 flex items-end gap-px h-[16px]">
                        {influence.monthlyTrend.map((t, i) => {
                          const max = Math.max(...influence.monthlyTrend.map(m => m.score));
                          return <div key={i} className="flex-1 rounded-t-sm bg-foreground/20" style={{ height: `${(t.score / max) * 16}px` }} />;
                        })}
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                      <div className="flex flex-wrap gap-1.5">
                        {arch.specialties.slice(0, 3).map((s) => (
                          <span key={s} className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-muted">{s}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted">
                        <span className="flex items-center gap-0.5"><FolderOpen size={10} />{arch.projectCount}</span>
                        {influence && <span className="flex items-center gap-0.5"><BarChart3 size={10} />{influence.metrics.boardsCreated} boards</span>}
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
                  <th>Architect</th>
                  <th>Firm</th>
                  <th>Location</th>
                  <th className="text-right">Influence</th>
                  <th className="text-center">Tier</th>
                  <th className="text-right">Projects</th>
                  <th className="text-right">Discoveries</th>
                  <th className="text-right">Enquiries</th>
                  <th>Specialties</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((arch) => {
                  const influence = architectInfluenceData.find((a) => a.architectId === arch.id);
                  return (
                    <tr key={arch.id} className="group">
                      <td>
                        <Link href={`/architects/${arch.id}`} className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-surface shrink-0 flex items-center justify-center">
                            <span className="text-[9px] font-semibold text-muted">{arch.name.split(" ").map(n => n[0]).join("")}</span>
                          </div>
                          <span className="text-[13px] font-medium group-hover:underline">{arch.name}</span>
                        </Link>
                      </td>
                      <td><span className="text-[12px] text-muted">{arch.firm}</span></td>
                      <td><span className="text-[12px] text-muted">{arch.location}</span></td>
                      <td className="text-right">
                        {influence ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <div className="w-12 h-1.5 rounded-full bg-surface overflow-hidden">
                              <div className="h-full rounded-full bg-foreground" style={{ width: `${influence.influenceScore}%` }} />
                            </div>
                            <span className="text-[12px] font-semibold w-6 text-right">{influence.influenceScore}</span>
                          </div>
                        ) : <span className="text-[11px] text-muted">—</span>}
                      </td>
                      <td className="text-center">
                        {influence && (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            influence.tier === "Platinum" ? "bg-foreground text-white" :
                            influence.tier === "Gold" ? "bg-amber-light text-amber" :
                            "bg-surface text-muted"
                          }`}>{influence.tier}</span>
                        )}
                      </td>
                      <td className="text-right"><span className="text-[12px] font-medium">{arch.projectCount}</span></td>
                      <td className="text-right"><span className="text-[12px]">{influence?.metrics.productDiscoveries.toLocaleString() || "—"}</span></td>
                      <td className="text-right"><span className="text-[12px]">{influence?.metrics.enquiriesGenerated || "—"}</span></td>
                      <td>
                        <div className="flex gap-1">
                          {arch.specialties.slice(0, 2).map((s) => (
                            <span key={s} className="rounded-full bg-surface px-2 py-0.5 text-[9px] font-medium text-muted">{s}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom insights */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-6">
            <h3 className="text-[14px] font-semibold mb-1">Influence Distribution</h3>
            <p className="text-[11px] text-muted mb-4">Score distribution across saved professionals</p>
            <div className="space-y-3">
              {architectInfluenceData.sort((a, b) => b.influenceScore - a.influenceScore).map((arch) => (
                <div key={arch.architectId}>
                  <div className="flex items-center justify-between text-[12px] mb-1">
                    <span className="font-medium">{arch.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                        arch.tier === "Platinum" ? "bg-foreground text-white" :
                        arch.tier === "Gold" ? "bg-amber-light text-amber" :
                        "bg-surface text-muted"
                      }`}>{arch.tier}</span>
                      <span className="text-muted font-semibold">{arch.influenceScore}</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-surface overflow-hidden">
                    <div className="h-full rounded-full bg-foreground transition-all" style={{ width: `${arch.influenceScore}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6">
            <h3 className="text-[14px] font-semibold mb-1">Specialty Coverage</h3>
            <p className="text-[11px] text-muted mb-4">Specialties represented in your saved professionals</p>
            <div className="space-y-3">
              {(() => {
                const specCounts = new Map<string, number>();
                architects.forEach((a) => a.specialties.forEach((s) => { specCounts.set(s, (specCounts.get(s) || 0) + 1); }));
                return Array.from(specCounts.entries()).sort((a, b) => b[1] - a[1]).map(([spec, count]) => (
                  <div key={spec}>
                    <div className="flex items-center justify-between text-[12px] mb-1">
                      <span className="font-medium">{spec}</span>
                      <span className="text-muted">{count} architect{count !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface overflow-hidden">
                      <div className="h-full rounded-full bg-foreground/50" style={{ width: `${(count / architects.length) * 100}%` }} />
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>

        {/* Architect benchmarks */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="text-[14px] font-semibold mb-1">Performance Benchmarks</h3>
          <p className="text-[11px] text-muted mb-5">Comparative metrics across your saved architects</p>

          <div className="grid grid-cols-5 gap-6">
            {/* Discoveries */}
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted mb-3">Product Discoveries</p>
              <div className="space-y-2">
                {architectInfluenceData.sort((a, b) => b.metrics.productDiscoveries - a.metrics.productDiscoveries).map((arch) => {
                  const max = Math.max(...architectInfluenceData.map(a => a.metrics.productDiscoveries));
                  return (
                    <div key={arch.architectId} className="flex items-center gap-2">
                      <div className="w-14 truncate text-[10px] font-medium">{arch.name.split(" ")[1]}</div>
                      <div className="flex-1 h-3 rounded-sm bg-surface overflow-hidden">
                        <div className="h-full bg-foreground/30 rounded-sm" style={{ width: `${(arch.metrics.productDiscoveries / max) * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-muted w-10 text-right">{(arch.metrics.productDiscoveries / 1000).toFixed(1)}k</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Saves */}
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted mb-3">Product Saves</p>
              <div className="space-y-2">
                {architectInfluenceData.sort((a, b) => b.metrics.productSaves - a.metrics.productSaves).map((arch) => {
                  const max = Math.max(...architectInfluenceData.map(a => a.metrics.productSaves));
                  return (
                    <div key={arch.architectId} className="flex items-center gap-2">
                      <div className="w-14 truncate text-[10px] font-medium">{arch.name.split(" ")[1]}</div>
                      <div className="flex-1 h-3 rounded-sm bg-surface overflow-hidden">
                        <div className="h-full bg-emerald/30 rounded-sm" style={{ width: `${(arch.metrics.productSaves / max) * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-muted w-8 text-right">{arch.metrics.productSaves}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Spec Downloads */}
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted mb-3">Spec Downloads</p>
              <div className="space-y-2">
                {architectInfluenceData.sort((a, b) => b.metrics.specDownloads - a.metrics.specDownloads).map((arch) => {
                  const max = Math.max(...architectInfluenceData.map(a => a.metrics.specDownloads));
                  return (
                    <div key={arch.architectId} className="flex items-center gap-2">
                      <div className="w-14 truncate text-[10px] font-medium">{arch.name.split(" ")[1]}</div>
                      <div className="flex-1 h-3 rounded-sm bg-surface overflow-hidden">
                        <div className="h-full bg-blue/30 rounded-sm" style={{ width: `${(arch.metrics.specDownloads / max) * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-muted w-8 text-right">{arch.metrics.specDownloads}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Enquiries */}
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted mb-3">Enquiries</p>
              <div className="space-y-2">
                {architectInfluenceData.sort((a, b) => b.metrics.enquiriesGenerated - a.metrics.enquiriesGenerated).map((arch) => {
                  const max = Math.max(...architectInfluenceData.map(a => a.metrics.enquiriesGenerated));
                  return (
                    <div key={arch.architectId} className="flex items-center gap-2">
                      <div className="w-14 truncate text-[10px] font-medium">{arch.name.split(" ")[1]}</div>
                      <div className="flex-1 h-3 rounded-sm bg-surface overflow-hidden">
                        <div className="h-full bg-amber/30 rounded-sm" style={{ width: `${(arch.metrics.enquiriesGenerated / max) * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-muted w-8 text-right">{arch.metrics.enquiriesGenerated}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Boards */}
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted mb-3">Boards Created</p>
              <div className="space-y-2">
                {architectInfluenceData.sort((a, b) => b.metrics.boardsCreated - a.metrics.boardsCreated).map((arch) => {
                  const max = Math.max(...architectInfluenceData.map(a => a.metrics.boardsCreated));
                  return (
                    <div key={arch.architectId} className="flex items-center gap-2">
                      <div className="w-14 truncate text-[10px] font-medium">{arch.name.split(" ")[1]}</div>
                      <div className="flex-1 h-3 rounded-sm bg-surface overflow-hidden">
                        <div className="h-full bg-foreground/20 rounded-sm" style={{ width: `${(arch.metrics.boardsCreated / max) * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-muted w-8 text-right">{arch.metrics.boardsCreated}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Influence trend chart */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="text-[14px] font-semibold mb-1">Influence Trends</h3>
          <p className="text-[11px] text-muted mb-4">6-month influence score trajectory</p>
          <div className="relative h-[140px]">
            {/* Y axis labels */}
            <div className="absolute left-0 top-0 bottom-5 w-8 flex flex-col justify-between text-[9px] text-muted">
              <span>100</span>
              <span>75</span>
              <span>50</span>
              <span>25</span>
            </div>
            {/* Chart area */}
            <div className="ml-10 h-full flex items-end gap-2">
              {[0, 1, 2, 3, 4, 5].map((monthIdx) => {
                return (
                  <div key={monthIdx} className="flex-1 flex items-end gap-px" style={{ height: "100%" }}>
                    {architectInfluenceData.slice(0, 4).map((arch, i) => {
                      const score = arch.monthlyTrend[monthIdx]?.score || 0;
                      const colors = ["bg-foreground", "bg-foreground/60", "bg-foreground/30", "bg-foreground/15"];
                      return <div key={arch.architectId} className={`flex-1 rounded-t-sm ${colors[i]}`} style={{ height: `${score}%` }} />;
                    })}
                  </div>
                );
              })}
            </div>
            {/* X axis labels */}
            <div className="ml-10 flex mt-1">
              {["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m) => (
                <div key={m} className="flex-1 text-center text-[9px] text-muted">{m}</div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3">
            {architectInfluenceData.slice(0, 4).map((arch, i) => {
              const colors = ["bg-foreground", "bg-foreground/60", "bg-foreground/30", "bg-foreground/15"];
              return (
                <span key={arch.architectId} className="flex items-center gap-1.5 text-[10px] text-muted">
                  <span className={`h-2 w-2 rounded-sm ${colors[i]}`} />
                  {arch.name.split(" ")[1]}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
