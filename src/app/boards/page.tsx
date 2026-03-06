"use client";

import { useState } from "react";
import Link from "next/link";
import { designBoards } from "@/lib/intelligence-data";
import { products, projects } from "@/lib/mock-data";
import {
  LayoutGrid,
  Lock,
  Globe,
  Clock,
  Users,
  Plus,
  ArrowRight,
  Search,
  SlidersHorizontal,
  Grid3x3,
  List,
  FolderKanban,
  Heart,
  Star,
  MoreHorizontal,
} from "lucide-react";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" });
}

function formatRelative(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return formatDate(d);
}

export default function BoardsPage() {
  const [filter, setFilter] = useState<"all" | "architect" | "homeowner">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"updated" | "created" | "products">("updated");

  let filtered = filter === "all" ? [...designBoards] : designBoards.filter((b) => b.owner.role === filter);
  if (search) filtered = filtered.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));
  filtered.sort((a, b) => {
    if (sortBy === "updated") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    if (sortBy === "created") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return b.productIds.length - a.productIds.length;
  });

  const totalProducts = designBoards.reduce((s, b) => s + b.productIds.length, 0);
  const publicCount = designBoards.filter((b) => b.isPublic).length;
  const collaborativeCount = designBoards.filter((b) => b.collaborators.length > 0).length;

  return (
    <div className="min-h-screen bg-surface/50">
      {/* Header */}
      <div className="border-b border-border bg-white px-8 py-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">Workspace</p>
            <h1 className="mt-1 text-[28px] font-semibold tracking-tight">Design Boards</h1>
            <p className="mt-1 text-[13px] text-muted">Collect products, organise ideas, and convert selections into specifications.</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-[13px] font-medium text-white hover:opacity-90">
            <Plus size={14} /> New Board
          </button>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="text-[24px] font-bold tracking-tight">{designBoards.length}</p>
            <p className="text-[11px] text-muted mt-0.5">Total Boards</p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="text-[24px] font-bold tracking-tight">{totalProducts}</p>
            <p className="text-[11px] text-muted mt-0.5">Products Curated</p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="text-[24px] font-bold tracking-tight">{publicCount}</p>
            <p className="text-[11px] text-muted mt-0.5">Public Boards</p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="text-[24px] font-bold tracking-tight">{collaborativeCount}</p>
            <p className="text-[11px] text-muted mt-0.5">Collaborative</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg border border-border bg-white p-1">
              {[
                { value: "all" as const, label: "All Boards" },
                { value: "architect" as const, label: "Architect" },
                { value: "homeowner" as const, label: "Homeowner" },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${
                    filter === f.value ? "bg-foreground text-white" : "text-muted hover:bg-surface"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search boards..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-lg border border-border bg-white pl-9 pr-3 py-2 text-[12px] w-48 placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-lg border border-border bg-white px-3 py-2 text-[12px] text-muted"
            >
              <option value="updated">Last Updated</option>
              <option value="created">Date Created</option>
              <option value="products">Most Products</option>
            </select>
            <div className="flex rounded-lg border border-border bg-white p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-md p-1.5 ${viewMode === "grid" ? "bg-foreground text-white" : "text-muted"}`}
              >
                <Grid3x3 size={14} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-md p-1.5 ${viewMode === "list" ? "bg-foreground text-white" : "text-muted"}`}
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === "grid" ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((board) => {
              const boardProducts = board.productIds.map((id) => products.find((p) => p.id === id)).filter(Boolean);
              const project = board.projectId ? projects.find((p) => p.id === board.projectId) : null;
              return (
                <Link
                  key={board.id}
                  href={`/boards/${board.id}`}
                  className="group rounded-2xl border border-border bg-white overflow-hidden transition-all hover:shadow-lg hover:border-foreground/10"
                >
                  {/* Product mosaic */}
                  <div className="grid grid-cols-3 h-36 overflow-hidden bg-surface">
                    {boardProducts.slice(0, 3).map((prod, i) => (
                      <div key={prod!.id} className={`overflow-hidden ${i === 0 ? "col-span-2 row-span-1" : ""}`}>
                        <div className="h-full w-full bg-surface flex items-center justify-center">
                          <span className="text-[10px] text-muted">{prod!.name.split(" ")[0]}</span>
                        </div>
                      </div>
                    ))}
                    {boardProducts.length === 0 && (
                      <div className="col-span-3 flex items-center justify-center">
                        <LayoutGrid size={20} className="text-muted" />
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[14px] font-semibold group-hover:text-foreground truncate">{board.name}</h3>
                        <p className="mt-0.5 text-[11px] text-muted line-clamp-1">{board.description}</p>
                      </div>
                      <div className="ml-2 shrink-0">
                        {board.isPublic ? <Globe size={12} className="text-muted" /> : <Lock size={12} className="text-muted" />}
                      </div>
                    </div>

                    {/* Project link */}
                    {project && (
                      <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-surface px-2 py-1">
                        <FolderKanban size={11} className="text-muted" />
                        <span className="text-[10px] font-medium text-muted truncate">{project.title}</span>
                      </div>
                    )}

                    {/* Owner + Meta */}
                    <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-surface shrink-0" />
                        <div>
                          <p className="text-[11px] font-medium leading-tight">{board.owner.name}</p>
                          <p className="text-[9px] text-muted capitalize">{board.owner.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted">
                        <span>{board.productIds.length} items</span>
                        {board.collaborators.length > 0 && (
                          <span className="flex items-center gap-0.5">
                            <Users size={10} /> {board.collaborators.length + 1}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* New board placeholder */}
            <button className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-white/50 py-16 transition-colors hover:border-foreground/30 hover:bg-white">
              <Plus size={20} className="text-muted" />
              <span className="mt-2 text-[12px] font-medium text-muted">Create New Board</span>
            </button>
          </div>
        ) : (
          /* List View */
          <div className="rounded-2xl border border-border bg-white overflow-hidden">
            <table className="w-full table-premium">
              <thead>
                <tr className="bg-surface/50">
                  <th>Board</th>
                  <th>Project</th>
                  <th>Owner</th>
                  <th className="text-center">Products</th>
                  <th className="text-center">Collaborators</th>
                  <th className="text-center">Visibility</th>
                  <th>Updated</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((board) => {
                  const project = board.projectId ? projects.find((p) => p.id === board.projectId) : null;
                  return (
                    <tr key={board.id} className="cursor-pointer hover:bg-surface/50 transition-colors" onClick={() => window.location.href = `/boards/${board.id}`}>
                      <td>
                        <p className="text-[13px] font-medium">{board.name}</p>
                        <p className="text-[11px] text-muted line-clamp-1 max-w-[200px]">{board.description}</p>
                      </td>
                      <td>
                        {project ? (
                          <span className="text-[12px] text-muted">{project.title}</span>
                        ) : (
                          <span className="text-[12px] text-muted/40">—</span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-surface shrink-0" />
                          <span className="text-[12px]">{board.owner.name}</span>
                        </div>
                      </td>
                      <td className="text-center"><span className="text-[13px] font-medium">{board.productIds.length}</span></td>
                      <td className="text-center"><span className="text-[13px]">{board.collaborators.length + 1}</span></td>
                      <td className="text-center">
                        {board.isPublic ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-light px-2 py-0.5 text-[10px] font-medium text-emerald"><Globe size={10} />Public</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-muted"><Lock size={10} />Private</span>
                        )}
                      </td>
                      <td><span className="text-[12px] text-muted">{formatRelative(board.updatedAt)}</span></td>
                      <td><ArrowRight size={14} className="text-muted" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
