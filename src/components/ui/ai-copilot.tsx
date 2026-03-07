"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sparkles, X, ChevronRight, ChevronDown, ChevronUp, Package,
  Users, Building2, FolderKanban, ClipboardList, PenTool, TrendingUp,
  TrendingDown, ArrowUp, ArrowDown, ArrowRight, AlertTriangle,
  Lightbulb, Target, Eye, Heart, Download, Layers, Zap, BarChart3,
  Minus, Star, Shield, Activity, Crown, MessageSquare, DollarSign,
  CheckCircle2, Circle, Clock, MapPin, Ruler, Grid3X3, Home,
  AlertCircle, Percent, Award, Truck,
} from "lucide-react";
import { products, architects, brands, projects } from "@/lib/mock-data";
import {
  productMomentumData, architectInfluenceData, specifications,
  designBoards,
} from "@/lib/intelligence-data";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Insight {
  id: string;
  type: "recommendation" | "warning" | "opportunity" | "action";
  icon: React.ElementType;
  title: string;
  description: string;
  metric?: string;
  metricLabel?: string;
  confidence?: number;
  actions?: { label: string; href?: string }[];
  tags?: string[];
}

type PageContext =
  | "dashboard" | "projects" | "project-detail" | "products" | "product-detail"
  | "architects" | "architect-detail" | "brands" | "brand-detail"
  | "specifications" | "spec-detail" | "boards" | "board-detail"
  | "brief" | "momentum" | "influence" | "activity" | "market-trends"
  | "my-projects" | "discover" | "unknown";

// ─── Context Detection ─────────────────────────────────────────────────────

function detectPageContext(pathname: string): { context: PageContext; entityId?: string } {
  if (pathname === "/") return { context: "dashboard" };
  if (pathname === "/momentum") return { context: "momentum" };
  if (pathname === "/influence") return { context: "influence" };
  if (pathname === "/activity") return { context: "activity" };
  if (pathname === "/market-trends") return { context: "market-trends" };
  if (pathname === "/my-projects") return { context: "my-projects" };
  if (pathname === "/discover") return { context: "discover" };
  if (pathname === "/brief") return { context: "brief" };
  if (pathname === "/products") return { context: "products" };
  if (pathname === "/architects") return { context: "architects" };
  if (pathname === "/brands") return { context: "brands" };
  if (pathname === "/boards") return { context: "boards" };
  if (pathname === "/specifications") return { context: "specifications" };
  if (pathname.startsWith("/projects/")) return { context: "project-detail", entityId: pathname.split("/")[2] };
  if (pathname.startsWith("/products/")) return { context: "product-detail", entityId: pathname.split("/")[2] };
  if (pathname.startsWith("/architects/")) return { context: "architect-detail", entityId: pathname.split("/")[2] };
  if (pathname.startsWith("/boards/")) return { context: "board-detail", entityId: pathname.split("/")[2] };
  if (pathname.startsWith("/specifications/")) return { context: "spec-detail", entityId: pathname.split("/")[2] };
  return { context: "unknown" };
}

// ─── Context Labels ─────────────────────────────────────────────────────────

const contextLabels: Record<PageContext, { label: string; icon: React.ElementType }> = {
  dashboard: { label: "Intelligence Dashboard", icon: BarChart3 },
  projects: { label: "Projects", icon: FolderKanban },
  "project-detail": { label: "Project Detail", icon: FolderKanban },
  products: { label: "Product Library", icon: Package },
  "product-detail": { label: "Product Detail", icon: Package },
  architects: { label: "Architect Directory", icon: Users },
  "architect-detail": { label: "Architect Profile", icon: Users },
  brands: { label: "Brand Directory", icon: Building2 },
  "brand-detail": { label: "Brand Profile", icon: Building2 },
  specifications: { label: "Specifications", icon: ClipboardList },
  "spec-detail": { label: "Specification Detail", icon: ClipboardList },
  boards: { label: "Design Boards", icon: Layers },
  "board-detail": { label: "Board Detail", icon: Layers },
  brief: { label: "Brief Builder", icon: PenTool },
  momentum: { label: "Product Momentum", icon: TrendingUp },
  influence: { label: "Architect Influence", icon: Crown },
  activity: { label: "Live Activity", icon: Activity },
  "market-trends": { label: "Market Trends", icon: BarChart3 },
  "my-projects": { label: "My Projects", icon: FolderKanban },
  discover: { label: "Discover", icon: Eye },
  unknown: { label: "ArchiPro", icon: Sparkles },
};

// ─── Price Parsing Utility ──────────────────────────────────────────────────

function parsePrice(priceStr: string): number {
  const cleaned = priceStr.replace(/[^0-9.]/g, "");
  return parseFloat(cleaned) || 0;
}

// ─── Project Detail Workflow Data ───────────────────────────────────────────

interface ProjectWorkflowData {
  specCompleteness: {
    score: number;
    totalItems: number;
    installed: number;
    delivered: number;
    ordered: number;
    specified: number;
    roomsCovered: number;
    totalRooms: number;
    hasSpec: boolean;
  };
  costEstimate: {
    totalEstimate: number;
    breakdown: { category: string; amount: number; items: number; pct: number }[];
    avgPerRoom: number;
  };
  missingCategories: {
    category: string;
    reason: string;
    suggestedProducts: { id: string; name: string; brand: string; price: string; momentum: number }[];
  }[];
  suggestedProducts: {
    id: string;
    name: string;
    brand: string;
    price: string;
    momentum: number;
    reason: string;
    fitScore: number;
  }[];
  architectFit: {
    currentArchitect: {
      name: string;
      score: number;
      tier: string;
      fitScore: number;
      strengths: string[];
      productOverlap: number;
    };
    alternatives: {
      name: string;
      score: number;
      tier: string;
      fitScore: number;
      reason: string;
    }[];
  };
  missingRooms: { name: string; priority: "high" | "medium" | "low"; reason: string }[];
}

