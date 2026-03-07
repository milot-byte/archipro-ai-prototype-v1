"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, Eye, Download, Heart, MessageSquare,
  Layers, Activity, ArrowRight, Flame, Crown, FolderKanban,
  ClipboardList, ChevronRight, ArrowUpRight, ArrowDownRight,
  BarChart3, Zap, Package, Users, Building2, Target, GitBranch
} from "lucide-react";
import { analyticsData, projects, products, architects, brands } from "@/lib/mock-data";
import {
  activityFeed, productMomentumData, architectInfluenceData,
  designBoards, specifications
} from "@/lib/intelligence-data";

// ─── Cohort data ────────────────────────────────────────────────────────────
const cohortData = [
  { week: "W47", newUsers: 42, retained1w: 31, retained2w: 24, retained4w: 18, specConversion: 8 },
  { week: "W48", newUsers: 56, retained1w: 38, retained2w: 28, retained4w: 21, specConversion: 12 },
  { week: "W49", newUsers: 48, retained1w: 35, retained2w: 27, retained4w: 19, specConversion: 10 },
  { week: "W50", newUsers: 63, retained1w: 46, retained2w: 34, retained4w: 0, specConversion: 15 },
  { week: "W51", newUsers: 71, retained1w: 52, retained2w: 0, retained4w: 0, specConversion: 18 },
  { week: "W52", newUsers: 68, retained1w: 0, retained2w: 0, retained4w: 0, specConversion: 14 },
];

// ─── Engagement funnel ──────────────────────────────────────────────────────
const engagementFunnel = [
  { stage: "Product Views", value: 24830, pct: 100 },
  { stage: "Product Saves", value: 1457, pct: 5.87 },
  { stage: "Board Additions", value: 834, pct: 3.36 },
  { stage: "Spec Downloads", value: 612, pct: 2.46 },
  { stage: "Enquiries Sent", value: 168, pct: 0.68 },
  { stage: "Orders Placed", value: 42, pct: 0.17 },
];

// ─── Spec conversion funnel ─────────────────────────────────────────────────
const specFunnel = [
  { stage: "Boards Created", value: designBoards.length, pct: 100 },
  { stage: "Products Selected", value: 24, pct: 80 },
  { stage: "Spec Generated", value: specifications.length, pct: 50 },
  { stage: "Under Review", value: specifications.filter(s => s.status === "review").length, pct: 16.7 },
  { stage: "Approved", value: specifications.filter(s => s.status === "approved").length, pct: 16.7 },
  { stage: "Items Installed", value: 7, pct: 11.7 },
];

// ─── Percentile rankings ────────────────────────────────────────────────────
const percentileMetrics = [
  { metric: "Product Views", value: 24830, percentile: 87, categoryAvg: 18200, delta: 36 },
  { metric: "Save Rate", value: "5.87%", percentile: 72, categoryAvg: "4.2%", delta: 39 },
  { metric: "Spec Downloads", value: 612, percentile: 91, categoryAvg: 420, delta: 46 },
  { metric: "Enquiry Rate", value: "0.68%", percentile: 65, categoryAvg: "0.82%", delta: -17 },
  { metric: "Architect Reach", value: 6, percentile: 94, categoryAvg: 3.2, delta: 88 },
  { metric: "Board Density", value: "4.0 items", percentile: 78, categoryAvg: "3.1 items", delta: 29 },
];

// ─── Growth momentum scoring ────────────────────────────────────────────────
const growthScores = [
  { metric: "Views Velocity", score: 82, trend: [64, 68, 71, 75, 78, 82] },
  { metric: "Save Acceleration", score: 76, trend: [58, 62, 66, 70, 73, 76] },
  { metric: "Spec Conversion", score: 68, trend: [52, 56, 58, 62, 65, 68] },
  { metric: "Architect Engagement", score: 91, trend: [72, 78, 82, 86, 89, 91] },
  { metric: "Brand Activity", score: 74, trend: [60, 64, 67, 70, 72, 74] },
];
const overallGrowthScore = Math.round(growthScores.reduce((s, g) => s + g.score, 0) / growthScores.length);

