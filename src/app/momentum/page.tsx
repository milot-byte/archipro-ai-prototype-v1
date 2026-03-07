"use client";

import { useState, useMemo } from "react";
import { productMomentumData, ProductMomentum, architectInfluenceData } from "@/lib/intelligence-data";
import { products, architects, brands } from "@/lib/mock-data";
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
  ArrowRight,
  BarChart3,
  Zap,
  ExternalLink,
  Target,
  Layers,
  GitBranch,
  Activity,
  ChevronDown,
  ChevronUp,
  Users,
} from "lucide-react";

// ─── Mock: Category benchmarks ──────────────────────────────────────────────
const categoryBenchmarks: Record<string, { avgScore: number; avgViews: number; avgSaves: number; avgConversion: number; p90Score: number }> = {
  Lighting: { avgScore: 68, avgViews: 2100, avgSaves: 95, avgConversion: 4.5, p90Score: 88 },
  Surfaces: { avgScore: 62, avgViews: 1800, avgSaves: 82, avgConversion: 3.8, p90Score: 82 },
  Furniture: { avgScore: 58, avgViews: 1600, avgSaves: 72, avgConversion: 4.1, p90Score: 78 },
  Hardware: { avgScore: 52, avgViews: 1200, avgSaves: 58, avgConversion: 3.2, p90Score: 72 },
  Roofing: { avgScore: 48, avgViews: 1000, avgSaves: 42, avgConversion: 2.8, p90Score: 65 },
  Outdoor: { avgScore: 44, avgViews: 800, avgSaves: 35, avgConversion: 2.5, p90Score: 60 },
  Kitchen: { avgScore: 55, avgViews: 1400, avgSaves: 65, avgConversion: 3.5, p90Score: 74 },
};

// ─── Mock: Product cohort data (weekly cohorts) ─────────────────────────────
const productCohorts = [
  { week: "W49", newDiscoveries: 18, retained1w: 72, retained2w: 58, retained4w: 41, specConversion: 12.4 },
  { week: "W50", newDiscoveries: 24, retained1w: 78, retained2w: 64, retained4w: 48, specConversion: 15.1 },
  { week: "W51", newDiscoveries: 31, retained1w: 81, retained2w: 68, retained4w: 52, specConversion: 18.3 },
  { week: "W52", newDiscoveries: 22, retained1w: 75, retained2w: 61, retained4w: 45, specConversion: 14.8 },
  { week: "W01", newDiscoveries: 28, retained1w: 83, retained2w: 71, retained4w: 55, specConversion: 19.2 },
  { week: "W02", newDiscoveries: 35, retained1w: 86, retained2w: 0, retained4w: 0, specConversion: 21.7 },
];

// ─── Mock: Engagement funnel ────────────────────────────────────────────────
const engagementFunnel = [
  { stage: "Impressions", value: 42800, pct: 100 },
  { stage: "Views", value: 15720, pct: 36.7 },
  { stage: "Saves", value: 707, pct: 4.5 },
  { stage: "Board Adds", value: 134, pct: 0.85 },
  { stage: "Spec Downloads", value: 658, pct: 4.19 },
  { stage: "Enquiries", value: 42, pct: 0.27 },
];

// ─── Mock: Spec conversion funnel ───────────────────────────────────────────
const specConversionFunnel = [
  { stage: "Board Created", value: 134, pct: 100 },
  { stage: "Products Selected", value: 118, pct: 88.1 },
  { stage: "Spec Generated", value: 89, pct: 66.4 },
  { stage: "Under Review", value: 64, pct: 47.8 },
  { stage: "Approved", value: 41, pct: 30.6 },
  { stage: "Installed", value: 22, pct: 16.4 },
];

// ─── Mock: Growth momentum composite scores ────────────────────────────────
const growthCompositeMetrics = [
  { label: "View Velocity", weight: 25, score: 82, trend: [58, 62, 68, 72, 78, 82] },
  { label: "Save Momentum", weight: 25, score: 76, trend: [52, 58, 62, 68, 72, 76] },
  { label: "Spec Conversion Rate", weight: 20, score: 71, trend: [48, 52, 58, 64, 68, 71] },
  { label: "Architect Adoption", weight: 15, score: 68, trend: [44, 48, 52, 58, 62, 68] },
  { label: "Cross-Project Spread", weight: 15, score: 64, trend: [38, 42, 48, 54, 58, 64] },
];

