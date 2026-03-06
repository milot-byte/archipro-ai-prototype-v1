"use client";

import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { analyticsData } from "@/lib/mock-data";
import { Eye, Download, Activity } from "lucide-react";

function BarChart({
  data,
}: {
  data: { month: string; value: number }[];
}) {
  const max = Math.max(...data.map((d) => d.value));

  return (
    <div className="flex items-end gap-3 h-48">
      {data.map((d) => (
        <div key={d.month} className="flex flex-1 flex-col items-center gap-2">
          <div
            className="w-full rounded-t-lg bg-foreground transition-all"
            style={{ height: `${(d.value / max) * 100}%` }}
          />
          <span className="text-xs text-muted">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

function RankingTable({
  title,
  data,
  valueLabel,
}: {
  title: string;
  data: { name: string; views?: number; downloads?: number }[];
  valueLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted">
            <th className="pb-2 font-medium">#</th>
            <th className="pb-2 font-medium">Name</th>
            <th className="pb-2 text-right font-medium">{valueLabel}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr key={item.name} className="border-b border-border last:border-0">
              <td className="py-3 text-sm text-muted">{i + 1}</td>
              <td className="py-3 text-sm">{item.name}</td>
              <td className="py-3 text-right text-sm font-medium">
                {(item.views ?? item.downloads)?.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DashboardPage() {
  const d = analyticsData;

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Track your portfolio performance, product engagement, and audience insights."
      />
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Stats row */}
        <div className="grid gap-6 sm:grid-cols-3">
          <StatCard
            label="Total Views"
            value={d.views.toLocaleString()}
            change={d.viewsChange}
          />
          <StatCard
            label="Spec Downloads"
            value={d.specDownloads.toLocaleString()}
            change={d.downloadsChange}
          />
          <StatCard
            label="Engagement Rate"
            value={d.engagement.toString()}
            suffix="%"
            change={d.engagementChange}
          />
        </div>

        {/* Chart */}
        <div className="mt-10 rounded-2xl border border-border bg-white p-6">
          <h3 className="mb-6 text-sm font-semibold">Monthly Views</h3>
          <BarChart data={d.monthlyViews} />
        </div>

        {/* Rankings */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <RankingTable
            title="Top Projects"
            data={d.topProjects}
            valueLabel="Views"
          />
          <RankingTable
            title="Top Products"
            data={d.topProducts}
            valueLabel="Downloads"
          />
        </div>
      </div>
    </>
  );
}
