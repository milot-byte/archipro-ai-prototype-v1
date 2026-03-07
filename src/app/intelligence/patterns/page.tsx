"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Layers, Package, Users, Building2, FolderKanban, TrendingUp,
  TrendingDown, ChevronDown, ChevronUp, ArrowRight, Grid3X3,
  Home, Sparkles, BarChart3, Network, Zap, Eye, Star,
  Filter, ArrowUpRight, Minus,
} from "lucide-react";
import { products, architects, brands, projects } from "@/lib/mock-data";
import {
  productMomentumData, architectInfluenceData, specifications, designBoards,
} from "@/lib/intelligence-data";

// ─── Computed Intelligence Data ─────────────────────────────────────────────

// 1. Product Combinations — which products co-occur in projects
interface ProductCombo {
  products: [string, string];
  productNames: [string, string];
  brands: [string, string];
  coOccurrences: number;
  projects: string[];
  strength: number; // 0-1 normalized
  categories: [string, string];
}

function computeProductCombinations(): ProductCombo[] {
  const combos = new Map<string, ProductCombo>();

  projects.forEach(proj => {
    const pids = proj.products;
    for (let i = 0; i < pids.length; i++) {
      for (let j = i + 1; j < pids.length; j++) {
        const key = [pids[i], pids[j]].sort().join("|");
        const p1 = products.find(p => p.id === pids[i]);
        const p2 = products.find(p => p.id === pids[j]);
        if (!p1 || !p2) continue;

        const existing = combos.get(key);
        if (existing) {
          existing.coOccurrences++;
          existing.projects.push(proj.id);
        } else {
          combos.set(key, {
            products: [pids[i], pids[j]],
            productNames: [p1.name, p2.name],
            brands: [p1.brand, p2.brand],
            coOccurrences: 1,
            projects: [proj.id],
            strength: 0,
            categories: [p1.category, p2.category],
          });
        }
      }
    }
  });

  // Also count from design boards
  designBoards.forEach(board => {
    const pids = board.productIds;
    for (let i = 0; i < pids.length; i++) {
      for (let j = i + 1; j < pids.length; j++) {
        const key = [pids[i], pids[j]].sort().join("|");
        const existing = combos.get(key);
        if (existing) existing.coOccurrences++;
      }
    }
  });

  const all = Array.from(combos.values());
  const maxCoOccur = Math.max(...all.map(c => c.coOccurrences), 1);
  all.forEach(c => { c.strength = c.coOccurrences / maxCoOccur; });
  return all.sort((a, b) => b.coOccurrences - a.coOccurrences);
}

// 2. Architect Material Preferences
interface ArchitectPreference {
  architectId: string;
  name: string;
  firm: string;
  tier: string;
  categories: { category: string; count: number; pct: number; products: string[] }[];
  topBrands: { brand: string; count: number }[];
  totalProducts: number;
}

function computeArchitectPreferences(): ArchitectPreference[] {
  return architects.map(arch => {
    const archProjects = projects.filter(p => p.architectId === arch.id);
    const archProductIds = [...new Set(archProjects.flatMap(p => p.products))];
    const archProducts = archProductIds.map(pid => products.find(p => p.id === pid)).filter(Boolean) as typeof products;

    // Board products too
    const archBoards = designBoards.filter(b =>
      archProjects.some(p => p.id === b.projectId) ||
      b.owner.name === arch.name
    );
    const boardProductIds = [...new Set(archBoards.flatMap(b => b.productIds))];
    boardProductIds.forEach(pid => {
      if (!archProductIds.includes(pid)) {
        const p = products.find(pr => pr.id === pid);
        if (p) archProducts.push(p);
        archProductIds.push(pid);
      }
    });

    // Category breakdown
    const catMap = new Map<string, { count: number; products: string[] }>();
    archProducts.forEach(p => {
      const existing = catMap.get(p.category);
      if (existing) { existing.count++; existing.products.push(p.name); }
      else catMap.set(p.category, { count: 1, products: [p.name] });
    });
    const categories = Array.from(catMap.entries())
      .map(([category, v]) => ({
        category,
        count: v.count,
        pct: archProducts.length > 0 ? Math.round((v.count / archProducts.length) * 100) : 0,
        products: v.products,
      }))
      .sort((a, b) => b.count - a.count);

    // Brand preferences
    const brandMap = new Map<string, number>();
    archProducts.forEach(p => brandMap.set(p.brand, (brandMap.get(p.brand) || 0) + 1));
    const topBrands = Array.from(brandMap.entries())
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => b.count - a.count);

    const influence = architectInfluenceData.find(a => a.architectId === arch.id);

    return {
      architectId: arch.id,
      name: arch.name,
      firm: arch.firm,
      tier: influence?.tier || "—",
      categories,
      topBrands,
      totalProducts: archProducts.length,
    };
  });
}

// 3. Product Pairings by Category
interface CategoryPairing {
  category1: string;
  category2: string;
  pairCount: number;
  topPair: { p1: string; p2: string };
  strength: number;
}

