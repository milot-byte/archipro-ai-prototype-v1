"use client";

import { useState, useEffect } from "react";
import { activityFeed, ActivityEvent, ActivityType } from "@/lib/intelligence-data";
import {
  Heart,
  Download,
  LayoutGrid,
  Globe,
  MessageCircle,
  Tag,
  Circle,
  Filter,
  Search,
  ArrowRight,
  Clock,
  Users,
  TrendingUp,
  Eye,
  Zap,
  Pause,
  Play,
} from "lucide-react";

const typeConfig: Record<ActivityType, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  product_saved: { icon: Heart, label: "Product Saved", color: "text-rose", bg: "bg-rose-light" },
  spec_downloaded: { icon: Download, label: "Spec Downloaded", color: "text-blue", bg: "bg-blue-light" },
  board_add: { icon: LayoutGrid, label: "Added to Board", color: "text-foreground", bg: "bg-surface" },
  website_visit: { icon: Globe, label: "Website Visit", color: "text-emerald", bg: "bg-emerald-light" },
  enquiry: { icon: MessageCircle, label: "Enquiry", color: "text-amber", bg: "bg-amber-light" },
  project_tagged: { icon: Tag, label: "Project Tagged", color: "text-muted", bg: "bg-surface" },
};

function formatTime(ts: string) {
  const diff = Math.round((Date.now() - new Date(ts).getTime()) / 60_000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

function buildDescription(e: ActivityEvent): React.ReactNode {
  switch (e.type) {
    case "product_saved": return <><span className="font-medium text-foreground">{e.productName}</span> <span className="text-muted">by {e.brandName}</span></>;
    case "spec_downloaded": return <>spec for <span className="font-medium text-foreground">{e.productName}</span></>;
    case "board_add": return <><span className="font-medium text-foreground">{e.productName}</span> → <span className="font-medium text-foreground">{e.boardName}</span></>;
    case "website_visit": return <><span className="font-medium text-foreground">{e.productName}</span> <span className="text-muted">on {e.brandName}</span></>;
    case "enquiry": return <><span className="font-medium text-foreground">{e.productName}</span> <span className="text-muted">to {e.brandName}</span></>;
    case "project_tagged": return <><span className="font-medium text-foreground">{e.productName}</span> in <span className="font-medium text-foreground">{e.projectName}</span></>;
    default: return "";
  }
}

function getVerb(type: ActivityType): string {
  switch (type) {
    case "product_saved": return "saved";
    case "spec_downloaded": return "downloaded";
    case "board_add": return "added";
    case "website_visit": return "viewed";
    case "enquiry": return "enquired about";
    case "project_tagged": return "tagged";
  }
}

export default function ActivityPage() {
  const [filter, setFilter] = useState<ActivityType | "all">("all");
  const [roleFilter, setRoleFilter] = useState<"all" | "architect" | "homeowner">("all");
  const [events, setEvents] = useState(activityFeed);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [isPaused, setIsPaused] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      const types: ActivityType[] = ["product_saved", "spec_downloaded", "board_add", "website_visit", "enquiry"];
      const names = ["Alex Turner", "Mia Chen", "Daniel Reeves", "Hannah Kim", "Liam O'Brien"];
      const prods = ["Pendant Light — Arc", "Engineered Oak Panel", "Lounge Chair — Miro", "Standing Seam Panel"];
      const brandNames = ["Flōra Lighting", "DuraLux Surfaces", "Southmade Furniture", "CoverVault Roofing"];
      const type = types[Math.floor(Math.random() * types.length)];
      const idx = Math.floor(Math.random() * prods.length);
      const newEvent: ActivityEvent = {
        id: `live-${Date.now()}`,
        type,
        timestamp: new Date().toISOString(),
        actor: { name: names[Math.floor(Math.random() * names.length)], role: Math.random() > 0.5 ? "architect" : "homeowner" },
        productName: prods[idx],
        brandName: brandNames[idx],
      };
      setNewIds((prev) => new Set([...prev, newEvent.id]));
      setEvents((prev) => [newEvent, ...prev.slice(0, 49)]);
      setTimeout(() => { setNewIds((prev) => { const next = new Set(prev); next.delete(newEvent.id); return next; }); }, 3000);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  let filtered = filter === "all" ? events : events.filter((e) => e.type === filter);
  if (roleFilter !== "all") filtered = filtered.filter((e) => e.actor.role === roleFilter);
  if (search) filtered = filtered.filter((e) => e.productName?.toLowerCase().includes(search.toLowerCase()) || e.actor.name.toLowerCase().includes(search.toLowerCase()));

  const counts = events.reduce((acc, e) => { acc[e.type] = (acc[e.type] || 0) + 1; return acc; }, {} as Record<string, number>);
  const architectEvents = events.filter((e) => e.actor.role === "architect").length;
  const homeownerEvents = events.filter((e) => e.actor.role === "homeowner").length;

  const filterOptions: { value: ActivityType | "all"; label: string; count?: number }[] = [
    { value: "all", label: "All", count: events.length },
    { value: "product_saved", label: "Saves", count: counts.product_saved },
    { value: "spec_downloaded", label: "Downloads", count: counts.spec_downloaded },
    { value: "board_add", label: "Board Adds", count: counts.board_add },
    { value: "website_visit", label: "Visits", count: counts.website_visit },
    { value: "enquiry", label: "Enquiries", count: counts.enquiry },
    { value: "project_tagged", label: "Tags", count: counts.project_tagged },
  ];

  return (
    <div className="min-h-screen bg-surface/50">
      {/* Header */}
      <div className="border-b border-border bg-white px-8 py-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">Intelligence</p>
              <div className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald" />
              </div>
            </div>
            <h1 className="mt-1 text-[28px] font-semibold tracking-tight">Activity Feed</h1>
            <p className="mt-1 text-[13px] text-muted">Real-time product saves, spec downloads, board adds, visits, and enquiries.</p>
          </div>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[12px] font-medium transition-colors ${isPaused ? "bg-foreground text-white" : "border border-border text-muted hover:bg-surface"}`}
          >
            {isPaused ? <Play size={13} /> : <Pause size={13} />}
            {isPaused ? "Resume" : "Pause"}
          </button>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 lg:grid-cols-6">
          {[
            { label: "Saves", value: counts.product_saved || 0, icon: Heart, color: "text-rose" },
            { label: "Downloads", value: counts.spec_downloaded || 0, icon: Download, color: "text-blue" },
            { label: "Board Adds", value: counts.board_add || 0, icon: LayoutGrid, color: "text-foreground" },
            { label: "Visits", value: counts.website_visit || 0, icon: Globe, color: "text-emerald" },
            { label: "Enquiries", value: counts.enquiry || 0, icon: MessageCircle, color: "text-amber" },
            { label: "Tags", value: counts.project_tagged || 0, icon: Tag, color: "text-muted" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <s.icon size={14} className={s.color} />
                <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">{s.label}</span>
              </div>
              <p className={`text-[22px] font-bold tracking-tight ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Actor Breakdown */}
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-semibold">Actor Breakdown</h3>
            <span className="text-[11px] text-muted">{events.length} total events</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex h-3 rounded-full overflow-hidden">
                <div className="bg-foreground" style={{ width: `${(architectEvents / events.length) * 100}%` }} />
                <div className="bg-border" style={{ width: `${(homeownerEvents / events.length) * 100}%` }} />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <span className="h-2 w-2 rounded-full bg-foreground" />
                  Architects ({architectEvents})
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-muted">
                  <span className="h-2 w-2 rounded-full bg-border" />
                  Homeowners ({homeownerEvents})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg border border-border bg-white p-1">
              {filterOptions.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${
                    filter === f.value ? "bg-foreground text-white" : "text-muted hover:bg-surface"
                  }`}
                >
                  {f.label}
                  {f.count !== undefined && <span className="ml-1 opacity-60">{f.count}</span>}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-border bg-white p-1">
              {(["all", "architect", "homeowner"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`rounded-md px-3 py-1.5 text-[12px] font-medium capitalize transition-colors ${
                    roleFilter === r ? "bg-foreground text-white" : "text-muted hover:bg-surface"
                  }`}
                >
                  {r === "all" ? "All Roles" : r + "s"}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-lg border border-border bg-white pl-9 pr-3 py-2 text-[12px] w-40 placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>
          </div>
        </div>

        {/* Feed */}
        <div className="rounded-2xl border border-border bg-white overflow-hidden">
          <div className="divide-y divide-border">
            {filtered.map((event) => {
              const config = typeConfig[event.type];
              const Icon = config.icon;
              const isNew = newIds.has(event.id);
              return (
                <div
                  key={event.id}
                  className={`flex items-start gap-4 px-5 py-4 transition-all ${isNew ? "bg-emerald-light/30" : "hover:bg-surface/50"}`}
                >
                  <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${config.bg}`}>
                    <Icon size={15} className={config.color} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium">{event.actor.name}</span>
                      <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-muted capitalize">{event.actor.role}</span>
                      <span className="text-[12px] text-muted">{getVerb(event.type)}</span>
                    </div>
                    <p className="mt-0.5 text-[12px]">{buildDescription(event)}</p>
                    {event.message && (
                      <div className="mt-1.5 rounded-lg bg-surface px-3 py-2 text-[11px] text-muted italic">&ldquo;{event.message}&rdquo;</div>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-[11px] text-muted">{formatTime(event.timestamp)}</span>
                    <div className="mt-1">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
