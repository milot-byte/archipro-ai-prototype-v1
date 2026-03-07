"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { architects, brands, products, projects, type Product } from "@/lib/mock-data";
import {
  productMomentumData,
  architectInfluenceData,
  specifications,
  designBoards,
  type ArchitectInfluence,
} from "@/lib/intelligence-data";
import {
  ArrowLeft,
  Zap,
  Target,
  Users,
  Layers,
  Palette,
  Brain,
  Bookmark,
  Plus,
  Download,
  ChevronRight,
  ChevronDown,
  Check,
  Star,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  ArrowUpDown,
  CircleDot,
  Sparkles,
  Shield,
  Box,
  Home,
  Grid3x3,
  Eye,
  Repeat2,
  Crown,
  Wallet,
  FileText,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Brief {
  id: string;
  title: string;
  type: string;
  style: string;
  budget: string;
  location: string;
  rooms: string[];
  features: string[];
  materials: string[];
}

interface BriefProductMatch {
  product: Product;
  score: number;
  reasons: string[];
  categoryFit: boolean;
  styleFit: boolean;
  momentumTrend: string;
  momentumScore: number;
  // ─── Granular score breakdown ───
  styleScore: number;       // 0-100 style compatibility
  materialScore: number;    // 0-100 material compatibility
  roomScore: number;        // 0-100 room relevance
  categoryScore: number;    // 0-100 category fit
  trendScore: number;       // 0-100 trend alignment
  precedentScore: number;   // 0-100 architect precedent
  weeklySparkline: number[];
  substituteIds: string[];  // product ids that could substitute
  tier: "premium" | "practical";
}

interface BriefArchitectMatch {
  architect: (typeof architects)[number];
  score: number;
  reasons: string[];
  influence: ArchitectInfluence | undefined;
  similarProjects: (typeof projects)[number][];
  styleOverlap: string[];
}

interface ProjectProductMatch {
  project: (typeof projects)[number];
  projectProducts: (typeof products[number] | undefined)[];
  missingCategories: string[];
  recommended: { product: Product; score: number; reasons: string[]; isPremium: boolean }[];
  usedCategories: Set<string>;
}

interface RoomMatch {
  roomName: string;
  topCategories: [string, number][];
  topProducts: { id: string; name: string; count: number; brand: string }[];
  missing: string[];
  recommended: Product[];
}

interface RecommendationSignal {
  name: string;
  weight: number;
  description: string;
  factors: string[];
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function parsePrice(p: string): number {
  const n = parseFloat(p.replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 0 : n;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

// ─── Mock Briefs ──────────────────────────────────────────────────────────────

const mockBriefs: Brief[] = [
  {
    id: "brief-1",
    title: "Coastal Family Home",
    type: "New build",
    style: "Contemporary",
    budget: "$500k – $1M",
    location: "Coastal",
    rooms: ["Kitchen", "Living Room", "Master Bedroom", "Outdoor Deck", "Bathroom"],
    features: ["Indoor-outdoor flow", "Natural light", "Sustainability"],
    materials: ["Timber", "Stone", "Glass"],
  },
  {
    id: "brief-2",
    title: "Urban Apartment Renovation",
    type: "Renovation",
    style: "Minimalist",
    budget: "$200k – $500k",
    location: "Urban",
    rooms: ["Kitchen", "Living Room", "Home Office", "Bedroom"],
    features: ["Storage", "Home office", "Natural light"],
    materials: ["Concrete", "Steel", "Engineered wood"],
  },
  {
    id: "brief-3",
    title: "Heritage Garden Extension",
    type: "Extension",
    style: "Heritage",
    budget: "$200k – $500k",
    location: "Suburban",
    rooms: ["Garden Room", "Kitchen Nook", "Pergola", "Studio"],
    features: ["Indoor-outdoor flow", "Entertaining", "Sustainability"],
    materials: ["Timber", "Brick", "Natural stone"],
  },
];

// ─── Computation Functions ────────────────────────────────────────────────────

function computeBriefProductMatches(brief: Brief): BriefProductMatch[] {
  const styleKeywords = [brief.style.toLowerCase(), ...brief.features.map((f) => f.toLowerCase())];
  const materialKeywords = brief.materials.map((m) => m.toLowerCase());
  const roomCategories: Record<string, string[]> = {
    Kitchen: ["Hardware", "Kitchen", "Surfaces", "Lighting"],
    "Living Room": ["Lighting", "Furniture", "Surfaces"],
    "Master Bedroom": ["Lighting", "Furniture", "Surfaces"],
    "Outdoor Deck": ["Decking", "Outdoor"],
    Bathroom: ["Surfaces", "Hardware", "Lighting"],
    "Home Office": ["Lighting", "Furniture"],
    Bedroom: ["Lighting", "Furniture"],
    "Garden Room": ["Furniture", "Lighting", "Surfaces"],
    "Kitchen Nook": ["Kitchen", "Hardware"],
    Pergola: ["Outdoor"],
    Studio: ["Lighting", "Furniture"],
  };

  const neededCategories = new Set<string>();
  brief.rooms.forEach((r) => {
    (roomCategories[r] || []).forEach((c) => neededCategories.add(c));
  });

  // Seeded pseudo-random for deterministic synthetic scores
  const seed = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  };

  return products.map((product) => {
    const reasons: string[] = [];
    const productNameLower = product.name.toLowerCase();
    const brandNameLower = product.brand.toLowerCase();
    const momentum = productMomentumData.find((m) => m.productId === product.id);

    // ── Style score ──
    const styleHits = styleKeywords.filter((k) => productNameLower.includes(k) || brandNameLower.includes(k));
    const styleFit = styleHits.length > 0;
    // Deterministic synthetic: base from data, with hash jitter
    const styleBase = styleFit ? 70 : 20;
    const styleJitter = (seed(product.id + brief.style) % 30);
    const styleScore = clamp(styleBase + styleJitter, 0, 100);
    if (styleFit) reasons.push(`Style alignment: ${brief.style}`);

    // ── Material score ──
    const matHits = materialKeywords.filter((m) => productNameLower.includes(m) || brandNameLower.includes(m));
    const materialBase = matHits.length > 0 ? 65 + matHits.length * 15 : 15;
    const materialJitter = (seed(product.id + "mat") % 25);
    const materialScore = clamp(materialBase + materialJitter, 0, 100);
    if (matHits.length > 0) reasons.push(`Material match: ${matHits.join(", ")}`);

    // ── Room relevance ──
    const roomRelevant = neededCategories.has(product.category);
    const roomRoomCount = brief.rooms.filter((r) => (roomCategories[r] || []).includes(product.category)).length;
    const roomScore = clamp(roomRelevant ? 40 + roomRoomCount * 15 + (seed(product.id + "room") % 20) : 10 + (seed(product.id + "room") % 15), 0, 100);
    if (roomRelevant) reasons.push(`Relevant to ${roomRoomCount} room${roomRoomCount > 1 ? "s" : ""}`);

    // ── Category fit ──
    const categoryFit = neededCategories.has(product.category);
    const categoryScore = categoryFit ? clamp(70 + (seed(product.id + "cat") % 30), 0, 100) : clamp(5 + (seed(product.id + "cat") % 20), 0, 100);
    if (categoryFit) reasons.push(`Matches ${product.category} category need`);

    // ── Trend alignment ──
    const trendMap: Record<string, number> = { surging: 90, rising: 70, steady: 40, cooling: 20 };
    const trendBase = trendMap[momentum?.trend || "steady"] || 40;
    const trendScore = clamp(trendBase + (seed(product.id + "trend") % 15), 0, 100);
    if (momentum?.trend === "surging") reasons.push("Currently surging in momentum");
    else if (momentum?.trend === "rising") reasons.push("Rising momentum trend");

    // ── Architect precedent ──
    const usedInProjects = projects.filter((p) => p.products.includes(product.id));
    const usedByMultiple = new Set(usedInProjects.map((p) => p.architectId)).size;
    const precedentScore = clamp(usedByMultiple * 25 + usedInProjects.length * 10 + (seed(product.id + "prec") % 15), 0, 100);
    if (usedInProjects.length > 0) reasons.push(`Used in ${usedInProjects.length} project${usedInProjects.length > 1 ? "s" : ""} by ${usedByMultiple} architect${usedByMultiple > 1 ? "s" : ""}`);

    if (product.specSheet) reasons.push("Spec sheet available");

    // ── Composite score (weighted) ──
    const score = clamp(Math.round(
      styleScore * 0.18 +
      materialScore * 0.17 +
      roomScore * 0.15 +
      categoryScore * 0.20 +
      trendScore * 0.15 +
      precedentScore * 0.15
    ), 0, 100);

    // ── Weekly sparkline ──
    const weeklySparkline = momentum
      ? momentum.weeklyData.map((d) => d.views)
      : Array.from({ length: 7 }, (_, i) => 100 + (seed(product.id + `w${i}`) % 400));

    // ── Substitutes: same category, different brand ──
    const substituteIds = products
      .filter((p) => p.category === product.category && p.id !== product.id && p.brandId !== product.brandId)
      .slice(0, 3)
      .map((p) => p.id);

    // ── Tier ──
    const tier: "premium" | "practical" = parsePrice(product.price) > 400 ? "premium" : "practical";

    return {
      product,
      score,
      reasons,
      categoryFit,
      styleFit,
      momentumTrend: momentum?.trend || "steady",
      momentumScore: momentum?.momentumScore || 0,
      styleScore,
      materialScore,
      roomScore,
      categoryScore,
      trendScore,
      precedentScore,
      weeklySparkline,
      substituteIds,
      tier,
    };
  }).sort((a, b) => b.score - a.score);
}

function computeBriefArchitectMatches(brief: Brief): BriefArchitectMatch[] {
  return architects.map((arch) => {
    let score = 0;
    const reasons: string[] = [];
    const influence = architectInfluenceData.find((a) => a.architectId === arch.id);

    const styleOverlap = arch.specialties.filter((s) =>
      [brief.style, brief.type, brief.location, ...brief.features].some(
        (f) => f.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(f.toLowerCase())
      )
    );
    if (styleOverlap.length > 0) {
      score += styleOverlap.length * 15;
      reasons.push(`Style match: ${styleOverlap.join(", ")}`);
    }

    const archProjects = projects.filter((p) => p.architectId === arch.id);
    const locationMatches = archProjects.filter((p) =>
      brief.location.toLowerCase().split(" ").some((l) => p.tags.some((t) => t.toLowerCase().includes(l)))
    );
    if (locationMatches.length > 0) {
      score += 15;
      reasons.push(`${locationMatches.length} similar location project${locationMatches.length > 1 ? "s" : ""}`);
    }

    if (influence) {
      score += Math.round(influence.influenceScore * 0.2);
      reasons.push(`Influence score: ${influence.influenceScore}`);
    }

    score += Math.min(arch.projectCount * 2, 15);
    reasons.push(`${arch.projectCount} projects completed`);

    const similarProjects = archProjects.filter((p) =>
      p.tags.some((t) => [brief.style, brief.type, ...brief.features].some((f) => f.toLowerCase() === t.toLowerCase()))
    );

    return {
      architect: arch,
      score: clamp(score, 0, 100),
      reasons,
      influence,
      similarProjects,
      styleOverlap,
    };
  }).sort((a, b) => b.score - a.score);
}

function computeProjectProductMatches(): ProjectProductMatch[] {
  return projects.map((project) => {
    const projectProducts = project.products.map((pid) => products.find((p) => p.id === pid)).filter(Boolean);
    const usedCategories = new Set(projectProducts.map((p) => p!.category));
    const allCategories = [...new Set(products.map((p) => p.category))];
    const missingCategories = allCategories.filter((c) => !usedCategories.has(c));

    const recommended = products
      .filter((p) => !project.products.includes(p.id))
      .map((p) => {
        let score = 0;
        const reasons: string[] = [];

        if (missingCategories.includes(p.category)) {
          score += 30;
          reasons.push(`Fills missing ${p.category} category`);
        }

        const momentum = productMomentumData.find((m) => m.productId === p.id);
        if (momentum) {
          score += Math.round(momentum.momentumScore * 0.2);
          if (momentum.trend === "surging") reasons.push("Surging momentum");
        }

        const usedByArchitect = projects.filter(
          (pr) => pr.architectId === project.architectId && pr.products.includes(p.id)
        );
        if (usedByArchitect.length > 0) {
          score += 20;
          reasons.push("Used by this architect before");
        }

        const brandUsed = projectProducts.some((pp) => pp!.brandId === p.brandId);
        if (brandUsed) {
          score += 10;
          reasons.push("Same brand already in project");
        }

        return { product: p, score: clamp(score, 0, 100), reasons, isPremium: parsePrice(p.price) > 500 };
      })
      .sort((a, b) => b.score - a.score);

    return { project, projectProducts, missingCategories, recommended, usedCategories };
  });
}

function computeRoomMatches(): RoomMatch[] {
  const roomData: Record<string, { categories: Map<string, number>; products: Map<string, { name: string; count: number; brand: string }> }> = {};

  specifications.forEach((spec) => {
    spec.rooms.forEach((room) => {
      const key = room.name;
      if (!roomData[key]) {
        roomData[key] = { categories: new Map(), products: new Map() };
      }
      room.items.forEach((item) => {
        roomData[key].categories.set(item.category, (roomData[key].categories.get(item.category) || 0) + 1);
        const existing = roomData[key].products.get(item.productId);
        if (existing) existing.count++;
        else roomData[key].products.set(item.productId, { name: item.productName, count: 1, brand: item.brand });
      });
    });
  });

  return Object.entries(roomData).map(([roomName, data]) => {
    const topCategories = [...data.categories.entries()].sort((a, b) => b[1] - a[1]) as [string, number][];
    const topProducts = [...data.products.entries()]
      .map(([id, info]) => ({ id, ...info }))
      .sort((a, b) => b.count - a.count);

    const usedCats = new Set(topCategories.map(([c]) => c));
    const allCats = [...new Set(products.map((p) => p.category))];
    const missing = allCats.filter((c) => !usedCats.has(c));

    const recommended = products
      .filter((p) => missing.includes(p.category) && !data.products.has(p.id))
      .slice(0, 3);

    return { roomName, topCategories, topProducts, missing, recommended };
  });
}

function computeStyleMaterialMatrix() {
  const styles = [...new Set(projects.flatMap((p) => p.tags))];
  const categories = [...new Set(products.map((p) => p.category))];

  const matrix: Record<string, Record<string, number>> = {};
  styles.forEach((s) => {
    matrix[s] = {};
    categories.forEach((c) => (matrix[s][c] = 0));
  });

  projects.forEach((proj) => {
    const projProducts = proj.products.map((pid) => products.find((p) => p.id === pid)).filter(Boolean);
    proj.tags.forEach((tag) => {
      projProducts.forEach((p) => {
        if (matrix[tag]) matrix[tag][p!.category] = (matrix[tag][p!.category] || 0) + 1;
      });
    });
  });

  return { styles, categories, matrix };
}

function computeRecommendationLogic(): RecommendationSignal[] {
  return [
    { name: "Architect Influence", weight: 25, description: "How strongly an architect's usage patterns influence product recommendations", factors: ["Product saves", "Spec downloads", "Board additions", "Enquiries generated"] },
    { name: "Product Momentum", weight: 20, description: "Current trending strength and growth trajectory of products", factors: ["View growth rate", "Save velocity", "Board additions", "Spec inclusions"] },
    { name: "Category Fit", weight: 20, description: "Whether the product fills a missing category gap in the brief or project", factors: ["Room requirements", "Missing categories", "Category coverage"] },
    { name: "Style Alignment", weight: 15, description: "How well the product matches the stated style preferences and materials", factors: ["Style tag overlap", "Material keywords", "Design language"] },
    { name: "Co-occurrence", weight: 10, description: "Products frequently used together in projects, boards, and specifications", factors: ["Project co-usage", "Board co-existence", "Spec room pairings"] },
    { name: "Brand Affinity", weight: 10, description: "Whether the brand is already used or preferred by the architect", factors: ["Existing brand usage", "Brand influence score", "Supplier relationship"] },
  ];
}

// ─── Tab Config ───────────────────────────────────────────────────────────────

const tabs = [
  { id: "brief-product", label: "Brief → Product", icon: Target },
  { id: "brief-architect", label: "Brief → Architect", icon: Users },
  { id: "project-product", label: "Project → Product", icon: Layers },
  { id: "room-matching", label: "Room Matching", icon: Home },
  { id: "style-material", label: "Style & Material", icon: Palette },
  { id: "logic", label: "AI Logic", icon: Brain },
  { id: "actions", label: "Actions", icon: Zap },
] as const;

type TabId = (typeof tabs)[number]["id"];

// ─── Shared UI Components ─────────────────────────────────────────────────────

function ScoreRing({ score, size = 48, strokeWidth = 4, label }: { score: number; size?: number; strokeWidth?: number; label?: string }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#059669" : score >= 60 ? "#0a0a0a" : score >= 40 ? "#d97706" : "#e11d48";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e5e5" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[11px] font-bold leading-none" style={{ color }}>{score}</span>
        {label && <span className="text-[7px] text-muted leading-none mt-0.5">{label}</span>}
      </div>
    </div>
  );
}

function MatchBar({ score, height = 6 }: { score: number; height?: number }) {
  const color = score >= 80 ? "bg-emerald" : score >= 60 ? "bg-foreground" : score >= 40 ? "bg-amber" : "bg-rose";
  return (
    <div className="flex-1 rounded-full bg-surface" style={{ height }}>
      <div className={`rounded-full ${color} transition-all`} style={{ width: `${score}%`, height }} />
    </div>
  );
}

function FitBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold ${active ? "bg-emerald-light text-emerald" : "bg-surface text-muted"}`}>
      {active && <Check size={8} />}
      {label}
    </span>
  );
}

function TrendBadge({ trend }: { trend: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    surging: { bg: "bg-emerald-light", text: "text-emerald", label: "Surging" },
    rising: { bg: "bg-blue-50", text: "text-blue-600", label: "Rising" },
    steady: { bg: "bg-surface", text: "text-muted", label: "Steady" },
    cooling: { bg: "bg-amber-light", text: "text-amber", label: "Cooling" },
  };
  const c = config[trend] || config.steady;
  return <span className={`rounded-full ${c.bg} ${c.text} px-2 py-0.5 text-[9px] font-semibold`}>{c.label}</span>;
}

function WeightBar({ weight, label, color }: { weight: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-[120px] text-[11px] font-medium text-right truncate">{label}</span>
      <div className="flex-1 h-5 bg-surface rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all flex items-center justify-end pr-2" style={{ width: `${weight}%`, backgroundColor: color }}>
          <span className="text-[9px] font-bold text-white">{weight}%</span>
        </div>
      </div>
    </div>
  );
}

// ─── Section: Matching Hero ───────────────────────────────────────────────────

function MatchingHero({ topMatchScore, avgMatchScore, highMatches, categoriesCovered }: {
  topMatchScore: number;
  avgMatchScore: number;
  highMatches: number;
  categoriesCovered: number;
}) {
  return (
    <div className="border-b border-border bg-white px-8 py-6">
      <Link href="/" className="inline-flex items-center gap-1 text-[12px] text-muted hover:text-foreground mb-4">
        <ArrowLeft size={13} /> Back to Dashboard
      </Link>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground">
              <Target size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-[24px] font-semibold tracking-tight">AI Product Matching</h1>
              <p className="text-[13px] text-muted">Intelligent matching across briefs, projects, architects, rooms, and styles</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-muted">
          <div className="flex items-center gap-1.5"><Sparkles size={12} className="text-emerald" /><span className="font-medium text-foreground">Engine v2.1</span></div>
          <div className="flex items-center gap-1.5"><CircleDot size={12} className="text-emerald" /><span>Real-time</span></div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-4">
        {[
          { label: "Top Match", value: `${topMatchScore}%`, sub: "Highest match score", color: "text-emerald" },
          { label: "Avg Match", value: `${avgMatchScore}%`, sub: "Across all products", color: "text-foreground" },
          { label: "Strong Matches", value: `${highMatches}`, sub: "Score ≥ 60%", color: "text-foreground" },
          { label: "Categories", value: `${categoriesCovered}`, sub: "Categories covered", color: "text-foreground" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-border bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">{kpi.label}</p>
            <p className={`mt-1 text-[22px] font-bold tracking-tight ${kpi.color}`}>{kpi.value}</p>
            <p className="text-[11px] text-muted">{kpi.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Mini Sparkline SVG ───────────────────────────────────────────────────────

function Sparkline({ data, width = 64, height = 20, color = "#0a0a0a" }: { data: number[]; width?: number; height?: number; color?: string }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 2) - 1}`).join(" ");
  return (
    <svg width={width} height={height} className="shrink-0">
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(data.length - 1) / (data.length - 1) * width} cy={height - ((data[data.length - 1] - min) / range) * (height - 2) - 1} r={2} fill={color} />
    </svg>
  );
}