function computeCategoryPairings(): CategoryPairing[] {
  const pairMap = new Map<string, { count: number; pairs: { p1: string; p2: string }[] }>();

  projects.forEach(proj => {
    const projProducts = proj.products.map(pid => products.find(p => p.id === pid)).filter(Boolean) as typeof products;
    for (let i = 0; i < projProducts.length; i++) {
      for (let j = i + 1; j < projProducts.length; j++) {
        if (projProducts[i].category === projProducts[j].category) continue;
        const cats = [projProducts[i].category, projProducts[j].category].sort();
        const key = cats.join("|");
        const existing = pairMap.get(key);
        if (existing) {
          existing.count++;
          existing.pairs.push({ p1: projProducts[i].name, p2: projProducts[j].name });
        } else {
          pairMap.set(key, { count: 1, pairs: [{ p1: projProducts[i].name, p2: projProducts[j].name }] });
        }
      }
    }
  });

  const maxCount = Math.max(...Array.from(pairMap.values()).map(v => v.count), 1);
  return Array.from(pairMap.entries()).map(([key, v]) => {
    const [c1, c2] = key.split("|");
    return {
      category1: c1,
      category2: c2,
      pairCount: v.count,
      topPair: v.pairs[0],
      strength: v.count / maxCount,
    };
  }).sort((a, b) => b.pairCount - a.pairCount);
}

// 4. Room-level Product Usage Patterns
interface RoomPattern {
  room: string;
  avgItems: number;
  categories: { category: string; count: number; pct: number }[];
  topProducts: { name: string; brand: string; count: number }[];
  totalSpecified: number;
  projects: string[];
}

function computeRoomPatterns(): RoomPattern[] {
  const roomMap = new Map<string, {
    items: number[];
    categories: Map<string, number>;
    products: Map<string, { name: string; brand: string; count: number }>;
    projects: string[];
  }>();

  specifications.forEach(spec => {
    spec.rooms.forEach(room => {
      const existing = roomMap.get(room.name) || {
        items: [] as number[],
        categories: new Map<string, number>(),
        products: new Map<string, { name: string; brand: string; count: number }>(),
        projects: [] as string[],
      };

      existing.items.push(room.items.length);
      existing.projects.push(spec.projectId);

      room.items.forEach(item => {
        existing.categories.set(item.category, (existing.categories.get(item.category) || 0) + 1);
        const pKey = item.productId;
        const existingProduct = existing.products.get(pKey);
        if (existingProduct) existingProduct.count++;
        else existing.products.set(pKey, { name: item.productName, brand: item.brand, count: 1 });
      });

      roomMap.set(room.name, existing);
    });
  });

  return Array.from(roomMap.entries()).map(([room, data]) => {
    const totalItems = data.items.reduce((s, v) => s + v, 0);
    const totalCats = Array.from(data.categories.values()).reduce((s, v) => s + v, 0);

    return {
      room,
      avgItems: data.items.length > 0 ? Math.round((totalItems / data.items.length) * 10) / 10 : 0,
      categories: Array.from(data.categories.entries())
        .map(([category, count]) => ({ category, count, pct: Math.round((count / totalCats) * 100) }))
        .sort((a, b) => b.count - a.count),
      topProducts: Array.from(data.products.values()).sort((a, b) => b.count - a.count),
      totalSpecified: totalItems,
      projects: [...new Set(data.projects)],
    };
  }).sort((a, b) => b.totalSpecified - a.totalSpecified);
}

// 5. Emerging Design Trends
interface DesignTrend {
  name: string;
  type: "style" | "material" | "product" | "category";
  momentum: number;
  direction: "surging" | "rising" | "stable" | "declining";
  evidence: string[];
  relatedProducts: { name: string; momentum: number }[];
  adoptionRate: number; // % of projects
}

function computeDesignTrends(): DesignTrend[] {
  const trends: DesignTrend[] = [];

  // Style trends from project tags
  const tagCounts = new Map<string, { count: number; projects: string[] }>();
  projects.forEach(proj => {
    proj.tags.forEach(tag => {
      const existing = tagCounts.get(tag);
      if (existing) { existing.count++; existing.projects.push(proj.title); }
      else tagCounts.set(tag, { count: 1, projects: [proj.title] });
    });
  });

  tagCounts.forEach((data, tag) => {
    trends.push({
      name: tag,
      type: "style",
      momentum: Math.round((data.count / projects.length) * 100),
      direction: data.count >= 3 ? "surging" : data.count >= 2 ? "rising" : "stable",
      evidence: data.projects,
      relatedProducts: [],
      adoptionRate: Math.round((data.count / projects.length) * 100),
    });
  });

  // Category trends from momentum data
  const categoryMomentum = new Map<string, { total: number; count: number; products: { name: string; momentum: number }[] }>();
  productMomentumData.forEach(pm => {
    const product = products.find(p => p.id === pm.productId);
    if (!product) return;
    const existing = categoryMomentum.get(product.category);
    if (existing) {
      existing.total += pm.momentumScore;
      existing.count++;
      existing.products.push({ name: pm.productName, momentum: pm.momentumScore });
    } else {
      categoryMomentum.set(product.category, {
        total: pm.momentumScore,
        count: 1,
        products: [{ name: pm.productName, momentum: pm.momentumScore }],
      });
    }
  });

  categoryMomentum.forEach((data, category) => {
    const avgMomentum = Math.round(data.total / data.count);
    trends.push({
      name: category,
      type: "category",
      momentum: avgMomentum,
      direction: avgMomentum >= 80 ? "surging" : avgMomentum >= 65 ? "rising" : avgMomentum >= 50 ? "stable" : "declining",
      evidence: data.products.map(p => `${p.name} (${p.momentum})`),
      relatedProducts: data.products.sort((a, b) => b.momentum - a.momentum),
      adoptionRate: Math.round((data.count / productMomentumData.length) * 100),
    });
  });

  // Material trends — surging products
  productMomentumData.filter(pm => pm.trend === "surging" || pm.trend === "rising").forEach(pm => {
    trends.push({
      name: pm.productName,
      type: "product",
      momentum: pm.momentumScore,
      direction: pm.trend === "surging" ? "surging" : "rising",
      evidence: [`+${pm.metrics.viewsGrowth}% views`, `+${pm.metrics.savesGrowth}% saves`, `${pm.savedByArchitects.length} architects`],
      relatedProducts: [{ name: pm.productName, momentum: pm.momentumScore }],
      adoptionRate: Math.round((pm.taggedInProjects.length / projects.length) * 100),
    });
  });

  return trends.sort((a, b) => b.momentum - a.momentum);
}

