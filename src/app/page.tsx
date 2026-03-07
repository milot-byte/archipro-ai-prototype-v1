"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, Eye, Download, Heart, MessageSquare,
  Layers, Activity, ArrowRight, ArrowDown, ArrowUp, Flame, Crown, FolderKanban,
  ClipboardList, ChevronRight, ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight,
  BarChart3, Zap, Package, Users, Building2, Target, GitBranch, AlertTriangle,
  Minus, Shield, X
} from "lucide-react";
import { analyticsData, projects, products, architects, brands } from "@/lib/mock-data";
import {
  activityFeed, productMomentumData, architectInfluenceData,
  designBoards, specifications
} from "@/lib/intelligence-data";

// ─── Cohort data ────────────────────────────────────────────────────────────
const cohortData = [
  { week: "W47", newUsers: 42, retained1w: 31, retained2w: 24, retained4w: 18, specConversion: 8, avgEngagement: 3.2 },
  { week: "W48", newUsers: 56, retained1w: 38, retained2w: 28, retained4w: 21, specConversion: 12, avgEngagement: 3.8 },
  { week: "W49", newUsers: 48, retained1w: 35, retained2w: 27, retained4w: 19, specConversion: 10, avgEngagement: 3.5 },
  { week: "W50", newUsers: 63, retained1w: 46, retained2w: 34, retained4w: 0, specConversion: 15, avgEngagement: 4.1 },
  { week: "W51", newUsers: 71, retained1w: 52, retained2w: 0, retained4w: 0, specConversion: 18, avgEngagement: 4.4 },
  { week: "W52", newUsers: 68, retained1w: 0, retained2w: 0, retained4w: 0, specConversion: 14, avgEngagement: 3.9 },
];

// ─── Engagement funnel ──────────────────────────────────────────────────────
const engagementFunnel = [
  { stage: "Impressions", value: 84200, pct: 100 },
  { stage: "Product Views", value: 24830, pct: 29.5 },
  { stage: "Product Saves", value: 1457, pct: 1.73 },
  { stage: "Board Additions", value: 834, pct: 0.99 },
  { stage: "Spec Downloads", value: 612, pct: 0.73 },
  { stage: "Enquiries Sent", value: 168, pct: 0.20 },
  { stage: "Orders Placed", value: 42, pct: 0.05 },
];

// ─── Spec conversion funnel ─────────────────────────────────────────────────
const specFunnel = [
  { stage: "Boards Created", value: 134, pct: 100, benchmark: 100 },
  { stage: "Products Selected", value: 118, pct: 88.1, benchmark: 82 },
  { stage: "Spec Generated", value: 89, pct: 66.4, benchmark: 58 },
  { stage: "Under Review", value: 64, pct: 47.8, benchmark: 42 },
  { stage: "Approved", value: 41, pct: 30.6, benchmark: 28 },
  { stage: "Items Installed", value: 22, pct: 16.4, benchmark: 12 },
];

// ─── Percentile rankings ────────────────────────────────────────────────────
const percentileMetrics = [
  { metric: "Product Views", value: 24830, percentile: 87, categoryAvg: 18200, delta: 36, trend: [15200, 17800, 19400, 21200, 23100, 24830] },
  { metric: "Save Rate", value: 5.87, percentile: 72, categoryAvg: 4.2, delta: 39, trend: [3.8, 4.1, 4.6, 5.0, 5.4, 5.87], unit: "%" },
  { metric: "Spec Downloads", value: 612, percentile: 91, categoryAvg: 420, delta: 46, trend: [310, 380, 440, 510, 570, 612] },
  { metric: "Enquiry Rate", value: 0.68, percentile: 65, categoryAvg: 0.82, delta: -17, trend: [0.52, 0.58, 0.62, 0.64, 0.66, 0.68], unit: "%", alert: true },
  { metric: "Architect Reach", value: 6, percentile: 94, categoryAvg: 3.2, delta: 88, trend: [2, 3, 4, 4, 5, 6] },
  { metric: "Board Density", value: 4.0, percentile: 78, categoryAvg: 3.1, delta: 29, trend: [2.4, 2.8, 3.2, 3.5, 3.8, 4.0] },
  { metric: "Spec Conversion", value: 16.4, percentile: 82, categoryAvg: 12.0, delta: 37, trend: [8.2, 10.1, 12.0, 13.5, 15.0, 16.4], unit: "%" },
  { metric: "Cross-Project Spread", value: 4.2, percentile: 85, categoryAvg: 2.8, delta: 50, trend: [1.8, 2.4, 2.9, 3.4, 3.8, 4.2] },
];

