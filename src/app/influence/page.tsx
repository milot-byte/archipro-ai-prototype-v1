"use client";

import { useState, useMemo } from "react";
import { architectInfluenceData, ArchitectInfluence, productMomentumData } from "@/lib/intelligence-data";
import { architects, products, projects, brands } from "@/lib/mock-data";
import {
  Eye,
  Heart,
  Download,
  MessageCircle,
  LayoutGrid,
  FolderOpen,
  ChevronDown,
  ChevronUp,
  Crown,
  TrendingUp,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Minus,
  X,
  BarChart3,
  Users,
  Zap,
  ExternalLink,
  Target,
  Activity,
  Layers,
  GitBranch,
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
  { cohort: "Q2 2024", newArchitects: 8, retained1m: 88, retained3m: 72, retained6m: 61, avgScore: 54 },
  { cohort: "Q3 2024", newArchitects: 12, retained1m: 92, retained3m: 78, retained6m: 0, avgScore: 62 },
  { cohort: "Q4 2024", newArchitects: 6, retained1m: 85, retained3m: 68, retained6m: 0, avgScore: 58 },
  { cohort: "Jan 2025", newArchitects: 4, retained1m: 100, retained3m: 0, retained6m: 0, avgScore: 48 },
  { cohort: "Feb 2025", newArchitects: 7, retained1m: 86, retained3m: 0, retained6m: 0, avgScore: 52 },
  { cohort: "Mar 2025", newArchitects: 5, retained1m: 0, retained3m: 0, retained6m: 0, avgScore: 44 },
];

// ─── Mock: Engagement funnel (architect journey) ────────────────────────────
const architectFunnel = [
  { stage: "Platform Visits", value: 4591, pct: 100 },
  { stage: "Product Discoveries", value: 4591, pct: 100 },
  { stage: "Product Saves", value: 1457, pct: 31.7 },
  { stage: "Spec Downloads", value: 979, pct: 21.3 },
  { stage: "Board Creations", value: 53, pct: 1.15 },
  { stage: "Enquiries Sent", value: 168, pct: 3.66 },
];

// ─── Mock: Spec conversion funnel ───────────────────────────────────────────
const specArchitectFunnel = [
  { stage: "Products Discovered", value: 4591, pct: 100 },
  { stage: "Saved to Library", value: 1457, pct: 31.7 },
  { stage: "Added to Board", value: 386, pct: 8.4 },
  { stage: "Spec Generated", value: 218, pct: 4.75 },
  { stage: "Spec Approved", value: 124, pct: 2.7 },
  { stage: "Products Installed", value: 67, pct: 1.46 },
];

// ─── Mock: Percentile benchmarks ────────────────────────────────────────────
const architectBenchmarks = [
  { metric: "Influence Score", value: 77, percentile: 72, categoryAvg: 65, delta: 12 },
  { metric: "Product Discoveries", value: 765, percentile: 68, categoryAvg: 580, delta: 185 },
  { metric: "Save Rate", value: 31.2, percentile: 78, categoryAvg: 24.8, delta: 6.4 },
  { metric: "Spec Download Rate", value: 21.3, percentile: 82, categoryAvg: 16.2, delta: 5.1 },
  { metric: "Enquiry Conversion", value: 3.7, percentile: 74, categoryAvg: 2.8, delta: 0.9 },
  { metric: "Cross-Project Reach", value: 4.2, percentile: 85, categoryAvg: 2.8, delta: 1.4 },
];

// ─── Mock: Growth momentum composite ────────────────────────────────────────
const influenceComposite = [
  { label: "Discovery Volume", weight: 20, score: 78, trend: [54, 60, 65, 70, 74, 78] },
  { label: "Save Conversion", weight: 20, score: 72, trend: [48, 54, 58, 64, 68, 72] },
  { label: "Spec Engagement", weight: 25, score: 81, trend: [58, 64, 68, 74, 78, 81] },
  { label: "Enquiry Generation", weight: 20, score: 68, trend: [42, 48, 52, 58, 64, 68] },
  { label: "Network Effect", weight: 15, score: 74, trend: [50, 56, 62, 66, 70, 74] },
];

// ─── Helper Components ──────────────────────────────────────────────────────

type SortKey = "score" | "discoveries" | "saves" | "specs" | "enquiries" | "growth" | "percentile";

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