// ─── Config ─────────────────────────────────────────────────────────────────
const trendConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  surging: { label: "Surging", icon: Flame, color: "text-rose", bg: "bg-rose-light" },
  rising: { label: "Rising", icon: TrendingUp, color: "text-emerald", bg: "bg-emerald-light" },
  steady: { label: "Steady", icon: Minus, color: "text-blue", bg: "bg-blue-light" },
  cooling: { label: "Cooling", icon: ArrowDown, color: "text-muted", bg: "bg-surface" },
};

const categoryOptions = ["All Categories", "Lighting", "Surfaces", "Furniture", "Kitchen", "Hardware", "Roofing", "Outdoor"];

type SortKey = "score" | "views" | "saves" | "growth" | "specs" | "percentile";

// ─── Helper Components ──────────────────────────────────────────────────────

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

function PercentileBadge({ value }: { value: number }) {
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold tracking-tight ${
      value >= 90 ? "bg-foreground text-white" : value >= 75 ? "bg-foreground/80 text-white" : value >= 50 ? "bg-foreground/20 text-foreground" : "bg-surface text-muted"
    }`}>
      P{value}
    </span>
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

function MiniSparkline({ data, w = 80, h = 24 }: { data: number[]; w?: number; h?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={points} fill="none" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={h - ((data[data.length - 1] - min) / range) * h} r="2" fill="#0a0a0a" />
    </svg>
  );
}

function ScoreRing({ score, size = 100, stroke = 8 }: { score: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f5f5f5" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#0a0a0a" strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
    </svg>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getProductCategory(productId: string): string {
  return products.find((p) => p.id === productId)?.category || "Other";
}

function getPercentile(score: number, allScores: number[]): number {
  const sorted = [...allScores].sort((a, b) => a - b);
  const idx = sorted.findIndex((s) => s >= score);
  return Math.round(((idx === -1 ? sorted.length : idx) / sorted.length) * 100);
}

// ─── Detail Panel ───────────────────────────────────────────────────────────

function DetailPanel({ product, onClose, allScores }: { product: ProductMomentum; onClose: () => void; allScores: number[] }) {
  const tc = trendConfig[product.trend];
  const TrendIcon = tc.icon;
  const prod = products.find((p) => p.id === product.productId);
  const category = getProductCategory(product.productId);
  const bench = categoryBenchmarks[category] || categoryBenchmarks["Lighting"];
  const percentile = getPercentile(product.momentumScore, allScores);

  const conversionRate = ((product.metrics.saves / product.metrics.views) * 100).toFixed(1);
  const specRate = ((product.metrics.specs / product.metrics.views) * 100).toFixed(1);
  const boardRate = ((product.metrics.boards / product.metrics.saves) * 100).toFixed(1);

  const savingArchitects = product.savedByArchitects
    .map((aid) => architects.find((a) => a.id === aid))
    .filter(Boolean);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-[520px] border-l border-border bg-white shadow-2xl overflow-y-auto">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-surface" />
          <div>
            <h3 className="text-[15px] font-semibold">{product.productName}</h3>
            <p className="text-[12px] text-muted">{product.brand} · {category}</p>
          </div>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-surface"><X size={18} /></button>
      </div>

      <div className="p-6 space-y-6">
        {/* Score + Percentile */}
        <div className="flex items-start gap-6">
          <div className="relative flex items-center justify-center">
            <ScoreRing score={product.momentumScore} size={90} stroke={7} />
            <span className="absolute text-[22px] font-bold rotate-90">{product.momentumScore}</span>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${tc.bg} ${tc.color}`}>
                <TrendIcon size={10} /> {tc.label}
              </span>
              <PercentileBadge value={percentile} />
            </div>
            <MomentumBar score={product.momentumScore} />
            <p className="text-[11px] text-muted">
              Category avg: <span className="font-semibold text-foreground">{bench.avgScore}</span> ·
              P90: <span className="font-semibold text-foreground">{bench.p90Score}</span>
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted mb-3">Performance vs Category</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Views", value: product.metrics.views, growth: product.metrics.viewsGrowth, avg: bench.avgViews },
              { label: "Saves", value: product.metrics.saves, growth: product.metrics.savesGrowth, avg: bench.avgSaves },
              { label: "Board Adds", value: product.metrics.boards, growth: product.metrics.boardsGrowth, avg: Math.round(bench.avgSaves * 0.18) },
              { label: "Spec Downloads", value: product.metrics.specs, growth: product.metrics.specsGrowth, avg: Math.round(bench.avgViews * bench.avgConversion / 100) },
            ].map((m) => {
              const delta = ((m.value - m.avg) / m.avg * 100).toFixed(0);
              return (
                <div key={m.label} className="rounded-xl border border-border p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted">{m.label}</span>
                    <GrowthBadge value={m.growth} />
                  </div>
                  <p className="text-[18px] font-semibold">{m.value.toLocaleString()}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1 rounded-full bg-surface overflow-hidden">
                      <div className="h-full rounded-full bg-foreground/40" style={{ width: `${Math.min((m.avg / Math.max(m.value, m.avg)) * 100, 100)}%` }} />
                      <div className="h-full rounded-full bg-foreground -mt-1" style={{ width: `${Math.min((m.value / Math.max(m.value, m.avg)) * 100, 100)}%` }} />
                    </div>
                    <span className={`text-[10px] font-semibold ${Number(delta) >= 0 ? "text-emerald" : "text-rose"}`}>
                      {Number(delta) >= 0 ? "+" : ""}{delta}% vs avg
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conversion Benchmarks */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted mb-3">Conversion Benchmarks</p>
          <div className="space-y-3">
            {[
              { label: "View → Save", value: conversionRate, benchmark: bench.avgConversion.toFixed(1), unit: "%" },
              { label: "View → Spec", value: specRate, benchmark: (bench.avgConversion * 0.55).toFixed(1), unit: "%" },
              { label: "Save → Board", value: boardRate, benchmark: "14.2", unit: "%" },
            ].map((b) => {
              const above = parseFloat(b.value) >= parseFloat(b.benchmark);
              return (
                <div key={b.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-muted">{b.label}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[13px] font-semibold ${above ? "text-foreground" : "text-rose"}`}>{b.value}{b.unit}</span>
                      <span className="text-[10px] text-muted">avg {b.benchmark}{b.unit}</span>
                    </div>
                  </div>
                  <div className="relative h-1.5 rounded-full bg-surface overflow-hidden">
                    <div className={`h-full rounded-full ${above ? "bg-foreground" : "bg-rose/60"}`} style={{ width: `${Math.min(parseFloat(b.value) / 10 * 100, 100)}%` }} />
                    <div className="absolute top-0 h-full w-px bg-muted" style={{ left: `${Math.min(parseFloat(b.benchmark) / 10 * 100, 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Activity */}
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

        {/* Architect Network */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted mb-3">Architect Influence ({savingArchitects.length})</p>
          <div className="space-y-2">
            {savingArchitects.map((arch) => {
              if (!arch) return null;
              const inf = architectInfluenceData.find((a) => a.architectId === arch.id);
              return (
                <div key={arch.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                  <div className="h-8 w-8 rounded-full bg-surface shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium">{arch.name}</p>
                    <p className="text-[11px] text-muted">{arch.firm}</p>
                  </div>
                  {inf && (
                    <div className="text-right">
                      <p className="text-[12px] font-semibold">{inf.influenceScore}</p>
                      <p className="text-[10px] text-muted">{inf.tier}</p>
                    </div>
                  )}
                </div>
              );
            })}
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

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function MomentumPage() {
  const [trendFilter, setTrendFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [sortBy, setSortBy] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedProduct, setSelectedProduct] = useState<ProductMomentum | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const allScores = productMomentumData.map((p) => p.momentumScore);

  const surging = productMomentumData.filter((p) => p.trend === "surging").length;
  const rising = productMomentumData.filter((p) => p.trend === "rising").length;
  const steady = productMomentumData.filter((p) => p.trend === "steady").length;
  const cooling = productMomentumData.filter((p) => p.trend === "cooling").length;
  const avgScore = Math.round(productMomentumData.reduce((s, p) => s + p.momentumScore, 0) / productMomentumData.length);
  const totalViews = productMomentumData.reduce((s, p) => s + p.metrics.views, 0);
  const avgGrowth = Math.round(productMomentumData.reduce((s, p) => s + p.metrics.viewsGrowth, 0) / productMomentumData.length);

  const compositeScore = Math.round(growthCompositeMetrics.reduce((s, m) => s + m.score * (m.weight / 100), 0));

  const filtered = useMemo(() => {
    let data = trendFilter === "all" ? [...productMomentumData] : productMomentumData.filter((p) => p.trend === trendFilter);
    if (categoryFilter !== "All Categories") {
      data = data.filter((p) => {
        const cat = getProductCategory(p.productId);
        return cat === categoryFilter || cat === categoryFilter.slice(0, -1);
      });
    }
    data.sort((a, b) => {
      let va = 0, vb = 0;
      if (sortBy === "score") { va = a.momentumScore; vb = b.momentumScore; }
      else if (sortBy === "views") { va = a.metrics.views; vb = b.metrics.views; }
      else if (sortBy === "saves") { va = a.metrics.saves; vb = b.metrics.saves; }
      else if (sortBy === "specs") { va = a.metrics.specs; vb = b.metrics.specs; }
      else if (sortBy === "growth") { va = a.metrics.viewsGrowth; vb = b.metrics.viewsGrowth; }
      else if (sortBy === "percentile") { va = getPercentile(a.momentumScore, allScores); vb = getPercentile(b.momentumScore, allScores); }
      return sortDir === "desc" ? vb - va : va - vb;
    });
    return data;
  }, [trendFilter, categoryFilter, sortBy, sortDir, allScores]);

  function handleSort(key: SortKey) {
    if (sortBy === key) setSortDir(sortDir === "desc" ? "asc" : "desc");
    else { setSortBy(key); setSortDir("desc"); }
  }

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortBy !== col) return <ChevronDown size={10} className="text-muted/40" />;
    return sortDir === "desc" ? <ChevronDown size={10} /> : <ChevronUp size={10} />;
  };

  return (
    <div className="min-h-screen bg-surface/50">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="border-b border-border bg-white px-8 py-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">Intelligence</p>
            <h1 className="mt-1 text-[28px] font-semibold tracking-tight">Product Momentum</h1>
            <p className="mt-1 text-[13px] text-muted max-w-xl">
              Financial-grade product velocity analytics. Tracking growth momentum, percentile rankings, cohort retention, and spec conversion across the platform.
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
        {/* ── KPI Strip with Percentiles ──────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          {[
            { icon: BarChart3, iconColor: "text-muted", label: "Avg Score", value: avgScore, sub: <><PercentileBadge value={72} /> <span className="text-[10px] text-muted ml-1">vs platform</span></>, bar: avgScore },
            { icon: Flame, iconColor: "text-rose", label: "Surging", value: surging, sub: <span className="text-[11px] text-rose">Highest velocity</span>, bar: null },
            { icon: TrendingUp, iconColor: "text-emerald", label: "Rising", value: rising, sub: <span className="text-[11px] text-emerald">Accelerating</span>, bar: null },
            { icon: Eye, iconColor: "text-muted", label: "Total Views", value: totalViews.toLocaleString(), sub: <GrowthBadge value={avgGrowth} />, bar: null },
            { icon: Target, iconColor: "text-blue", label: "Composite Score", value: compositeScore, sub: <><PercentileBadge value={78} /> <span className="text-[10px] text-muted ml-1">weighted</span></>, bar: compositeScore },
            { icon: Zap, iconColor: "text-amber", label: "Tracked", value: productMomentumData.length, sub: <span className="text-[11px] text-muted">{steady} steady · {cooling} cooling</span>, bar: null },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-2xl border border-border bg-white p-4">
              <div className="flex items-center gap-2 mb-2">
                <kpi.icon size={14} className={kpi.iconColor} />
                <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">{kpi.label}</span>
              </div>
              <p className="text-[24px] font-bold tracking-tight">{kpi.value}</p>
              <div className="mt-1">{kpi.sub}</div>
              {kpi.bar !== null && (
                <div className="mt-2 h-1 rounded-full bg-surface overflow-hidden">
                  <div className="h-full rounded-full bg-foreground" style={{ width: `${kpi.bar}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Growth Momentum Composite ──────────────────────────── */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[14px] font-semibold">Growth Momentum Composite</h3>
              <p className="text-[11px] text-muted mt-0.5">Weighted scoring across 5 velocity dimensions</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative flex items-center justify-center">
                <ScoreRing score={compositeScore} size={64} stroke={5} />
                <span className="absolute text-[16px] font-bold rotate-90">{compositeScore}</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {growthCompositeMetrics.map((m) => (
              <div key={m.label} className="flex items-center gap-4">
                <span className="w-36 text-[12px] text-muted truncate">{m.label}</span>
                <span className="w-8 text-[10px] text-muted text-right">{m.weight}%</span>
                <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
                  <div className="h-full rounded-full bg-foreground transition-all" style={{ width: `${m.score}%` }} />
                </div>
                <span className="w-8 text-[13px] font-semibold text-right">{m.score}</span>
                <MiniSparkline data={m.trend} w={60} h={18} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Engagement + Spec Conversion Funnels (side by side) ── */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Engagement Funnel */}
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex items-center gap-2 mb-5">
              <Activity size={14} className="text-muted" />
              <h3 className="text-[14px] font-semibold">Engagement Funnel</h3>
            </div>
            <div className="space-y-2">
              {engagementFunnel.map((stage, i) => {
                const dropoff = i > 0 ? ((engagementFunnel[i - 1].value - stage.value) / engagementFunnel[i - 1].value * 100).toFixed(1) : null;
                return (
                  <div key={stage.stage}>
                    {dropoff && (
                      <div className="flex items-center gap-2 py-0.5 pl-4">
                        <ArrowDown size={9} className="text-rose/60" />
                        <span className="text-[9px] text-rose/80">-{dropoff}% drop-off</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <span className="w-28 text-[11px] text-muted truncate">{stage.stage}</span>
                      <div className="flex-1 h-5 rounded bg-surface overflow-hidden relative">
                        <div className="h-full rounded bg-foreground/80 transition-all" style={{ width: `${stage.pct}%` }} />
                      </div>
                      <span className="w-14 text-right text-[12px] font-semibold">{stage.value.toLocaleString()}</span>
                      <span className="w-10 text-right text-[10px] text-muted">{stage.pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-[11px] text-muted">Overall conversion</span>
              <span className="text-[13px] font-bold">{((engagementFunnel[engagementFunnel.length - 1].value / engagementFunnel[0].value) * 100).toFixed(2)}%</span>
            </div>
          </div>

          {/* Spec Conversion Funnel */}
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex items-center gap-2 mb-5">
              <Layers size={14} className="text-muted" />
              <h3 className="text-[14px] font-semibold">Spec Conversion Pipeline</h3>
            </div>
            <div className="space-y-2">
              {specConversionFunnel.map((stage, i) => {
                const dropoff = i > 0 ? ((specConversionFunnel[i - 1].value - stage.value) / specConversionFunnel[i - 1].value * 100).toFixed(1) : null;
                return (
                  <div key={stage.stage}>
                    {dropoff && (
                      <div className="flex items-center gap-2 py-0.5 pl-4">
                        <ArrowDown size={9} className="text-rose/60" />
                        <span className="text-[9px] text-rose/80">-{dropoff}% drop-off</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <span className="w-32 text-[11px] text-muted truncate">{stage.stage}</span>
                      <div className="flex-1 h-5 rounded bg-surface overflow-hidden">
                        <div className="h-full rounded bg-foreground/80 transition-all" style={{ width: `${stage.pct}%` }} />
                      </div>
                      <span className="w-10 text-right text-[12px] font-semibold">{stage.value}</span>
                      <span className="w-12 text-right text-[10px] text-muted">{stage.pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-[11px] text-muted">Board → Installed</span>
              <span className="text-[13px] font-bold">{specConversionFunnel[specConversionFunnel.length - 1].pct}%</span>
            </div>
          </div>
        </div>

        {/* ── Cohort Retention Heatmap ───────────────────────────── */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="flex items-center gap-2 mb-5">
            <Users size={14} className="text-muted" />
            <h3 className="text-[14px] font-semibold">Product Discovery Cohort Retention</h3>
            <span className="text-[11px] text-muted ml-2">% of new product views retained over time</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr>
                  <th className="text-left py-2 px-3 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">Cohort</th>
                  <th className="text-center py-2 px-3 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">New Views</th>
                  <th className="text-center py-2 px-3 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">1 Week</th>
                  <th className="text-center py-2 px-3 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">2 Weeks</th>
                  <th className="text-center py-2 px-3 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">4 Weeks</th>
                  <th className="text-center py-2 px-3 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">Spec Conv.</th>
                </tr>
              </thead>
              <tbody>
                {productCohorts.map((c) => (
                  <tr key={c.week} className="border-t border-border/50">
                    <td className="py-2.5 px-3 font-semibold">{c.week}</td>
                    <td className="text-center py-2.5 px-3">{c.newDiscoveries}</td>
                    {[c.retained1w, c.retained2w, c.retained4w].map((val, i) => (
                      <td key={i} className="text-center py-2.5 px-3">
                        {val > 0 ? (
                          <span className={`inline-block rounded px-2 py-0.5 text-[11px] font-semibold ${
                            val >= 75 ? "bg-foreground text-white" : val >= 60 ? "bg-foreground/60 text-white" : val >= 45 ? "bg-foreground/20 text-foreground" : "bg-surface text-muted"
                          }`}>
                            {val}%
                          </span>
                        ) : <span className="text-muted">—</span>}
                      </td>
                    ))}
                    <td className="text-center py-2.5 px-3">
                      <span className="font-semibold">{c.specConversion}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Category Benchmark Comparison ──────────────────────── */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="flex items-center gap-2 mb-5">
            <GitBranch size={14} className="text-muted" />
            <h3 className="text-[14px] font-semibold">Category Benchmark Comparison</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr>
                  <th className="text-left py-2 px-3 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">Category</th>
                  <th className="text-center py-2 px-3 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">Avg Score</th>
                  <th className="text-center py-2 px-3 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">P90</th>
                  <th className="text-center py-2 px-3 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">Avg Views</th>
                  <th className="text-center py-2 px-3 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">Avg Saves</th>
                  <th className="text-center py-2 px-3 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">Conv %</th>
                  <th className="text-left py-2 px-3 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted w-40">Distribution</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(categoryBenchmarks).map(([cat, bench]) => {
                  const catProducts = productMomentumData.filter((p) => {
                    const pc = getProductCategory(p.productId);
                    return pc === cat || pc === cat.slice(0, -1);
                  });
                  const actualAvg = catProducts.length > 0 ? Math.round(catProducts.reduce((s, p) => s + p.momentumScore, 0) / catProducts.length) : 0;
                  const delta = actualAvg - bench.avgScore;
                  return (
                    <tr key={cat} className="border-t border-border/50 hover:bg-surface/30">
                      <td className="py-2.5 px-3 font-semibold">{cat}</td>
                      <td className="text-center py-2.5 px-3">
                        <div className="inline-flex items-center gap-1.5">
                          <span className="font-semibold">{actualAvg || bench.avgScore}</span>
                          {delta !== 0 && actualAvg > 0 && (
                            <span className={`text-[10px] ${delta > 0 ? "text-emerald" : "text-rose"}`}>
                              {delta > 0 ? "+" : ""}{delta}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-center py-2.5 px-3"><PercentileBadge value={Math.round(bench.p90Score / bench.avgScore * 50)} /></td>
                      <td className="text-center py-2.5 px-3">{bench.avgViews.toLocaleString()}</td>
                      <td className="text-center py-2.5 px-3">{bench.avgSaves}</td>
                      <td className="text-center py-2.5 px-3">{bench.avgConversion}%</td>
                      <td className="py-2.5 px-3">
                        <div className="h-2 rounded-full bg-surface overflow-hidden">
                          <div className="h-full rounded-full bg-foreground" style={{ width: `${bench.avgScore}%` }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Filters ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-border bg-white p-1">
              {["all", "surging", "rising", "steady", "cooling"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTrendFilter(t)}
                  className={`rounded-md px-3 py-1.5 text-[12px] font-medium capitalize transition-colors ${
                    trendFilter === t ? "bg-foreground text-white" : "text-muted hover:bg-surface"
                  }`}
                >
                  {t === "all" ? "All" : t}
                </button>
              ))}
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-border bg-white px-3 py-2 text-[12px] text-muted"
            >
              {categoryOptions.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <span className="text-[11px] text-muted">{filtered.length} products</span>
        </div>

        {/* ── Sortable Benchmark Table ───────────────────────────── */}
        <div className="rounded-2xl border border-border bg-white overflow-hidden">
          <table className="w-full table-premium">
            <thead>
              <tr className="bg-surface/50">
                <th className="w-10 text-center">#</th>
                <th>Product</th>
                <th>Trend</th>
                <th className="cursor-pointer text-center" onClick={() => handleSort("score")}>
                  <span className="inline-flex items-center gap-1">Score <SortIcon col="score" /></span>
                </th>
                <th className="text-center">Pctl</th>
                <th className="cursor-pointer text-right" onClick={() => handleSort("views")}>
                  <span className="inline-flex items-center gap-1">Views <SortIcon col="views" /></span>
                </th>
                <th className="cursor-pointer text-right" onClick={() => handleSort("saves")}>
                  <span className="inline-flex items-center gap-1">Saves <SortIcon col="saves" /></span>
                </th>
                <th className="cursor-pointer text-right" onClick={() => handleSort("specs")}>
                  <span className="inline-flex items-center gap-1">Specs <SortIcon col="specs" /></span>
                </th>
                <th className="text-right">Tags</th>
                <th className="text-center">vs Cat Avg</th>
                <th className="hidden xl:table-cell">7d</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const tc = trendConfig[p.trend];
                const TrendIcon = tc.icon;
                const percentile = getPercentile(p.momentumScore, allScores);
                const category = getProductCategory(p.productId);
                const bench = categoryBenchmarks[category] || categoryBenchmarks["Lighting"];
                const vsCat = p.momentumScore - bench.avgScore;
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
                    <td className="text-center">
                      <PercentileBadge value={percentile} />
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
                      <p className="text-[13px] font-medium">{p.metrics.specs}</p>
                      <GrowthBadge value={p.metrics.specsGrowth} />
                    </td>
                    <td className="text-right">
                      <p className="text-[13px] font-medium">{p.metrics.projectTags}</p>
                      <GrowthBadge value={p.metrics.projectTagsGrowth} />
                    </td>
                    <td className="text-center">
                      <span className={`text-[12px] font-semibold ${vsCat > 0 ? "text-emerald" : vsCat < 0 ? "text-rose" : "text-muted"}`}>
                        {vsCat > 0 ? "+" : ""}{vsCat}
                      </span>
                    </td>
                    <td className="hidden xl:table-cell">
                      <SparklineChart data={p.weeklyData} height={32} />
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

        {/* ── Bottom Analytics Grid ──────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Fastest Growing */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="text-[13px] font-semibold mb-4">Fastest Growing</h3>
            <div className="space-y-3">
              {[...productMomentumData].sort((a, b) => b.metrics.viewsGrowth - a.metrics.viewsGrowth).slice(0, 5).map((p, i) => (
                <div key={p.productId} className="flex items-center gap-3">
                  <span className="w-5 text-center text-[12px] font-semibold text-muted">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium truncate">{p.productName}</p>
                    <p className="text-[10px] text-muted">{p.brand}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-16 h-1.5 rounded-full bg-surface overflow-hidden">
                      <div className="h-full rounded-full bg-emerald" style={{ width: `${Math.min(p.metrics.viewsGrowth * 2, 100)}%` }} />
                    </div>
                    <span className="text-[11px] font-semibold text-emerald">+{p.metrics.viewsGrowth}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Most Specified */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="text-[13px] font-semibold mb-4">Most Specified</h3>
            <div className="space-y-3">
              {[...productMomentumData].sort((a, b) => b.metrics.specs - a.metrics.specs).slice(0, 5).map((p, i) => (
                <div key={p.productId} className="flex items-center gap-3">
                  <span className="w-5 text-center text-[12px] font-semibold text-muted">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium truncate">{p.productName}</p>
                    <p className="text-[10px] text-muted">{p.brand}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-semibold">{p.metrics.specs}</p>
                    <GrowthBadge value={p.metrics.specsGrowth} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Highest Conversion */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="text-[13px] font-semibold mb-4">Best View→Save Conv.</h3>
            <div className="space-y-3">
              {[...productMomentumData].sort((a, b) => (b.metrics.saves / b.metrics.views) - (a.metrics.saves / a.metrics.views)).slice(0, 5).map((p, i) => {
                const conv = ((p.metrics.saves / p.metrics.views) * 100).toFixed(1);
                const cat = getProductCategory(p.productId);
                const bench = categoryBenchmarks[cat] || categoryBenchmarks["Lighting"];
                const above = parseFloat(conv) >= bench.avgConversion;
                return (
                  <div key={p.productId} className="flex items-center gap-3">
                    <span className="w-5 text-center text-[12px] font-semibold text-muted">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium truncate">{p.productName}</p>
                      <p className="text-[10px] text-muted">{p.brand}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-[12px] font-semibold ${above ? "text-foreground" : "text-rose"}`}>{conv}%</p>
                      <p className="text-[9px] text-muted">avg {bench.avgConversion}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Architect × Product Influence Matrix ────────────────── */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="flex items-center gap-2 mb-5">
            <Users size={14} className="text-muted" />
            <h3 className="text-[14px] font-semibold">Architect × Product Influence Matrix</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr>
                  <th className="text-left py-2 px-3 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">Architect</th>
                  {productMomentumData.slice(0, 6).map((p) => (
                    <th key={p.productId} className="text-center py-2 px-2 text-[9px] font-semibold uppercase tracking-[0.04em] text-muted max-w-[80px]">
                      {p.productName.split("—")[0].trim().slice(0, 12)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {architectInfluenceData.slice(0, 5).map((arch) => (
                  <tr key={arch.architectId} className="border-t border-border/50">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-surface shrink-0" />
                        <span className="font-medium text-[12px]">{arch.name}</span>
                      </div>
                    </td>
                    {productMomentumData.slice(0, 6).map((p) => {
                      const influence = arch.topInfluencedProducts.find((ip) => ip.productId === p.productId)?.influence || 0;
                      const savedBy = p.savedByArchitects.includes(arch.architectId);
                      return (
                        <td key={p.productId} className="text-center py-2.5 px-2">
                          {influence > 0 ? (
                            <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold ${
                              influence >= 75 ? "bg-foreground text-white" : influence >= 50 ? "bg-foreground/40 text-foreground" : "bg-foreground/15 text-foreground"
                            }`}>
                              {influence}
                            </span>
                          ) : savedBy ? (
                            <span className="inline-block rounded px-2 py-0.5 text-[10px] bg-surface text-muted">saved</span>
                          ) : (
                            <span className="text-muted/30">·</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Detail Panel ─────────────────────────────────────────── */}
      {selectedProduct && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setSelectedProduct(null)} />
          <DetailPanel product={selectedProduct} onClose={() => setSelectedProduct(null)} allScores={allScores} />
        </>
      )}
    </div>
  );
}