// ─── Growth momentum scoring ────────────────────────────────────────────────
const growthScores = [
  { metric: "Views Velocity", weight: 20, score: 82, trend: [64, 68, 71, 75, 78, 82], benchmark: 68 },
  { metric: "Save Acceleration", weight: 20, score: 76, trend: [58, 62, 66, 70, 73, 76], benchmark: 62 },
  { metric: "Spec Conversion", weight: 25, score: 68, trend: [52, 56, 58, 62, 65, 68], benchmark: 58 },
  { metric: "Architect Engagement", weight: 20, score: 91, trend: [72, 78, 82, 86, 89, 91], benchmark: 72 },
  { metric: "Brand Activity", weight: 15, score: 74, trend: [60, 64, 67, 70, 72, 74], benchmark: 64 },
];
const overallGrowthScore = Math.round(growthScores.reduce((s, g) => s + g.score * (g.weight / 100), 0));

// ─── Monthly time series ────────────────────────────────────────────────────
const monthlyTimeSeries = [
  { month: "Jul", views: 12400, saves: 680, specs: 280, enquiries: 72, orders: 18 },
  { month: "Aug", views: 14200, saves: 790, specs: 320, enquiries: 84, orders: 22 },
  { month: "Sep", views: 16800, saves: 920, specs: 380, enquiries: 96, orders: 26 },
  { month: "Oct", views: 19200, saves: 1080, specs: 440, enquiries: 118, orders: 31 },
  { month: "Nov", views: 22100, saves: 1260, specs: 520, enquiries: 142, orders: 36 },
  { month: "Dec", views: 24830, saves: 1457, specs: 612, enquiries: 168, orders: 42 },
];

// ─── Risk / Opportunity signals ─────────────────────────────────────────────
const riskSignals = [
  { type: "risk" as const, metric: "Enquiry Rate", message: "Below category avg (0.68% vs 0.82%) — 17% gap widening", severity: "high" as const },
  { type: "risk" as const, metric: "Board Churn", message: "18% of boards inactive >30d — 4 boards at risk", severity: "medium" as const },
  { type: "opportunity" as const, metric: "Architect Reach", message: "P94 percentile — 3 architects showing rising engagement", severity: "low" as const },
  { type: "opportunity" as const, metric: "Spec Conversion", message: "Outperforming benchmark by 37% — accelerating trend", severity: "low" as const },
];

// ─── Cross-metric benchmark table ───────────────────────────────────────────
const benchmarkTable = productMomentumData.slice(0, 8).map(p => {
  const archCount = p.savedByArchitects.length;
  const viewToSave = ((p.metrics.saves / p.metrics.views) * 100);
  const viewToSpec = ((p.metrics.specs / p.metrics.views) * 100);
  const boardRate = p.metrics.boards > 0 ? ((p.metrics.boards / p.metrics.saves) * 100) : 0;
  return {
    id: p.productId, name: p.productName, brand: p.brand, trend: p.trend,
    score: p.momentumScore, views: p.metrics.views, saves: p.metrics.saves,
    specs: p.metrics.specs, boards: p.metrics.boards, tags: p.metrics.projectTags,
    viewsGrowth: p.metrics.viewsGrowth, savesGrowth: p.metrics.savesGrowth,
    viewToSave, viewToSpec, boardRate, archCount,
    sparkline: p.weeklyData.map(d => d.views),
  };
});

// ─── Helper Components ──────────────────────────────────────────────────────

type SortKey = "score" | "views" | "saves" | "specs" | "viewToSave" | "viewToSpec" | "viewsGrowth";

function MiniSparkline({ data, w = 64, h = 20, color = "#0a0a0a" }: { data: number[]; w?: number; h?: number; color?: string }) {
  const max = Math.max(...data); const min = Math.min(...data); const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={h - ((data[data.length - 1] - min) / range) * h} r="2" fill={color} />
    </svg>
  );
}

function ScoreRing({ score, size = 80, stroke = 6 }: { score: number; size?: number; stroke?: number }) {
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

function PercentileBadge({ value }: { value: number }) {
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold tracking-tight ${
      value >= 90 ? "bg-foreground text-white" : value >= 75 ? "bg-foreground/80 text-white" : value >= 50 ? "bg-foreground/20 text-foreground" : "bg-surface text-muted"
    }`}>
      P{value}
    </span>
  );
}

function GrowthBadge({ value }: { value: number }) {
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${value > 0 ? "text-emerald" : value < 0 ? "text-rose" : "text-muted"}`}>
      {value > 0 ? <ArrowUp size={10} /> : value < 0 ? <ArrowDown size={10} /> : <Minus size={10} />}
      {Math.abs(value)}%
    </span>
  );
}