function TrendChart({ data }: { data: { month: string; score: number }[] }) {
  const max = Math.max(...data.map((d) => d.score));
  const min = Math.min(...data.map((d) => d.score));
  const range = max - min || 1;
  const w = 160;
  const h = 48;
  const points = data.map((d, i) => `${(i / (data.length - 1)) * w},${h - ((d.score - min) / range) * (h - 8)}`).join(" ");

  return (
    <div>
      <svg width={w} height={h} className="overflow-visible">
        <polyline points={points} fill="none" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={w} cy={h - ((data[data.length - 1].score - min) / range) * (h - 8)} r="3" fill="#0a0a0a" />
      </svg>
      <div className="flex justify-between mt-1">
        {data.map((d) => (<span key={d.month} className="text-[9px] text-muted">{d.month}</span>))}
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
  const archProjects = projects.filter((p) => p.architectId === arch.architectId);
  const growth = arch.monthlyTrend[arch.monthlyTrend.length - 1].score - arch.monthlyTrend[0].score;
  const percentile = Math.round((allScores.filter((s) => s <= arch.influenceScore).length / allScores.length) * 100);
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
            </div>
            <div className="h-1.5 rounded-full bg-surface overflow-hidden">
              <div className="h-full rounded-full bg-foreground" style={{ width: `${arch.influenceScore}%` }} />
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
            ].map((m) => {
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
            ].map((b) => {
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
                    <div className="absolute top-0 h-full w-px bg-muted" style={{ left: `${Math.min(parseFloat(b.benchmark), 100)}%` }} />
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
            {arch.topInfluencedProducts.map((p) => (
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

        {/* Influenced Brands */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted mb-3">Top Influenced Brands</p>
          <div className="space-y-2">
            {arch.topInfluencedBrands.map((b) => (
              <div key={b.brandId} className="flex items-center justify-between rounded-xl border border-border p-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-bold text-white">{b.brandName.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <p className="text-[12px] font-medium">{b.brandName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 rounded-full bg-surface overflow-hidden">
                    <div className="h-full rounded-full bg-foreground" style={{ width: `${b.influence}%` }} />
                  </div>
                  <span className="text-[12px] font-semibold w-8 text-right">{b.influence}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted mb-3">Published Projects ({archProjects.length})</p>
          <div className="space-y-2">
            {archProjects.map((proj) => (
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

  const allScores = architectInfluenceData.map((a) => a.influenceScore);
  const totalDiscoveries = architectInfluenceData.reduce((a, b) => a + b.metrics.productDiscoveries, 0);
  const totalEnquiries = architectInfluenceData.reduce((a, b) => a + b.metrics.enquiriesGenerated, 0);
  const totalSaves = architectInfluenceData.reduce((a, b) => a + b.metrics.productSaves, 0);
  const avgScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
  const platinumCount = architectInfluenceData.filter((a) => a.tier === "Platinum").length;
  const goldCount = architectInfluenceData.filter((a) => a.tier === "Gold").length;
  const compositeScore = Math.round(influenceComposite.reduce((s, m) => s + m.score * (m.weight / 100), 0));

  const filtered = useMemo(() => {
    let data = tierFilter === "all" ? [...architectInfluenceData] : architectInfluenceData.filter((a) => a.tier.toLowerCase() === tierFilter);
    data.sort((a, b) => {
      let va = 0, vb = 0;
      if (sortBy === "score") { va = a.influenceScore; vb = b.influenceScore; }
      else if (sortBy === "discoveries") { va = a.metrics.productDiscoveries; vb = b.metrics.productDiscoveries; }
      else if (sortBy === "saves") { va = a.metrics.productSaves; vb = b.metrics.productSaves; }
      else if (sortBy === "specs") { va = a.metrics.specDownloads; vb = b.metrics.specDownloads; }
      else if (sortBy === "enquiries") { va = a.metrics.enquiriesGenerated; vb = b.metrics.enquiriesGenerated; }
      else if (sortBy === "growth") {
        va = a.monthlyTrend[a.monthlyTrend.length - 1].score - a.monthlyTrend[0].score;
        vb = b.monthlyTrend[b.monthlyTrend.length - 1].score - b.monthlyTrend[0].score;
      }
      else if (sortBy === "percentile") {
        va = Math.round((allScores.filter((s) => s <= a.influenceScore).length / allScores.length) * 100);
        vb = Math.round((allScores.filter((s) => s <= b.influenceScore).length / allScores.length) * 100);
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
    if (sortBy !== col) return <ChevronDown size={10} className="text-muted/40" />;
    return sortDir === "desc" ? <ChevronDown size={10} /> : <ChevronUp size={10} />;
  };

  return (
    <div className="min-h-screen bg-surface/50">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="border-b border-border bg-white px-8 py-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">Intelligence</p>
            <h1 className="mt-1 text-[28px] font-semibold tracking-tight">Architect Influence</h1>
            <p className="mt-1 text-[13px] text-muted max-w-xl">
              Financial-grade architect influence analytics. Percentile rankings, cohort retention, conversion funnels, and network effect scoring.
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
        {/* ── KPI Strip ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          {[
            { icon: Users, iconColor: "text-muted", label: "Tracked", value: architectInfluenceData.length, sub: <span className="text-[11px] text-muted">{platinumCount} platinum · {goldCount} gold</span> },
            { icon: Crown, iconColor: "text-amber", label: "Avg Score", value: avgScore, sub: <><PercentileBadge value={72} /> <span className="text-[10px] text-muted ml-1">platform</span></> },
            { icon: Target, iconColor: "text-blue", label: "Composite", value: compositeScore, sub: <><PercentileBadge value={76} /> <span className="text-[10px] text-muted ml-1">weighted</span></> },
            { icon: Eye, iconColor: "text-muted", label: "Discoveries", value: totalDiscoveries.toLocaleString(), sub: <span className="text-[11px] text-emerald">Products surfaced</span> },
            { icon: Heart, iconColor: "text-rose", label: "Total Saves", value: totalSaves.toLocaleString(), sub: <span className="text-[11px] text-muted">All architects</span> },
            { icon: MessageCircle, iconColor: "text-blue", label: "Enquiries", value: totalEnquiries, sub: <span className="text-[11px] text-emerald">Generated</span> },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-2xl border border-border bg-white p-4">
              <div className="flex items-center gap-2 mb-2">
                <kpi.icon size={14} className={kpi.iconColor} />
                <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">{kpi.label}</span>
              </div>
              <p className="text-[24px] font-bold tracking-tight">{kpi.value}</p>
              <div className="mt-1">{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Influence Composite Scoring ─────────────────────────── */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[14px] font-semibold">Influence Composite Score</h3>
              <p className="text-[11px] text-muted mt-0.5">Weighted scoring across 5 influence dimensions</p>
            </div>
            <div className="relative flex items-center justify-center">
              <ScoreRing score={compositeScore} size={64} stroke={5} />
              <span className="absolute text-[16px] font-bold rotate-90">{compositeScore}</span>
            </div>
          </div>
          <div className="space-y-3">
            {influenceComposite.map((m) => (
              <div key={m.label} className="flex items-center gap-4">
                <span className="w-32 text-[12px] text-muted truncate">{m.label}</span>
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

        {/* ── Percentile Rankings ─────────────────────────────────── */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={14} className="text-muted" />
            <h3 className="text-[14px] font-semibold">Percentile Rankings vs Platform</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {architectBenchmarks.map((b) => (
              <div key={b.metric} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-muted">{b.metric}</span>
                  <PercentileBadge value={b.percentile} />
                </div>
                <p className="text-[20px] font-bold">{b.value}{typeof b.value === "number" && b.value < 10 ? "%" : ""}</p>
                <div className="relative h-1.5 rounded-full bg-surface overflow-hidden mt-2">
                  <div className="h-full rounded-full bg-foreground" style={{ width: `${b.percentile}%` }} />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-muted">Avg: {b.categoryAvg}</span>
                  <span className={`text-[10px] font-semibold ${b.delta > 0 ? "text-emerald" : "text-rose"}`}>
                    {b.delta > 0 ? "+" : ""}{b.delta}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Engagement + Spec Funnels ───────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Architect Engagement Funnel */}
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex items-center gap-2 mb-5">
              <Activity size={14} className="text-muted" />
              <h3 className="text-[14px] font-semibold">Architect Engagement Funnel</h3>
            </div>
            <div className="space-y-2">
              {architectFunnel.map((stage, i) => {
                const dropoff = i > 0 ? ((architectFunnel[i - 1].value - stage.value) / architectFunnel[i - 1].value * 100).toFixed(1) : null;
                return (
                  <div key={stage.stage}>
                    {dropoff && parseFloat(dropoff) > 0 && (
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
                      <span className="w-12 text-right text-[12px] font-semibold">{stage.value.toLocaleString()}</span>
                      <span className="w-10 text-right text-[10px] text-muted">{stage.pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-[11px] text-muted">Discovery → Enquiry</span>
              <span className="text-[13px] font-bold">{architectFunnel[architectFunnel.length - 1].pct}%</span>
            </div>
          </div>

          {/* Spec Conversion Pipeline */}
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex items-center gap-2 mb-5">
              <Layers size={14} className="text-muted" />
              <h3 className="text-[14px] font-semibold">Spec Conversion Pipeline</h3>
            </div>
            <div className="space-y-2">
              {specArchitectFunnel.map((stage, i) => {
                const dropoff = i > 0 ? ((specArchitectFunnel[i - 1].value - stage.value) / specArchitectFunnel[i - 1].value * 100).toFixed(1) : null;
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
                      <span className="w-12 text-right text-[12px] font-semibold">{stage.value.toLocaleString()}</span>
                      <span className="w-10 text-right text-[10px] text-muted">{stage.pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-[11px] text-muted">Discovery → Installed</span>
              <span className="text-[13px] font-bold">{specArchitectFunnel[specArchitectFunnel.length - 1].pct}%</span>
            </div>
          </div>
        </div>

        {/* ── Cohort Retention Heatmap ────────────────────────────── */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="flex items-center gap-2 mb-5">
            <Users size={14} className="text-muted" />
            <h3 className="text-[14px] font-semibold">Architect Cohort Retention</h3>
            <span className="text-[11px] text-muted ml-2">% of new architects retained over time</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr>
                  <th className="text-left py-2 px-3 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">Cohort</th>
                  <th className="text-center py-2 px-3 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">New</th>
                  <th className="text-center py-2 px-3 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">1 Month</th>
                  <th className="text-center py-2 px-3 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">3 Months</th>
                  <th className="text-center py-2 px-3 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">6 Months</th>
                  <th className="text-center py-2 px-3 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">Avg Score</th>
                </tr>
              </thead>
              <tbody>
                {architectCohorts.map((c) => (
                  <tr key={c.cohort} className="border-t border-border/50">
                    <td className="py-2.5 px-3 font-semibold">{c.cohort}</td>
                    <td className="text-center py-2.5 px-3">{c.newArchitects}</td>
                    {[c.retained1m, c.retained3m, c.retained6m].map((val, i) => (
                      <td key={i} className="text-center py-2.5 px-3">
                        {val > 0 ? (
                          <span className={`inline-block rounded px-2 py-0.5 text-[11px] font-semibold ${
                            val >= 85 ? "bg-foreground text-white" : val >= 70 ? "bg-foreground/60 text-white" : val >= 55 ? "bg-foreground/20 text-foreground" : "bg-surface text-muted"
                          }`}>
                            {val}%
                          </span>
                        ) : <span className="text-muted">—</span>}
                      </td>
                    ))}
                    <td className="text-center py-2.5 px-3">
                      <span className="font-semibold">{c.avgScore}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Filters ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-border bg-white p-1">
              {["all", "platinum", "gold", "silver"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTierFilter(t)}
                  className={`rounded-md px-3 py-1.5 text-[12px] font-medium capitalize transition-colors ${
                    tierFilter === t ? "bg-foreground text-white" : "text-muted hover:bg-surface"
                  }`}
                >
                  {t === "all" ? "All Tiers" : t}
                </button>
              ))}
            </div>
          </div>
          <span className="text-[11px] text-muted">{filtered.length} architects</span>
        </div>

        {/* ── Sortable Leaderboard Table ──────────────────────────── */}
        <div className="rounded-2xl border border-border bg-white overflow-hidden">
          <table className="w-full table-premium">
            <thead>
              <tr className="bg-surface/50">
                <th className="w-10 text-center">#</th>
                <th>Architect</th>
                <th>Tier</th>
                <th className="cursor-pointer text-center" onClick={() => handleSort("score")}>
                  <span className="inline-flex items-center gap-1">Score <SortIcon col="score" /></span>
                </th>
                <th className="text-center">Pctl</th>
                <th className="cursor-pointer text-right" onClick={() => handleSort("discoveries")}>
                  <span className="inline-flex items-center gap-1">Disc. <SortIcon col="discoveries" /></span>
                </th>
                <th className="cursor-pointer text-right" onClick={() => handleSort("saves")}>
                  <span className="inline-flex items-center gap-1">Saves <SortIcon col="saves" /></span>
                </th>
                <th className="cursor-pointer text-right" onClick={() => handleSort("specs")}>
                  <span className="inline-flex items-center gap-1">Specs <SortIcon col="specs" /></span>
                </th>
                <th className="cursor-pointer text-right" onClick={() => handleSort("enquiries")}>
                  <span className="inline-flex items-center gap-1">Enq. <SortIcon col="enquiries" /></span>
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
                const percentile = Math.round((allScores.filter((s) => s <= arch.influenceScore).length / allScores.length) * 100);
                const vsAvg = arch.influenceScore - avgScore;
                return (
                  <tr
                    key={arch.architectId}
                    className="cursor-pointer hover:bg-surface/50 transition-colors"
                    onClick={() => setSelectedArchitect(arch)}
                  >
                    <td className="text-center"><span className="text-[12px] font-semibold text-muted">{i + 1}</span></td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-surface shrink-0" />
                        <div>
                          <p className="text-[13px] font-medium">{arch.name}</p>
                          <p className="text-[11px] text-muted">{arch.firm}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${tier.bg} ${tier.text}`}>
                        {arch.tier}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-[16px] font-bold">{arch.influenceScore}</span>
                        <div className="w-10 h-1 mt-1 rounded-full bg-surface overflow-hidden">
                          <div className="h-full rounded-full bg-foreground" style={{ width: `${arch.influenceScore}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="text-center">
                      <PercentileBadge value={percentile} />
                    </td>
                    <td className="text-right">
                      <p className="text-[13px] font-medium">{arch.metrics.productDiscoveries.toLocaleString()}</p>
                    </td>
                    <td className="text-right">
                      <p className="text-[13px] font-medium">{arch.metrics.productSaves.toLocaleString()}</p>
                    </td>
                    <td className="text-right">
                      <p className="text-[13px] font-medium">{arch.metrics.specDownloads}</p>
                    </td>
                    <td className="text-right">
                      <p className="text-[13px] font-medium">{arch.metrics.enquiriesGenerated}</p>
                    </td>
                    <td className="text-center">
                      <span className={`text-[12px] font-semibold ${vsAvg > 0 ? "text-emerald" : vsAvg < 0 ? "text-rose" : "text-muted"}`}>
                        {vsAvg > 0 ? "+" : ""}{vsAvg}
                      </span>
                    </td>
                    <td className="hidden xl:table-cell">
                      <div className="flex items-center gap-2">
                        <MiniSparkline data={arch.monthlyTrend.map((d) => d.score)} w={60} h={20} />
                        <span className="text-[10px] font-semibold text-emerald">+{growth}</span>
                      </div>
                    </td>
                    <td><ArrowRight size={14} className="text-muted" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Architect × Product Network Graph ──────────────────── */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="flex items-center gap-2 mb-5">
            <GitBranch size={14} className="text-muted" />
            <h3 className="text-[14px] font-semibold">Architect–Product–Brand Network</h3>
            <span className="text-[11px] text-muted ml-2">Influence relationships</span>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-border bg-surface/30" style={{ height: 420 }}>
            <svg width="100%" height="100%" viewBox="0 0 900 400">
              {/* Edges */}
              {architectInfluenceData.map((arch, ai) => {
                const ax = 100;
                const ay = 60 + ai * 55;
                return arch.topInfluencedProducts.map((p) => {
                  const pi = productMomentumData.findIndex((pm) => pm.productId === p.productId);
                  if (pi === -1) return null;
                  const px = 420;
                  const py = 50 + pi * 42;
                  return (
                    <line key={`${arch.architectId}-${p.productId}`} x1={ax + 20} y1={ay} x2={px - 20} y2={py}
                      stroke="#d4d4d4" strokeWidth={Math.max(p.influence / 40, 0.5)} opacity={0.6} />
                  );
                });
              })}
              {architectInfluenceData.map((arch) =>
                arch.topInfluencedBrands.map((b) => {
                  const bi = brands.findIndex((br) => br.id === b.brandId);
                  if (bi === -1) return null;
                  const prodWithBrand = arch.topInfluencedProducts.find((p) => {
                    const pm = productMomentumData.find((pm) => pm.productId === p.productId);
                    return pm?.brandId === b.brandId;
                  });
                  if (!prodWithBrand) return null;
                  const pi = productMomentumData.findIndex((pm) => pm.productId === prodWithBrand.productId);
                  const px = 420;
                  const py = 50 + (pi === -1 ? 0 : pi) * 42;
                  const bx = 750;
                  const by = 60 + bi * 60;
                  return (
                    <line key={`${prodWithBrand.productId}-${b.brandId}`} x1={px + 20} y1={py} x2={bx - 20} y2={by}
                      stroke="#e5e5e5" strokeWidth={Math.max(b.influence / 50, 0.5)} opacity={0.5} />
                  );
                })
              )}

              {/* Architect nodes */}
              {architectInfluenceData.map((arch, i) => {
                const y = 60 + i * 55;
                return (
                  <g key={arch.architectId}>
                    <circle cx={100} cy={y} r={14 + arch.influenceScore / 20} fill="#0a0a0a" opacity={0.9} />
                    <text x={100} y={y + 1} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
                      {arch.influenceScore}
                    </text>
                    <text x={60} y={y - 18} textAnchor="end" fill="#737373" fontSize="9">
                      {arch.name.split(" ")[0]}
                    </text>
                  </g>
                );
              })}

              {/* Product nodes */}
              {productMomentumData.slice(0, 8).map((p, i) => {
                const y = 50 + i * 42;
                return (
                  <g key={p.productId}>
                    <circle cx={420} cy={y} r={10 + p.momentumScore / 15} fill="#737373" opacity={0.8} />
                    <text x={420} y={y + 1} textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">
                      {p.momentumScore}
                    </text>
                    <text x={420} y={y + 22 + p.momentumScore / 15} textAnchor="middle" fill="#a3a3a3" fontSize="8">
                      {p.productName.split("—")[0].trim().slice(0, 14)}
                    </text>
                  </g>
                );
              })}

              {/* Brand nodes */}
              {brands.slice(0, 6).map((b, i) => {
                const y = 60 + i * 60;
                return (
                  <g key={b.id}>
                    <rect x={730} y={y - 12} width={80} height={24} rx={6} fill="#e5e5e5" />
                    <text x={770} y={y + 3} textAnchor="middle" fill="#525252" fontSize="8" fontWeight="600">
                      {b.name.slice(0, 12)}
                    </text>
                  </g>
                );
              })}

              {/* Legend */}
              <g transform="translate(20, 380)">
                <circle cx={6} cy={0} r={5} fill="#0a0a0a" />
                <text x={16} y={3} fill="#737373" fontSize="9">Architect</text>
                <circle cx={86} cy={0} r={5} fill="#737373" />
                <text x={96} y={3} fill="#737373" fontSize="9">Product</text>
                <rect x={156} y={-5} width={14} height={10} rx={3} fill="#e5e5e5" />
                <text x={176} y={3} fill="#737373" fontSize="9">Brand</text>
              </g>
            </svg>
          </div>
        </div>

        {/* ── Bottom Insights ─────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Tier Distribution */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="text-[13px] font-semibold mb-4">Tier Distribution</h3>
            <div className="space-y-3">
              {(["Platinum", "Gold", "Silver", "Bronze"] as const).map((t) => {
                const count = architectInfluenceData.filter((a) => a.tier === t).length;
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
                architectInfluenceData.forEach((arch) => {
                  arch.topInfluencedProducts.forEach((p) => {
                    if (!productInfluence[p.productId]) productInfluence[p.productId] = { name: p.productName, brand: p.brand, total: 0 };
                    productInfluence[p.productId].total += p.influence;
                  });
                });
                return Object.entries(productInfluence).sort((a, b) => b[1].total - a[1].total).slice(0, 5).map(([id, p], i) => (
                  <div key={id} className="flex items-center gap-3">
                    <span className="w-5 text-center text-[12px] font-semibold text-muted">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium truncate">{p.name}</p>
                      <p className="text-[10px] text-muted">{p.brand}</p>
                    </div>
                    <span className="text-[13px] font-semibold">{p.total}</span>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Fastest Risers */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="text-[13px] font-semibold mb-4">Fastest Rising</h3>
            <div className="space-y-3">
              {[...architectInfluenceData]
                .map((a) => ({ ...a, growth: a.monthlyTrend[a.monthlyTrend.length - 1].score - a.monthlyTrend[0].score }))
                .sort((a, b) => b.growth - a.growth)
                .slice(0, 5)
                .map((arch, i) => (
                  <div key={arch.architectId} className="flex items-center gap-3">
                    <span className="w-5 text-center text-[12px] font-semibold text-muted">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium truncate">{arch.name}</p>
                      <p className="text-[10px] text-muted">{arch.firm}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MiniSparkline data={arch.monthlyTrend.map((d) => d.score)} w={40} h={14} />
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
