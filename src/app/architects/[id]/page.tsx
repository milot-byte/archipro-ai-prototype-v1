"use client";

import { use, useState } from "react";
import Link from "next/link";
import { architects, projects, products, brands } from "@/lib/mock-data";
import { architectInfluenceData, designBoards, specifications, productMomentumData, activityFeed } from "@/lib/intelligence-data";
import {
  ArrowLeft, Heart, Crown, Eye, Download, MessageCircle, LayoutGrid,
  FolderOpen, TrendingUp, MapPin, ExternalLink, ChevronRight, Users,
  Layers, ClipboardList, Star, Share2, ArrowUp, Calendar, Globe,
} from "lucide-react";

function ScoreRing({ score, size = 88 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e5e5" strokeWidth={3} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#0a0a0a" strokeWidth={3} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[22px] font-bold">{score}</span>
    </div>
  );
}

const tierConfig: Record<string, { bg: string; text: string }> = {
  Platinum: { bg: "bg-foreground", text: "text-white" },
  Gold: { bg: "bg-amber-light", text: "text-amber" },
  Silver: { bg: "bg-surface", text: "text-muted" },
  Bronze: { bg: "bg-amber-light/50", text: "text-amber/60" },
};

export default function ArchitectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const architect = architects.find((a) => a.id === id);
  const [activeTab, setActiveTab] = useState<"overview" | "projects" | "products" | "activity">("overview");

  if (!architect) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-[20px] font-semibold">Architect not found</h1>
          <Link href="/architects" className="mt-3 inline-flex items-center gap-1 text-[13px] text-muted hover:text-foreground">
            <ArrowLeft size={14} /> Back to professionals
          </Link>
        </div>
      </div>
    );
  }

  const influence = architectInfluenceData.find((a) => a.architectId === architect.id);
  const archProjects = projects.filter((p) => p.architectId === architect.id);
  const archBoards = designBoards.filter((b) => b.owner.name === architect.name);
  const archSpecs = specifications.filter((s) => s.architectId === architect.id);
  const archActivity = activityFeed.filter((e) => e.actor.name === architect.name);
  const tier = influence ? tierConfig[influence.tier] : null;

  // Compute product relationships
  const productIds = new Set<string>();
  archProjects.forEach((p) => p.products.forEach((pid) => productIds.add(pid)));
  archBoards.forEach((b) => b.productIds.forEach((pid) => productIds.add(pid)));
  const usedProducts = products.filter((p) => productIds.has(p.id));
  const brandUsage: Record<string, number> = {};
  usedProducts.forEach((p) => { brandUsage[p.brand] = (brandUsage[p.brand] || 0) + 1; });

  return (
    <div className="min-h-screen bg-surface/50">
      {/* Header */}
      <div className="border-b border-border bg-white px-8 py-5">
        <Link href="/architects" className="inline-flex items-center gap-1 text-[12px] text-muted hover:text-foreground mb-4">
          <ArrowLeft size={13} /> Back to professionals
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex gap-6">
            <div className="h-20 w-20 rounded-full bg-surface shrink-0 flex items-center justify-center">
              <span className="text-[14px] font-semibold text-muted">{architect.name.split(" ").map((n) => n[0]).join("")}</span>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-[26px] font-semibold tracking-tight">{architect.name}</h1>
                {influence && tier && (
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${tier.bg} ${tier.text}`}>
                    <Crown size={11} /> {influence.tier}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[14px] text-muted">{architect.firm}</p>
              <div className="mt-2 flex items-center gap-4 text-[12px] text-muted">
                <span className="flex items-center gap-1"><MapPin size={12} />{architect.location}</span>
                <span className="flex items-center gap-1"><FolderOpen size={12} />{architect.projectCount} projects</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {architect.specialties.map((s) => (
                  <span key={s} className="rounded-full bg-surface px-2.5 py-0.5 text-[10px] font-medium text-muted">{s}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-muted hover:bg-surface"><Heart size={13} className="inline mr-1.5" />Save</button>
            <button className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-muted hover:bg-surface"><Share2 size={13} className="inline mr-1.5" />Share</button>
            <button className="rounded-lg bg-foreground px-4 py-1.5 text-[12px] font-medium text-white hover:opacity-90"><MessageCircle size={13} className="inline mr-1.5" />Contact</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border bg-white px-8">
        <div className="flex gap-1">
          {(["overview", "projects", "products", "activity"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`border-b-2 px-4 py-3 text-[13px] font-medium capitalize transition-colors ${activeTab === tab ? "border-foreground text-foreground" : "border-transparent text-muted hover:text-foreground"}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Bio */}
            <div className="rounded-2xl border border-border bg-white p-5">
              <p className="text-[14px] leading-relaxed text-muted">{architect.bio}</p>
            </div>

            {/* Influence Score + Metrics */}
            {influence && (
              <>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <div className="rounded-2xl border border-border bg-white p-5 flex items-center gap-5">
                    <ScoreRing score={influence.influenceScore} />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">Influence Score</p>
                      <p className="text-[12px] text-muted mt-1">
                        {influence.influenceScore >= 90 ? "Top 5% of architects" : influence.influenceScore >= 80 ? "Top 10% of architects" : "Growing influence"}
                      </p>
                    </div>
                  </div>
                  {[
                    { label: "Product Discoveries", value: influence.metrics.productDiscoveries, icon: Eye },
                    { label: "Enquiries Generated", value: influence.metrics.enquiriesGenerated, icon: MessageCircle },
                    { label: "Spec Downloads", value: influence.metrics.specDownloads, icon: Download },
                  ].map((m) => (
                    <div key={m.label} className="rounded-2xl border border-border bg-white p-5">
                      <m.icon size={14} className="text-muted mb-2" />
                      <p className="text-[22px] font-bold tracking-tight">{m.value.toLocaleString()}</p>
                      <p className="text-[11px] text-muted">{m.label}</p>
                    </div>
                  ))}
                </div>

                {/* Trend + Breakdown */}
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="rounded-2xl border border-border bg-white p-5">
                    <h3 className="text-[13px] font-semibold mb-4">Score Trend</h3>
                    <div className="flex items-end gap-2 h-[100px]">
                      {influence.monthlyTrend.map((d) => (
                        <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[10px] font-medium">{d.score}</span>
                          <div className="w-full rounded-t-md bg-foreground hover:opacity-80" style={{ height: `${(d.score / 100) * 80}px` }} />
                          <span className="text-[9px] text-muted">{d.month}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 mt-3">
                      <TrendingUp size={12} className="text-emerald" />
                      <span className="text-[11px] text-emerald font-medium">+{influence.monthlyTrend[influence.monthlyTrend.length - 1].score - influence.monthlyTrend[0].score} pts over 6 months</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-white p-5">
                    <h3 className="text-[13px] font-semibold mb-4">Top Influenced Products</h3>
                    <div className="space-y-3">
                      {influence.topInfluencedProducts.map((p) => (
                        <Link key={p.productId} href={`/products/${p.productId}`} className="flex items-center gap-3 group">
                          <div className="h-8 w-8 rounded-lg bg-surface shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-medium group-hover:underline truncate">{p.productName}</p>
                            <p className="text-[10px] text-muted">{p.brand}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 rounded-full bg-surface overflow-hidden">
                              <div className="h-full rounded-full bg-foreground" style={{ width: `${p.influence}%` }} />
                            </div>
                            <span className="text-[11px] font-semibold w-6 text-right">{p.influence}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-white p-5">
                    <h3 className="text-[13px] font-semibold mb-4">Brand Relationships</h3>
                    <div className="space-y-3">
                      {influence.topInfluencedBrands.map((b) => (
                        <div key={b.brandId} className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center shrink-0">
                            <span className="text-[8px] font-bold text-white">{b.brandName.slice(0, 2).toUpperCase()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-medium truncate">{b.brandName}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 rounded-full bg-surface overflow-hidden">
                              <div className="h-full rounded-full bg-foreground" style={{ width: `${b.influence}%` }} />
                            </div>
                            <span className="text-[11px] font-semibold w-6 text-right">{b.influence}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Conversion funnel */}
                <div className="rounded-2xl border border-border bg-white p-5">
                  <h3 className="text-[13px] font-semibold mb-4">Conversion Funnel</h3>
                  <div className="flex items-center gap-2">
                    {[
                      { label: "Discoveries", value: influence.metrics.productDiscoveries },
                      { label: "Saves", value: influence.metrics.productSaves },
                      { label: "Spec Downloads", value: influence.metrics.specDownloads },
                      { label: "Enquiries", value: influence.metrics.enquiriesGenerated },
                    ].map((step, i, arr) => (
                      <div key={step.label} className="flex items-center gap-2 flex-1">
                        <div className="flex-1 rounded-xl bg-surface p-3 text-center">
                          <p className="text-[18px] font-bold">{step.value.toLocaleString()}</p>
                          <p className="text-[10px] text-muted mt-0.5">{step.label}</p>
                          {i > 0 && (
                            <p className="text-[10px] text-emerald font-medium mt-1">{((step.value / arr[i - 1].value) * 100).toFixed(1)}%</p>
                          )}
                        </div>
                        {i < arr.length - 1 && <ChevronRight size={14} className="text-muted shrink-0" />}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Boards + Specs summary */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-white p-5">
                <h3 className="text-[13px] font-semibold mb-4">Design Boards ({archBoards.length})</h3>
                <div className="space-y-2">
                  {archBoards.map((board) => (
                    <Link key={board.id} href={`/boards/${board.id}`} className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-surface/50 transition-colors">
                      <Layers size={14} className="text-muted" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium truncate">{board.name}</p>
                        <p className="text-[10px] text-muted">{board.productIds.length} products</p>
                      </div>
                    </Link>
                  ))}
                  {archBoards.length === 0 && <p className="text-[12px] text-muted py-3 text-center">No boards</p>}
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-white p-5">
                <h3 className="text-[13px] font-semibold mb-4">Specifications ({archSpecs.length})</h3>
                <div className="space-y-2">
                  {archSpecs.map((spec) => {
                    const total = spec.rooms.reduce((s, r) => s + r.items.length, 0);
                    const installed = spec.rooms.reduce((s, r) => s + r.items.filter((i) => i.status === "installed").length, 0);
                    return (
                      <Link key={spec.id} href={`/specifications/${spec.id}`} className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-surface/50 transition-colors">
                        <ClipboardList size={14} className="text-muted" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium truncate">{spec.projectName}</p>
                          <p className="text-[10px] text-muted">{total} items · {installed} installed</p>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${spec.status === "approved" ? "bg-emerald-light text-emerald" : spec.status === "review" ? "bg-amber-light text-amber" : "bg-surface text-muted"}`}>{spec.status}</span>
                      </Link>
                    );
                  })}
                  {archSpecs.length === 0 && <p className="text-[12px] text-muted py-3 text-center">No specifications</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "projects" && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl">
            {archProjects.map((proj) => (
              <Link key={proj.id} href={`/projects/${proj.id}`} className="group rounded-2xl border border-border bg-white overflow-hidden hover:shadow-md transition-all">
                <div className="aspect-[16/10] bg-surface" />
                <div className="p-4">
                  <h3 className="text-[14px] font-semibold group-hover:underline">{proj.title}</h3>
                  <p className="text-[12px] text-muted mt-0.5">{proj.location} · {proj.year}</p>
                  <p className="mt-2 text-[12px] text-muted line-clamp-2">{proj.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {proj.tags.map((t) => <span key={t} className="rounded-full bg-surface px-2 py-0.5 text-[10px] text-muted">{t}</span>)}
                  </div>
                </div>
              </Link>
            ))}
            {archProjects.length === 0 && <p className="text-[13px] text-muted py-8 col-span-3 text-center">No published projects</p>}
          </div>
        )}

        {activeTab === "products" && (
          <div className="space-y-6 max-w-4xl">
            <div className="rounded-2xl border border-border bg-white p-5">
              <h3 className="text-[13px] font-semibold mb-4">Products Used ({usedProducts.length})</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {usedProducts.map((p) => {
                  const momentum = productMomentumData.find((m) => m.productId === p.id);
                  return (
                    <Link key={p.id} href={`/products/${p.id}`} className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-surface/50 transition-colors">
                      <div className="h-10 w-10 rounded-lg bg-surface shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium truncate">{p.name}</p>
                        <p className="text-[10px] text-muted">{p.brand} · {p.category}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[12px] font-medium">{p.price}</p>
                        {momentum && <p className="text-[10px] text-muted">Score {momentum.momentumScore}</p>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-white p-5">
              <h3 className="text-[13px] font-semibold mb-4">Brand Usage</h3>
              <div className="space-y-2">
                {Object.entries(brandUsage).sort((a, b) => b[1] - a[1]).map(([brand, count]) => (
                  <div key={brand} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center shrink-0">
                      <span className="text-[8px] font-bold text-white">{brand.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <span className="flex-1 text-[12px] font-medium">{brand}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-surface overflow-hidden">
                        <div className="h-full rounded-full bg-foreground" style={{ width: `${(count / Math.max(...Object.values(brandUsage))) * 100}%` }} />
                      </div>
                      <span className="text-[12px] font-semibold w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="max-w-3xl">
            <div className="rounded-2xl border border-border bg-white overflow-hidden">
              <div className="divide-y divide-border">
                {archActivity.length === 0 && <p className="text-[13px] text-muted py-8 text-center">No recent activity</p>}
                {archActivity.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-surface/50 transition-colors">
                    <div className="mt-0.5 h-8 w-8 rounded-full bg-surface shrink-0" />
                    <div className="flex-1">
                      <p className="text-[12px]"><span className="font-medium">{event.actor.name}</span> <span className="text-muted">{event.type.replace(/_/g, " ")}</span> <span className="font-medium">{event.productName}</span></p>
                      <p className="text-[11px] text-muted mt-0.5">{new Date(event.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