// ─── Radar Chart SVG ──────────────────────────────────────────────────────────

function RadarChart({ scores, size = 120 }: { scores: { label: string; value: number }[]; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 20;
  const n = scores.length;
  const angleStep = (2 * Math.PI) / n;

  const pointAt = (i: number, radius: number) => ({
    x: cx + radius * Math.cos(angleStep * i - Math.PI / 2),
    y: cy + radius * Math.sin(angleStep * i - Math.PI / 2),
  });

  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const dataPoints = scores.map((s, i) => pointAt(i, (s.value / 100) * r));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <svg width={size} height={size} className="shrink-0">
      {/* Grid rings */}
      {gridLevels.map((level) => {
        const pts = scores.map((_, i) => pointAt(i, level * r));
        const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
        return <path key={level} d={path} fill="none" stroke="#e5e5e5" strokeWidth={0.5} />;
      })}
      {/* Axis lines */}
      {scores.map((_, i) => {
        const p = pointAt(i, r);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e5e5e5" strokeWidth={0.5} />;
      })}
      {/* Data polygon */}
      <path d={dataPath} fill="rgba(10,10,10,0.08)" stroke="#0a0a0a" strokeWidth={1.5} />
      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2.5} fill="#0a0a0a" />
      ))}
      {/* Labels */}
      {scores.map((s, i) => {
        const labelR = r + 14;
        const lp = pointAt(i, labelR);
        const anchor = lp.x < cx - 5 ? "end" : lp.x > cx + 5 ? "start" : "middle";
        return (
          <text key={i} x={lp.x} y={lp.y + 3} textAnchor={anchor} className="text-[7px] font-medium" fill="#737373">
            {s.label}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Score Dimension Bar (compact inline) ─────────────────────────────────────

function DimensionBar({ label, score }: { label: string; score: number }) {
  const color = score >= 75 ? "#059669" : score >= 50 ? "#0a0a0a" : score >= 30 ? "#d97706" : "#e11d48";
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-[52px] text-[8px] font-medium text-muted text-right truncate">{label}</span>
      <div className="w-16 h-[5px] bg-surface rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-[8px] font-bold w-5" style={{ color }}>{score}</span>
    </div>
  );
}

// ─── Section 1: Brief → Product ───────────────────────────────────────────────

type SortKey = "score" | "styleScore" | "materialScore" | "roomScore" | "categoryScore" | "trendScore" | "precedentScore" | "price";

function BriefToProductSection({ brief, selectedBrief, setSelectedBrief, matches, savedProducts, toggleSaveProduct }: {
  brief: Brief;
  selectedBrief: number;
  setSelectedBrief: (i: number) => void;
  matches: BriefProductMatch[];
  savedProducts: Set<string>;
  toggleSaveProduct: (id: string) => void;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortAsc, setSortAsc] = useState(false);
  const [tierFilter, setTierFilter] = useState<"all" | "premium" | "practical">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addedToBoard, setAddedToBoard] = useState<Set<string>>(new Set());
  const [addedToSpec, setAddedToSpec] = useState<Set<string>>(new Set());

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const sorted = useMemo(() => {
    let filtered = tierFilter === "all" ? matches : matches.filter((m) => m.tier === tierFilter);
    return [...filtered].sort((a, b) => {
      let av: number, bv: number;
      if (sortKey === "price") {
        av = parsePrice(a.product.price);
        bv = parsePrice(b.product.price);
      } else {
        av = a[sortKey];
        bv = b[sortKey];
      }
      return sortAsc ? av - bv : bv - av;
    });
  }, [matches, sortKey, sortAsc, tierFilter]);

  const toggleBoard = (id: string) => {
    const next = new Set(addedToBoard);
    if (next.has(id)) next.delete(id); else next.add(id);
    setAddedToBoard(next);
  };

  const toggleSpec = (id: string) => {
    const next = new Set(addedToSpec);
    if (next.has(id)) next.delete(id); else next.add(id);
    setAddedToSpec(next);
  };

  const SortHeader = ({ label, field, className = "" }: { label: string; field: SortKey; className?: string }) => (
    <button onClick={() => handleSort(field)} className={`flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-[0.06em] text-muted hover:text-foreground transition-colors ${className}`}>
      {label}
      <ArrowUpDown size={8} className={sortKey === field ? "text-foreground" : "text-muted/40"} />
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Brief selector */}
      <div className="rounded-2xl border border-border bg-white p-5">
        <h2 className="text-[14px] font-semibold mb-3">Select Brief</h2>
        <div className="grid grid-cols-3 gap-3">
          {mockBriefs.map((b, i) => (
            <button
              key={b.id}
              onClick={() => setSelectedBrief(i)}
              className={`rounded-xl border p-4 text-left transition-all ${selectedBrief === i ? "border-foreground ring-2 ring-foreground/10 bg-surface/50" : "border-border hover:border-foreground/30"}`}
            >
              <p className="text-[13px] font-semibold">{b.title}</p>
              <p className="text-[11px] text-muted mt-0.5">{b.type} · {b.style} · {b.location}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {b.rooms.slice(0, 3).map((r) => (
                  <span key={r} className="rounded-full bg-surface px-2 py-0.5 text-[9px] font-medium text-muted">{r}</span>
                ))}
                {b.rooms.length > 3 && <span className="text-[9px] text-muted">+{b.rooms.length - 3}</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Brief detail */}
      <div className="rounded-2xl border border-border bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[14px] font-semibold">Brief: {brief.title}</h2>
          <span className="rounded-full bg-surface px-3 py-1 text-[10px] font-semibold text-muted">{brief.budget}</span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">Style</p>
            <FitBadge label={brief.style} active />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">Features</p>
            <div className="flex flex-wrap gap-1">{brief.features.map((f) => <FitBadge key={f} label={f} active />)}</div>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">Materials</p>
            <div className="flex flex-wrap gap-1">{brief.materials.map((m) => <FitBadge key={m} label={m} active />)}</div>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">Rooms</p>
            <div className="flex flex-wrap gap-1">{brief.rooms.map((r) => <span key={r} className="rounded-full bg-surface px-2 py-0.5 text-[9px] font-medium text-muted">{r}</span>)}</div>
          </div>
        </div>
      </div>

      {/* Controls: tier toggle + sort indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-xl border border-border bg-white p-1">
          {([["all", "All Products", null], ["premium", "Premium", Crown], ["practical", "Practical", Wallet]] as const).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTierFilter(key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${tierFilter === key ? "bg-foreground text-white" : "text-muted hover:bg-surface"}`}
            >
              {Icon && <Icon size={12} />}
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted">
          <span>{sorted.length} of {matches.length} products</span>
          <span>·</span>
          <span>Sorted by <strong className="text-foreground">{sortKey === "score" ? "Overall" : sortKey.replace("Score", "")}</strong> {sortAsc ? "↑" : "↓"}</span>
        </div>
      </div>

      {/* Sortable recommendation table */}
      <div className="rounded-2xl border border-border bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface/30">
                <th className="p-3 text-left"><span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">#</span></th>
                <th className="p-3 text-left"><span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">Product</span></th>
                <th className="p-3"><SortHeader label="Match" field="score" /></th>
                <th className="p-3"><SortHeader label="Style" field="styleScore" /></th>
                <th className="p-3"><SortHeader label="Material" field="materialScore" /></th>
                <th className="p-3"><SortHeader label="Room" field="roomScore" /></th>
                <th className="p-3"><SortHeader label="Category" field="categoryScore" /></th>
                <th className="p-3"><SortHeader label="Trend" field="trendScore" /></th>
                <th className="p-3"><SortHeader label="Precedent" field="precedentScore" /></th>
                <th className="p-3 text-center"><span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">Activity</span></th>
                <th className="p-3"><SortHeader label="Price" field="price" className="justify-end" /></th>
                <th className="p-3 text-center"><span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((match, i) => {
                const isExpanded = expandedId === match.product.id;
                const subProducts = match.substituteIds.map((sid) => products.find((p) => p.id === sid)).filter(Boolean) as Product[];
                const subMatches = match.substituteIds.map((sid) => matches.find((m) => m.product.id === sid)).filter(Boolean) as BriefProductMatch[];

                return (
                  <React.Fragment key={match.product.id}>
                    <tr
                      className={`border-b border-border transition-colors cursor-pointer ${i < 3 ? "bg-emerald-light/20" : "hover:bg-surface/30"} ${isExpanded ? "bg-surface/40" : ""}`}
                      onClick={() => setExpandedId(isExpanded ? null : match.product.id)}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-muted w-4 text-center">{i + 1}</span>
                          {match.tier === "premium" && <Crown size={10} className="text-amber" />}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2.5 min-w-[180px]">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-[12px] font-semibold truncate">{match.product.name}</p>
                              <TrendBadge trend={match.momentumTrend} />
                            </div>
                            <p className="text-[10px] text-muted">{match.product.brand} · {match.product.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <ScoreRing score={match.score} size={36} strokeWidth={3} />
                      </td>
                      <td className="p-3 text-center">
                        <DimCell score={match.styleScore} />
                      </td>
                      <td className="p-3 text-center">
                        <DimCell score={match.materialScore} />
                      </td>
                      <td className="p-3 text-center">
                        <DimCell score={match.roomScore} />
                      </td>
                      <td className="p-3 text-center">
                        <DimCell score={match.categoryScore} />
                      </td>
                      <td className="p-3 text-center">
                        <DimCell score={match.trendScore} />
                      </td>
                      <td className="p-3 text-center">
                        <DimCell score={match.precedentScore} />
                      </td>
                      <td className="p-3 text-center">
                        <Sparkline data={match.weeklySparkline} width={56} height={18} color={match.momentumTrend === "surging" ? "#059669" : match.momentumTrend === "cooling" ? "#d97706" : "#0a0a0a"} />
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-[12px] font-semibold whitespace-nowrap">{match.product.price}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 justify-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => toggleSaveProduct(match.product.id)}
                            title="Save"
                            className={`rounded-md p-1.5 transition-colors ${savedProducts.has(match.product.id) ? "bg-foreground text-white" : "bg-surface text-muted hover:bg-foreground hover:text-white"}`}
                          >
                            <Bookmark size={11} />
                          </button>
                          <button
                            onClick={() => toggleBoard(match.product.id)}
                            title="Add to Board"
                            className={`rounded-md p-1.5 transition-colors ${addedToBoard.has(match.product.id) ? "bg-foreground text-white" : "bg-surface text-muted hover:bg-foreground hover:text-white"}`}
                          >
                            <Plus size={11} />
                          </button>
                          <button
                            onClick={() => toggleSpec(match.product.id)}
                            title="Add to Specification"
                            className={`rounded-md p-1.5 transition-colors ${addedToSpec.has(match.product.id) ? "bg-foreground text-white" : "bg-surface text-muted hover:bg-foreground hover:text-white"}`}
                          >
                            <FileText size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded row: radar chart + score breakdown + substitutes */}
                    {isExpanded && (
                      <tr className="border-b border-border bg-surface/20">
                        <td colSpan={12} className="p-0">
                          <div className="px-5 py-5">
                            <div className="grid grid-cols-12 gap-6">

                              {/* Radar chart */}
                              <div className="col-span-3 flex flex-col items-center">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-3">Compatibility Radar</p>
                                <RadarChart scores={[
                                  { label: "Style", value: match.styleScore },
                                  { label: "Material", value: match.materialScore },
                                  { label: "Room", value: match.roomScore },
                                  { label: "Category", value: match.categoryScore },
                                  { label: "Trend", value: match.trendScore },
                                  { label: "Precedent", value: match.precedentScore },
                                ]} size={140} />
                              </div>

                              {/* Score breakdown */}
                              <div className="col-span-4">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-3">Score Breakdown</p>
                                <div className="space-y-2.5">
                                  <DimensionBar label="Style" score={match.styleScore} />
                                  <DimensionBar label="Material" score={match.materialScore} />
                                  <DimensionBar label="Room" score={match.roomScore} />
                                  <DimensionBar label="Category" score={match.categoryScore} />
                                  <DimensionBar label="Trend" score={match.trendScore} />
                                  <DimensionBar label="Precedent" score={match.precedentScore} />
                                </div>
                                <div className="mt-4 pt-3 border-t border-border">
                                  <p className="text-[10px] font-semibold text-muted mb-1.5">Match Reasons</p>
                                  <div className="space-y-1">
                                    {match.reasons.map((r, j) => (
                                      <div key={j} className="flex items-center gap-1.5 text-[10px]">
                                        <ChevronRight size={9} className="text-muted shrink-0" />
                                        <span className="text-muted">{r}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Substitute comparison */}
                              <div className="col-span-5">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-3">
                                  <Repeat2 size={10} className="inline mr-1" />
                                  Substitute Products
                                </p>
                                {subProducts.length === 0 ? (
                                  <p className="text-[10px] text-muted italic">No substitutes in this category</p>
                                ) : (
                                  <div className="rounded-xl border border-border overflow-hidden">
                                    <table className="w-full">
                                      <thead>
                                        <tr className="bg-surface/50">
                                          <th className="px-3 py-2 text-[8px] font-semibold uppercase tracking-wider text-muted text-left">Product</th>
                                          <th className="px-3 py-2 text-[8px] font-semibold uppercase tracking-wider text-muted text-center">Match</th>
                                          <th className="px-3 py-2 text-[8px] font-semibold uppercase tracking-wider text-muted text-center">Style</th>
                                          <th className="px-3 py-2 text-[8px] font-semibold uppercase tracking-wider text-muted text-right">Price</th>
                                          <th className="px-3 py-2 text-[8px] font-semibold uppercase tracking-wider text-muted text-center">Tier</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {/* Current product row */}
                                        <tr className="border-t border-border bg-foreground/[0.03]">
                                          <td className="px-3 py-2">
                                            <p className="text-[10px] font-semibold">{match.product.name}</p>
                                            <p className="text-[8px] text-muted">{match.product.brand} (current)</p>
                                          </td>
                                          <td className="px-3 py-2 text-center"><span className="text-[10px] font-bold">{match.score}%</span></td>
                                          <td className="px-3 py-2 text-center"><DimCell score={match.styleScore} /></td>
                                          <td className="px-3 py-2 text-right"><span className="text-[10px] font-semibold">{match.product.price}</span></td>
                                          <td className="px-3 py-2 text-center">
                                            <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${match.tier === "premium" ? "bg-amber-light text-amber" : "bg-emerald-light text-emerald"}`}>
                                              {match.tier === "premium" ? "Premium" : "Practical"}
                                            </span>
                                          </td>
                                        </tr>
                                        {/* Substitute rows */}
                                        {subProducts.map((sp, si) => {
                                          const sm = subMatches[si];
                                          return (
                                            <tr key={sp.id} className="border-t border-border hover:bg-surface/30">
                                              <td className="px-3 py-2">
                                                <p className="text-[10px] font-medium">{sp.name}</p>
                                                <p className="text-[8px] text-muted">{sp.brand}</p>
                                              </td>
                                              <td className="px-3 py-2 text-center"><span className="text-[10px] font-bold">{sm?.score ?? "—"}%</span></td>
                                              <td className="px-3 py-2 text-center"><DimCell score={sm?.styleScore ?? 0} /></td>
                                              <td className="px-3 py-2 text-right"><span className="text-[10px] font-medium">{sp.price}</span></td>
                                              <td className="px-3 py-2 text-center">
                                                <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${(sm?.tier ?? "practical") === "premium" ? "bg-amber-light text-amber" : "bg-emerald-light text-emerald"}`}>
                                                  {(sm?.tier ?? "practical") === "premium" ? "Premium" : "Practical"}
                                                </span>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
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
    </div>
  );
}

// ─── Dimension Cell (compact score with color) ────────────────────────────────

function DimCell({ score }: { score: number }) {
  const color = score >= 75 ? "#059669" : score >= 50 ? "#0a0a0a" : score >= 30 ? "#d97706" : "#e11d48";
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[10px] font-bold" style={{ color }}>{score}</span>
      <div className="w-8 h-[3px] bg-surface rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

// ─── Section 2: Brief → Architect ─────────────────────────────────────────────

function BriefToArchitectSection({ brief, selectedBrief, setSelectedBrief, matches, shortlistedArchitects, toggleShortlistArchitect }: {
  brief: Brief;
  selectedBrief: number;
  setSelectedBrief: (i: number) => void;
  matches: BriefArchitectMatch[];
  shortlistedArchitects: Set<string>;
  toggleShortlistArchitect: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[14px] font-semibold">Matching Architects for: {brief.title}</h2>
          <div className="flex gap-2">
            {mockBriefs.map((b, i) => (
              <button key={b.id} onClick={() => setSelectedBrief(i)} className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${selectedBrief === i ? "bg-foreground text-white" : "bg-surface text-muted hover:bg-surface-hover"}`}>
                {b.title}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted">
          <span>Style: <strong className="text-foreground">{brief.style}</strong></span>
          <span>·</span>
          <span>Location: <strong className="text-foreground">{brief.location}</strong></span>
          <span>·</span>
          <span>Type: <strong className="text-foreground">{brief.type}</strong></span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {matches.map((match, i) => (
          <div key={match.architect.id} className={`rounded-2xl border bg-white p-5 transition-all ${i < 2 ? "border-foreground ring-1 ring-foreground/5" : "border-border"}`}>
            <div className="flex items-start gap-4">
              <ScoreRing score={match.score} size={56} strokeWidth={4} label="match" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-[15px] font-semibold">{match.architect.name}</h3>
                  {i === 0 && <span className="rounded-full bg-emerald-light px-2 py-0.5 text-[9px] font-bold text-emerald">Top Match</span>}
                </div>
                <p className="text-[12px] text-muted">{match.architect.firm} · {match.architect.location}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {match.architect.specialties.map((s) => (
                    <FitBadge key={s} label={s} active={match.styleOverlap.includes(s)} />
                  ))}
                </div>
              </div>
              <button
                onClick={() => toggleShortlistArchitect(match.architect.id)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${shortlistedArchitects.has(match.architect.id) ? "bg-foreground text-white" : "border border-border text-muted hover:bg-surface"}`}
              >
                {shortlistedArchitects.has(match.architect.id) ? <><Check size={11} className="inline mr-1" />Shortlisted</> : <><Star size={11} className="inline mr-1" />Shortlist</>}
              </button>
            </div>

            <div className="mt-4 space-y-1.5">
              {match.reasons.map((r, j) => (
                <div key={j} className="flex items-center gap-2 text-[11px]">
                  <ChevronRight size={10} className="text-muted shrink-0" />
                  <span className="text-muted">{r}</span>
                </div>
              ))}
            </div>

            {match.similarProjects.length > 0 && (
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">Similar Projects</p>
                <div className="space-y-1.5">
                  {match.similarProjects.map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-lg bg-surface/50 px-3 py-2">
                      <div>
                        <p className="text-[12px] font-medium">{p.title}</p>
                        <p className="text-[10px] text-muted">{p.location} · {p.year}</p>
                      </div>
                      <div className="flex gap-1">
                        {p.tags.slice(0, 2).map((t) => (
                          <span key={t} className="rounded-full bg-surface px-2 py-0.5 text-[9px] font-medium text-muted">{t}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {match.influence && (
              <div className="mt-4 pt-3 border-t border-border">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-[16px] font-bold">{match.influence.metrics.productSaves}</p>
                    <p className="text-[9px] text-muted">Product Saves</p>
                  </div>
                  <div>
                    <p className="text-[16px] font-bold">{match.influence.metrics.specDownloads}</p>
                    <p className="text-[9px] text-muted">Spec Downloads</p>
                  </div>
                  <div>
                    <p className="text-[16px] font-bold">{match.influence.tier}</p>
                    <p className="text-[9px] text-muted">Influence Tier</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section 3: Project → Product ─────────────────────────────────────────────

function ProjectToProductSection({ selectedProject, setSelectedProject, match, savedProducts, toggleSaveProduct }: {
  selectedProject: number;
  setSelectedProject: (i: number) => void;
  match: ProjectProductMatch;
  savedProducts: Set<string>;
  toggleSaveProduct: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-white p-5">
        <h2 className="text-[14px] font-semibold mb-3">Select Project</h2>
        <div className="grid grid-cols-3 gap-3">
          {projects.map((proj, i) => (
            <button
              key={proj.id}
              onClick={() => setSelectedProject(i)}
              className={`rounded-xl border p-4 text-left transition-all ${selectedProject === i ? "border-foreground ring-2 ring-foreground/10 bg-surface/50" : "border-border hover:border-foreground/30"}`}
            >
              <p className="text-[13px] font-semibold">{proj.title}</p>
              <p className="text-[11px] text-muted">{proj.architect} · {proj.location}</p>
              <div className="mt-2 flex gap-1">
                {proj.tags.slice(0, 2).map((t) => (
                  <span key={t} className="rounded-full bg-surface px-2 py-0.5 text-[9px] font-medium text-muted">{t}</span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-white p-5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">Current Products</p>
          <p className="text-[28px] font-bold">{match.projectProducts.length}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {[...match.usedCategories].map((c) => (
              <span key={c} className="rounded-full bg-emerald-light px-2 py-0.5 text-[9px] font-semibold text-emerald">{c}</span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">Missing Categories</p>
          <p className="text-[28px] font-bold text-amber">{match.missingCategories.length}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {match.missingCategories.map((c) => (
              <span key={c} className="rounded-full bg-amber-light px-2 py-0.5 text-[9px] font-semibold text-amber">{c}</span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">Recommendations</p>
          <p className="text-[28px] font-bold">{match.recommended.filter((r) => r.score >= 40).length}</p>
          <p className="text-[11px] text-muted mt-1">Score ≥ 40% match threshold</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="text-[14px] font-semibold">Recommended Products for {match.project.title}</h2>
          <p className="text-[11px] text-muted mt-0.5">Based on missing categories, architect patterns, and momentum signals</p>
        </div>
        <div className="divide-y divide-border">
          {match.recommended.slice(0, 8).map((rec, i) => (
            <div key={rec.product.id} className="flex items-center gap-4 px-5 py-4">
              <span className="w-6 text-[11px] font-bold text-muted text-center">{i + 1}</span>
              <ScoreRing score={rec.score} size={40} strokeWidth={3} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-semibold">{rec.product.name}</p>
                  {rec.isPremium && <span className="rounded-full bg-foreground px-2 py-0.5 text-[8px] font-bold text-white">PREMIUM</span>}
                </div>
                <p className="text-[11px] text-muted">{rec.product.brand} · {rec.product.category}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[13px] font-semibold">{rec.product.price}</p>
                <div className="mt-1 space-y-0.5">
                  {rec.reasons.slice(0, 2).map((r, j) => (
                    <p key={j} className="text-[9px] text-muted">{r}</p>
                  ))}
                </div>
              </div>
              <div className="w-24 shrink-0"><MatchBar score={rec.score} /></div>
              <button
                onClick={() => toggleSaveProduct(rec.product.id)}
                className={`rounded-lg p-2 transition-colors ${savedProducts.has(rec.product.id) ? "bg-foreground text-white" : "bg-surface text-muted hover:bg-foreground hover:text-white"}`}
              >
                <Bookmark size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Section 4: Room Matching ─────────────────────────────────────────────────

function RoomMatchingSection({ roomMatches }: { roomMatches: RoomMatch[] }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-white p-5">
        <h2 className="text-[14px] font-semibold">Room-based Product Intelligence</h2>
        <p className="text-[11px] text-muted mt-0.5">Analysis of product usage patterns across specification rooms</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {roomMatches.map((room) => (
          <div key={room.roomName} className="rounded-2xl border border-border bg-white overflow-hidden">
            <div className="p-5 border-b border-border bg-surface/30">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground">
                  <Home size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold">{room.roomName}</h3>
                  <p className="text-[10px] text-muted">{room.topProducts.length} products · {room.topCategories.length} categories</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-b border-border">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">Top Categories</p>
              <div className="space-y-2">
                {room.topCategories.map(([cat, count]) => (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="w-20 text-[11px] font-medium truncate">{cat}</span>
                    <MatchBar score={(count / Math.max(...room.topCategories.map(([, c]) => c))) * 100} />
                    <span className="text-[10px] font-bold w-6 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-b border-border">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">Products Used</p>
              <div className="space-y-1.5">
                {room.topProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg bg-surface/50 px-3 py-2">
                    <div>
                      <p className="text-[11px] font-medium">{p.name}</p>
                      <p className="text-[9px] text-muted">{p.brand}</p>
                    </div>
                    <span className="rounded-full bg-surface px-2 py-0.5 text-[9px] font-bold text-muted">×{p.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {room.missing.length > 0 && (
              <div className="p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-amber mb-2">Missing Categories</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {room.missing.slice(0, 5).map((c) => (
                    <span key={c} className="rounded-full bg-amber-light px-2 py-0.5 text-[9px] font-semibold text-amber">{c}</span>
                  ))}
                </div>
                {room.recommended.length > 0 && (
                  <>
                    <p className="text-[10px] font-semibold text-muted mb-1.5">Suggested Products</p>
                    <div className="space-y-1.5">
                      {room.recommended.map((p) => (
                        <div key={p.id} className="flex items-center justify-between rounded-lg border border-dashed border-border px-3 py-2 hover:border-foreground/30 transition-colors">
                          <div>
                            <p className="text-[11px] font-medium">{p.name}</p>
                            <p className="text-[9px] text-muted">{p.brand} · {p.category}</p>
                          </div>
                          <button className="rounded-lg bg-surface p-1.5 text-muted hover:bg-foreground hover:text-white transition-colors">
                            <Plus size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section 5: Style & Material ──────────────────────────────────────────────

function StyleMaterialHeatmap({ styles, categories, matrix }: { styles: string[]; categories: string[]; matrix: Record<string, Record<string, number>> }) {
  const maxVal = Math.max(...styles.flatMap((s) => categories.map((c) => matrix[s]?.[c] || 0)), 1);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2 text-[10px] font-semibold text-muted text-left sticky left-0 bg-white z-10" />
            {categories.map((c) => (
              <th key={c} className="p-2 text-[9px] font-semibold text-muted text-center whitespace-nowrap">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {styles.map((s) => (
            <tr key={s}>
              <td className="p-2 text-[10px] font-semibold text-foreground whitespace-nowrap sticky left-0 bg-white z-10">{s}</td>
              {categories.map((c) => {
                const val = matrix[s]?.[c] || 0;
                const intensity = val / maxVal;
                return (
                  <td key={c} className="p-1 text-center">
                    <div
                      className="mx-auto flex h-8 w-10 items-center justify-center rounded-md text-[10px] font-bold transition-all"
                      style={{
                        backgroundColor: val > 0 ? `rgba(10,10,10,${0.08 + intensity * 0.82})` : "#fafafa",
                        color: intensity > 0.5 ? "#fff" : "#737373",
                      }}
                    >
                      {val || "—"}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RelationshipMap({ styles, categories, matrix }: { styles: string[]; categories: string[]; matrix: Record<string, Record<string, number>> }) {
  const w = 700;
  const h = 400;
  const leftX = 120;
  const rightX = 580;
  const [hoveredStyle, setHoveredStyle] = useState<string | null>(null);

  const stylePositions = styles.map((s, i) => ({ label: s, y: 40 + (i * (h - 80)) / Math.max(styles.length - 1, 1) }));
  const catPositions = categories.map((c, i) => ({ label: c, y: 40 + (i * (h - 80)) / Math.max(categories.length - 1, 1) }));
  const maxVal = Math.max(...styles.flatMap((s) => categories.map((c) => matrix[s]?.[c] || 0)), 1);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {stylePositions.map((sp) =>
        catPositions.map((cp) => {
          const val = matrix[sp.label]?.[cp.label] || 0;
          if (val === 0) return null;
          const opacity = hoveredStyle ? (hoveredStyle === sp.label ? 0.15 + (val / maxVal) * 0.7 : 0.03) : 0.08 + (val / maxVal) * 0.4;
          const strokeW = 1 + (val / maxVal) * 5;
          return (
            <path key={`${sp.label}-${cp.label}`} d={`M ${leftX + 60} ${sp.y} C ${leftX + 180} ${sp.y}, ${rightX - 180} ${cp.y}, ${rightX - 60} ${cp.y}`} fill="none" stroke="#0a0a0a" strokeWidth={strokeW} opacity={opacity} />
          );
        })
      )}
      {stylePositions.map((sp) => (
        <g key={sp.label} onMouseEnter={() => setHoveredStyle(sp.label)} onMouseLeave={() => setHoveredStyle(null)} className="cursor-pointer">
          <rect x={leftX - 60} y={sp.y - 12} width={120} height={24} rx={12} fill={hoveredStyle === sp.label ? "#0a0a0a" : "#f5f5f5"} stroke="#e5e5e5" strokeWidth={1} />
          <text x={leftX} y={sp.y + 4} textAnchor="middle" className="text-[10px] font-semibold" fill={hoveredStyle === sp.label ? "#fff" : "#0a0a0a"}>{sp.label}</text>
        </g>
      ))}
      {catPositions.map((cp) => {
        const totalForCat = styles.reduce((sum, s) => sum + (matrix[s]?.[cp.label] || 0), 0);
        return (
          <g key={cp.label}>
            <rect x={rightX - 60} y={cp.y - 12} width={120} height={24} rx={12} fill="#fafafa" stroke="#e5e5e5" strokeWidth={1} />
            <text x={rightX} y={cp.y + 4} textAnchor="middle" className="text-[10px] font-medium" fill="#737373">{cp.label}</text>
            <text x={rightX + 70} y={cp.y + 4} textAnchor="start" className="text-[9px] font-bold" fill="#0a0a0a">{totalForCat}</text>
          </g>
        );
      })}
      <text x={leftX} y={16} textAnchor="middle" className="text-[9px] font-semibold uppercase tracking-widest" fill="#a3a3a3">Style Tags</text>
      <text x={rightX} y={16} textAnchor="middle" className="text-[9px] font-semibold uppercase tracking-widest" fill="#a3a3a3">Categories</text>
    </svg>
  );
}

function StyleMaterialSection({ styleMaterial }: { styleMaterial: { styles: string[]; categories: string[]; matrix: Record<string, Record<string, number>> } }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-white p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground"><Grid3x3 size={16} className="text-white" /></div>
          <div>
            <h2 className="text-[14px] font-semibold">Style × Category Compatibility Matrix</h2>
            <p className="text-[11px] text-muted">Product usage frequency across style tags and product categories</p>
          </div>
        </div>
        <StyleMaterialHeatmap styles={styleMaterial.styles} categories={styleMaterial.categories} matrix={styleMaterial.matrix} />
        <p className="mt-4 text-[10px] text-muted text-center">Darker cells indicate higher product usage. Data from {projects.length} projects and {products.length} products.</p>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground"><Palette size={16} className="text-white" /></div>
          <div>
            <h2 className="text-[14px] font-semibold">Style → Category Relationship Map</h2>
            <p className="text-[11px] text-muted">Hover over style tags to see category connections</p>
          </div>
        </div>
        <RelationshipMap styles={styleMaterial.styles} categories={styleMaterial.categories} matrix={styleMaterial.matrix} />
      </div>

      <div className="rounded-2xl border border-border bg-white p-6">
        <h2 className="text-[14px] font-semibold mb-4">Style Profiles</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {styleMaterial.styles.slice(0, 6).map((style) => {
            const catEntries = styleMaterial.categories
              .map((c) => ({ category: c, count: styleMaterial.matrix[style]?.[c] || 0 }))
              .filter((e) => e.count > 0)
              .sort((a, b) => b.count - a.count);
            const total = catEntries.reduce((s, e) => s + e.count, 0);
            if (total === 0) return null;

            return (
              <div key={style} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[13px] font-semibold">{style}</h3>
                  <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-muted">{total} uses</span>
                </div>
                <div className="space-y-2">
                  {catEntries.map((e) => (
                    <div key={e.category} className="flex items-center gap-2">
                      <span className="w-16 text-[10px] text-muted truncate">{e.category}</span>
                      <MatchBar score={(e.count / catEntries[0].count) * 100} height={4} />
                      <span className="text-[9px] font-bold text-muted w-4">{e.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Section 6: Recommendation Logic ──────────────────────────────────────────

function RecommendationLogicSection({ signals }: { signals: RecommendationSignal[] }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-white p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground"><Brain size={18} className="text-white" /></div>
          <div>
            <h2 className="text-[16px] font-semibold">AI Recommendation Logic</h2>
            <p className="text-[12px] text-muted">How the matching engine scores and ranks products</p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-[12px] font-semibold mb-4">Signal Weights</h3>
          <div className="space-y-3">
            {signals.map((signal, i) => {
              const colors = ["#0a0a0a", "#404040", "#525252", "#737373", "#a3a3a3", "#d4d4d4"];
              return <WeightBar key={signal.name} weight={signal.weight} label={signal.name} color={colors[i]} />;
            })}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {signals.map((signal) => (
            <div key={signal.name} className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[13px] font-semibold">{signal.name}</h4>
                <span className="rounded-full bg-foreground px-2.5 py-0.5 text-[10px] font-bold text-white">{signal.weight}%</span>
              </div>
              <p className="text-[11px] text-muted mb-3">{signal.description}</p>
              <div className="space-y-1">
                {signal.factors.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-[10px]">
                    <CircleDot size={8} className="text-muted shrink-0" />
                    <span className="text-muted">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <h3 className="text-[12px] font-semibold mb-4">Data Sources</h3>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Projects", count: projects.length, icon: Layers },
              { label: "Products", count: products.length, icon: Box },
              { label: "Architects", count: architects.length, icon: Users },
              { label: "Specifications", count: specifications.length, icon: Shield },
            ].map((ds) => (
              <div key={ds.label} className="rounded-xl bg-surface/50 p-4 text-center">
                <ds.icon size={18} className="mx-auto text-muted mb-2" />
                <p className="text-[18px] font-bold">{ds.count}</p>
                <p className="text-[10px] text-muted">{ds.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-surface/50 p-4 flex items-start gap-3">
          <Eye size={16} className="text-muted shrink-0 mt-0.5" />
          <div>
            <p className="text-[12px] font-semibold">Transparency Note</p>
            <p className="text-[11px] text-muted mt-0.5">
              All match scores are computed from observable platform signals — architect saves, spec downloads, project tagging,
              and board additions. No black-box ML models are used. Scores update in real-time as new signals arrive.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section 7: Actions ───────────────────────────────────────────────────────

function MatchingActionsSection({ savedProducts, shortlistedArchitects, toggleSaveProduct, toggleShortlistArchitect }: {
  savedProducts: Set<string>;
  shortlistedArchitects: Set<string>;
  toggleSaveProduct: (id: string) => void;
  toggleShortlistArchitect: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Saved Products */}
      <div className="rounded-2xl border border-border bg-white p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground"><Bookmark size={16} className="text-white" /></div>
            <div>
              <h2 className="text-[14px] font-semibold">Saved Products</h2>
              <p className="text-[11px] text-muted">{savedProducts.size} product{savedProducts.size !== 1 ? "s" : ""} saved from matching</p>
            </div>
          </div>
          {savedProducts.size > 0 && (
            <div className="flex gap-2">
              <button className="rounded-lg border border-border px-3 py-1.5 text-[11px] font-medium text-muted hover:bg-surface transition-colors">
                <Plus size={12} className="inline mr-1" />Add to Board
              </button>
              <button className="rounded-lg bg-foreground px-3 py-1.5 text-[11px] font-medium text-white hover:opacity-90 transition-opacity">
                <Download size={12} className="inline mr-1" />Convert to Spec
              </button>
            </div>
          )}
        </div>

        {savedProducts.size === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border py-12 text-center">
            <Bookmark size={24} className="mx-auto text-muted/40 mb-3" />
            <p className="text-[13px] font-medium text-muted">No products saved yet</p>
            <p className="text-[11px] text-muted mt-1">Save products from matching results to see them here</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...savedProducts].map((pid) => {
              const product = products.find((p) => p.id === pid);
              if (!product) return null;
              const momentum = productMomentumData.find((m) => m.productId === pid);
              return (
                <div key={pid} className="flex items-center gap-3 rounded-xl border border-border p-3">
                  <div className="h-12 w-12 rounded-lg bg-surface shrink-0 flex items-center justify-center">
                    <span className="text-[8px] text-muted">{product.category}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold truncate">{product.name}</p>
                    <p className="text-[10px] text-muted">{product.brand}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-medium">{product.price}</span>
                      {momentum && <TrendBadge trend={momentum.trend} />}
                    </div>
                  </div>
                  <button onClick={() => toggleSaveProduct(pid)} className="rounded-lg p-1.5 text-muted hover:text-rose transition-colors">
                    <Bookmark size={14} className="fill-current" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Shortlisted Architects */}
      <div className="rounded-2xl border border-border bg-white p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground"><Star size={16} className="text-white" /></div>
            <div>
              <h2 className="text-[14px] font-semibold">Shortlisted Architects</h2>
              <p className="text-[11px] text-muted">{shortlistedArchitects.size} architect{shortlistedArchitects.size !== 1 ? "s" : ""} shortlisted</p>
            </div>
          </div>
          {shortlistedArchitects.size > 0 && (
            <button className="rounded-lg bg-foreground px-3 py-1.5 text-[11px] font-medium text-white hover:opacity-90 transition-opacity">
              <ArrowUpRight size={12} className="inline mr-1" />Send Enquiry
            </button>
          )}
        </div>

        {shortlistedArchitects.size === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border py-12 text-center">
            <Star size={24} className="mx-auto text-muted/40 mb-3" />
            <p className="text-[13px] font-medium text-muted">No architects shortlisted</p>
            <p className="text-[11px] text-muted mt-1">Shortlist architects from matching results to see them here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...shortlistedArchitects].map((aid) => {
              const arch = architects.find((a) => a.id === aid);
              if (!arch) return null;
              const influence = architectInfluenceData.find((a) => a.architectId === aid);
              return (
                <div key={aid} className="flex items-center gap-4 rounded-xl border border-border p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-[12px] font-bold text-white">
                    {arch.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold">{arch.name}</p>
                    <p className="text-[11px] text-muted">{arch.firm} · {arch.location}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {influence && (
                      <div className="text-center">
                        <p className="text-[14px] font-bold">{influence.influenceScore}</p>
                        <p className="text-[9px] text-muted">Influence</p>
                      </div>
                    )}
                    <div className="flex gap-1.5">
                      <button className="rounded-lg border border-border px-3 py-1.5 text-[11px] font-medium text-muted hover:bg-surface">View Profile</button>
                      <button onClick={() => toggleShortlistArchitect(aid)} className="rounded-lg p-1.5 text-muted hover:text-rose transition-colors">
                        <Star size={14} className="fill-current" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-border bg-white p-6">
        <h2 className="text-[14px] font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Create Design Board", sub: "From saved products", icon: Layers },
            { label: "Generate Specification", sub: "From matched products", icon: Download },
            { label: "Export Match Report", sub: "PDF summary", icon: BarChart3 },
            { label: "Share with Team", sub: "Invite collaborators", icon: Users },
          ].map((qa) => (
            <button key={qa.label} className="rounded-xl border border-border p-4 text-left transition-all hover:border-foreground/30 hover:shadow-sm group">
              <qa.icon size={18} className="text-muted mb-3 group-hover:text-foreground transition-colors" />
              <p className="text-[12px] font-semibold">{qa.label}</p>
              <p className="text-[10px] text-muted mt-0.5">{qa.sub}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function MatchingPage() {
  const [activeTab, setActiveTab] = useState<TabId>("brief-product");
  const [selectedBrief, setSelectedBrief] = useState(0);
  const [selectedProject, setSelectedProject] = useState(0);
  const [savedProducts, setSavedProducts] = useState<Set<string>>(new Set());
  const [shortlistedArchitects, setShortlistedArchitects] = useState<Set<string>>(new Set());

  const brief = mockBriefs[selectedBrief];

  const briefProductMatches = useMemo(() => computeBriefProductMatches(brief), [brief]);
  const briefArchitectMatches = useMemo(() => computeBriefArchitectMatches(brief), [brief]);
  const projectProductMatches = useMemo(() => computeProjectProductMatches(), []);
  const roomMatchesData = useMemo(() => computeRoomMatches(), []);
  const styleMaterial = useMemo(() => computeStyleMaterialMatrix(), []);
  const recommendationLogic = useMemo(() => computeRecommendationLogic(), []);

  const currentProjectMatch = projectProductMatches[selectedProject];

  const topMatchScore = briefProductMatches[0]?.score || 0;
  const avgMatchScore = Math.round(briefProductMatches.reduce((s, m) => s + m.score, 0) / briefProductMatches.length);
  const highMatches = briefProductMatches.filter((m) => m.score >= 60).length;
  const categoriesCovered = new Set(briefProductMatches.filter((m) => m.categoryFit).map((m) => m.product.category)).size;

  const toggleSaveProduct = (id: string) => {
    const next = new Set(savedProducts);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSavedProducts(next);
  };

  const toggleShortlistArchitect = (id: string) => {
    const next = new Set(shortlistedArchitects);
    if (next.has(id)) next.delete(id); else next.add(id);
    setShortlistedArchitects(next);
  };

  return (
    <div className="min-h-screen bg-surface/50">
      <MatchingHero
        topMatchScore={topMatchScore}
        avgMatchScore={avgMatchScore}
        highMatches={highMatches}
        categoriesCovered={categoriesCovered}
      />

      {/* Tabs */}
      <div className="border-b border-border bg-white px-8">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-[12px] font-medium transition-colors ${activeTab === tab.id ? "border-foreground text-foreground" : "border-transparent text-muted hover:text-foreground"}`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {activeTab === "brief-product" && (
          <BriefToProductSection
            brief={brief}
            selectedBrief={selectedBrief}
            setSelectedBrief={setSelectedBrief}
            matches={briefProductMatches}
            savedProducts={savedProducts}
            toggleSaveProduct={toggleSaveProduct}
          />
        )}

        {activeTab === "brief-architect" && (
          <BriefToArchitectSection
            brief={brief}
            selectedBrief={selectedBrief}
            setSelectedBrief={setSelectedBrief}
            matches={briefArchitectMatches}
            shortlistedArchitects={shortlistedArchitects}
            toggleShortlistArchitect={toggleShortlistArchitect}
          />
        )}

        {activeTab === "project-product" && currentProjectMatch && (
          <ProjectToProductSection
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
            match={currentProjectMatch}
            savedProducts={savedProducts}
            toggleSaveProduct={toggleSaveProduct}
          />
        )}

        {activeTab === "room-matching" && (
          <RoomMatchingSection roomMatches={roomMatchesData} />
        )}

        {activeTab === "style-material" && (
          <StyleMaterialSection styleMaterial={styleMaterial} />
        )}

        {activeTab === "logic" && (
          <RecommendationLogicSection signals={recommendationLogic} />
        )}

        {activeTab === "actions" && (
          <MatchingActionsSection
            savedProducts={savedProducts}
            shortlistedArchitects={shortlistedArchitects}
            toggleSaveProduct={toggleSaveProduct}
            toggleShortlistArchitect={toggleShortlistArchitect}
          />
        )}
      </div>
    </div>
  );
}