function computeProjectWorkflow(projectId: string): ProjectWorkflowData | null {
  const proj = projects.find(p => p.id === projectId);
  if (!proj) return null;

  const taggedProducts = products.filter(p => proj.products.includes(p.id));
  const spec = specifications.find(s => s.projectId === proj.id);
  const architect = architects.find(a => a.id === proj.architectId);
  const influence = architectInfluenceData.find(a => a.architectId === proj.architectId);
  const projBoards = designBoards.filter(b => b.projectId === proj.id);

  // ── Spec Completeness ──
  let totalItems = 0, installed = 0, delivered = 0, ordered = 0, specified = 0;
  const roomsCovered = spec?.rooms.length || 0;
  if (spec) {
    spec.rooms.forEach(r => {
      r.items.forEach(i => {
        totalItems++;
        if (i.status === "installed") installed++;
        else if (i.status === "delivered") delivered++;
        else if (i.status === "ordered") ordered++;
        else specified++;
      });
    });
  }
  const specScore = totalItems > 0
    ? Math.round(((installed * 1.0 + delivered * 0.75 + ordered * 0.5 + specified * 0.25) / totalItems) * 100)
    : 0;

  // Standard residential rooms
  const standardRooms = ["Kitchen", "Living Room", "Master Bedroom", "Bathroom", "Outdoor Deck", "Hallway", "Laundry", "Study"];
  const coveredRooms = spec?.rooms.map(r => r.name) || [];
  const totalExpectedRooms = Math.max(standardRooms.length, roomsCovered);

  // ── Cost Estimate ──
  const categoryMap = new Map<string, { amount: number; items: number }>();
  taggedProducts.forEach(p => {
    const price = parsePrice(p.price);
    const specItems = spec?.rooms.flatMap(r => r.items).filter(i => i.productId === p.id) || [];
    const qty = specItems.reduce((s, i) => s + i.quantity, 0) || 1;
    const total = price * qty;
    const existing = categoryMap.get(p.category);
    if (existing) {
      existing.amount += total;
      existing.items += 1;
    } else {
      categoryMap.set(p.category, { amount: total, items: 1 });
    }
  });
  const totalEstimate = Array.from(categoryMap.values()).reduce((s, v) => s + v.amount, 0);
  const breakdown = Array.from(categoryMap.entries())
    .map(([category, v]) => ({
      category,
      amount: v.amount,
      items: v.items,
      pct: totalEstimate > 0 ? Math.round((v.amount / totalEstimate) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // ── Missing Categories ──
  const allCategories = [...new Set(products.map(p => p.category))];
  const projectCategories = [...new Set(taggedProducts.map(p => p.category))];
  const missingCats = allCategories.filter(c => !projectCategories.includes(c));

  const missingCategories = missingCats.map(cat => {
    const categoryProducts = products.filter(p => p.category === cat);
    const withMomentum = categoryProducts.map(p => {
      const m = productMomentumData.find(pm => pm.productId === p.id);
      return { id: p.id, name: p.name, brand: p.brand, price: p.price, momentum: m?.momentumScore || 0 };
    }).sort((a, b) => b.momentum - a.momentum);
    return {
      category: cat,
      reason: `No ${cat.toLowerCase()} products specified. ${withMomentum.length} available in library.`,
      suggestedProducts: withMomentum.slice(0, 2),
    };
  });

  // ── Missing Rooms ──
  const missingRoomList = standardRooms
    .filter(r => !coveredRooms.includes(r))
    .map(name => {
      const priority = ["Kitchen", "Living Room", "Master Bedroom", "Bathroom"].includes(name) ? "high" as const
        : ["Hallway", "Study"].includes(name) ? "medium" as const : "low" as const;
      return {
        name,
        priority,
        reason: priority === "high" ? "Core room — typically requires product specification" :
          priority === "medium" ? "Common room — may need fixtures or finishes" :
            "Optional — depends on project scope",
      };
    });

  // ── Suggested Products ──
  const tagStyles = proj.tags.map(t => t.toLowerCase());
  const notInProject = products.filter(p => !proj.products.includes(p.id));
  const suggestedProducts = notInProject.map(p => {
    const m = productMomentumData.find(pm => pm.productId === p.id);
    const momentum = m?.momentumScore || 0;

    // Compute fit score based on style matching and momentum
    let fitScore = 0;
    // Products used by the same architect in other projects
    const archOtherProjects = projects.filter(pr => pr.architectId === proj.architectId && pr.id !== proj.id);
    const usedByArchitect = archOtherProjects.some(pr => pr.products.includes(p.id));
    if (usedByArchitect) fitScore += 30;
    // High momentum
    if (momentum >= 80) fitScore += 25;
    else if (momentum >= 60) fitScore += 15;
    // Category gap fill
    if (!projectCategories.includes(p.category)) fitScore += 20;
    // Brand already in project
    if (taggedProducts.some(tp => tp.brandId === p.brandId)) fitScore += 10;
    // Style matching (rough heuristic)
    if (tagStyles.includes("coastal") && ["Decking", "Outdoor"].includes(p.category)) fitScore += 15;
    if (tagStyles.includes("luxury") && parsePrice(p.price) > 1000) fitScore += 15;
    if (tagStyles.includes("urban") && ["Hardware", "Lighting"].includes(p.category)) fitScore += 10;
    if (tagStyles.includes("heritage") && ["Surfaces", "Furniture"].includes(p.category)) fitScore += 10;

    let reason = "";
    if (usedByArchitect) reason = `Used by ${architect?.name} in other projects`;
    else if (momentum >= 80) reason = `Surging product (score ${momentum})`;
    else if (!projectCategories.includes(p.category)) reason = `Fills missing ${p.category} category`;
    else reason = `Complements existing ${p.category} selection`;

    return { id: p.id, name: p.name, brand: p.brand, price: p.price, momentum, reason, fitScore };
  }).sort((a, b) => b.fitScore - a.fitScore).slice(0, 6);

  // ── Architect Fit ──
  const currentFitScore = (() => {
    let score = 50; // base
    if (influence) {
      if (influence.tier === "Platinum") score += 25;
      else if (influence.tier === "Gold") score += 15;
      else if (influence.tier === "Silver") score += 5;
      // Product overlap
      const archProductIds = influence.topInfluencedProducts.map(p => p.productId);
      const overlap = taggedProducts.filter(p => archProductIds.includes(p.id)).length;
      score += overlap * 10;
    }
    // Style match
    const archSpecialties = architect?.specialties.map(s => s.toLowerCase()) || [];
    const styleMatch = tagStyles.filter(t => archSpecialties.includes(t)).length;
    score += styleMatch * 8;
    return Math.min(score, 100);
  })();

  const productOverlap = influence
    ? taggedProducts.filter(p => influence.topInfluencedProducts.some(ip => ip.productId === p.id)).length
    : 0;

  const alternatives = architectInfluenceData
    .filter(a => a.architectId !== proj.architectId)
    .map(a => {
      const arch = architects.find(ar => ar.id === a.architectId);
      const archSpecialties = arch?.specialties.map(s => s.toLowerCase()) || [];
      const styleMatch = tagStyles.filter(t => archSpecialties.includes(t)).length;
      let fitScore = 30 + (a.influenceScore * 0.3) + (styleMatch * 12);
      const reason = styleMatch > 0
        ? `Specializes in ${arch?.specialties.filter(s => tagStyles.includes(s.toLowerCase())).join(", ")}`
        : `${a.tier} tier with ${a.influenceScore} influence score`;
      return { name: a.name, score: a.influenceScore, tier: a.tier, fitScore: Math.round(Math.min(fitScore, 100)), reason };
    })
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, 3);

  return {
    specCompleteness: {
      score: specScore,
      totalItems,
      installed,
      delivered,
      ordered,
      specified,
      roomsCovered,
      totalRooms: totalExpectedRooms,
      hasSpec: !!spec,
    },
    costEstimate: {
      totalEstimate,
      breakdown,
      avgPerRoom: roomsCovered > 0 ? Math.round(totalEstimate / roomsCovered) : totalEstimate,
    },
    missingCategories,
    suggestedProducts,
    architectFit: {
      currentArchitect: {
        name: architect?.name || "Unknown",
        score: influence?.influenceScore || 0,
        tier: influence?.tier || "Unranked",
        fitScore: currentFitScore,
        strengths: architect?.specialties || [],
        productOverlap,
      },
      alternatives,
    },
    missingRooms: missingRoomList,
  };
}

// ─── Insight Generation ─────────────────────────────────────────────────────

function generateInsights(context: PageContext, entityId?: string): Insight[] {
  const surgingProducts = productMomentumData.filter(p => p.trend === "surging");
  const coolingProducts = productMomentumData.filter(p => p.trend === "cooling");
  const topArchitects = architectInfluenceData.filter(a => a.tier === "Platinum");

  switch (context) {
    case "dashboard":
      return [
        {
          id: "d-1", type: "opportunity", icon: TrendingUp,
          title: "Pendant Light — Arc is surging",
          description: "Momentum score 96 (P100). 47% view growth, saved by 3 Platinum/Gold architects. Consider featuring in homepage hero.",
          metric: "+47%", metricLabel: "views growth", confidence: 94,
          actions: [{ label: "View momentum", href: "/momentum" }],
          tags: ["Surging", "P100"],
        },
        {
          id: "d-2", type: "warning", icon: AlertTriangle,
          title: "Enquiry rate below category average",
          description: "0.68% vs 0.82% platform avg — 17% gap. Enquiry CTA placement on product pages may need optimization.",
          metric: "0.68%", metricLabel: "vs 0.82% avg", confidence: 78,
          actions: [{ label: "Analyze funnel" }],
          tags: ["Risk", "P65"],
        },
        {
          id: "d-3", type: "recommendation", icon: Lightbulb,
          title: "Spec conversion outperforming",
          description: "16.4% board-to-install rate vs 12% benchmark (+37%). Replicate the workflow UX in other product categories.",
          metric: "16.4%", metricLabel: "vs 12% bench", confidence: 88,
          tags: ["Above Benchmark"],
        },
        {
          id: "d-4", type: "action", icon: Target,
          title: "2 boards inactive >30 days",
          description: "Mountain House Interior and My Dream Kitchen haven't been updated. Send re-engagement nudge to owners.",
          confidence: 72,
          actions: [{ label: "View boards", href: "/boards" }],
          tags: ["Churn Risk"],
        },
      ];

    case "project-detail": {
      const workflow = entityId ? computeProjectWorkflow(entityId) : null;
      if (!workflow) return [];
      const proj = projects.find(p => p.id === entityId)!;
      const spec = specifications.find(s => s.projectId === proj.id);

      const insights: Insight[] = [];

      // Spec completeness warning/action
      if (!workflow.specCompleteness.hasSpec) {
        insights.push({
          id: "pj-spec-none", type: "action", icon: ClipboardList,
          title: "No specification created yet",
          description: `${proj.products.length} products tagged but no spec exists. Create a room-by-room specification to track ordering and installation progress.`,
          confidence: 98,
          actions: [{ label: "Create specification", href: "/specifications" }],
          tags: ["Critical", "Action Required"],
        });
      } else if (workflow.specCompleteness.score < 50) {
        insights.push({
          id: "pj-spec-low", type: "warning", icon: AlertTriangle,
          title: `Spec only ${workflow.specCompleteness.score}% complete`,
          description: `${workflow.specCompleteness.specified} items still at "specified" status, ${workflow.specCompleteness.ordered} ordered, ${workflow.specCompleteness.delivered} delivered. ${workflow.specCompleteness.installed} installed out of ${workflow.specCompleteness.totalItems} total.`,
          metric: `${workflow.specCompleteness.score}%`, metricLabel: "complete",
          confidence: 95,
          actions: spec ? [{ label: "Open specification", href: `/specifications/${spec.id}` }] : [],
          tags: ["Behind Schedule"],
        });
      } else {
        insights.push({
          id: "pj-spec-ok", type: "recommendation", icon: CheckCircle2,
          title: `Spec ${workflow.specCompleteness.score}% complete`,
          description: `${workflow.specCompleteness.installed} installed, ${workflow.specCompleteness.delivered} delivered, ${workflow.specCompleteness.ordered} ordered, ${workflow.specCompleteness.specified} pending specification.`,
          metric: `${workflow.specCompleteness.score}%`, metricLabel: "complete",
          confidence: 95,
          actions: spec ? [{ label: "View spec", href: `/specifications/${spec.id}` }] : [],
        });
      }

      // Missing rooms
      const highPriorityRooms = workflow.missingRooms.filter(r => r.priority === "high");
      if (highPriorityRooms.length > 0) {
        insights.push({
          id: "pj-rooms", type: "warning", icon: Home,
          title: `${highPriorityRooms.length} core room${highPriorityRooms.length > 1 ? "s" : ""} not specified`,
          description: `${highPriorityRooms.map(r => r.name).join(", ")} — core rooms typically require product specification. ${workflow.missingRooms.filter(r => r.priority === "medium").length} optional rooms also unspecified.`,
          confidence: 82,
          tags: ["Gap", "Rooms"],
        });
      }

      // Missing categories
      if (workflow.missingCategories.length > 0) {
        const topMissing = workflow.missingCategories.slice(0, 3);
        insights.push({
          id: "pj-cats", type: "opportunity", icon: Grid3X3,
          title: `${workflow.missingCategories.length} product categor${workflow.missingCategories.length > 1 ? "ies" : "y"} not covered`,
          description: `Missing: ${topMissing.map(c => c.category).join(", ")}. Browse suggested products to fill gaps in the specification.`,
          confidence: 76,
          actions: [{ label: "Browse products", href: "/products" }],
          tags: ["Gap", "Categories"],
        });
      }

      // Top suggested product
      if (workflow.suggestedProducts.length > 0) {
        const top = workflow.suggestedProducts[0];
        insights.push({
          id: "pj-suggest", type: "recommendation", icon: Package,
          title: `Suggested: ${top.name}`,
          description: `${top.reason}. Fit score ${top.fitScore}%. ${top.momentum > 0 ? `Momentum ${top.momentum}.` : ""} ${top.price}.`,
          metric: `${top.fitScore}%`, metricLabel: "fit score",
          confidence: top.fitScore,
          actions: [{ label: "View product", href: `/products/${top.id}` }],
          tags: ["AI Suggestion"],
        });
      }

      // Cost estimate summary
      insights.push({
        id: "pj-cost", type: "recommendation", icon: DollarSign,
        title: `Estimated cost: $${workflow.costEstimate.totalEstimate.toLocaleString()}`,
        description: `Across ${workflow.costEstimate.breakdown.length} categories. ${workflow.costEstimate.breakdown[0]?.category} is the largest at ${workflow.costEstimate.breakdown[0]?.pct}%. Avg $${workflow.costEstimate.avgPerRoom.toLocaleString()}/room.`,
        metric: `$${(workflow.costEstimate.totalEstimate / 1000).toFixed(1)}k`, metricLabel: "total estimate",
        confidence: 68,
        tags: ["Cost"],
      });

      // Architect fit
      if (workflow.architectFit.currentArchitect.fitScore < 70) {
        const bestAlt = workflow.architectFit.alternatives[0];
        insights.push({
          id: "pj-arch-fit", type: "opportunity", icon: Users,
          title: `Architect fit score: ${workflow.architectFit.currentArchitect.fitScore}%`,
          description: `${workflow.architectFit.currentArchitect.name} has ${workflow.architectFit.currentArchitect.productOverlap} product overlaps with this project. ${bestAlt ? `${bestAlt.name} (${bestAlt.tier}, ${bestAlt.fitScore}% fit) could be a strong alternative.` : ""}`,
          confidence: 74,
          actions: [{ label: "View architects", href: "/architects" }],
          tags: ["Fit Analysis"],
        });
      } else {
        insights.push({
          id: "pj-arch-fit", type: "recommendation", icon: Users,
          title: `Strong architect fit: ${workflow.architectFit.currentArchitect.fitScore}%`,
          description: `${workflow.architectFit.currentArchitect.name} (${workflow.architectFit.currentArchitect.tier}) — ${workflow.architectFit.currentArchitect.productOverlap} product overlaps. Specialties: ${workflow.architectFit.currentArchitect.strengths.join(", ")}.`,
          metric: `${workflow.architectFit.currentArchitect.fitScore}%`, metricLabel: "fit score",
          confidence: 88,
        });
      }

      // Surging products in project
      const projMomentum = productMomentumData.filter(m => proj.products.includes(m.productId));
      const surgingInProj = projMomentum.filter(m => m.trend === "surging");
      const coolingInProj = projMomentum.filter(m => m.trend === "cooling");
      if (surgingInProj.length > 0) {
        insights.push({
          id: "pj-surging", type: "opportunity", icon: TrendingUp,
          title: `${surgingInProj.length} surging product${surgingInProj.length > 1 ? "s" : ""} tagged`,
          description: surgingInProj.map(p => `${p.productName} (score ${p.momentumScore}, +${p.metrics.viewsGrowth}% views)`).join(". "),
          confidence: 90,
          tags: ["Surging"],
        });
      }
      if (coolingInProj.length > 0) {
        insights.push({
          id: "pj-cooling", type: "warning", icon: TrendingDown,
          title: `${coolingInProj.length} cooling product${coolingInProj.length > 1 ? "s" : ""} — consider alternatives`,
          description: coolingInProj.map(p => `${p.productName} (score ${p.momentumScore}, ${p.metrics.viewsGrowth}% views)`).join(". ") + " Declining interest may affect resale value.",
          confidence: 72,
          tags: ["Cooling", "Review"],
        });
      }

      return insights;
    }

    case "projects":
    case "my-projects":
    case "discover":
      return [
        {
          id: "pjs-1", type: "recommendation", icon: FolderKanban,
          title: `${projects.length} active projects`,
          description: "Coastal Retreat leads with the most product tags and spec progress. Mountain House has the newest product selections.",
          confidence: 88,
          actions: [{ label: "View top project", href: `/projects/${projects[0].id}` }],
        },
        {
          id: "pjs-2", type: "opportunity", icon: Package,
          title: "Trending products not yet tagged",
          description: `${surgingProducts.length} surging products haven't been tagged in any project. Consider ${surgingProducts[0]?.productName || "new products"}.`,
          confidence: 76,
          actions: [{ label: "View momentum", href: "/momentum" }],
          tags: ["Growth Opportunity"],
        },
        {
          id: "pjs-3", type: "recommendation", icon: Users,
          title: "Top architects with new projects",
          description: `${topArchitects.map(a => a.name).join(" and ")} are Platinum tier — their projects drive the most product engagement.`,
          confidence: 85,
        },
      ];

    case "products":
    case "product-detail": {
      const underperforming = productMomentumData.filter(p => p.trend === "cooling" || p.momentumScore < 50);
      return [
        {
          id: "pr-1", type: "warning", icon: TrendingDown,
          title: `${underperforming.length} underperforming product${underperforming.length !== 1 ? "s" : ""}`,
          description: underperforming.map(p => `${p.productName} (score ${p.momentumScore}, ${p.metrics.viewsGrowth > 0 ? "+" : ""}${p.metrics.viewsGrowth}% views)`).join(". "),
          confidence: 86,
          actions: [{ label: "View details", href: "/momentum" }],
          tags: ["Cooling", "Action Required"],
        },
        {
          id: "pr-2", type: "opportunity", icon: TrendingUp,
          title: `${surgingProducts.length} products surging`,
          description: surgingProducts.map(p => `${p.productName} — score ${p.momentumScore}, saved by ${p.savedByArchitects.length} architects`).join(". "),
          metric: `${surgingProducts.length}`, metricLabel: "surging",
          confidence: 92,
          tags: ["Surging"],
        },
        {
          id: "pr-3", type: "recommendation", icon: Lightbulb,
          title: "High save-to-spec conversion",
          description: "Matte Black Pull Handle has the highest view→spec rate at 4.87%. Use as a benchmark for product page optimization.",
          metric: "4.87%", metricLabel: "view→spec",
          confidence: 80,
        },
        {
          id: "pr-4", type: "recommendation", icon: Users,
          title: "Architect endorsement opportunity",
          description: "Dining Table — Niko is rising fast (+31% views) but only saved by 2 architects. Target Elena Vasquez for cross-promotion.",
          confidence: 74,
          actions: [{ label: "View architect", href: "/influence" }],
          tags: ["AI Suggestion"],
        },
      ];
    }

    case "architects":
    case "architect-detail": {
      const arch = entityId ? architects.find(a => a.id === entityId) : null;
      const archInf = entityId ? architectInfluenceData.find(a => a.architectId === entityId) : null;
      if (archInf) {
        return [
          {
            id: "ar-1", type: "recommendation", icon: Package,
            title: "Top influenced products",
            description: archInf.topInfluencedProducts.map(p => `${p.productName} (influence ${p.influence})`).join(", "),
            confidence: 90,
          },
          {
            id: "ar-2", type: "opportunity", icon: Target,
            title: "Products trending in their network",
            description: `${archInf.name} saves ${archInf.metrics.productSaves} products but only generates ${archInf.metrics.enquiriesGenerated} enquiries. Conversion optimization could increase revenue.`,
            metric: `${((archInf.metrics.enquiriesGenerated / archInf.metrics.productSaves) * 100).toFixed(1)}%`, metricLabel: "save→enquiry",
            confidence: 78,
          },
          {
            id: "ar-3", type: "recommendation", icon: FolderKanban,
            title: "Recommend for similar projects",
            description: `Specializes in ${arch?.specialties?.join(", ") || "modern design"}. Match with homeowners seeking this aesthetic.`,
            confidence: 82,
            tags: [archInf.tier],
          },
        ];
      }
      return [
        {
          id: "ars-1", type: "opportunity", icon: Crown,
          title: `${topArchitects.length} Platinum architects driving engagement`,
          description: `${topArchitects.map(a => a.name).join(", ")} collectively influence ${topArchitects.reduce((s, a) => s + a.topInfluencedProducts.length, 0)} products across ${topArchitects.reduce((s, a) => s + a.topInfluencedBrands.length, 0)} brands.`,
          confidence: 92,
        },
        {
          id: "ars-2", type: "recommendation", icon: Users,
          title: "Fastest rising architect",
          description: (() => {
            const sorted = [...architectInfluenceData].sort((a, b) => {
              const ag = a.monthlyTrend[a.monthlyTrend.length - 1].score - a.monthlyTrend[0].score;
              const bg = b.monthlyTrend[b.monthlyTrend.length - 1].score - b.monthlyTrend[0].score;
              return bg - ag;
            });
            const top = sorted[0];
            const growth = top.monthlyTrend[top.monthlyTrend.length - 1].score - top.monthlyTrend[0].score;
            return `${top.name} gained +${growth} influence pts in 6 months. Now at ${top.influenceScore} (${top.tier}).`;
          })(),
          confidence: 88,
          tags: ["Rising"],
        },
        {
          id: "ars-3", type: "warning", icon: AlertTriangle,
          title: "Silver tier engagement declining",
          description: "2 Silver architects show reduced activity over the past 30 days. Consider re-engagement campaigns.",
          confidence: 68,
          tags: ["Churn Risk"],
        },
      ];
    }

    case "specifications":
    case "spec-detail": {
      const spec = entityId ? specifications.find(s => s.id === entityId) : null;
      if (spec) {
        const totalItems = spec.rooms.reduce((s, r) => s + r.items.length, 0);
        const installed = spec.rooms.reduce((s, r) => s + r.items.filter(i => i.status === "installed").length, 0);
        const specified = spec.rooms.reduce((s, r) => s + r.items.filter(i => i.status === "specified").length, 0);
        return [
          {
            id: "sp-1", type: "action", icon: ClipboardList,
            title: `${specified} items still at "specified" status`,
            description: `${spec.projectName} has ${totalItems} total items. ${installed} installed, ${specified} awaiting order. Advance the pipeline.`,
            metric: `${Math.round((installed / totalItems) * 100)}%`, metricLabel: "installed",
            confidence: 95,
          },
          {
            id: "sp-2", type: "recommendation", icon: Package,
            title: "Suggested room additions",
            description: `${spec.rooms.map(r => r.name).join(", ")} are specified. Consider adding ${["Bathroom", "Hallway", "Master Suite"].filter(r => !spec.rooms.find(rm => rm.name === r)).slice(0, 2).join(" and ")} specifications.`,
            confidence: 72,
            tags: ["AI Suggestion"],
          },
          {
            id: "sp-3", type: "opportunity", icon: TrendingUp,
            title: "Product alternatives with higher momentum",
            description: "Some specified products have surging alternatives. Pendant Light — Arc (score 96) could replace lower-performing lighting selections.",
            confidence: 78,
          },
        ];
      }
      return [
        {
          id: "sps-1", type: "recommendation", icon: ClipboardList,
          title: `${specifications.length} active specifications`,
          description: `${specifications.filter(s => s.status === "approved").length} approved, ${specifications.filter(s => s.status === "review").length} under review, ${specifications.filter(s => s.status === "draft").length} in draft.`,
          confidence: 95,
          actions: [{ label: "View all" }],
        },
        {
          id: "sps-2", type: "action", icon: Target,
          title: "Specifications needing review",
          description: specifications.filter(s => s.status === "review").map(s => `${s.projectName} (${s.rooms.reduce((sum, r) => sum + r.items.length, 0)} items)`).join(", "),
          confidence: 90,
          tags: ["Review Required"],
        },
      ];
    }

    case "boards":
    case "board-detail":
      return [
        {
          id: "b-1", type: "action", icon: Layers,
          title: `${designBoards.length} active boards`,
          description: `${designBoards.filter(b => b.isPublic).length} public, ${designBoards.filter(b => !b.isPublic).length} private. Avg ${Math.round(designBoards.reduce((s, b) => s + b.productIds.length, 0) / designBoards.length)} products per board.`,
          confidence: 90,
        },
        {
          id: "b-2", type: "recommendation", icon: Package,
          title: "Products trending that aren't on any board",
          description: `Dining Table — Niko and Concrete Look Tile are rising but appear on fewer boards. Consider creating a curated collection.`,
          confidence: 76,
          actions: [{ label: "Browse products", href: "/products" }],
          tags: ["AI Suggestion"],
        },
        {
          id: "b-3", type: "action", icon: ClipboardList,
          title: "Convert boards to specifications",
          description: `${designBoards.filter(b => b.productIds.length >= 3).length} boards have enough products to generate specifications. Start the spec workflow.`,
          confidence: 88,
          actions: [{ label: "View boards", href: "/boards" }],
        },
      ];

    case "brief":
      return [
        {
          id: "br-1", type: "recommendation", icon: PenTool,
          title: "Brief builder intelligence",
          description: "Based on current platform trends, Coastal Modern and Minimal Industrial are the most-specified styles this quarter.",
          confidence: 82,
          tags: ["Trending Styles"],
        },
        {
          id: "br-2", type: "recommendation", icon: Package,
          title: "Auto-populate product suggestions",
          description: "As you define rooms and style preferences, the copilot will suggest trending products that match. 96 momentum-score products available.",
          confidence: 88,
        },
        {
          id: "br-3", type: "recommendation", icon: Users,
          title: "Architect matching",
          description: `${architectInfluenceData.filter(a => a.influenceScore >= 80).length} architects with influence score ≥80 can be matched to your brief based on specialty and location.`,
          confidence: 85,
          actions: [{ label: "View architects", href: "/architects" }],
        },
        {
          id: "br-4", type: "opportunity", icon: Lightbulb,
          title: "Budget optimization",
          description: "Products in your selected categories have alternatives across 3 price tiers. The copilot will flag cost-saving swaps without sacrificing style.",
          confidence: 72,
          tags: ["AI Suggestion"],
        },
      ];

    case "momentum":
      return [
        {
          id: "m-1", type: "opportunity", icon: TrendingUp,
          title: "Surging: feature these on homepage",
          description: surgingProducts.map(p => `${p.productName} (${p.momentumScore})`).join(", "),
          confidence: 94,
          tags: ["Surging"],
        },
        {
          id: "m-2", type: "warning", icon: TrendingDown,
          title: `${coolingProducts.length} product${coolingProducts.length !== 1 ? "s" : ""} cooling`,
          description: coolingProducts.map(p => `${p.productName} (${p.metrics.viewsGrowth}% views)`).join(", "),
          confidence: 86,
          tags: ["Cooling"],
        },
        {
          id: "m-3", type: "recommendation", icon: Building2,
          title: "Brand growth opportunity",
          description: "Southmade Furniture has 2 products in the top 6 momentum list but low enquiry conversion. Optimize their product pages.",
          confidence: 78,
          actions: [{ label: "View brand" }],
          tags: ["Brand Strategy"],
        },
      ];

    case "influence":
      return [
        {
          id: "i-1", type: "opportunity", icon: Crown,
          title: "Platinum architects driving 62% of saves",
          description: `${topArchitects.map(a => a.name).join(", ")} account for the majority of product engagement. Strengthen these relationships.`,
          confidence: 92,
        },
        {
          id: "i-2", type: "recommendation", icon: Target,
          title: "Aroha Tane approaching Gold threshold",
          description: "Currently Silver (68) with +16pts growth in 6 months. At current trajectory, will reach Gold tier in ~2 months.",
          confidence: 84,
          tags: ["Rising"],
        },
        {
          id: "i-3", type: "warning", icon: AlertTriangle,
          title: "Enquiry conversion slowing",
          description: "Platform-wide save→enquiry rate dropped from 4.1% to 3.7% this quarter. Investigate CTA effectiveness.",
          confidence: 76,
          tags: ["Monitor"],
        },
      ];

    default:
      return [
        {
          id: "g-1", type: "recommendation", icon: Sparkles,
          title: "Platform overview",
          description: `Tracking ${productMomentumData.length} products, ${architectInfluenceData.length} architects, ${brands.length} brands. ${surgingProducts.length} products surging.`,
          confidence: 90,
        },
      ];
  }
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function InsightCard({ insight, expanded, onToggle }: { insight: Insight; expanded: boolean; onToggle: () => void }) {
  const Icon = insight.icon;
  const typeStyles = {
    recommendation: { border: "border-border", bg: "bg-white", icon: "text-blue" },
    warning: { border: "border-rose/20", bg: "bg-rose-light/20", icon: "text-rose" },
    opportunity: { border: "border-emerald/20", bg: "bg-emerald-light/20", icon: "text-emerald" },
    action: { border: "border-amber/20", bg: "bg-amber-light/20", icon: "text-amber" },
  };
  const style = typeStyles[insight.type];

  return (
    <div className={`rounded-xl border ${style.border} ${style.bg} overflow-hidden transition-all`}>
      <button onClick={onToggle} className="w-full text-left px-3.5 py-3 flex items-start gap-2.5">
        <div className={`mt-0.5 shrink-0 ${style.icon}`}>
          <Icon size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[12px] font-semibold leading-snug">{insight.title}</p>
            {insight.confidence && (
              <span className="shrink-0 text-[9px] font-semibold text-muted bg-surface rounded px-1 py-0.5">
                {insight.confidence}%
              </span>
            )}
          </div>
          {insight.tags && insight.tags.length > 0 && (
            <div className="flex items-center gap-1 mt-1">
              {insight.tags.map(tag => (
                <span key={tag} className="rounded px-1.5 py-0.5 text-[9px] font-semibold bg-foreground/10 text-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="shrink-0 mt-0.5 text-muted">
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </div>
      </button>
      {expanded && (
        <div className="px-3.5 pb-3 pt-0">
          <p className="text-[11px] text-muted leading-relaxed">{insight.description}</p>
          {insight.metric && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[16px] font-bold">{insight.metric}</span>
              {insight.metricLabel && <span className="text-[10px] text-muted">{insight.metricLabel}</span>}
            </div>
          )}
          {insight.actions && insight.actions.length > 0 && (
            <div className="mt-2 flex items-center gap-1.5">
              {insight.actions.map(action => (
                action.href ? (
                  <Link key={action.label} href={action.href}
                    className="inline-flex items-center gap-1 rounded-lg bg-foreground px-2.5 py-1 text-[10px] font-semibold text-white hover:opacity-90 transition-opacity">
                    {action.label} <ArrowRight size={9} />
                  </Link>
                ) : (
                  <button key={action.label}
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-2.5 py-1 text-[10px] font-semibold text-foreground hover:bg-surface transition-colors">
                    {action.label}
                  </button>
                )
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function QuickStat({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-border bg-white p-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={11} className="text-muted" />
        <span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">{label}</span>
      </div>
      <p className="text-[15px] font-bold tracking-tight">{value}</p>
      {sub && <p className="text-[9px] text-muted mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Project Workflow Panels ────────────────────────────────────────────────

function SpecCompletenessGauge({ data }: { data: ProjectWorkflowData["specCompleteness"] }) {
  const circumference = 2 * Math.PI * 28;
  const filled = (data.score / 100) * circumference;
  const color = data.score >= 75 ? "#10b981" : data.score >= 50 ? "#f59e0b" : "#f43f5e";

  return (
    <div className="rounded-xl border border-border bg-white p-3.5">
      <div className="flex items-center gap-2 mb-3">
        <ClipboardList size={12} className="text-muted" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">Spec Completeness</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <svg width="68" height="68" viewBox="0 0 68 68">
            <circle cx="34" cy="34" r="28" fill="none" stroke="#e5e5e5" strokeWidth="4" />
            <circle cx="34" cy="34" r="28" fill="none" stroke={color} strokeWidth="4"
              strokeDasharray={circumference} strokeDashoffset={circumference - filled}
              strokeLinecap="round" transform="rotate(-90 34 34)" />
            <text x="34" y="32" textAnchor="middle" className="text-[14px] font-bold" fill="#0a0a0a">{data.score}%</text>
            <text x="34" y="44" textAnchor="middle" className="text-[8px]" fill="#737373">complete</text>
          </svg>
        </div>
        <div className="flex-1 space-y-1.5">
          {[
            { label: "Installed", count: data.installed, color: "bg-emerald" },
            { label: "Delivered", count: data.delivered, color: "bg-blue" },
            { label: "Ordered", count: data.ordered, color: "bg-amber" },
            { label: "Specified", count: data.specified, color: "bg-border" },
          ].map(s => (
            <div key={s.label} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${s.color}`} />
                <span className="text-[10px] text-muted">{s.label}</span>
              </div>
              <span className="text-[10px] font-semibold">{s.count}</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-1 border-t border-border">
            <span className="text-[10px] text-muted">Rooms</span>
            <span className="text-[10px] font-semibold">{data.roomsCovered}/{data.totalRooms}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CostBreakdownPanel({ data }: { data: ProjectWorkflowData["costEstimate"] }) {
  const maxAmount = Math.max(...data.breakdown.map(b => b.amount));

  return (
    <div className="rounded-xl border border-border bg-white p-3.5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <DollarSign size={12} className="text-muted" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">Cost Estimate</span>
        </div>
        <span className="text-[13px] font-bold">${data.totalEstimate.toLocaleString()}</span>
      </div>
      <div className="space-y-2">
        {data.breakdown.map(b => (
          <div key={b.category}>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] font-medium">{b.category}</span>
              <span className="text-[10px] text-muted">${b.amount.toLocaleString()} ({b.pct}%)</span>
            </div>
            <div className="h-1.5 rounded-full bg-surface overflow-hidden">
              <div className="h-full bg-foreground/60 rounded-full transition-all" style={{ width: `${(b.amount / maxAmount) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-2 border-t border-border flex items-center justify-between">
        <span className="text-[10px] text-muted">Avg per room</span>
        <span className="text-[10px] font-semibold">${data.avgPerRoom.toLocaleString()}</span>
      </div>
    </div>
  );
}

function MissingRoomsPanel({ rooms }: { rooms: ProjectWorkflowData["missingRooms"] }) {
  if (rooms.length === 0) return null;
  const priorityColor = { high: "text-rose", medium: "text-amber", low: "text-muted" };
  const priorityBg = { high: "bg-rose-light", medium: "bg-amber-light", low: "bg-surface" };

  return (
    <div className="rounded-xl border border-border bg-white p-3.5">
      <div className="flex items-center gap-2 mb-3">
        <Home size={12} className="text-muted" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">Missing Rooms</span>
        <span className="ml-auto text-[10px] font-semibold text-rose">{rooms.filter(r => r.priority === "high").length} critical</span>
      </div>
      <div className="space-y-1.5">
        {rooms.map(r => (
          <div key={r.name} className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${priorityBg[r.priority]} ${priorityColor[r.priority]}`}>
                {r.priority}
              </span>
              <span className="text-[11px] font-medium">{r.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SuggestedProductsPanel({ products: suggested }: { products: ProjectWorkflowData["suggestedProducts"] }) {
  if (suggested.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-white p-3.5">
      <div className="flex items-center gap-2 mb-3">
        <Package size={12} className="text-muted" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">Suggested Products</span>
      </div>
      <div className="space-y-1.5">
        {suggested.slice(0, 4).map(p => (
          <Link key={p.id} href={`/products/${p.id}`}
            className="flex items-center gap-3 rounded-lg border border-border p-2 hover:bg-surface/50 transition-colors group">
            <div className="h-8 w-8 rounded bg-surface flex items-center justify-center shrink-0">
              <Package size={12} className="text-muted" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold truncate">{p.name}</p>
              <p className="text-[9px] text-muted">{p.brand} · {p.price}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold">{p.fitScore}%</span>
                <span className="text-[8px] text-muted">fit</span>
              </div>
              {p.momentum > 0 && (
                <div className="flex items-center gap-0.5 mt-0.5">
                  <TrendingUp size={8} className="text-emerald" />
                  <span className="text-[8px] text-emerald font-semibold">{p.momentum}</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ArchitectFitPanel({ data }: { data: ProjectWorkflowData["architectFit"] }) {
  const fitColor = data.currentArchitect.fitScore >= 80 ? "text-emerald" :
    data.currentArchitect.fitScore >= 60 ? "text-amber" : "text-rose";

  return (
    <div className="rounded-xl border border-border bg-white p-3.5">
      <div className="flex items-center gap-2 mb-3">
        <Users size={12} className="text-muted" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">Architect Fit</span>
      </div>
      {/* Current architect */}
      <div className="rounded-lg bg-surface p-2.5 mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold">{data.currentArchitect.name}</span>
          <div className="flex items-center gap-1">
            <span className={`text-[12px] font-bold ${fitColor}`}>{data.currentArchitect.fitScore}%</span>
            <span className="text-[8px] text-muted">fit</span>
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-white overflow-hidden mb-2">
          <div className={`h-full rounded-full transition-all ${
            data.currentArchitect.fitScore >= 80 ? "bg-emerald" :
            data.currentArchitect.fitScore >= 60 ? "bg-amber" : "bg-rose"
          }`} style={{ width: `${data.currentArchitect.fitScore}%` }} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="rounded px-1.5 py-0.5 text-[9px] font-semibold bg-foreground text-white">{data.currentArchitect.tier}</span>
          <span className="text-[9px] text-muted">Score {data.currentArchitect.score}</span>
          <span className="text-[9px] text-muted">{data.currentArchitect.productOverlap} product overlap{data.currentArchitect.productOverlap !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
          {data.currentArchitect.strengths.map(s => (
            <span key={s} className="rounded px-1.5 py-0.5 text-[8px] font-medium bg-white text-muted">{s}</span>
          ))}
        </div>
      </div>
      {/* Alternatives */}
      {data.alternatives.length > 0 && (
        <>
          <p className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted mb-1.5">Alternative Matches</p>
          <div className="space-y-1.5">
            {data.alternatives.map(a => (
              <div key={a.name} className="flex items-center justify-between py-1 px-1">
                <div>
                  <p className="text-[10px] font-medium">{a.name}</p>
                  <p className="text-[8px] text-muted">{a.reason}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="rounded px-1 py-0.5 text-[8px] font-semibold bg-surface text-muted">{a.tier}</span>
                  <span className="text-[10px] font-semibold">{a.fitScore}%</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function MissingCategoriesPanel({ categories }: { categories: ProjectWorkflowData["missingCategories"] }) {
  if (categories.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-white p-3.5">
      <div className="flex items-center gap-2 mb-3">
        <Grid3X3 size={12} className="text-muted" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">Category Gaps</span>
        <span className="ml-auto text-[10px] font-semibold text-amber">{categories.length} missing</span>
      </div>
      <div className="space-y-2">
        {categories.slice(0, 4).map(cat => (
          <div key={cat.category} className="rounded-lg border border-border p-2">
            <p className="text-[11px] font-semibold mb-1">{cat.category}</p>
            {cat.suggestedProducts.length > 0 && (
              <div className="space-y-1">
                {cat.suggestedProducts.map(sp => (
                  <div key={sp.id} className="flex items-center justify-between">
                    <span className="text-[9px] text-muted">{sp.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-muted">{sp.price}</span>
                      {sp.momentum > 0 && (
                        <span className="flex items-center gap-0.5 text-[8px] text-emerald font-semibold">
                          <TrendingUp size={7} />{sp.momentum}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function AICopilot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<string>("insights");

  const { context, entityId } = useMemo(() => detectPageContext(pathname), [pathname]);
  const contextInfo = contextLabels[context];
  const ContextIcon = contextInfo.icon;

  const insights = useMemo(() => generateInsights(context, entityId), [context, entityId]);
  const projectWorkflow = useMemo(() =>
    context === "project-detail" && entityId ? computeProjectWorkflow(entityId) : null,
    [context, entityId]
  );

  // Reset panel when context changes
  useEffect(() => {
    setActivePanel(context === "project-detail" ? "overview" : "insights");
  }, [context, entityId]);

  // Auto-expand first insight
  useEffect(() => {
    if (insights.length > 0) setExpandedInsight(insights[0].id);
  }, [context, entityId]);

  // Quick stats based on context
  const quickStats = useMemo(() => {
    if (context === "project-detail" && projectWorkflow) {
      const proj = projects.find(p => p.id === entityId);
      return [
        { icon: ClipboardList, label: "Spec", value: `${projectWorkflow.specCompleteness.score}%`, sub: projectWorkflow.specCompleteness.hasSpec ? `${projectWorkflow.specCompleteness.totalItems} items` : "No spec" },
        { icon: DollarSign, label: "Est. Cost", value: `$${(projectWorkflow.costEstimate.totalEstimate / 1000).toFixed(1)}k`, sub: `${projectWorkflow.costEstimate.breakdown.length} categories` },
        { icon: Package, label: "Products", value: `${proj?.products.length || 0}`, sub: `${projectWorkflow.missingCategories.length} gaps` },
        { icon: Users, label: "Arch Fit", value: `${projectWorkflow.architectFit.currentArchitect.fitScore}%`, sub: projectWorkflow.architectFit.currentArchitect.tier },
      ];
    }
    switch (context) {
      case "dashboard":
      case "momentum":
        return [
          { icon: Package, label: "Products", value: productMomentumData.length.toString(), sub: `${productMomentumData.filter(p => p.trend === "surging").length} surging` },
          { icon: Users, label: "Architects", value: architectInfluenceData.length.toString(), sub: `${architectInfluenceData.filter(a => a.tier === "Platinum").length} platinum` },
        ];
      case "influence":
        return [
          { icon: Crown, label: "Avg Score", value: Math.round(architectInfluenceData.reduce((s, a) => s + a.influenceScore, 0) / architectInfluenceData.length).toString() },
          { icon: MessageSquare, label: "Enquiries", value: architectInfluenceData.reduce((s, a) => s + a.metrics.enquiriesGenerated, 0).toString() },
        ];
      case "specifications":
      case "spec-detail":
        return [
          { icon: ClipboardList, label: "Specs", value: specifications.length.toString(), sub: `${specifications.filter(s => s.status === "approved").length} approved` },
          { icon: Package, label: "Items", value: specifications.reduce((s, sp) => s + sp.rooms.reduce((rs, r) => rs + r.items.length, 0), 0).toString() },
        ];
      case "products":
      case "product-detail":
        return [
          { icon: TrendingUp, label: "Surging", value: productMomentumData.filter(p => p.trend === "surging").length.toString() },
          { icon: TrendingDown, label: "Cooling", value: productMomentumData.filter(p => p.trend === "cooling").length.toString() },
        ];
      default:
        return [
          { icon: Activity, label: "Active", value: `${productMomentumData.length}`, sub: "products tracked" },
        ];
    }
  }, [context, entityId, projectWorkflow]);

  // Project detail panel tabs
  const projectPanelTabs = [
    { key: "overview", label: "Overview" },
    { key: "products", label: "Products" },
    { key: "gaps", label: "Gaps" },
    { key: "insights", label: "Insights" },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-foreground px-4 py-3 text-white shadow-2xl hover:opacity-90 transition-all group"
      >
        <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
        <span className="text-[13px] font-semibold">AI Copilot</span>
        {insights.filter(i => i.type === "warning" || i.type === "action").length > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose text-[10px] font-bold">
            {insights.filter(i => i.type === "warning" || i.type === "action").length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-[340px] border-l border-border bg-white shadow-2xl flex flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-border px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground">
              <Sparkles size={14} className="text-white" />
            </div>
            <div>
              <h2 className="text-[13px] font-semibold">AI Copilot</h2>
              <p className="text-[10px] text-muted">Intelligent Design Assistant</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="rounded-lg p-1.5 hover:bg-surface transition-colors">
            <X size={16} className="text-muted" />
          </button>
        </div>
        {/* Context indicator */}
        <div className="flex items-center gap-1.5 rounded-lg bg-surface px-2.5 py-1.5">
          <ContextIcon size={12} className="text-muted" />
          <span className="text-[11px] font-medium text-muted">Analyzing:</span>
          <span className="text-[11px] font-semibold">{contextInfo.label}</span>
          <div className="ml-auto flex h-1.5 w-1.5 items-center justify-center">
            <span className="absolute h-1.5 w-1.5 animate-ping rounded-full bg-emerald opacity-75" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-emerald" />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="shrink-0 px-4 py-3 border-b border-border">
        <div className={`grid gap-2 ${quickStats.length > 2 ? "grid-cols-4" : quickStats.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
          {quickStats.map(stat => <QuickStat key={stat.label} {...stat} />)}
        </div>
      </div>

      {/* Panel Tabs (for project-detail) */}
      {context === "project-detail" && projectWorkflow && (
        <div className="shrink-0 px-4 pt-2 pb-0 border-b border-border">
          <div className="flex items-center gap-0">
            {projectPanelTabs.map(tab => (
              <button key={tab.key} onClick={() => setActivePanel(tab.key)}
                className={`relative px-3 py-2 text-[10px] font-semibold transition-colors ${
                  activePanel === tab.key ? "text-foreground" : "text-muted hover:text-foreground"
                }`}>
                {tab.label}
                {activePanel === tab.key && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {/* ── Project Detail: Overview Panel ── */}
        {context === "project-detail" && projectWorkflow && activePanel === "overview" && (
          <div className="space-y-3">
            <SpecCompletenessGauge data={projectWorkflow.specCompleteness} />
            <CostBreakdownPanel data={projectWorkflow.costEstimate} />
            <ArchitectFitPanel data={projectWorkflow.architectFit} />
          </div>
        )}

        {/* ── Project Detail: Products Panel ── */}
        {context === "project-detail" && projectWorkflow && activePanel === "products" && (
          <div className="space-y-3">
            <SuggestedProductsPanel products={projectWorkflow.suggestedProducts} />

            {/* Momentum of tagged products */}
            <div className="rounded-xl border border-border bg-white p-3.5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={12} className="text-muted" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">Tagged Product Momentum</span>
              </div>
              <div className="space-y-1.5">
                {(() => {
                  const proj = projects.find(p => p.id === entityId);
                  if (!proj) return null;
                  const tagged = proj.products.map(pid => {
                    const p = products.find(pr => pr.id === pid);
                    const m = productMomentumData.find(pm => pm.productId === pid);
                    return { id: pid, name: p?.name || "", brand: p?.brand || "", momentum: m?.momentumScore || 0, trend: m?.trend || "steady" };
                  }).sort((a, b) => b.momentum - a.momentum);

                  return tagged.map(p => {
                    const trendColor = p.trend === "surging" ? "text-emerald" :
                      p.trend === "rising" ? "text-blue" :
                      p.trend === "cooling" ? "text-rose" : "text-muted";
                    return (
                      <div key={p.id} className="flex items-center justify-between py-1">
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-medium truncate">{p.name}</p>
                          <p className="text-[8px] text-muted">{p.brand}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`rounded px-1 py-0.5 text-[8px] font-semibold ${
                            p.trend === "surging" ? "bg-emerald-light text-emerald" :
                            p.trend === "rising" ? "bg-blue-light text-blue" :
                            p.trend === "cooling" ? "bg-rose-light text-rose" : "bg-surface text-muted"
                          }`}>{p.trend}</span>
                          <span className={`text-[11px] font-bold ${trendColor}`}>{p.momentum || "—"}</span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}

        {/* ── Project Detail: Gaps Panel ── */}
        {context === "project-detail" && projectWorkflow && activePanel === "gaps" && (
          <div className="space-y-3">
            <MissingRoomsPanel rooms={projectWorkflow.missingRooms} />
            <MissingCategoriesPanel categories={projectWorkflow.missingCategories} />
          </div>
        )}

        {/* ── Insights Panel (default or insights tab) ── */}
        {(activePanel === "insights" || !(context === "project-detail" && projectWorkflow)) && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">
                Insights & Recommendations
              </p>
              <span className="text-[10px] font-semibold text-muted">{insights.length}</span>
            </div>
            <div className="space-y-2">
              {insights.map(insight => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  expanded={expandedInsight === insight.id}
                  onToggle={() => setExpandedInsight(expandedInsight === insight.id ? null : insight.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-border px-4 py-3">
        <div className="flex items-center gap-2 text-[10px] text-muted">
          <Sparkles size={10} />
          <span>Context-aware · Updates on navigation</span>
        </div>
      </div>
    </div>
  );
}
