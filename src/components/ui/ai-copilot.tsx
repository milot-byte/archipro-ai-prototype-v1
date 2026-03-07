"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sparkles, X, ChevronRight, ChevronDown, ChevronUp, Package,
  Users, Building2, FolderKanban, ClipboardList, PenTool, TrendingUp,
  TrendingDown, ArrowUp, ArrowDown, ArrowRight, AlertTriangle,
  Lightbulb, Target, Eye, Heart, Download, Layers, Zap, BarChart3,
  Minus, Star, Shield, Activity, Crown, MessageSquare,
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

    case "projects":
    case "my-projects":
    case "discover":
    case "project-detail": {
      const proj = entityId ? projects.find(p => p.id === entityId) : null;
      if (proj) {
        const projProducts = products.filter(p => proj.products.includes(p.id));
        const projArch = architects.find(a => a.id === proj.architectId);
        const momentum = productMomentumData.filter(p => proj.products.includes(p.productId));
        const surgingInProj = momentum.filter(p => p.trend === "surging");
        return [
          {
            id: "pj-1", type: "recommendation", icon: Package,
            title: `${surgingInProj.length} surging product${surgingInProj.length !== 1 ? "s" : ""} in this project`,
            description: surgingInProj.map(p => `${p.productName} (score ${p.momentumScore})`).join(", ") || "No surging products — consider adding trending items.",
            confidence: 90,
            tags: surgingInProj.map(p => p.trend),
          },
          {
            id: "pj-2", type: "recommendation", icon: Users,
            title: "Similar architects for this style",
            description: `Based on ${proj.tags.join(", ")} — ${architects.filter(a => a.id !== proj.architectId).slice(0, 2).map(a => a.name).join(" and ")} have matching specialties.`,
            confidence: 82,
            actions: [{ label: "View architects", href: "/architects" }],
          },
          {
            id: "pj-3", type: "action", icon: ClipboardList,
            title: "Generate specification",
            description: `${projProducts.length} products tagged. Create a room-by-room specification from the product list.`,
            confidence: 95,
            actions: [{ label: "Create spec", href: "/specifications" }],
          },
          {
            id: "pj-4", type: "opportunity", icon: Lightbulb,
            title: "Recommended additions",
            description: `Projects with "${proj.tags[0]}" style commonly include ${products.filter(p => !proj.products.includes(p.id)).slice(0, 2).map(p => p.name).join(" and ")}.`,
            confidence: 74,
            actions: [{ label: "Browse products", href: "/products" }],
            tags: ["AI Suggestion"],
          },
        ];
      }
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
    }

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

// ─── Main Component ─────────────────────────────────────────────────────────

export function AICopilot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  const { context, entityId } = useMemo(() => detectPageContext(pathname), [pathname]);
  const contextInfo = contextLabels[context];
  const ContextIcon = contextInfo.icon;

  const insights = useMemo(() => generateInsights(context, entityId), [context, entityId]);

  // Auto-expand first insight
  useEffect(() => {
    if (insights.length > 0) setExpandedInsight(insights[0].id);
  }, [context, entityId]);

  // Quick stats based on context
  const quickStats = useMemo(() => {
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
  }, [context]);

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
        <div className={`grid gap-2 ${quickStats.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
          {quickStats.map(stat => <QuickStat key={stat.label} {...stat} />)}
        </div>
      </div>

      {/* Insights */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
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
