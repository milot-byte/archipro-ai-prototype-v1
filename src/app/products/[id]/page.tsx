"use client";

import { use, useState } from "react";
import Link from "next/link";
import { products, brands, projects, architects } from "@/lib/mock-data";
import { productMomentumData, architectInfluenceData, designBoards, specifications, activityFeed } from "@/lib/intelligence-data";
import {
  ArrowLeft, Heart, Download, MessageCircle, ExternalLink, Share2, Eye,
  TrendingUp, TrendingDown, Layers, FolderKanban, ClipboardList, Crown,
  Bookmark, ShoppingCart, ArrowUp, ArrowDown, Minus, Tag, BarChart3,
  Zap, Users, Clock, ChevronRight, Star, Copy, Sparkles,
} from "lucide-react";

function GrowthBadge({ value }: { value: number }) {
  const positive = value > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${positive ? "text-emerald" : value < 0 ? "text-rose" : "text-muted"}`}>
      {positive ? <ArrowUp size={10} /> : value < 0 ? <ArrowDown size={10} /> : <Minus size={10} />}
      {Math.abs(value)}%
    </span>
  );
}

function MiniSparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 120;
  const h = 40;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4)}`).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={points} fill="none" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const trendConfig: Record<string, { label: string; color: string; bg: string }> = {
  surging: { label: "Surging", color: "text-rose", bg: "bg-rose-light" },
  rising: { label: "Rising", color: "text-emerald", bg: "bg-emerald-light" },
  steady: { label: "Steady", color: "text-blue", bg: "bg-blue-light" },
  cooling: { label: "Cooling", color: "text-muted", bg: "bg-surface" },
};

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const product = products.find((p) => p.id === id);
  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "projects" | "activity">("overview");

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-[20px] font-semibold">Product not found</h1>
          <Link href="/products" className="mt-3 inline-flex items-center gap-1 text-[13px] text-muted hover:text-foreground">
            <ArrowLeft size={14} /> Back to products
          </Link>
        </div>
      </div>
    );
  }

  const brand = brands.find((b) => b.id === product.brandId);
  const momentum = productMomentumData.find((m) => m.productId === product.id);
  const taggedProjects = projects.filter((p) => p.products.includes(product.id));
  const savingArchitects = momentum?.savedByArchitects.map((aid) => architects.find((a) => a.id === aid)).filter(Boolean) || [];
  const onBoards = designBoards.filter((b) => b.productIds.includes(product.id));
  const inSpecs = specifications.filter((s) => s.rooms.some((r) => r.items.some((i) => i.productId === product.id)));
  const productActivity = activityFeed.filter((e) => e.productId === product.id);
  const relatedProducts = products.filter((p) => p.brandId === product.brandId && p.id !== product.id).slice(0, 4);
  const tc = momentum ? trendConfig[momentum.trend] : null;

  // Simulated spec data
  const specDetails = {
    dimensions: product.category === "Lighting" ? "Ø380 × H240mm" : product.category === "Furniture" ? "W850 × D820 × H780mm" : "Varies",
    weight: product.category === "Lighting" ? "2.4kg" : product.category === "Furniture" ? "18kg" : "N/A",
    material: product.category === "Lighting" ? "Spun aluminium, opal glass" : product.category === "Surfaces" ? "Engineered oak, HDF core" : product.category === "Furniture" ? "Solid American oak, wool upholstery" : "Steel / composite",
    finish: product.category === "Hardware" ? "Matte black powder coat" : "Natural / custom",
    warranty: "5 years",
    leadTime: "3–4 weeks",
    minOrder: product.category === "Surfaces" ? "10m²" : "1 unit",
    origin: "New Zealand",
    certification: ["NZBC Compliant", "FSC Certified"],
    installation: product.category === "Lighting" ? "Hardwired — electrician required" : product.category === "Surfaces" ? "Glue-down or floating" : "Professional recommended",
  };

  return (
    <div className="min-h-screen bg-surface/50">
      {/* Header */}
      <div className="border-b border-border bg-white px-8 py-5">
        <Link href="/products" className="inline-flex items-center gap-1 text-[12px] text-muted hover:text-foreground mb-4">
          <ArrowLeft size={13} /> Back to products
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex gap-6">
            <div className="h-28 w-28 rounded-2xl bg-surface shrink-0 flex items-center justify-center">
              <span className="text-[10px] text-muted">{product.category}</span>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted">{product.brand}</p>
              <h1 className="mt-0.5 text-[26px] font-semibold tracking-tight">{product.name}</h1>
              <p className="mt-1 text-[14px] text-muted">{product.category} · {brand?.category}</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-[22px] font-bold">{product.price}</span>
                {tc && momentum && (
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${tc.bg} ${tc.color}`}>
                    <TrendingUp size={11} /> {tc.label} · Score {momentum.momentumScore}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-muted hover:bg-surface"><Heart size={13} className="inline mr-1.5" />Save</button>
            <button className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-muted hover:bg-surface"><Layers size={13} className="inline mr-1.5" />Add to Board</button>
            <button className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-muted hover:bg-surface"><Share2 size={13} className="inline mr-1.5" />Share</button>
            {product.specSheet && (
              <button className="rounded-lg bg-foreground px-4 py-1.5 text-[12px] font-medium text-white hover:opacity-90"><Download size={13} className="inline mr-1.5" />Download Spec</button>
            )}
            <button className="rounded-lg bg-foreground px-4 py-1.5 text-[12px] font-medium text-white hover:opacity-90"><MessageCircle size={13} className="inline mr-1.5" />Enquire</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border bg-white px-8">
        <div className="flex gap-1">
          {(["overview", "specs", "projects", "activity"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`border-b-2 px-4 py-3 text-[13px] font-medium capitalize transition-colors ${activeTab === tab ? "border-foreground text-foreground" : "border-transparent text-muted hover:text-foreground"}`}>
              {tab === "specs" ? "Specifications" : tab}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* KPIs */}
            {momentum && (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
                {[
                  { label: "Views", value: momentum.metrics.views, growth: momentum.metrics.viewsGrowth, icon: Eye },
                  { label: "Saves", value: momentum.metrics.saves, growth: momentum.metrics.savesGrowth, icon: Heart },
                  { label: "Board Adds", value: momentum.metrics.boards, growth: momentum.metrics.boardsGrowth, icon: Layers },
                  { label: "Spec Downloads", value: momentum.metrics.specs, growth: momentum.metrics.specsGrowth, icon: Download },
                  { label: "Project Tags", value: momentum.metrics.projectTags, growth: momentum.metrics.projectTagsGrowth, icon: Tag },
                  { label: "Momentum", value: momentum.momentumScore, growth: momentum.metrics.viewsGrowth, icon: Zap },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl border border-border bg-white p-4">
                    <div className="flex items-center justify-between mb-2">
                      <s.icon size={14} className="text-muted" />
                      <GrowthBadge value={s.growth} />
                    </div>
                    <p className="text-[22px] font-bold tracking-tight">{s.value.toLocaleString()}</p>
                    <p className="text-[11px] text-muted">{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Weekly chart */}
              {momentum && (
                <div className="rounded-2xl border border-border bg-white p-5">
                  <h3 className="text-[13px] font-semibold mb-4">Weekly Activity</h3>
                  <div className="flex items-center gap-4 mb-3 text-[10px] text-muted">
                    <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-border" />Views</span>
                    <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-foreground" />Saves</span>
                  </div>
                  <div className="flex items-end gap-[3px] h-[80px]">
                    {momentum.weeklyData.map((d) => {
                      const maxViews = Math.max(...momentum.weeklyData.map((x) => x.views));
                      return (
                        <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                          <div className="relative w-full">
                            <div className="w-full rounded-t-[2px] bg-border" style={{ height: `${(d.views / maxViews) * 64}px` }} />
                            <div className="absolute bottom-0 w-full rounded-t-[2px] bg-foreground" style={{ height: `${(d.saves / maxViews) * 64}px` }} />
                          </div>
                          <span className="text-[9px] text-muted">{d.day.slice(0, 2)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Conversion benchmarks */}
              {momentum && (
                <div className="rounded-2xl border border-border bg-white p-5">
                  <h3 className="text-[13px] font-semibold mb-4">Conversion Rates</h3>
                  <div className="space-y-4">
                    {[
                      { label: "View → Save", value: ((momentum.metrics.saves / momentum.metrics.views) * 100).toFixed(1), benchmark: "3.8" },
                      { label: "View → Spec", value: ((momentum.metrics.specs / momentum.metrics.views) * 100).toFixed(1), benchmark: "2.1" },
                      { label: "Save → Board", value: ((momentum.metrics.boards / momentum.metrics.saves) * 100).toFixed(1), benchmark: "14.2" },
                      { label: "View → Enquiry", value: ((momentum.metrics.projectTags / momentum.metrics.views) * 100).toFixed(2), benchmark: "0.15" },
                    ].map((b) => (
                      <div key={b.label}>
                        <div className="flex items-center justify-between text-[12px] mb-1">
                          <span className="text-muted">{b.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{b.value}%</span>
                            <span className="text-[10px] text-muted">avg {b.benchmark}%</span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-surface overflow-hidden">
                          <div className="h-full rounded-full bg-foreground" style={{ width: `${Math.min(parseFloat(b.value) / parseFloat(b.benchmark) * 50, 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related products */}
              <div className="rounded-2xl border border-border bg-white p-5">
                <h3 className="text-[13px] font-semibold mb-4">More from {product.brand}</h3>
                <div className="space-y-3">
                  {relatedProducts.map((rp) => (
                    <Link key={rp.id} href={`/products/${rp.id}`} className="flex items-center gap-3 rounded-xl p-2 -mx-2 hover:bg-surface/50 transition-colors">
                      <div className="h-10 w-10 rounded-lg bg-surface shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium truncate">{rp.name}</p>
                        <p className="text-[10px] text-muted">{rp.category}</p>
                      </div>
                      <span className="text-[12px] font-medium">{rp.price}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Projects + Architects */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-white p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[13px] font-semibold">Used in Projects ({taggedProjects.length})</h3>
                </div>
                <div className="space-y-2">
                  {taggedProjects.map((proj) => (
                    <Link key={proj.id} href={`/projects/${proj.id}`} className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-surface/50 transition-colors">
                      <div className="h-12 w-12 rounded-lg bg-surface shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium">{proj.title}</p>
                        <p className="text-[11px] text-muted">{proj.architect} · {proj.location}</p>
                      </div>
                      <ChevronRight size={14} className="text-muted" />
                    </Link>
                  ))}
                  {taggedProjects.length === 0 && <p className="text-[12px] text-muted py-4 text-center">No projects yet</p>}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-white p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[13px] font-semibold">Saved by Architects ({savingArchitects.length})</h3>
                </div>
                <div className="space-y-2">
                  {savingArchitects.map((arch) => arch && (
                    <Link key={arch.id} href={`/architects/${arch.id}`} className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-surface/50 transition-colors">
                      <div className="h-10 w-10 rounded-full bg-surface shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium">{arch.name}</p>
                        <p className="text-[11px] text-muted">{arch.firm} · {arch.location}</p>
                      </div>
                      {(() => { const inf = architectInfluenceData.find((a) => a.architectId === arch.id); return inf ? <span className="text-[12px] font-semibold">{inf.influenceScore}</span> : null; })()}
                    </Link>
                  ))}
                  {savingArchitects.length === 0 && <p className="text-[12px] text-muted py-4 text-center">No architect data</p>}
                </div>
              </div>
            </div>

            {/* Boards and Specs */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-white p-5">
                <h3 className="text-[13px] font-semibold mb-4">Appears on Boards ({onBoards.length})</h3>
                <div className="space-y-2">
                  {onBoards.map((board) => (
                    <Link key={board.id} href={`/boards/${board.id}`} className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-surface/50 transition-colors">
                      <Layers size={15} className="text-muted shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium truncate">{board.name}</p>
                        <p className="text-[10px] text-muted">{board.owner.name} · {board.productIds.length} products</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-white p-5">
                <h3 className="text-[13px] font-semibold mb-4">In Specifications ({inSpecs.length})</h3>
                <div className="space-y-2">
                  {inSpecs.map((spec) => (
                    <Link key={spec.id} href={`/specifications/${spec.id}`} className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-surface/50 transition-colors">
                      <ClipboardList size={15} className="text-muted shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium truncate">{spec.projectName}</p>
                        <p className="text-[10px] text-muted">{spec.architect} · {spec.status}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "specs" && (
          <div className="max-w-3xl space-y-6">
            <div className="rounded-2xl border border-border bg-white overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="text-[14px] font-semibold">Technical Specifications</h3>
              </div>
              <table className="w-full">
                <tbody>
                  {[
                    ["Product Name", product.name],
                    ["Brand", product.brand],
                    ["Category", product.category],
                    ["Price", product.price],
                    ["Dimensions", specDetails.dimensions],
                    ["Weight", specDetails.weight],
                    ["Material", specDetails.material],
                    ["Finish", specDetails.finish],
                    ["Warranty", specDetails.warranty],
                    ["Lead Time", specDetails.leadTime],
                    ["Minimum Order", specDetails.minOrder],
                    ["Country of Origin", specDetails.origin],
                    ["Installation", specDetails.installation],
                  ].map(([label, value]) => (
                    <tr key={label} className="border-b border-border last:border-0 hover:bg-surface/30">
                      <td className="px-5 py-3 text-[12px] font-medium text-muted w-48">{label}</td>
                      <td className="px-5 py-3 text-[13px]">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-2xl border border-border bg-white p-5">
              <h3 className="text-[14px] font-semibold mb-3">Certifications</h3>
              <div className="flex flex-wrap gap-2">
                {specDetails.certification.map((cert) => (
                  <span key={cert} className="rounded-full bg-emerald-light px-3 py-1 text-[11px] font-medium text-emerald">{cert}</span>
                ))}
              </div>
            </div>
            {product.specSheet && (
              <div className="rounded-2xl border border-border bg-white p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-[14px] font-semibold">Specification Sheet</h3>
                  <p className="text-[12px] text-muted mt-0.5">Full technical specification PDF with installation guides</p>
                </div>
                <button className="rounded-lg bg-foreground px-4 py-2 text-[12px] font-medium text-white hover:opacity-90"><Download size={13} className="inline mr-1.5" />Download PDF</button>
              </div>
            )}
          </div>
        )}

        {activeTab === "projects" && (
          <div className="space-y-4 max-w-3xl">
            {taggedProjects.length === 0 && <p className="text-[13px] text-muted py-8 text-center">This product hasn&apos;t been tagged in any projects yet.</p>}
            {taggedProjects.map((proj) => {
              const spec = specifications.find((s) => s.projectId === proj.id);
              const specItems = spec?.rooms.flatMap((r) => r.items).filter((i) => i.productId === product.id) || [];
              return (
                <Link key={proj.id} href={`/projects/${proj.id}`} className="block rounded-2xl border border-border bg-white overflow-hidden hover:shadow-md transition-all">
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 rounded-xl bg-surface shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-[15px] font-semibold">{proj.title}</h3>
                        <p className="text-[12px] text-muted">{proj.architect} · {proj.location} · {proj.year}</p>
                        <p className="mt-2 text-[12px] text-muted line-clamp-2">{proj.description}</p>
                        {specItems.length > 0 && (
                          <div className="mt-3 space-y-1">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">Usage in this project:</p>
                            {specItems.map((item, i) => (
                              <p key={i} className="text-[12px]">{item.quantity} {item.unit} — {item.notes} <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-medium ml-1 ${item.status === "installed" ? "bg-emerald-light text-emerald" : item.status === "ordered" ? "bg-blue-light text-blue" : "bg-surface text-muted"}`}>{item.status}</span></p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {activeTab === "activity" && (
          <div className="max-w-3xl">
            <div className="rounded-2xl border border-border bg-white overflow-hidden">
              <div className="divide-y divide-border">
                {productActivity.length === 0 && <p className="text-[13px] text-muted py-8 text-center">No activity recorded</p>}
                {productActivity.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-surface/50 transition-colors">
                    <div className="mt-0.5 h-8 w-8 rounded-full bg-surface shrink-0" />
                    <div className="flex-1">
                      <p className="text-[12px]"><span className="font-medium">{event.actor.name}</span> <span className="text-muted">{event.type.replace("_", " ")}</span></p>
                      <p className="text-[11px] text-muted mt-0.5">{new Date(event.timestamp).toLocaleString()}</p>
                      {event.message && <p className="mt-1 text-[11px] text-muted italic bg-surface rounded-lg px-3 py-1.5">&ldquo;{event.message}&rdquo;</p>}
                    </div>
                    <span className="text-[10px] rounded-full bg-surface px-2 py-0.5 text-muted capitalize">{event.actor.role}</span>
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