// 6. Category Penetration Across Firms
interface FirmPenetration {
  category: string;
  firms: { name: string; architectId: string; penetration: number; products: number }[];
  avgPenetration: number;
  topFirm: string;
}

function computeCategoryPenetration(): FirmPenetration[] {
  const allCategories = [...new Set(products.map(p => p.category))];

  return allCategories.map(category => {
    const categoryProducts = products.filter(p => p.category === category);
    const firms = architects.map(arch => {
      const archProjects = projects.filter(p => p.architectId === arch.id);
      const archProductIds = new Set(archProjects.flatMap(p => p.products));
      const catProductsUsed = categoryProducts.filter(p => archProductIds.has(p.id));
      const penetration = categoryProducts.length > 0 ? Math.round((catProductsUsed.length / categoryProducts.length) * 100) : 0;
      return { name: arch.firm, architectId: arch.id, penetration, products: catProductsUsed.length };
    });

    const avgPenetration = firms.length > 0 ? Math.round(firms.reduce((s, f) => s + f.penetration, 0) / firms.length) : 0;
    const topFirm = firms.sort((a, b) => b.penetration - a.penetration)[0]?.name || "—";

    return { category, firms, avgPenetration, topFirm };
  }).sort((a, b) => b.avgPenetration - a.avgPenetration);
}

// ─── Network Graph for Product Relationships ────────────────────────────────

