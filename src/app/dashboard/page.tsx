"use client";

import { analyticsData, products, projects } from "@/lib/mock-data";
import { productMomentumData, architectInfluenceData } from "@/lib/intelligence-data";
import { Eye, Download, TrendingUp, TrendingDown, Activity, BarChart3, Users, Heart, MessageCircle, Zap } from "lucide-react";

export default function DashboardPage() {
  const d = analyticsData;
  const totalSaves = productMomentumData.reduce((s, p) => s + p.metrics.saves, 0);
  const totalEnquiries = architectInfluenceData.reduce((s, a) => s + a.metrics.enquiriesGenerated, 0);
  const avgMomentum = Math.round(productMomentumData.reduce((s, p) => s + p.momentumScore, 0) / productMomentumData.length);
  const avgInfluence = Math.round(architectInfluenceData.reduce((s, a) => s + a.influenceScore, 0) / architectInfluenceData.length);

  return (
    <div className="min-h-screen bg-surface/50">
      <div className="border-b border-border bg-white px-8 py-6">
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">Intelligence</p>
        <h1 className="mt-1 text-[28px] font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-[13px] text-muted">Portfolio performance, product engagement, and audience insights.</p>
      </div>

      <div className="p-8 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Total Views", value: d.views.toLocaleString(), change: d.viewsChange, icon: Eye },
            { label: "Spec Downloads", value: d.specDownloads.toLocaleString(), change: d.downloadsChange, icon: Download },
            { label: "Engagement Rate", value: `${d.engagement}%`, change: d.engagementChange, icon: Activity },
            { label: "Enquiries", value: totalEnquiries.toString(), change: 8.7, icon: MessageCircle },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-white p-5">
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-surface p-2.5"><s.icon size={18} className="text-muted" /></div>
                <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${s.change >= 0 ? "bg-emerald-light text-emerald" : "bg-rose-light text-rose"}`}>
                  {s.change >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {s.change >= 0 ? "+" : ""}{s.change}%
                </div>
              </div>
              <p className="mt-4 text-[28px] font-semibold tracking-tight leading-none">{s.value}</p>
              <p className="mt-1.5 text-[12px] text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Platform Health */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="text-[13px] font-semibold mb-2">Avg Product Momentum</h3>
            <p className="text-[11px] text-muted mb-3">Score across all tracked products</p>
            <div className="flex items-end gap-3">
              <span className="text-[36px] font-bold tracking-tight">{avgMomentum}</span>
              <span className="text-[12px] text-emerald font-semibold mb-2">+12 vs last month</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-surface overflow-hidden">
              <div className="h-full rounded-full bg-foreground" style={{ width: `${avgMomentum}%` }} />
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="text-[13px] font-semibold mb-2">Avg Architect Influence</h3>
            <p className="text-[11px] text-muted mb-3">Score across all tracked architects</p>
            <div className="flex items-end gap-3">
              <span className="text-[36px] font-bold tracking-tight">{avgInfluence}</span>
              <span className="text-[12px] text-emerald font-semibold mb-2">+8 vs last month</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-surface overflow-hidden">
              <div className="h-full rounded-full bg-foreground" style={{ width: `${avgInfluence}%` }} />
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[14px] font-semibold">Monthly Views</h3>
              <p className="text-[12px] text-muted mt-0.5">Product views over the past 6 months</p>
            </div>
          </div>
          <div className="h-[220px] flex items-end gap-4">
            {d.monthlyViews.map((m) => {
              const max = Math.max(...d.monthlyViews.map((v) => v.value));
              const height = (m.value / max) * 200;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[11px] font-medium text-muted">{m.value.toLocaleString()}</span>
                  <div className="w-full rounded-t-lg bg-foreground hover:opacity-80 transition-opacity" style={{ height }} />
                  <span className="text-[11px] text-muted">{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rankings */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-[13px] font-semibold">Top Projects by Views</h3>
            </div>
            <table className="w-full table-premium">
              <thead><tr><th className="w-10">#</th><th>Project</th><th className="text-right">Views</th></tr></thead>
              <tbody>
                {d.topProjects.map((item, i) => (
                  <tr key={item.name}>
                    <td><span className="text-[12px] font-semibold text-muted">{i + 1}</span></td>
                    <td><span className="text-[13px] font-medium">{item.name}</span></td>
                    <td className="text-right"><span className="text-[13px] font-semibold">{item.views.toLocaleString()}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-2xl border border-border bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-[13px] font-semibold">Top Products by Downloads</h3>
            </div>
            <table className="w-full table-premium">
              <thead><tr><th className="w-10">#</th><th>Product</th><th className="text-right">Downloads</th></tr></thead>
              <tbody>
                {d.topProducts.map((item, i) => (
                  <tr key={item.name}>
                    <td><span className="text-[12px] font-semibold text-muted">{i + 1}</span></td>
                    <td><span className="text-[13px] font-medium">{item.name}</span></td>
                    <td className="text-right"><span className="text-[13px] font-semibold">{item.downloads.toLocaleString()}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
