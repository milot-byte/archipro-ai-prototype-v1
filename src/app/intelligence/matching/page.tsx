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
  AlertTriangle,
  ShoppingCart,
  Bath,
  UtensilsCrossed,
  Sun,
  Bed,
  Sofa,
  Link2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Hexagon,
  Gem,
  Wrench,
  Gauge,
  SlidersHorizontal,
  GitBranch,
  Activity,
  Scale,
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
  // ─── Granular score breakdown ───
  styleAlignScore: number;      // 0-100
  materialAlignScore: number;   // 0-100
  projectTypeScore: number;     // 0-100
  roomRelevanceScore: number;   // 0-100
  precedentScore: number;       // 0-100
  trendAlignScore: number;      // 0-100
  monthlySparkline: number[];
  categoryStrengths: { category: string; count: number; pct: number }[];
  materialPreferences: string[];
  archType: "boutique" | "established";
}

interface ProjectProductRec {
  product: Product;
  score: number;
  reasons: string[];
  isPremium: boolean;
  tier: "premium" | "practical";
  // ─── Granular scores ───
  roomRelevance: number;
  styleFit: number;
  materialFit: number;
  trendAlign: number;
  architectPrecedent: number;
  categoryFit: number;
  weeklySparkline: number[];
  substituteIds: string[];
  isArchitectPreferred: boolean;
  isTrending: boolean;
  momentumTrend: string;
  // ─── Impact projections ───
  specCompletenessAfter: number;
  costImpact: number;
  coverageAfter: number;
  patternAlignAfter: number;
}

interface CategoryGap {
  category: string;
  coverage: number;       // 0-100 how covered
  needed: number;         // estimated items needed
  available: number;      // items in the catalog for this category
  severity: "critical" | "moderate" | "low";
  topRecommendation: Product | null;
}

interface ProjectProductMatch {
  project: (typeof projects)[number];
  projectProducts: Product[];
  missingCategories: string[];
  recommended: ProjectProductRec[];
  usedCategories: Set<string>;
  // ─── New context signals ───
  detectedStyles: string[];
  detectedMaterials: string[];
  detectedRooms: string[];
  specCompleteness: number;     // 0-100
  totalCostEstimate: number;
  categoryGaps: CategoryGap[];
  allCategories: string[];
}

interface RoomProductRec {
  product: Product;
  score: number;
  reasons: string[];
  styleFit: number;
  materialFit: number;
  categoryFit: number;
  tier: "premium" | "practical";
  substituteIds: string[];
}

interface RoomCategoryGap {
  category: string;
  severity: "critical" | "optional-upgrade" | "recommended";
  topProduct: Product | null;
}

interface RoomCompatPair {
  catA: string;
  catB: string;
  score: number;
  label: string;
}

interface RoomMatch {
  roomName: string;
  topCategories: [string, number][];
  topProducts: { id: string; name: string; count: number; brand: string }[];
  missing: string[];
  recommended: Product[];
  // ─── Deep signals ───
  completeness: number;
  categoryCoverage: number;
  missingCount: number;
  estimatedBudget: number;
  patternAlignment: number;
  specReadiness: number;
  detectedStyles: string[];
  detectedMaterials: string[];
  categoryGaps: RoomCategoryGap[];
  productRecs: RoomProductRec[];
  compatPairs: RoomCompatPair[];
  criticalMissing: string[];
  recommendedNext: string[];
  optionalUpgrades: string[];
}

interface RecommendationSignal {
  name: string;
  weight: number;
  description: string;
  factors: string[];
}

interface ProductScoreBreakdown {
  product: Product;
  finalScore: number;
  confidence: number;
  signals: {
    name: string;
    weight: number;
    rawScore: number;
    normalizedScore: number;
    contribution: number;
    confidence: number;
  }[];
  logicType: { rules: number; pattern: number; trend: number };
  strongestSignals: string[];
  weakestSignals: string[];
  explanation: string;
  alternatives: { productId: string; productName: string; score: number }[];
  categoryAvg: number;
  weeklyConfidence: number[];
}

interface ScoringProfile {
  styleFitW: number;
  materialFitW: number;
  trendW: number;
  architectW: number;
  budgetSensitivity: number;
  categoryW: number;
  coOccurrenceW: number;
  brandW: number;
}

interface RecommendationIntel {
  signals: RecommendationSignal[];
  breakdowns: ProductScoreBreakdown[];
  defaultProfile: ScoringProfile;
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
  const seed = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  };

  return architects.map((arch) => {
    const reasons: string[] = [];
    const influence = architectInfluenceData.find((a) => a.architectId === arch.id);
    const archProjects = projects.filter((p) => p.architectId === arch.id);

    // ── Style alignment ──
    const styleOverlap = arch.specialties.filter((s) =>
      [brief.style, brief.type, brief.location, ...brief.features].some(
        (f) => f.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(f.toLowerCase())
      )
    );
    const styleAlignBase = styleOverlap.length > 0 ? 50 + styleOverlap.length * 18 : 15;
    const styleAlignScore = clamp(styleAlignBase + (seed(arch.id + brief.style) % 20), 0, 100);
    if (styleOverlap.length > 0) reasons.push(`Style match: ${styleOverlap.join(", ")}`);

    // ── Material alignment ──
    const archProductIds = [...new Set(archProjects.flatMap((p) => p.products))];
    const archProducts = archProductIds.map((pid) => products.find((p) => p.id === pid)).filter(Boolean);
    const archMaterials = [...new Set(archProducts.map((p) => p!.name.toLowerCase()))];
    const matOverlap = brief.materials.filter((m) =>
      archMaterials.some((am) => am.includes(m.toLowerCase()))
    );
    const materialAlignBase = matOverlap.length > 0 ? 45 + matOverlap.length * 20 : 20;
    const materialAlignScore = clamp(materialAlignBase + (seed(arch.id + "mat") % 22), 0, 100);
    if (matOverlap.length > 0) reasons.push(`Material affinity: ${matOverlap.join(", ")}`);

    // ── Project type relevance ──
    const typeMatches = archProjects.filter((p) =>
      p.tags.some((t) => [brief.type, brief.style].some((bt) => bt.toLowerCase() === t.toLowerCase()))
    );
    const projectTypeBase = typeMatches.length > 0 ? 40 + typeMatches.length * 20 : 10;
    const projectTypeScore = clamp(projectTypeBase + (seed(arch.id + "type") % 18), 0, 100);
    if (typeMatches.length > 0) reasons.push(`${typeMatches.length} similar project type${typeMatches.length > 1 ? "s" : ""}`);

    // ── Room relevance ──
    // Check if architect has worked with products in categories matching brief rooms
    const roomCategories: Record<string, string[]> = {
      Kitchen: ["Hardware", "Kitchen", "Surfaces", "Lighting"],
      "Living Room": ["Lighting", "Furniture", "Surfaces"],
      Bathroom: ["Surfaces", "Hardware", "Lighting"],
      "Outdoor Deck": ["Decking", "Outdoor"],
      "Master Bedroom": ["Lighting", "Furniture", "Surfaces"],
      "Home Office": ["Lighting", "Furniture"],
      Bedroom: ["Lighting", "Furniture"],
      "Garden Room": ["Furniture", "Lighting", "Surfaces"],
      "Kitchen Nook": ["Kitchen", "Hardware"],
      Pergola: ["Outdoor"],
      Studio: ["Lighting", "Furniture"],
    };
    const neededCats = new Set<string>();
    brief.rooms.forEach((r) => (roomCategories[r] || []).forEach((c) => neededCats.add(c)));
    const archCats = new Set(archProducts.map((p) => p!.category));
    const roomCatOverlap = [...neededCats].filter((c) => archCats.has(c));
    const roomRelevanceBase = roomCatOverlap.length > 0 ? 30 + roomCatOverlap.length * 12 : 10;
    const roomRelevanceScore = clamp(roomRelevanceBase + (seed(arch.id + "room") % 20), 0, 100);
    if (roomCatOverlap.length > 0) reasons.push(`Products in ${roomCatOverlap.length} relevant categories`);

    // ── Architect precedent ──
    const locationMatches = archProjects.filter((p) =>
      brief.location.toLowerCase().split(" ").some((l) => p.tags.some((t) => t.toLowerCase().includes(l)))
    );
    const precedentBase = (locationMatches.length > 0 ? 30 : 0) + Math.min(arch.projectCount * 3, 30);
    const precedentScore = clamp(precedentBase + (seed(arch.id + "prec") % 25), 0, 100);
    if (locationMatches.length > 0) reasons.push(`${locationMatches.length} similar location project${locationMatches.length > 1 ? "s" : ""}`);
    reasons.push(`${arch.projectCount} projects completed`);

    // ── Trend alignment ──
    const trendBase = influence ? Math.round(influence.influenceScore * 0.7) : 25;
    const trendAlignScore = clamp(trendBase + (seed(arch.id + "trend") % 20), 0, 100);
    if (influence) reasons.push(`Influence score: ${influence.influenceScore}`);

    // ── Composite score ──
    const score = clamp(Math.round(
      styleAlignScore * 0.22 +
      materialAlignScore * 0.16 +
      projectTypeScore * 0.18 +
      roomRelevanceScore * 0.14 +
      precedentScore * 0.15 +
      trendAlignScore * 0.15
    ), 0, 100);

    // ── Monthly sparkline ──
    const monthlySparkline = influence
      ? influence.monthlyTrend.map((m) => m.score)
      : Array.from({ length: 6 }, (_, i) => 40 + (seed(arch.id + `m${i}`) % 40));

    // ── Similar projects ──
    const similarProjects = archProjects.filter((p) =>
      p.tags.some((t) => [brief.style, brief.type, ...brief.features].some((f) => f.toLowerCase() === t.toLowerCase()))
    );

    // ── Category strengths ──
    const catMap = new Map<string, number>();
    archProducts.forEach((p) => catMap.set(p!.category, (catMap.get(p!.category) || 0) + 1));
    const totalProds = archProducts.length || 1;
    const categoryStrengths = [...catMap.entries()]
      .map(([category, count]) => ({ category, count, pct: Math.round((count / totalProds) * 100) }))
      .sort((a, b) => b.count - a.count);

    // ── Material preferences ──
    const materialPreferences = [...new Set(archProducts.map((p) => p!.category))];

    // ── Arch type ──
    const archType: "boutique" | "established" = arch.projectCount >= 10 ? "established" : "boutique";

    return {
      architect: arch,
      score,
      reasons,
      influence,
      similarProjects,
      styleOverlap,
      styleAlignScore,
      materialAlignScore,
      projectTypeScore,
      roomRelevanceScore,
      precedentScore,
      trendAlignScore,
      monthlySparkline,
      categoryStrengths,
      materialPreferences,
      archType,
    };
  }).sort((a, b) => b.score - a.score);
}

function computeProjectProductMatches(): ProjectProductMatch[] {
  const seed = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  };

  const allCategories = [...new Set(products.map((p) => p.category))];

  return projects.map((project) => {
    const projectProducts = project.products.map((pid) => products.find((p) => p.id === pid)).filter(Boolean) as Product[];
    const usedCategories = new Set(projectProducts.map((p) => p.category));
    const missingCategories = allCategories.filter((c) => !usedCategories.has(c));

    // ── Context signals ──
    const detectedStyles = [...new Set(project.tags)];
    const detectedMaterials = [...new Set(projectProducts.map((p) => p.category))];
    const spec = specifications.find((s) => s.projectId === project.id);
    const detectedRooms = spec ? spec.rooms.map((r) => r.name) : [];

    // ── Spec completeness ──
    const specItemCount = spec ? spec.rooms.reduce((sum, r) => sum + r.items.length, 0) : 0;
    const expectedItems = Math.max(allCategories.length * 2, specItemCount + missingCategories.length * 2);
    const specCompleteness = clamp(Math.round((specItemCount / expectedItems) * 100), 0, 100);

    // ── Total cost estimate ──
    const totalCostEstimate = projectProducts.reduce((sum, p) => sum + parsePrice(p.price), 0);

    // ── Category gaps ──
    const categoryGaps: CategoryGap[] = allCategories.map((cat) => {
      const usedCount = projectProducts.filter((p) => p.category === cat).length;
      const available = products.filter((p) => p.category === cat).length;
      const specItems = spec ? spec.rooms.reduce((sum, r) => sum + r.items.filter((it) => it.category === cat).length, 0) : 0;
      const totalSignal = usedCount + specItems;
      const coverage = totalSignal > 0 ? clamp(Math.round((totalSignal / Math.max(available, 2)) * 100), 0, 100) : 0;
      const severity: "critical" | "moderate" | "low" = coverage === 0 ? "critical" : coverage < 40 ? "moderate" : "low";
      const needed = Math.max(0, 2 - usedCount);
      const topRec = products.find((p) => p.category === cat && !project.products.includes(p.id)) || null;
      return { category: cat, coverage, needed, available, severity, topRecommendation: topRec };
    }).sort((a, b) => a.coverage - b.coverage);

    // ── Architect's product preferences ──
    const archProjects = projects.filter((pr) => pr.architectId === project.architectId);
    const archProductIds = new Set(archProjects.flatMap((pr) => pr.products));

    // ── Recommendations ──
    const recommended: ProjectProductRec[] = products
      .filter((p) => !project.products.includes(p.id))
      .map((p) => {
        const reasons: string[] = [];
        const momentum = productMomentumData.find((m) => m.productId === p.id);
        const pNameLow = p.name.toLowerCase();
        const pBrandLow = p.brand.toLowerCase();

        // ── Category fit ──
        const isMissing = missingCategories.includes(p.category);
        const categoryFit = isMissing ? clamp(70 + (seed(p.id + "cf") % 30), 0, 100) : clamp(15 + (seed(p.id + "cf") % 25), 0, 100);
        if (isMissing) reasons.push(`Fills missing ${p.category} category`);

        // ── Room relevance ──
        const roomCats: Record<string, string[]> = {
          Kitchen: ["Hardware", "Kitchen", "Surfaces", "Lighting"],
          "Living Room": ["Lighting", "Furniture", "Surfaces"],
          "Master Bedroom": ["Lighting", "Furniture"],
          Bathroom: ["Surfaces", "Hardware", "Lighting"],
          "Great Room": ["Lighting", "Furniture", "Surfaces"],
          Studio: ["Lighting", "Furniture"],
          "Outdoor Deck": ["Decking", "Outdoor"],
        };
        const roomHits = detectedRooms.filter((r) => (roomCats[r] || []).includes(p.category));
        const roomRelevance = clamp(roomHits.length > 0 ? 40 + roomHits.length * 18 + (seed(p.id + "rr") % 15) : 10 + (seed(p.id + "rr") % 15), 0, 100);
        if (roomHits.length > 0) reasons.push(`Relevant to ${roomHits.length} room${roomHits.length > 1 ? "s" : ""}`);

        // ── Style fit ──
        const styleHits = detectedStyles.filter((s) => pNameLow.includes(s.toLowerCase()) || pBrandLow.includes(s.toLowerCase()));
        const styleFit = clamp(styleHits.length > 0 ? 55 + styleHits.length * 15 + (seed(p.id + "sf") % 20) : 20 + (seed(p.id + "sf") % 25), 0, 100);
        if (styleHits.length > 0) reasons.push(`Style match: ${styleHits.join(", ")}`);

        // ── Material fit ──
        const matHits = detectedMaterials.filter((m) => pNameLow.includes(m.toLowerCase()) || p.category.toLowerCase() === m.toLowerCase());
        const materialFit = clamp(matHits.length > 0 ? 50 + matHits.length * 15 + (seed(p.id + "mf") % 20) : 15 + (seed(p.id + "mf") % 20), 0, 100);

        // ── Trend alignment ──
        const trendMap: Record<string, number> = { surging: 90, rising: 70, steady: 40, cooling: 20 };
        const trendAlign = clamp((trendMap[momentum?.trend || "steady"] || 40) + (seed(p.id + "ta") % 15), 0, 100);
        if (momentum?.trend === "surging") reasons.push("Surging momentum");
        else if (momentum?.trend === "rising") reasons.push("Rising trend");

        // ── Architect precedent ──
        const isArchitectPreferred = archProductIds.has(p.id);
        const architectPrecedent = clamp(isArchitectPreferred ? 60 + (seed(p.id + "ap") % 30) : 10 + (seed(p.id + "ap") % 20), 0, 100);
        if (isArchitectPreferred) reasons.push("Used by this architect before");

        // Brand affinity
        const brandUsed = projectProducts.some((pp) => pp.brandId === p.brandId);
        if (brandUsed) reasons.push("Same brand already in project");

        if (p.specSheet) reasons.push("Spec sheet available");

        // ── Composite score ──
        const score = clamp(Math.round(
          categoryFit * 0.22 +
          roomRelevance * 0.16 +
          styleFit * 0.16 +
          materialFit * 0.14 +
          trendAlign * 0.16 +
          architectPrecedent * 0.16
        ), 0, 100);

        // ── Sparkline ──
        const weeklySparkline = momentum
          ? momentum.weeklyData.map((d) => d.views)
          : Array.from({ length: 7 }, (_, i) => 100 + (seed(p.id + `w${i}`) % 400));

        // ── Substitutes ──
        const substituteIds = products
          .filter((sp) => sp.category === p.category && sp.id !== p.id && sp.brandId !== p.brandId)
          .slice(0, 3)
          .map((sp) => sp.id);

        // ── Tier ──
        const tier: "premium" | "practical" = parsePrice(p.price) > 400 ? "premium" : "practical";
        const isPremium = tier === "premium";
        const isTrending = momentum?.trend === "surging" || momentum?.trend === "rising";

        // ── Impact projections ──
        const newUsedCats = new Set([...usedCategories, p.category]);
        const coverageAfter = clamp(Math.round((newUsedCats.size / allCategories.length) * 100), 0, 100);
        const newSpecItems = specItemCount + 1;
        const specCompletenessAfter = clamp(Math.round((newSpecItems / expectedItems) * 100), 0, 100);
        const costImpact = parsePrice(p.price);
        const patternAlignAfter = clamp(Math.round(
          (coverageAfter * 0.3 + specCompletenessAfter * 0.3 + score * 0.4)
        ), 0, 100);

        return {
          product: p, score, reasons, isPremium, tier,
          roomRelevance, styleFit, materialFit, trendAlign, architectPrecedent, categoryFit,
          weeklySparkline, substituteIds, isArchitectPreferred, isTrending,
          momentumTrend: momentum?.trend || "steady",
          specCompletenessAfter, costImpact, coverageAfter, patternAlignAfter,
        };
      })
      .sort((a, b) => b.score - a.score);

    return {
      project, projectProducts, missingCategories, recommended, usedCategories,
      detectedStyles, detectedMaterials, detectedRooms, specCompleteness,
      totalCostEstimate, categoryGaps, allCategories,
    };
  });
}

