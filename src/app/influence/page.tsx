"use client";

import { useState, useMemo } from "react";
import { architectInfluenceData, ArchitectInfluence, productMomentumData } from "@/lib/intelligence-data";
import { architects, products, projects, brands } from "@/lib/mock-data";
import {
  Eye, Heart, Download, MessageCircle, LayoutGrid, FolderOpen,
  ChevronDown, ChevronUp, Crown, TrendingUp, ArrowRight, ArrowUp,
  ArrowDown, Minus, X, BarChart3, Users, Zap, ExternalLink, Target,
  Activity, Layers, GitBranch, AlertTriangle, Shield, Award,
} from "lucide-react";

// ─── Config ─────────────────────────────────────────────────────────────────

const tierConfig: Record<string, { bg: string; text: string; border: string }> = {
  Platinum: { bg: "bg-foreground", text: "text-white", border: "border-foreground" },
  Gold: { bg: "bg-amber-light", text: "text-amber", border: "border-amber" },
  Silver: { bg: "bg-surface", text: "text-muted", border: "border-border" },
  Bronze: { bg: "bg-amber-light/50", text: "text-amber/60", border: "border-amber/30" },
};

// ─── Mock: Architect cohort data ────────────────────────────────────────────
const architectCohorts = [
  { cohort: "Q2 2024", newArchitects: 8, retained1m: 88, retained3m: 72, retained6m: 61, avgScore: 54, enquiryRate: 2.8 },
  { cohort: "Q3 2024", newArchitects: 12, retained1m: 92, retained3m: 78, retained6m: 0, avgScore: 62, enquiryRate: 3.2 },
  { cohort: "Q4 2024", newArchitects: 6, retained1m: 85, retained3m: 68, retained6m: 0, avgScore: 58, enquiryRate: 3.0 },
  { cohort: "Jan 2025", newArchitects: 4, retained1m: 100, retained3m: 0, retained6m: 0, avgScore: 48, enquiryRate: 2.4 },
  { cohort: "Feb 2025", newArchitects: 7, retained1m: 86, retained3m: 0, retained6m: 0, avgScore: 52, enquiryRate: 2.6 },
  { cohort: "Mar 2025", newArchitects: 5, retained1m: 0, retained3m: 0, retained6m: 0, avgScore: 44, enquiryRate: 0 },
];

// ─── Mock: Engagement funnel (architect journey) ────────────────────────────
const architectFunnel = [
  { stage: "Platform Visits", value: 8420, pct: 100, benchmark: 100 },
  { stage: "Product Discoveries", value: 4591, pct: 54.5, benchmark: 48 },
  { stage: "Product Saves", value: 1457, pct: 17.3, benchmark: 14 },
  { stage: "Spec Downloads", value: 979, pct: 11.6, benchmark: 8.5 },
  { stage: "Board Creations", value: 53, pct: 0.63, benchmark: 0.5 },
  { stage: "Enquiries Sent", value: 168, pct: 2.0, benchmark: 1.6 },
];

// ─── Mock: Spec conversion funnel ───────────────────────────────────────────
const specArchitectFunnel = [
  { stage: "Products Discovered", value: 4591, pct: 100, benchmark: 100 },
  { stage: "Saved to Library", value: 1457, pct: 31.7, benchmark: 28 },
  { stage: "Added to Board", value: 386, pct: 8.4, benchmark: 7.2 },
  { stage: "Spec Generated", value: 218, pct: 4.75, benchmark: 3.8 },
  { stage: "Spec Approved", value: 124, pct: 2.7, benchmark: 2.1 },
  { stage: "Products Installed", value: 67, pct: 1.46, benchmark: 0.9 },
];

// ─── Mock: Percentile benchmarks ────────────────────────────────────────────
const architectBenchmarks = [
  { metric: "Influence Score", value: 77, percentile: 72, categoryAvg: 65, delta: 12, trend: [58, 62, 66, 70, 74, 77] },
  { metric: "Product Discoveries", value: 765, percentile: 68, categoryAvg: 580, delta: 185, trend: [420, 510, 580, 640, 710, 765] },
  { metric: "Save Rate", value: 31.2, percentile: 78, categoryAvg: 24.8, delta: 6.4, unit: "%", trend: [18, 22, 25, 27, 29, 31.2] },
  { metric: "Spec Download Rate", value: 21.3, percentile: 82, categoryAvg: 16.2, delta: 5.1, unit: "%", trend: [12, 14, 16, 18, 20, 21.3] },
  { metric: "Enquiry Conversion", value: 3.7, percentile: 74, categoryAvg: 2.8, delta: 0.9, unit: "%", trend: [1.8, 2.2, 2.6, 3.0, 3.4, 3.7], alert: true },
  { metric: "Cross-Project Reach", value: 4.2, percentile: 85, categoryAvg: 2.8, delta: 1.4, trend: [1.5, 2.0, 2.6, 3.2, 3.8, 4.2] },
  { metric: "Brand Diversity", value: 3.8, percentile: 71, categoryAvg: 2.5, delta: 1.3, trend: [1.8, 2.2, 2.6, 3.0, 3.4, 3.8] },
  { metric: "Network Influence", value: 82, percentile: 88, categoryAvg: 62, delta: 20, trend: [48, 56, 64, 72, 78, 82] },
];

