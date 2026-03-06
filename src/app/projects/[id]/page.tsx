"use client";

import { useState, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects, products as allProducts, architects, brands } from "@/lib/mock-data";
import { specifications, designBoards, productMomentumData, architectInfluenceData, activityFeed } from "@/lib/intelligence-data";
import {
  ArrowLeft, MapPin, Calendar, User, Tag, TrendingUp, Heart, Download, Share2,
  MessageCircle, Clock, CheckCircle2, Package, Layers, FolderKanban, ClipboardList,
  ExternalLink, ChevronDown, ChevronRight, Eye, Activity, Zap, BarChart3,
  AlertCircle, FileText, Users, Star, Building2
} from "lucide-react";

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const project = projects.find((p) => p.id === id);
  if (!project) return notFound();

  const [tab, setTab] = useState<"overview" | "products" | "specifications" | "boards" | "activity">("overview");
  const [expandedRooms, setExpandedRooms] = useState<string[]>(["all"]);

  const architect = architects.find((a) => a.id === project.architectId);
  const influence = architectInfluenceData.find((a) => a.architectId === project.architectId);
  const taggedProducts = allProducts.filter((p) => project.products.includes(p.id));
  const spec = specifications.find((s) => s.projectId === project.id);
  const boards = designBoards.filter((b) => b.projectId === project.id);
  const projectActivity = activityFeed.filter((a) => a.projectId === project.id || taggedProducts.some(p => p.id === a.productId));

  // Mock project timeline data
  const timeline = [
    { phase: "Concept & Brief", status: "completed" as const, date: `${project.year - 1} Sep`, duration: "6 weeks" },
    { phase: "Schematic Design", status: "completed" as const, date: `${project.year - 1} Nov`, duration: "8 weeks" },
    { phase: "Developed Design", status: "completed" as const, date: `${project.year} Jan`, duration: "10 weeks" },
    { phase: "Product Selection", status: "completed" as const, date: `${project.year} Mar`, duration: "4 weeks" },
    { phase: "Construction Docs", status: project.year >= 2024 ? "completed" as const : "in_progress" as const, date: `${project.year} Apr`, duration: "6 weeks" },
    { phase: "Construction", status: project.year >= 2024 ? "in_progress" as const : "completed" as const, date: `${project.year} Jun`, duration: "24 weeks" },
    { phase: "Handover", status: "upcoming" as const, date: `${project.year} Dec`, duration: "2 weeks" },
  ];

  // Mock project metrics
  const metrics = {
    views: Math.floor(Math.random() * 3000) + 1500,
    saves: Math.floor(Math.random() * 200) + 50,
    specDownloads: Math.floor(Math.random() * 100) + 30,
    enquiries: Math.floor(Math.random() * 20) + 5,
    boardCount: boards.length,
    productCount: taggedProducts.length,
  };

  const statusColor = (s: string) => {
    if (s === "completed") return "bg-emerald-light text-emerald";
    if (s === "in_progress") return "bg-blue-light text-blue";
    if (s === "upcoming") return "bg-surface text-muted";
    return "bg-surface text-muted";
  };

  const specStatusColor = (s: string) => {
    if (s === "installed") return "bg-emerald-light text-emerald";
    if (s === "delivered") return "bg-blue-light text-blue";
    if (s === "ordered") return "bg-amber-light text-amber";
    return "bg-surface text-muted";
  };

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "products", label: `Products (${taggedProducts.length})` },
    { key: "specifications", label: `Specifications${spec ? ` (${spec.rooms.reduce((s, r) => s + r.items.length, 0)})` : ""}` },
    { key: "boards", label: `Boards (${boards.length})` },
    { key: "activity", label: "Activity" },
  ];

  const toggleRoom = (id: string) => {
    setExpandedRooms((prev) => prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-surface/50">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="px-8 py-6">
          <div className="flex items-center gap-2 text-[12px] text-muted mb-4">
            <Link href="/discover" className="hover:text-foreground transition-colors">My Projects</Link>
            <ChevronRight size={12} />
            <span className="text-foreground font-medium">{project.title}</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-[28px] font-semibold tracking-tight">{project.title}</h1>
                {spec && (
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                    spec.status === "approved" ? "bg-emerald-light text-emerald" :
                    spec.status === "review" ? "bg-amber-light text-amber" :
                    spec.status === "final" ? "bg-blue-light text-blue" : "bg-surface text-muted"
                  }`}>{spec.status}</span>
                )}
              </div>
              <div className="flex items-center gap-4 text-[13px] text-muted">
                <span className="flex items-center gap-1"><MapPin size={13} />{project.location}</span>
                <span className="flex items-center gap-1"><Calendar size={13} />{project.year}</span>
                {architect && <span className="flex items-center gap-1"><User size={13} />{architect.name} · {architect.firm}</span>}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-surface px-2.5 py-1 text-[10px] font-medium text-muted">{tag}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[12px] font-medium text-muted hover:bg-surface transition-colors"><Heart size={13} /> Save</button>
              <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[12px] font-medium text-muted hover:bg-surface transition-colors"><Share2 size={13} /> Share</button>
              <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[12px] font-medium text-muted hover:bg-surface transition-colors"><MessageCircle size={13} /> Enquire</button>
              <button className="flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-[12px] font-medium text-white hover:opacity-90 transition-opacity"><Download size={13} /> Export Spec</button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-8 flex items-center gap-0">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`relative px-4 py-3 text-[13px] font-medium transition-colors ${
                tab === t.key ? "text-foreground" : "text-muted hover:text-foreground"
              }`}
            >
              {t.label}
              {tab === t.key && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">
        {/* ─── Overview Tab ─── */}
        {tab === "overview" && (
          <div className="space-y-6">
            {/* KPI Row */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
              {[
                { label: "Total Views", value: metrics.views.toLocaleString(), icon: Eye, change: 18.4 },
                { label: "Saves", value: metrics.saves.toString(), icon: Heart, change: 12.7 },
                { label: "Spec Downloads", value: metrics.specDownloads.toString(), icon: Download, change: 8.2 },
                { label: "Enquiries", value: metrics.enquiries.toString(), icon: MessageCircle, change: 24.1 },
                { label: "Design Boards", value: metrics.boardCount.toString(), icon: FolderKanban, change: 0 },
                { label: "Products Tagged", value: metrics.productCount.toString(), icon: Package, change: 0 },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-border bg-white p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="rounded-lg bg-surface p-2"><s.icon size={14} className="text-muted" /></div>
                    {s.change > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald">
                        <TrendingUp size={10} />+{s.change}%
                      </span>
                    )}
                  </div>
                  <p className="text-[22px] font-semibold tracking-tight">{s.value}</p>
                  <p className="text-[11px] text-muted mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                <div className="rounded-2xl border border-border bg-white p-6">
                  <h3 className="text-[14px] font-semibold mb-3">About This Project</h3>
                  <p className="text-[13px] text-muted leading-relaxed">{project.description}</p>

                  {/* Image gallery */}
                  <div className="mt-5 grid gap-2 grid-cols-4">
                    {project.images.map((img, i) => (
                      <div key={i} className={`overflow-hidden rounded-xl bg-surface ${i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-video"}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`${project.title} — ${i + 1}`} className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Project Timeline */}
                <div className="rounded-2xl border border-border bg-white p-6">
                  <h3 className="text-[14px] font-semibold mb-1">Project Timeline</h3>
                  <p className="text-[11px] text-muted mb-5">Phase progress and milestones</p>

                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-[15px] top-0 bottom-0 w-px bg-border" />
                    <div className="space-y-0">
                      {timeline.map((phase, i) => (
                        <div key={phase.phase} className="relative flex items-start gap-4 pb-5 last:pb-0">
                          <div className={`relative z-10 mt-0.5 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border-2 ${
                            phase.status === "completed" ? "border-emerald bg-emerald-light" :
                            phase.status === "in_progress" ? "border-blue bg-blue-light" :
                            "border-border bg-white"
                          }`}>
                            {phase.status === "completed" ? <CheckCircle2 size={14} className="text-emerald" /> :
                             phase.status === "in_progress" ? <Activity size={14} className="text-blue" /> :
                             <Clock size={14} className="text-muted" />}
                          </div>
                          <div className="flex-1 flex items-center justify-between py-1">
                            <div>
                              <p className={`text-[13px] font-semibold ${phase.status === "upcoming" ? "text-muted" : ""}`}>{phase.phase}</p>
                              <p className="text-[11px] text-muted">{phase.date} · {phase.duration}</p>
                            </div>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor(phase.status)}`}>
                              {phase.status === "in_progress" ? "In Progress" : phase.status === "completed" ? "Complete" : "Upcoming"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Products Overview */}
                <div className="rounded-2xl border border-border bg-white p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-[14px] font-semibold">Tagged Products</h3>
                      <p className="text-[11px] text-muted mt-0.5">{taggedProducts.length} products specified in this project</p>
                    </div>
                    <button onClick={() => setTab("products")} className="text-[11px] font-medium text-muted hover:text-foreground transition-colors flex items-center gap-1">View all <ChevronRight size={12} /></button>
                  </div>
                  <div className="space-y-2">
                    {taggedProducts.map((product) => {
                      const momentum = productMomentumData.find((m) => m.productId === product.id);
                      const brand = brands.find(b => b.id === product.brandId);
                      return (
                        <Link key={product.id} href={`/products/${product.id}`} className="flex items-center gap-4 rounded-xl border border-border p-3 hover:bg-surface/50 transition-colors group">
                          <div className="h-12 w-12 rounded-lg bg-surface flex items-center justify-center shrink-0">
                            <Package size={16} className="text-muted" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted">{product.brand}</p>
                            <p className="text-[13px] font-semibold truncate">{product.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[13px] font-semibold">{product.price}</p>
                            {momentum && (
                              <div className="flex items-center gap-1 justify-end mt-0.5">
                                <TrendingUp size={10} className="text-emerald" />
                                <span className="text-[10px] font-semibold text-emerald">{momentum.momentumScore}</span>
                              </div>
                            )}
                          </div>
                          <ChevronRight size={14} className="text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right sidebar */}
              <div className="space-y-6">
                {/* Architect Card */}
                {architect && (
                  <Link href={`/architects/${architect.id}`} className="block rounded-2xl border border-border bg-white p-5 hover:border-foreground/10 transition-colors group">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted mb-3">Lead Architect</p>
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={architect.avatar} alt={architect.name} className="h-12 w-12 rounded-full bg-surface object-cover" />
                      <div>
                        <p className="text-[14px] font-semibold group-hover:text-foreground">{architect.name}</p>
                        <p className="text-[12px] text-muted">{architect.firm}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-[12px] text-muted leading-relaxed line-clamp-2">{architect.bio}</p>
                    {influence && (
                      <div className="mt-4 flex items-center gap-3 pt-3 border-t border-border">
                        <div className="flex items-center gap-1.5">
                          <Star size={12} className="text-amber" />
                          <span className="text-[12px] font-semibold">{influence.influenceScore}</span>
                          <span className="text-[10px] text-muted">Influence</span>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          influence.tier === "Platinum" ? "bg-foreground text-white" :
                          influence.tier === "Gold" ? "bg-amber-light text-amber" :
                          "bg-surface text-muted"
                        }`}>{influence.tier}</span>
                      </div>
                    )}
                  </Link>
                )}

                {/* Project Details */}
                <div className="rounded-2xl border border-border bg-white p-5">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted mb-4">Project Details</p>
                  <div className="space-y-3">
                    {[
                      { label: "Location", value: project.location, icon: MapPin },
                      { label: "Year", value: project.year.toString(), icon: Calendar },
                      { label: "Architect", value: project.architect, icon: User },
                      { label: "Products", value: `${taggedProducts.length} tagged`, icon: Package },
                      { label: "Boards", value: `${boards.length} created`, icon: FolderKanban },
                    ].map((d) => (
                      <div key={d.label} className="flex items-center justify-between py-1.5">
                        <span className="flex items-center gap-2 text-[12px] text-muted"><d.icon size={13} />{d.label}</span>
                        <span className="text-[12px] font-medium">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specification Status */}
                {spec && (
                  <Link href={`/specifications/${spec.id}`} className="block rounded-2xl border border-border bg-white p-5 hover:border-foreground/10 transition-colors">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted mb-3">Specification</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[13px] font-semibold">{spec.projectName}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        spec.status === "approved" ? "bg-emerald-light text-emerald" :
                        spec.status === "review" ? "bg-amber-light text-amber" :
                        spec.status === "final" ? "bg-blue-light text-blue" : "bg-surface text-muted"
                      }`}>{spec.status}</span>
                    </div>
                    {(() => {
                      const totalItems = spec.rooms.reduce((s, r) => s + r.items.length, 0);
                      const installed = spec.rooms.reduce((s, r) => s + r.items.filter(i => i.status === "installed").length, 0);
                      const delivered = spec.rooms.reduce((s, r) => s + r.items.filter(i => i.status === "delivered").length, 0);
                      const ordered = spec.rooms.reduce((s, r) => s + r.items.filter(i => i.status === "ordered").length, 0);
                      const pct = Math.round(((installed + delivered * 0.75 + ordered * 0.5) / totalItems) * 100);
                      return (
                        <div>
                          <div className="flex items-center justify-between text-[11px] mb-1.5">
                            <span className="text-muted">{spec.rooms.length} rooms · {totalItems} items</span>
                            <span className="font-semibold">{pct}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-surface overflow-hidden flex">
                            <div className="h-full bg-emerald" style={{ width: `${(installed / totalItems) * 100}%` }} />
                            <div className="h-full bg-blue" style={{ width: `${(delivered / totalItems) * 100}%` }} />
                            <div className="h-full bg-amber" style={{ width: `${(ordered / totalItems) * 100}%` }} />
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-muted">
                            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald" />Installed ({installed})</span>
                            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue" />Delivered ({delivered})</span>
                            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber" />Ordered ({ordered})</span>
                          </div>
                        </div>
                      );
                    })()}
                  </Link>
                )}

                {/* Design Boards */}
                {boards.length > 0 && (
                  <div className="rounded-2xl border border-border bg-white p-5">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted mb-3">Design Boards</p>
                    <div className="space-y-2">
                      {boards.map((board) => {
                        const boardProducts = allProducts.filter(p => board.productIds.includes(p.id));
                        return (
                          <Link key={board.id} href={`/boards/${board.id}`} className="block rounded-xl border border-border p-3 hover:bg-surface/50 transition-colors">
                            <div className="flex items-center justify-between">
                              <p className="text-[12px] font-semibold">{board.name}</p>
                              <span className="text-[10px] text-muted">{boardProducts.length} products</span>
                            </div>
                            <p className="text-[11px] text-muted mt-0.5 line-clamp-1">{board.description}</p>
                            <div className="mt-2 flex items-center gap-1.5">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={board.owner.avatar} alt={board.owner.name} className="h-5 w-5 rounded-full bg-surface" />
                              <span className="text-[10px] text-muted">{board.owner.name}</span>
                              {board.collaborators.length > 0 && (
                                <span className="text-[10px] text-muted">+{board.collaborators.length}</span>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Brand breakdown */}
                <div className="rounded-2xl border border-border bg-white p-5">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted mb-3">Brands Used</p>
                  <div className="space-y-2">
                    {(() => {
                      const brandMap = new Map<string, { name: string; count: number }>();
                      taggedProducts.forEach((p) => {
                        const existing = brandMap.get(p.brandId);
                        if (existing) existing.count++;
                        else brandMap.set(p.brandId, { name: p.brand, count: 1 });
                      });
                      const sorted = Array.from(brandMap.entries()).sort((a, b) => b[1].count - a[1].count);
                      return sorted.map(([bId, info]) => (
                        <div key={bId} className="flex items-center justify-between py-1">
                          <span className="text-[12px] font-medium">{info.name}</span>
                          <span className="text-[11px] text-muted">{info.count} product{info.count !== 1 ? "s" : ""}</span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Products Tab ─── */}
        {tab === "products" && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {taggedProducts.map((product) => {
                const momentum = productMomentumData.find((m) => m.productId === product.id);
                const specItems = spec?.rooms.flatMap(r => r.items).filter(i => i.productId === product.id) || [];

                return (
                  <Link key={product.id} href={`/products/${product.id}`} className="group rounded-2xl border border-border bg-white overflow-hidden hover:shadow-md hover:border-foreground/10 transition-all">
                    <div className="aspect-[16/10] bg-surface relative flex items-center justify-center">
                      <span className="text-[11px] text-muted">{product.category}</span>
                      {momentum && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5">
                          <TrendingUp size={10} className="text-emerald" />
                          <span className="text-[10px] font-semibold">{momentum.momentumScore}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted">{product.brand}</p>
                      <h3 className="mt-0.5 text-[14px] font-semibold">{product.name}</h3>
                      <p className="text-[14px] font-semibold mt-1">{product.price}</p>

                      {/* Spec usage in this project */}
                      {specItems.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                          <p className="text-[10px] font-medium uppercase tracking-wider text-muted">Usage in Project</p>
                          {specItems.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                              <span className="text-[11px] text-muted">{item.quantity} {item.unit} — {item.notes}</span>
                              <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${specStatusColor(item.status)}`}>{item.status}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-2">
                        {product.specSheet && (
                          <button className="flex items-center gap-1.5 rounded-lg bg-surface px-3 py-1.5 text-[11px] font-medium text-muted hover:bg-foreground hover:text-white transition-colors">
                            <Download size={11} /> Spec Sheet
                          </button>
                        )}
                        <button className="flex items-center gap-1.5 rounded-lg bg-surface px-3 py-1.5 text-[11px] font-medium text-muted hover:bg-foreground hover:text-white transition-colors">
                          <MessageCircle size={11} /> Enquire
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Specifications Tab ─── */}
        {tab === "specifications" && spec && (
          <div className="space-y-6">
            {/* Spec header */}
            <div className="rounded-2xl border border-border bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[14px] font-semibold">Specification — {spec.projectName}</h3>
                  <p className="text-[11px] text-muted mt-0.5">Last updated {new Date(spec.updatedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                    spec.status === "approved" ? "bg-emerald-light text-emerald" :
                    spec.status === "review" ? "bg-amber-light text-amber" : "bg-surface text-muted"
                  }`}>{spec.status}</span>
                  <Link href={`/specifications/${spec.id}`} className="flex items-center gap-1 text-[11px] font-medium text-muted hover:text-foreground transition-colors">
                    Open full spec <ExternalLink size={11} />
                  </Link>
                </div>
              </div>

              {/* Progress bar */}
              {(() => {
                const totalItems = spec.rooms.reduce((s, r) => s + r.items.length, 0);
                const installed = spec.rooms.reduce((s, r) => s + r.items.filter(i => i.status === "installed").length, 0);
                const delivered = spec.rooms.reduce((s, r) => s + r.items.filter(i => i.status === "delivered").length, 0);
                const ordered = spec.rooms.reduce((s, r) => s + r.items.filter(i => i.status === "ordered").length, 0);
                const specified = spec.rooms.reduce((s, r) => s + r.items.filter(i => i.status === "specified").length, 0);
                return (
                  <div className="flex items-center gap-6 py-3 px-4 rounded-xl bg-surface">
                    <div className="flex-1">
                      <div className="h-3 rounded-full bg-white overflow-hidden flex">
                        <div className="h-full bg-emerald transition-all" style={{ width: `${(installed / totalItems) * 100}%` }} />
                        <div className="h-full bg-blue transition-all" style={{ width: `${(delivered / totalItems) * 100}%` }} />
                        <div className="h-full bg-amber transition-all" style={{ width: `${(ordered / totalItems) * 100}%` }} />
                        <div className="h-full bg-border transition-all" style={{ width: `${(specified / totalItems) * 100}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] shrink-0">
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald" />Installed ({installed})</span>
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue" />Delivered ({delivered})</span>
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber" />Ordered ({ordered})</span>
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-border" />Specified ({specified})</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Room sections */}
            {spec.rooms.map((room) => {
              const isExpanded = expandedRooms.includes("all") || expandedRooms.includes(room.id);
              return (
                <div key={room.id} className="rounded-2xl border border-border bg-white overflow-hidden">
                  <button onClick={() => toggleRoom(room.id)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <ChevronDown size={14} className={`text-muted transition-transform ${isExpanded ? "" : "-rotate-90"}`} />
                      <h4 className="text-[13px] font-semibold">{room.name}</h4>
                      <span className="text-[11px] text-muted">{room.items.length} items</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {room.items.some(i => i.status === "installed") && <span className="h-2 w-2 rounded-full bg-emerald" />}
                      {room.items.some(i => i.status === "delivered") && <span className="h-2 w-2 rounded-full bg-blue" />}
                      {room.items.some(i => i.status === "ordered") && <span className="h-2 w-2 rounded-full bg-amber" />}
                      {room.items.some(i => i.status === "specified") && <span className="h-2 w-2 rounded-full bg-border" />}
                    </div>
                  </button>
                  {isExpanded && (
                    <table className="w-full table-premium">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Brand</th>
                          <th>Category</th>
                          <th className="text-right">Qty</th>
                          <th>Notes</th>
                          <th className="text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {room.items.map((item) => (
                          <tr key={item.productId}>
                            <td><Link href={`/products/${item.productId}`} className="text-[12px] font-medium hover:underline">{item.productName}</Link></td>
                            <td><span className="text-[12px] text-muted">{item.brand}</span></td>
                            <td><span className="text-[11px] text-muted">{item.category}</span></td>
                            <td className="text-right"><span className="text-[12px] font-semibold">{item.quantity} {item.unit}</span></td>
                            <td><span className="text-[11px] text-muted">{item.notes}</span></td>
                            <td className="text-right">
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${specStatusColor(item.status)}`}>{item.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === "specifications" && !spec && (
          <div className="rounded-2xl border border-border bg-white p-12 text-center">
            <ClipboardList size={32} className="mx-auto text-muted mb-3" />
            <h3 className="text-[14px] font-semibold">No Specification Yet</h3>
            <p className="text-[12px] text-muted mt-1">Create a specification from a design board to get started.</p>
          </div>
        )}

        {/* ─── Boards Tab ─── */}
        {tab === "boards" && (
          <div className="space-y-4">
            {boards.length === 0 ? (
              <div className="rounded-2xl border border-border bg-white p-12 text-center">
                <FolderKanban size={32} className="mx-auto text-muted mb-3" />
                <h3 className="text-[14px] font-semibold">No Boards Yet</h3>
                <p className="text-[12px] text-muted mt-1">Create a design board to start collecting products.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {boards.map((board) => {
                  const boardProducts = allProducts.filter(p => board.productIds.includes(p.id));
                  return (
                    <Link key={board.id} href={`/boards/${board.id}`} className="group rounded-2xl border border-border bg-white overflow-hidden hover:shadow-md hover:border-foreground/10 transition-all">
                      {/* Product mosaic */}
                      <div className="grid grid-cols-4 gap-px bg-border">
                        {board.productIds.slice(0, 4).map((pid) => {
                          const p = allProducts.find(pp => pp.id === pid);
                          return (
                            <div key={pid} className="aspect-square bg-surface flex items-center justify-center">
                              <span className="text-[9px] text-muted text-center px-1 leading-tight">{p?.name.split(" ").slice(0, 2).join(" ")}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-[14px] font-semibold">{board.name}</h3>
                          {!board.isPublic && <span className="text-[9px] text-muted bg-surface rounded-full px-1.5 py-0.5">Private</span>}
                        </div>
                        <p className="text-[12px] text-muted mt-0.5 line-clamp-2">{board.description}</p>
                        <div className="mt-3 flex items-center justify-between pt-3 border-t border-border">
                          <div className="flex items-center gap-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={board.owner.avatar} alt={board.owner.name} className="h-5 w-5 rounded-full bg-surface" />
                            <span className="text-[11px] text-muted">{board.owner.name}</span>
                          </div>
                          <span className="text-[11px] text-muted">{boardProducts.length} products</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── Activity Tab ─── */}
        {tab === "activity" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-white overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-[13px] font-semibold">Recent Activity</h3>
                <p className="text-[11px] text-muted mt-0.5">Activity related to this project and its products</p>
              </div>
              <div className="divide-y divide-border">
                {projectActivity.length === 0 ? (
                  <div className="p-8 text-center">
                    <Activity size={24} className="mx-auto text-muted mb-2" />
                    <p className="text-[12px] text-muted">No recent activity for this project.</p>
                  </div>
                ) : (
                  projectActivity.slice(0, 15).map((event) => {
                    const typeConfig: Record<string, { icon: typeof Eye; bg: string; label: string }> = {
                      product_saved: { icon: Heart, bg: "bg-rose-light text-rose", label: "saved" },
                      spec_downloaded: { icon: Download, bg: "bg-blue-light text-blue", label: "downloaded spec for" },
                      board_add: { icon: FolderKanban, bg: "bg-amber-light text-amber", label: "added to board" },
                      website_visit: { icon: Eye, bg: "bg-surface text-muted", label: "visited" },
                      enquiry: { icon: MessageCircle, bg: "bg-emerald-light text-emerald", label: "enquired about" },
                      project_tagged: { icon: Tag, bg: "bg-blue-light text-blue", label: "tagged in project" },
                    };
                    const config = typeConfig[event.type] || typeConfig.website_visit;
                    const Icon = config.icon;
                    const time = new Date(event.timestamp);
                    const diff = Math.round((Date.now() - time.getTime()) / 60000);
                    const timeStr = diff < 60 ? `${diff}m ago` : diff < 1440 ? `${Math.round(diff / 60)}h ago` : `${Math.round(diff / 1440)}d ago`;

                    return (
                      <div key={event.id} className="flex items-start gap-3 px-6 py-3">
                        <div className={`mt-0.5 rounded-lg p-1.5 ${config.bg}`}><Icon size={12} /></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px]">
                            <span className="font-semibold">{event.actor.name}</span>
                            <span className="text-muted"> {config.label} </span>
                            {event.productName && <span className="font-medium">{event.productName}</span>}
                            {event.boardName && <span className="text-muted"> → {event.boardName}</span>}
                          </p>
                          {event.message && <p className="text-[11px] text-muted mt-0.5 italic">&ldquo;{event.message}&rdquo;</p>}
                        </div>
                        <span className="text-[10px] text-muted shrink-0">{timeStr}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
