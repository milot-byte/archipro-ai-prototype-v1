"use client";

import { useState } from "react";
import Link from "next/link";
import { projects } from "@/lib/mock-data";
import { specifications, designBoards } from "@/lib/intelligence-data";
import { MapPin, Calendar, ArrowRight, Search, Grid3x3, List, Plus, FolderKanban, Layers, ClipboardList } from "lucide-react";

export default function DiscoverPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const tags = ["All", "Residential", "Commercial", "Heritage", "Sustainable", "Luxury", "Urban"];

  let filtered = filter === "All" ? projects : projects.filter((p) => p.tags.includes(filter));
  if (search) filtered = filtered.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()) || p.architect.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-surface/50">
      <div className="border-b border-border bg-white px-8 py-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">Workspace</p>
            <h1 className="mt-1 text-[28px] font-semibold tracking-tight">My Projects</h1>
            <p className="mt-1 text-[13px] text-muted">Browse and manage your architecture projects.</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-[13px] font-medium text-white hover:opacity-90">
            <Plus size={14} /> New Project
          </button>
        </div>
      </div>

      <div className="p-8 space-y-6">
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
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input type="text" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-lg border border-border bg-white pl-9 pr-3 py-2 text-[12px] w-48 placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-foreground" />
          </div>
        </div>

        {/* Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => {
            const spec = specifications.find((s) => s.projectId === project.id);
            const boards = designBoards.filter((b) => b.projectId === project.id);
            return (
              <Link key={project.id} href={`/projects/${project.id}`} className="group rounded-2xl border border-border bg-white overflow-hidden transition-all hover:shadow-md hover:border-foreground/10">
                <div className="aspect-[16/10] bg-surface relative">
                  <div className="absolute inset-0 flex items-center justify-center text-muted text-[11px]">{project.title}</div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-[11px] text-muted">
                    <span>{project.architect}</span>
                    <span>·</span>
                    <span>{project.year}</span>
                  </div>
                  <h3 className="mt-1 text-[15px] font-semibold tracking-tight group-hover:text-foreground">{project.title}</h3>
                  <p className="mt-0.5 flex items-center gap-1 text-[12px] text-muted"><MapPin size={11} />{project.location}</p>
                  <p className="mt-2 text-[12px] text-muted line-clamp-2 leading-relaxed">{project.description}</p>

                  {/* Tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-muted">{tag}</span>
                    ))}
                  </div>

                  {/* Meta footer */}
                  <div className="mt-3 flex items-center gap-3 pt-3 border-t border-border text-[10px] text-muted">
                    <span className="flex items-center gap-1"><FolderKanban size={10} />{project.products.length} products</span>
                    <span className="flex items-center gap-1"><Layers size={10} />{boards.length} boards</span>
                    {spec && <span className={`rounded-full px-1.5 py-0.5 font-medium ${spec.status === "approved" ? "bg-emerald-light text-emerald" : spec.status === "review" ? "bg-amber-light text-amber" : "bg-surface"}`}>{spec.status}</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