function computeRoomMatches(): RoomMatch[] {
  const seed = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h); };

  const roomData: Record<string, { categories: Map<string, number>; products: Map<string, { name: string; count: number; brand: string }> }> = {};

  specifications.forEach((spec) => {
    spec.rooms.forEach((room) => {
      const key = room.name;
      if (!roomData[key]) roomData[key] = { categories: new Map(), products: new Map() };
      room.items.forEach((item) => {
        roomData[key].categories.set(item.category, (roomData[key].categories.get(item.category) || 0) + 1);
        const existing = roomData[key].products.get(item.productId);
        if (existing) existing.count++;
        else roomData[key].products.set(item.productId, { name: item.productName, count: 1, brand: item.brand });
      });
    });
  });

  // ── Expected categories per room type ──
  const roomExpectedCats: Record<string, string[]> = {
    Kitchen: ["Hardware", "Lighting", "Surfaces", "Furniture"],
    Bathroom: ["Hardware", "Lighting", "Surfaces"],
    "Living Room": ["Lighting", "Furniture", "Surfaces"],
    "Great Room": ["Lighting", "Furniture", "Surfaces"],
    "Master Bedroom": ["Lighting", "Furniture"],
    Bedroom: ["Lighting", "Furniture"],
    Studio: ["Lighting", "Furniture"],
    "Outdoor Deck": ["Lighting", "Furniture", "Surfaces"],
    Outdoor: ["Lighting", "Furniture", "Surfaces"],
  };

  // ── Compatibility pairs for rooms ──
  const compatDefs: Record<string, [string, string, string][]> = {
    Kitchen: [["Hardware", "Lighting", "Finish harmony"], ["Surfaces", "Hardware", "Material match"], ["Lighting", "Furniture", "Style cohesion"], ["Hardware", "Surfaces", "Tone alignment"]],
    Bathroom: [["Hardware", "Surfaces", "Tapware ↔ surfaces"], ["Lighting", "Surfaces", "Ambiance match"], ["Hardware", "Lighting", "Finish consistency"]],
    "Living Room": [["Lighting", "Furniture", "Style cohesion"], ["Furniture", "Surfaces", "Material match"]],
    "Great Room": [["Lighting", "Furniture", "Ambiance match"], ["Furniture", "Surfaces", "Tone alignment"]],
    "Master Bedroom": [["Lighting", "Furniture", "Style cohesion"]],
    Studio: [["Lighting", "Furniture", "Style cohesion"]],
    "Outdoor Deck": [["Lighting", "Furniture", "Outdoor cohesion"], ["Furniture", "Surfaces", "Weatherproofing"]],
  };

  const allCats = [...new Set(products.map((p) => p.category))];

  return Object.entries(roomData).map(([roomName, data]) => {
    const topCategories = [...data.categories.entries()].sort((a, b) => b[1] - a[1]) as [string, number][];
    const topProducts = [...data.products.entries()]
      .map(([id, info]) => ({ id, ...info }))
      .sort((a, b) => b.count - a.count);

    const usedCats = new Set(topCategories.map(([c]) => c));
    const missing = allCats.filter((c) => !usedCats.has(c));
    const recommended = products
      .filter((p) => missing.includes(p.category) && !data.products.has(p.id))
      .slice(0, 3);

    // ── Completeness & coverage ──
    const expectedCats = roomExpectedCats[roomName] || allCats.slice(0, 4);
    const coveredExpected = expectedCats.filter((c) => usedCats.has(c));
    const categoryCoverage = clamp(Math.round((coveredExpected.length / expectedCats.length) * 100), 0, 100);
    const totalItems = topProducts.reduce((s, p) => s + p.count, 0);
    const expectedItems = expectedCats.length * 3;
    const completeness = clamp(Math.round((totalItems / expectedItems) * 100), 0, 100);
    const missingCount = expectedCats.length - coveredExpected.length;

    // ── Budget ──
    const estimatedBudget = topProducts.reduce((s, p) => {
      const prod = products.find((pr) => pr.id === p.id);
      return s + (prod ? parsePrice(prod.price) * p.count : 0);
    }, 0);

    // ── Pattern alignment ──
    const patternAlignment = clamp(Math.round(completeness * 0.4 + categoryCoverage * 0.4 + (seed(roomName) % 20) + 5), 0, 100);

    // ── Spec readiness ──
    const specReadiness = clamp(Math.round(completeness * 0.5 + categoryCoverage * 0.3 + (missingCount === 0 ? 20 : 0)), 0, 100);

    // ── Detected styles/materials from tags of projects containing these products ──
    const roomProductIds = new Set(topProducts.map((p) => p.id));
    const relatedProjects = projects.filter((pr) => pr.products.some((pid) => roomProductIds.has(pid)));
    const detectedStyles = [...new Set(relatedProjects.flatMap((pr) => pr.tags))];
    const detectedMaterials = [...usedCats];

    // ── Category gaps ──
    const categoryGaps: RoomCategoryGap[] = expectedCats
      .filter((c) => !usedCats.has(c))
      .map((cat) => {
        const topProduct = products.find((p) => p.category === cat && !data.products.has(p.id)) || null;
        const isCore = expectedCats.indexOf(cat) < 2;
        return {
          category: cat,
          severity: isCore ? "critical" as const : "recommended" as const,
          topProduct,
        };
      });

    // Add optional upgrades for categories that exist but are thin
    const optionalUpgrades = [...usedCats].filter((c) => {
      const count = data.categories.get(c) || 0;
      return count < 2;
    });
    optionalUpgrades.forEach((cat) => {
      const topProduct = products.find((p) => p.category === cat && !data.products.has(p.id)) || null;
      categoryGaps.push({ category: cat, severity: "optional-upgrade", topProduct });
    });

    const criticalMissing = categoryGaps.filter((g) => g.severity === "critical").map((g) => g.category);
    const recommendedNext = categoryGaps.filter((g) => g.severity === "recommended").map((g) => g.category);

    // ── Product recommendations ──
    const productRecs: RoomProductRec[] = products
      .filter((p) => !data.products.has(p.id) && (missing.includes(p.category) || expectedCats.includes(p.category)))
      .map((p) => {
        const reasons: string[] = [];
        const isMissing = missing.includes(p.category);
        const categoryFit = isMissing ? clamp(65 + seed(p.id + roomName + "cf") % 30, 0, 100) : clamp(20 + seed(p.id + roomName + "cf") % 25, 0, 100);
        if (isMissing) reasons.push(`Fills missing ${p.category}`);

        const styleMatches = detectedStyles.filter((s) => p.name.toLowerCase().includes(s.toLowerCase()) || p.brand.toLowerCase().includes(s.toLowerCase()));
        const styleFit = clamp(styleMatches.length > 0 ? 50 + styleMatches.length * 15 + seed(p.id + "rsf") % 20 : 15 + seed(p.id + "rsf") % 25, 0, 100);
        if (styleMatches.length > 0) reasons.push(`Style: ${styleMatches.join(", ")}`);

        const materialFit = clamp(usedCats.has(p.category) ? 40 + seed(p.id + "rmf") % 30 : 20 + seed(p.id + "rmf") % 20, 0, 100);

        const score = clamp(Math.round(categoryFit * 0.35 + styleFit * 0.25 + materialFit * 0.2 + (seed(p.id + roomName) % 20)), 0, 100);

        const substituteIds = products
          .filter((sp) => sp.category === p.category && sp.id !== p.id && sp.brandId !== p.brandId)
          .slice(0, 3).map((sp) => sp.id);

        const tier: "premium" | "practical" = parsePrice(p.price) > 400 ? "premium" : "practical";

        if (p.specSheet) reasons.push("Spec sheet available");
        const momentum = productMomentumData.find((m) => m.productId === p.id);
        if (momentum?.trend === "surging") reasons.push("Surging trend");
        else if (momentum?.trend === "rising") reasons.push("Rising trend");

        return { product: p, score, reasons, styleFit, materialFit, categoryFit, tier, substituteIds };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    // ── Compatibility pairs ──
    const pairDefs = compatDefs[roomName] || compatDefs["Living Room"] || [];
    const compatPairs: RoomCompatPair[] = pairDefs.map(([catA, catB, label]) => {
      const hasA = usedCats.has(catA);
      const hasB = usedCats.has(catB);
      const base = hasA && hasB ? 60 : hasA || hasB ? 35 : 10;
      return { catA, catB, score: clamp(base + seed(roomName + catA + catB) % 30, 0, 100), label };
    });

    return {
      roomName, topCategories, topProducts, missing, recommended,
      completeness, categoryCoverage, missingCount, estimatedBudget, patternAlignment, specReadiness,
      detectedStyles, detectedMaterials, categoryGaps, productRecs, compatPairs,
      criticalMissing, recommendedNext, optionalUpgrades,
    };
  });
}

// ─── Style Intelligence Types ─────────────────────────────────────────────────

interface MaterialPair {
  matA: string;
  matB: string;
  compatibility: number;
  label: string;
  tier: "premium" | "practical";
}

interface StyleArchitectLink {
  architectId: string;
  architectName: string;
  alignment: number;
  materialOverlap: number;
  categoryStrength: number;
  projectCount: number;
  projectNames: string[];
}

interface StyleProductLink {
  product: Product;
  fitScore: number;
  trendAlign: number;
  projectUsage: number;
  architectAdoption: number;
}

interface StyleProfile {
  style: string;
  topCategories: { category: string; count: number }[];
  topArchitects: StyleArchitectLink[];
  topProducts: StyleProductLink[];
  topBrands: { brandId: string; brandName: string; productCount: number; score: number }[];
  topMaterials: string[];
  strongestCombinations: { partner: string; strength: number }[];
  totalUsage: number;
}

interface StyleMaterialIntel {
  styles: string[];
  categories: string[];
  matrix: Record<string, Record<string, number>>;
  materialPairs: MaterialPair[];
  styleProfiles: StyleProfile[];
  graphNodes: { id: string; type: "style" | "material" | "architect" | "brand" | "product"; label: string }[];
  graphEdges: { from: string; to: string; weight: number }[];
}

function computeStyleMaterialMatrix(): StyleMaterialIntel {
  const seed = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h); };

  const styles = [...new Set(projects.flatMap((p) => p.tags))];
  const categories = [...new Set(products.map((p) => p.category))];

  // ── Basic matrix ──
  const matrix: Record<string, Record<string, number>> = {};
  styles.forEach((s) => { matrix[s] = {}; categories.forEach((c) => (matrix[s][c] = 0)); });
  projects.forEach((proj) => {
    const projProducts = proj.products.map((pid) => products.find((p) => p.id === pid)).filter(Boolean);
    proj.tags.forEach((tag) => {
      projProducts.forEach((p) => { if (matrix[tag]) matrix[tag][p!.category] = (matrix[tag][p!.category] || 0) + 1; });
    });
  });

  // ── Material compatibility pairs ──
  const materialDefs: [string, string, string, "premium" | "practical"][] = [
    ["Timber", "Stone", "Natural warmth pairing", "premium"],
    ["Oak Flooring", "Lime Plaster", "Organic texture harmony", "premium"],
    ["Travertine", "Brushed Brass", "Luxury mediterranean set", "premium"],
    ["Concrete", "Black Steel", "Industrial minimal set", "practical"],
    ["Engineered Timber", "Matte Hardware", "Modern practical core", "practical"],
    ["Ceramic Tile", "Chrome Tapware", "Classic bathroom set", "practical"],
    ["Natural Stone", "Brass Hardware", "Premium classic pairing", "premium"],
    ["Marble", "Glass Pendant", "High-end lighting pair", "premium"],
    ["Vinyl Plank", "Stainless Appliance", "Budget kitchen core", "practical"],
    ["Hardwood", "Linen Upholstery", "Warm modern living set", "premium"],
  ];
  const materialPairs: MaterialPair[] = materialDefs.map(([matA, matB, label, tier]) => ({
    matA, matB, compatibility: clamp(55 + seed(matA + matB) % 40, 0, 100), label, tier,
  }));

  // ── Style profiles ──
  const styleProfiles: StyleProfile[] = styles.map((style) => {
    const styleProjects = projects.filter((p) => p.tags.includes(style));
    const styleProdIds = new Set(styleProjects.flatMap((p) => p.products));
    const styleProducts = products.filter((p) => styleProdIds.has(p.id));

    // Top categories
    const catCounts: Record<string, number> = {};
    styleProducts.forEach((p) => { catCounts[p.category] = (catCounts[p.category] || 0) + 1; });
    const topCategories = Object.entries(catCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // Top architects
    const archMap: Record<string, { projects: string[]; cats: Set<string>; mats: Set<string> }> = {};
    styleProjects.forEach((proj) => {
      if (!archMap[proj.architectId]) archMap[proj.architectId] = { projects: [], cats: new Set(), mats: new Set() };
      archMap[proj.architectId].projects.push(proj.title);
      proj.products.forEach((pid) => {
        const p = products.find((pr) => pr.id === pid);
        if (p) { archMap[proj.architectId].cats.add(p.category); archMap[proj.architectId].mats.add(p.category); }
      });
    });
    const topArchitects: StyleArchitectLink[] = Object.entries(archMap).map(([archId, data]) => {
      const arch = architects.find((a) => a.id === archId);
      const matOverlap = clamp(Math.round((data.mats.size / Math.max(categories.length, 1)) * 100), 0, 100);
      const catStrength = clamp(Math.round((data.cats.size / Math.max(categories.length, 1)) * 100), 0, 100);
      return {
        architectId: archId,
        architectName: arch?.name || archId,
        alignment: clamp(Math.round(catStrength * 0.4 + matOverlap * 0.3 + data.projects.length * 15), 0, 100),
        materialOverlap: matOverlap,
        categoryStrength: catStrength,
        projectCount: data.projects.length,
        projectNames: data.projects,
      };
    }).sort((a, b) => b.alignment - a.alignment);

    // Top products
    const topProducts: StyleProductLink[] = styleProducts.map((p) => {
      const mom = productMomentumData.find((m) => m.productId === p.id);
      const trendMap: Record<string, number> = { surging: 90, rising: 70, steady: 45, cooling: 20 };
      const trendAlign = clamp((trendMap[mom?.trend || "steady"] || 45) + seed(p.id + style + "ta") % 15, 0, 100);
      const usageProjects = styleProjects.filter((pr) => pr.products.includes(p.id));
      const adoptingArchitects = [...new Set(usageProjects.map((pr) => pr.architectId))];
      return {
        product: p,
        fitScore: clamp(40 + seed(p.id + style + "fs") % 50, 0, 100),
        trendAlign,
        projectUsage: usageProjects.length,
        architectAdoption: adoptingArchitects.length,
      };
    }).sort((a, b) => b.fitScore - a.fitScore);

    // Top brands
    const brandMap: Record<string, { name: string; count: number }> = {};
    styleProducts.forEach((p) => {
      if (!brandMap[p.brandId]) brandMap[p.brandId] = { name: p.brand, count: 0 };
      brandMap[p.brandId].count++;
    });
    const topBrands = Object.entries(brandMap)
      .map(([brandId, info]) => ({ brandId, brandName: info.name, productCount: info.count, score: clamp(30 + info.count * 15 + seed(brandId + style) % 20, 0, 100) }))
      .sort((a, b) => b.score - a.score);

    // Top materials (derived from categories)
    const topMaterials = topCategories.slice(0, 4).map((c) => c.category);

    // Strongest style combinations
    const strongestCombinations = styles
      .filter((s2) => s2 !== style)
      .map((s2) => {
        const overlap = categories.reduce((sum, c) => sum + Math.min(matrix[style]?.[c] || 0, matrix[s2]?.[c] || 0), 0);
        return { partner: s2, strength: clamp(overlap * 12 + seed(style + s2) % 15, 0, 100) };
      })
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 3);

    return {
      style,
      topCategories,
      topArchitects,
      topProducts,
      topBrands,
      topMaterials,
      strongestCombinations,
      totalUsage: styleProducts.length,
    };
  });

  // ── Relationship graph ──
  const graphNodes: StyleMaterialIntel["graphNodes"] = [];
  const graphEdges: StyleMaterialIntel["graphEdges"] = [];

  styles.forEach((s) => graphNodes.push({ id: `s-${s}`, type: "style", label: s }));
  categories.forEach((c) => graphNodes.push({ id: `m-${c}`, type: "material", label: c }));

  const archInGraph = new Set<string>();
  const brandInGraph = new Set<string>();
  const prodInGraph = new Set<string>();

  styleProfiles.forEach((sp) => {
    // style → material edges
    sp.topCategories.forEach((tc) => {
      if (tc.count > 0) graphEdges.push({ from: `s-${sp.style}`, to: `m-${tc.category}`, weight: tc.count });
    });
    // style → architect edges
    sp.topArchitects.slice(0, 2).forEach((a) => {
      if (!archInGraph.has(a.architectId)) {
        graphNodes.push({ id: `a-${a.architectId}`, type: "architect", label: a.architectName });
        archInGraph.add(a.architectId);
      }
      graphEdges.push({ from: `s-${sp.style}`, to: `a-${a.architectId}`, weight: a.alignment });
    });
    // style → brand edges
    sp.topBrands.slice(0, 2).forEach((b) => {
      if (!brandInGraph.has(b.brandId)) {
        graphNodes.push({ id: `b-${b.brandId}`, type: "brand", label: b.brandName });
        brandInGraph.add(b.brandId);
      }
      graphEdges.push({ from: `s-${sp.style}`, to: `b-${b.brandId}`, weight: b.score });
    });
    // style → top product edges
    sp.topProducts.slice(0, 2).forEach((p) => {
      if (!prodInGraph.has(p.product.id)) {
        graphNodes.push({ id: `p-${p.product.id}`, type: "product", label: p.product.name });
        prodInGraph.add(p.product.id);
      }
      graphEdges.push({ from: `s-${sp.style}`, to: `p-${p.product.id}`, weight: p.fitScore });
    });
  });

  return { styles, categories, matrix, materialPairs, styleProfiles, graphNodes, graphEdges };
}

