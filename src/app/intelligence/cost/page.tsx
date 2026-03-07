"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { products, projects, brands, type Product } from "@/lib/mock-data";
import { specifications, productMomentumData } from "@/lib/intelligence-data";
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Layers,
  Box,
  Home,
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  Download,
  Send,
  Share2,
  ClipboardList,
  Check,
  Bookmark,
  Star,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Repeat2,
  Sparkles,
  Shield,
  Truck,
  Clock,
  CheckCircle2,
  Package,
  BarChart3,
  Target,
} from "lucide-react";

// ─── Utilities ───────────────────────────────────────────────────────────────

function parsePrice(p: string): number {
  const match = p.replace(/[^0-9.]/g, "");
  return parseFloat(match) || 0;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function seed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function fmt(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toLocaleString()}`;
}

// ─── Shared UI Components ────────────────────────────────────────────────────

function ScoreRing({ score, size = 48, strokeWidth = 4, label }: { score: number; size?: number; strokeWidth?: number; label?: string }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#059669" : score >= 60 ? "#0a0a0a" : score >= 40 ? "#d97706" : "#e11d48";
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f5f5f5" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" className="text-[10px] font-bold" fill={color}>{label ?? score}</text>
    </svg>
  );
}

function MatchBar({ score, height = 6, color = "bg-foreground" }: { score: number; height?: number; color?: string }) {
  return (
    <div className="flex-1 rounded-full bg-surface overflow-hidden" style={{ height }}>
      <div className={`h-full rounded-full ${color}`} style={{ width: `${clamp(score, 0, 100)}%` }} />
    </div>
  );
}

function Sparkline({ data, width = 64, height = 20, color = "#0a0a0a" }: { data: number[]; width?: number; height?: number; color?: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`).join(" ");
  return <svg width={width} height={height} className="shrink-0"><polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function StackedBar({ segments, height = 20 }: { segments: { label: string; value: number; color: string }[]; height?: number }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return null;
  return (
    <div className="flex rounded-lg overflow-hidden" style={{ height }}>
      {segments.filter((s) => s.value > 0).map((seg) => (
        <div key={seg.label} className="flex items-center justify-center" style={{ width: `${(seg.value / total) * 100}%`, backgroundColor: seg.color }}
          title={`${seg.label}: ${fmt(seg.value)}`}>
          {(seg.value / total) > 0.12 && <span className="text-[7px] font-bold text-white">{seg.label}</span>}
        </div>
      ))}
    </div>
  );
}

// ─── Data Computation ────────────────────────────────────────────────────────

interface RoomCost {
  roomName: string;
  specId: string;
  projectName: string;
  items: { product: Product; quantity: number; unit: string; unitCost: number; totalCost: number; status: string; category: string }[];
  totalCost: number;
  missingCategories: string[];
  upgradeOpportunities: { current: Product; upgrade: Product; delta: number }[];
  reductionOpportunities: { current: Product; cheaper: Product; savings: number }[];
}

interface CategoryBenchmark {
  category: string;
  avgSpend: number;
  minSpend: number;
  maxSpend: number;
  premiumBench: number;
  practicalBench: number;
  productCount: number;
  projectAvg: number;
  percentile: number;
}

interface SupplierIntel {
  brandId: string;
  brandName: string;
  category: string;
  productCount: number;
  specifiedCount: number;
  leadTimeDays: number;
  availability: "in-stock" | "lead-time" | "made-to-order";
  readiness: number;
  totalValue: number;
}

interface OptimizationMove {
  type: "substitute" | "upgrade" | "reduction" | "trade-off";
  current: Product;
  suggested: Product;
  budgetImpact: number;
  reason: string;
  confidence: number;
}

interface CostIntelligence {
  totalBudget: number;
  roomCosts: RoomCost[];
  categoryBenchmarks: CategoryBenchmark[];
  premiumTotal: number;
  practicalTotal: number;
  costCompleteness: number;
  supplierIntel: SupplierIntel[];
  procurementReadiness: number;
  optimizationMoves: OptimizationMove[];
  budgetByCategory: { category: string; amount: number }[];
  monthlyBudget: number[];
}

