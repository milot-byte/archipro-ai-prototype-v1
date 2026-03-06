"use client";

import { useState } from "react";
import { architectInfluenceData, ArchitectInfluence, productMomentumData } from "@/lib/intelligence-data";
import { architects, products, projects } from "@/lib/mock-data";
import {
  Eye,
  Heart,
  Download,
  MessageCircle,
  LayoutGrid,
  FolderOpen,
  ChevronDown,
  ChevronUp,
  Award,
  TrendingUp,
  TrendingDown,
  Crown,
  ArrowRight,
  X,
  BarChart3,
  Users,
  Zap,
  ExternalLink,
  Filter,
} from "lucide-react";

const tierConfig: Record<string, { bg: string; text: string; border: string }> = {
  Platinum: { bg: "bg-foreground", text: "text-white", border: "border-foreground" },
  Gold: { bg: "bg-amber-light", text: "text-amber", border: "border-amber" },
  Silver: { bg: "bg-surface", text: "text-muted", border: "border-border" },
  Bronze: { bg: "bg-amber-light/50", text: "text-amber/60", border: "border-amber/30" },
};

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e5e5" strokeWidth={3} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#0a0a0a" strokeWidth={3} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[20px] font-bold">{score}</span>
    </div>
  );
}

function TrendChart({ data }: { data: { month: string; score: number }[] }) {
  const max = Math.max(...data.map((d) => d.score));
  const min = Math.min(...data.map((d) => d.score));
  const range = max - min || 1;
  const w = 160;
  const h = 48;
  const points = data.map((d, i) => `${(i / (data.length - 1)) * w},${h - ((d.score - min) / range) * (h - 8)}`).join(" ");
  const lastPoint = data[data.length - 1];
  const lastX = w;
  const lastY = h - ((lastPoint.score - min) / range) * (h - 8);

  return (
    <div>
      <svg width={w} height={h} className="overflow-visible">
        <polyline points={points} fill="none" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={lastX} cy={lastY} r="3" fill="#0a0a0a" />
      </svg>
      <div className="flex justify-between mt-1">
        {data.map((d) => (<span key={d.month} className="text-[9px] text-muted">{d.month}</span>))}
      </div>
    </div>
  );
}

