"use client";

import { useState } from "react";
import { products, brands, architects, projects } from "@/lib/mock-data";
import { productMomentumData, architectInfluenceData, activityFeed } from "@/lib/intelligence-data";
import {
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, BarChart3,
  Eye, Heart, Download, MessageCircle, Package, Users, Building2,
  FolderKanban, Filter, Calendar, ChevronRight, Activity, Layers,
  Zap, Target, Award, Globe
} from "lucide-react";

// Market segment data
const marketSegments = [
  { name: "Residential", growth: 14.2, volume: 12840, share: 42, projects: 4, trend: [38, 40, 39, 41, 42, 42] },
  { name: "Commercial", growth: 8.7, volume: 8920, share: 29, projects: 1, trend: [26, 27, 28, 28, 29, 29] },
  { name: "Hospitality", growth: 22.1, volume: 4180, share: 14, projects: 0, trend: [10, 11, 12, 13, 13, 14] },
  { name: "Heritage", growth: -3.4, volume: 2650, share: 9, projects: 1, trend: [10, 10, 9, 9, 9, 9] },
  { name: "Landscape", growth: 18.6, volume: 1890, share: 6, projects: 0, trend: [4, 4, 5, 5, 6, 6] },
];

// Category performance
const categoryPerformance = [
  { category: "Lighting", views: 8420, growth: 34, saves: 412, specDownloads: 267, avgPrice: "$265", topProduct: "Pendant Light — Arc", marketShare: 28 },
  { category: "Surfaces", views: 6890, growth: 22, saves: 328, specDownloads: 198, avgPrice: "$153/m²", topProduct: "Engineered Oak Panel", marketShare: 23 },
  { category: "Furniture", views: 5240, growth: 18, saves: 276, specDownloads: 156, avgPrice: "$2,045", topProduct: "Lounge Chair — Miro", marketShare: 17 },
  { category: "Kitchen & Bath", views: 4180, growth: 12, saves: 198, specDownloads: 142, avgPrice: "$1,224", topProduct: "Island Benchtop 3m", marketShare: 14 },
  { category: "Roofing", views: 2980, growth: 8, saves: 124, specDownloads: 98, avgPrice: "$80/m²", topProduct: "Standing Seam Panel", marketShare: 10 },
  { category: "Outdoor", views: 1890, growth: -2, saves: 87, specDownloads: 64, avgPrice: "$2,286", topProduct: "Pergola Kit 4x3", marketShare: 8 },
];

// Regional data
const regionalData = [
  { region: "Auckland", projects: 2, products: 142, architects: 2, growth: 18, activity: 4820 },
  { region: "Wellington", projects: 1, products: 98, architects: 1, growth: 12, activity: 2890 },
  { region: "Christchurch", projects: 1, products: 87, architects: 1, growth: 8, activity: 3400 },
  { region: "Queenstown", projects: 1, products: 76, architects: 1, growth: 24, activity: 3910 },
  { region: "Tauranga", projects: 1, products: 64, architects: 1, growth: 15, activity: 1870 },
];

// Monthly trend data
const monthlyTrends = [
  { month: "Jul", views: 18200, saves: 890, downloads: 420, enquiries: 156 },
  { month: "Aug", views: 21400, saves: 1020, downloads: 498, enquiries: 178 },
  { month: "Sep", views: 19800, saves: 960, downloads: 465, enquiries: 164 },
  { month: "Oct", views: 24600, saves: 1180, downloads: 578, enquiries: 198 },
  { month: "Nov", views: 28400, saves: 1340, downloads: 642, enquiries: 224 },
  { month: "Dec", views: 30600, saves: 1480, downloads: 712, enquiries: 248 },
];