function computeCostIntelligence(): CostIntelligence {
  const allCategories = [...new Set(products.map((p) => p.category))];

  // ── Room costs from specifications ──
  const roomCosts: RoomCost[] = [];
  const allSpecItems: { product: Product; quantity: number; unit: string; unitCost: number; totalCost: number; category: string }[] = [];

  specifications.forEach((spec) => {
    spec.rooms.forEach((room) => {
      const items = room.items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return null;
        const unitCost = parsePrice(product.price);
        const totalCost = unitCost * item.quantity;
        return { product, quantity: item.quantity, unit: item.unit, unitCost, totalCost, status: item.status, category: item.category };
      }).filter(Boolean) as RoomCost["items"];

      const totalCost = items.reduce((s, it) => s + it.totalCost, 0);
      const usedCats = new Set(items.map((it) => it.category));
      const expectedCats: Record<string, string[]> = {
        Kitchen: ["Hardware", "Kitchen", "Surfaces", "Lighting"],
        "Living Room": ["Lighting", "Furniture", "Surfaces"],
        "Great Room": ["Lighting", "Furniture", "Surfaces"],
        "Outdoor Deck": ["Decking", "Outdoor"],
        "Roof & Exterior": ["Roofing"],
        Studio: ["Lighting", "Furniture"],
        "Kitchen Nook": ["Kitchen"],
        "Garden & Pergola": ["Outdoor"],
      };
      const expected = expectedCats[room.name] || allCategories.slice(0, 3);
      const missingCategories = expected.filter((c) => !usedCats.has(c));

      // Upgrade opportunities
      const upgradeOpportunities: RoomCost["upgradeOpportunities"] = [];
      const reductionOpportunities: RoomCost["reductionOpportunities"] = [];

      items.forEach((item) => {
        const sameCategory = products.filter((p) => p.category === item.category && p.id !== item.product.id);
        const pricier = sameCategory.filter((p) => parsePrice(p.price) > item.unitCost).sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
        const cheaper = sameCategory.filter((p) => parsePrice(p.price) < item.unitCost).sort((a, b) => parsePrice(b.price) - parsePrice(a.price));

        if (pricier.length > 0) upgradeOpportunities.push({ current: item.product, upgrade: pricier[0], delta: parsePrice(pricier[0].price) - item.unitCost });
        if (cheaper.length > 0) reductionOpportunities.push({ current: item.product, cheaper: cheaper[0], savings: item.unitCost - parsePrice(cheaper[0].price) });
      });

      items.forEach((it) => allSpecItems.push(it));
      roomCosts.push({ roomName: room.name, specId: spec.id, projectName: spec.projectName, items, totalCost, missingCategories, upgradeOpportunities, reductionOpportunities });
    });
  });

  const totalBudget = roomCosts.reduce((s, r) => s + r.totalCost, 0);

  // ── Premium vs practical ──
  const premiumThreshold = 400;
  const premiumTotal = allSpecItems.filter((it) => it.unitCost > premiumThreshold).reduce((s, it) => s + it.totalCost, 0);
  const practicalTotal = totalBudget - premiumTotal;

  // ── Cost completeness ──
  const specifiedCategories = new Set(allSpecItems.map((it) => it.category));
  const costCompleteness = clamp(Math.round((specifiedCategories.size / allCategories.length) * 100), 0, 100);

  // ── Category benchmarks ──
  const categoryBenchmarks: CategoryBenchmark[] = allCategories.map((cat) => {
    const catProducts = products.filter((p) => p.category === cat);
    const prices = catProducts.map((p) => parsePrice(p.price));
    const avgSpend = prices.length > 0 ? Math.round(prices.reduce((s, p) => s + p, 0) / prices.length) : 0;
    const minSpend = prices.length > 0 ? Math.min(...prices) : 0;
    const maxSpend = prices.length > 0 ? Math.max(...prices) : 0;
    const premiumBench = clamp(Math.round(avgSpend * 1.6 + seed(cat + "pb") % 100), 0, 99999);
    const practicalBench = clamp(Math.round(avgSpend * 0.6 + seed(cat + "prb") % 50), 0, 99999);

    const specItems = allSpecItems.filter((it) => it.category === cat);
    const projectAvg = specItems.length > 0 ? Math.round(specItems.reduce((s, it) => s + it.unitCost, 0) / specItems.length) : 0;
    const percentile = avgSpend > 0 ? clamp(Math.round((projectAvg / maxSpend) * 100), 0, 100) : 50;

    return { category: cat, avgSpend, minSpend, maxSpend, premiumBench, practicalBench, productCount: catProducts.length, projectAvg, percentile };
  }).sort((a, b) => b.avgSpend - a.avgSpend);

  // ── Budget by category ──
  const budgetByCategory = allCategories.map((cat) => ({
    category: cat,
    amount: allSpecItems.filter((it) => it.category === cat).reduce((s, it) => s + it.totalCost, 0),
  })).sort((a, b) => b.amount - a.amount);

  // ── Supplier intelligence ──
  const supplierIntel: SupplierIntel[] = brands.map((brand) => {
    const brandProducts = products.filter((p) => p.brandId === brand.id);
    const specItems = allSpecItems.filter((it) => brandProducts.some((bp) => bp.id === it.product.id));
    const totalValue = specItems.reduce((s, it) => s + it.totalCost, 0);
    const leadTimeDays = 5 + seed(brand.id + "lt") % 40;
    const availabilities: SupplierIntel["availability"][] = ["in-stock", "lead-time", "made-to-order"];
    const availability = availabilities[seed(brand.id + "av") % 3];
    const readiness = clamp(availability === "in-stock" ? 85 + seed(brand.id + "rd") % 15 : availability === "lead-time" ? 50 + seed(brand.id + "rd") % 30 : 20 + seed(brand.id + "rd") % 30, 0, 100);

    return {
      brandId: brand.id,
      brandName: brand.name,
      category: brand.category,
      productCount: brandProducts.length,
      specifiedCount: specItems.length,
      leadTimeDays,
      availability,
      readiness,
      totalValue,
    };
  }).sort((a, b) => b.totalValue - a.totalValue);

  const procurementReadiness = supplierIntel.length > 0 ? Math.round(supplierIntel.reduce((s, si) => s + si.readiness, 0) / supplierIntel.length) : 0;

  // ── Optimization moves ──
  const optimizationMoves: OptimizationMove[] = [];
  allSpecItems.forEach((item) => {
    const sameCategory = products.filter((p) => p.category === item.category && p.id !== item.product.id);
    const cheaper = sameCategory.filter((p) => parsePrice(p.price) < item.unitCost).sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    const pricier = sameCategory.filter((p) => parsePrice(p.price) > item.unitCost).sort((a, b) => parsePrice(a.price) - parsePrice(b.price));

    if (cheaper.length > 0 && !optimizationMoves.some((m) => m.current.id === item.product.id && m.type === "substitute")) {
      optimizationMoves.push({
        type: "substitute",
        current: item.product,
        suggested: cheaper[0],
        budgetImpact: -(item.unitCost - parsePrice(cheaper[0].price)) * item.quantity,
        reason: `Switch to ${cheaper[0].name} to save ${fmt((item.unitCost - parsePrice(cheaper[0].price)) * item.quantity)} in ${item.category}`,
        confidence: clamp(60 + seed(item.product.id + "sub") % 30, 0, 100),
      });
    }
    if (pricier.length > 0 && !optimizationMoves.some((m) => m.current.id === item.product.id && m.type === "upgrade")) {
      optimizationMoves.push({
        type: "upgrade",
        current: item.product,
        suggested: pricier[0],
        budgetImpact: (parsePrice(pricier[0].price) - item.unitCost) * item.quantity,
        reason: `Upgrade to ${pricier[0].name} for enhanced ${item.category} specification`,
        confidence: clamp(50 + seed(item.product.id + "upg") % 35, 0, 100),
      });
    }
  });

  // Monthly budget trend (mock)
  const monthlyBudget = Array.from({ length: 8 }, (_, i) => Math.round(totalBudget * (0.7 + (seed(`month${i}`) % 30) / 100)));

  return { totalBudget, roomCosts, categoryBenchmarks, premiumTotal, practicalTotal, costCompleteness, supplierIntel, procurementReadiness, optimizationMoves, budgetByCategory, monthlyBudget };
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function CostIntelligencePage() {
  const data = useMemo(() => computeCostIntelligence(), []);
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [optSort, setOptSort] = useState<"budgetImpact" | "confidence">("budgetImpact");
  const [optFilter, setOptFilter] = useState<"all" | "substitute" | "upgrade">("all");
  const [quoteProducts, setQuoteProducts] = useState<Set<string>>(new Set());
  const [sentToSupplier, setSentToSupplier] = useState<Set<string>>(new Set());
  const [exportedList, setExportedList] = useState(false);
  const [planCreated, setPlanCreated] = useState(false);

  const filteredRooms = selectedProject === "all" ? data.roomCosts : data.roomCosts.filter((r) => r.projectName === selectedProject);
  const projectNames = [...new Set(data.roomCosts.map((r) => r.projectName))];
  const filteredBudget = filteredRooms.reduce((s, r) => s + r.totalCost, 0);

  const toggleQuote = (id: string) => {
    const n = new Set(quoteProducts);
    if (n.has(id)) n.delete(id); else n.add(id);
    setQuoteProducts(n);
  };

  const sortedOptMoves = useMemo(() => {
    let filtered = optFilter === "all" ? data.optimizationMoves : data.optimizationMoves.filter((m) => m.type === optFilter);
    return [...filtered].sort((a, b) => optSort === "budgetImpact" ? Math.abs(b.budgetImpact) - Math.abs(a.budgetImpact) : b.confidence - a.confidence);
  }, [data.optimizationMoves, optSort, optFilter]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/intelligence/matching" className="rounded-lg border border-border p-2 hover:bg-surface transition-colors">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-[22px] font-bold tracking-tight">Project Cost Intelligence</h1>
              <p className="text-[12px] text-muted mt-0.5">Budget estimation, procurement readiness, and supplier planning</p>
            </div>
          </div>

          {/* Project filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Project:</span>
            <div className="flex items-center gap-1 rounded-xl border border-border bg-white p-1">
              <button onClick={() => setSelectedProject("all")}
                className={`rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors ${selectedProject === "all" ? "bg-foreground text-white" : "text-muted hover:bg-surface"}`}>
                All Projects
              </button>
              {projectNames.map((pn) => (
                <button key={pn} onClick={() => setSelectedProject(pn)}
                  className={`rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors ${selectedProject === pn ? "bg-foreground text-white" : "text-muted hover:bg-surface"}`}>
                  {pn}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">

        {/* ══════════ 1. Project Cost Overview ══════════ */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground"><DollarSign size={18} className="text-white" /></div>
            <div>
              <h2 className="text-[16px] font-semibold">Project Cost Overview</h2>
              <p className="text-[11px] text-muted">{selectedProject === "all" ? "All specifications" : selectedProject}</p>
            </div>
          </div>

          {/* KPI ribbon */}
          <div className="grid grid-cols-6 gap-3 mb-6">
            {[
              { label: "Total Budget", value: fmt(filteredBudget), color: "text-foreground", sub: `${filteredRooms.length} rooms` },
              { label: "Premium", value: fmt(data.premiumTotal), color: "text-foreground", sub: `${data.totalBudget > 0 ? Math.round((data.premiumTotal / data.totalBudget) * 100) : 0}%` },
              { label: "Practical", value: fmt(data.practicalTotal), color: "text-emerald", sub: `${data.totalBudget > 0 ? Math.round((data.practicalTotal / data.totalBudget) * 100) : 0}%` },
              { label: "Cost Complete", value: `${data.costCompleteness}%`, color: data.costCompleteness >= 70 ? "text-emerald" : "text-amber", sub: "category coverage" },
              { label: "Procurement", value: `${data.procurementReadiness}%`, color: data.procurementReadiness >= 70 ? "text-emerald" : "text-amber", sub: "readiness" },
              { label: "Suppliers", value: `${data.supplierIntel.filter((s) => s.specifiedCount > 0).length}`, color: "text-foreground", sub: "active" },
            ].map((kpi) => (
              <div key={kpi.label} className="text-center rounded-xl bg-surface/50 p-4">
                <p className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">{kpi.label}</p>
                <p className={`mt-1 text-[22px] font-bold tracking-tight ${kpi.color}`}>{kpi.value}</p>
                <p className="text-[9px] text-muted mt-0.5">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Budget stacked bars */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">Budget by Room</p>
              <StackedBar segments={filteredRooms.map((r, i) => ({
                label: r.roomName.length > 8 ? r.roomName.slice(0, 6) + "…" : r.roomName,
                value: r.totalCost,
                color: ["#0a0a0a", "#333", "#555", "#777", "#999", "#bbb", "#ddd"][i % 7],
              }))} height={24} />
              <div className="mt-2 flex flex-wrap gap-2">
                {filteredRooms.map((r, i) => (
                  <span key={r.roomName + r.specId} className="flex items-center gap-1 text-[8px] text-muted">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ["#0a0a0a", "#333", "#555", "#777", "#999", "#bbb", "#ddd"][i % 7] }} />
                    {r.roomName}: {fmt(r.totalCost)}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">Budget by Category</p>
              <StackedBar segments={data.budgetByCategory.filter((c) => c.amount > 0).map((c, i) => ({
                label: c.category.length > 8 ? c.category.slice(0, 6) + "…" : c.category,
                value: c.amount,
                color: ["#059669", "#0a0a0a", "#d97706", "#3b82f6", "#e11d48", "#8b5cf6", "#737373"][i % 7],
              }))} height={24} />
              <div className="mt-2 flex flex-wrap gap-2">
                {data.budgetByCategory.filter((c) => c.amount > 0).map((c, i) => (
                  <span key={c.category} className="flex items-center gap-1 text-[8px] text-muted">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ["#059669", "#0a0a0a", "#d97706", "#3b82f6", "#e11d48", "#8b5cf6", "#737373"][i % 7] }} />
                    {c.category}: {fmt(c.amount)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Premium vs Practical split */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">Premium vs Practical Split</p>
            <div className="flex rounded-lg overflow-hidden h-6">
              <div className="bg-foreground flex items-center justify-center" style={{ width: `${data.totalBudget > 0 ? (data.premiumTotal / data.totalBudget) * 100 : 50}%` }}>
                <span className="text-[8px] font-bold text-white">Premium {fmt(data.premiumTotal)}</span>
              </div>
              <div className="bg-emerald flex items-center justify-center" style={{ width: `${data.totalBudget > 0 ? (data.practicalTotal / data.totalBudget) * 100 : 50}%` }}>
                <span className="text-[8px] font-bold text-white">Practical {fmt(data.practicalTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ 2. Category Cost Benchmarks ══════════ */}
        <div className="rounded-2xl border border-border bg-white overflow-hidden">
          <div className="p-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground"><BarChart3 size={16} className="text-white" /></div>
              <div>
                <h2 className="text-[14px] font-semibold">Category Cost Benchmarks</h2>
                <p className="text-[11px] text-muted">Average spend, percentiles, and project vs benchmark comparison</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface/30">
                  <th className="p-3 text-left"><span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">Category</span></th>
                  <th className="p-3 text-center"><span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">Products</span></th>
                  <th className="p-3 text-right"><span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">Avg Spend</span></th>
                  <th className="p-3 text-right"><span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">Range</span></th>
                  <th className="p-3 text-right"><span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">Premium</span></th>
                  <th className="p-3 text-right"><span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">Practical</span></th>
                  <th className="p-3 text-right"><span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">Project Avg</span></th>
                  <th className="p-3 text-center"><span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">Percentile</span></th>
                  <th className="p-3 text-center"><span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">vs Avg</span></th>
                </tr>
              </thead>
              <tbody>
                {data.categoryBenchmarks.map((bench) => {
                  const delta = bench.projectAvg - bench.avgSpend;
                  const deltaColor = delta > 0 ? "text-rose" : delta < 0 ? "text-emerald" : "text-muted";
                  return (
                    <tr key={bench.category} className="border-b border-border hover:bg-surface/20 transition-colors">
                      <td className="p-3"><span className="text-[11px] font-semibold">{bench.category}</span></td>
                      <td className="p-3 text-center"><span className="text-[11px] font-bold">{bench.productCount}</span></td>
                      <td className="p-3 text-right"><span className="text-[11px] font-semibold">{fmt(bench.avgSpend)}</span></td>
                      <td className="p-3 text-right"><span className="text-[10px] text-muted">{fmt(bench.minSpend)}–{fmt(bench.maxSpend)}</span></td>
                      <td className="p-3 text-right"><span className="text-[10px] text-muted">{fmt(bench.premiumBench)}</span></td>
                      <td className="p-3 text-right"><span className="text-[10px] text-muted">{fmt(bench.practicalBench)}</span></td>
                      <td className="p-3 text-right"><span className="text-[11px] font-bold">{bench.projectAvg > 0 ? fmt(bench.projectAvg) : "—"}</span></td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="w-12 h-[4px] bg-surface rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-foreground" style={{ width: `${bench.percentile}%` }} />
                          </div>
                          <span className="text-[9px] font-bold w-5">{bench.percentile}%</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        {bench.projectAvg > 0 ? (
                          <div className="flex items-center justify-center gap-0.5">
                            {delta > 0 ? <ArrowUpRight size={10} className="text-rose" /> : delta < 0 ? <ArrowDownRight size={10} className="text-emerald" /> : null}
                            <span className={`text-[10px] font-bold ${deltaColor}`}>{delta > 0 ? "+" : ""}{fmt(delta)}</span>
                          </div>
                        ) : <span className="text-[9px] text-muted">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ══════════ 3. Room Budget Analysis ══════════ */}
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground"><Home size={16} className="text-white" /></div>
            <div>
              <h2 className="text-[14px] font-semibold">Room Budget Analysis</h2>
              <p className="text-[11px] text-muted">Per-room cost breakdown, missing items, and optimization opportunities</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {filteredRooms.map((room) => {
              const isExpanded = expandedRoom === room.roomName + room.specId;
              const costPct = filteredBudget > 0 ? Math.round((room.totalCost / filteredBudget) * 100) : 0;

              return (
                <React.Fragment key={room.roomName + room.specId}>
                  <button onClick={() => setExpandedRoom(isExpanded ? null : room.roomName + room.specId)}
                    className={`rounded-xl border text-left transition-all p-4 ${isExpanded ? "border-foreground ring-2 ring-foreground/10 bg-surface/30 col-span-3" : "border-border hover:border-foreground/30"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Home size={12} className="text-muted" />
                        <span className="text-[12px] font-semibold">{room.roomName}</span>
                        <span className="text-[9px] text-muted">· {room.projectName}</span>
                      </div>
                      <ChevronDown size={12} className={`text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>

                    <p className="text-[20px] font-bold tracking-tight">{fmt(room.totalCost)}</p>
                    <p className="text-[9px] text-muted">{costPct}% of total · {room.items.length} items</p>

                    <div className="mt-2 h-[4px] bg-surface rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-foreground" style={{ width: `${costPct}%` }} />
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1">
                      {room.missingCategories.length > 0 && room.missingCategories.map((c) => (
                        <span key={c} className="rounded-full bg-amber-light px-1.5 py-0.5 text-[7px] font-bold text-amber">{c} missing</span>
                      ))}
                      {room.upgradeOpportunities.length > 0 && (
                        <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[7px] font-bold text-blue-600">{room.upgradeOpportunities.length} upgrades</span>
                      )}
                      {room.reductionOpportunities.length > 0 && (
                        <span className="rounded-full bg-emerald-light px-1.5 py-0.5 text-[7px] font-bold text-emerald">{room.reductionOpportunities.length} savings</span>
                      )}
                    </div>
                  </button>

                  {/* Expanded room detail */}
                  {isExpanded && (
                    <div className="col-span-3 rounded-xl border border-border bg-white p-5 -mt-1">
                      <div className="grid grid-cols-12 gap-5">
                        {/* Items table */}
                        <div className="col-span-5">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">Line Items</p>
                          <div className="rounded-lg border border-border overflow-hidden">
                            <table className="w-full">
                              <thead><tr className="bg-surface/40">
                                <th className="px-2 py-1.5 text-[8px] font-semibold uppercase text-muted text-left">Product</th>
                                <th className="px-2 py-1.5 text-[8px] font-semibold uppercase text-muted text-center">Qty</th>
                                <th className="px-2 py-1.5 text-[8px] font-semibold uppercase text-muted text-right">Unit</th>
                                <th className="px-2 py-1.5 text-[8px] font-semibold uppercase text-muted text-right">Total</th>
                                <th className="px-2 py-1.5 text-[8px] font-semibold uppercase text-muted text-center">Status</th>
                              </tr></thead>
                              <tbody>
                                {room.items.map((item) => (
                                  <tr key={item.product.id} className="border-t border-border">
                                    <td className="px-2 py-1.5">
                                      <p className="text-[10px] font-medium">{item.product.name}</p>
                                      <p className="text-[8px] text-muted">{item.product.brand}</p>
                                    </td>
                                    <td className="px-2 py-1.5 text-center text-[10px]">{item.quantity} {item.unit}</td>
                                    <td className="px-2 py-1.5 text-right text-[10px] font-medium">{item.product.price}</td>
                                    <td className="px-2 py-1.5 text-right text-[10px] font-bold">{fmt(item.totalCost)}</td>
                                    <td className="px-2 py-1.5 text-center">
                                      <span className={`rounded-full px-1.5 py-0.5 text-[7px] font-bold ${
                                        item.status === "installed" ? "bg-emerald-light text-emerald" :
                                        item.status === "delivered" ? "bg-blue-50 text-blue-600" :
                                        item.status === "ordered" ? "bg-amber-light text-amber" :
                                        "bg-surface text-muted"
                                      }`}>{item.status}</span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Missing + upgrades */}
                        <div className="col-span-3 space-y-4">
                          {room.missingCategories.length > 0 && (
                            <div className="rounded-lg border border-amber/20 bg-amber-light/20 p-3">
                              <p className="text-[9px] font-bold uppercase text-amber mb-1.5">Missing Cost Items</p>
                              {room.missingCategories.map((c) => (
                                <p key={c} className="text-[10px] font-medium flex items-center gap-1">
                                  <AlertTriangle size={9} className="text-amber" /> {c}
                                </p>
                              ))}
                            </div>
                          )}
                          {room.upgradeOpportunities.length > 0 && (
                            <div className="rounded-lg border border-blue-200 bg-blue-50/30 p-3">
                              <p className="text-[9px] font-bold uppercase text-blue-500 mb-1.5">Upgrade Opportunities</p>
                              {room.upgradeOpportunities.map((up, i) => (
                                <div key={i} className="text-[9px] mb-1">
                                  <span className="font-medium">{up.current.name}</span>
                                  <span className="text-muted"> → </span>
                                  <span className="font-medium">{up.upgrade.name}</span>
                                  <span className="text-blue-500 font-bold"> +{fmt(up.delta)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Savings */}
                        <div className="col-span-4 space-y-4">
                          {room.reductionOpportunities.length > 0 && (
                            <div className="rounded-lg border border-emerald/20 bg-emerald-light/20 p-3">
                              <p className="text-[9px] font-bold uppercase text-emerald mb-1.5">Cost Reduction Options</p>
                              {room.reductionOpportunities.map((red, i) => (
                                <div key={i} className="text-[9px] mb-1">
                                  <span className="font-medium">{red.current.name}</span>
                                  <span className="text-muted"> → </span>
                                  <span className="font-medium">{red.cheaper.name}</span>
                                  <span className="text-emerald font-bold"> -{fmt(red.savings)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="rounded-lg bg-surface/50 p-3">
                            <p className="text-[9px] font-semibold uppercase text-muted mb-1">Room Budget Summary</p>
                            <p className="text-[18px] font-bold">{fmt(room.totalCost)}</p>
                            <p className="text-[9px] text-muted">{costPct}% of total project budget</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ══════════ 4. Product Cost Comparison ══════════ */}
        <div className="rounded-2xl border border-border bg-white overflow-hidden">
          <div className="p-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground"><Repeat2 size={16} className="text-white" /></div>
              <div>
                <h2 className="text-[14px] font-semibold">Product Cost Comparison</h2>
                <p className="text-[11px] text-muted">Price range, category benchmarks, premium index, and value scores</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface/30">
                  <th className="p-3 text-left"><span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">Product</span></th>
                  <th className="p-3 text-right"><span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">Price</span></th>
                  <th className="p-3 text-right"><span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">Cat Avg</span></th>
                  <th className="p-3 text-center"><span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">vs Avg</span></th>
                  <th className="p-3 text-center"><span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">Premium Idx</span></th>
                  <th className="p-3 text-center"><span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">Value</span></th>
                  <th className="p-3 text-center"><span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">Substitutes</span></th>
                  <th className="p-3 w-8" />
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const price = parsePrice(product.price);
                  const bench = data.categoryBenchmarks.find((b) => b.category === product.category);
                  const catAvg = bench?.avgSpend || 0;
                  const delta = price - catAvg;
                  const premiumIndex = catAvg > 0 ? Math.round((price / catAvg) * 100) : 100;
                  const valueScore = clamp(100 - Math.abs(premiumIndex - 100), 0, 100);
                  const subs = products.filter((p) => p.category === product.category && p.id !== product.id);
                  const isExpanded = expandedProduct === product.id;

                  return (
                    <React.Fragment key={product.id}>
                      <tr className={`border-b border-border transition-colors cursor-pointer ${isExpanded ? "bg-surface/30" : "hover:bg-surface/15"}`}
                        onClick={() => setExpandedProduct(isExpanded ? null : product.id)}>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <ChevronRight size={10} className={`text-muted transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                            <div>
                              <p className="text-[11px] font-semibold">{product.name}</p>
                              <p className="text-[9px] text-muted">{product.brand} · {product.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-right"><span className="text-[11px] font-bold">{product.price}</span></td>
                        <td className="p-3 text-right"><span className="text-[10px] text-muted">{catAvg > 0 ? fmt(catAvg) : "—"}</span></td>
                        <td className="p-3 text-center">
                          {catAvg > 0 ? (
                            <span className={`text-[10px] font-bold ${delta > 0 ? "text-rose" : delta < 0 ? "text-emerald" : "text-muted"}`}>
                              {delta > 0 ? "+" : ""}{fmt(delta)}
                            </span>
                          ) : <span className="text-[9px] text-muted">—</span>}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${premiumIndex >= 130 ? "bg-foreground text-white" : premiumIndex >= 80 ? "bg-surface text-foreground" : "bg-emerald-light text-emerald"}`}>
                            {premiumIndex}%
                          </span>
                        </td>
                        <td className="p-3 text-center"><ScoreRing score={valueScore} size={28} strokeWidth={2.5} /></td>
                        <td className="p-3 text-center"><span className="text-[10px] font-medium text-muted">{subs.length}</span></td>
                        <td className="p-3">
                          <button onClick={(e) => { e.stopPropagation(); toggleQuote(product.id); }}
                            className={`rounded p-1 transition-colors ${quoteProducts.has(product.id) ? "bg-foreground text-white" : "bg-surface text-muted hover:bg-foreground hover:text-white"}`}>
                            <Bookmark size={9} />
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="border-b border-border bg-surface/10">
                          <td colSpan={8} className="px-5 py-3">
                            <div className="grid grid-cols-12 gap-4">
                              <div className="col-span-4">
                                <p className="text-[9px] font-semibold uppercase text-muted mb-1.5">Price Range in {product.category}</p>
                                <div className="relative h-6 bg-surface rounded-full overflow-hidden">
                                  {bench && bench.maxSpend > 0 && (
                                    <>
                                      <div className="absolute h-full bg-emerald/20 rounded-l-full" style={{ width: `${(bench.practicalBench / bench.maxSpend) * 100}%` }} />
                                      <div className="absolute h-full w-0.5 bg-foreground" style={{ left: `${(price / bench.maxSpend) * 100}%` }} title="This product" />
                                      <div className="absolute h-full w-0.5 bg-muted/40" style={{ left: `${(bench.avgSpend / bench.maxSpend) * 100}%` }} title="Average" />
                                    </>
                                  )}
                                </div>
                                <div className="flex justify-between text-[7px] text-muted mt-0.5">
                                  <span>{fmt(bench?.minSpend || 0)}</span>
                                  <span>Avg: {fmt(bench?.avgSpend || 0)}</span>
                                  <span>{fmt(bench?.maxSpend || 0)}</span>
                                </div>
                              </div>
                              <div className="col-span-8">
                                <p className="text-[9px] font-semibold uppercase text-muted mb-1.5">Substitute Alternatives</p>
                                <div className="flex flex-wrap gap-2">
                                  {subs.slice(0, 4).map((sub) => {
                                    const subPrice = parsePrice(sub.price);
                                    const d = subPrice - price;
                                    return (
                                      <div key={sub.id} className="rounded-lg border border-border px-2.5 py-1.5 text-[9px]">
                                        <p className="font-semibold">{sub.name}</p>
                                        <p className="text-muted">{sub.brand} · {sub.price}</p>
                                        <span className={`font-bold ${d < 0 ? "text-emerald" : d > 0 ? "text-rose" : "text-muted"}`}>
                                          {d > 0 ? "+" : ""}{fmt(d)}
                                        </span>
                                      </div>
                                    );
                                  })}
                                  {subs.length === 0 && <span className="text-[9px] text-muted italic">No alternatives in this category</span>}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ══════════ 5. Procurement Intelligence ══════════ */}
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground"><Truck size={16} className="text-white" /></div>
            <div>
              <h2 className="text-[14px] font-semibold">Procurement Intelligence</h2>
              <p className="text-[11px] text-muted">Supplier availability, lead times, and procurement readiness</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <ScoreRing score={data.procurementReadiness} size={40} strokeWidth={3} />
              <div>
                <p className="text-[11px] font-bold">{data.procurementReadiness}%</p>
                <p className="text-[8px] text-muted">Readiness</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Supply concentration */}
            <div className="rounded-xl border border-border p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-3">Supply Concentration by Category</p>
              <div className="space-y-2">
                {data.budgetByCategory.filter((c) => c.amount > 0).map((cat) => {
                  const suppliers = data.supplierIntel.filter((s) => products.some((p) => p.category === cat.category && p.brandId === s.brandId));
                  return (
                    <div key={cat.category} className="flex items-center gap-2">
                      <span className="w-16 text-[10px] font-medium truncate">{cat.category}</span>
                      <MatchBar score={data.totalBudget > 0 ? (cat.amount / data.totalBudget) * 100 : 0} height={5} />
                      <span className="text-[9px] font-bold text-muted w-4">{suppliers.length}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommended suppliers */}
            <div className="rounded-xl border border-border p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-3">Recommended Suppliers</p>
              <div className="space-y-2">
                {data.supplierIntel.filter((s) => s.specifiedCount > 0 || s.totalValue > 0).slice(0, 5).map((supplier) => (
                  <div key={supplier.brandId} className="flex items-center gap-3 rounded-lg bg-surface/30 px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold">{supplier.brandName}</p>
                      <p className="text-[8px] text-muted">{supplier.category} · {supplier.productCount} products</p>
                    </div>
                    <span className={`rounded-full px-1.5 py-0.5 text-[7px] font-bold ${
                      supplier.availability === "in-stock" ? "bg-emerald-light text-emerald" :
                      supplier.availability === "lead-time" ? "bg-amber-light text-amber" :
                      "bg-rose-light text-rose"
                    }`}>{supplier.availability === "in-stock" ? "In Stock" : supplier.availability === "lead-time" ? "Lead Time" : "MTO"}</span>
                    <div className="text-center shrink-0">
                      <p className="text-[10px] font-bold">{supplier.leadTimeDays}d</p>
                      <p className="text-[7px] text-muted">lead</p>
                    </div>
                    <ScoreRing score={supplier.readiness} size={28} strokeWidth={2} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Supplier table */}
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-surface/30">
                  <th className="p-2.5 text-left"><span className="text-[8px] font-semibold uppercase tracking-wider text-muted">Supplier</span></th>
                  <th className="p-2.5 text-center"><span className="text-[8px] font-semibold uppercase tracking-wider text-muted">Products</span></th>
                  <th className="p-2.5 text-center"><span className="text-[8px] font-semibold uppercase tracking-wider text-muted">Specified</span></th>
                  <th className="p-2.5 text-center"><span className="text-[8px] font-semibold uppercase tracking-wider text-muted">Availability</span></th>
                  <th className="p-2.5 text-center"><span className="text-[8px] font-semibold uppercase tracking-wider text-muted">Lead Time</span></th>
                  <th className="p-2.5 text-right"><span className="text-[8px] font-semibold uppercase tracking-wider text-muted">Value</span></th>
                  <th className="p-2.5 text-center"><span className="text-[8px] font-semibold uppercase tracking-wider text-muted">Readiness</span></th>
                </tr>
              </thead>
              <tbody>
                {data.supplierIntel.map((supplier) => (
                  <tr key={supplier.brandId} className="border-t border-border hover:bg-surface/15">
                    <td className="p-2.5">
                      <p className="text-[10px] font-semibold">{supplier.brandName}</p>
                      <p className="text-[8px] text-muted">{supplier.category}</p>
                    </td>
                    <td className="p-2.5 text-center text-[10px] font-medium">{supplier.productCount}</td>
                    <td className="p-2.5 text-center text-[10px] font-bold">{supplier.specifiedCount}</td>
                    <td className="p-2.5 text-center">
                      <span className={`rounded-full px-1.5 py-0.5 text-[7px] font-bold ${
                        supplier.availability === "in-stock" ? "bg-emerald-light text-emerald" :
                        supplier.availability === "lead-time" ? "bg-amber-light text-amber" :
                        "bg-rose-light text-rose"
                      }`}>{supplier.availability === "in-stock" ? "In Stock" : supplier.availability === "lead-time" ? "Lead Time" : "Made to Order"}</span>
                    </td>
                    <td className="p-2.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock size={9} className="text-muted" />
                        <span className="text-[10px] font-medium">{supplier.leadTimeDays} days</span>
                      </div>
                    </td>
                    <td className="p-2.5 text-right text-[10px] font-bold">{supplier.totalValue > 0 ? fmt(supplier.totalValue) : "—"}</td>
                    <td className="p-2.5 text-center"><ScoreRing score={supplier.readiness} size={26} strokeWidth={2} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ══════════ 6. Budget Optimization ══════════ */}
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground"><Sparkles size={16} className="text-white" /></div>
              <div>
                <h2 className="text-[14px] font-semibold">Budget Optimization</h2>
                <p className="text-[11px] text-muted">AI-suggested substitutes, upgrades, and cost trade-offs</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-xl border border-border p-1">
                {(["all", "substitute", "upgrade"] as const).map((f) => (
                  <button key={f} onClick={() => setOptFilter(f)}
                    className={`rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors ${optFilter === f ? "bg-foreground text-white" : "text-muted hover:bg-surface"}`}>
                    {f === "all" ? "All" : f === "substitute" ? "Savings" : "Upgrades"}
                  </button>
                ))}
              </div>
              <button onClick={() => setOptSort(optSort === "budgetImpact" ? "confidence" : "budgetImpact")}
                className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[10px] font-medium text-muted hover:bg-surface transition-colors">
                <ArrowUpDown size={10} /> {optSort === "budgetImpact" ? "By Impact" : "By Confidence"}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {sortedOptMoves.slice(0, 10).map((move, i) => {
              const isSaving = move.budgetImpact < 0;
              return (
                <div key={i} className={`rounded-xl border p-4 ${isSaving ? "border-emerald/20 bg-emerald-light/10" : "border-blue-200 bg-blue-50/20"}`}>
                  <div className="flex items-center gap-4">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${isSaving ? "bg-emerald-light" : "bg-blue-100"}`}>
                      {isSaving ? <ArrowDownRight size={14} className="text-emerald" /> : <ArrowUpRight size={14} className="text-blue-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-semibold">{move.current.name}</span>
                        <ChevronRight size={10} className="text-muted" />
                        <span className="text-[11px] font-semibold">{move.suggested.name}</span>
                        <span className={`rounded-full px-1.5 py-0.5 text-[7px] font-bold uppercase ${move.type === "substitute" ? "bg-emerald-light text-emerald" : "bg-blue-100 text-blue-600"}`}>
                          {move.type}
                        </span>
                      </div>
                      <p className="text-[9px] text-muted">{move.reason}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-[14px] font-bold ${isSaving ? "text-emerald" : "text-blue-500"}`}>
                        {isSaving ? "" : "+"}{fmt(move.budgetImpact)}
                      </p>
                      <p className="text-[8px] text-muted">budget impact</p>
                    </div>
                    <div className="text-center shrink-0">
                      <ScoreRing score={move.confidence} size={32} strokeWidth={2.5} />
                      <p className="text-[7px] text-muted mt-0.5">confidence</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4">
            {(() => {
              const savings = sortedOptMoves.filter((m) => m.budgetImpact < 0).reduce((s, m) => s + Math.abs(m.budgetImpact), 0);
              const upgradeCost = sortedOptMoves.filter((m) => m.budgetImpact > 0).reduce((s, m) => s + m.budgetImpact, 0);
              return (
                <>
                  <div className="rounded-xl bg-emerald-light/20 p-3 text-center">
                    <p className="text-[9px] font-semibold uppercase text-emerald">Potential Savings</p>
                    <p className="text-[18px] font-bold text-emerald">{fmt(savings)}</p>
                    <p className="text-[8px] text-muted">{sortedOptMoves.filter((m) => m.budgetImpact < 0).length} moves</p>
                  </div>
                  <div className="rounded-xl bg-blue-50/30 p-3 text-center">
                    <p className="text-[9px] font-semibold uppercase text-blue-500">Upgrade Cost</p>
                    <p className="text-[18px] font-bold text-blue-500">{fmt(upgradeCost)}</p>
                    <p className="text-[8px] text-muted">{sortedOptMoves.filter((m) => m.budgetImpact > 0).length} moves</p>
                  </div>
                  <div className="rounded-xl bg-surface/50 p-3 text-center">
                    <p className="text-[9px] font-semibold uppercase text-muted">Net Impact</p>
                    <p className={`text-[18px] font-bold ${savings > upgradeCost ? "text-emerald" : "text-rose"}`}>
                      {savings > upgradeCost ? "-" : "+"}{fmt(Math.abs(savings - upgradeCost))}
                    </p>
                    <p className="text-[8px] text-muted">if all applied</p>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* ══════════ 7. Procurement Actions ══════════ */}
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground"><ClipboardList size={16} className="text-white" /></div>
            <div>
              <h2 className="text-[14px] font-semibold">Procurement Actions</h2>
              <p className="text-[11px] text-muted">{quoteProducts.size} products in quote request set</p>
            </div>
          </div>

          {/* Action cards */}
          <div className="grid grid-cols-5 gap-3 mb-5">
            {[
              { label: "Generate Quote Set", sub: `${quoteProducts.size} products`, icon: ClipboardList, active: quoteProducts.size > 0, onClick: () => {} },
              { label: "Send to Suppliers", sub: `${data.supplierIntel.filter((s) => s.specifiedCount > 0).length} suppliers`, icon: Send, active: sentToSupplier.size > 0, onClick: () => { const n = new Set(sentToSupplier); data.supplierIntel.forEach((s) => n.add(s.brandId)); setSentToSupplier(n); } },
              { label: "Export List", sub: "PDF / CSV", icon: Download, active: exportedList, onClick: () => setExportedList(true) },
              { label: "Create Plan", sub: "Procurement timeline", icon: Target, active: planCreated, onClick: () => setPlanCreated(true) },
              { label: "Compare Scenarios", sub: "Premium vs Practical", icon: Repeat2, active: false, onClick: () => {} },
            ].map((action) => (
              <button key={action.label} onClick={action.onClick}
                className={`rounded-xl border p-3 text-left transition-all group ${action.active ? "border-foreground bg-foreground/5" : "border-border hover:border-foreground/30 hover:shadow-sm"}`}>
                <div className="flex items-center justify-between mb-2">
                  <action.icon size={16} className={`${action.active ? "text-foreground" : "text-muted group-hover:text-foreground"} transition-colors`} />
                  {action.active && <CheckCircle2 size={12} className="text-emerald" />}
                </div>
                <p className="text-[11px] font-semibold">{action.label}</p>
                <p className="text-[9px] text-muted mt-0.5">{action.sub}</p>
              </button>
            ))}
          </div>

          {/* Supplier scenario comparison */}
          <div className="rounded-xl border border-border p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-3">Supplier Scenario Comparison</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-foreground/20 bg-surface/20 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Star size={10} className="text-foreground" />
                  <p className="text-[11px] font-semibold">Premium Scenario</p>
                </div>
                <p className="text-[18px] font-bold">{fmt(data.premiumTotal + data.practicalTotal * 0.3)}</p>
                <p className="text-[9px] text-muted mt-1">All premium products where available, practical fallback</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {data.supplierIntel.filter((s) => s.totalValue > 0).slice(0, 3).map((s) => (
                    <span key={s.brandId} className="rounded-full bg-surface px-1.5 py-0.5 text-[7px] font-semibold text-foreground">{s.brandName}</span>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-emerald/20 bg-emerald-light/10 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Package size={10} className="text-emerald" />
                  <p className="text-[11px] font-semibold">Practical Scenario</p>
                </div>
                <p className="text-[18px] font-bold text-emerald">{fmt(data.practicalTotal + data.premiumTotal * 0.4)}</p>
                <p className="text-[9px] text-muted mt-1">All practical substitutes where available, premium only when required</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {data.supplierIntel.filter((s) => s.totalValue > 0).slice(0, 3).map((s) => (
                    <span key={s.brandId} className="rounded-full bg-emerald-light px-1.5 py-0.5 text-[7px] font-semibold text-emerald">{s.brandName}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-center gap-4 text-[10px]">
              <span>Premium vs Practical Δ: <strong className="text-foreground">{fmt(Math.abs((data.premiumTotal + data.practicalTotal * 0.3) - (data.practicalTotal + data.premiumTotal * 0.4)))}</strong></span>
              <span>·</span>
              <span>{data.supplierIntel.filter((s) => s.specifiedCount > 0).length} suppliers involved</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