function DetailPanel({ arch, onClose }: { arch: ArchitectInfluence; onClose: () => void }) {
  const archData = architects.find((a) => a.id === arch.architectId);
  const tier = tierConfig[arch.tier];
  const totalActivity = arch.metrics.productDiscoveries + arch.metrics.productSaves + arch.metrics.specDownloads + arch.metrics.enquiriesGenerated;
  const conversionRate = ((arch.metrics.enquiriesGenerated / arch.metrics.productDiscoveries) * 100).toFixed(1);
  const archProjects = projects.filter((p) => p.architectId === arch.architectId);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-[480px] border-l border-border bg-white shadow-2xl overflow-y-auto">
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
        {/* Score + Tier */}
        <div className="flex items-center gap-6">
          <ScoreRing score={arch.influenceScore} size={96} />
          <div>
            <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${tier.bg} ${tier.text}`}>{arch.tier} Tier</span>
            <p className="mt-2 text-[12px] text-muted">
              {arch.influenceScore >= 90 ? "Exceptional influence — top 5% of all architects" :
               arch.influenceScore >= 80 ? "High influence — consistently driving product engagement" :
               arch.influenceScore >= 70 ? "Strong influence — growing engagement across the platform" :
               "Building influence — establishing product relationships"}
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
              <span className="text-[11px] text-emerald font-medium">
                +{arch.monthlyTrend[arch.monthlyTrend.length - 1].score - arch.monthlyTrend[0].score} pts over 6 months
              </span>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted mb-3">Performance Metrics</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Eye, label: "Product Discoveries", value: arch.metrics.productDiscoveries },
              { icon: Heart, label: "Product Saves", value: arch.metrics.productSaves },
              { icon: Download, label: "Spec Downloads", value: arch.metrics.specDownloads },
              { icon: MessageCircle, label: "Enquiries Generated", value: arch.metrics.enquiriesGenerated },
              { icon: LayoutGrid, label: "Boards Created", value: arch.metrics.boardsCreated },
              { icon: FolderOpen, label: "Projects Published", value: arch.metrics.projectsPublished },
            ].map((m) => (
              <div key={m.label} className="rounded-xl border border-border p-3">
                <m.icon size={13} className="text-muted" />
                <p className="mt-2 text-[18px] font-semibold">{m.value.toLocaleString()}</p>
                <p className="text-[11px] text-muted">{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted mb-3">Conversion Benchmarks</p>
          <div className="space-y-3">
            {[
              { label: "Discovery → Save", value: ((arch.metrics.productSaves / arch.metrics.productDiscoveries) * 100).toFixed(1), benchmark: "28" },
              { label: "Discovery → Enquiry", value: conversionRate, benchmark: "3.5" },
              { label: "Save → Spec Download", value: ((arch.metrics.specDownloads / arch.metrics.productSaves) * 100).toFixed(1), benchmark: "55" },
            ].map((b) => (
              <div key={b.label} className="flex items-center justify-between">
                <span className="text-[12px] text-muted">{b.label}</span>
                <div className="flex items-center gap-3">
                  <div className="w-28 h-1.5 rounded-full bg-surface overflow-hidden">
                    <div className="h-full rounded-full bg-foreground" style={{ width: `${Math.min(parseFloat(b.value), 100)}%` }} />
                  </div>
                  <span className="text-[13px] font-semibold w-14 text-right">{b.value}%</span>
                  <span className="text-[10px] text-muted w-16">avg {b.benchmark}%</span>
                </div>
              </div>
            ))}
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

export default function InfluencePage() {
  const [selectedArchitect, setSelectedArchitect] = useState<ArchitectInfluence | null>(null);
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"score" | "discoveries" | "enquiries" | "growth">("score");

  const totalDiscoveries = architectInfluenceData.reduce((a, b) => a + b.metrics.productDiscoveries, 0);
  const totalEnquiries = architectInfluenceData.reduce((a, b) => a + b.metrics.enquiriesGenerated, 0);
  const totalSaves = architectInfluenceData.reduce((a, b) => a + b.metrics.productSaves, 0);
  const avgScore = Math.round(architectInfluenceData.reduce((a, b) => a + b.influenceScore, 0) / architectInfluenceData.length);
  const platinumCount = architectInfluenceData.filter((a) => a.tier === "Platinum").length;
  const goldCount = architectInfluenceData.filter((a) => a.tier === "Gold").length;

  let filtered = tierFilter === "all" ? [...architectInfluenceData] : architectInfluenceData.filter((a) => a.tier.toLowerCase() === tierFilter);
  filtered.sort((a, b) => {
    if (sortBy === "score") return b.influenceScore - a.influenceScore;
    if (sortBy === "discoveries") return b.metrics.productDiscoveries - a.metrics.productDiscoveries;
    if (sortBy === "enquiries") return b.metrics.enquiriesGenerated - a.metrics.enquiriesGenerated;
    const aGrowth = a.monthlyTrend[a.monthlyTrend.length - 1].score - a.monthlyTrend[0].score;
    const bGrowth = b.monthlyTrend[b.monthlyTrend.length - 1].score - b.monthlyTrend[0].score;
    return bGrowth - aGrowth;
  });

  return (
    <div className="min-h-screen bg-surface/50">
      {/* Header */}
      <div className="border-b border-border bg-white px-8 py-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">Intelligence</p>
            <h1 className="mt-1 text-[28px] font-semibold tracking-tight">Architect Influence</h1>
            <p className="mt-1 text-[13px] text-muted max-w-xl">
              Measuring how architects drive product discovery, specification, and conversion across ArchiPro.
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
        {/* KPI Strip */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <div className="rounded-2xl border border-border bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users size={14} className="text-muted" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">Tracked</span>
            </div>
            <p className="text-[24px] font-bold tracking-tight">{architectInfluenceData.length}</p>
            <p className="text-[11px] text-muted mt-1">{platinumCount} platinum · {goldCount} gold</p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown size={14} className="text-amber" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">Avg Score</span>
            </div>
            <p className="text-[24px] font-bold tracking-tight">{avgScore}</p>
            <div className="mt-1 h-1 rounded-full bg-surface overflow-hidden">
              <div className="h-full rounded-full bg-foreground" style={{ width: `${avgScore}%` }} />
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye size={14} className="text-muted" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">Discoveries</span>
            </div>
            <p className="text-[24px] font-bold tracking-tight">{totalDiscoveries.toLocaleString()}</p>
            <p className="text-[11px] text-emerald mt-1">Products surfaced</p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart size={14} className="text-rose" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">Total Saves</span>
            </div>
            <p className="text-[24px] font-bold tracking-tight">{totalSaves.toLocaleString()}</p>
            <p className="text-[11px] text-muted mt-1">Across all architects</p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle size={14} className="text-blue" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">Enquiries</span>
            </div>
            <p className="text-[24px] font-bold tracking-tight">{totalEnquiries}</p>
            <p className="text-[11px] text-emerald mt-1">Generated by architects</p>
          </div>
        </div>

        {/* Filters */}
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
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-lg border border-border bg-white px-3 py-2 text-[12px] text-muted"
          >
            <option value="score">Sort: Influence Score</option>
            <option value="discoveries">Sort: Discoveries</option>
            <option value="enquiries">Sort: Enquiries</option>
            <option value="growth">Sort: Growth Rate</option>
          </select>
        </div>

        {/* Leaderboard Table */}
        <div className="rounded-2xl border border-border bg-white overflow-hidden">
          <table className="w-full table-premium">
            <thead>
              <tr className="bg-surface/50">
                <th className="w-10 text-center">#</th>
                <th>Architect</th>
                <th>Tier</th>
                <th className="text-center">Score</th>
                <th className="text-right">Discoveries</th>
                <th className="text-right">Saves</th>
                <th className="text-right">Specs</th>
                <th className="text-right">Enquiries</th>
                <th className="hidden xl:table-cell">6m Trend</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((arch, i) => {
                const tier = tierConfig[arch.tier];
                const growth = arch.monthlyTrend[arch.monthlyTrend.length - 1].score - arch.monthlyTrend[0].score;
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
                    <td className="hidden xl:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="flex items-end gap-[2px] h-6">
                          {arch.monthlyTrend.map((d) => (
                            <div key={d.month} className="flex-1 w-3 rounded-t-[1px] bg-foreground" style={{ height: `${(d.score / 100) * 24}px` }} />
                          ))}
                        </div>
                        <span className={`text-[10px] font-semibold ${growth > 0 ? "text-emerald" : "text-muted"}`}>
                          +{growth}
                        </span>
                      </div>
                    </td>
                    <td><ArrowRight size={14} className="text-muted" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Insights */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Tier Distribution */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="text-[13px] font-semibold mb-4">Tier Distribution</h3>
            <div className="space-y-3">
              {(["Platinum", "Gold", "Silver", "Bronze"] as const).map((tier) => {
                const count = architectInfluenceData.filter((a) => a.tier === tier).length;
                const pct = Math.round((count / architectInfluenceData.length) * 100);
                const tc = tierConfig[tier];
                return (
                  <div key={tier} className="flex items-center gap-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold w-16 justify-center ${tc.bg} ${tc.text}`}>{tier}</span>
                    <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
                      <div className="h-full rounded-full bg-foreground transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[12px] font-medium w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Products Influenced */}
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
                return Object.entries(productInfluence).sort((a, b) => b[1].total - a[1].total).slice(0, 4).map(([id, p], i) => (
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
            <h3 className="text-[13px] font-semibold mb-4">Fastest Rising Architects</h3>
            <div className="space-y-3">
              {[...architectInfluenceData]
                .map((a) => ({ ...a, growth: a.monthlyTrend[a.monthlyTrend.length - 1].score - a.monthlyTrend[0].score }))
                .sort((a, b) => b.growth - a.growth)
                .slice(0, 4)
                .map((arch, i) => (
                  <div key={arch.architectId} className="flex items-center gap-3">
                    <span className="w-5 text-center text-[12px] font-semibold text-muted">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium truncate">{arch.name}</p>
                      <p className="text-[10px] text-muted">{arch.firm}</p>
                    </div>
                    <span className="text-[12px] font-semibold text-emerald">+{arch.growth} pts</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedArchitect && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setSelectedArchitect(null)} />
          <DetailPanel arch={selectedArchitect} onClose={() => setSelectedArchitect(null)} />
        </>
      )}
    </div>
  );
}