function formatTime(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

const activityIcons: Record<string, React.ElementType> = {
  product_saved: Heart, spec_downloaded: Download, board_add: Layers,
  website_visit: Eye, enquiry: MessageSquare, project_tagged: FolderKanban,
};

const trendConfig: Record<string, { label: string; color: string; bg: string }> = {
  surging: { label: "Surging", color: "text-rose", bg: "bg-rose-light" },
  rising: { label: "Rising", color: "text-emerald", bg: "bg-emerald-light" },
  steady: { label: "Steady", color: "text-blue", bg: "bg-blue-light" },
  cooling: { label: "Cooling", color: "text-muted", bg: "bg-surface" },
};

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function HomePage() {
  const [timeRange, setTimeRange] = useState("30d");
  const [tableSortBy, setTableSortBy] = useState<SortKey>("score");
  const [tableSortDir, setTableSortDir] = useState<"asc" | "desc">("desc");

  const totalViews = analyticsData.views;
  const totalSaves = productMomentumData.reduce((s, p) => s + p.metrics.saves, 0);
  const totalEnquiries = architectInfluenceData.reduce((s, a) => s + a.metrics.enquiriesGenerated, 0);
  const totalSpecs = productMomentumData.reduce((s, p) => s + p.metrics.specs, 0);
  const recentActivity = activityFeed.slice(0, 8);

  const sortedBenchmark = useMemo(() => {
    return [...benchmarkTable].sort((a, b) => {
      const va = a[tableSortBy as keyof typeof a] as number;
      const vb = b[tableSortBy as keyof typeof b] as number;
      return tableSortDir === "desc" ? vb - va : va - vb;
    });
  }, [tableSortBy, tableSortDir]);

  function handleTableSort(key: SortKey) {
    if (tableSortBy === key) setTableSortDir(tableSortDir === "desc" ? "asc" : "desc");
    else { setTableSortBy(key); setTableSortDir("desc"); }
  }

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (tableSortBy !== col) return <ChevronDown size={9} className="text-muted/40" />;
    return tableSortDir === "desc" ? <ChevronDown size={9} /> : <ChevronUp size={9} />;
  };

  // Time series max for chart scaling
  const tsMaxViews = Math.max(...monthlyTimeSeries.map(d => d.views));

  return (
    <div className="min-h-screen bg-surface/50">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="border-b border-border bg-white px-8 py-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">Intelligence Terminal</p>
            <h1 className="mt-1 text-[28px] font-semibold tracking-tight">Platform Intelligence</h1>
            <p className="mt-1 text-[12px] text-muted">Real-time analytics across {productMomentumData.length} products · {architectInfluenceData.length} architects · {brands.length} brands</p>
          </div>
          <div className="flex items-center gap-2">
            {["7d", "30d", "90d", "YTD"].map(p => (
              <button key={p} onClick={() => setTimeRange(p)} className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors ${p === timeRange ? "bg-foreground text-white" : "text-muted hover:bg-surface"}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* ── Row 1: Growth Composite + KPI Ribbon ───────────────── */}
        <div className="grid grid-cols-12 gap-4">
          {/* Growth Momentum Composite — deep panel */}
          <div className="col-span-5 rounded-2xl border border-border bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={14} className="text-amber" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">Growth Momentum Composite</span>
                </div>
                <p className="text-[11px] text-muted">Weighted across 5 velocity dimensions</p>
              </div>
              <div className="relative flex items-center justify-center">
                <ScoreRing score={overallGrowthScore} size={64} stroke={5} />
                <span className="absolute text-[17px] font-bold rotate-90">{overallGrowthScore}</span>
              </div>
            </div>
            <div className="space-y-2.5">
              {growthScores.map(g => {
                const vsBench = g.score - g.benchmark;
                return (
                  <div key={g.metric} className="flex items-center gap-3">
                    <span className="w-28 text-[11px] text-muted truncate">{g.metric}</span>
                    <span className="w-6 text-[9px] text-muted text-right">{g.weight}%</span>
                    <div className="flex-1 relative h-2 rounded-full bg-surface overflow-hidden">
                      <div className="h-full rounded-full bg-foreground transition-all" style={{ width: `${g.score}%` }} />
                      {/* benchmark marker */}
                      <div className="absolute top-0 h-full w-px bg-rose/50" style={{ left: `${g.benchmark}%` }} />
                    </div>
                    <span className="w-7 text-[12px] font-semibold text-right">{g.score}</span>
                    <span className={`w-8 text-[9px] font-semibold text-right ${vsBench >= 0 ? "text-emerald" : "text-rose"}`}>
                      {vsBench >= 0 ? "+" : ""}{vsBench}
                    </span>
                    <MiniSparkline data={g.trend} w={48} h={14} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* KPI Ribbon — dense, terminal-style */}
          <div className="col-span-7 grid grid-cols-4 gap-3">
            {[
              { label: "Product Views", value: totalViews.toLocaleString(), change: 12.3, percentile: 87, trend: monthlyTimeSeries.map(d => d.views), icon: Eye },
              { label: "Products Saved", value: totalSaves.toLocaleString(), change: 18.5, percentile: 72, trend: monthlyTimeSeries.map(d => d.saves), icon: Heart },
              { label: "Spec Downloads", value: totalSpecs.toLocaleString(), change: 22.1, percentile: 91, trend: monthlyTimeSeries.map(d => d.specs), icon: Download },
              { label: "Enquiries", value: totalEnquiries.toString(), change: 8.7, percentile: 65, trend: monthlyTimeSeries.map(d => d.enquiries), icon: MessageSquare, alert: true },
              { label: "Active Projects", value: projects.length.toString(), change: 33.3, percentile: 94, trend: [2, 3, 3, 4, 5, 6], icon: FolderKanban },
              { label: "Active Boards", value: designBoards.length.toString(), change: 20.0, percentile: 78, trend: [2, 3, 4, 4, 5, 6], icon: Layers },
              { label: "Conversion", value: "0.05%", change: -4.2, percentile: 58, trend: [0.06, 0.07, 0.06, 0.05, 0.05, 0.05], icon: Target, alert: true },
              { label: "Avg Engagement", value: "3.8", change: 15.2, percentile: 76, trend: [2.4, 2.8, 3.1, 3.4, 3.6, 3.8], icon: Activity },
            ].map(kpi => (
              <div key={kpi.label} className={`rounded-xl border ${kpi.alert ? "border-rose/30" : "border-border"} bg-white p-3`}>
                <div className="flex items-center justify-between mb-1.5">
                  <kpi.icon size={12} className={kpi.alert ? "text-rose" : "text-muted"} />
                  <div className="flex items-center gap-1">
                    <PercentileBadge value={kpi.percentile} />
                    {kpi.alert && <AlertTriangle size={10} className="text-rose" />}
                  </div>
                </div>
                <p className="text-[18px] font-bold tracking-tight leading-none">{kpi.value}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-muted">{kpi.label}</span>
                  <span className={`text-[10px] font-semibold ${kpi.change >= 0 ? "text-emerald" : "text-rose"}`}>
                    {kpi.change >= 0 ? "+" : ""}{kpi.change}%
                  </span>
                </div>
                <div className="mt-1.5">
                  <MiniSparkline data={kpi.trend} w={80} h={14} color={kpi.alert ? "#e11d48" : "#0a0a0a"} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Row 2: Risk/Opportunity Signals ─────────────────────── */}
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={14} className="text-muted" />
            <h3 className="text-[13px] font-semibold">Risk & Opportunity Signals</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {riskSignals.map((signal, i) => (
              <div key={i} className={`rounded-xl border p-3 ${signal.type === "risk" ? "border-rose/20 bg-rose-light/30" : "border-emerald/20 bg-emerald-light/30"}`}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  {signal.type === "risk" ? <AlertTriangle size={11} className="text-rose" /> : <TrendingUp size={11} className="text-emerald" />}
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${signal.type === "risk" ? "text-rose" : "text-emerald"}`}>{signal.type}</span>
                  <span className={`ml-auto text-[9px] font-semibold rounded px-1 py-0.5 ${
                    signal.severity === "high" ? "bg-rose/20 text-rose" : signal.severity === "medium" ? "bg-amber-light text-amber" : "bg-surface text-muted"
                  }`}>{signal.severity}</span>
                </div>
                <p className="text-[11px] font-medium mb-0.5">{signal.metric}</p>
                <p className="text-[10px] text-muted leading-relaxed">{signal.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Row 3: Engagement Funnel + Spec Pipeline ────────────── */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Engagement Funnel — terminal depth */}
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-muted" />
                <h3 className="text-[14px] font-semibold">Engagement Funnel</h3>
              </div>
              <span className="text-[10px] font-bold text-foreground">{((engagementFunnel[engagementFunnel.length - 1].value / engagementFunnel[0].value) * 100).toFixed(2)}% end-to-end</span>
            </div>
            <p className="text-[11px] text-muted mb-4">Impression → View → Save → Board → Spec → Enquiry → Order</p>
            <div className="space-y-1">
              {engagementFunnel.map((step, i) => {
                const prevStep = i > 0 ? engagementFunnel[i - 1] : null;
                const dropoff = prevStep ? ((1 - step.value / prevStep.value) * 100).toFixed(1) : null;
                const stageConv = i > 0 ? ((step.value / engagementFunnel[0].value) * 100).toFixed(2) : "100";
                return (
                  <div key={step.stage}>
                    {dropoff && (
                      <div className="flex items-center gap-1.5 py-0.5 pl-6">
                        <ArrowDown size={8} className="text-rose/60" />
                        <span className="text-[9px] text-rose/70">-{dropoff}% drop-off</span>
                        <span className="text-[9px] text-muted ml-auto">stage conv: {stageConv}%</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <span className="w-28 text-[11px] text-muted truncate">{step.stage}</span>
                      <div className="flex-1 h-5 rounded bg-surface overflow-hidden relative">
                        <div className={`h-full rounded transition-all ${
                          i === 0 ? "bg-foreground" : i < 3 ? "bg-foreground/70" : i < 5 ? "bg-foreground/50" : "bg-foreground/30"
                        }`} style={{ width: `${step.pct}%` }} />
                      </div>
                      <span className="w-14 text-right text-[12px] font-semibold">{step.value.toLocaleString()}</span>
                      <span className="w-12 text-right text-[10px] text-muted">{step.pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Spec Conversion Pipeline — with benchmark overlay */}
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-muted" />
                <h3 className="text-[14px] font-semibold">Spec Conversion Pipeline</h3>
              </div>
              <span className="text-[10px] font-bold text-foreground">{specFunnel[specFunnel.length - 1].pct}% installed</span>
            </div>
            <p className="text-[11px] text-muted mb-4">Board → Select → Spec → Review → Approve → Install</p>
            <div className="space-y-1">
              {specFunnel.map((step, i) => {
                const dropoff = i > 0 ? ((1 - step.value / specFunnel[i - 1].value) * 100).toFixed(1) : null;
                const vsBench = step.pct - step.benchmark;
                return (
                  <div key={step.stage}>
                    {dropoff && (
                      <div className="flex items-center gap-1.5 py-0.5 pl-6">
                        <ArrowDown size={8} className="text-rose/60" />
                        <span className="text-[9px] text-rose/70">-{dropoff}%</span>
                        <span className={`text-[9px] ml-auto font-semibold ${vsBench >= 0 ? "text-emerald" : "text-rose"}`}>
                          {vsBench >= 0 ? "+" : ""}{vsBench.toFixed(1)}% vs benchmark
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <span className="w-28 text-[11px] text-muted truncate">{step.stage}</span>
                      <div className="flex-1 h-5 rounded bg-surface overflow-hidden relative">
                        <div className="h-full rounded bg-foreground/80 transition-all" style={{ width: `${step.pct}%` }} />
                        {/* benchmark marker */}
                        <div className="absolute top-0 h-full w-px bg-rose/50" style={{ left: `${step.benchmark}%` }} />
                      </div>
                      <span className="w-10 text-right text-[12px] font-semibold">{step.value}</span>
                      <span className="w-12 text-right text-[10px] text-muted">{step.pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-2 border-t border-border flex items-center gap-4 text-[10px] text-muted">
              <span className="flex items-center gap-1"><span className="h-1.5 w-6 rounded bg-foreground/80" />Actual</span>
              <span className="flex items-center gap-1"><span className="h-3 w-px bg-rose/50" />Benchmark</span>
            </div>
          </div>
        </div>

        {/* ── Row 4: Cohort Heatmap + Percentile Rankings ─────────── */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Cohort Retention Heatmap */}
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex items-center gap-2 mb-1">
              <Users size={14} className="text-muted" />
              <h3 className="text-[14px] font-semibold">Cohort Retention Heatmap</h3>
            </div>
            <p className="text-[11px] text-muted mb-4">Weekly user cohorts — retention % and spec conversion over time</p>
            <table className="w-full">
              <thead>
                <tr className="text-[9px] font-semibold text-muted uppercase tracking-wider">
                  <th className="text-left pb-2 pr-2">Cohort</th>
                  <th className="text-center pb-2 w-12">New</th>
                  <th className="text-center pb-2 w-14">1 Week</th>
                  <th className="text-center pb-2 w-14">2 Week</th>
                  <th className="text-center pb-2 w-14">4 Week</th>
                  <th className="text-center pb-2 w-14">Spec %</th>
                  <th className="text-center pb-2 w-12">Eng.</th>
                </tr>
              </thead>
              <tbody>
                {cohortData.map(c => {
                  const ret1 = c.retained1w > 0 ? Math.round((c.retained1w / c.newUsers) * 100) : null;
                  const ret2 = c.retained2w > 0 ? Math.round((c.retained2w / c.newUsers) * 100) : null;
                  const ret4 = c.retained4w > 0 ? Math.round((c.retained4w / c.newUsers) * 100) : null;
                  const specRate = c.specConversion > 0 ? Math.round((c.specConversion / c.newUsers) * 100) : null;
                  const cellClass = (val: number | null) => {
                    if (val === null) return "bg-surface text-muted/40";
                    if (val >= 70) return "bg-foreground text-white";
                    if (val >= 50) return "bg-foreground/60 text-white";
                    if (val >= 30) return "bg-foreground/25 text-foreground";
                    return "bg-foreground/10 text-muted";
                  };
                  return (
                    <tr key={c.week}>
                      <td className="py-1 pr-2 text-[11px] font-semibold">{c.week}</td>
                      <td className="py-1 px-0.5 text-center">
                        <div className="rounded h-7 flex items-center justify-center bg-surface text-[11px] font-semibold">{c.newUsers}</div>
                      </td>
                      {[ret1, ret2, ret4].map((val, i) => (
                        <td key={i} className="py-1 px-0.5 text-center">
                          <div className={`rounded h-7 flex items-center justify-center text-[10px] font-semibold ${cellClass(val)}`}>{val !== null ? `${val}%` : "—"}</div>
                        </td>
                      ))}
                      <td className="py-1 px-0.5 text-center">
                        <div className={`rounded h-7 flex items-center justify-center text-[10px] font-semibold ${cellClass(specRate)}`}>{specRate !== null ? `${specRate}%` : "—"}</div>
                      </td>
                      <td className="py-1 px-0.5 text-center">
                        <div className="rounded h-7 flex items-center justify-center bg-surface text-[10px] font-semibold">{c.avgEngagement}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Percentile Rankings — deep with trend sparklines */}
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 size={14} className="text-muted" />
              <h3 className="text-[14px] font-semibold">Percentile Rankings</h3>
            </div>
            <p className="text-[11px] text-muted mb-4">Performance vs platform category averages (6mo trend)</p>
            <div className="space-y-2.5">
              {percentileMetrics.map(m => (
                <div key={m.metric}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{m.metric}</span>
                      {m.alert && <AlertTriangle size={10} className="text-rose" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <MiniSparkline data={m.trend} w={40} h={12} color={m.delta >= 0 ? "#0a0a0a" : "#e11d48"} />
                      <span className="text-muted text-[10px]">avg {m.categoryAvg}{m.unit || ""}</span>
                      <span className="font-semibold">{m.value}{m.unit || ""}</span>
                      <span className={`text-[10px] font-semibold ${m.delta >= 0 ? "text-emerald" : "text-rose"}`}>
                        {m.delta >= 0 ? "+" : ""}{m.delta}%
                      </span>
                      <PercentileBadge value={m.percentile} />
                    </div>
                  </div>
                  <div className="relative h-2.5 rounded-full bg-surface overflow-hidden">
                    <div className={`h-full rounded-full ${m.alert ? "bg-rose/60" : "bg-foreground"}`} style={{ width: `${m.percentile}%` }} />
                    {/* category avg marker */}
                    <div className="absolute top-0 h-full w-0.5 bg-amber" style={{ left: `${Math.min((Number(m.categoryAvg) / Number(m.value)) * m.percentile, 95)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row 5: Time Series Overlay Chart ────────────────────── */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={14} className="text-muted" />
              <h3 className="text-[14px] font-semibold">Monthly Performance Overlay</h3>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-muted">
              <span className="flex items-center gap-1"><span className="h-1.5 w-4 rounded bg-foreground" />Views</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-4 rounded bg-foreground/50" />Saves</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-4 rounded bg-foreground/25" />Specs</span>
            </div>
          </div>
          <div className="flex items-end gap-3 h-[160px]">
            {monthlyTimeSeries.map((d, i) => {
              const viewH = (d.views / tsMaxViews) * 140;
              const saveH = (d.saves / tsMaxViews) * 140;
              const specH = (d.specs / tsMaxViews) * 140;
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end gap-[2px]" style={{ height: 140 }}>
                    <div className="flex-1 rounded-t bg-foreground transition-all" style={{ height: viewH }} />
                    <div className="flex-1 rounded-t bg-foreground/50 transition-all" style={{ height: saveH }} />
                    <div className="flex-1 rounded-t bg-foreground/25 transition-all" style={{ height: specH }} />
                  </div>
                  <span className="text-[10px] text-muted">{d.month}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-border grid grid-cols-6 gap-2">
            {monthlyTimeSeries.map(d => (
              <div key={d.month} className="text-center">
                <p className="text-[12px] font-semibold">{(d.views / 1000).toFixed(1)}k</p>
                <p className="text-[9px] text-muted">{d.saves} saves · {d.specs} specs</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Row 6: Architect–Product Network Graph ──────────────── */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <GitBranch size={14} className="text-muted" />
              <h3 className="text-[14px] font-semibold">Architect–Product–Brand Influence Network</h3>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-muted">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-foreground" />Architects</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-foreground/50" />Products</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-foreground/15" />Brands</span>
              <span className="text-[9px]">Edge weight = influence score</span>
            </div>
          </div>
          <div className="relative h-[360px] rounded-xl bg-surface/30 border border-border overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 960 360">
              {/* Edges: Architect → Product */}
              {architectInfluenceData.map((arch, ai) => {
                const ax = 100;
                const ay = 40 + ai * 52;
                return arch.topInfluencedProducts.map(prod => {
                  const pi = productMomentumData.findIndex(p => p.productId === prod.productId);
                  if (pi === -1) return null;
                  const px = 440;
                  const py = 35 + pi * 40;
                  return (
                    <line key={`${arch.architectId}-${prod.productId}`} x1={ax + 20} y1={ay} x2={px - 20} y2={py}
                      stroke="#a3a3a3" strokeWidth={Math.max(prod.influence / 35, 0.5)} opacity={0.4} />
                  );
                });
              })}
              {/* Edges: Product → Brand */}
              {productMomentumData.slice(0, 8).map((prod, pi) => {
                const bi = brands.findIndex(b => b.id === prod.brandId);
                if (bi === -1) return null;
                const px = 440;
                const py = 35 + pi * 40;
                const bx = 800;
                const by = 50 + bi * 55;
                return (
                  <line key={`prod-brand-${prod.productId}`} x1={px + 20} y1={py} x2={bx - 30} y2={by}
                    stroke="#d4d4d4" strokeWidth={1} opacity={0.4} />
                );
              })}

              {/* Architect nodes */}
              {architectInfluenceData.map((arch, i) => {
                const y = 40 + i * 52;
                const r = 12 + arch.influenceScore / 18;
                return (
                  <g key={arch.architectId}>
                    <circle cx={100} cy={y} r={r} fill="#0a0a0a" opacity={0.9} />
                    <text x={100} y={y + 1} textAnchor="middle" fill="white" fontSize="8" fontWeight="700">{arch.influenceScore}</text>
                    <text x={100 - r - 6} y={y + 3} textAnchor="end" fill="#525252" fontSize="9" fontWeight="500">{arch.name.split(" ")[0]}</text>
                    <text x={100 - r - 6} y={y + 14} textAnchor="end" fill="#a3a3a3" fontSize="8">{arch.tier}</text>
                  </g>
                );
              })}

              {/* Product nodes */}
              {productMomentumData.slice(0, 8).map((prod, i) => {
                const y = 35 + i * 40;
                const r = 8 + prod.momentumScore / 14;
                const tc = trendConfig[prod.trend];
                return (
                  <g key={prod.productId}>
                    <circle cx={440} cy={y} r={r} fill="#525252" opacity={0.75} />
                    <text x={440} y={y + 1} textAnchor="middle" fill="white" fontSize="7" fontWeight="700">{prod.momentumScore}</text>
                    <text x={440} y={y + r + 12} textAnchor="middle" fill="#737373" fontSize="8">{prod.productName.split("—")[0].trim().slice(0, 14)}</text>
                  </g>
                );
              })}

              {/* Brand nodes */}
              {brands.map((brand, i) => {
                const y = 50 + i * 55;
                return (
                  <g key={brand.id}>
                    <rect x={770} y={y - 12} width={100} height={24} rx={6} fill="#f5f5f5" stroke="#e5e5e5" strokeWidth={1} />
                    <text x={820} y={y + 3} textAnchor="middle" fill="#525252" fontSize="9" fontWeight="600">{brand.name.slice(0, 14)}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* ── Row 7: Sortable Product Benchmark Table ─────────────── */}
        <div className="rounded-2xl border border-border bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Package size={14} className="text-muted" />
              <h3 className="text-[14px] font-semibold">Product Benchmark Table</h3>
              <span className="text-[11px] text-muted ml-2">{sortedBenchmark.length} products · sortable</span>
            </div>
            <Link href="/momentum" className="flex items-center gap-1 text-[12px] font-medium text-muted hover:text-foreground">
              Full Momentum Report <ArrowRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-premium">
              <thead>
                <tr className="bg-surface/50">
                  <th className="w-8 text-center">#</th>
                  <th>Product</th>
                  <th>Trend</th>
                  <th className="cursor-pointer text-center" onClick={() => handleTableSort("score")}>
                    <span className="inline-flex items-center gap-0.5">Score <SortIcon col="score" /></span>
                  </th>
                  <th className="cursor-pointer text-right" onClick={() => handleTableSort("views")}>
                    <span className="inline-flex items-center gap-0.5">Views <SortIcon col="views" /></span>
                  </th>
                  <th className="cursor-pointer text-right" onClick={() => handleTableSort("saves")}>
                    <span className="inline-flex items-center gap-0.5">Saves <SortIcon col="saves" /></span>
                  </th>
                  <th className="cursor-pointer text-right" onClick={() => handleTableSort("specs")}>
                    <span className="inline-flex items-center gap-0.5">Specs <SortIcon col="specs" /></span>
                  </th>
                  <th className="cursor-pointer text-center" onClick={() => handleTableSort("viewToSave")}>
                    <span className="inline-flex items-center gap-0.5">V→S% <SortIcon col="viewToSave" /></span>
                  </th>
                  <th className="cursor-pointer text-center" onClick={() => handleTableSort("viewToSpec")}>
                    <span className="inline-flex items-center gap-0.5">V→Sp% <SortIcon col="viewToSpec" /></span>
                  </th>
                  <th className="text-center">Archs</th>
                  <th className="text-right">Growth</th>
                  <th className="hidden xl:table-cell">7d</th>
                </tr>
              </thead>
              <tbody>
                {sortedBenchmark.map((p, i) => {
                  const trend = trendConfig[p.trend];
                  return (
                    <tr key={p.id} className="hover:bg-surface/50 transition-colors">
                      <td className="text-center text-[11px] font-semibold text-muted">{i + 1}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-surface shrink-0" />
                          <div>
                            <p className="text-[12px] font-medium">{p.name}</p>
                            <p className="text-[10px] text-muted">{p.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${trend.bg} ${trend.color}`}>{trend.label}</span></td>
                      <td className="text-center">
                        <span className="text-[14px] font-bold">{p.score}</span>
                      </td>
                      <td className="text-right text-[12px] font-medium">{p.views.toLocaleString()}</td>
                      <td className="text-right text-[12px] font-medium">{p.saves}</td>
                      <td className="text-right text-[12px] font-medium">{p.specs}</td>
                      <td className="text-center text-[11px] font-semibold">{p.viewToSave.toFixed(1)}%</td>
                      <td className="text-center text-[11px] font-semibold">{p.viewToSpec.toFixed(1)}%</td>
                      <td className="text-center text-[11px]">{p.archCount}</td>
                      <td className="text-right"><GrowthBadge value={p.viewsGrowth} /></td>
                      <td className="hidden xl:table-cell"><MiniSparkline data={p.sparkline} w={48} h={16} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Row 8: Live Activity + Architect Leaderboard + Specs ── */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Live Activity Feed */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-white">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald" />
                </div>
                <h2 className="text-[13px] font-semibold">Live Activity Feed</h2>
              </div>
              <Link href="/activity" className="flex items-center gap-1 text-[11px] font-medium text-muted hover:text-foreground">View all <ArrowRight size={11} /></Link>
            </div>
            <div className="divide-y divide-border max-h-[420px] overflow-y-auto">
              {recentActivity.map(event => {
                const Icon = activityIcons[event.type] || Activity;
                return (
                  <div key={event.id} className="flex items-start gap-3 px-5 py-2.5 transition-colors hover:bg-surface/50">
                    <div className="mt-0.5 rounded-lg bg-surface p-1.5"><Icon size={11} className="text-muted" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] leading-relaxed">
                        <span className="font-medium">{event.actor.name}</span>
                        <span className="text-muted">
                          {event.type === "product_saved" && " saved "}
                          {event.type === "spec_downloaded" && " downloaded spec for "}
                          {event.type === "board_add" && " added to board "}
                          {event.type === "website_visit" && " viewed "}
                          {event.type === "enquiry" && " enquired about "}
                          {event.type === "project_tagged" && " tagged in "}
                        </span>
                        <span className="font-medium">{event.productName}</span>
                      </p>
                      <p className="mt-0.5 text-[9px] text-muted">{formatTime(event.timestamp)} · {event.actor.role}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Architect Leaderboard */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-white">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2"><Crown size={14} className="text-amber" /><h2 className="text-[13px] font-semibold">Architect Leaderboard</h2></div>
              <Link href="/influence" className="flex items-center gap-1 text-[11px] font-medium text-muted hover:text-foreground">Full report <ArrowRight size={11} /></Link>
            </div>
            <table className="w-full table-premium">
              <thead>
                <tr className="text-[9px]">
                  <th className="w-6">#</th>
                  <th>Architect</th>
                  <th className="text-center">Score</th>
                  <th className="text-center">Pctl</th>
                  <th className="text-right">Enq.</th>
                  <th className="hidden xl:table-cell">Trend</th>
                </tr>
              </thead>
              <tbody>
                {architectInfluenceData.map((arch, i) => {
                  const allScores = architectInfluenceData.map(a => a.influenceScore);
                  const pctl = Math.round((allScores.filter(s => s <= arch.influenceScore).length / allScores.length) * 100);
                  return (
                    <tr key={arch.architectId}>
                      <td className="text-center text-[11px] font-semibold text-muted">{i + 1}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-surface shrink-0" />
                          <div>
                            <p className="text-[11px] font-medium">{arch.name}</p>
                            <p className="text-[9px] text-muted">{arch.tier}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center text-[13px] font-bold">{arch.influenceScore}</td>
                      <td className="text-center"><PercentileBadge value={pctl} /></td>
                      <td className="text-right text-[11px] font-medium">{arch.metrics.enquiriesGenerated}</td>
                      <td className="hidden xl:table-cell"><MiniSparkline data={arch.monthlyTrend.map(d => d.score)} w={40} h={14} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Specification Progress */}
          <div className="lg:col-span-1 rounded-2xl border border-border bg-white p-5">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList size={14} className="text-muted" />
              <h2 className="text-[13px] font-semibold">Spec Progress</h2>
            </div>
            <div className="space-y-4">
              {specifications.map(spec => {
                const totalItems = spec.rooms.reduce((s, r) => s + r.items.length, 0);
                const installed = spec.rooms.reduce((s, r) => s + r.items.filter(i => i.status === "installed").length, 0);
                const delivered = spec.rooms.reduce((s, r) => s + r.items.filter(i => i.status === "delivered").length, 0);
                const ordered = spec.rooms.reduce((s, r) => s + r.items.filter(i => i.status === "ordered").length, 0);
                const progress = Math.round(((installed + delivered * 0.75 + ordered * 0.4) / totalItems) * 100);
                return (
                  <Link key={spec.id} href={`/specifications/${spec.id}`} className="block group">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[12px] font-medium group-hover:underline">{spec.projectName}</p>
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${
                        spec.status === "approved" ? "bg-emerald-light text-emerald" : spec.status === "review" ? "bg-amber-light text-amber" : "bg-surface text-muted"
                      }`}>{spec.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-surface overflow-hidden">
                        <div className="h-full rounded-full bg-foreground" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-[10px] font-semibold text-muted">{progress}%</span>
                    </div>
                    <p className="mt-1 text-[9px] text-muted">{totalItems} items · {installed} installed · {delivered} delivered · {ordered} ordered</p>
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
