"use client";

import { useState } from "react";
import { productMomentumData, ProductMomentum } from "@/lib/intelligence-data";
import { products, projects, architects } from "@/lib/mock-data";
import {
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  Heart,
  LayoutGrid,
  Download,
  Tag,
  Flame,
  X,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Filter,
  BarChart3,
  Zap,
  ExternalLink,
  Clock,
  Users,
  FolderKanban,
  SlidersHorizontal,
} from "lucide-react";

const trendConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  surging: { label: "Surging", icon: Flame, color: "text-rose", bg: "bg-rose-light" },
  rising: { label: "Rising", icon: TrendingUp, color: "text-emerald", bg: "bg-emerald-light" },
  steady: { label: "Steady", icon: Minus, color: "text-blue", bg: "bg-blue-light" },
  cooling: { label: "Cooling", icon: ArrowDown, color: "text-muted", bg: "bg-surface" },
};

const categoryOptions = ["All Categories", "Lighting", "Surfaces", "Furniture", "Kitchen", "Hardware", "Roofing", "Outdoor"];

function GrowthBadge({ value }: { value: number }) {
  const positive = value > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${positive ? "text-emerald" : value < 0 ? "text-rose" : "text-muted"}`}>
      {positive ? <ArrowUp size={10} /> : value < 0 ? <ArrowDown size={10} /> : <Minus size={10} />}
      {Math.abs(value)}%
    </span>
  );
}

function MomentumBar({ score }: { score: number }) {
  const segments = 24;
  const filled = Math.round((score / 100) * segments);
  return (
    <div className="flex gap-[2px]">
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          className={`h-2 flex-1 rounded-[2px] transition-all ${
            i < filled
              ? score >= 80 ? "bg-foreground" : score >= 60 ? "bg-foreground/60" : "bg-foreground/30"
              : "bg-surface"
          }`}
        />
      ))}
    </div>
  );
}

function SparklineChart({ data, height = 48 }: { data: { day: string; views: number; saves: number }[]; height?: number }) {
  const maxViews = Math.max(...data.map((d) => d.views));
  return (
    <div className="flex items-end gap-[3px]" style={{ height }}>
      {data.map((d) => (
        <div key={d.day} className="flex flex-1 flex-col items-center gap-[3px]">
          <div className="relative w-full flex flex-col items-stretch">
            <div className="w-full rounded-t-[2px] bg-border" style={{ height: `${(d.views / maxViews) * (height - 16)}px` }} />
            <div className="absolute bottom-0 w-full rounded-t-[2px] bg-foreground" style={{ height: `${(d.saves / maxViews) * (height - 16)}px` }} />
          </div>
          <span className="text-[9px] text-muted">{d.day.slice(0, 2)}</span>
        </div>
      ))}
    </div>
  );
}

function DetailPanel({ product, onClose }: { product: ProductMomentum; onClose: () => void }) {
  const tc = trendConfig[product.trend];
  const TrendIcon = tc.icon;
  const taggedProjects = product.taggedInProjects.map((pid) => projects.find((p) => p.id === pid)).filter(Boolean);
  const savingArchitects = product.savedByArchitects.map((aid) => architects.find((a) => a.id === aid)).filter(Boolean);
  const prod = products.find((p) => p.id === product.productId);

  const totalEngagement = product.metrics.views + product.metrics.saves * 5 + product.metrics.boards * 10 + product.metrics.specs * 15 + product.metrics.projectTags * 20;
  const conversionRate = ((product.metrics.saves / product.metrics.views) * 100).toFixed(1);
  const specRate = ((product.metrics.specs / product.metrics.views) * 100).toFixed(1);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-[480px] border-l border-border bg-white shadow-2xl overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-surface" />
          <div>
            <h3 className="text-[15px] font-semibold">{product.productName}</h3>
            <p className="text-[12px] text-muted">{product.brand}</p>
          </div>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-surface"><X size={18} /></button>
      </div>

      <div className="p-6 space-y-6">
        {/* Score + Trend */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted mb-2">Momentum Score</p>
            <div className="flex items-end gap-2">
              <span className="text-[36px] font-bold leading-none tracking-tight">{product.momentumScore}</span>
              <span className={`mb-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${tc.bg} ${tc.color}`}>
                <TrendIcon size={11} /> {tc.label}
              </span>
            </div>
            <MomentumBar score={product.momentumScore} />
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted mb-3">Performance Metrics</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Eye, label: "Total Views", value: product.metrics.views, growth: product.metrics.viewsGrowth },
              { icon: Heart, label: "Saves", value: product.metrics.saves, growth: product.metrics.savesGrowth },
              { icon: LayoutGrid, label: "Board Adds", value: product.metrics.boards, growth: product.metrics.boardsGrowth },
              { icon: Download, label: "Spec Downloads", value: product.metrics.specs, growth: product.metrics.specsGrowth },
              { icon: Tag, label: "Project Tags", value: product.metrics.projectTags, growth: product.metrics.projectTagsGrowth },
              { icon: Zap, label: "Engagement Score", value: totalEngagement, growth: Math.round((product.metrics.viewsGrowth + product.metrics.savesGrowth) / 2) },
            ].map((m) => (
              <div key={m.label} className="rounded-xl border border-border p-3">
                <div className="flex items-center justify-between">
                  <m.icon size={13} className="text-muted" />
                  <GrowthBadge value={m.growth} />
                </div>
                <p className="mt-2 text-[18px] font-semibold">{m.value.toLocaleString()}</p>
                <p className="text-[11px] text-muted">{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion Benchmarks */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted mb-3">Conversion Benchmarks</p>
          <div className="space-y-3">
            {[
              { label: "View → Save Rate", value: conversionRate, benchmark: "3.8", unit: "%" },
              { label: "View → Spec Rate", value: specRate, benchmark: "2.1", unit: "%" },
              { label: "Board Inclusion Rate", value: ((product.metrics.boards / product.metrics.saves) * 100).toFixed(1), benchmark: "14.2", unit: "%" },
            ].map((b) => (
              <div key={b.label} className="flex items-center justify-between">
                <span className="text-[12px] text-muted">{b.label}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-1.5 rounded-full bg-surface overflow-hidden">
                    <div className="h-full rounded-full bg-foreground" style={{ width: `${Math.min(parseFloat(b.value) / 10 * 100, 100)}%` }} />
                  </div>
                  <span className="text-[13px] font-semibold w-12 text-right">{b.value}{b.unit}</span>
                  <span className="text-[10px] text-muted w-16">avg {b.benchmark}{b.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Chart */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted mb-3">Weekly Activity</p>
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center gap-4 mb-3 text-[10px] text-muted">
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-border" />Views</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-foreground" />Saves</span>
            </div>
            <SparklineChart data={product.weeklyData} height={64} />
          </div>
        </div>

        {/* Tagged Projects */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted mb-3">Tagged in Projects ({taggedProjects.length})</p>
          <div className="space-y-2">
            {taggedProjects.map((proj) => proj && (
              <div key={proj.id} className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-surface/50 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-surface shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium">{proj.title}</p>
                  <p className="text-[11px] text-muted">{proj.architect} · {proj.location}</p>
                </div>
                <ExternalLink size={14} className="text-muted shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Saving Architects */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted mb-3">Saved by Architects ({savingArchitects.length})</p>
          <div className="space-y-2">
            {savingArchitects.map((arch) => arch && (
              <div key={arch.id} className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-surface/50 transition-colors">
                <div className="h-9 w-9 rounded-full bg-surface shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium">{arch.name}</p>
                  <p className="text-[11px] text-muted">{arch.firm} · {arch.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Details */}
        {prod && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted mb-3">Product Details</p>
            <div className="rounded-xl border border-border p-4 space-y-2">
              <div className="flex justify-between text-[12px]"><span className="text-muted">Price</span><span className="font-medium">{prod.price}</span></div>
              <div className="flex justify-between text-[12px]"><span className="text-muted">Category</span><span className="font-medium">{prod.category}</span></div>
              <div className="flex justify-between text-[12px]"><span className="text-muted">Brand</span><span className="font-medium">{prod.brand}</span></div>
              <div className="flex justify-between text-[12px]"><span className="text-muted">Spec Sheet</span><span className="font-medium">{prod.specSheet ? "Available" : "Not available"}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MomentumPage() {
  const [trendFilter, setTrendFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [sortBy, setSortBy] = useState<"score" | "views" | "saves" | "growth">("score");
  const [selectedProduct, setSelectedProduct] = useState<ProductMomentum | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const surging = productMomentumData.filter((p) => p.trend === "surging").length;
  const rising = productMomentumData.filter((p) => p.trend === "rising").length;
  const steady = productMomentumData.filter((p) => p.trend === "steady").length;
  const cooling = productMomentumData.filter((p) => p.trend === "cooling").length;
  const avgScore = Math.round(productMomentumData.reduce((s, p) => s + p.momentumScore, 0) / productMomentumData.length);
  const totalViews = productMomentumData.reduce((s, p) => s + p.metrics.views, 0);
  const avgGrowth = Math.round(productMomentumData.reduce((s, p) => s + p.metrics.viewsGrowth, 0) / productMomentumData.length);

  let filtered = trendFilter === "all" ? [...productMomentumData] : productMomentumData.filter((p) => p.trend === trendFilter);
  if (categoryFilter !== "All Categories") {
    const prod = products.find((p) => p.category === categoryFilter);
    if (prod) filtered = filtered.filter((p) => products.find((pr) => pr.id === p.productId)?.category === categoryFilter);
  }
  filtered.sort((a, b) => {
    if (sortBy === "score") return b.momentumScore - a.momentumScore;
    if (sortBy === "views") return b.metrics.views - a.metrics.views;
    if (sortBy === "saves") return b.metrics.saves - a.metrics.saves;
    return b.metrics.viewsGrowth - a.metrics.viewsGrowth;
  });

  return (
    <div className="min-h-screen bg-surface/50">
      {/* Header */}
      <div className="border-b border-border bg-white px-8 py-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">Intelligence</p>
            <h1 className="mt-1 text-[28px] font-semibold tracking-tight">Product Momentum</h1>
            <p className="mt-1 text-[13px] text-muted max-w-xl">
              Detecting trending products by growth velocity across views, saves, boards, specifications, and project tags.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-muted hover:bg-surface">
              <Download size={13} className="inline mr-1.5" />Export
            </button>
            <button className="rounded-lg bg-foreground px-4 py-1.5 text-[12px] font-medium text-white hover:opacity-90">
              Configure Alerts
            </button>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <div className="rounded-2xl border border-border bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={14} className="text-muted" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">Avg Score</span>
            </div>
            <p className="text-[24px] font-bold tracking-tight">{avgScore}</p>
            <div className="mt-1 h-1 rounded-full bg-surface overflow-hidden">
              <div className="h-full rounded-full bg-foreground" style={{ width: `${avgScore}%` }} />
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame size={14} className="text-rose" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">Surging</span>
            </div>
            <p className="text-[24px] font-bold tracking-tight">{surging}</p>
            <p className="text-[11px] text-rose mt-1">Highest velocity</p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} className="text-emerald" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">Rising</span>
            </div>
            <p className="text-[24px] font-bold tracking-tight">{rising}</p>
            <p className="text-[11px] text-emerald mt-1">Growing steadily</p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye size={14} className="text-muted" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">Total Views</span>
            </div>
            <p className="text-[24px] font-bold tracking-tight">{totalViews.toLocaleString()}</p>
            <p className="text-[11px] text-emerald mt-1">+{avgGrowth}% avg growth</p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-amber" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">Tracked</span>
            </div>
            <p className="text-[24px] font-bold tracking-tight">{productMomentumData.length}</p>
            <p className="text-[11px] text-muted mt-1">{steady} steady · {cooling} cooling</p>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-semibold">Momentum by Category</h3>
            <span className="text-[11px] text-muted">Avg. score per product category</span>
          </div>
          <div className="flex items-end gap-3 h-[100px]">
            {["Lighting", "Surfaces", "Furniture", "Hardware", "Roofing", "Outdoor"].map((cat) => {
              const catProducts = productMomentumData.filter((p) => {
                const prod = products.find((pr) => pr.id === p.productId);
                return prod?.category === cat || prod?.category === cat.slice(0, -1);
              });
              const avg = catProducts.length > 0 ? Math.round(catProducts.reduce((s, p) => s + p.momentumScore, 0) / catProducts.length) : 0;
              return (
                <div key={cat} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[11px] font-semibold">{avg || "—"}</span>
                  <div className="w-full rounded-t-md bg-foreground transition-all hover:opacity-80" style={{ height: `${(avg / 100) * 70}px` }} />
                  <span className="text-[10px] text-muted">{cat}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-border bg-white p-1">
              {["all", "surging", "rising", "steady", "cooling"].map((t) => {
                const config = t !== "all" ? trendConfig[t] : null;
                return (
                  <button
                    key={t}
                    onClick={() => setTrendFilter(t)}
                    className={`rounded-md px-3 py-1.5 text-[12px] font-medium capitalize transition-colors ${
                      trendFilter === t ? "bg-foreground text-white" : "text-muted hover:bg-surface"
                    }`}
                  >
                    {t === "all" ? "All" : t}
                  </button>
                );
              })}
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-border bg-white px-3 py-2 text-[12px] text-muted"
            >
              {categoryOptions.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-lg border border-border bg-white px-3 py-2 text-[12px] text-muted"
            >
              <option value="score">Sort: Score</option>
              <option value="views">Sort: Views</option>
              <option value="saves">Sort: Saves</option>
              <option value="growth">Sort: Growth</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="rounded-2xl border border-border bg-white overflow-hidden">
          <table className="w-full table-premium">
            <thead>
              <tr className="bg-surface/50">
                <th className="w-10 text-center">#</th>
                <th>Product</th>
                <th>Trend</th>
                <th className="text-center">Score</th>
                <th className="text-right">Views</th>
                <th className="text-right">Saves</th>
                <th className="text-right">Boards</th>
                <th className="text-right">Specs</th>
                <th className="text-right">Tags</th>
                <th className="hidden xl:table-cell">7d Activity</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const tc = trendConfig[p.trend];
                const TrendIcon = tc.icon;
                return (
                  <tr
                    key={p.productId}
                    className="cursor-pointer hover:bg-surface/50 transition-colors"
                    onClick={() => setSelectedProduct(p)}
                  >
                    <td className="text-center">
                      <span className="text-[12px] font-semibold text-muted">{i + 1}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-surface shrink-0" />
                        <div>
                          <p className="text-[13px] font-medium">{p.productName}</p>
                          <p className="text-[11px] text-muted">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${tc.bg} ${tc.color}`}>
                        <TrendIcon size={10} /> {tc.label}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-[15px] font-bold">{p.momentumScore}</span>
                        <div className="w-12 mt-1"><MomentumBar score={p.momentumScore} /></div>
                      </div>
                    </td>
                    <td className="text-right">
                      <p className="text-[13px] font-medium">{p.metrics.views.toLocaleString()}</p>
                      <GrowthBadge value={p.metrics.viewsGrowth} />
                    </td>
                    <td className="text-right">
                      <p className="text-[13px] font-medium">{p.metrics.saves}</p>
                      <GrowthBadge value={p.metrics.savesGrowth} />
                    </td>
                    <td className="text-right">
                      <p className="text-[13px] font-medium">{p.metrics.boards}</p>
                      <GrowthBadge value={p.metrics.boardsGrowth} />
                    </td>
                    <td className="text-right">
                      <p className="text-[13px] font-medium">{p.metrics.specs}</p>
                      <GrowthBadge value={p.metrics.specsGrowth} />
                    </td>
                    <td className="text-right">
                      <p className="text-[13px] font-medium">{p.metrics.projectTags}</p>
                      <GrowthBadge value={p.metrics.projectTagsGrowth} />
                    </td>
                    <td className="hidden xl:table-cell">
                      <SparklineChart data={p.weeklyData} height={36} />
                    </td>
                    <td>
                      <ArrowRight size={14} className="text-muted" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom: Insights */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="text-[13px] font-semibold mb-4">Fastest Growing Products</h3>
            <div className="space-y-3">
              {[...productMomentumData].sort((a, b) => b.metrics.viewsGrowth - a.metrics.viewsGrowth).slice(0, 4).map((p, i) => (
                <div key={p.productId} className="flex items-center gap-3">
                  <span className="w-5 text-center text-[12px] font-semibold text-muted">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">{p.productName}</p>
                    <p className="text-[11px] text-muted">{p.brand}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full bg-surface overflow-hidden">
                      <div className="h-full rounded-full bg-emerald" style={{ width: `${Math.min(p.metrics.viewsGrowth * 2, 100)}%` }} />
                    </div>
                    <span className="text-[12px] font-semibold text-emerald">+{p.metrics.viewsGrowth}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="text-[13px] font-semibold mb-4">Most Specified Products</h3>
            <div className="space-y-3">
              {[...productMomentumData].sort((a, b) => b.metrics.specs - a.metrics.specs).slice(0, 4).map((p, i) => (
                <div key={p.productId} className="flex items-center gap-3">
                  <span className="w-5 text-center text-[12px] font-semibold text-muted">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">{p.productName}</p>
                    <p className="text-[11px] text-muted">{p.brand}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-semibold">{p.metrics.specs}</p>
                    <p className="text-[10px] text-muted">specifications</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedProduct && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setSelectedProduct(null)} />
          <DetailPanel product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        </>
      )}
    </div>
  );
}
