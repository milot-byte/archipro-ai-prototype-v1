"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { architectInfluenceData, ArchitectInfluence } from "@/lib/intelligence-data";
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
} from "lucide-react";

const tierColors: Record<string, string> = {
  Platinum: "bg-neutral-900 text-white",
  Gold: "bg-amber-100 text-amber-800",
  Silver: "bg-neutral-200 text-neutral-700",
  Bronze: "bg-orange-100 text-orange-800",
};

function ScoreRing({ score, size = 72 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e5e5" strokeWidth={4} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#0a0a0a"
          strokeWidth={4}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
        {score}
      </span>
    </div>
  );
}

function MiniBarChart({ data }: { data: { month: string; score: number }[] }) {
  const max = Math.max(...data.map((d) => d.score));

  return (
    <div className="flex items-end gap-1.5 h-16">
      {data.map((d) => (
        <div key={d.month} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-sm bg-foreground transition-all"
            style={{ height: `${(d.score / max) * 100}%` }}
          />
          <span className="text-[9px] text-muted">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

function MetricPill({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Eye;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-card px-3 py-2">
      <Icon size={14} className="text-muted" />
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-sm font-semibold">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

function InfluenceCard({ arch }: { arch: ArchitectInfluence }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={arch.avatar}
            alt={arch.name}
            className="h-14 w-14 rounded-full bg-card object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold">{arch.name}</h3>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tierColors[arch.tier]}`}>
                {arch.tier}
              </span>
            </div>
            <p className="text-xs text-muted">{arch.firm}</p>
          </div>
          <ScoreRing score={arch.influenceScore} />
        </div>

        {/* Metrics grid */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          <MetricPill icon={Eye} label="Discoveries" value={arch.metrics.productDiscoveries} />
          <MetricPill icon={Heart} label="Saves" value={arch.metrics.productSaves} />
          <MetricPill icon={Download} label="Spec Downloads" value={arch.metrics.specDownloads} />
          <MetricPill icon={MessageCircle} label="Enquiries" value={arch.metrics.enquiriesGenerated} />
          <MetricPill icon={LayoutGrid} label="Boards" value={arch.metrics.boardsCreated} />
          <MetricPill icon={FolderOpen} label="Projects" value={arch.metrics.projectsPublished} />
        </div>

        {/* Trend chart */}
        <div className="mt-5 flex items-center justify-between">
          <div className="w-48">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
              Score Trend
            </p>
            <MiniBarChart data={arch.monthlyTrend} />
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs font-medium text-muted hover:text-foreground"
          >
            {expanded ? "Less detail" : "More detail"}
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded: influenced products + brands */}
      {expanded && (
        <div className="border-t border-border bg-card/50 p-6 space-y-6">
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
              Top Influenced Products
            </h4>
            <div className="space-y-2">
              {arch.topInfluencedProducts.map((p) => (
                <div key={p.productId} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{p.productName}</p>
                    <p className="text-xs text-muted">{p.brand}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 rounded-full bg-border">
                      <div
                        className="h-1.5 rounded-full bg-foreground"
                        style={{ width: `${p.influence}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-xs font-medium">{p.influence}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
              Top Influenced Brands
            </h4>
            <div className="space-y-2">
              {arch.topInfluencedBrands.map((b) => (
                <div key={b.brandId} className="flex items-center justify-between">
                  <p className="text-sm font-medium">{b.brandName}</p>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 rounded-full bg-border">
                      <div
                        className="h-1.5 rounded-full bg-foreground"
                        style={{ width: `${b.influence}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-xs font-medium">{b.influence}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InfluencePage() {
  // Summary stats
  const totalDiscoveries = architectInfluenceData.reduce((a, b) => a + b.metrics.productDiscoveries, 0);
  const totalEnquiries = architectInfluenceData.reduce((a, b) => a + b.metrics.enquiriesGenerated, 0);
  const avgScore = Math.round(architectInfluenceData.reduce((a, b) => a + b.influenceScore, 0) / architectInfluenceData.length);

  return (
    <>
      <PageHeader
        title="Architect Influence"
        subtitle="Measuring how architects drive product discovery, specification, and conversion across the platform."
      />
      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* Summary */}
        <div className="mb-10 grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-border bg-white p-5 text-center">
            <Award size={20} className="mx-auto text-muted" />
            <p className="mt-2 text-2xl font-bold">{architectInfluenceData.length}</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted">Tracked Architects</p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-5 text-center">
            <TrendingUp size={20} className="mx-auto text-muted" />
            <p className="mt-2 text-2xl font-bold">{avgScore}</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted">Avg Score</p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-5 text-center">
            <Eye size={20} className="mx-auto text-muted" />
            <p className="mt-2 text-2xl font-bold">{totalDiscoveries.toLocaleString()}</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted">Total Discoveries</p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-5 text-center">
            <MessageCircle size={20} className="mx-auto text-muted" />
            <p className="mt-2 text-2xl font-bold">{totalEnquiries}</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted">Enquiries Generated</p>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="space-y-4">
          {architectInfluenceData.map((arch, i) => (
            <div key={arch.architectId} className="relative">
              <div className="absolute -left-8 top-8 hidden text-lg font-bold text-muted lg:block">
                {i + 1}
              </div>
              <InfluenceCard arch={arch} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
