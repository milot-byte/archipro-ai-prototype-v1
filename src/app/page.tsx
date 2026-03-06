"use client";

import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Download,
  Heart,
  MessageSquare,
  Layers,
  Activity,
  ArrowRight,
  Flame,
  Crown,
  FolderKanban,
  ClipboardList,
  ChevronRight,
} from "lucide-react";
import { analyticsData, projects } from "@/lib/mock-data";
import {
  activityFeed,
  productMomentumData,
  architectInfluenceData,
  designBoards,
  specifications,
} from "@/lib/intelligence-data";

function StatCard({
  label,
  value,
  change,
  icon: Icon,
  suffix,
}: {
  label: string;
  value: string;
  change: number;
  icon: React.ElementType;
  suffix?: string;
}) {
  const positive = change >= 0;
  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <div className="flex items-start justify-between">
        <div className="rounded-xl bg-surface p-2.5">
          <Icon size={18} className="text-muted" />
        </div>
        <div
          className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${
            positive ? "bg-emerald-light text-emerald" : "bg-rose-light text-rose"
          }`}
        >
          {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {positive ? "+" : ""}
          {change}%
        </div>
      </div>
      <div className="mt-4">
        <p className="text-[28px] font-semibold tracking-tight leading-none">
          {value}
          {suffix && <span className="text-[18px] text-muted font-normal ml-0.5">{suffix}</span>}
        </p>
        <p className="mt-1.5 text-[12px] text-muted">{label}</p>
      </div>
    </div>
  );
}

function MiniSparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={points} fill="none" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatTime(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const activityIcons: Record<string, React.ElementType> = {
  product_saved: Heart,
  spec_downloaded: Download,
  board_add: Layers,
  website_visit: Eye,
  enquiry: MessageSquare,
  project_tagged: FolderKanban,
};

const trendConfig: Record<string, { label: string; color: string; bg: string }> = {
  surging: { label: "Surging", color: "text-rose", bg: "bg-rose-light" },
  rising: { label: "Rising", color: "text-emerald", bg: "bg-emerald-light" },
  steady: { label: "Steady", color: "text-blue", bg: "bg-blue-light" },
  cooling: { label: "Cooling", color: "text-muted", bg: "bg-surface" },
};

export default function HomePage() {
  const recentActivity = activityFeed.slice(0, 8);
  const topMomentum = productMomentumData.slice(0, 5);
  const topArchitects = architectInfluenceData.slice(0, 4);

  const totalViews = analyticsData.views;
  const totalSaves = productMomentumData.reduce((s, p) => s + p.metrics.saves, 0);
  const totalEnquiries = architectInfluenceData.reduce((s, a) => s + a.metrics.enquiriesGenerated, 0);
  const activeProjects = projects.length;

  return (
    <div className="min-h-screen bg-surface/50">
      {/* Header */}
      <div className="border-b border-border bg-white px-8 py-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">
              Good morning, Sarah
            </p>
            <h1 className="mt-1 text-[28px] font-semibold tracking-tight leading-tight">
              Intelligence Home
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {["7d", "30d", "90d", "YTD"].map((p) => (
              <button
                key={p}
                className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  p === "30d" ? "bg-foreground text-white" : "text-muted hover:bg-surface"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* KPI Row */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Product Views" value={totalViews.toLocaleString()} change={12.3} icon={Eye} />
          <StatCard label="Products Saved" value={totalSaves.toLocaleString()} change={18.5} icon={Heart} />
          <StatCard label="Enquiries Generated" value={totalEnquiries.toString()} change={8.7} icon={MessageSquare} />
          <StatCard label="Active Projects" value={activeProjects.toString()} change={33.3} icon={FolderKanban} />
        </div>

        {/* Two column: Activity + Momentum */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Live Activity Feed */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-white">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald" />
                </div>
                <h2 className="text-[14px] font-semibold">Live Activity</h2>
              </div>
              <Link href="/activity" className="flex items-center gap-1 text-[12px] font-medium text-muted hover:text-foreground">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recentActivity.map((event) => {
                const Icon = activityIcons[event.type] || Activity;
                return (
                  <div key={event.id} className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-surface/50">
                    <div className="mt-0.5 rounded-lg bg-surface p-1.5">
                      <Icon size={13} className="text-muted" />
                    </div>
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
                      <p className="mt-0.5 text-[11px] text-muted">{formatTime(event.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Product Momentum */}
          <div className="lg:col-span-3 rounded-2xl border border-border bg-white">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2.5">
                <Flame size={16} className="text-rose" />
                <h2 className="text-[14px] font-semibold">Product Momentum</h2>
              </div>
              <Link href="/momentum" className="flex items-center gap-1 text-[12px] font-medium text-muted hover:text-foreground">
                Full report <ArrowRight size={12} />
              </Link>
            </div>
            <table className="w-full table-premium">
              <thead>
                <tr>
                  <th className="w-8 text-center">#</th>
                  <th>Product</th>
                  <th>Trend</th>
                  <th className="text-right">Score</th>
                  <th className="text-right">Views</th>
                  <th className="text-right">Saves</th>
                  <th className="hidden xl:table-cell">7d Activity</th>
                </tr>
              </thead>
              <tbody>
                {topMomentum.map((p, i) => {
                  const trend = trendConfig[p.trend];
                  return (
                    <tr key={p.productId} className="group">
                      <td className="text-center text-[12px] font-semibold text-muted">{i + 1}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-surface shrink-0" />
                          <div>
                            <p className="text-[13px] font-medium leading-tight">{p.productName}</p>
                            <p className="text-[11px] text-muted">{p.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${trend.bg} ${trend.color}`}>
                          {trend.label}
                        </span>
                      </td>
                      <td className="text-right"><span className="text-[14px] font-semibold">{p.momentumScore}</span></td>
                      <td className="text-right">
                        <div className="text-[13px]">{p.metrics.views.toLocaleString()}</div>
                        <div className="text-[10px] text-emerald">+{p.metrics.viewsGrowth}%</div>
                      </td>
                      <td className="text-right">
                        <div className="text-[13px]">{p.metrics.saves}</div>
                        <div className="text-[10px] text-emerald">+{p.metrics.savesGrowth}%</div>
                      </td>
                      <td className="hidden xl:table-cell"><MiniSparkline data={p.weeklyData.map((d) => d.views)} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Three column row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Active Projects */}
          <div className="rounded-2xl border border-border bg-white">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-[14px] font-semibold">Your Projects</h2>
              <Link href="/discover" className="flex items-center gap-1 text-[12px] font-medium text-muted hover:text-foreground">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {projects.slice(0, 4).map((proj) => {
                const spec = specifications.find((s) => s.projectId === proj.id);
                const boards = designBoards.filter((b) => b.projectId === proj.id);
                return (
                  <Link key={proj.id} href={`/projects/${proj.id}`} className="flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-surface/50">
                    <div className="h-10 w-10 rounded-lg bg-surface shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate">{proj.title}</p>
                      <p className="text-[11px] text-muted">{proj.architect} · {proj.location}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {spec && (
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          spec.status === "approved" ? "bg-emerald-light text-emerald" :
                          spec.status === "review" ? "bg-amber-light text-amber" : "bg-surface text-muted"
                        }`}>{spec.status}</span>
                      )}
                      <p className="mt-0.5 text-[10px] text-muted">{boards.length} board{boards.length !== 1 ? "s" : ""}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Top Architects */}
          <div className="rounded-2xl border border-border bg-white">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <Crown size={15} className="text-amber" />
                <h2 className="text-[14px] font-semibold">Top Architects</h2>
              </div>
              <Link href="/influence" className="flex items-center gap-1 text-[12px] font-medium text-muted hover:text-foreground">
                Leaderboard <ArrowRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {topArchitects.map((arch, i) => (
                <div key={arch.architectId} className="flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-surface/50">
                  <span className="w-5 text-center text-[12px] font-semibold text-muted">{i + 1}</span>
                  <div className="h-9 w-9 rounded-full bg-surface shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">{arch.name}</p>
                    <p className="text-[11px] text-muted">{arch.firm}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[15px] font-semibold">{arch.influenceScore}</p>
                    <span className={`text-[10px] font-medium ${
                      arch.tier === "Platinum" ? "text-foreground" : arch.tier === "Gold" ? "text-amber" : "text-muted"
                    }`}>{arch.tier}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Spec Progress + Recent Boards */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-white p-5">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList size={15} className="text-muted" />
                <h2 className="text-[14px] font-semibold">Specification Progress</h2>
              </div>
              <div className="space-y-4">
                {specifications.map((spec) => {
                  const totalItems = spec.rooms.reduce((s, r) => s + r.items.length, 0);
                  const installed = spec.rooms.reduce((s, r) => s + r.items.filter((i) => i.status === "installed").length, 0);
                  const delivered = spec.rooms.reduce((s, r) => s + r.items.filter((i) => i.status === "delivered").length, 0);
                  const progress = Math.round(((installed + delivered * 0.7) / totalItems) * 100);
                  return (
                    <Link key={spec.id} href={`/specifications/${spec.id}`} className="block group">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[13px] font-medium group-hover:underline">{spec.projectName}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          spec.status === "approved" ? "bg-emerald-light text-emerald" :
                          spec.status === "review" ? "bg-amber-light text-amber" :
                          spec.status === "draft" ? "bg-surface text-muted" : "bg-blue-light text-blue"
                        }`}>{spec.status}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full bg-surface overflow-hidden">
                          <div className="h-full rounded-full bg-foreground transition-all" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-[11px] font-medium text-muted">{progress}%</span>
                      </div>
                      <p className="mt-1 text-[11px] text-muted">{totalItems} items · {spec.rooms.length} rooms</p>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Layers size={15} className="text-muted" />
                  <h2 className="text-[14px] font-semibold">Recent Boards</h2>
                </div>
                <Link href="/boards" className="text-[12px] font-medium text-muted hover:text-foreground">View all</Link>
              </div>
              <div className="space-y-2.5">
                {designBoards.slice(0, 3).map((board) => (
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

        {/* Monthly Trend Chart */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[14px] font-semibold">Platform Activity — Last 6 Months</h2>
              <p className="mt-0.5 text-[12px] text-muted">Product views and engagement across ArchiPro</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-muted">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-foreground" />Views</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-border" />Benchmark</span>
            </div>
          </div>
          <div className="h-[200px] flex items-end gap-3">
            {analyticsData.monthlyViews.map((m) => {
              const maxVal = Math.max(...analyticsData.monthlyViews.map((v) => v.value));
              const height = (m.value / maxVal) * 180;
              const benchmarkHeight = ((maxVal * 0.7) / maxVal) * 180;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center gap-1" style={{ height: 180 }}>
                    <div className="flex-1 max-w-[40px] rounded-t-md bg-foreground transition-all hover:opacity-80" style={{ height }} />
                    <div className="flex-1 max-w-[40px] rounded-t-md bg-border" style={{ height: benchmarkHeight }} />
                  </div>
                  <span className="text-[11px] text-muted">{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