function computeRecommendationLogic(): RecommendationIntel {
  const seed = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h); };

  const signals: RecommendationSignal[] = [
    { name: "Style Fit", weight: 18, description: "How well the product matches stated style preferences and design language", factors: ["Style tag overlap", "Material keywords", "Design language", "Palette alignment"] },
    { name: "Material Fit", weight: 16, description: "Material compatibility with existing project selections and specification requirements", factors: ["Material type match", "Finish consistency", "Texture harmony", "Durability class"] },
    { name: "Room Relevance", weight: 14, description: "Whether the product is appropriate for the detected rooms in the project", factors: ["Room type mapping", "Category-room affinity", "Specification gaps"] },
    { name: "Category Fit", weight: 14, description: "Whether the product fills a missing or under-covered category gap", factors: ["Missing categories", "Category coverage %", "Room requirements"] },
    { name: "Trend Alignment", weight: 12, description: "Current momentum signals — trending products get boosted", factors: ["View growth rate", "Save velocity", "Board additions", "Momentum score"] },
    { name: "Architect Precedent", weight: 12, description: "Whether the architect has used this product or brand in prior projects", factors: ["Prior project usage", "Brand preference", "Spec history"] },
    { name: "Co-occurrence", weight: 8, description: "Products frequently used together in projects, boards, and specs", factors: ["Project co-usage", "Board co-existence", "Spec room pairings"] },
    { name: "Brand Affinity", weight: 6, description: "Whether the brand is already present or preferred in the project", factors: ["Existing brand usage", "Brand influence score", "Supplier relationship"] },
  ];

  const defaultProfile: ScoringProfile = {
    styleFitW: 18, materialFitW: 16, trendW: 12, architectW: 12,
    budgetSensitivity: 50, categoryW: 14, coOccurrenceW: 8, brandW: 6,
  };

  // Generate per-product breakdowns
  const breakdowns: ProductScoreBreakdown[] = products.map((product) => {
    const signalScores = signals.map((sig) => {
      const rawScore = clamp(30 + seed(product.id + sig.name + "raw") % 65, 0, 100);
      const normalizedScore = clamp(Math.round(rawScore * (0.7 + (seed(product.id + sig.name + "norm") % 30) / 100)), 0, 100);
      const contribution = Math.round((normalizedScore * sig.weight) / 100);
      const confidence = clamp(50 + seed(product.id + sig.name + "conf") % 45, 0, 100);
      return { name: sig.name, weight: sig.weight, rawScore, normalizedScore, contribution, confidence };
    });

    const finalScore = clamp(signalScores.reduce((sum, s) => sum + s.contribution, 0), 0, 100);
    const confidence = clamp(Math.round(signalScores.reduce((sum, s) => sum + s.confidence, 0) / signalScores.length), 0, 100);

    const sorted = [...signalScores].sort((a, b) => b.contribution - a.contribution);
    const strongestSignals = sorted.slice(0, 3).map((s) => s.name);
    const weakestSignals = sorted.slice(-2).map((s) => s.name);

    // Logic type breakdown
    const rulesContrib = signalScores.filter((s) => ["Category Fit", "Room Relevance", "Brand Affinity"].includes(s.name)).reduce((sum, s) => sum + s.contribution, 0);
    const patternContrib = signalScores.filter((s) => ["Architect Precedent", "Co-occurrence", "Style Fit"].includes(s.name)).reduce((sum, s) => sum + s.contribution, 0);
    const trendContrib = signalScores.filter((s) => ["Trend Alignment", "Material Fit"].includes(s.name)).reduce((sum, s) => sum + s.contribution, 0);
    const totalContrib = Math.max(rulesContrib + patternContrib + trendContrib, 1);
    const logicType = {
      rules: Math.round((rulesContrib / totalContrib) * 100),
      pattern: Math.round((patternContrib / totalContrib) * 100),
      trend: Math.round((trendContrib / totalContrib) * 100),
    };

    const explanation = `${product.name} scored ${finalScore}% driven primarily by ${strongestSignals[0]} (${sorted[0].contribution}pts) and ${strongestSignals[1]} (${sorted[1].contribution}pts). ${weakestSignals[0]} contributed least. Confidence: ${confidence}%.`;

    // Alternatives
    const alternatives = products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 3)
      .map((p) => ({ productId: p.id, productName: p.name, score: clamp(25 + seed(p.id + "alt") % 65, 0, 100) }));

    // Category average
    const catProducts = products.filter((p) => p.category === product.category);
    const categoryAvg = Math.round(catProducts.reduce((sum, p) => sum + clamp(30 + seed(p.id + "cavg") % 55, 0, 100), 0) / Math.max(catProducts.length, 1));

    // Weekly confidence timeline
    const weeklyConfidence = Array.from({ length: 8 }, (_, i) => clamp(confidence - 15 + seed(product.id + `wc${i}`) % 30, 30, 100));

    return { product, finalScore, confidence, signals: signalScores, logicType, strongestSignals, weakestSignals, explanation, alternatives, categoryAvg, weeklyConfidence };
  }).sort((a, b) => b.finalScore - a.finalScore);

  return { signals, breakdowns, defaultProfile };
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

type ArchSortKey = "score" | "styleAlignScore" | "materialAlignScore" | "projectTypeScore" | "roomRelevanceScore" | "precedentScore" | "trendAlignScore" | "projectCount";

