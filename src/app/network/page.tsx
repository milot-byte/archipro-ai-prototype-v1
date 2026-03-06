"use client";

import { useState, useRef, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { networkNodes, networkEdges, NetworkNode, NetworkEdge } from "@/lib/intelligence-data";
import { ZoomIn, ZoomOut, Maximize2, Filter } from "lucide-react";

const typeColors: Record<string, { fill: string; stroke: string; label: string }> = {
  project: { fill: "#0a0a0a", stroke: "#0a0a0a", label: "Projects" },
  architect: { fill: "#404040", stroke: "#404040", label: "Architects" },
  product: { fill: "#737373", stroke: "#737373", label: "Products" },
  brand: { fill: "#a3a3a3", stroke: "#a3a3a3", label: "Brands" },
  board: { fill: "#d4d4d4", stroke: "#d4d4d4", label: "Boards" },
};

const edgeTypeColors: Record<string, string> = {
  tagged_in: "#0a0a0a",
  saved_by: "#737373",
  specified_in: "#a3a3a3",
  supplied_by: "#d4d4d4",
  created_by: "#404040",
  enquired: "#b45309",
};

function NetworkGraph({
  nodes,
  edges,
  selectedNode,
  onSelectNode,
  zoom,
}: {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  selectedNode: string | null;
  onSelectNode: (id: string | null) => void;
  zoom: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Which nodes/edges are "active" based on selection
  const activeEdges = selectedNode
    ? edges.filter((e) => e.source === selectedNode || e.target === selectedNode)
    : edges;
  const activeNodeIds = selectedNode
    ? new Set([
        selectedNode,
        ...activeEdges.map((e) => e.source),
        ...activeEdges.map((e) => e.target),
      ])
    : null;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${960 / zoom} ${680 / zoom}`}
      className="w-full h-full"
      style={{ minHeight: 500 }}
      onClick={() => onSelectNode(null)}
    >
      {/* Edges */}
      {edges.map((edge, i) => {
        const source = nodes.find((n) => n.id === edge.source);
        const target = nodes.find((n) => n.id === edge.target);
        if (!source || !target) return null;

        const isActive = activeEdges.includes(edge);
        const opacity = selectedNode ? (isActive ? 0.6 : 0.05) : 0.2;

        return (
          <line
            key={i}
            x1={source.x / zoom}
            y1={source.y / zoom}
            x2={target.x / zoom}
            y2={target.y / zoom}
            stroke={edgeTypeColors[edge.type] || "#d4d4d4"}
            strokeWidth={edge.strength * 2.5}
            opacity={opacity}
            className="transition-opacity duration-300"
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((node) => {
        const isActive = !activeNodeIds || activeNodeIds.has(node.id);
        const isSelected = node.id === selectedNode;
        const opacity = selectedNode ? (isActive ? 1 : 0.15) : 1;

        return (
          <g
            key={node.id}
            className="cursor-pointer transition-opacity duration-300"
            opacity={opacity}
            onClick={(e) => {
              e.stopPropagation();
              onSelectNode(isSelected ? null : node.id);
            }}
          >
            <circle
              cx={node.x / zoom}
              cy={node.y / zoom}
              r={node.size / (2 * zoom)}
              fill={node.color}
              stroke={isSelected ? "#0a0a0a" : "white"}
              strokeWidth={isSelected ? 3 : 1.5}
            />
            {node.type === "product" && (
              <circle
                cx={node.x / zoom}
                cy={node.y / zoom}
                r={node.size / (2 * zoom) + 4}
                fill="none"
                stroke={node.color}
                strokeWidth={0.5}
                opacity={0.3}
              />
            )}
            <text
              x={node.x / zoom}
              y={node.y / zoom + node.size / (2 * zoom) + 12}
              textAnchor="middle"
              fontSize={10 / zoom > 8 ? 10 / zoom : 9}
              fill="#737373"
              fontWeight={isSelected ? 600 : 400}
              className="select-none"
            >
              {node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function NodeDetail({ nodeId, nodes, edges }: { nodeId: string; nodes: NetworkNode[]; edges: NetworkEdge[] }) {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return null;

  const connected = edges
    .filter((e) => e.source === nodeId || e.target === nodeId)
    .map((e) => {
      const otherId = e.source === nodeId ? e.target : e.source;
      const other = nodes.find((n) => n.id === otherId);
      return { ...e, other };
    })
    .filter((e) => e.other);

  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="h-4 w-4 rounded-full"
          style={{ backgroundColor: node.color }}
        />
        <div>
          <h3 className="text-sm font-semibold">{node.label}</h3>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
            {node.type}
          </p>
        </div>
      </div>
      <p className="text-xs text-muted mb-3">
        {connected.length} connections
      </p>
      <div className="space-y-1.5 max-h-64 overflow-y-auto">
        {connected.map((c, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg bg-card px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: c.other!.color }}
              />
              <span className="text-xs">{c.other!.label}</span>
            </div>
            <span className="text-[10px] text-muted capitalize">
              {c.type.replace(/_/g, " ")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NetworkPage() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [visibleTypes, setVisibleTypes] = useState<Set<string>>(
    new Set(["project", "architect", "product", "brand", "board"])
  );

  const filteredNodes = networkNodes.filter((n) => visibleTypes.has(n.type));
  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
  const filteredEdges = networkEdges.filter(
    (e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)
  );

  const toggleType = (type: string) => {
    const next = new Set(visibleTypes);
    if (next.has(type)) {
      if (next.size > 1) next.delete(type);
    } else {
      next.add(type);
    }
    setVisibleTypes(next);
  };

  return (
    <>
      <PageHeader
        title="Product Influence Network"
        subtitle="Visual map of connections between projects, architects, products, boards and brands."
      />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Controls sidebar */}
          <div className="space-y-6">
            {/* Zoom */}
            <div className="rounded-2xl border border-border bg-white p-5">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                Zoom
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                  className="rounded-lg bg-card p-2 hover:bg-foreground/10"
                >
                  <ZoomOut size={14} />
                </button>
                <div className="flex-1 text-center text-sm font-medium">
                  {Math.round(zoom * 100)}%
                </div>
                <button
                  onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                  className="rounded-lg bg-card p-2 hover:bg-foreground/10"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  onClick={() => setZoom(1)}
                  className="rounded-lg bg-card p-2 hover:bg-foreground/10"
                >
                  <Maximize2 size={14} />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="rounded-2xl border border-border bg-white p-5">
              <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                <Filter size={12} /> Node Types
              </h3>
              <div className="space-y-2">
                {Object.entries(typeColors).map(([type, config]) => (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                      visibleTypes.has(type) ? "bg-card" : "opacity-40"
                    }`}
                  >
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: config.fill }}
                    />
                    {config.label}
                    <span className="ml-auto text-muted">
                      {networkNodes.filter((n) => n.type === type).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="rounded-2xl border border-border bg-white p-5">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                Edge Types
              </h3>
              <div className="space-y-1.5">
                {Object.entries(edgeTypeColors).map(([type, color]) => (
                  <div key={type} className="flex items-center gap-2 text-xs">
                    <div className="h-0.5 w-6" style={{ backgroundColor: color }} />
                    <span className="text-muted capitalize">{type.replace(/_/g, " ")}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Detail */}
            {selectedNode && (
              <NodeDetail
                nodeId={selectedNode}
                nodes={filteredNodes}
                edges={filteredEdges}
              />
            )}
          </div>

          {/* Graph */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-border bg-white p-4 overflow-hidden">
              <NetworkGraph
                nodes={filteredNodes}
                edges={filteredEdges}
                selectedNode={selectedNode}
                onSelectNode={setSelectedNode}
                zoom={zoom}
              />
            </div>
            <p className="mt-3 text-center text-xs text-muted">
              Click a node to highlight its connections. Node size represents relative influence.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