function MiniSparkline({ data, color = "#0a0a0a" }: { data: number[]; color?: string }) {
  const max = Math.max(...data); const min = Math.min(...data); const range = max - min || 1;
  const w = 64; const h = 20;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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

export default function HomePage() {
  const [timeRange, setTimeRange] = useState("30d");

  const totalViews = analyticsData.views;
  const totalSaves = productMomentumData.reduce((s, p) => s + p.metrics.saves, 0);
  const totalEnquiries = architectInfluenceData.reduce((s, a) => s + a.metrics.enquiriesGenerated, 0);
  const recentActivity = activityFeed.slice(0, 6);
  const topMomentum = productMomentumData.slice(0, 5);

  return (
    <div className="min-h-screen bg-surface/50">
      <div className="border-b border-border bg-white px-8 py-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">Good morning, Sarah</p>
            <h1 className="mt-1 text-[28px] font-semibold tracking-tight">Intelligence Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            {["7d", "30d", "90d", "YTD"].map(p => (
              <button key={p} onClick={() => setTimeRange(p)} className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors ${p === timeRange ? "bg-foreground text-white" : "text-muted hover:bg-surface"}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Growth Momentum Score + KPIs */}
        <div className="grid grid-cols-6 gap-4">
          {/* Growth Momentum Score — large card */}
          <div className="col-span-2 rounded-2xl border border-border bg-white p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} className="text-amber" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">Growth Momentum Score</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                <svg width={80} height={80} className="-rotate-90">
                  <circle cx={40} cy={40} r={34} fill="none" stroke="#e5e5e5" strokeWidth={4} />
                  <circle cx={40} cy={40} r={34} fill="none" stroke="#0a0a0a" strokeWidth={4} strokeDasharray={213.6} strokeDashoffset={213.6 - (overallGrowthScore / 100) * 213.6} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[22px] font-bold">{overallGrowthScore}</span>
              </div>
              <div className="flex-1 space-y-1.5">
                {growthScores.map(g => (
                  <div key={g.metric} className="flex items-center gap-2">
                    <span className="text-[10px] text-muted w-28 truncate">{g.metric}</span>
                    <div className="flex-1 h-1 rounded-full bg-surface overflow-hidden">
                      <div className="h-full rounded-full bg-foreground" style={{ width: `${g.score}%` }} />
                    </div>
                    <span className="text-[10px] font-semibold w-6 text-right">{g.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* KPIs */}
          {[
            { label: "Product Views", value: totalViews.toLocaleString(), change: 12.3, icon: Eye, percentile: 87 },
            { label: "Products Saved", value: totalSaves.toLocaleString(), change: 18.5, icon: Heart, percentile: 72 },
            { label: "Enquiries", value: totalEnquiries.toString(), change: 8.7, icon: MessageSquare, percentile: 65 },
            { label: "Active Projects", value: projects.length.toString(), change: 33.3, icon: FolderKanban, percentile: 94 },
          ].map(kpi => (
            <div key={kpi.label} className="rounded-2xl border border-border bg-white p-4">
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-surface p-2"><kpi.icon size={14} className="text-muted" /></div>
                <span className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${kpi.change >= 0 ? "bg-emerald-light text-emerald" : "bg-rose-light text-rose"}`}>
                  {kpi.change >= 0 ? <ArrowUpRight size={9} /> : <ArrowDownRight size={9} />}{kpi.change}%
                </span>
              </div>
              <p className="mt-3 text-[22px] font-semibold tracking-tight leading-none">{kpi.value}</p>
              <p className="mt-1 text-[11px] text-muted">{kpi.label}</p>
              <div className="mt-2 flex items-center gap-1.5">
                <div className="flex-1 h-1 rounded-full bg-surface overflow-hidden">
                  <div className="h-full rounded-full bg-foreground/40" style={{ width: `${kpi.percentile}%` }} />
                </div>
                <span className="text-[9px] font-semibold text-muted">P{kpi.percentile}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Engagement Funnel + Spec Conversion Funnel */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[14px] font-semibold">Engagement Funnel</h3>
                <p className="text-[11px] text-muted">View → Save → Board → Spec → Enquiry → Order</p>
              </div>
              <span className="text-[10px] font-semibold text-muted">0.17% full conversion</span>
            </div>
            <div className="space-y-2">
              {engagementFunnel.map((step, i) => {
                const prevStep = i > 0 ? engagementFunnel[i - 1] : null;
                const dropoff = prevStep ? ((1 - step.value / prevStep.value) * 100).toFixed(0) : null;
                return (
                  <div key={step.stage}>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-medium">{step.stage}</span>
                      <div className="flex items-center gap-3">
                        {dropoff && <span className="text-[10px] text-rose">-{dropoff}%</span>}
                        <span className="font-semibold w-16 text-right">{step.value.toLocaleString()}</span>
                        <span className="text-muted w-12 text-right">{step.pct}%</span>
                      </div>
                    </div>
                    <div className="h-5 rounded bg-surface overflow-hidden">
                      <div className={`h-full rounded transition-all ${i === 0 ? "bg-foreground" : i < 3 ? "bg-foreground/70" : i < 5 ? "bg-foreground/50" : "bg-foreground/30"}`} style={{ width: `${step.pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[14px] font-semibold">Specification Conversion</h3>
                <p className="text-[11px] text-muted">Board → Selection → Spec → Review → Approve → Install</p>
              </div>
              <span className="text-[10px] font-semibold text-muted">{specifications.filter(s => s.status === "approved").length}/{specifications.length} approved</span>
            </div>
            <div className="space-y-2">
              {specFunnel.map((step, i) => {
                const prevStep = i > 0 ? specFunnel[i - 1] : null;
                const dropoff = prevStep && prevStep.value > 0 ? ((1 - step.value / prevStep.value) * 100).toFixed(0) : null;
                return (
                  <div key={step.stage}>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-medium">{step.stage}</span>
                      <div className="flex items-center gap-3">
                        {dropoff && <span className="text-[10px] text-rose">-{dropoff}%</span>}
                        <span className="font-semibold w-10 text-right">{step.value}</span>
                      </div>
                    </div>
                    <div className="h-5 rounded bg-surface overflow-hidden">
                      <div className={`h-full rounded transition-all ${i < 2 ? "bg-emerald" : i < 4 ? "bg-amber" : "bg-foreground"}`} style={{ width: `${step.pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cohort Retention + Percentile Rankings */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Cohort Retention Heatmap */}
          <div className="rounded-2xl border border-border bg-white p-6">
            <h3 className="text-[14px] font-semibold mb-1">Cohort Retention</h3>
            <p className="text-[11px] text-muted mb-4">Weekly user cohorts — retention rate over time</p>
            <table className="w-full">
              <thead>
                <tr className="text-[10px] font-semibold text-muted uppercase tracking-wider">
                  <th className="text-left pb-2 pr-2">Cohort</th>
                  <th className="text-center pb-2">New</th>
                  <th className="text-center pb-2">1 Week</th>
                  <th className="text-center pb-2">2 Week</th>
                  <th className="text-center pb-2">4 Week</th>
                  <th className="text-center pb-2">Spec Conv.</th>
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
                    if (val >= 30) return "bg-foreground/30 text-foreground";
                    return "bg-foreground/10 text-muted";
                  };
                  return (
                    <tr key={c.week}>
                      <td className="py-1 pr-2 text-[11px] font-semibold">{c.week}</td>
                      <td className="py-1 px-1 text-center">
                        <div className="rounded h-7 flex items-center justify-center bg-surface text-[11px] font-semibold">{c.newUsers}</div>
                      </td>
                      <td className="py-1 px-1 text-center">
                        <div className={`rounded h-7 flex items-center justify-center text-[11px] font-semibold ${cellClass(ret1)}`}>{ret1 !== null ? `${ret1}%` : "—"}</div>
                      </td>
                      <td className="py-1 px-1 text-center">
                        <div className={`rounded h-7 flex items-center justify-center text-[11px] font-semibold ${cellClass(ret2)}`}>{ret2 !== null ? `${ret2}%` : "—"}</div>
                      </td>
                      <td className="py-1 px-1 text-center">
                        <div className={`rounded h-7 flex items-center justify-center text-[11px] font-semibold ${cellClass(ret4)}`}>{ret4 !== null ? `${ret4}%` : "—"}</div>
                      </td>
                      <td className="py-1 px-1 text-center">
                        <div className={`rounded h-7 flex items-center justify-center text-[11px] font-semibold ${cellClass(specRate)}`}>{specRate !== null ? `${specRate}%` : "—"}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Percentile Rankings */}
          <div className="rounded-2xl border border-border bg-white p-6">
            <h3 className="text-[14px] font-semibold mb-1">Percentile Rankings</h3>
            <p className="text-[11px] text-muted mb-4">Your performance vs platform category averages</p>
            <div className="space-y-3">
              {percentileMetrics.map(m => (
                <div key={m.metric}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-medium">{m.metric}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-muted">Avg: {String(m.categoryAvg)}</span>
                      <span className="font-semibold">{String(m.value)}</span>
                      <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${m.delta >= 0 ? "text-emerald" : "text-rose"}`}>
                        {m.delta >= 0 ? "+" : ""}{m.delta}%
                      </span>
                    </div>
                  </div>
                  <div className="relative h-3 rounded-full bg-surface overflow-hidden">
                    <div className="h-full rounded-full bg-foreground/20" style={{ width: "100%" }} />
                    {/* Category average marker */}
                    <div className="absolute top-0 h-full w-0.5 bg-rose/60" style={{ left: `${(Number(String(m.categoryAvg).replace(/[^0-9.]/g, "")) / Number(String(m.value).replace(/[^0-9.]/g, "")) * m.percentile) || 50}%` }} />
                    {/* User position */}
                    <div className="absolute top-0 h-full rounded-full bg-foreground" style={{ width: `${m.percentile}%` }} />
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[9px] text-muted">0th</span>
                    <span className="text-[9px] font-semibold">P{m.percentile}</span>
                    <span className="text-[9px] text-muted">100th</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Architect-Product Network Graph */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[14px] font-semibold">Architect–Product Influence Network</h3>
              <p className="text-[11px] text-muted">Relationship strength between architects, products, and brands</p>
            </div>
            <div className="flex items-center gap-4 text-[10px]">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-foreground" />Architects</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-foreground/50" />Products</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-foreground/20" />Brands</span>
            </div>
          </div>
          <div className="relative h-[320px] rounded-xl bg-surface/30 overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 900 320">
              {/* Edges */}
              {architectInfluenceData.map(arch =>
                arch.topInfluencedProducts.slice(0, 2).map(prod => {
                  const archIdx = architectInfluenceData.indexOf(arch);
                  const prodMom = productMomentumData.find(p => p.productId === prod.productId);
                  const prodIdx = prodMom ? productMomentumData.indexOf(prodMom) : 0;
                  const ax = 80 + archIdx * 140; const ay = 60 + (archIdx % 2) * 40;
                  const px = 120 + prodIdx * 95; const py = 200 + (prodIdx % 3) * 30;
                  return (
                    <line key={`${arch.architectId}-${prod.productId}`} x1={ax} y1={ay} x2={px} y2={py}
                      stroke="#0a0a0a" strokeWidth={prod.influence / 40} strokeOpacity={0.15} />
                  );
                })
              )}
              {/* Product → Brand edges */}
              {productMomentumData.slice(0, 6).map((prod, i) => {
                const brandIdx = brands.findIndex(b => b.id === prod.brandId);
                const px = 120 + i * 95; const py = 200 + (i % 3) * 30;
                const bx = 130 + brandIdx * 130; const by = 290;
                return (
                  <line key={`prod-brand-${prod.productId}`} x1={px} y1={py} x2={bx} y2={by}
                    stroke="#0a0a0a" strokeWidth={1} strokeOpacity={0.08} />
                );
              })}
              {/* Architect nodes */}
              {architectInfluenceData.map((arch, i) => {
                const x = 80 + i * 140; const y = 60 + (i % 2) * 40;
                const r = 14 + (arch.influenceScore / 100) * 10;
                return (
                  <g key={arch.architectId}>
                    <circle cx={x} cy={y} r={r} fill="#0a0a0a" />
                    <text x={x} y={y + 1} textAnchor="middle" fill="white" fontSize="8" fontWeight="600">{arch.name.split(" ")[1]?.slice(0, 3) || arch.name.slice(0, 3)}</text>
                    <text x={x} y={y + r + 12} textAnchor="middle" fill="#737373" fontSize="9">{arch.influenceScore}</text>
                  </g>
                );
              })}
              {/* Product nodes */}
              {productMomentumData.slice(0, 6).map((prod, i) => {
                const x = 120 + i * 95; const y = 200 + (i % 3) * 30;
                const r = 8 + (prod.momentumScore / 100) * 8;
                return (
                  <g key={prod.productId}>
                    <circle cx={x} cy={y} r={r} fill="#0a0a0a" fillOpacity={0.5} />
                    <text x={x} y={y + r + 10} textAnchor="middle" fill="#737373" fontSize="8">{prod.productName.split(" ").slice(-1)[0]}</text>
                  </g>
                );
              })}
              {/* Brand nodes */}
              {brands.map((brand, i) => {
                const x = 130 + i * 130; const y = 290;
                return (
                  <g key={brand.id}>
                    <rect x={x - 16} y={y - 8} width={32} height={16} rx={4} fill="#0a0a0a" fillOpacity={0.15} />
                    <text x={x} y={y + 3} textAnchor="middle" fill="#737373" fontSize="7" fontWeight="600">{brand.name.split(" ")[0].slice(0, 6)}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Activity + Momentum Table */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Live Activity */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-white">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald" />
                </div>
                <h2 className="text-[14px] font-semibold">Live Activity</h2>
              </div>
              <Link href="/activity" className="flex items-center gap-1 text-[12px] font-medium text-muted hover:text-foreground">View all <ArrowRight size={12} /></Link>
            </div>
            <div className="divide-y divide-border">
              {recentActivity.map(event => {
                const Icon = activityIcons[event.type] || Activity;
                return (
                  <div key={event.id} className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-surface/50">
                    <div className="mt-0.5 rounded-lg bg-surface p-1.5"><Icon size={12} className="text-muted" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] leading-relaxed">
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
                      <p className="mt-0.5 text-[10px] text-muted">{formatTime(event.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Product Momentum with percentile */}
          <div className="lg:col-span-3 rounded-2xl border border-border bg-white">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2.5">
                <Flame size={16} className="text-rose" />
                <h2 className="text-[14px] font-semibold">Product Momentum</h2>
              </div>
              <Link href="/momentum" className="flex items-center gap-1 text-[12px] font-medium text-muted hover:text-foreground">Full report <ArrowRight size={12} /></Link>
            </div>
            <table className="w-full table-premium">
              <thead>
                <tr>
                  <th className="w-8 text-center">#</th>
                  <th>Product</th>
                  <th>Trend</th>
                  <th className="text-right">Score</th>
                  <th className="text-right">Views</th>
                  <th className="text-center">Ptile</th>
                  <th className="hidden xl:table-cell">7d</th>
                </tr>
              </thead>
              <tbody>
                {topMomentum.map((p, i) => {
                  const trend = trendConfig[p.trend];
                  const allScores = productMomentumData.map(pm => pm.momentumScore).sort((a, b) => a - b);
                  const ptile = Math.round((allScores.filter(s => s <= p.momentumScore).length / allScores.length) * 100);
                  return (
                    <tr key={p.productId}>
                      <td className="text-center text-[12px] font-semibold text-muted">{i + 1}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-surface shrink-0" />
                          <div>
                            <p className="text-[12px] font-medium">{p.productName}</p>
                            <p className="text-[10px] text-muted">{p.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${trend.bg} ${trend.color}`}>{trend.label}</span></td>
                      <td className="text-right"><span className="text-[14px] font-semibold">{p.momentumScore}</span></td>
                      <td className="text-right">
                        <div><span className="text-[12px]">{p.metrics.views.toLocaleString()}</span></div>
                        <span className="text-[10px] text-emerald">+{p.metrics.viewsGrowth}%</span>
                      </td>
                      <td className="text-center">
                        <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${ptile >= 90 ? "bg-foreground text-white" : ptile >= 75 ? "bg-foreground/20 text-foreground" : "bg-surface text-muted"}`}>P{ptile}</span>
                      </td>
                      <td className="hidden xl:table-cell"><MiniSparkline data={p.weeklyData.map(d => d.views)} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom row: Specs + Architects + Boards */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-white p-5">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList size={15} className="text-muted" />
              <h2 className="text-[14px] font-semibold">Specification Progress</h2>
            </div>
            <div className="space-y-4">
              {specifications.map(spec => {
                const totalItems = spec.rooms.reduce((s, r) => s + r.items.length, 0);
                const installed = spec.rooms.reduce((s, r) => s + r.items.filter(i => i.status === "installed").length, 0);
                const delivered = spec.rooms.reduce((s, r) => s + r.items.filter(i => i.status === "delivered").length, 0);
                const progress = Math.round(((installed + delivered * 0.7) / totalItems) * 100);
                return (
                  <Link key={spec.id} href={`/specifications/${spec.id}`} className="block group">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[13px] font-medium group-hover:underline">{spec.projectName}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        spec.status === "approved" ? "bg-emerald-light text-emerald" : spec.status === "review" ? "bg-amber-light text-amber" : "bg-surface text-muted"
                      }`}>{spec.status}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full bg-surface overflow-hidden">
                        <div className="h-full rounded-full bg-foreground" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-[11px] font-medium text-muted">{progress}%</span>
                    </div>
                    <p className="mt-1 text-[10px] text-muted">{totalItems} items · {spec.rooms.length} rooms · {installed} installed</p>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2"><Crown size={15} className="text-amber" /><h2 className="text-[14px] font-semibold">Top Architects</h2></div>
              <Link href="/influence" className="flex items-center gap-1 text-[12px] font-medium text-muted hover:text-foreground">Leaderboard <ArrowRight size={12} /></Link>
            </div>
            <div className="divide-y divide-border">
              {architectInfluenceData.slice(0, 4).map((arch, i) => (
                <div key={arch.architectId} className="flex items-center gap-3 px-5 py-3">
                  <span className="w-4 text-center text-[12px] font-semibold text-muted">{i + 1}</span>
                  <div className="h-9 w-9 rounded-full bg-surface shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium">{arch.name}</p>
                    <p className="text-[10px] text-muted">{arch.firm}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[15px] font-semibold">{arch.influenceScore}</p>
                    <span className={`text-[9px] font-medium ${arch.tier === "Platinum" ? "text-foreground" : "text-amber"}`}>{arch.tier}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2"><Layers size={15} className="text-muted" /><h2 className="text-[14px] font-semibold">Recent Boards</h2></div>
              <Link href="/boards" className="text-[12px] font-medium text-muted hover:text-foreground">View all</Link>
            </div>
            <div className="space-y-2.5">
              {designBoards.slice(0, 4).map(board => (
                <Link key={board.id} href={`/boards/${board.id}`} className="flex items-center gap-3 rounded-lg p-2 -mx-2 transition-colors hover:bg-surface/50">
                  <div className="flex -space-x-1.5">
                    {board.productIds.slice(0, 3).map((_, j) => (
                      <div key={j} className="h-7 w-7 rounded-md border-2 border-white bg-surface" />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium truncate">{board.name}</p>
                    <p className="text-[10px] text-muted">{board.productIds.length} products</p>
                  </div>
                  <ChevronRight size={14} className="text-muted" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