function ProductNetworkGraph({ combos }: { combos: ProductCombo[] }) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Build nodes from all unique products in combos
  const nodeSet = new Set<string>();
  combos.slice(0, 12).forEach(c => { nodeSet.add(c.products[0]); nodeSet.add(c.products[1]); });

  const nodes = Array.from(nodeSet).map((pid, i) => {
    const p = products.find(pr => pr.id === pid);
    const momentum = productMomentumData.find(m => m.productId === pid);
    const angle = (i / nodeSet.size) * Math.PI * 2 - Math.PI / 2;
    const radius = 160;
    return {
      id: pid,
      label: p?.name.split(" ").slice(0, 3).join(" ") || pid,
      category: p?.category || "",
      x: 240 + Math.cos(angle) * radius,
      y: 200 + Math.sin(angle) * radius,
      size: momentum ? 10 + momentum.momentumScore * 0.2 : 14,
      momentum: momentum?.momentumScore || 0,
    };
  });

  const edges = combos.slice(0, 12).map(c => {
    const source = nodes.find(n => n.id === c.products[0]);
    const target = nodes.find(n => n.id === c.products[1]);
    if (!source || !target) return null;
    return { source, target, strength: c.strength, count: c.coOccurrences };
  }).filter(Boolean) as { source: typeof nodes[0]; target: typeof nodes[0]; strength: number; count: number }[];

  const categoryColors: Record<string, string> = {
    Hardware: "#0a0a0a", Lighting: "#f59e0b", Surfaces: "#3b82f6",
    Furniture: "#10b981", Roofing: "#6b7280", Decking: "#8b5cf6",
    Kitchen: "#ef4444", Outdoor: "#06b6d4",
  };

  return (
    <svg viewBox="0 0 480 400" className="w-full">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Edges */}
      {edges.map((e, i) => (
        <line key={i}
          x1={e.source.x} y1={e.source.y} x2={e.target.x} y2={e.target.y}
          stroke={hoveredNode && (hoveredNode === e.source.id || hoveredNode === e.target.id) ? "#0a0a0a" : "#e5e5e5"}
          strokeWidth={1 + e.strength * 3}
          strokeOpacity={hoveredNode ? (hoveredNode === e.source.id || hoveredNode === e.target.id ? 0.8 : 0.1) : 0.4}
        />
      ))}

      {/* Edge labels */}
      {edges.filter(e => e.count >= 2).map((e, i) => (
        <text key={`label-${i}`}
          x={(e.source.x + e.target.x) / 2}
          y={(e.source.y + e.target.y) / 2 - 4}
          textAnchor="middle"
          className="text-[8px] font-semibold"
          fill="#737373"
          opacity={hoveredNode ? (hoveredNode === e.source.id || hoveredNode === e.target.id ? 1 : 0) : 0.6}
        >
          {e.count}×
        </text>
      ))}

      {/* Nodes */}
      {nodes.map(node => (
        <g key={node.id}
          onMouseEnter={() => setHoveredNode(node.id)}
          onMouseLeave={() => setHoveredNode(null)}
          className="cursor-pointer"
        >
          <circle
            cx={node.x} cy={node.y} r={node.size}
            fill={categoryColors[node.category] || "#737373"}
            opacity={hoveredNode ? (hoveredNode === node.id ? 1 : 0.3) : 0.85}
            filter={hoveredNode === node.id ? "url(#glow)" : undefined}
          />
          <text
            x={node.x} y={node.y + node.size + 12}
            textAnchor="middle"
            className="text-[9px] font-medium"
            fill={hoveredNode === node.id ? "#0a0a0a" : "#737373"}
          >
            {node.label}
          </text>
          {hoveredNode === node.id && node.momentum > 0 && (
            <text
              x={node.x} y={node.y + node.size + 22}
              textAnchor="middle"
              className="text-[8px] font-bold"
              fill="#10b981"
            >
              Score {node.momentum}
            </text>
          )}
        </g>
      ))}

      {/* Legend */}
      {Object.entries(categoryColors).slice(0, 6).map(([cat, color], i) => (
        <g key={cat} transform={`translate(10, ${10 + i * 16})`}>
          <circle cx={5} cy={5} r={4} fill={color} />
          <text x={14} y={9} className="text-[8px]" fill="#737373">{cat}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── Category Pairing Heatmap ───────────────────────────────────────────────

function CategoryHeatmap({ pairings }: { pairings: CategoryPairing[] }) {
  const categories = [...new Set([
    ...pairings.map(p => p.category1),
    ...pairings.map(p => p.category2),
  ])].sort();

  const getStrength = (c1: string, c2: string): number => {
    if (c1 === c2) return 0;
    const pair = pairings.find(p =>
      (p.category1 === c1 && p.category2 === c2) ||
      (p.category1 === c2 && p.category2 === c1)
    );
    return pair?.strength || 0;
  };

  const getCount = (c1: string, c2: string): number => {
    const pair = pairings.find(p =>
      (p.category1 === c1 && p.category2 === c2) ||
      (p.category1 === c2 && p.category2 === c1)
    );
    return pair?.pairCount || 0;
  };

  const cellSize = 52;

  return (
    <div className="overflow-x-auto">
      <table className="border-collapse">
        <thead>
          <tr>
            <th className="p-0 w-20" />
            {categories.map(c => (
              <th key={c} className="p-1 text-center">
                <span className="text-[9px] font-semibold text-muted writing-mode-vertical" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                  {c}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map(row => (
            <tr key={row}>
              <td className="pr-2 text-right">
                <span className="text-[10px] font-medium text-muted">{row}</span>
              </td>
              {categories.map(col => {
                const strength = getStrength(row, col);
                const count = getCount(row, col);
                const opacity = row === col ? 0 : Math.max(0.05, strength);
                return (
                  <td key={col} className="p-0.5">
                    <div
                      className="flex items-center justify-center rounded"
                      style={{
                        width: cellSize,
                        height: cellSize / 1.5,
                        backgroundColor: row === col ? "#fafafa" : `rgba(10, 10, 10, ${opacity})`,
                      }}
                      title={row === col ? "" : `${row} × ${col}: ${count} co-occurrences`}
                    >
                      {count > 0 && (
                        <span className={`text-[10px] font-bold ${strength > 0.5 ? "text-white" : "text-muted"}`}>
                          {count}
                        </span>
                      )}
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

// ─── Trend Sparkline ────────────────────────────────────────────────────────

function TrendSparkline({ data, color = "#0a0a0a", width = 80, height = 24 }: { data: number[]; color?: string; width?: number; height?: number }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(data.length - 1) / (data.length - 1) * width} cy={height - ((data[data.length - 1] - min) / range) * height} r="2" fill={color} />
    </svg>
  );
}

// ─── Penetration Heatmap ────────────────────────────────────────────────────

function PenetrationHeatmap({ data }: { data: FirmPenetration[] }) {
  const firms = architects.map(a => a.firm);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted">Category</th>
            {firms.map(f => (
              <th key={f} className="px-2 py-2 text-center">
                <span className="text-[9px] font-semibold text-muted">{f.split(" ")[0]}</span>
              </th>
            ))}
            <th className="px-2 py-2 text-center text-[9px] font-semibold text-muted">Avg</th>
          </tr>
        </thead>
        <tbody>
          {data.map(cat => (
            <tr key={cat.category} className="border-t border-border">
              <td className="px-3 py-2.5">
                <span className="text-[11px] font-medium">{cat.category}</span>
              </td>
              {firms.map(firmName => {
                const firm = cat.firms.find(f => f.name === firmName);
                const penetration = firm?.penetration || 0;
                const opacity = Math.max(0.03, penetration / 100);
                return (
                  <td key={firmName} className="px-1 py-1.5 text-center">
                    <div
                      className="mx-auto flex items-center justify-center rounded"
                      style={{
                        width: 44, height: 28,
                        backgroundColor: penetration > 0 ? `rgba(10, 10, 10, ${opacity})` : "#fafafa",
                      }}
                    >
                      <span className={`text-[10px] font-bold ${penetration > 50 ? "text-white" : "text-muted"}`}>
                        {penetration > 0 ? `${penetration}%` : "—"}
                      </span>
                    </div>
                  </td>
                );
              })}
              <td className="px-2 py-1.5 text-center">
                <span className={`text-[11px] font-bold ${cat.avgPenetration >= 30 ? "text-foreground" : "text-muted"}`}>
                  {cat.avgPenetration}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Page Component ────────────────────────────────────────────────────

export default function DesignPatternIntelligencePage() {
  const [activeSection, setActiveSection] = useState<string>("combinations");
  const [expandedTrend, setExpandedTrend] = useState<string | null>(null);
  const [expandedArch, setExpandedArch] = useState<string | null>(null);
  const [sortComboBy, setSortComboBy] = useState<"frequency" | "strength">("frequency");

  const productCombos = useMemo(() => computeProductCombinations(), []);
  const architectPrefs = useMemo(() => computeArchitectPreferences(), []);
  const categoryPairings = useMemo(() => computeCategoryPairings(), []);
  const roomPatterns = useMemo(() => computeRoomPatterns(), []);
  const designTrends = useMemo(() => computeDesignTrends(), []);
  const categoryPenetration = useMemo(() => computeCategoryPenetration(), []);

  const sections = [
    { key: "combinations", label: "Product Combinations", icon: Network },
    { key: "preferences", label: "Material Preferences", icon: Users },
    { key: "pairings", label: "Category Pairings", icon: Grid3X3 },
    { key: "rooms", label: "Room Patterns", icon: Home },
    { key: "trends", label: "Design Trends", icon: TrendingUp },
    { key: "penetration", label: "Category Penetration", icon: BarChart3 },
  ];

  // Summary KPIs
  const totalCombos = productCombos.length;
  const strongCombos = productCombos.filter(c => c.coOccurrences >= 2).length;
  const surgingTrends = designTrends.filter(t => t.direction === "surging").length;
  const avgPenetration = Math.round(categoryPenetration.reduce((s, c) => s + c.avgPenetration, 0) / categoryPenetration.length);
  const totalRoomPatterns = roomPatterns.length;
  const uniqueCategories = [...new Set(products.map(p => p.category))].length;

  return (
    <div className="min-h-screen bg-surface/50">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="px-8 py-6">
          <div className="flex items-center gap-2 text-[11px] text-muted mb-3">
            <Link href="/" className="hover:text-foreground transition-colors">Intelligence</Link>
            <ArrowRight size={10} />
            <span className="text-foreground font-medium">Design Patterns</span>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-[24px] font-semibold tracking-tight">Design Pattern Intelligence</h1>
                  <p className="text-[13px] text-muted">Analyzing {projects.length} projects · {products.length} products · {architects.length} architects · {specifications.length} specifications</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Row */}
        <div className="px-8 pb-5">
          <div className="grid grid-cols-6 gap-3">
            {[
              { label: "Product Combos", value: totalCombos.toString(), sub: `${strongCombos} strong`, icon: Network },
              { label: "Category Pairs", value: categoryPairings.length.toString(), sub: `${uniqueCategories} categories`, icon: Grid3X3 },
              { label: "Room Patterns", value: totalRoomPatterns.toString(), sub: `${specifications.reduce((s, sp) => s + sp.rooms.length, 0)} rooms analyzed`, icon: Home },
              { label: "Surging Trends", value: surgingTrends.toString(), sub: `${designTrends.length} total`, icon: TrendingUp },
              { label: "Avg Penetration", value: `${avgPenetration}%`, sub: `${architects.length} firms`, icon: BarChart3 },
              { label: "Architects", value: architects.length.toString(), sub: `${architectInfluenceData.filter(a => a.tier === "Platinum").length} platinum`, icon: Users },
            ].map(kpi => (
              <div key={kpi.label} className="rounded-xl border border-border bg-white p-3.5">
                <div className="flex items-center gap-1.5 mb-2">
                  <kpi.icon size={12} className="text-muted" />
                  <span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">{kpi.label}</span>
                </div>
                <p className="text-[20px] font-bold tracking-tight">{kpi.value}</p>
                <p className="text-[10px] text-muted mt-0.5">{kpi.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section Tabs */}
        <div className="px-8">
          <div className="flex items-center gap-0 overflow-x-auto">
            {sections.map(s => {
              const Icon = s.icon;
              return (
                <button key={s.key} onClick={() => setActiveSection(s.key)}
                  className={`relative flex items-center gap-1.5 px-4 py-3 text-[12px] font-medium transition-colors whitespace-nowrap ${
                    activeSection === s.key ? "text-foreground" : "text-muted hover:text-foreground"
                  }`}>
                  <Icon size={13} />
                  {s.label}
                  {activeSection === s.key && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* ── 1. Product Combinations ── */}
        {activeSection === "combinations" && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-5">
              {/* Network Graph */}
              <div className="lg:col-span-3 rounded-2xl border border-border bg-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-[14px] font-semibold">Product Relationship Network</h3>
                    <p className="text-[11px] text-muted mt-0.5">Products that co-occur in projects and boards. Edge thickness = co-occurrence frequency.</p>
                  </div>
                </div>
                <ProductNetworkGraph combos={productCombos} />
              </div>

              {/* Combo Rankings */}
              <div className="lg:col-span-2 rounded-2xl border border-border bg-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[14px] font-semibold">Top Product Combinations</h3>
                  <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
                    <button onClick={() => setSortComboBy("frequency")}
                      className={`rounded px-2 py-0.5 text-[10px] font-medium ${sortComboBy === "frequency" ? "bg-foreground text-white" : "text-muted"}`}>
                      Frequency
                    </button>
                    <button onClick={() => setSortComboBy("strength")}
                      className={`rounded px-2 py-0.5 text-[10px] font-medium ${sortComboBy === "strength" ? "bg-foreground text-white" : "text-muted"}`}>
                      Strength
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {productCombos
                    .sort((a, b) => sortComboBy === "frequency" ? b.coOccurrences - a.coOccurrences : b.strength - a.strength)
                    .slice(0, 10)
                    .map((combo, i) => (
                    <div key={i} className="rounded-xl border border-border p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface text-[9px] font-bold text-muted">{i + 1}</span>
                          <span className="text-[10px] font-semibold">{combo.coOccurrences}× paired</span>
                        </div>
                        <div className="h-1.5 w-16 rounded-full bg-surface overflow-hidden">
                          <div className="h-full bg-foreground rounded-full" style={{ width: `${combo.strength * 100}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium truncate">{combo.productNames[0]}</p>
                          <p className="text-[9px] text-muted">{combo.brands[0]} · {combo.categories[0]}</p>
                        </div>
                        <div className="shrink-0 flex h-5 w-5 items-center justify-center">
                          <Zap size={10} className="text-amber" />
                        </div>
                        <div className="flex-1 min-w-0 text-right">
                          <p className="text-[11px] font-medium truncate">{combo.productNames[1]}</p>
                          <p className="text-[9px] text-muted">{combo.brands[1]} · {combo.categories[1]}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-1.5">
                        {combo.projects.map(pid => {
                          const proj = projects.find(p => p.id === pid);
                          return proj ? (
                            <span key={pid} className="rounded px-1.5 py-0.5 text-[8px] font-medium bg-surface text-muted">{proj.title}</span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 2. Architect Material Preferences ── */}
        {activeSection === "preferences" && (
          <div className="space-y-4">
            {architectPrefs.map(arch => {
              const isExpanded = expandedArch === arch.architectId;
              const maxCat = Math.max(...arch.categories.map(c => c.count), 1);
              return (
                <div key={arch.architectId} className="rounded-2xl border border-border bg-white overflow-hidden">
                  <button onClick={() => setExpandedArch(isExpanded ? null : arch.architectId)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface/30 transition-colors text-left">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-surface flex items-center justify-center">
                        <span className="text-[10px] font-bold text-muted">{arch.name.split(" ").map(n => n[0]).join("")}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-[14px] font-semibold">{arch.name}</h3>
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                            arch.tier === "Platinum" ? "bg-foreground text-white" :
                            arch.tier === "Gold" ? "bg-amber-light text-amber" : "bg-surface text-muted"
                          }`}>{arch.tier}</span>
                        </div>
                        <p className="text-[11px] text-muted">{arch.firm} · {arch.totalProducts} products across {arch.categories.length} categories</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Mini category bar */}
                      <div className="hidden lg:flex items-center gap-0.5 h-4 w-40 rounded-full overflow-hidden bg-surface">
                        {arch.categories.map(c => (
                          <div key={c.category} className="h-full bg-foreground/50"
                            style={{ width: `${c.pct}%` }}
                            title={`${c.category}: ${c.pct}%`} />
                        ))}
                      </div>
                      {isExpanded ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="border-t border-border px-6 py-5">
                      <div className="grid gap-6 lg:grid-cols-2">
                        {/* Category breakdown */}
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted mb-3">Category Preferences</p>
                          <div className="space-y-2.5">
                            {arch.categories.map(cat => (
                              <div key={cat.category}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[11px] font-medium">{cat.category}</span>
                                  <span className="text-[11px] text-muted">{cat.count} products ({cat.pct}%)</span>
                                </div>
                                <div className="h-2 rounded-full bg-surface overflow-hidden">
                                  <div className="h-full bg-foreground/70 rounded-full transition-all" style={{ width: `${(cat.count / maxCat) * 100}%` }} />
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {cat.products.map(p => (
                                    <span key={p} className="text-[8px] text-muted">{p}</span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Brand preferences */}
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted mb-3">Brand Preferences</p>
                          <div className="space-y-2">
                            {arch.topBrands.map(b => (
                              <div key={b.brand} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                                <span className="text-[11px] font-medium">{b.brand}</span>
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-16 rounded-full bg-surface overflow-hidden">
                                    <div className="h-full bg-foreground/50 rounded-full" style={{ width: `${(b.count / arch.totalProducts) * 100}%` }} />
                                  </div>
                                  <span className="text-[10px] text-muted w-8 text-right">{b.count}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── 3. Category Pairings ── */}
        {activeSection === "pairings" && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Heatmap */}
              <div className="rounded-2xl border border-border bg-white p-6">
                <h3 className="text-[14px] font-semibold mb-1">Category Combination Matrix</h3>
                <p className="text-[11px] text-muted mb-5">Darker cells = more frequent co-occurrences in projects</p>
                <CategoryHeatmap pairings={categoryPairings} />
              </div>

              {/* Top pairings list */}
              <div className="rounded-2xl border border-border bg-white p-6">
                <h3 className="text-[14px] font-semibold mb-1">Most Common Category Pairings</h3>
                <p className="text-[11px] text-muted mb-5">Product categories that architects combine most often</p>
                <div className="space-y-3">
                  {categoryPairings.slice(0, 8).map((pair, i) => (
                    <div key={i} className="rounded-xl border border-border p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[9px] font-bold text-white">{i + 1}</span>
                          <span className="text-[12px] font-semibold">{pair.category1} × {pair.category2}</span>
                        </div>
                        <span className="text-[11px] font-semibold">{pair.pairCount}× paired</span>
                      </div>
                      <div className="h-2 rounded-full bg-surface overflow-hidden mb-2">
                        <div className="h-full bg-foreground/60 rounded-full" style={{ width: `${pair.strength * 100}%` }} />
                      </div>
                      <p className="text-[10px] text-muted">
                        Example: {pair.topPair.p1} + {pair.topPair.p2}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 4. Room Patterns ── */}
        {activeSection === "rooms" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {roomPatterns.map(room => (
                <div key={room.room} className="rounded-2xl border border-border bg-white p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Home size={14} className="text-muted" />
                      <h3 className="text-[14px] font-semibold">{room.room}</h3>
                    </div>
                    <span className="text-[10px] text-muted">{room.projects.length} project{room.projects.length !== 1 ? "s" : ""}</span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="rounded-lg bg-surface p-2">
                      <p className="text-[16px] font-bold">{room.avgItems}</p>
                      <p className="text-[9px] text-muted">Avg items</p>
                    </div>
                    <div className="rounded-lg bg-surface p-2">
                      <p className="text-[16px] font-bold">{room.totalSpecified}</p>
                      <p className="text-[9px] text-muted">Total specified</p>
                    </div>
                  </div>

                  {/* Category breakdown */}
                  <p className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted mb-2">Category Mix</p>
                  <div className="flex h-3 rounded-full overflow-hidden bg-surface mb-2">
                    {room.categories.map((cat, i) => {
                      const colors = ["bg-foreground", "bg-foreground/70", "bg-foreground/50", "bg-foreground/30", "bg-foreground/15"];
                      return (
                        <div key={cat.category}
                          className={`h-full ${colors[i] || colors[4]}`}
                          style={{ width: `${cat.pct}%` }}
                          title={`${cat.category}: ${cat.pct}%`} />
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {room.categories.map(cat => (
                      <span key={cat.category} className="text-[9px] text-muted">
                        {cat.category} {cat.pct}%
                      </span>
                    ))}
                  </div>

                  {/* Top products */}
                  <p className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted mb-2">Most Used Products</p>
                  <div className="space-y-1">
                    {room.topProducts.slice(0, 3).map(p => (
                      <div key={p.name} className="flex items-center justify-between py-1">
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-medium truncate">{p.name}</p>
                          <p className="text-[8px] text-muted">{p.brand}</p>
                        </div>
                        <span className="text-[10px] font-semibold shrink-0 ml-2">{p.count}×</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 5. Design Trends ── */}
        {activeSection === "trends" && (
          <div className="space-y-6">
            {/* Trend overview */}
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Surging */}
              <div className="rounded-2xl border border-border bg-white p-5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={14} className="text-emerald" />
                  <h3 className="text-[13px] font-semibold">Surging</h3>
                  <span className="ml-auto rounded-full bg-emerald-light px-2 py-0.5 text-[10px] font-semibold text-emerald">
                    {designTrends.filter(t => t.direction === "surging").length}
                  </span>
                </div>
                <div className="space-y-2">
                  {designTrends.filter(t => t.direction === "surging").map(t => (
                    <div key={t.name} className="rounded-lg border border-emerald/20 bg-emerald-light/20 p-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold">{t.name}</span>
                        <span className="text-[11px] font-bold text-emerald">{t.momentum}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded px-1 py-0.5 text-[8px] font-medium bg-surface text-muted">{t.type}</span>
                        <span className="text-[9px] text-muted">{t.adoptionRate}% adoption</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Rising */}
              <div className="rounded-2xl border border-border bg-white p-5">
                <div className="flex items-center gap-2 mb-3">
                  <ArrowUpRight size={14} className="text-blue" />
                  <h3 className="text-[13px] font-semibold">Rising</h3>
                  <span className="ml-auto rounded-full bg-blue-light px-2 py-0.5 text-[10px] font-semibold text-blue">
                    {designTrends.filter(t => t.direction === "rising").length}
                  </span>
                </div>
                <div className="space-y-2">
                  {designTrends.filter(t => t.direction === "rising").map(t => (
                    <div key={t.name} className="rounded-lg border border-blue/20 bg-blue-light/20 p-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold">{t.name}</span>
                        <span className="text-[11px] font-bold text-blue">{t.momentum}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded px-1 py-0.5 text-[8px] font-medium bg-surface text-muted">{t.type}</span>
                        <span className="text-[9px] text-muted">{t.adoptionRate}% adoption</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Stable / Declining */}
              <div className="rounded-2xl border border-border bg-white p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Minus size={14} className="text-muted" />
                  <h3 className="text-[13px] font-semibold">Stable & Declining</h3>
                  <span className="ml-auto rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold text-muted">
                    {designTrends.filter(t => t.direction === "stable" || t.direction === "declining").length}
                  </span>
                </div>
                <div className="space-y-2">
                  {designTrends.filter(t => t.direction === "stable" || t.direction === "declining").map(t => (
                    <div key={t.name} className="rounded-lg border border-border p-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold">{t.name}</span>
                        <span className={`text-[11px] font-bold ${t.direction === "declining" ? "text-rose" : "text-muted"}`}>{t.momentum}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded px-1 py-0.5 text-[8px] font-medium bg-surface text-muted">{t.type}</span>
                        <span className="text-[9px] text-muted">{t.adoptionRate}% adoption</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Detailed trend table */}
            <div className="rounded-2xl border border-border bg-white overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-[14px] font-semibold">All Design Trends</h3>
                <p className="text-[11px] text-muted mt-0.5">Comprehensive trend analysis across styles, categories, and products</p>
              </div>
              <table className="w-full table-premium">
                <thead>
                  <tr>
                    <th>Trend</th>
                    <th>Type</th>
                    <th>Direction</th>
                    <th className="text-right">Momentum</th>
                    <th className="text-right">Adoption</th>
                    <th>Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {designTrends.map(trend => (
                    <tr key={trend.name} className="cursor-pointer hover:bg-surface/30"
                      onClick={() => setExpandedTrend(expandedTrend === trend.name ? null : trend.name)}>
                      <td>
                        <span className="text-[12px] font-semibold">{trend.name}</span>
                      </td>
                      <td>
                        <span className="rounded px-1.5 py-0.5 text-[9px] font-semibold bg-surface text-muted capitalize">{trend.type}</span>
                      </td>
                      <td>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          trend.direction === "surging" ? "bg-emerald-light text-emerald" :
                          trend.direction === "rising" ? "bg-blue-light text-blue" :
                          trend.direction === "declining" ? "bg-rose-light text-rose" : "bg-surface text-muted"
                        }`}>
                          {trend.direction === "surging" ? <TrendingUp size={10} /> :
                           trend.direction === "rising" ? <ArrowUpRight size={10} /> :
                           trend.direction === "declining" ? <TrendingDown size={10} /> :
                           <Minus size={10} />}
                          {trend.direction}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className="text-[13px] font-bold">{trend.momentum}</span>
                      </td>
                      <td className="text-right">
                        <span className="text-[12px] font-medium">{trend.adoptionRate}%</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 max-w-[200px]">
                          {trend.evidence.slice(0, 2).map((e, i) => (
                            <span key={i} className="rounded px-1.5 py-0.5 text-[8px] bg-surface text-muted truncate">{e}</span>
                          ))}
                          {trend.evidence.length > 2 && (
                            <span className="text-[8px] text-muted">+{trend.evidence.length - 2}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── 6. Category Penetration ── */}
        {activeSection === "penetration" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-white p-6">
              <h3 className="text-[14px] font-semibold mb-1">Category Penetration Across Architecture Firms</h3>
              <p className="text-[11px] text-muted mb-5">What percentage of each product category is being used by each firm. Darker = higher penetration.</p>
              <PenetrationHeatmap data={categoryPenetration} />
            </div>

            {/* Category detail cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categoryPenetration.map(cat => (
                <div key={cat.category} className="rounded-2xl border border-border bg-white p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[13px] font-semibold">{cat.category}</h4>
                    <span className={`text-[12px] font-bold ${cat.avgPenetration >= 30 ? "text-emerald" : cat.avgPenetration >= 15 ? "text-amber" : "text-muted"}`}>
                      {cat.avgPenetration}%
                    </span>
                  </div>
                  <p className="text-[10px] text-muted mb-3">avg penetration</p>

                  <div className="space-y-2">
                    {cat.firms.sort((a, b) => b.penetration - a.penetration).map(firm => (
                      <div key={firm.name}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] font-medium truncate">{firm.name.split(" ")[0]}</span>
                          <span className="text-[10px] text-muted">{firm.penetration}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-surface overflow-hidden">
                          <div className="h-full bg-foreground/60 rounded-full" style={{ width: `${firm.penetration}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-2 border-t border-border">
                    <p className="text-[9px] text-muted">Top firm: <span className="font-semibold text-foreground">{cat.topFirm}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