function BriefToArchitectSection({ brief, selectedBrief, setSelectedBrief, matches, shortlistedArchitects, toggleShortlistArchitect, savedProducts, toggleSaveProduct }: {
  brief: Brief;
  selectedBrief: number;
  setSelectedBrief: (i: number) => void;
  matches: BriefArchitectMatch[];
  shortlistedArchitects: Set<string>;
  toggleShortlistArchitect: (id: string) => void;
  savedProducts: Set<string>;
  toggleSaveProduct: (id: string) => void;
}) {
  const [sortKey, setSortKey] = useState<ArchSortKey>("score");
  const [sortAsc, setSortAsc] = useState(false);
  const [typeFilter, setTypeFilter] = useState<"all" | "boutique" | "established">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [contacted, setContacted] = useState<Set<string>>(new Set());
  const [addedToBrief, setAddedToBrief] = useState<Set<string>>(new Set());

  const handleSort = (key: ArchSortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const sorted = useMemo(() => {
    const filtered = typeFilter === "all" ? matches : matches.filter((m) => m.archType === typeFilter);
    return [...filtered].sort((a, b) => {
      let av: number, bv: number;
      if (sortKey === "projectCount") {
        av = a.architect.projectCount;
        bv = b.architect.projectCount;
      } else {
        av = a[sortKey];
        bv = b[sortKey];
      }
      return sortAsc ? av - bv : bv - av;
    });
  }, [matches, sortKey, sortAsc, typeFilter]);

  const toggleContact = (id: string) => {
    const next = new Set(contacted);
    if (next.has(id)) next.delete(id); else next.add(id);
    setContacted(next);
  };

  const toggleBrief = (id: string) => {
    const next = new Set(addedToBrief);
    if (next.has(id)) next.delete(id); else next.add(id);
    setAddedToBrief(next);
  };

  // Category average for benchmarking
  const avgScores = useMemo(() => {
    const n = matches.length || 1;
    return {
      score: Math.round(matches.reduce((s, m) => s + m.score, 0) / n),
      style: Math.round(matches.reduce((s, m) => s + m.styleAlignScore, 0) / n),
      material: Math.round(matches.reduce((s, m) => s + m.materialAlignScore, 0) / n),
      type: Math.round(matches.reduce((s, m) => s + m.projectTypeScore, 0) / n),
      room: Math.round(matches.reduce((s, m) => s + m.roomRelevanceScore, 0) / n),
      precedent: Math.round(matches.reduce((s, m) => s + m.precedentScore, 0) / n),
      trend: Math.round(matches.reduce((s, m) => s + m.trendAlignScore, 0) / n),
    };
  }, [matches]);

  const ArchSortHeader = ({ label, field, className = "" }: { label: string; field: ArchSortKey; className?: string }) => (
    <button onClick={() => handleSort(field)} className={`flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-[0.06em] text-muted hover:text-foreground transition-colors ${className}`}>
      {label}
      <ArrowUpDown size={8} className={sortKey === field ? "text-foreground" : "text-muted/40"} />
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Brief selector */}
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
          <span>·</span>
          <span>Rooms: <strong className="text-foreground">{brief.rooms.length}</strong></span>
        </div>
      </div>

      {/* Controls: type toggle + sort indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-xl border border-border bg-white p-1">
          {([["all", "All Architects", null], ["boutique", "Boutique", Sparkles], ["established", "Established", Shield]] as const).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTypeFilter(key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${typeFilter === key ? "bg-foreground text-white" : "text-muted hover:bg-surface"}`}
            >
              {Icon && <Icon size={12} />}
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted">
          <span>{sorted.length} of {matches.length} architects</span>
          <span>·</span>
          <span>Sorted by <strong className="text-foreground">{sortKey === "score" ? "Overall" : sortKey.replace("Score", "").replace("Align", "")}</strong> {sortAsc ? "↑" : "↓"}</span>
        </div>
      </div>

      {/* Sortable architect recommendation table */}
      <div className="rounded-2xl border border-border bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface/30">
                <th className="p-3 text-left"><span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">#</span></th>
                <th className="p-3 text-left"><span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">Architect</span></th>
                <th className="p-3"><ArchSortHeader label="Match" field="score" /></th>
                <th className="p-3"><ArchSortHeader label="Style" field="styleAlignScore" /></th>
                <th className="p-3"><ArchSortHeader label="Material" field="materialAlignScore" /></th>
                <th className="p-3"><ArchSortHeader label="Type" field="projectTypeScore" /></th>
                <th className="p-3"><ArchSortHeader label="Room" field="roomRelevanceScore" /></th>
                <th className="p-3"><ArchSortHeader label="Precedent" field="precedentScore" /></th>
                <th className="p-3"><ArchSortHeader label="Trend" field="trendAlignScore" /></th>
                <th className="p-3 text-center"><span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">Influence</span></th>
                <th className="p-3"><ArchSortHeader label="Projects" field="projectCount" /></th>
                <th className="p-3 text-center"><span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((match, i) => {
                const isExpanded = expandedId === match.architect.id;

                return (
                  <React.Fragment key={match.architect.id}>
                    <tr
                      className={`border-b border-border transition-colors cursor-pointer ${i < 2 ? "bg-emerald-light/20" : "hover:bg-surface/30"} ${isExpanded ? "bg-surface/40" : ""}`}
                      onClick={() => setExpandedId(isExpanded ? null : match.architect.id)}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-muted w-4 text-center">{i + 1}</span>
                          {match.archType === "boutique" && <Sparkles size={9} className="text-blue-500" />}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2.5 min-w-[200px]">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-[9px] font-bold text-white shrink-0">
                            {match.architect.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-[12px] font-semibold truncate">{match.architect.name}</p>
                              {i === 0 && <span className="rounded-full bg-emerald-light px-1.5 py-0.5 text-[8px] font-bold text-emerald">Top</span>}
                            </div>
                            <p className="text-[10px] text-muted truncate">{match.architect.firm} · {match.architect.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <ScoreRing score={match.score} size={36} strokeWidth={3} />
                      </td>
                      <td className="p-3 text-center"><DimCell score={match.styleAlignScore} /></td>
                      <td className="p-3 text-center"><DimCell score={match.materialAlignScore} /></td>
                      <td className="p-3 text-center"><DimCell score={match.projectTypeScore} /></td>
                      <td className="p-3 text-center"><DimCell score={match.roomRelevanceScore} /></td>
                      <td className="p-3 text-center"><DimCell score={match.precedentScore} /></td>
                      <td className="p-3 text-center"><DimCell score={match.trendAlignScore} /></td>
                      <td className="p-3 text-center">
                        <Sparkline data={match.monthlySparkline} width={52} height={18} color={match.influence && match.influence.influenceScore >= 80 ? "#059669" : "#0a0a0a"} />
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-[11px] font-bold">{match.architect.projectCount}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 justify-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => toggleShortlistArchitect(match.architect.id)}
                            title="Shortlist"
                            className={`rounded-md p-1.5 transition-colors ${shortlistedArchitects.has(match.architect.id) ? "bg-foreground text-white" : "bg-surface text-muted hover:bg-foreground hover:text-white"}`}
                          >
                            <Star size={11} />
                          </button>
                          <button
                            onClick={() => toggleSaveProduct(match.architect.id)}
                            title="Save"
                            className={`rounded-md p-1.5 transition-colors ${savedProducts.has(match.architect.id) ? "bg-foreground text-white" : "bg-surface text-muted hover:bg-foreground hover:text-white"}`}
                          >
                            <Bookmark size={11} />
                          </button>
                          <button
                            onClick={() => toggleContact(match.architect.id)}
                            title="Contact"
                            className={`rounded-md p-1.5 transition-colors ${contacted.has(match.architect.id) ? "bg-emerald text-white" : "bg-surface text-muted hover:bg-emerald hover:text-white"}`}
                          >
                            <ArrowUpRight size={11} />
                          </button>
                          <button
                            onClick={() => toggleBrief(match.architect.id)}
                            title="Add to Brief"
                            className={`rounded-md p-1.5 transition-colors ${addedToBrief.has(match.architect.id) ? "bg-foreground text-white" : "bg-surface text-muted hover:bg-foreground hover:text-white"}`}
                          >
                            <FileText size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded detail panel */}
                    {isExpanded && (
                      <tr className="border-b border-border bg-surface/20">
                        <td colSpan={12} className="p-0">
                          <div className="px-5 py-5">
                            <div className="grid grid-cols-12 gap-6">

                              {/* Col 1: Radar + benchmark */}
                              <div className="col-span-3">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-3">Compatibility Radar</p>
                                <div className="flex justify-center">
                                  <RadarChart scores={[
                                    { label: "Style", value: match.styleAlignScore },
                                    { label: "Material", value: match.materialAlignScore },
                                    { label: "Type", value: match.projectTypeScore },
                                    { label: "Room", value: match.roomRelevanceScore },
                                    { label: "Precedent", value: match.precedentScore },
                                    { label: "Trend", value: match.trendAlignScore },
                                  ]} size={140} />
                                </div>

                                {/* Benchmark vs average */}
                                <div className="mt-4 pt-3 border-t border-border">
                                  <p className="text-[9px] font-semibold uppercase tracking-wider text-muted mb-2">vs Category Average</p>
                                  <div className="space-y-1.5">
                                    {([
                                      ["Overall", match.score, avgScores.score],
                                      ["Style", match.styleAlignScore, avgScores.style],
                                      ["Material", match.materialAlignScore, avgScores.material],
                                      ["Type", match.projectTypeScore, avgScores.type],
                                      ["Room", match.roomRelevanceScore, avgScores.room],
                                      ["Precedent", match.precedentScore, avgScores.precedent],
                                      ["Trend", match.trendAlignScore, avgScores.trend],
                                    ] as const).map(([label, val, avg]) => {
                                      const diff = val - avg;
                                      const diffColor = diff > 0 ? "text-emerald" : diff < 0 ? "text-rose" : "text-muted";
                                      return (
                                        <div key={label} className="flex items-center justify-between text-[9px]">
                                          <span className="text-muted w-14">{label}</span>
                                          <span className="font-bold w-6 text-right">{val}</span>
                                          <span className="text-muted w-8 text-center">avg {avg}</span>
                                          <span className={`font-bold w-8 text-right ${diffColor}`}>
                                            {diff > 0 ? "+" : ""}{diff}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>

                              {/* Col 2: Score breakdown + match reasons + specialties */}
                              <div className="col-span-4">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-3">Score Breakdown</p>
                                <div className="space-y-2.5">
                                  <DimensionBar label="Style" score={match.styleAlignScore} />
                                  <DimensionBar label="Material" score={match.materialAlignScore} />
                                  <DimensionBar label="Proj Type" score={match.projectTypeScore} />
                                  <DimensionBar label="Room" score={match.roomRelevanceScore} />
                                  <DimensionBar label="Precedent" score={match.precedentScore} />
                                  <DimensionBar label="Trend" score={match.trendAlignScore} />
                                </div>

                                <div className="mt-4 pt-3 border-t border-border">
                                  <p className="text-[10px] font-semibold text-muted mb-1.5">Specialties</p>
                                  <div className="flex flex-wrap gap-1">
                                    {match.architect.specialties.map((s) => (
                                      <FitBadge key={s} label={s} active={match.styleOverlap.includes(s)} />
                                    ))}
                                  </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-border">
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

                              {/* Col 3: Similar projects + influenced products + category strengths */}
                              <div className="col-span-5">
                                {/* Similar projects */}
                                {match.similarProjects.length > 0 && (
                                  <div className="mb-4">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">Similar Completed Projects</p>
                                    <div className="grid grid-cols-2 gap-2">
                                      {match.similarProjects.slice(0, 4).map((p) => (
                                        <div key={p.id} className="rounded-lg border border-border p-2.5 hover:border-foreground/20 transition-colors">
                                          <p className="text-[11px] font-semibold truncate">{p.title}</p>
                                          <p className="text-[9px] text-muted">{p.location} · {p.year}</p>
                                          <div className="mt-1.5 flex flex-wrap gap-1">
                                            {p.tags.slice(0, 3).map((t) => (
                                              <span key={t} className={`rounded-full px-1.5 py-0.5 text-[7px] font-medium ${
                                                [brief.style, brief.type, ...brief.features].some((f) => f.toLowerCase() === t.toLowerCase())
                                                  ? "bg-emerald-light text-emerald"
                                                  : "bg-surface text-muted"
                                              }`}>{t}</span>
                                            ))}
                                          </div>
                                          <p className="text-[8px] text-muted mt-1">{p.products.length} product{p.products.length !== 1 ? "s" : ""}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Influenced products */}
                                {match.influence && match.influence.topInfluencedProducts.length > 0 && (
                                  <div className="mb-4">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">Influenced Products</p>
                                    <div className="rounded-xl border border-border overflow-hidden">
                                      <table className="w-full">
                                        <thead>
                                          <tr className="bg-surface/50">
                                            <th className="px-2.5 py-1.5 text-[8px] font-semibold uppercase tracking-wider text-muted text-left">Product</th>
                                            <th className="px-2.5 py-1.5 text-[8px] font-semibold uppercase tracking-wider text-muted text-left">Brand</th>
                                            <th className="px-2.5 py-1.5 text-[8px] font-semibold uppercase tracking-wider text-muted text-right">Influence</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {match.influence.topInfluencedProducts.map((ip) => (
                                            <tr key={ip.productId} className="border-t border-border">
                                              <td className="px-2.5 py-1.5 text-[10px] font-medium">{ip.productName}</td>
                                              <td className="px-2.5 py-1.5 text-[10px] text-muted">{ip.brand}</td>
                                              <td className="px-2.5 py-1.5 text-right">
                                                <div className="flex items-center gap-1.5 justify-end">
                                                  <div className="w-10 h-[3px] bg-surface rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full bg-foreground" style={{ width: `${ip.influence}%` }} />
                                                  </div>
                                                  <span className="text-[9px] font-bold">{ip.influence}</span>
                                                </div>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}

                                {/* Category strengths */}
                                {match.categoryStrengths.length > 0 && (
                                  <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">Category Strengths</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {match.categoryStrengths.map((cs) => (
                                        <div key={cs.category} className="rounded-lg border border-border px-2.5 py-1.5 text-center">
                                          <p className="text-[13px] font-bold">{cs.count}</p>
                                          <p className="text-[8px] text-muted">{cs.category}</p>
                                          <p className="text-[7px] text-muted">{cs.pct}%</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Influence metrics row */}
                                {match.influence && (
                                  <div className="mt-4 pt-3 border-t border-border">
                                    <div className="grid grid-cols-5 gap-2 text-center">
                                      {[
                                        { v: match.influence.metrics.productSaves, l: "Saves" },
                                        { v: match.influence.metrics.specDownloads, l: "Spec DL" },
                                        { v: match.influence.metrics.enquiriesGenerated, l: "Enquiries" },
                                        { v: match.influence.metrics.boardsCreated, l: "Boards" },
                                        { v: match.influence.tier, l: "Tier" },
                                      ].map((m) => (
                                        <div key={m.l}>
                                          <p className="text-[13px] font-bold">{m.v}</p>
                                          <p className="text-[8px] text-muted">{m.l}</p>
                                        </div>
                                      ))}
                                    </div>
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

// ─── Section 3: Project → Product ─────────────────────────────────────────────

type ProjSortKey = "score" | "roomRelevance" | "styleFit" | "materialFit" | "trendAlign" | "architectPrecedent" | "categoryFit" | "price";
type ProjFilter = "all" | "premium" | "practical" | "architect-preferred" | "trending";

function ProjectToProductSection({ selectedProject, setSelectedProject, match, savedProducts, toggleSaveProduct }: {
  selectedProject: number;
  setSelectedProject: (i: number) => void;
  match: ProjectProductMatch;
  savedProducts: Set<string>;
  toggleSaveProduct: (id: string) => void;
}) {
  const [sortKey, setSortKey] = useState<ProjSortKey>("score");
  const [sortAsc, setSortAsc] = useState(false);
  const [filter, setFilter] = useState<ProjFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addedToBoard, setAddedToBoard] = useState<Set<string>>(new Set());
  const [addedToSpec, setAddedToSpec] = useState<Set<string>>(new Set());

  const handleSort = (key: ProjSortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const sorted = useMemo(() => {
    let filtered = match.recommended;
    if (filter === "premium") filtered = filtered.filter((r) => r.tier === "premium");
    else if (filter === "practical") filtered = filtered.filter((r) => r.tier === "practical");
    else if (filter === "architect-preferred") filtered = filtered.filter((r) => r.isArchitectPreferred);
    else if (filter === "trending") filtered = filtered.filter((r) => r.isTrending);

    return [...filtered].sort((a, b) => {
      const av = sortKey === "price" ? parsePrice(a.product.price) : a[sortKey];
      const bv = sortKey === "price" ? parsePrice(b.product.price) : b[sortKey];
      return sortAsc ? av - bv : bv - av;
    });
  }, [match.recommended, sortKey, sortAsc, filter]);

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

  const ProjSortHeader = ({ label, field, className = "" }: { label: string; field: ProjSortKey; className?: string }) => (
    <button onClick={() => handleSort(field)} className={`flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-[0.06em] text-muted hover:text-foreground transition-colors ${className}`}>
      {label}
      <ArrowUpDown size={8} className={sortKey === field ? "text-foreground" : "text-muted/40"} />
    </button>
  );

  const coveragePct = match.allCategories.length > 0 ? Math.round((match.usedCategories.size / match.allCategories.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Project selector */}
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

      {/* 1. Project Context KPI Ribbon */}
      <div className="rounded-2xl border border-border bg-white p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground">
            <Layers size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold">{match.project.title}</h2>
            <p className="text-[11px] text-muted">{match.project.architect} · {match.project.location} · {match.project.year}</p>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-3">
          {[
            { label: "Products", value: `${match.projectProducts.length}`, sub: "in project", color: "text-foreground" },
            { label: "Categories", value: `${match.usedCategories.size}/${match.allCategories.length}`, sub: `${coveragePct}% coverage`, color: coveragePct >= 70 ? "text-emerald" : "text-amber" },
            { label: "Gaps", value: `${match.missingCategories.length}`, sub: "missing", color: match.missingCategories.length > 0 ? "text-rose" : "text-emerald" },
            { label: "Spec %", value: `${match.specCompleteness}%`, sub: "completeness", color: match.specCompleteness >= 70 ? "text-emerald" : match.specCompleteness >= 40 ? "text-amber" : "text-rose" },
            { label: "Style", value: `${match.detectedStyles.length}`, sub: match.detectedStyles.slice(0, 2).join(", ") || "—", color: "text-foreground" },
            { label: "Rooms", value: `${match.detectedRooms.length}`, sub: match.detectedRooms.slice(0, 2).join(", ") || "from spec", color: "text-foreground" },
            { label: "Cost Est.", value: match.totalCostEstimate > 0 ? `$${match.totalCostEstimate.toLocaleString()}` : "—", sub: "current total", color: "text-foreground" },
          ].map((kpi) => (
            <div key={kpi.label} className="text-center rounded-xl bg-surface/50 p-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">{kpi.label}</p>
              <p className={`mt-1 text-[18px] font-bold tracking-tight ${kpi.color}`}>{kpi.value}</p>
              <p className="text-[9px] text-muted truncate">{kpi.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Category Gap Detection */}
      <div className="rounded-2xl border border-border bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[14px] font-semibold">Category Coverage & Gap Analysis</h2>
            <p className="text-[11px] text-muted mt-0.5">Identifying missing or under-specified product categories</p>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-emerald" /> Covered</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-amber" /> Partial</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-rose" /> Missing</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {match.categoryGaps.map((gap) => {
            const severityConfig = {
              critical: { border: "border-rose/30", bg: "bg-rose-light/30", badgeBg: "bg-rose-light", badgeText: "text-rose", barColor: "bg-rose" },
              moderate: { border: "border-amber/30", bg: "bg-amber-light/20", badgeBg: "bg-amber-light", badgeText: "text-amber", barColor: "bg-amber" },
              low: { border: "border-emerald/20", bg: "bg-emerald-light/20", badgeBg: "bg-emerald-light", badgeText: "text-emerald", barColor: "bg-emerald" },
            };
            const sc = severityConfig[gap.severity];
            return (
              <div key={gap.category} className={`rounded-xl border ${sc.border} ${sc.bg} p-3`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold">{gap.category}</span>
                    <span className={`rounded-full ${sc.badgeBg} ${sc.badgeText} px-1.5 py-0.5 text-[8px] font-bold uppercase`}>
                      {gap.severity === "critical" ? "Missing" : gap.severity === "moderate" ? "Partial" : "Covered"}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold">{gap.coverage}%</span>
                </div>
                <div className="h-[5px] bg-white/60 rounded-full overflow-hidden mb-2">
                  <div className={`h-full rounded-full ${sc.barColor}`} style={{ width: `${gap.coverage}%` }} />
                </div>
                <div className="flex items-center justify-between text-[9px] text-muted">
                  <span>{gap.available} available in catalog</span>
                  {gap.severity !== "low" && gap.topRecommendation && (
                    <span className="font-medium text-foreground">Rec: {gap.topRecommendation.name}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Filter controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-xl border border-border bg-white p-1">
          {([
            ["all", "All", null],
            ["premium", "Premium", Crown],
            ["practical", "Practical", Wallet],
            ["architect-preferred", "Architect Picks", Star],
            ["trending", "Trending", TrendingUp],
          ] as const).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${filter === key ? "bg-foreground text-white" : "text-muted hover:bg-surface"}`}
            >
              {Icon && <Icon size={11} />}
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted">
          <span>{sorted.length} of {match.recommended.length} products</span>
          <span>·</span>
          <span>Sorted by <strong className="text-foreground">{sortKey === "score" ? "Overall" : sortKey.replace(/([A-Z])/g, " $1").trim()}</strong> {sortAsc ? "↑" : "↓"}</span>
        </div>
      </div>

      {/* 4. Sortable recommendation table */}
      <div className="rounded-2xl border border-border bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface/30">
                <th className="p-3 text-left"><span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">#</span></th>
                <th className="p-3 text-left"><span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">Product</span></th>
                <th className="p-3"><ProjSortHeader label="Match" field="score" /></th>
                <th className="p-3"><ProjSortHeader label="Room" field="roomRelevance" /></th>
                <th className="p-3"><ProjSortHeader label="Style" field="styleFit" /></th>
                <th className="p-3"><ProjSortHeader label="Material" field="materialFit" /></th>
                <th className="p-3"><ProjSortHeader label="Category" field="categoryFit" /></th>
                <th className="p-3"><ProjSortHeader label="Trend" field="trendAlign" /></th>
                <th className="p-3"><ProjSortHeader label="Architect" field="architectPrecedent" /></th>
                <th className="p-3 text-center"><span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">Activity</span></th>
                <th className="p-3"><ProjSortHeader label="Price" field="price" className="justify-end" /></th>
                <th className="p-3 text-center"><span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((rec, i) => {
                const isExpanded = expandedId === rec.product.id;
                const subProducts = rec.substituteIds.map((sid) => products.find((p) => p.id === sid)).filter(Boolean) as Product[];
                const subRecs = rec.substituteIds.map((sid) => match.recommended.find((r) => r.product.id === sid)).filter(Boolean) as ProjectProductRec[];

                return (
                  <React.Fragment key={rec.product.id}>
                    <tr
                      className={`border-b border-border transition-colors cursor-pointer ${i < 3 ? "bg-emerald-light/20" : "hover:bg-surface/30"} ${isExpanded ? "bg-surface/40" : ""}`}
                      onClick={() => setExpandedId(isExpanded ? null : rec.product.id)}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-bold text-muted w-4 text-center">{i + 1}</span>
                          {rec.tier === "premium" && <Crown size={9} className="text-amber" />}
                          {rec.isArchitectPreferred && <Star size={9} className="text-blue-500" />}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="min-w-[170px]">
                          <div className="flex items-center gap-1.5">
                            <p className="text-[12px] font-semibold truncate">{rec.product.name}</p>
                            <TrendBadge trend={rec.momentumTrend} />
                          </div>
                          <p className="text-[10px] text-muted">{rec.product.brand} · {rec.product.category}</p>
                        </div>
                      </td>
                      <td className="p-3 text-center"><ScoreRing score={rec.score} size={36} strokeWidth={3} /></td>
                      <td className="p-3 text-center"><DimCell score={rec.roomRelevance} /></td>
                      <td className="p-3 text-center"><DimCell score={rec.styleFit} /></td>
                      <td className="p-3 text-center"><DimCell score={rec.materialFit} /></td>
                      <td className="p-3 text-center"><DimCell score={rec.categoryFit} /></td>
                      <td className="p-3 text-center"><DimCell score={rec.trendAlign} /></td>
                      <td className="p-3 text-center"><DimCell score={rec.architectPrecedent} /></td>
                      <td className="p-3 text-center">
                        <Sparkline data={rec.weeklySparkline} width={52} height={18} color={rec.momentumTrend === "surging" ? "#059669" : rec.momentumTrend === "cooling" ? "#d97706" : "#0a0a0a"} />
                      </td>
                      <td className="p-3 text-right"><span className="text-[12px] font-semibold whitespace-nowrap">{rec.product.price}</span></td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 justify-center" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => toggleSaveProduct(rec.product.id)} title="Save"
                            className={`rounded-md p-1.5 transition-colors ${savedProducts.has(rec.product.id) ? "bg-foreground text-white" : "bg-surface text-muted hover:bg-foreground hover:text-white"}`}>
                            <Bookmark size={11} />
                          </button>
                          <button onClick={() => toggleBoard(rec.product.id)} title="Add to Board"
                            className={`rounded-md p-1.5 transition-colors ${addedToBoard.has(rec.product.id) ? "bg-foreground text-white" : "bg-surface text-muted hover:bg-foreground hover:text-white"}`}>
                            <Plus size={11} />
                          </button>
                          <button onClick={() => toggleSpec(rec.product.id)} title="Add to Spec"
                            className={`rounded-md p-1.5 transition-colors ${addedToSpec.has(rec.product.id) ? "bg-foreground text-white" : "bg-surface text-muted hover:bg-foreground hover:text-white"}`}>
                            <FileText size={11} />
                          </button>
                          <button title="Compare" className="rounded-md p-1.5 bg-surface text-muted hover:bg-foreground hover:text-white transition-colors">
                            <Repeat2 size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* 5. Expanded detail panel */}
                    {isExpanded && (
                      <tr className="border-b border-border bg-surface/20">
                        <td colSpan={12} className="p-0">
                          <div className="px-5 py-5">
                            <div className="grid grid-cols-12 gap-6">

                              {/* Col 1: Radar chart */}
                              <div className="col-span-3 flex flex-col items-center">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-3">Compatibility Radar</p>
                                <RadarChart scores={[
                                  { label: "Room", value: rec.roomRelevance },
                                  { label: "Style", value: rec.styleFit },
                                  { label: "Material", value: rec.materialFit },
                                  { label: "Category", value: rec.categoryFit },
                                  { label: "Trend", value: rec.trendAlign },
                                  { label: "Architect", value: rec.architectPrecedent },
                                ]} size={140} />

                                {/* 7. Project Impact Panel */}
                                <div className="mt-4 pt-3 border-t border-border w-full">
                                  <p className="text-[9px] font-semibold uppercase tracking-wider text-muted mb-2 text-center">Impact If Added</p>
                                  <div className="space-y-2">
                                    {([
                                      ["Spec %", match.specCompleteness, rec.specCompletenessAfter],
                                      ["Coverage", coveragePct, rec.coverageAfter],
                                      ["Pattern", Math.round(coveragePct * 0.3 + match.specCompleteness * 0.3 + 40 * 0.4), rec.patternAlignAfter],
                                    ] as const).map(([label, before, after]) => {
                                      const diff = after - before;
                                      return (
                                        <div key={label} className="flex items-center justify-between text-[9px]">
                                          <span className="text-muted w-14">{label}</span>
                                          <span className="text-muted w-6 text-right">{before}%</span>
                                          <span className="text-muted">→</span>
                                          <span className="font-bold w-6">{after}%</span>
                                          <span className={`font-bold w-6 text-right ${diff > 0 ? "text-emerald" : "text-muted"}`}>
                                            {diff > 0 ? `+${diff}` : diff}
                                          </span>
                                        </div>
                                      );
                                    })}
                                    <div className="flex items-center justify-between text-[9px] pt-1 border-t border-border">
                                      <span className="text-muted w-14">Cost</span>
                                      <span className="font-bold text-foreground">+${rec.costImpact.toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Col 2: Score breakdown + reasons */}
                              <div className="col-span-4">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-3">Score Breakdown</p>
                                <div className="space-y-2.5">
                                  <DimensionBar label="Room" score={rec.roomRelevance} />
                                  <DimensionBar label="Style" score={rec.styleFit} />
                                  <DimensionBar label="Material" score={rec.materialFit} />
                                  <DimensionBar label="Category" score={rec.categoryFit} />
                                  <DimensionBar label="Trend" score={rec.trendAlign} />
                                  <DimensionBar label="Architect" score={rec.architectPrecedent} />
                                </div>

                                <div className="mt-4 pt-3 border-t border-border">
                                  <p className="text-[10px] font-semibold text-muted mb-1.5">Recommendation Reasons</p>
                                  <div className="space-y-1">
                                    {rec.reasons.map((r, j) => (
                                      <div key={j} className="flex items-center gap-1.5 text-[10px]">
                                        <ChevronRight size={9} className="text-muted shrink-0" />
                                        <span className="text-muted">{r}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-1">
                                  {rec.isArchitectPreferred && <FitBadge label="Architect Preferred" active />}
                                  {rec.isTrending && <FitBadge label="Trending" active />}
                                  <FitBadge label="Spec Sheet" active={rec.product.specSheet} />
                                  <FitBadge label={rec.tier === "premium" ? "Premium" : "Practical"} active />
                                </div>
                              </div>

                              {/* Col 3: Substitute comparison */}
                              <div className="col-span-5">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-3">
                                  <Repeat2 size={10} className="inline mr-1" />
                                  Substitute Comparison
                                </p>
                                {subProducts.length === 0 ? (
                                  <p className="text-[10px] text-muted italic">No substitutes in this category</p>
                                ) : (
                                  <div className="rounded-xl border border-border overflow-hidden">
                                    <table className="w-full">
                                      <thead>
                                        <tr className="bg-surface/50">
                                          <th className="px-2.5 py-1.5 text-[8px] font-semibold uppercase tracking-wider text-muted text-left">Product</th>
                                          <th className="px-2.5 py-1.5 text-[8px] font-semibold uppercase tracking-wider text-muted text-center">Match</th>
                                          <th className="px-2.5 py-1.5 text-[8px] font-semibold uppercase tracking-wider text-muted text-center">Room</th>
                                          <th className="px-2.5 py-1.5 text-[8px] font-semibold uppercase tracking-wider text-muted text-center">Style</th>
                                          <th className="px-2.5 py-1.5 text-[8px] font-semibold uppercase tracking-wider text-muted text-right">Price</th>
                                          <th className="px-2.5 py-1.5 text-[8px] font-semibold uppercase tracking-wider text-muted text-center">Tier</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {/* Current product */}
                                        <tr className="border-t border-border bg-foreground/[0.03]">
                                          <td className="px-2.5 py-1.5">
                                            <p className="text-[10px] font-semibold">{rec.product.name}</p>
                                            <p className="text-[8px] text-muted">{rec.product.brand} (current)</p>
                                          </td>
                                          <td className="px-2.5 py-1.5 text-center"><span className="text-[10px] font-bold">{rec.score}%</span></td>
                                          <td className="px-2.5 py-1.5 text-center"><DimCell score={rec.roomRelevance} /></td>
                                          <td className="px-2.5 py-1.5 text-center"><DimCell score={rec.styleFit} /></td>
                                          <td className="px-2.5 py-1.5 text-right"><span className="text-[10px] font-semibold">{rec.product.price}</span></td>
                                          <td className="px-2.5 py-1.5 text-center">
                                            <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${rec.tier === "premium" ? "bg-amber-light text-amber" : "bg-emerald-light text-emerald"}`}>
                                              {rec.tier === "premium" ? "Premium" : "Practical"}
                                            </span>
                                          </td>
                                        </tr>
                                        {subProducts.map((sp, si) => {
                                          const sr = subRecs[si];
                                          return (
                                            <tr key={sp.id} className="border-t border-border hover:bg-surface/30">
                                              <td className="px-2.5 py-1.5">
                                                <p className="text-[10px] font-medium">{sp.name}</p>
                                                <p className="text-[8px] text-muted">{sp.brand}</p>
                                              </td>
                                              <td className="px-2.5 py-1.5 text-center"><span className="text-[10px] font-bold">{sr?.score ?? "—"}%</span></td>
                                              <td className="px-2.5 py-1.5 text-center"><DimCell score={sr?.roomRelevance ?? 0} /></td>
                                              <td className="px-2.5 py-1.5 text-center"><DimCell score={sr?.styleFit ?? 0} /></td>
                                              <td className="px-2.5 py-1.5 text-right"><span className="text-[10px] font-medium">{sp.price}</span></td>
                                              <td className="px-2.5 py-1.5 text-center">
                                                <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${(sr?.tier ?? "practical") === "premium" ? "bg-amber-light text-amber" : "bg-emerald-light text-emerald"}`}>
                                                  {(sr?.tier ?? "practical") === "premium" ? "Premium" : "Practical"}
                                                </span>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                )}

                                {/* Similar products in category */}
                                <div className="mt-4">
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">More in {rec.product.category}</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {products
                                      .filter((p) => p.category === rec.product.category && p.id !== rec.product.id)
                                      .slice(0, 4)
                                      .map((p) => (
                                        <div key={p.id} className="rounded-lg border border-border px-2.5 py-1.5">
                                          <p className="text-[9px] font-semibold">{p.name}</p>
                                          <p className="text-[8px] text-muted">{p.brand} · {p.price}</p>
                                        </div>
                                      ))}
                                  </div>
                                </div>
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

// ─── Section 4: Room Matching ─────────────────────────────────────────────────

const ROOM_ICONS: Record<string, React.ElementType> = {
  Kitchen: UtensilsCrossed,
  Bathroom: Bath,
  "Living Room": Sofa,
  "Great Room": Home,
  "Master Bedroom": Bed,
  Bedroom: Bed,
  Studio: Palette,
  "Outdoor Deck": Sun,
  Outdoor: Sun,
};

function RoomMatchingSection({ roomMatches }: { roomMatches: RoomMatch[] }) {
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);
  const [savedRoomSets, setSavedRoomSets] = useState<Set<string>>(new Set());
  const [addedToBoard, setAddedToBoard] = useState<Set<string>>(new Set());
  const [addedToSpec, setAddedToSpec] = useState<Set<string>>(new Set());

  const toggleRoomSaved = (name: string) => {
    const next = new Set(savedRoomSets);
    if (next.has(name)) next.delete(name); else next.add(name);
    setSavedRoomSets(next);
  };

  const addAllToBoard = (room: RoomMatch) => {
    const next = new Set(addedToBoard);
    room.productRecs.forEach((r) => next.add(r.product.id));
    setAddedToBoard(next);
  };

  const addAllToSpec = (room: RoomMatch) => {
    const next = new Set(addedToSpec);
    room.productRecs.forEach((r) => next.add(r.product.id));
    setAddedToSpec(next);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-border bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground">
            <Grid3x3 size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold">Room-Level Design Assistant</h2>
            <p className="text-[11px] text-muted mt-0.5">Completeness analysis, gap detection, and product recommendations per room</p>
          </div>
        </div>
      </div>

      {/* 1. Room Summary Grid */}
      <div className="grid grid-cols-3 gap-4">
        {roomMatches.map((room) => {
          const RIcon = ROOM_ICONS[room.roomName] || Home;
          const isExpanded = expandedRoom === room.roomName;
          const completenessColor = room.completeness >= 70 ? "text-emerald" : room.completeness >= 40 ? "text-amber" : "text-rose";
          const coverageColor = room.categoryCoverage >= 70 ? "text-emerald" : room.categoryCoverage >= 40 ? "text-amber" : "text-rose";

          return (
            <button
              key={room.roomName}
              onClick={() => setExpandedRoom(isExpanded ? null : room.roomName)}
              className={`rounded-2xl border text-left transition-all ${isExpanded ? "border-foreground ring-2 ring-foreground/10 bg-surface/30" : "border-border bg-white hover:border-foreground/30"}`}
            >
              <div className="p-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isExpanded ? "bg-foreground" : "bg-surface"}`}>
                    <RIcon size={14} className={isExpanded ? "text-white" : "text-muted"} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold">{room.roomName}</p>
                    <p className="text-[9px] text-muted">{room.topProducts.length} products · {room.topCategories.length} categories</p>
                  </div>
                  <ChevronDown size={12} className={`ml-auto text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </div>

                {/* KPI row */}
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { label: "Complete", value: `${room.completeness}%`, color: completenessColor },
                    { label: "Coverage", value: `${room.categoryCoverage}%`, color: coverageColor },
                    { label: "Missing", value: `${room.missingCount}`, color: room.missingCount > 0 ? "text-rose" : "text-emerald" },
                    { label: "Budget", value: room.estimatedBudget > 0 ? `$${(room.estimatedBudget / 1000).toFixed(1)}k` : "—", color: "text-foreground" },
                    { label: "Pattern", value: `${room.patternAlignment}%`, color: room.patternAlignment >= 60 ? "text-emerald" : "text-amber" },
                  ].map((kpi) => (
                    <div key={kpi.label} className="text-center rounded-lg bg-surface/50 py-1.5 px-1">
                      <p className="text-[7px] font-semibold uppercase tracking-[0.06em] text-muted">{kpi.label}</p>
                      <p className={`text-[12px] font-bold ${kpi.color}`}>{kpi.value}</p>
                    </div>
                  ))}
                </div>

                {/* Quick gap indicators */}
                {room.criticalMissing.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {room.criticalMissing.map((c) => (
                      <span key={c} className="rounded-full bg-rose-light px-1.5 py-0.5 text-[7px] font-bold text-rose">{c} missing</span>
                    ))}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 6. Expanded Room Detail */}
      {expandedRoom && (() => {
        const room = roomMatches.find((r) => r.roomName === expandedRoom);
        if (!room) return null;
        const RIcon = ROOM_ICONS[room.roomName] || Home;

        return (
          <div className="rounded-2xl border border-border bg-white overflow-hidden">
            {/* Room header with actions */}
            <div className="p-5 border-b border-border bg-surface/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground">
                    <RIcon size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold">{room.roomName}</h3>
                    <p className="text-[11px] text-muted">{room.topProducts.length} products · {room.topCategories.length} categories · Spec readiness {room.specReadiness}%</p>
                  </div>
                </div>
                {/* 5. Room Actions */}
                <div className="flex items-center gap-2">
                  <button onClick={() => addAllToBoard(room)} className="flex items-center gap-1.5 rounded-lg bg-surface px-3 py-1.5 text-[10px] font-medium text-muted hover:bg-foreground hover:text-white transition-colors">
                    <Plus size={10} /> Add All to Board
                  </button>
                  <button onClick={() => addAllToSpec(room)} className="flex items-center gap-1.5 rounded-lg bg-surface px-3 py-1.5 text-[10px] font-medium text-muted hover:bg-foreground hover:text-white transition-colors">
                    <FileText size={10} /> Add All to Spec
                  </button>
                  <button onClick={() => toggleRoomSaved(room.roomName)} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors ${savedRoomSets.has(room.roomName) ? "bg-foreground text-white" : "bg-surface text-muted hover:bg-foreground hover:text-white"}`}>
                    <Bookmark size={10} /> {savedRoomSets.has(room.roomName) ? "Saved" : "Save Room Set"}
                  </button>
                  <button className="flex items-center gap-1.5 rounded-lg bg-surface px-3 py-1.5 text-[10px] font-medium text-muted hover:bg-foreground hover:text-white transition-colors">
                    <Repeat2 size={10} /> Compare Alternatives
                  </button>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-12 gap-6">

                {/* Col 1 (4 cols): KPI + Style/Material reasoning + Cost */}
                <div className="col-span-4 space-y-5">
                  {/* KPIs */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">Room Intelligence</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Completeness", value: room.completeness, suffix: "%" },
                        { label: "Coverage", value: room.categoryCoverage, suffix: "%" },
                        { label: "Pattern Align", value: room.patternAlignment, suffix: "%" },
                        { label: "Spec Ready", value: room.specReadiness, suffix: "%" },
                      ].map((kpi) => (
                        <div key={kpi.label} className="rounded-xl bg-surface/50 p-3 text-center">
                          <p className="text-[8px] font-semibold uppercase tracking-wider text-muted">{kpi.label}</p>
                          <div className="mt-1">
                            <ScoreRing score={kpi.value} size={42} strokeWidth={3} label={`${kpi.value}${kpi.suffix}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Style & material reasoning */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">Style & Material Signals</p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-[9px] font-medium text-muted mb-1">Detected Styles</p>
                        <div className="flex flex-wrap gap-1">
                          {room.detectedStyles.length > 0 ? room.detectedStyles.map((s) => (
                            <span key={s} className="rounded-full bg-blue-50 px-2 py-0.5 text-[8px] font-semibold text-blue-600">{s}</span>
                          )) : <span className="text-[9px] text-muted italic">No styles detected</span>}
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] font-medium text-muted mb-1">Material Categories</p>
                        <div className="flex flex-wrap gap-1">
                          {room.detectedMaterials.map((m) => (
                            <span key={m} className="rounded-full bg-surface px-2 py-0.5 text-[8px] font-semibold text-foreground">{m}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cost estimate */}
                  <div className="rounded-xl bg-surface/50 p-3">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-muted mb-1">Room Budget Estimate</p>
                    <p className="text-[20px] font-bold tracking-tight">${room.estimatedBudget.toLocaleString()}</p>
                    <p className="text-[9px] text-muted">{room.topProducts.length} products specified</p>
                  </div>
                </div>

                {/* Col 2 (4 cols): Missing item detection + Compatibility matrix */}
                <div className="col-span-4 space-y-5">
                  {/* 4. Missing Item Detection */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">Gap Detection</p>
                    <div className="space-y-2">
                      {/* Critical missing */}
                      {room.criticalMissing.length > 0 && (
                        <div className="rounded-xl border border-rose/20 bg-rose-light/20 p-3">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <XCircle size={10} className="text-rose" />
                            <p className="text-[9px] font-bold uppercase tracking-wider text-rose">Critical Missing</p>
                          </div>
                          <div className="space-y-1">
                            {room.criticalMissing.map((c) => {
                              const gap = room.categoryGaps.find((g) => g.category === c);
                              return (
                                <div key={c} className="flex items-center justify-between">
                                  <span className="text-[10px] font-medium">{c}</span>
                                  {gap?.topProduct && (
                                    <span className="text-[8px] text-rose font-medium">Rec: {gap.topProduct.name}</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Recommended next */}
                      {room.recommendedNext.length > 0 && (
                        <div className="rounded-xl border border-amber/20 bg-amber-light/20 p-3">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <AlertTriangle size={10} className="text-amber" />
                            <p className="text-[9px] font-bold uppercase tracking-wider text-amber">Recommended Next</p>
                          </div>
                          <div className="space-y-1">
                            {room.recommendedNext.map((c) => {
                              const gap = room.categoryGaps.find((g) => g.category === c);
                              return (
                                <div key={c} className="flex items-center justify-between">
                                  <span className="text-[10px] font-medium">{c}</span>
                                  {gap?.topProduct && (
                                    <span className="text-[8px] text-amber font-medium">Rec: {gap.topProduct.name}</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Optional upgrades */}
                      {room.optionalUpgrades.length > 0 && (
                        <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-3">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <ArrowUpRight size={10} className="text-blue-500" />
                            <p className="text-[9px] font-bold uppercase tracking-wider text-blue-500">Optional Upgrades</p>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {room.optionalUpgrades.map((c) => (
                              <span key={c} className="rounded-full bg-blue-100 px-2 py-0.5 text-[8px] font-semibold text-blue-600">{c}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {room.criticalMissing.length === 0 && room.recommendedNext.length === 0 && (
                        <div className="rounded-xl border border-emerald/20 bg-emerald-light/20 p-3 flex items-center gap-2">
                          <CheckCircle2 size={12} className="text-emerald" />
                          <p className="text-[10px] font-medium text-emerald">All expected categories covered</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3. Compatibility Matrix */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">
                      <Link2 size={10} className="inline mr-1" />
                      Product Compatibility
                    </p>
                    {room.compatPairs.length === 0 ? (
                      <p className="text-[9px] text-muted italic">No compatibility pairs defined</p>
                    ) : (
                      <div className="space-y-2">
                        {room.compatPairs.map((pair, i) => {
                          const color = pair.score >= 70 ? "bg-emerald" : pair.score >= 40 ? "bg-amber" : "bg-rose";
                          const textColor = pair.score >= 70 ? "text-emerald" : pair.score >= 40 ? "text-amber" : "text-rose";
                          return (
                            <div key={i} className="rounded-lg border border-border p-2.5">
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-1.5 text-[10px]">
                                  <span className="font-semibold">{pair.catA}</span>
                                  <ArrowRight size={8} className="text-muted" />
                                  <span className="font-semibold">{pair.catB}</span>
                                </div>
                                <span className={`text-[10px] font-bold ${textColor}`}>{pair.score}%</span>
                              </div>
                              <div className="h-[4px] bg-surface rounded-full overflow-hidden mb-1">
                                <div className={`h-full rounded-full ${color}`} style={{ width: `${pair.score}%` }} />
                              </div>
                              <p className="text-[8px] text-muted">{pair.label}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Col 3 (4 cols): Product recommendation table */}
                <div className="col-span-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">
                    Recommended Products ({room.productRecs.length})
                  </p>
                  {room.productRecs.length === 0 ? (
                    <p className="text-[9px] text-muted italic">No recommendations — room is fully specified</p>
                  ) : (
                    <div className="rounded-xl border border-border overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-surface/40">
                            <th className="px-2 py-1.5 text-[8px] font-semibold uppercase tracking-wider text-muted text-left">Product</th>
                            <th className="px-2 py-1.5 text-[8px] font-semibold uppercase tracking-wider text-muted text-center">Match</th>
                            <th className="px-2 py-1.5 text-[8px] font-semibold uppercase tracking-wider text-muted text-center">Style</th>
                            <th className="px-2 py-1.5 text-[8px] font-semibold uppercase tracking-wider text-muted text-center">Cat</th>
                            <th className="px-2 py-1.5 text-[8px] font-semibold uppercase tracking-wider text-muted text-right">Price</th>
                            <th className="px-2 py-1.5 text-[8px] font-semibold uppercase tracking-wider text-muted text-center">Act</th>
                          </tr>
                        </thead>
                        <tbody>
                          {room.productRecs.map((rec, idx) => (
                            <React.Fragment key={rec.product.id}>
                              <tr className={`border-t border-border transition-colors ${idx < 3 ? "bg-emerald-light/15" : "hover:bg-surface/30"}`}>
                                <td className="px-2 py-2">
                                  <div className="min-w-[100px]">
                                    <div className="flex items-center gap-1">
                                      <p className="text-[10px] font-semibold truncate">{rec.product.name}</p>
                                      {rec.tier === "premium" && <Crown size={8} className="text-amber shrink-0" />}
                                    </div>
                                    <p className="text-[8px] text-muted">{rec.product.brand} · {rec.product.category}</p>
                                    {rec.reasons.length > 0 && (
                                      <p className="text-[7px] text-muted mt-0.5 truncate">{rec.reasons[0]}</p>
                                    )}
                                  </div>
                                </td>
                                <td className="px-2 py-2 text-center">
                                  <ScoreRing score={rec.score} size={28} strokeWidth={2.5} />
                                </td>
                                <td className="px-2 py-2 text-center"><DimCell score={rec.styleFit} /></td>
                                <td className="px-2 py-2 text-center"><DimCell score={rec.categoryFit} /></td>
                                <td className="px-2 py-2 text-right">
                                  <span className="text-[10px] font-semibold whitespace-nowrap">{rec.product.price}</span>
                                </td>
                                <td className="px-2 py-2">
                                  <div className="flex items-center gap-0.5 justify-center">
                                    <button
                                      onClick={() => { const next = new Set(addedToBoard); if (next.has(rec.product.id)) next.delete(rec.product.id); else next.add(rec.product.id); setAddedToBoard(next); }}
                                      title="Add to Board"
                                      className={`rounded p-1 transition-colors ${addedToBoard.has(rec.product.id) ? "bg-foreground text-white" : "bg-surface text-muted hover:bg-foreground hover:text-white"}`}
                                    >
                                      <Plus size={9} />
                                    </button>
                                    <button
                                      onClick={() => { const next = new Set(addedToSpec); if (next.has(rec.product.id)) next.delete(rec.product.id); else next.add(rec.product.id); setAddedToSpec(next); }}
                                      title="Add to Spec"
                                      className={`rounded p-1 transition-colors ${addedToSpec.has(rec.product.id) ? "bg-foreground text-white" : "bg-surface text-muted hover:bg-foreground hover:text-white"}`}
                                    >
                                      <FileText size={9} />
                                    </button>
                                  </div>
                                </td>
                              </tr>

                              {/* Substitutes row */}
                              {rec.substituteIds.length > 0 && (
                                <tr className="border-t border-dashed border-border bg-surface/10">
                                  <td colSpan={6} className="px-3 py-1.5">
                                    <div className="flex items-center gap-1 text-[8px] text-muted">
                                      <Repeat2 size={8} className="shrink-0" />
                                      <span className="font-medium">Alternatives:</span>
                                      {rec.substituteIds.map((sid) => {
                                        const sp = products.find((p) => p.id === sid);
                                        if (!sp) return null;
                                        return (
                                          <span key={sid} className="rounded-full bg-surface px-1.5 py-0.5 text-[7px] font-medium">{sp.name} · {sp.price}</span>
                                        );
                                      })}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Room-specific compatibility radar */}
                  <div className="mt-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">Room Compatibility Profile</p>
                    <div className="flex justify-center">
                      <RadarChart scores={[
                        { label: "Complete", value: room.completeness },
                        { label: "Coverage", value: room.categoryCoverage },
                        { label: "Pattern", value: room.patternAlignment },
                        { label: "Spec", value: room.specReadiness },
                        { label: "Budget", value: clamp(Math.round(room.estimatedBudget > 0 ? 60 : 20), 0, 100) },
                      ]} size={120} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ─── Section 5: Style & Material ──────────────────────────────────────────────

function StyleMaterialSection({ styleMaterial }: { styleMaterial: StyleMaterialIntel }) {
  const [expandedStyle, setExpandedStyle] = useState<string | null>(null);
  const [savedProfiles, setSavedProfiles] = useState<Set<string>>(new Set());
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set());
  const [appliedToBoard, setAppliedToBoard] = useState<Set<string>>(new Set());
  const [appliedToBrief, setAppliedToBrief] = useState<Set<string>>(new Set());
  const [matTier, setMatTier] = useState<"all" | "premium" | "practical">("all");
  const [graphHover, setGraphHover] = useState<string | null>(null);

  const { styles, categories, matrix, materialPairs, styleProfiles, graphNodes, graphEdges } = styleMaterial;
  const maxVal = Math.max(...styles.flatMap((s) => categories.map((c) => matrix[s]?.[c] || 0)), 1);

  const filteredPairs = matTier === "all" ? materialPairs : materialPairs.filter((p) => p.tier === matTier);

  const toggleSaveProfile = (s: string) => { const n = new Set(savedProfiles); if (n.has(s)) n.delete(s); else n.add(s); setSavedProfiles(n); };
  const toggleApplyBoard = (s: string) => { const n = new Set(appliedToBoard); if (n.has(s)) n.delete(s); else n.add(s); setAppliedToBoard(n); };
  const toggleApplyBrief = (s: string) => { const n = new Set(appliedToBrief); if (n.has(s)) n.delete(s); else n.add(s); setAppliedToBrief(n); };

  return (
    <div className="space-y-6">

      {/* 1. Style Profile Matrix — Heatmap */}
      <div className="rounded-2xl border border-border bg-white p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground"><Grid3x3 size={16} className="text-white" /></div>
          <div>
            <h2 className="text-[14px] font-semibold">Style × Material × Product Matrix</h2>
            <p className="text-[11px] text-muted">Weighted relationship scores across styles, materials, products, brands, and architects</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-[10px] font-semibold text-muted text-left sticky left-0 bg-white z-10" />
                {categories.map((c) => (
                  <th key={c} className="p-2 text-[9px] font-semibold text-muted text-center whitespace-nowrap">{c}</th>
                ))}
                <th className="p-2 text-[9px] font-semibold text-muted text-center">Total</th>
                <th className="p-2 text-[9px] font-semibold text-muted text-center">Strongest</th>
              </tr>
            </thead>
            <tbody>
              {styles.map((s) => {
                const rowTotal = categories.reduce((sum, c) => sum + (matrix[s]?.[c] || 0), 0);
                const best = categories.reduce((b, c) => (matrix[s]?.[c] || 0) > (matrix[s]?.[b] || 0) ? c : b, categories[0]);
                const isExpanded = expandedStyle === s;
                return (
                  <tr key={s} className={`cursor-pointer transition-colors ${isExpanded ? "bg-surface/40" : "hover:bg-surface/20"}`} onClick={() => setExpandedStyle(isExpanded ? null : s)}>
                    <td className="p-2 text-[10px] font-semibold text-foreground whitespace-nowrap sticky left-0 bg-white z-10">
                      <div className="flex items-center gap-1.5">
                        <ChevronRight size={10} className={`text-muted transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                        {s}
                      </div>
                    </td>
                    {categories.map((c) => {
                      const val = matrix[s]?.[c] || 0;
                      const intensity = val / maxVal;
                      return (
                        <td key={c} className="p-1 text-center">
                          <div className="mx-auto flex h-8 w-10 items-center justify-center rounded-md text-[10px] font-bold"
                            style={{ backgroundColor: val > 0 ? `rgba(10,10,10,${0.08 + intensity * 0.82})` : "#fafafa", color: intensity > 0.5 ? "#fff" : "#737373" }}>
                            {val || "—"}
                          </div>
                        </td>
                      );
                    })}
                    <td className="p-2 text-center"><span className="text-[11px] font-bold">{rowTotal}</span></td>
                    <td className="p-2 text-center"><span className="rounded-full bg-foreground/10 px-2 py-0.5 text-[9px] font-semibold">{best}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[10px] text-muted text-center">Click a style row to expand detail view. Darker cells = higher product usage. {projects.length} projects, {products.length} products.</p>
      </div>

      {/* 7. Expandable Style Detail */}
      {expandedStyle && (() => {
        const profile = styleProfiles.find((p) => p.style === expandedStyle);
        if (!profile) return null;

        return (
          <div className="rounded-2xl border border-foreground/20 ring-2 ring-foreground/5 bg-white overflow-hidden">
            {/* Style header + actions */}
            <div className="p-5 border-b border-border bg-surface/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground">
                    <Palette size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold">{profile.style}</h3>
                    <p className="text-[11px] text-muted">{profile.totalUsage} products · {profile.topArchitects.length} architects · {profile.topBrands.length} brands</p>
                  </div>
                </div>
                {/* 6. Action Layer */}
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleSaveProfile(profile.style)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors ${savedProfiles.has(profile.style) ? "bg-foreground text-white" : "bg-surface text-muted hover:bg-foreground hover:text-white"}`}>
                    <Bookmark size={10} /> {savedProfiles.has(profile.style) ? "Saved" : "Save Profile"}
                  </button>
                  <button onClick={() => toggleApplyBoard(profile.style)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors ${appliedToBoard.has(profile.style) ? "bg-foreground text-white" : "bg-surface text-muted hover:bg-foreground hover:text-white"}`}>
                    <Plus size={10} /> {appliedToBoard.has(profile.style) ? "Applied to Board" : "Apply to Board"}
                  </button>
                  <button onClick={() => toggleApplyBrief(profile.style)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors ${appliedToBrief.has(profile.style) ? "bg-foreground text-white" : "bg-surface text-muted hover:bg-foreground hover:text-white"}`}>
                    <FileText size={10} /> {appliedToBrief.has(profile.style) ? "Applied to Brief" : "Apply to Brief"}
                  </button>
                  <button onClick={() => { const next = new Set(shortlisted); profile.topProducts.forEach((p) => next.add(p.product.id)); setShortlisted(next); }}
                    className="flex items-center gap-1.5 rounded-lg bg-surface px-3 py-1.5 text-[10px] font-medium text-muted hover:bg-foreground hover:text-white transition-colors">
                    <Star size={10} /> Shortlist Products
                  </button>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-12 gap-6">

                {/* Col 1: Top materials + strongest combos + radar */}
                <div className="col-span-3 space-y-5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">Top Material Categories</p>
                    <div className="space-y-2">
                      {profile.topCategories.slice(0, 5).map((tc) => (
                        <div key={tc.category} className="flex items-center gap-2">
                          <span className="w-16 text-[10px] font-medium truncate">{tc.category}</span>
                          <MatchBar score={profile.topCategories[0]?.count ? (tc.count / profile.topCategories[0].count) * 100 : 0} height={5} />
                          <span className="text-[9px] font-bold text-muted w-4">{tc.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">Strongest Combinations</p>
                    <div className="space-y-1.5">
                      {profile.strongestCombinations.map((combo) => (
                        <div key={combo.partner} className="flex items-center justify-between rounded-lg bg-surface/50 px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            <Link2 size={9} className="text-muted" />
                            <span className="text-[10px] font-medium">{profile.style} + {combo.partner}</span>
                          </div>
                          <span className="text-[10px] font-bold">{combo.strength}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <RadarChart scores={[
                      { label: "Products", value: clamp(profile.totalUsage * 15, 0, 100) },
                      { label: "Architects", value: clamp(profile.topArchitects.length * 25, 0, 100) },
                      { label: "Brands", value: clamp(profile.topBrands.length * 20, 0, 100) },
                      { label: "Categories", value: clamp(profile.topCategories.length * 20, 0, 100) },
                      { label: "Combos", value: profile.strongestCombinations[0]?.strength || 30 },
                    ]} size={130} />
                  </div>
                </div>

                {/* Col 2: Top architects (3.) + Top brands */}
                <div className="col-span-4 space-y-5">
                  {/* Style-to-Architect Mapping */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">
                      <Users size={10} className="inline mr-1" />
                      Architect Alignment
                    </p>
                    {profile.topArchitects.length === 0 ? (
                      <p className="text-[9px] text-muted italic">No architects linked</p>
                    ) : (
                      <div className="space-y-2">
                        {profile.topArchitects.slice(0, 4).map((a) => (
                          <div key={a.architectId} className="rounded-xl border border-border p-3">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-[11px] font-semibold">{a.architectName}</p>
                              <ScoreRing score={a.alignment} size={30} strokeWidth={2.5} />
                            </div>
                            <div className="grid grid-cols-3 gap-1.5">
                              <div className="text-center rounded-lg bg-surface/50 py-1">
                                <p className="text-[7px] font-semibold uppercase text-muted">Align</p>
                                <p className="text-[10px] font-bold">{a.alignment}%</p>
                              </div>
                              <div className="text-center rounded-lg bg-surface/50 py-1">
                                <p className="text-[7px] font-semibold uppercase text-muted">Material</p>
                                <p className="text-[10px] font-bold">{a.materialOverlap}%</p>
                              </div>
                              <div className="text-center rounded-lg bg-surface/50 py-1">
                                <p className="text-[7px] font-semibold uppercase text-muted">Category</p>
                                <p className="text-[10px] font-bold">{a.categoryStrength}%</p>
                              </div>
                            </div>
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {a.projectNames.slice(0, 2).map((pn) => (
                                <span key={pn} className="rounded-full bg-surface px-1.5 py-0.5 text-[7px] font-medium text-muted">{pn}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Top brands */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">
                      <Box size={10} className="inline mr-1" />
                      Top Brands
                    </p>
                    <div className="space-y-1.5">
                      {profile.topBrands.slice(0, 4).map((b) => (
                        <div key={b.brandId} className="flex items-center justify-between rounded-lg bg-surface/30 px-3 py-2">
                          <div>
                            <p className="text-[10px] font-semibold">{b.brandName}</p>
                            <p className="text-[8px] text-muted">{b.productCount} products</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <MatchBar score={b.score} height={4} />
                            <span className="text-[9px] font-bold w-6">{b.score}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Col 3: Top products (4.) */}
                <div className="col-span-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                      <Sparkles size={10} className="inline mr-1" />
                      Product Fit ({profile.topProducts.length})
                    </p>
                  </div>
                  {profile.topProducts.length === 0 ? (
                    <p className="text-[9px] text-muted italic">No products linked to this style</p>
                  ) : (
                    <div className="rounded-xl border border-border overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-surface/40">
                            <th className="px-2.5 py-1.5 text-[8px] font-semibold uppercase tracking-wider text-muted text-left">Product</th>
                            <th className="px-2.5 py-1.5 text-[8px] font-semibold uppercase tracking-wider text-muted text-center">Fit</th>
                            <th className="px-2.5 py-1.5 text-[8px] font-semibold uppercase tracking-wider text-muted text-center">Trend</th>
                            <th className="px-2.5 py-1.5 text-[8px] font-semibold uppercase tracking-wider text-muted text-center">Projects</th>
                            <th className="px-2.5 py-1.5 text-[8px] font-semibold uppercase tracking-wider text-muted text-center">Architects</th>
                            <th className="px-2.5 py-1.5 text-[8px] font-semibold uppercase tracking-wider text-muted text-right">Price</th>
                            <th className="px-2.5 py-1.5 text-[8px] font-semibold uppercase tracking-wider text-muted text-center" />
                          </tr>
                        </thead>
                        <tbody>
                          {profile.topProducts.slice(0, 8).map((sp, idx) => (
                            <tr key={sp.product.id} className={`border-t border-border ${idx < 3 ? "bg-emerald-light/15" : "hover:bg-surface/20"}`}>
                              <td className="px-2.5 py-2">
                                <p className="text-[10px] font-semibold">{sp.product.name}</p>
                                <p className="text-[8px] text-muted">{sp.product.brand} · {sp.product.category}</p>
                              </td>
                              <td className="px-2.5 py-2 text-center"><ScoreRing score={sp.fitScore} size={28} strokeWidth={2.5} /></td>
                              <td className="px-2.5 py-2 text-center"><DimCell score={sp.trendAlign} /></td>
                              <td className="px-2.5 py-2 text-center"><span className="text-[10px] font-bold">{sp.projectUsage}</span></td>
                              <td className="px-2.5 py-2 text-center"><span className="text-[10px] font-bold">{sp.architectAdoption}</span></td>
                              <td className="px-2.5 py-2 text-right"><span className="text-[10px] font-semibold">{sp.product.price}</span></td>
                              <td className="px-2.5 py-2 text-center">
                                <button onClick={() => { const n = new Set(shortlisted); if (n.has(sp.product.id)) n.delete(sp.product.id); else n.add(sp.product.id); setShortlisted(n); }}
                                  className={`rounded p-1 transition-colors ${shortlisted.has(sp.product.id) ? "bg-foreground text-white" : "bg-surface text-muted hover:bg-foreground hover:text-white"}`}>
                                  <Star size={9} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 2. Material Compatibility Engine */}
      <div className="rounded-2xl border border-border bg-white p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground"><Gem size={16} className="text-white" /></div>
            <div>
              <h2 className="text-[14px] font-semibold">Material Compatibility Engine</h2>
              <p className="text-[11px] text-muted">How materials work together — compatibility scores and pairing strength</p>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-border bg-white p-1">
            {(["all", "premium", "practical"] as const).map((t) => (
              <button key={t} onClick={() => setMatTier(t)}
                className={`rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors ${matTier === t ? "bg-foreground text-white" : "text-muted hover:bg-surface"}`}>
                {t === "all" ? "All Sets" : t === "premium" ? "Premium" : "Practical"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filteredPairs.map((pair, i) => {
            const color = pair.compatibility >= 80 ? "border-emerald/30 bg-emerald-light/15" : pair.compatibility >= 60 ? "border-border" : "border-amber/30 bg-amber-light/10";
            const barColor = pair.compatibility >= 80 ? "bg-emerald" : pair.compatibility >= 60 ? "bg-foreground" : "bg-amber";
            return (
              <div key={i} className={`rounded-xl border ${color} p-3`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[11px] font-semibold">
                      <span>{pair.matA}</span>
                      <Link2 size={10} className="text-muted" />
                      <span>{pair.matB}</span>
                    </div>
                    <span className={`rounded-full px-1.5 py-0.5 text-[7px] font-bold uppercase ${pair.tier === "premium" ? "bg-amber-light text-amber" : "bg-emerald-light text-emerald"}`}>
                      {pair.tier}
                    </span>
                  </div>
                  <span className="text-[12px] font-bold">{pair.compatibility}%</span>
                </div>
                <div className="h-[4px] bg-surface rounded-full overflow-hidden mb-1.5">
                  <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pair.compatibility}%` }} />
                </div>
                <p className="text-[9px] text-muted">{pair.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Relationship Graph */}
      <div className="rounded-2xl border border-border bg-white p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground"><Hexagon size={16} className="text-white" /></div>
          <div>
            <h2 className="text-[14px] font-semibold">Style Intelligence Network</h2>
            <p className="text-[11px] text-muted">Visual map connecting styles, materials, architects, brands, and products</p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-[9px]">
            <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-foreground" /> Style</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald" /> Material</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500" /> Architect</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-amber" /> Brand</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-rose" /> Product</span>
          </div>
        </div>

        {(() => {
          const w = 900;
          const h = 500;
          const cx = w / 2;
          const cy = h / 2;

          const typeConfig: Record<string, { color: string; radius: number; ring: number }> = {
            style: { color: "#0a0a0a", radius: 18, ring: 0 },
            material: { color: "#059669", radius: 12, ring: 120 },
            architect: { color: "#3b82f6", radius: 10, ring: 170 },
            brand: { color: "#d97706", radius: 10, ring: 200 },
            product: { color: "#e11d48", radius: 7, ring: 230 },
          };

          const nodePositions: Record<string, { x: number; y: number }> = {};
          const typeGroups: Record<string, typeof graphNodes> = { style: [], material: [], architect: [], brand: [], product: [] };
          graphNodes.forEach((n) => { if (typeGroups[n.type]) typeGroups[n.type].push(n); });

          Object.entries(typeGroups).forEach(([type, nodes]) => {
            const cfg = typeConfig[type];
            const ringR = cfg.ring;
            nodes.forEach((n, i) => {
              const angle = (2 * Math.PI * i) / Math.max(nodes.length, 1) - Math.PI / 2;
              nodePositions[n.id] = { x: cx + ringR * Math.cos(angle), y: cy + ringR * Math.sin(angle) };
            });
          });

          const maxEdgeWeight = Math.max(...graphEdges.map((e) => e.weight), 1);

          return (
            <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 500 }}>
              {/* Edges */}
              {graphEdges.map((edge, i) => {
                const from = nodePositions[edge.from];
                const to = nodePositions[edge.to];
                if (!from || !to) return null;
                const norm = edge.weight / maxEdgeWeight;
                const isHovered = graphHover === edge.from || graphHover === edge.to;
                return (
                  <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke="#0a0a0a" strokeWidth={0.5 + norm * 3}
                    opacity={graphHover ? (isHovered ? 0.4 : 0.04) : 0.08 + norm * 0.15} />
                );
              })}
              {/* Nodes */}
              {graphNodes.map((node) => {
                const pos = nodePositions[node.id];
                if (!pos) return null;
                const cfg = typeConfig[node.type];
                const isHovered = graphHover === node.id;
                const isConnected = graphHover ? graphEdges.some((e) => (e.from === graphHover && e.to === node.id) || (e.to === graphHover && e.from === node.id)) : false;
                const opacity = graphHover ? (isHovered || isConnected ? 1 : 0.15) : 1;
                return (
                  <g key={node.id} onMouseEnter={() => setGraphHover(node.id)} onMouseLeave={() => setGraphHover(null)} className="cursor-pointer" opacity={opacity}>
                    <circle cx={pos.x} cy={pos.y} r={cfg.radius + (isHovered ? 3 : 0)} fill={cfg.color} opacity={isHovered ? 1 : 0.85} />
                    <text x={pos.x} y={pos.y + cfg.radius + 12} textAnchor="middle" fill="#737373" className="text-[7px] font-medium" style={{ pointerEvents: "none" }}>
                      {node.label.length > 14 ? node.label.slice(0, 12) + "…" : node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          );
        })()}
      </div>

      {/* Style Profile Cards (3. + 4. summaries) */}
      <div className="rounded-2xl border border-border bg-white p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground"><Palette size={16} className="text-white" /></div>
          <div>
            <h2 className="text-[14px] font-semibold">Style Profiles — Quick View</h2>
            <p className="text-[11px] text-muted">Click a card to expand full intelligence. Click the heatmap row above for the same style.</p>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {styleProfiles.map((profile) => {
            if (profile.totalUsage === 0) return null;
            const isExpanded = expandedStyle === profile.style;
            return (
              <button key={profile.style} onClick={() => setExpandedStyle(isExpanded ? null : profile.style)}
                className={`rounded-xl border text-left transition-all p-4 ${isExpanded ? "border-foreground ring-2 ring-foreground/10" : "border-border hover:border-foreground/30"}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[13px] font-semibold">{profile.style}</h3>
                  <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-muted">{profile.totalUsage} products</span>
                </div>

                {/* Mini KPIs */}
                <div className="grid grid-cols-4 gap-1 mb-3">
                  <div className="text-center rounded-md bg-surface/50 py-1">
                    <p className="text-[7px] font-semibold uppercase text-muted">Cats</p>
                    <p className="text-[10px] font-bold">{profile.topCategories.length}</p>
                  </div>
                  <div className="text-center rounded-md bg-surface/50 py-1">
                    <p className="text-[7px] font-semibold uppercase text-muted">Archs</p>
                    <p className="text-[10px] font-bold">{profile.topArchitects.length}</p>
                  </div>
                  <div className="text-center rounded-md bg-surface/50 py-1">
                    <p className="text-[7px] font-semibold uppercase text-muted">Brands</p>
                    <p className="text-[10px] font-bold">{profile.topBrands.length}</p>
                  </div>
                  <div className="text-center rounded-md bg-surface/50 py-1">
                    <p className="text-[7px] font-semibold uppercase text-muted">Combos</p>
                    <p className="text-[10px] font-bold">{profile.strongestCombinations.length}</p>
                  </div>
                </div>

                {/* Category bars */}
                <div className="space-y-1.5">
                  {profile.topCategories.slice(0, 3).map((e) => (
                    <div key={e.category} className="flex items-center gap-2">
                      <span className="w-14 text-[9px] text-muted truncate">{e.category}</span>
                      <MatchBar score={profile.topCategories[0]?.count ? (e.count / profile.topCategories[0].count) * 100 : 0} height={4} />
                      <span className="text-[8px] font-bold text-muted w-3">{e.count}</span>
                    </div>
                  ))}
                </div>

                {/* Top architect + brand chips */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {profile.topArchitects.slice(0, 1).map((a) => (
                    <span key={a.architectId} className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[7px] font-semibold text-blue-600">{a.architectName}</span>
                  ))}
                  {profile.topBrands.slice(0, 2).map((b) => (
                    <span key={b.brandId} className="rounded-full bg-amber-light px-1.5 py-0.5 text-[7px] font-semibold text-amber">{b.brandName}</span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Section 6: Recommendation Logic ──────────────────────────────────────────

function RecommendationLogicSection({ intel }: { intel: RecommendationIntel }) {
  const { signals, breakdowns, defaultProfile } = intel;
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<"finalScore" | "confidence">("finalScore");
  const [sortAsc, setSortAsc] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false);
  const [appliedToBoard, setAppliedToBoard] = useState(false);
  const [appliedToBrief, setAppliedToBrief] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  // 6. Sensitivity controls
  const [profile, setProfile] = useState<ScoringProfile>({ ...defaultProfile });
  const updateWeight = (key: keyof ScoringProfile, value: number) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  // Recompute scores with adjusted weights
  const adjustedBreakdowns = useMemo(() => {
    const weightMap: Record<string, keyof ScoringProfile> = {
      "Style Fit": "styleFitW", "Material Fit": "materialFitW", "Trend Alignment": "trendW",
      "Architect Precedent": "architectW", "Category Fit": "categoryW",
      "Co-occurrence": "coOccurrenceW", "Brand Affinity": "brandW",
      "Room Relevance": "categoryW",
    };
    return breakdowns.map((bd) => {
      const adjusted = bd.signals.map((s) => {
        const wKey = weightMap[s.name];
        const adjW = wKey ? profile[wKey] : s.weight;
        return { ...s, weight: adjW, contribution: Math.round((s.normalizedScore * adjW) / 100) };
      });
      const adjFinal = clamp(adjusted.reduce((sum, s) => sum + s.contribution, 0), 0, 100);
      return { ...bd, signals: adjusted, finalScore: adjFinal };
    }).sort((a, b) => {
      const av = sortKey === "finalScore" ? a.finalScore : a.confidence;
      const bv = sortKey === "finalScore" ? b.finalScore : b.confidence;
      return sortAsc ? av - bv : bv - av;
    });
  }, [breakdowns, profile, sortKey, sortAsc]);

  const handleSort = (key: "finalScore" | "confidence") => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 2 ? [...prev, id] : prev);
  };

  const isProfileModified = Object.keys(defaultProfile).some((k) => profile[k as keyof ScoringProfile] !== defaultProfile[k as keyof ScoringProfile]);

  return (
    <div className="space-y-6">

      {/* Header + Data Sources */}
      <div className="rounded-2xl border border-border bg-white p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground"><Brain size={18} className="text-white" /></div>
          <div>
            <h2 className="text-[16px] font-semibold">AI Recommendation Logic & Transparency</h2>
            <p className="text-[12px] text-muted">Full scoring breakdown, signal weights, sensitivity controls, and explainability</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Projects", count: projects.length, icon: Layers },
            { label: "Products", count: products.length, icon: Box },
            { label: "Architects", count: architects.length, icon: Users },
            { label: "Specifications", count: specifications.length, icon: Shield },
          ].map((ds) => (
            <div key={ds.label} className="rounded-xl bg-surface/50 p-3 text-center">
              <ds.icon size={16} className="mx-auto text-muted mb-1" />
              <p className="text-[16px] font-bold">{ds.count}</p>
              <p className="text-[9px] text-muted">{ds.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 1. Signal Breakdown + 5. Rule vs Pattern vs Trend */}
      <div className="grid grid-cols-12 gap-4">
        {/* Signal weights */}
        <div className="col-span-7 rounded-2xl border border-border bg-white p-5">
          <h3 className="text-[13px] font-semibold mb-4">
            <Activity size={12} className="inline mr-1.5" />
            Signal Weight Distribution
          </h3>
          <div className="space-y-2.5">
            {signals.map((signal, i) => {
              const colors = ["#0a0a0a", "#1a1a1a", "#333", "#4a4a4a", "#666", "#888", "#aaa", "#ccc"];
              return (
                <div key={signal.name}>
                  <WeightBar weight={signal.weight} label={signal.name} color={colors[i % colors.length]} />
                  <p className="ml-[132px] text-[8px] text-muted mt-0.5">{signal.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Logic type breakdown */}
        <div className="col-span-5 space-y-4">
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="text-[13px] font-semibold mb-3">
              <GitBranch size={12} className="inline mr-1.5" />
              Logic Composition (avg)
            </h3>
            {(() => {
              const avgRules = Math.round(adjustedBreakdowns.reduce((s, b) => s + b.logicType.rules, 0) / Math.max(adjustedBreakdowns.length, 1));
              const avgPattern = Math.round(adjustedBreakdowns.reduce((s, b) => s + b.logicType.pattern, 0) / Math.max(adjustedBreakdowns.length, 1));
              const avgTrend = Math.round(adjustedBreakdowns.reduce((s, b) => s + b.logicType.trend, 0) / Math.max(adjustedBreakdowns.length, 1));
              return (
                <div className="space-y-3">
                  {[
                    { label: "Rules-Based", value: avgRules, desc: "Category fit, room relevance, brand affinity", color: "bg-foreground" },
                    { label: "Pattern Intelligence", value: avgPattern, desc: "Architect precedent, co-occurrence, style fit", color: "bg-blue-500" },
                    { label: "Trend Intelligence", value: avgTrend, desc: "Momentum signals, material fit", color: "bg-emerald" },
                  ].map((lt) => (
                    <div key={lt.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-semibold">{lt.label}</span>
                        <span className="text-[10px] font-bold">{lt.value}%</span>
                      </div>
                      <div className="h-[6px] bg-surface rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${lt.color}`} style={{ width: `${lt.value}%` }} />
                      </div>
                      <p className="text-[8px] text-muted mt-0.5">{lt.desc}</p>
                    </div>
                  ))}
                  {/* Stacked bar */}
                  <div className="mt-2 h-6 rounded-lg overflow-hidden flex">
                    <div className="bg-foreground flex items-center justify-center" style={{ width: `${avgRules}%` }}>
                      <span className="text-[7px] font-bold text-white">Rules</span>
                    </div>
                    <div className="bg-blue-500 flex items-center justify-center" style={{ width: `${avgPattern}%` }}>
                      <span className="text-[7px] font-bold text-white">Pattern</span>
                    </div>
                    <div className="bg-emerald flex items-center justify-center" style={{ width: `${avgTrend}%` }}>
                      <span className="text-[7px] font-bold text-white">Trend</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Transparency note */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <div className="flex items-start gap-2.5">
              <Eye size={14} className="text-muted shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-semibold">Transparency Note</p>
                <p className="text-[9px] text-muted mt-0.5">All match scores are computed from observable platform signals — architect saves, spec downloads, project tagging, and board additions. No black-box ML models. Scores update in real-time.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Sensitivity Controls */}
      <div className="rounded-2xl border border-border bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground"><SlidersHorizontal size={14} className="text-white" /></div>
            <div>
              <h3 className="text-[13px] font-semibold">Sensitivity Controls</h3>
              <p className="text-[10px] text-muted">Adjust signal weights to simulate how recommendations change</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isProfileModified && (
              <button onClick={() => setProfile({ ...defaultProfile })} className="rounded-lg bg-surface px-3 py-1.5 text-[10px] font-medium text-muted hover:bg-foreground hover:text-white transition-colors">
                Reset to Default
              </button>
            )}
            {/* 7. Action Layer */}
            <button onClick={() => setSavedProfile(!savedProfile)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors ${savedProfile ? "bg-foreground text-white" : "bg-surface text-muted hover:bg-foreground hover:text-white"}`}>
              <Bookmark size={10} /> {savedProfile ? "Profile Saved" : "Save Profile"}
            </button>
            <button onClick={() => setAppliedToBoard(!appliedToBoard)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors ${appliedToBoard ? "bg-foreground text-white" : "bg-surface text-muted hover:bg-foreground hover:text-white"}`}>
              <Plus size={10} /> {appliedToBoard ? "Applied" : "Apply to Board"}
            </button>
            <button onClick={() => setAppliedToBrief(!appliedToBrief)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors ${appliedToBrief ? "bg-foreground text-white" : "bg-surface text-muted hover:bg-foreground hover:text-white"}`}>
              <FileText size={10} /> {appliedToBrief ? "Applied" : "Apply to Brief"}
            </button>
            <button onClick={() => { setCompareMode(!compareMode); setCompareIds([]); }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors ${compareMode ? "bg-foreground text-white" : "bg-surface text-muted hover:bg-foreground hover:text-white"}`}>
              <Scale size={10} /> {compareMode ? "Exit Compare" : "Compare Profiles"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {([
            { key: "styleFitW" as const, label: "Style Importance", icon: Palette },
            { key: "materialFitW" as const, label: "Material Importance", icon: Gem },
            { key: "trendW" as const, label: "Trend Importance", icon: TrendingUp },
            { key: "architectW" as const, label: "Architect Precedence", icon: Users },
            { key: "categoryW" as const, label: "Category Fit", icon: Layers },
            { key: "coOccurrenceW" as const, label: "Co-occurrence", icon: Link2 },
            { key: "brandW" as const, label: "Brand Affinity", icon: Box },
            { key: "budgetSensitivity" as const, label: "Budget Sensitivity", icon: Wallet },
          ]).map(({ key, label, icon: Icon }) => {
            const val = profile[key];
            const defaultVal = defaultProfile[key];
            const isModified = val !== defaultVal;
            return (
              <div key={key} className={`rounded-xl border p-3 ${isModified ? "border-foreground/30 bg-surface/30" : "border-border"}`}>
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon size={10} className="text-muted" />
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-muted">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="range" min={0} max={30} value={val} onChange={(e) => updateWeight(key, Number(e.target.value))}
                    className="flex-1 h-1.5 accent-foreground cursor-pointer" />
                  <span className={`text-[11px] font-bold w-6 text-right ${isModified ? "text-foreground" : "text-muted"}`}>{val}</span>
                </div>
                {isModified && (
                  <p className="text-[7px] text-muted mt-1">Default: {defaultVal}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Compare mode panel */}
      {compareMode && compareIds.length === 2 && (() => {
        const bdA = adjustedBreakdowns.find((b) => b.product.id === compareIds[0]);
        const bdB = adjustedBreakdowns.find((b) => b.product.id === compareIds[1]);
        if (!bdA || !bdB) return null;
        return (
          <div className="rounded-2xl border border-foreground/20 ring-2 ring-foreground/5 bg-white p-5">
            <div className="flex items-center gap-2 mb-4">
              <Scale size={14} className="text-foreground" />
              <h3 className="text-[13px] font-semibold">Profile Comparison</h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[bdA, bdB].map((bd) => (
                <div key={bd.product.id}>
                  <div className="flex items-center gap-2 mb-3">
                    <ScoreRing score={bd.finalScore} size={36} strokeWidth={3} />
                    <div>
                      <p className="text-[12px] font-semibold">{bd.product.name}</p>
                      <p className="text-[9px] text-muted">{bd.product.brand} · {bd.product.category}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {bd.signals.map((s) => (
                      <div key={s.name} className="flex items-center gap-2">
                        <span className="w-20 text-[8px] text-muted truncate">{s.name}</span>
                        <div className="flex-1 h-[4px] bg-surface rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-foreground" style={{ width: `${s.normalizedScore}%` }} />
                        </div>
                        <span className="text-[8px] font-bold w-5 text-right">{s.contribution}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* Difference summary */}
            <div className="mt-4 pt-3 border-t border-border">
              <div className="flex items-center justify-center gap-6 text-[10px]">
                <span className="font-semibold">{bdA.product.name}: <span className="text-[14px] font-bold">{bdA.finalScore}%</span></span>
                <span className="text-muted">vs</span>
                <span className="font-semibold">{bdB.product.name}: <span className="text-[14px] font-bold">{bdB.finalScore}%</span></span>
                <span className={`font-bold ${bdA.finalScore > bdB.finalScore ? "text-emerald" : bdA.finalScore < bdB.finalScore ? "text-rose" : "text-muted"}`}>
                  Δ{Math.abs(bdA.finalScore - bdB.finalScore)}pts
                </span>
              </div>
            </div>
          </div>
        );
      })()}

      {compareMode && compareIds.length < 2 && (
        <div className="rounded-xl border border-dashed border-foreground/30 bg-surface/20 p-4 text-center text-[11px] text-muted">
          <Scale size={14} className="mx-auto mb-1" />
          Select {2 - compareIds.length} more product{compareIds.length === 0 ? "s" : ""} below to compare scoring profiles
        </div>
      )}

      {/* 2. Weighted Scoring Table + 3. Waterfall + 8. Expandable Detail */}
      <div className="rounded-2xl border border-border bg-white overflow-hidden">
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[13px] font-semibold">Product Scoring Breakdown</h3>
              <p className="text-[10px] text-muted mt-0.5">Click a row to expand full explanation, alternatives, and confidence timeline</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted">
              <span>{adjustedBreakdowns.length} products scored</span>
              {isProfileModified && <span className="rounded-full bg-amber-light px-2 py-0.5 text-[8px] font-bold text-amber">Custom Weights</span>}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface/30">
                {compareMode && <th className="p-2 w-8" />}
                <th className="p-3 text-left"><span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">#</span></th>
                <th className="p-3 text-left"><span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">Product</span></th>
                {signals.map((s) => (
                  <th key={s.name} className="p-2 text-center"><span className="text-[8px] font-semibold uppercase tracking-[0.06em] text-muted">{s.name.split(" ")[0]}</span></th>
                ))}
                <th className="p-3 text-center cursor-pointer" onClick={() => handleSort("finalScore")}>
                  <div className="flex items-center gap-0.5 justify-center">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">Score</span>
                    <ArrowUpDown size={8} className={sortKey === "finalScore" ? "text-foreground" : "text-muted/40"} />
                  </div>
                </th>
                <th className="p-3 text-center cursor-pointer" onClick={() => handleSort("confidence")}>
                  <div className="flex items-center gap-0.5 justify-center">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">Conf</span>
                    <ArrowUpDown size={8} className={sortKey === "confidence" ? "text-foreground" : "text-muted/40"} />
                  </div>
                </th>
                <th className="p-3 text-center"><span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">Waterfall</span></th>
              </tr>
            </thead>
            <tbody>
              {adjustedBreakdowns.slice(0, 12).map((bd, idx) => {
                const isExpanded = expandedProduct === bd.product.id;
                const isComparing = compareIds.includes(bd.product.id);

                return (
                  <React.Fragment key={bd.product.id}>
                    <tr
                      className={`border-b border-border transition-colors cursor-pointer ${idx < 3 ? "bg-emerald-light/15" : "hover:bg-surface/20"} ${isExpanded ? "bg-surface/30" : ""} ${isComparing ? "ring-1 ring-inset ring-foreground/20" : ""}`}
                      onClick={() => setExpandedProduct(isExpanded ? null : bd.product.id)}
                    >
                      {compareMode && (
                        <td className="p-2 text-center" onClick={(e) => { e.stopPropagation(); toggleCompare(bd.product.id); }}>
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${isComparing ? "bg-foreground border-foreground" : "border-border"}`}>
                            {isComparing && <Check size={10} className="text-white" />}
                          </div>
                        </td>
                      )}
                      <td className="p-3"><span className="text-[11px] font-bold text-muted">{idx + 1}</span></td>
                      <td className="p-3">
                        <div className="min-w-[140px]">
                          <p className="text-[11px] font-semibold">{bd.product.name}</p>
                          <p className="text-[9px] text-muted">{bd.product.brand} · {bd.product.category}</p>
                        </div>
                      </td>
                      {bd.signals.map((s) => (
                        <td key={s.name} className="p-2 text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-[9px] font-bold">{s.contribution}</span>
                            <div className="w-6 h-[3px] bg-surface rounded-full mt-0.5 overflow-hidden">
                              <div className="h-full rounded-full bg-foreground" style={{ width: `${s.normalizedScore}%` }} />
                            </div>
                          </div>
                        </td>
                      ))}
                      <td className="p-3 text-center"><ScoreRing score={bd.finalScore} size={32} strokeWidth={2.5} /></td>
                      <td className="p-3 text-center">
                        <span className={`text-[10px] font-bold ${bd.confidence >= 70 ? "text-emerald" : bd.confidence >= 50 ? "text-amber" : "text-rose"}`}>
                          {bd.confidence}%
                        </span>
                      </td>
                      <td className="p-3">
                        {/* 3. Waterfall / stacked bar */}
                        <div className="flex h-4 w-28 rounded overflow-hidden">
                          {bd.signals.map((s, si) => {
                            const colors = ["#0a0a0a", "#1a1a1a", "#333", "#4a4a4a", "#666", "#888", "#aaa", "#ccc"];
                            const widthPct = bd.finalScore > 0 ? (s.contribution / bd.finalScore) * 100 : 0;
                            return (
                              <div key={si} className="h-full" style={{ width: `${widthPct}%`, backgroundColor: colors[si % colors.length] }}
                                title={`${s.name}: ${s.contribution}pts`} />
                            );
                          })}
                        </div>
                      </td>
                    </tr>

                    {/* 8. Expandable Detail View */}
                    {isExpanded && (
                      <tr className="border-b border-border bg-surface/15">
                        <td colSpan={compareMode ? signals.length + 6 : signals.length + 5} className="p-0">
                          <div className="px-5 py-5">
                            <div className="grid grid-cols-12 gap-6">

                              {/* Col 1: Score breakdown + Radar */}
                              <div className="col-span-3 space-y-4">
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">Signal Breakdown</p>
                                  <div className="space-y-2">
                                    {bd.signals.map((s) => (
                                      <div key={s.name}>
                                        <div className="flex items-center justify-between text-[9px] mb-0.5">
                                          <span className="font-medium w-20 truncate">{s.name}</span>
                                          <div className="flex items-center gap-2">
                                            <span className="text-muted">raw:{s.rawScore}</span>
                                            <span className="text-muted">norm:{s.normalizedScore}</span>
                                            <span className="font-bold">+{s.contribution}</span>
                                          </div>
                                        </div>
                                        <div className="h-[4px] bg-surface rounded-full overflow-hidden">
                                          <div className="h-full rounded-full bg-foreground" style={{ width: `${s.normalizedScore}%` }} />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex justify-center">
                                  <RadarChart scores={bd.signals.slice(0, 6).map((s) => ({ label: s.name.split(" ")[0], value: s.normalizedScore }))} size={120} />
                                </div>
                              </div>

                              {/* Col 2: Confidence + Explainability */}
                              <div className="col-span-4 space-y-4">
                                {/* 4. Confidence & Explainability */}
                                <div className="rounded-xl border border-border p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Gauge size={12} className="text-muted" />
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Confidence & Explainability</p>
                                  </div>
                                  <div className="flex items-center gap-3 mb-3">
                                    <ScoreRing score={bd.confidence} size={48} strokeWidth={3} label={`${bd.confidence}%`} />
                                    <div>
                                      <p className={`text-[11px] font-bold ${bd.confidence >= 70 ? "text-emerald" : bd.confidence >= 50 ? "text-amber" : "text-rose"}`}>
                                        {bd.confidence >= 70 ? "High Confidence" : bd.confidence >= 50 ? "Moderate Confidence" : "Low Confidence"}
                                      </p>
                                      <p className="text-[9px] text-muted mt-0.5">Based on signal consistency and data coverage</p>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <div>
                                      <p className="text-[8px] font-semibold text-emerald uppercase mb-1">Strongest Signals</p>
                                      <div className="flex flex-wrap gap-1">
                                        {bd.strongestSignals.map((s) => (
                                          <span key={s} className="rounded-full bg-emerald-light px-2 py-0.5 text-[8px] font-semibold text-emerald">{s}</span>
                                        ))}
                                      </div>
                                    </div>
                                    <div>
                                      <p className="text-[8px] font-semibold text-rose uppercase mb-1">Weakest Signals</p>
                                      <div className="flex flex-wrap gap-1">
                                        {bd.weakestSignals.map((s) => (
                                          <span key={s} className="rounded-full bg-rose-light px-2 py-0.5 text-[8px] font-semibold text-rose">{s}</span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-3 pt-2 border-t border-border">
                                    <p className="text-[9px] text-muted italic">{bd.explanation}</p>
                                  </div>
                                </div>

                                {/* Logic type for this product */}
                                <div className="rounded-xl border border-border p-3">
                                  <p className="text-[9px] font-semibold uppercase tracking-wider text-muted mb-2">Logic Composition</p>
                                  <div className="h-5 rounded-lg overflow-hidden flex mb-2">
                                    <div className="bg-foreground flex items-center justify-center" style={{ width: `${bd.logicType.rules}%` }}>
                                      <span className="text-[7px] font-bold text-white">{bd.logicType.rules}%</span>
                                    </div>
                                    <div className="bg-blue-500 flex items-center justify-center" style={{ width: `${bd.logicType.pattern}%` }}>
                                      <span className="text-[7px] font-bold text-white">{bd.logicType.pattern}%</span>
                                    </div>
                                    <div className="bg-emerald flex items-center justify-center" style={{ width: `${bd.logicType.trend}%` }}>
                                      <span className="text-[7px] font-bold text-white">{bd.logicType.trend}%</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 text-[8px] text-muted">
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-foreground" /> Rules</span>
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Pattern</span>
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald" /> Trend</span>
                                  </div>
                                </div>

                                {/* Confidence timeline */}
                                <div className="rounded-xl border border-border p-3">
                                  <p className="text-[9px] font-semibold uppercase tracking-wider text-muted mb-2">Confidence Timeline (8 weeks)</p>
                                  <Sparkline data={bd.weeklyConfidence} width={200} height={30} color={bd.confidence >= 70 ? "#059669" : bd.confidence >= 50 ? "#d97706" : "#e11d48"} />
                                </div>
                              </div>

                              {/* Col 3: Alternatives + Benchmark */}
                              <div className="col-span-5 space-y-4">
                                {/* Benchmark vs category average */}
                                <div className="rounded-xl border border-border p-3">
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">Benchmark vs Category Average</p>
                                  <div className="flex items-center gap-4">
                                    <div className="text-center">
                                      <ScoreRing score={bd.finalScore} size={52} strokeWidth={3} label={`${bd.finalScore}%`} />
                                      <p className="text-[8px] font-semibold mt-1">This Product</p>
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-end gap-1 h-12">
                                        <div className="flex-1 bg-foreground rounded-t" style={{ height: `${(bd.finalScore / 100) * 100}%` }} />
                                        <div className="flex-1 bg-surface rounded-t" style={{ height: `${(bd.categoryAvg / 100) * 100}%` }} />
                                      </div>
                                      <div className="flex text-center mt-1">
                                        <span className="flex-1 text-[7px] font-bold">{bd.finalScore}%</span>
                                        <span className="flex-1 text-[7px] text-muted">{bd.categoryAvg}%</span>
                                      </div>
                                      <div className="flex text-center">
                                        <span className="flex-1 text-[6px] font-semibold">Product</span>
                                        <span className="flex-1 text-[6px] text-muted">Cat Avg</span>
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <p className={`text-[16px] font-bold ${bd.finalScore > bd.categoryAvg ? "text-emerald" : bd.finalScore < bd.categoryAvg ? "text-rose" : "text-muted"}`}>
                                        {bd.finalScore > bd.categoryAvg ? "+" : ""}{bd.finalScore - bd.categoryAvg}
                                      </p>
                                      <p className="text-[8px] text-muted">vs avg</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Comparable alternatives */}
                                <div className="rounded-xl border border-border p-3">
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">
                                    <Repeat2 size={10} className="inline mr-1" />
                                    Comparable Alternatives in {bd.product.category}
                                  </p>
                                  {bd.alternatives.length === 0 ? (
                                    <p className="text-[9px] text-muted italic">No alternatives in this category</p>
                                  ) : (
                                    <div className="space-y-2">
                                      {/* Current product */}
                                      <div className="flex items-center gap-2 rounded-lg bg-foreground/5 p-2">
                                        <ScoreRing score={bd.finalScore} size={24} strokeWidth={2} />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-[10px] font-semibold">{bd.product.name}</p>
                                          <p className="text-[8px] text-muted">{bd.product.brand} (current)</p>
                                        </div>
                                        <span className="text-[10px] font-bold">{bd.product.price}</span>
                                      </div>
                                      {bd.alternatives.map((alt) => {
                                        const altProduct = products.find((p) => p.id === alt.productId);
                                        return (
                                          <div key={alt.productId} className="flex items-center gap-2 rounded-lg border border-border p-2 hover:bg-surface/30 transition-colors">
                                            <ScoreRing score={alt.score} size={24} strokeWidth={2} />
                                            <div className="flex-1 min-w-0">
                                              <p className="text-[10px] font-medium">{alt.productName}</p>
                                              <p className="text-[8px] text-muted">{altProduct?.brand}</p>
                                            </div>
                                            <span className="text-[10px] font-medium">{altProduct?.price || "—"}</span>
                                            <span className={`text-[8px] font-bold ${alt.score > bd.finalScore ? "text-emerald" : alt.score < bd.finalScore ? "text-rose" : "text-muted"}`}>
                                              {alt.score > bd.finalScore ? "+" : ""}{alt.score - bd.finalScore}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
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
            savedProducts={savedProducts}
            toggleSaveProduct={toggleSaveProduct}
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
          <RecommendationLogicSection intel={recommendationLogic} />
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