// ─── Mock: Growth momentum composite ────────────────────────────────────────
const influenceComposite = [
  { label: "Discovery Volume", weight: 20, score: 78, trend: [54, 60, 65, 70, 74, 78], benchmark: 64 },
  { label: "Save Conversion", weight: 20, score: 72, trend: [48, 54, 58, 64, 68, 72], benchmark: 58 },
  { label: "Spec Engagement", weight: 25, score: 81, trend: [58, 64, 68, 74, 78, 81], benchmark: 66 },
  { label: "Enquiry Generation", weight: 20, score: 68, trend: [42, 48, 52, 58, 64, 68], benchmark: 55 },
  { label: "Network Effect", weight: 15, score: 74, trend: [50, 56, 62, 66, 70, 74], benchmark: 60 },
];

// ─── Mock: Monthly time series ──────────────────────────────────────────────
const monthlyInfluenceSeries = [
  { month: "Jul", discoveries: 3200, saves: 820, specs: 480, enquiries: 62 },
  { month: "Aug", discoveries: 3600, saves: 940, specs: 540, enquiries: 74 },
  { month: "Sep", discoveries: 3900, saves: 1080, specs: 620, enquiries: 88 },
  { month: "Oct", discoveries: 4100, saves: 1200, specs: 740, enquiries: 108 },
  { month: "Nov", discoveries: 4400, saves: 1340, specs: 860, enquiries: 138 },
  { month: "Dec", discoveries: 4591, saves: 1457, specs: 979, enquiries: 168 },
];

// ─── Mock: Risk / Opportunity signals ───────────────────────────────────────
const influenceRiskSignals = [
  { type: "risk" as const, metric: "Silver Tier Churn", message: "2 Silver architects inactive >45d — engagement declining", severity: "medium" as const },
  { type: "risk" as const, metric: "Enquiry Velocity", message: "Enquiry rate slowing: 3.7% vs 4.1% last quarter — monitor closely", severity: "low" as const },
  { type: "opportunity" as const, metric: "Platinum Growth", message: "Aroha Tane approaching Gold→Platinum threshold (+16 pts in 6mo)", severity: "high" as const },
  { type: "opportunity" as const, metric: "Network Effect", message: "P88 network influence — architect cross-referrals accelerating", severity: "low" as const },
];

// ─── Helper Components ──────────────────────────────────────────────────────

type SortKey = "score" | "discoveries" | "saves" | "specs" | "enquiries" | "growth" | "percentile" | "saveRate" | "specRate";

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

function MiniSparkline({ data, w = 80, h = 24, color = "#0a0a0a" }: { data: number[]; w?: number; h?: number; color?: string }) {
  const max = Math.max(...data); const min = Math.min(...data); const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={h - ((data[data.length - 1] - min) / range) * h} r="2" fill={color} />
    </svg>
  );
}

function TrendChart({ data }: { data: { month: string; score: number }[] }) {
  const max = Math.max(...data.map(d => d.score));
  const min = Math.min(...data.map(d => d.score));
  const range = max - min || 1;
  const w = 160; const h = 48;
  const points = data.map((d, i) => `${(i / (data.length - 1)) * w},${h - ((d.score - min) / range) * (h - 8)}`).join(" ");
  return (
    <div>
      <svg width={w} height={h} className="overflow-visible">
        <polyline points={points} fill="none" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={w} cy={h - ((data[data.length - 1].score - min) / range) * (h - 8)} r="3" fill="#0a0a0a" />
      </svg>
      <div className="flex justify-between mt-1">
        {data.map(d => <span key={d.month} className="text-[9px] text-muted">{d.month}</span>)}
      </div>
    </div>
  );
}