export default function MarketTrendsPage() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "12m">("30d");
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  const totalViews = monthlyTrends.reduce((s, m) => s + m.views, 0);
  const totalSaves = monthlyTrends.reduce((s, m) => s + m.saves, 0);
  const totalDownloads = monthlyTrends.reduce((s, m) => s + m.downloads, 0);
  const totalEnquiries = monthlyTrends.reduce((s, m) => s + m.enquiries, 0);
  const maxMonthViews = Math.max(...monthlyTrends.map(m => m.views));
  const latestMonth = monthlyTrends[monthlyTrends.length - 1];
  const prevMonth = monthlyTrends[monthlyTrends.length - 2];
  const viewsGrowth = ((latestMonth.views - prevMonth.views) / prevMonth.views * 100).toFixed(1);

  const surgingProducts = productMomentumData.filter(p => p.trend === "surging" || p.trend === "rising").length;
  const coolingProducts = productMomentumData.filter(p => p.trend === "cooling").length;

  return (
    <div className="min-h-screen bg-surface/50">
      <div className="border-b border-border bg-white px-8 py-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">Intelligence</p>
            <h1 className="mt-1 text-[28px] font-semibold tracking-tight">Market Trends</h1>
            <p className="mt-1 text-[13px] text-muted">Architecture market intelligence — category performance, regional activity, and demand signals.</p>
          </div>
          <div className="flex items-center gap-2">
            {(["7d", "30d", "90d", "12m"] as const).map(r => (
              <button key={r} onClick={() => setTimeRange(r)} className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors ${timeRange === r ? "bg-foreground text-white" : "border border-border bg-white text-muted hover:bg-surface"}`}>
                {r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : r === "90d" ? "90 Days" : "12 Months"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          {[
            { label: "Total Views", value: totalViews.toLocaleString(), change: `+${viewsGrowth}%`, icon: Eye, positive: true },
            { label: "Product Saves", value: totalSaves.toLocaleString(), change: "+10.4%", icon: Heart, positive: true },
            { label: "Spec Downloads", value: totalDownloads.toLocaleString(), change: "+10.9%", icon: Download, positive: true },
            { label: "Enquiries", value: totalEnquiries.toLocaleString(), change: "+10.7%", icon: MessageCircle, positive: true },
            { label: "Surging Products", value: surgingProducts.toString(), change: `${coolingProducts} cooling`, icon: TrendingUp, positive: true },
            { label: "Active Architects", value: architects.length.toString(), change: "+2 this month", icon: Users, positive: true },
          ].map(kpi => (
            <div key={kpi.label} className="rounded-2xl border border-border bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="rounded-lg bg-surface p-1.5"><kpi.icon size={13} className="text-muted" /></div>
                <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${kpi.positive ? "text-emerald" : "text-rose"}`}>
                  {kpi.positive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}{kpi.change}
                </span>
              </div>
              <p className="text-[20px] font-semibold tracking-tight">{kpi.value}</p>
              <p className="text-[11px] text-muted">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* Market Activity Chart */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[14px] font-semibold">Market Activity</h3>
              <p className="text-[11px] text-muted mt-0.5">Platform-wide engagement metrics over time</p>
            </div>
            <div className="flex items-center gap-4 text-[10px]">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-foreground" />Views</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-foreground/40" />Saves</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald" />Downloads</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber" />Enquiries</span>
            </div>
          </div>
          <div className="flex items-end gap-3 h-48">
            {monthlyTrends.map((m, i) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end gap-[2px] h-40">
                  <div className="flex-1 bg-foreground/90 rounded-t transition-all" style={{ height: `${(m.views / maxMonthViews) * 100}%` }} />
                  <div className="flex-1 bg-foreground/40 rounded-t transition-all" style={{ height: `${(m.saves / maxMonthViews) * 100 * 5}%` }} />
                  <div className="flex-1 bg-emerald rounded-t transition-all" style={{ height: `${(m.downloads / maxMonthViews) * 100 * 8}%` }} />
                  <div className="flex-1 bg-amber rounded-t transition-all" style={{ height: `${(m.enquiries / maxMonthViews) * 100 * 20}%` }} />
                </div>
                <span className="text-[10px] text-muted">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Market Segments */}
          <div className="rounded-2xl border border-border bg-white p-6">
            <h3 className="text-[14px] font-semibold mb-1">Market Segments</h3>
            <p className="text-[11px] text-muted mb-4">Project type distribution and growth</p>

            {/* Segment bar */}
            <div className="flex h-4 rounded-full overflow-hidden mb-3">
              {marketSegments.map((seg, i) => (
                <div key={seg.name} className={`transition-all cursor-pointer hover:opacity-80 ${
                  i === 0 ? "bg-foreground" : i === 1 ? "bg-foreground/70" : i === 2 ? "bg-foreground/50" : i === 3 ? "bg-foreground/30" : "bg-foreground/15"
                }`} style={{ width: `${seg.share}%` }} onClick={() => setSelectedSegment(selectedSegment === seg.name ? null : seg.name)} />
              ))}
            </div>

            <div className="space-y-2.5">
              {marketSegments.map((seg, i) => (
                <div key={seg.name} className={`flex items-center gap-3 rounded-lg p-2 transition-colors ${selectedSegment === seg.name ? "bg-surface" : ""}`}>
                  <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                    i === 0 ? "bg-foreground" : i === 1 ? "bg-foreground/70" : i === 2 ? "bg-foreground/50" : i === 3 ? "bg-foreground/30" : "bg-foreground/15"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-medium">{seg.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-muted">{seg.volume.toLocaleString()} views</span>
                        <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${seg.growth >= 0 ? "text-emerald" : "text-rose"}`}>
                          {seg.growth >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}{Math.abs(seg.growth)}%
                        </span>
                        <span className="text-[11px] font-semibold w-8 text-right">{seg.share}%</span>
                      </div>
                    </div>
                    {/* Mini sparkline */}
                    <div className="flex items-end gap-px h-3 mt-1">
                      {seg.trend.map((v, j) => (
                        <div key={j} className="flex-1 bg-foreground/20 rounded-sm" style={{ height: `${(v / Math.max(...seg.trend)) * 100}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Activity */}
          <div className="rounded-2xl border border-border bg-white p-6">
            <h3 className="text-[14px] font-semibold mb-1">Regional Activity</h3>
            <p className="text-[11px] text-muted mb-4">Geographic distribution of platform engagement</p>
            <div className="space-y-3">
              {regionalData.map((region) => {
                const maxActivity = Math.max(...regionalData.map(r => r.activity));
                return (
                  <div key={region.region}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Globe size={12} className="text-muted" />
                        <span className="text-[12px] font-medium">{region.region}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="text-muted">{region.projects} proj</span>
                        <span className="text-muted">{region.architects} arch</span>
                        <span className={`flex items-center gap-0.5 font-semibold ${region.growth >= 0 ? "text-emerald" : "text-rose"}`}>
                          <ArrowUpRight size={9} />+{region.growth}%
                        </span>
                        <span className="font-semibold w-12 text-right">{region.activity.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-surface overflow-hidden">
                      <div className="h-full rounded-full bg-foreground/60 transition-all" style={{ width: `${(region.activity / maxActivity) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Category Performance Table */}
        <div className="rounded-2xl border border-border bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-[14px] font-semibold">Category Performance</h3>
            <p className="text-[11px] text-muted mt-0.5">Deep breakdown of product category metrics and market share</p>
          </div>
          <table className="w-full table-premium">
            <thead>
              <tr>
                <th>Category</th>
                <th className="text-right">Views</th>
                <th className="text-right">Growth</th>
                <th className="text-right">Saves</th>
                <th className="text-right">Spec DL</th>
                <th className="text-right">Avg Price</th>
                <th>Top Product</th>
                <th className="text-right">Market Share</th>
              </tr>
            </thead>
            <tbody>
              {categoryPerformance.map((cat) => (
                <tr key={cat.category}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-surface flex items-center justify-center">
                        <Package size={11} className="text-muted" />
                      </div>
                      <span className="text-[12px] font-medium">{cat.category}</span>
                    </div>
                  </td>
                  <td className="text-right"><span className="text-[12px] font-semibold">{cat.views.toLocaleString()}</span></td>
                  <td className="text-right">
                    <span className={`flex items-center justify-end gap-0.5 text-[12px] font-semibold ${cat.growth >= 0 ? "text-emerald" : "text-rose"}`}>
                      {cat.growth >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}{Math.abs(cat.growth)}%
                    </span>
                  </td>
                  <td className="text-right"><span className="text-[12px]">{cat.saves}</span></td>
                  <td className="text-right"><span className="text-[12px]">{cat.specDownloads}</span></td>
                  <td className="text-right"><span className="text-[12px] font-medium">{cat.avgPrice}</span></td>
                  <td><span className="text-[12px] text-muted">{cat.topProduct}</span></td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-surface overflow-hidden">
                        <div className="h-full rounded-full bg-foreground" style={{ width: `${cat.marketShare}%` }} />
                      </div>
                      <span className="text-[11px] font-semibold w-8 text-right">{cat.marketShare}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Brand Performance + Demand Signals */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-6">
            <h3 className="text-[14px] font-semibold mb-1">Brand Performance Index</h3>
            <p className="text-[11px] text-muted mb-4">Ranked by product engagement and architect adoption</p>
            <div className="space-y-3">
              {brands.sort((a, b) => {
                const aProducts = productMomentumData.filter(p => p.brandId === a.id);
                const bProducts = productMomentumData.filter(p => p.brandId === b.id);
                const aScore = aProducts.reduce((s, p) => s + p.momentumScore, 0) / (aProducts.length || 1);
                const bScore = bProducts.reduce((s, p) => s + p.momentumScore, 0) / (bProducts.length || 1);
                return bScore - aScore;
              }).map((brand, idx) => {
                const brandProducts = productMomentumData.filter(p => p.brandId === brand.id);
                const avgMomentum = Math.round(brandProducts.reduce((s, p) => s + p.momentumScore, 0) / (brandProducts.length || 1));
                const totalViews = brandProducts.reduce((s, p) => s + p.metrics.views, 0);
                const avgGrowth = Math.round(brandProducts.reduce((s, p) => s + p.metrics.viewsGrowth, 0) / (brandProducts.length || 1));
                return (
                  <div key={brand.id} className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold text-muted w-4">{idx + 1}</span>
                    <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center shrink-0">
                      <span className="text-[8px] font-bold text-white">{brand.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium">{brand.name}</span>
                        <div className="flex items-center gap-2">
                          <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${avgGrowth >= 0 ? "text-emerald" : "text-rose"}`}>
                            {avgGrowth >= 0 ? "+" : ""}{avgGrowth}%
                          </span>
                          <span className="text-[11px] font-semibold">{avgMomentum}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted">
                        <span>{brand.category}</span>
                        <span>·</span>
                        <span>{brandProducts.length} tracked</span>
                        <span>·</span>
                        <span>{totalViews.toLocaleString()} views</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6">
            <h3 className="text-[14px] font-semibold mb-1">Demand Signals</h3>
            <p className="text-[11px] text-muted mb-4">Real-time indicators of market demand shifts</p>
            <div className="space-y-3">
              {[
                { signal: "Pendant lighting saves up 62% MoM", type: "surge", category: "Lighting", icon: Zap, detail: "Driven by Arc pendant — 3 architects specified this week" },
                { signal: "Oak surfaces enquiries spiking", type: "rising", category: "Surfaces", icon: TrendingUp, detail: "85m² bulk enquiry from Coastal Retreat project" },
                { signal: "Furniture board additions +50%", type: "rising", category: "Furniture", icon: Layers, detail: "Niko dining table added to 4 boards in 7 days" },
                { signal: "Outdoor category cooling -5%", type: "cooling", category: "Outdoor", icon: TrendingDown, detail: "Seasonal decline — pergola searches down from peak" },
                { signal: "Kitchen spec downloads steady", type: "steady", category: "Kitchen", icon: Target, detail: "Island benchtop maintaining 12% of total downloads" },
                { signal: "Roofing enquiry conversion high", type: "rising", category: "Roofing", icon: Award, detail: "Standing Seam converting 34% of views to enquiries" },
              ].map((signal, i) => (
                <div key={i} className="rounded-xl border border-border p-3 hover:bg-surface/30 transition-colors">
                  <div className="flex items-start gap-2.5">
                    <div className={`rounded-lg p-1.5 mt-0.5 ${
                      signal.type === "surge" ? "bg-rose-light" : signal.type === "rising" ? "bg-emerald-light" : signal.type === "cooling" ? "bg-amber-light" : "bg-surface"
                    }`}>
                      <signal.icon size={12} className={
                        signal.type === "surge" ? "text-rose" : signal.type === "rising" ? "text-emerald" : signal.type === "cooling" ? "text-amber" : "text-muted"
                      } />
                    </div>
                    <div className="flex-1">
                      <p className="text-[12px] font-semibold">{signal.signal}</p>
                      <p className="text-[11px] text-muted mt-0.5">{signal.detail}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="rounded-full bg-surface px-2 py-0.5 text-[9px] font-medium text-muted">{signal.category}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                          signal.type === "surge" ? "bg-rose-light text-rose" : signal.type === "rising" ? "bg-emerald-light text-emerald" : signal.type === "cooling" ? "bg-amber-light text-amber" : "bg-surface text-muted"
                        }`}>{signal.type}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Trend Heatmap */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="text-[14px] font-semibold mb-1">Product Momentum Matrix</h3>
          <p className="text-[11px] text-muted mb-4">Weekly engagement intensity across the product catalogue</p>
          <div className="overflow-x-auto">
            <table className="w-full table-premium">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Brand</th>
                  <th className="text-center">Mon</th>
                  <th className="text-center">Tue</th>
                  <th className="text-center">Wed</th>
                  <th className="text-center">Thu</th>
                  <th className="text-center">Fri</th>
                  <th className="text-center">Sat</th>
                  <th className="text-center">Sun</th>
                  <th className="text-center">Score</th>
                  <th className="text-center">Trend</th>
                </tr>
              </thead>
              <tbody>
                {productMomentumData.map(p => {
                  const maxViews = Math.max(...p.weeklyData.map(d => d.views));
                  return (
                    <tr key={p.productId}>
                      <td><span className="text-[12px] font-medium">{p.productName}</span></td>
                      <td><span className="text-[12px] text-muted">{p.brand}</span></td>
                      {p.weeklyData.map((d, i) => {
                        const intensity = d.views / maxViews;
                        return (
                          <td key={i} className="text-center">
                            <div className={`mx-auto h-6 w-8 rounded flex items-center justify-center text-[9px] font-medium ${
                              intensity > 0.85 ? "bg-foreground text-white" : intensity > 0.7 ? "bg-foreground/60 text-white" : intensity > 0.5 ? "bg-foreground/30 text-foreground" : "bg-surface text-muted"
                            }`}>
                              {d.views}
                            </div>
                          </td>
                        );
                      })}
                      <td className="text-center"><span className="text-[12px] font-semibold">{p.momentumScore}</span></td>
                      <td className="text-center">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          p.trend === "surging" ? "bg-rose-light text-rose" : p.trend === "rising" ? "bg-emerald-light text-emerald" : p.trend === "cooling" ? "bg-amber-light text-amber" : "bg-surface text-muted"
                        }`}>{p.trend}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
