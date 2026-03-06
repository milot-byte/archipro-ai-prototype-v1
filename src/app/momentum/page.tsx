"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { productMomentumData, ProductMomentum } from "@/lib/intelligence-data";
import { products, projects, architects } from "@/lib/mock-data";
import {
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  Heart,
  LayoutGrid,
  Download,
  Tag,
  Flame,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const trendConfig = {
  surging: { label: "Surging", icon: Flame, color: "text-rose-500", bg: "bg-rose-50" },
  rising: { label: "Rising", icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-50" },
  steady: { label: "Steady", icon: Minus, color: "text-blue-500", bg: "bg-blue-50" },
  cooling: { label: "Cooling", icon: ArrowDown, color: "text-neutral-400", bg: "bg-neutral-100" },
};

function GrowthBadge({ value }: { value: number }) {
  const positive = value > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        positive ? "text-emerald-600" : value < 0 ? "text-red-500" : "text-muted"
      }`}
    >
      {positive ? <ArrowUp size={12} /> : value < 0 ? <ArrowDown size={12} /> : <Minus size={12} />}
      {Math.abs(value)}%
    </span>
  );
}

function SparklineChart({ data }: { data: { day: string; views: number; saves: number }[] }) {
  const maxViews = Math.max(...data.map((d) => d.views));

  return (
    <div className="flex items-end gap-1 h-20">
      {data.map((d) => (
        <div key={d.day} className="flex flex-1 flex-col items-center gap-0.5">
          <div className="relative w-full">
            <div
              className="w-full rounded-sm bg-neutral-200"
              style={{ height: `${(d.views / maxViews) * 64}px` }}
            />
            <div
              className="absolute bottom-0 w-full rounded-sm bg-foreground"
              style={{ height: `${(d.saves / maxViews) * 64}px` }}
            />
          </div>
          <span className="text-[8px] text-muted">{d.day}</span>
        </div>
      ))}
    </div>
  );
}

function MomentumBar({ score }: { score: number }) {
  const segments = 20;
  const filled = Math.round((score / 100) * segments);

  return (
    <div className="flex gap-0.5">
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          className={`h-3 flex-1 rounded-sm ${
            i < filled
              ? score >= 80
                ? "bg-foreground"
                : score >= 60
                ? "bg-neutral-500"
                : "bg-neutral-300"
              : "bg-neutral-100"
          }`}
        />
      ))}
    </div>
  );
}

function MomentumCard({ product, rank }: { product: ProductMomentum; rank: number }) {
  const [expanded, setExpanded] = useState(false);
  const tc = trendConfig[product.trend];
  const TrendIcon = tc.icon;

  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden">
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Rank */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card text-sm font-bold text-muted">
            {rank}
          </div>

          {/* Product image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.productName}
            className="h-16 w-16 shrink-0 rounded-xl bg-card object-cover"
          />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold">{product.productName}</h3>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${tc.bg} ${tc.color}`}>
                <TrendIcon size={10} />
                {tc.label}
              </span>
            </div>
            <p className="text-xs text-muted">{product.brand}</p>

            {/* Momentum bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted">
                  Momentum Score
                </span>
                <span className="text-sm font-bold">{product.momentumScore}</span>
              </div>
              <MomentumBar score={product.momentumScore} />
            </div>
          </div>
        </div>

        {/* Metrics row */}
        <div className="mt-5 grid grid-cols-5 gap-2">
          {[
            { icon: Eye, label: "Views", value: product.metrics.views, growth: product.metrics.viewsGrowth },
            { icon: Heart, label: "Saves", value: product.metrics.saves, growth: product.metrics.savesGrowth },
            { icon: LayoutGrid, label: "Boards", value: product.metrics.boards, growth: product.metrics.boardsGrowth },
            { icon: Download, label: "Specs", value: product.metrics.specs, growth: product.metrics.specsGrowth },
            { icon: Tag, label: "Tags", value: product.metrics.projectTags, growth: product.metrics.projectTagsGrowth },
          ].map((m) => (
            <div key={m.label} className="rounded-lg bg-card px-2 py-2 text-center">
              <m.icon size={12} className="mx-auto text-muted" />
              <p className="mt-1 text-sm font-semibold">{m.value.toLocaleString()}</p>
              <GrowthBadge value={m.growth} />
              <p className="text-[8px] text-muted">{m.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="w-64">
            <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted">
              Weekly Activity <span className="normal-case">(views vs saves)</span>
            </p>
            <SparklineChart data={product.weeklyData} />
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs font-medium text-muted hover:text-foreground"
          >
            {expanded ? "Collapse" : "Details"}
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border bg-card/50 p-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                Tagged in Projects
              </h4>
              <div className="space-y-1.5">
                {product.taggedInProjects.map((pid) => {
                  const proj = projects.find((p) => p.id === pid);
                  return (
                    <div key={pid} className="rounded-lg bg-white px-3 py-2 text-sm">
                      {proj?.title || pid} <span className="text-muted">— {proj?.architect}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                Saved by Architects
              </h4>
              <div className="space-y-1.5">
                {product.savedByArchitects.map((aid) => {
                  const arch = architects.find((a) => a.id === aid);
                  return (
                    <div key={aid} className="rounded-lg bg-white px-3 py-2 text-sm">
                      {arch?.name || aid} <span className="text-muted">— {arch?.firm}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MomentumPage() {
  const [trendFilter, setTrendFilter] = useState<string>("all");

  const surging = productMomentumData.filter((p) => p.trend === "surging").length;
  const rising = productMomentumData.filter((p) => p.trend === "rising").length;

  const filtered =
    trendFilter === "all"
      ? productMomentumData
      : productMomentumData.filter((p) => p.trend === trendFilter);

  return (
    <>
      <PageHeader
        title="Product Momentum"
        subtitle="Detecting trending products based on growth velocity across views, saves, boards, specifications and project tagging."
      />
      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* Summary stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-white p-5">
            <Zap size={20} className="text-muted" />
            <p className="mt-2 text-2xl font-bold">{productMomentumData.length}</p>
            <p className="text-xs text-muted">Tracked Products</p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-5">
            <Flame size={20} className="text-rose-500" />
            <p className="mt-2 text-2xl font-bold">{surging}</p>
            <p className="text-xs text-muted">Surging Products</p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-5">
            <TrendingUp size={20} className="text-amber-500" />
            <p className="mt-2 text-2xl font-bold">{rising}</p>
            <p className="text-xs text-muted">Rising Products</p>
          </div>
        </div>

        {/* Trend filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {["all", "surging", "rising", "steady", "cooling"].map((t) => (
            <button
              key={t}
              onClick={() => setTrendFilter(t)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-colors ${
                trendFilter === t
                  ? "bg-foreground text-white"
                  : "bg-card text-muted hover:bg-foreground/10"
              }`}
            >
              {t === "all" ? "All Trends" : t}
            </button>
          ))}
        </div>

        {/* Product cards */}
        <div className="space-y-4">
          {filtered.map((product, i) => (
            <MomentumCard
              key={product.productId}
              product={product}
              rank={productMomentumData.indexOf(product) + 1}
            />
          ))}
        </div>
      </div>
    </>
  );
}