function GrowthBadge({ value }: { value: number }) {
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${value > 0 ? "text-emerald" : value < 0 ? "text-rose" : "text-muted"}`}>
      {value > 0 ? <ArrowUp size={10} /> : value < 0 ? <ArrowDown size={10} /> : <Minus size={10} />}
      {Math.abs(value)}
    </span>
  );
}

// ─── Detail Panel ───────────────────────────────────────────────────────────

function DetailPanel({ arch, onClose, allScores }: { arch: ArchitectInfluence; onClose: () => void; allScores: number[] }) {
  const tier = tierConfig[arch.tier];
  const conversionRate = ((arch.metrics.enquiriesGenerated / arch.metrics.productDiscoveries) * 100).toFixed(1);
  const archProjects = projects.filter(p => p.architectId === arch.architectId);
  const growth = arch.monthlyTrend[arch.monthlyTrend.length - 1].score - arch.monthlyTrend[0].score;
  const percentile = Math.round((allScores.filter(s => s <= arch.influenceScore).length / allScores.length) * 100);
  const avgScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-[520px] border-l border-border bg-white shadow-2xl overflow-y-auto">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-surface shrink-0" />
          <div>
            <h3 className="text-[15px] font-semibold">{arch.name}</h3>
            <p className="text-[12px] text-muted">{arch.firm}</p>
          </div>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-surface"><X size={18} /></button>
      </div>

      <div className="p-6 space-y-6">
        {/* Score + Percentile */}
        <div className="flex items-start gap-5">
          <div className="relative flex items-center justify-center">
            <ScoreRing score={arch.influenceScore} size={90} stroke={7} />
            <span className="absolute text-[22px] font-bold rotate-90">{arch.influenceScore}</span>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${tier.bg} ${tier.text}`}>{arch.tier}</span>
              <PercentileBadge value={percentile} />
              <GrowthBadge value={growth} />
            </div>
            <div className="h-1.5 rounded-full bg-surface overflow-hidden relative">
              <div className="h-full rounded-full bg-foreground" style={{ width: `${arch.influenceScore}%` }} />
              <div className="absolute top-0 h-full w-px bg-rose/50" style={{ left: `${avgScore}%` }} />
            </div>
            <p className="text-[11px] text-muted">
              Platform avg: <span className="font-semibold text-foreground">{avgScore}</span> ·
              Delta: <span className={`font-semibold ${arch.influenceScore > avgScore ? "text-emerald" : "text-rose"}`}>
                {arch.influenceScore > avgScore ? "+" : ""}{arch.influenceScore - avgScore}
              </span>
            </p>
          </div>
        </div>

        {/* Trend */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted mb-3">Score Trend (6 months)</p>
          <div className="rounded-xl border border-border p-4">
            <TrendChart data={arch.monthlyTrend} />
            <div className="flex items-center gap-2 mt-3">
              <TrendingUp size={12} className="text-emerald" />
              <span className="text-[11px] text-emerald font-medium">+{growth} pts over 6 months</span>
              <span className="text-[10px] text-muted ml-auto">avg monthly: +{(growth / 6).toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Performance vs Platform */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted mb-3">Performance vs Platform Average</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Eye, label: "Discoveries", value: arch.metrics.productDiscoveries, avg: 765 },
              { icon: Heart, label: "Saves", value: arch.metrics.productSaves, avg: 243 },
              { icon: Download, label: "Spec Downloads", value: arch.metrics.specDownloads, avg: 163 },
              { icon: MessageCircle, label: "Enquiries", value: arch.metrics.enquiriesGenerated, avg: 28 },
              { icon: LayoutGrid, label: "Boards", value: arch.metrics.boardsCreated, avg: 9 },
              { icon: FolderOpen, label: "Projects", value: arch.metrics.projectsPublished, avg: 10 },
            ].map(m => {
              const delta = ((m.value - m.avg) / m.avg * 100).toFixed(0);
              return (
                <div key={m.label} className="rounded-xl border border-border p-3">
                  <div className="flex items-center justify-between mb-1">
                    <m.icon size={12} className="text-muted" />
                    <span className={`text-[10px] font-semibold ${Number(delta) >= 0 ? "text-emerald" : "text-rose"}`}>
                      {Number(delta) >= 0 ? "+" : ""}{delta}%
                    </span>
                  </div>
                  <p className="text-[17px] font-semibold">{m.value.toLocaleString()}</p>
                  <p className="text-[10px] text-muted">{m.label} · avg {m.avg}</p>
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
              { label: "Discovery → Save", value: ((arch.metrics.productSaves / arch.metrics.productDiscoveries) * 100).toFixed(1), benchmark: "28" },
              { label: "Discovery → Enquiry", value: conversionRate, benchmark: "3.5" },
              { label: "Save → Spec", value: ((arch.metrics.specDownloads / arch.metrics.productSaves) * 100).toFixed(1), benchmark: "55" },
            ].map(b => {
              const above = parseFloat(b.value) >= parseFloat(b.benchmark);
              return (
                <div key={b.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-muted">{b.label}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[13px] font-semibold ${above ? "text-foreground" : "text-rose"}`}>{b.value}%</span>
                      <span className="text-[10px] text-muted">avg {b.benchmark}%</span>
                    </div>
                  </div>
                  <div className="relative h-1.5 rounded-full bg-surface overflow-hidden">
                    <div className={`h-full rounded-full ${above ? "bg-foreground" : "bg-rose/60"}`} style={{ width: `${Math.min(parseFloat(b.value), 100)}%` }} />
                    <div className="absolute top-0 h-full w-px bg-rose/50" style={{ left: `${Math.min(parseFloat(b.benchmark), 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Influenced Products */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted mb-3">Top Influenced Products</p>
          <div className="space-y-2">
            {arch.topInfluencedProducts.map(p => (
              <div key={p.productId} className="flex items-center justify-between rounded-xl border border-border p-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-surface shrink-0" />
                  <div>
                    <p className="text-[12px] font-medium">{p.productName}</p>
                    <p className="text-[10px] text-muted">{p.brand}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 rounded-full bg-surface overflow-hidden">
                    <div className="h-full rounded-full bg-foreground" style={{ width: `${p.influence}%` }} />
                  </div>
                  <span className="text-[12px] font-semibold w-8 text-right">{p.influence}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted mb-3">Published Projects ({archProjects.length})</p>
          <div className="space-y-2">
            {archProjects.map(proj => (
              <div key={proj.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <div className="h-10 w-10 rounded-lg bg-surface shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium">{proj.title}</p>
                  <p className="text-[10px] text-muted">{proj.location} · {proj.year}</p>
                </div>
                <ExternalLink size={13} className="text-muted shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function InfluencePage() {
  const [selectedArchitect, setSelectedArchitect] = useState<ArchitectInfluence | null>(null);
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const allScores = architectInfluenceData.map(a => a.influenceScore);
  const totalDiscoveries = architectInfluenceData.reduce((a, b) => a + b.metrics.productDiscoveries, 0);
  const totalEnquiries = architectInfluenceData.reduce((a, b) => a + b.metrics.enquiriesGenerated, 0);
  const totalSaves = architectInfluenceData.reduce((a, b) => a + b.metrics.productSaves, 0);
  const totalSpecs = architectInfluenceData.reduce((a, b) => a + b.metrics.specDownloads, 0);
  const avgScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
  const platinumCount = architectInfluenceData.filter(a => a.tier === "Platinum").length;
  const goldCount = architectInfluenceData.filter(a => a.tier === "Gold").length;
  const compositeScore = Math.round(influenceComposite.reduce((s, m) => s + m.score * (m.weight / 100), 0));

  const tsMax = Math.max(...monthlyInfluenceSeries.map(d => d.discoveries));

  const filtered = useMemo(() => {
    let data = tierFilter === "all" ? [...architectInfluenceData] : architectInfluenceData.filter(a => a.tier.toLowerCase() === tierFilter);
    data.sort((a, b) => {
      let va = 0, vb = 0;
      const aGrowth = a.monthlyTrend[a.monthlyTrend.length - 1].score - a.monthlyTrend[0].score;
      const bGrowth = b.monthlyTrend[b.monthlyTrend.length - 1].score - b.monthlyTrend[0].score;
      if (sortBy === "score") { va = a.influenceScore; vb = b.influenceScore; }
      else if (sortBy === "discoveries") { va = a.metrics.productDiscoveries; vb = b.metrics.productDiscoveries; }
      else if (sortBy === "saves") { va = a.metrics.productSaves; vb = b.metrics.productSaves; }
      else if (sortBy === "specs") { va = a.metrics.specDownloads; vb = b.metrics.specDownloads; }
      else if (sortBy === "enquiries") { va = a.metrics.enquiriesGenerated; vb = b.metrics.enquiriesGenerated; }
      else if (sortBy === "growth") { va = aGrowth; vb = bGrowth; }
      else if (sortBy === "saveRate") { va = a.metrics.productSaves / a.metrics.productDiscoveries; vb = b.metrics.productSaves / b.metrics.productDiscoveries; }
      else if (sortBy === "specRate") { va = a.metrics.specDownloads / a.metrics.productSaves; vb = b.metrics.specDownloads / b.metrics.productSaves; }
      else if (sortBy === "percentile") {
        va = Math.round((allScores.filter(s => s <= a.influenceScore).length / allScores.length) * 100);
        vb = Math.round((allScores.filter(s => s <= b.influenceScore).length / allScores.length) * 100);
      }
      return sortDir === "desc" ? vb - va : va - vb;
    });
    return data;
  }, [tierFilter, sortBy, sortDir, allScores]);

  function handleSort(key: SortKey) {
    if (sortBy === key) setSortDir(sortDir === "desc" ? "asc" : "desc");
    else { setSortBy(key); setSortDir("desc"); }
  }

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortBy !== col) return <ChevronDown size={9} className="text-muted/40" />;
    return sortDir === "desc" ? <ChevronDown size={9} /> : <ChevronUp size={9} />;
  };

  return (
    <div className="min-h-screen bg-surface/50">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="border-b border-border bg-white px-8 py-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">Intelligence Terminal</p>
            <h1 className="mt-1 text-[28px] font-semibold tracking-tight">Architect Influence</h1>
            <p className="mt-1 text-[12px] text-muted">
              Percentile rankings, cohort retention, conversion funnels, and network influence across {architectInfluenceData.length} tracked architects
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-muted hover:bg-surface">
              <Download size={13} className="inline mr-1.5" />Export
            </button>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* ── Row 1: Composite + KPI Ribbon ───────────────────────── */}
        <div className="grid grid-cols-12 gap-4">
          {/* Influence Composite Score — deep panel */}
          <div className="col-span-5 rounded-2xl border border-border bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={14} className="text-amber" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">Influence Composite Score</span>
                </div>
                <p className="text-[11px] text-muted">Weighted across 5 influence dimensions</p>
              </div>
              <div className="relative flex items-center justify-center">
                <ScoreRing score={compositeScore} size={64} stroke={5} />
                <span className="absolute text-[17px] font-bold rotate-90">{compositeScore}</span>
              </div>
            </div>
            <div className="space-y-2.5">
              {influenceComposite.map(m => {
                const vsBench = m.score - m.benchmark;
                return (
                  <div key={m.label} className="flex items-center gap-3">
                    <span className="w-28 text-[11px] text-muted truncate">{m.label}</span>
                    <span className="w-6 text-[9px] text-muted text-right">{m.weight}%</span>
                    <div className="flex-1 relative h-2 rounded-full bg-surface overflow-hidden">
                      <div className="h-full rounded-full bg-foreground transition-all" style={{ width: `${m.score}%` }} />
                      <div className="absolute top-0 h-full w-px bg-rose/50" style={{ left: `${m.benchmark}%` }} />
                    </div>
                    <span className="w-7 text-[12px] font-semibold text-right">{m.score}</span>
                    <span className={`w-8 text-[9px] font-semibold text-right ${vsBench >= 0 ? "text-emerald" : "text-rose"}`}>
                      {vsBench >= 0 ? "+" : ""}{vsBench}
                    </span>
                    <MiniSparkline data={m.trend} w={48} h={14} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* KPI Ribbon */}
          <div className="col-span-7 grid grid-cols-4 gap-3">
            {[
              { icon: Users, iconColor: "text-muted", label: "Tracked", value: architectInfluenceData.length.toString(), change: 16.7, percentile: 0, trend: [3, 4, 4, 5, 5, 6], sub: `${platinumCount} platinum · ${goldCount} gold` },
              { icon: Crown, iconColor: "text-amber", label: "Avg Score", value: avgScore.toString(), change: 8.4, percentile: 72, trend: allScores, sub: null },
              { icon: Eye, iconColor: "text-muted", label: "Discoveries", value: totalDiscoveries.toLocaleString(), change: 14.2, percentile: 68, trend: monthlyInfluenceSeries.map(d => d.discoveries), sub: null },
              { icon: Heart, iconColor: "text-rose", label: "Total Saves", value: totalSaves.toLocaleString(), change: 18.5, percentile: 74, trend: monthlyInfluenceSeries.map(d => d.saves), sub: null },
              { icon: Download, iconColor: "text-blue", label: "Spec Downloads", value: totalSpecs.toLocaleString(), change: 22.1, percentile: 82, trend: monthlyInfluenceSeries.map(d => d.specs), sub: null },
              { icon: MessageCircle, iconColor: "text-amber", label: "Enquiries", value: totalEnquiries.toString(), change: 8.7, percentile: 65, trend: monthlyInfluenceSeries.map(d => d.enquiries), sub: null, alert: true },
              { icon: Target, iconColor: "text-blue", label: "Avg Conv.", value: ((totalEnquiries / totalDiscoveries) * 100).toFixed(1) + "%", change: -2.8, percentile: 58, trend: [2.8, 3.1, 3.4, 3.6, 3.5, 3.7], sub: null, alert: true },
              { icon: Activity, iconColor: "text-emerald", label: "Network Score", value: "82", change: 12.3, percentile: 88, trend: [48, 56, 64, 72, 78, 82], sub: null },
            ].map(kpi => (
              <div key={kpi.label} className={`rounded-xl border ${(kpi as { alert?: boolean }).alert ? "border-rose/30" : "border-border"} bg-white p-3`}>
                <div className="flex items-center justify-between mb-1.5">
                  <kpi.icon size={12} className={kpi.iconColor} />
                  <div className="flex items-center gap-1">
                    {kpi.percentile > 0 && <PercentileBadge value={kpi.percentile} />}
                    {(kpi as { alert?: boolean }).alert && <AlertTriangle size={10} className="text-rose" />}
                  </div>
                </div>
                <p className="text-[18px] font-bold tracking-tight leading-none">{kpi.value}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-muted">{kpi.label}</span>
                  <span className={`text-[10px] font-semibold ${kpi.change >= 0 ? "text-emerald" : "text-rose"}`}>
                    {kpi.change >= 0 ? "+" : ""}{kpi.change}%
                  </span>
                </div>
                {kpi.sub && <p className="text-[9px] text-muted mt-1">{kpi.sub}</p>}
                <div className="mt-1.5">
                  <MiniSparkline data={kpi.trend} w={80} h={14} color={(kpi as { alert?: boolean }).alert ? "#e11d48" : "#0a0a0a"} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Row 2: Risk / Opportunity Signals ───────────────────── */}
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={14} className="text-muted" />
            <h3 className="text-[13px] font-semibold">Risk & Opportunity Signals</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {influenceRiskSignals.map((signal, i) => (
              <div key={i} className={`rounded-xl border p-3 ${signal.type === "risk" ? "border-rose/20 bg-rose-light/30" : "border-emerald/20 bg-emerald-light/30"}`}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  {signal.type === "risk" ? <AlertTriangle size={11} className="text-rose" /> : <TrendingUp size={11} className="text-emerald" />}
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${signal.type === "risk" ? "text-rose" : "text-emerald"}`}>{signal.type}</span>
                  <span className={`ml-auto text-[9px] font-semibold rounded px-1 py-0.5 ${
                    signal.severity === "high" ? "bg-emerald/20 text-emerald" : signal.severity === "medium" ? "bg-amber-light text-amber" : "bg-surface text-muted"
                  }`}>{signal.severity}</span>
                </div>
                <p className="text-[11px] font-medium mb-0.5">{signal.metric}</p>
                <p className="text-[10px] text-muted leading-relaxed">{signal.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Row 3: Percentile Rankings (deep, with sparklines) ──── */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={14} className="text-muted" />
            <h3 className="text-[14px] font-semibold">Percentile Rankings vs Platform</h3>
          </div>
          <p className="text-[11px] text-muted mb-4">Performance benchmarks across 8 influence dimensions (6mo trend)</p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            {architectBenchmarks.map(b => (
              <div key={b.metric}>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">{b.metric}</span>
                    {b.alert && <AlertTriangle size={9} className="text-rose" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <MiniSparkline data={b.trend} w={36} h={12} color={b.delta >= 0 ? "#0a0a0a" : "#e11d48"} />
                    <span className="text-muted text-[10px]">avg {b.categoryAvg}{b.unit || ""}</span>
                    <span className="font-semibold">{b.value}{b.unit || ""}</span>
                    <span className={`text-[10px] font-semibold ${b.delta >= 0 ? "text-emerald" : "text-rose"}`}>
                      {b.delta >= 0 ? "+" : ""}{b.delta}
                    </span>
                    <PercentileBadge value={b.percentile} />
                  </div>
                </div>
                <div className="relative h-2 rounded-full bg-surface overflow-hidden">
                  <div className={`h-full rounded-full ${b.alert ? "bg-rose/60" : "bg-foreground"}`} style={{ width: `${b.percentile}%` }} />
                  <div className="absolute top-0 h-full w-0.5 bg-amber" style={{ left: `${Math.min(b.categoryAvg / b.value * b.percentile, 95)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Row 4: Engagement + Spec Funnels ────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-muted" />
                <h3 className="text-[14px] font-semibold">Architect Engagement Funnel</h3>
              </div>
              <span className="text-[10px] font-bold">{architectFunnel[architectFunnel.length - 1].pct}% end-to-end</span>
            </div>
            <p className="text-[11px] text-muted mb-4">Visit → Discover → Save → Spec → Board → Enquiry</p>
            <div className="space-y-1">
              {architectFunnel.map((stage, i) => {
                const dropoff = i > 0 ? ((1 - stage.value / architectFunnel[i - 1].value) * 100).toFixed(1) : null;
                const vsBench = stage.pct - stage.benchmark;
                return (
                  <div key={stage.stage}>
                    {dropoff && parseFloat(dropoff) > 0 && (
                      <div className="flex items-center gap-1.5 py-0.5 pl-6">
                        <ArrowDown size={8} className="text-rose/60" />
                        <span className="text-[9px] text-rose/70">-{dropoff}%</span>
                        <span className={`text-[9px] ml-auto font-semibold ${vsBench >= 0 ? "text-emerald" : "text-rose"}`}>
                          {vsBench >= 0 ? "+" : ""}{vsBench.toFixed(1)}% vs bench
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <span className="w-28 text-[11px] text-muted truncate">{stage.stage}</span>
                      <div className="flex-1 h-5 rounded bg-surface overflow-hidden relative">
                        <div className="h-full rounded bg-foreground/80 transition-all" style={{ width: `${stage.pct}%` }} />
                        <div className="absolute top-0 h-full w-px bg-rose/50" style={{ left: `${stage.benchmark}%` }} />
                      </div>
                      <span className="w-12 text-right text-[12px] font-semibold">{stage.value.toLocaleString()}</span>
                      <span className="w-10 text-right text-[10px] text-muted">{stage.pct}%</span>
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

          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-muted" />
                <h3 className="text-[14px] font-semibold">Spec Conversion Pipeline</h3>
              </div>
              <span className="text-[10px] font-bold">{specArchitectFunnel[specArchitectFunnel.length - 1].pct}% installed</span>
            </div>
            <p className="text-[11px] text-muted mb-4">Discovery → Save → Board → Spec → Approve → Install</p>
            <div className="space-y-1">
              {specArchitectFunnel.map((stage, i) => {
                const dropoff = i > 0 ? ((1 - stage.value / specArchitectFunnel[i - 1].value) * 100).toFixed(1) : null;
                const vsBench = stage.pct - stage.benchmark;
                return (
                  <div key={stage.stage}>
                    {dropoff && (
                      <div className="flex items-center gap-1.5 py-0.5 pl-6">
                        <ArrowDown size={8} className="text-rose/60" />
                        <span className="text-[9px] text-rose/70">-{dropoff}%</span>
                        <span className={`text-[9px] ml-auto font-semibold ${vsBench >= 0 ? "text-emerald" : "text-rose"}`}>
                          {vsBench >= 0 ? "+" : ""}{vsBench.toFixed(1)}% vs bench
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <span className="w-28 text-[11px] text-muted truncate">{stage.stage}</span>
                      <div className="flex-1 h-5 rounded bg-surface overflow-hidden relative">
                        <div className="h-full rounded bg-foreground/80 transition-all" style={{ width: `${stage.pct}%` }} />
                        <div className="absolute top-0 h-full w-px bg-rose/50" style={{ left: `${stage.benchmark}%` }} />
                      </div>
                      <span className="w-12 text-right text-[12px] font-semibold">{stage.value.toLocaleString()}</span>
                      <span className="w-10 text-right text-[10px] text-muted">{stage.pct}%</span>
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

        {/* ── Row 5: Cohort Heatmap + Time Series ─────────────────── */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Cohort Retention */}
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex items-center gap-2 mb-1">
              <Users size={14} className="text-muted" />
              <h3 className="text-[14px] font-semibold">Architect Cohort Retention</h3>
            </div>
            <p className="text-[11px] text-muted mb-4">% of new architects retained over time + engagement metrics</p>
            <table className="w-full">
              <thead>
                <tr className="text-[9px] font-semibold text-muted uppercase tracking-wider">
                  <th className="text-left pb-2 pr-2">Cohort</th>
                  <th className="text-center pb-2 w-10">New</th>
                  <th className="text-center pb-2 w-12">1m</th>
                  <th className="text-center pb-2 w-12">3m</th>
                  <th className="text-center pb-2 w-12">6m</th>
                  <th className="text-center pb-2 w-10">Score</th>
                  <th className="text-center pb-2 w-10">Enq%</th>
                </tr>
              </thead>
              <tbody>
                {architectCohorts.map(c => {
                  const cellClass = (val: number) => {
                    if (val === 0) return "bg-surface text-muted/40";
                    if (val >= 85) return "bg-foreground text-white";
                    if (val >= 70) return "bg-foreground/60 text-white";
                    if (val >= 55) return "bg-foreground/25 text-foreground";
                    return "bg-foreground/10 text-muted";
                  };
                  return (
                    <tr key={c.cohort}>
                      <td className="py-1 pr-2 text-[11px] font-semibold">{c.cohort}</td>
                      <td className="py-1 px-0.5 text-center">
                        <div className="rounded h-6 flex items-center justify-center bg-surface text-[10px] font-semibold">{c.newArchitects}</div>
                      </td>
                      {[c.retained1m, c.retained3m, c.retained6m].map((val, i) => (
                        <td key={i} className="py-1 px-0.5 text-center">
                          <div className={`rounded h-6 flex items-center justify-center text-[10px] font-semibold ${cellClass(val)}`}>
                            {val > 0 ? `${val}%` : "—"}
                          </div>
                        </td>
                      ))}
                      <td className="py-1 px-0.5 text-center">
                        <div className="rounded h-6 flex items-center justify-center bg-surface text-[10px] font-semibold">{c.avgScore}</div>
                      </td>
                      <td className="py-1 px-0.5 text-center">
                        <div className={`rounded h-6 flex items-center justify-center text-[10px] font-semibold ${c.enquiryRate > 0 ? "bg-surface" : "bg-surface text-muted/40"}`}>
                          {c.enquiryRate > 0 ? `${c.enquiryRate}%` : "—"}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Monthly Time Series */}
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 size={14} className="text-muted" />
                <h3 className="text-[14px] font-semibold">Monthly Performance</h3>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted">
                <span className="flex items-center gap-1"><span className="h-1.5 w-4 rounded bg-foreground" />Disc.</span>
                <span className="flex items-center gap-1"><span className="h-1.5 w-4 rounded bg-foreground/50" />Saves</span>
                <span className="flex items-center gap-1"><span className="h-1.5 w-4 rounded bg-foreground/25" />Specs</span>
              </div>
            </div>
            <div className="flex items-end gap-3 h-[130px]">
              {monthlyInfluenceSeries.map(d => {
                const dH = (d.discoveries / tsMax) * 110;
                const sH = (d.saves / tsMax) * 110;
                const spH = (d.specs / tsMax) * 110;
                return (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end gap-[2px]" style={{ height: 110 }}>
                      <div className="flex-1 rounded-t bg-foreground" style={{ height: dH }} />
                      <div className="flex-1 rounded-t bg-foreground/50" style={{ height: sH }} />
                      <div className="flex-1 rounded-t bg-foreground/25" style={{ height: spH }} />
                    </div>
                    <span className="text-[10px] text-muted">{d.month}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-border grid grid-cols-6 gap-2">
              {monthlyInfluenceSeries.map(d => (
                <div key={d.month} className="text-center">
                  <p className="text-[11px] font-semibold">{(d.discoveries / 1000).toFixed(1)}k</p>
                  <p className="text-[9px] text-muted">{d.enquiries} enq.</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row 6: Filters ──────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-border bg-white p-1">
              {["all", "platinum", "gold", "silver"].map(t => (
                <button key={t} onClick={() => setTierFilter(t)}
                  className={`rounded-md px-3 py-1.5 text-[12px] font-medium capitalize transition-colors ${
                    tierFilter === t ? "bg-foreground text-white" : "text-muted hover:bg-surface"
                  }`}>{t === "all" ? "All Tiers" : t}</button>
              ))}
            </div>
          </div>
          <span className="text-[11px] text-muted">{filtered.length} architects</span>
        </div>

        {/* ── Row 7: Sortable Architect Benchmark Table ───────────── */}
        <div className="rounded-2xl border border-border bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-premium">
              <thead>
                <tr className="bg-surface/50">
                  <th className="w-8 text-center">#</th>
                  <th>Architect</th>
                  <th>Tier</th>
                  <th className="cursor-pointer text-center" onClick={() => handleSort("score")}>
                    <span className="inline-flex items-center gap-0.5">Score <SortIcon col="score" /></span>
                  </th>
                  <th className="text-center">Pctl</th>
                  <th className="cursor-pointer text-right" onClick={() => handleSort("discoveries")}>
                    <span className="inline-flex items-center gap-0.5">Disc. <SortIcon col="discoveries" /></span>
                  </th>
                  <th className="cursor-pointer text-right" onClick={() => handleSort("saves")}>
                    <span className="inline-flex items-center gap-0.5">Saves <SortIcon col="saves" /></span>
                  </th>
                  <th className="cursor-pointer text-right" onClick={() => handleSort("specs")}>
                    <span className="inline-flex items-center gap-0.5">Specs <SortIcon col="specs" /></span>
                  </th>
                  <th className="cursor-pointer text-right" onClick={() => handleSort("enquiries")}>
                    <span className="inline-flex items-center gap-0.5">Enq. <SortIcon col="enquiries" /></span>
                  </th>
                  <th className="cursor-pointer text-center" onClick={() => handleSort("saveRate")}>
                    <span className="inline-flex items-center gap-0.5">S% <SortIcon col="saveRate" /></span>
                  </th>
                  <th className="cursor-pointer text-center" onClick={() => handleSort("specRate")}>
                    <span className="inline-flex items-center gap-0.5">Sp% <SortIcon col="specRate" /></span>
                  </th>
                  <th className="text-center">vs Avg</th>
                  <th className="hidden xl:table-cell">6m Trend</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((arch, i) => {
                  const tier = tierConfig[arch.tier];
                  const growth = arch.monthlyTrend[arch.monthlyTrend.length - 1].score - arch.monthlyTrend[0].score;
                  const percentile = Math.round((allScores.filter(s => s <= arch.influenceScore).length / allScores.length) * 100);
                  const vsAvg = arch.influenceScore - avgScore;
                  const saveRate = ((arch.metrics.productSaves / arch.metrics.productDiscoveries) * 100).toFixed(1);
                  const specRate = ((arch.metrics.specDownloads / arch.metrics.productSaves) * 100).toFixed(1);
                  return (
                    <tr key={arch.architectId} className="cursor-pointer hover:bg-surface/50 transition-colors" onClick={() => setSelectedArchitect(arch)}>
                      <td className="text-center"><span className="text-[11px] font-semibold text-muted">{i + 1}</span></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-surface shrink-0" />
                          <div>
                            <p className="text-[12px] font-medium">{arch.name}</p>
                            <p className="text-[10px] text-muted">{arch.firm}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold ${tier.bg} ${tier.text}`}>{arch.tier}</span></td>
                      <td className="text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-[14px] font-bold">{arch.influenceScore}</span>
                          <div className="w-10 h-1 mt-0.5 rounded-full bg-surface overflow-hidden">
                            <div className="h-full rounded-full bg-foreground" style={{ width: `${arch.influenceScore}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="text-center"><PercentileBadge value={percentile} /></td>
                      <td className="text-right text-[12px] font-medium">{arch.metrics.productDiscoveries.toLocaleString()}</td>
                      <td className="text-right text-[12px] font-medium">{arch.metrics.productSaves.toLocaleString()}</td>
                      <td className="text-right text-[12px] font-medium">{arch.metrics.specDownloads}</td>
                      <td className="text-right text-[12px] font-medium">{arch.metrics.enquiriesGenerated}</td>
                      <td className="text-center text-[11px] font-semibold">{saveRate}%</td>
                      <td className="text-center text-[11px] font-semibold">{specRate}%</td>
                      <td className="text-center">
                        <span className={`text-[11px] font-semibold ${vsAvg > 0 ? "text-emerald" : vsAvg < 0 ? "text-rose" : "text-muted"}`}>
                          {vsAvg > 0 ? "+" : ""}{vsAvg}
                        </span>
                      </td>
                      <td className="hidden xl:table-cell">
                        <div className="flex items-center gap-1.5">
                          <MiniSparkline data={arch.monthlyTrend.map(d => d.score)} w={48} h={16} />
                          <span className="text-[9px] font-semibold text-emerald">+{growth}</span>
                        </div>
                      </td>
                      <td><ArrowRight size={12} className="text-muted" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Row 8: Network Graph ────────────────────────────────── */}
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
              <span className="text-[9px]">Edge weight = influence</span>
            </div>
          </div>
          <div className="relative h-[400px] rounded-xl bg-surface/30 border border-border overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 960 380">
              {/* Edges: Architect → Product */}
              {architectInfluenceData.map((arch, ai) => {
                const ax = 100; const ay = 35 + ai * 55;
                return arch.topInfluencedProducts.map(prod => {
                  const pi = productMomentumData.findIndex(p => p.productId === prod.productId);
                  if (pi === -1) return null;
                  const px = 440; const py = 30 + pi * 42;
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
                const px = 440; const py = 30 + pi * 42;
                const bx = 800; const by = 50 + bi * 55;
                return (
                  <line key={`prod-brand-${prod.productId}`} x1={px + 20} y1={py} x2={bx - 30} y2={by}
                    stroke="#d4d4d4" strokeWidth={1} opacity={0.4} />
                );
              })}

              {/* Architect nodes */}
              {architectInfluenceData.map((arch, i) => {
                const y = 35 + i * 55; const r = 12 + arch.influenceScore / 18;
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
                const y = 30 + i * 42; const r = 8 + prod.momentumScore / 14;
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

        {/* ── Row 9: Bottom Insights ──────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Tier Distribution */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="text-[13px] font-semibold mb-4">Tier Distribution</h3>
            <div className="space-y-3">
              {(["Platinum", "Gold", "Silver", "Bronze"] as const).map(t => {
                const count = architectInfluenceData.filter(a => a.tier === t).length;
                const pct = Math.round((count / architectInfluenceData.length) * 100);
                const tc = tierConfig[t];
                return (
                  <div key={t} className="flex items-center gap-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold w-16 justify-center ${tc.bg} ${tc.text}`}>{t}</span>
                    <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
                      <div className="h-full rounded-full bg-foreground transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[12px] font-medium w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Most Influenced Products */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="text-[13px] font-semibold mb-4">Most Influenced Products</h3>
            <div className="space-y-3">
              {(() => {
                const productInfluence: Record<string, { name: string; brand: string; total: number }> = {};
                architectInfluenceData.forEach(arch => {
                  arch.topInfluencedProducts.forEach(p => {
                    if (!productInfluence[p.productId]) productInfluence[p.productId] = { name: p.productName, brand: p.brand, total: 0 };
                    productInfluence[p.productId].total += p.influence;
                  });
                });
                return Object.entries(productInfluence).sort((a, b) => b[1].total - a[1].total).slice(0, 5).map(([id, p], i) => (
                  <div key={id} className="flex items-center gap-3">
                    <span className="w-5 text-center text-[11px] font-semibold text-muted">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium truncate">{p.name}</p>
                      <p className="text-[9px] text-muted">{p.brand}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 h-1.5 rounded-full bg-surface overflow-hidden">
                        <div className="h-full rounded-full bg-foreground" style={{ width: `${(p.total / 300) * 100}%` }} />
                      </div>
                      <span className="text-[12px] font-semibold">{p.total}</span>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Fastest Rising */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="text-[13px] font-semibold mb-4">Fastest Rising</h3>
            <div className="space-y-3">
              {[...architectInfluenceData]
                .map(a => ({ ...a, growth: a.monthlyTrend[a.monthlyTrend.length - 1].score - a.monthlyTrend[0].score }))
                .sort((a, b) => b.growth - a.growth)
                .slice(0, 5)
                .map((arch, i) => (
                  <div key={arch.architectId} className="flex items-center gap-3">
                    <span className="w-5 text-center text-[11px] font-semibold text-muted">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium truncate">{arch.name}</p>
                      <p className="text-[9px] text-muted">{arch.firm}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MiniSparkline data={arch.monthlyTrend.map(d => d.score)} w={40} h={14} />
                      <span className="text-[11px] font-semibold text-emerald">+{arch.growth}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Detail Panel ─────────────────────────────────────────── */}
      {selectedArchitect && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setSelectedArchitect(null)} />
          <DetailPanel arch={selectedArchitect} onClose={() => setSelectedArchitect(null)} allScores={allScores} />
        </>
      )}
    </div>
  );
}
