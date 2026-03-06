"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
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
} from "lucide-react";

const typeConfig: Record<
  ActivityType,
  { icon: typeof Heart; label: string; color: string; bg: string }
> = {
  product_saved: { icon: Heart, label: "Product Saved", color: "text-rose-500", bg: "bg-rose-50" },
  spec_downloaded: { icon: Download, label: "Spec Downloaded", color: "text-blue-500", bg: "bg-blue-50" },
  board_add: { icon: LayoutGrid, label: "Added to Board", color: "text-violet-500", bg: "bg-violet-50" },
  website_visit: { icon: Globe, label: "Website Visit", color: "text-emerald-500", bg: "bg-emerald-50" },
  enquiry: { icon: MessageCircle, label: "Enquiry", color: "text-amber-500", bg: "bg-amber-50" },
  project_tagged: { icon: Tag, label: "Project Tagged", color: "text-neutral-600", bg: "bg-neutral-100" },
};

function formatTime(ts: string) {
  const diff = Math.round((Date.now() - new Date(ts).getTime()) / 60_000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

function buildDescription(e: ActivityEvent): string {
  switch (e.type) {
    case "product_saved":
      return `saved **${e.productName}** by ${e.brandName}`;
    case "spec_downloaded":
      return `downloaded spec for **${e.productName}** by ${e.brandName}`;
    case "board_add":
      return `added **${e.productName}** to board **${e.boardName}**`;
    case "website_visit":
      return `viewed **${e.productName}** on ${e.brandName}`;
    case "enquiry":
      return `submitted enquiry for **${e.productName}** to ${e.brandName}`;
    case "project_tagged":
      return `tagged **${e.productName}** in project **${e.projectName}**`;
    default:
      return "";
  }
}

function ActivityRow({ event, isNew }: { event: ActivityEvent; isNew: boolean }) {
  const config = typeConfig[event.type];
  const Icon = config.icon;
  const desc = buildDescription(event);

  return (
    <div
      className={`flex items-start gap-4 rounded-2xl border border-border bg-white p-5 transition-all ${
        isNew ? "animate-pulse ring-2 ring-foreground/5" : ""
      }`}
    >
      {/* Icon */}
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.bg}`}>
        <Icon size={18} className={config.color} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{event.actor.name}</span>
          <span className="rounded-full bg-card px-2 py-0.5 text-[10px] font-medium text-muted capitalize">
            {event.actor.role}
          </span>
        </div>
        <p
          className="mt-1 text-sm text-muted"
          dangerouslySetInnerHTML={{
            __html: desc.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>'),
          }}
        />
        {event.message && (
          <div className="mt-2 rounded-lg bg-card px-3 py-2 text-xs text-muted italic">
            &ldquo;{event.message}&rdquo;
          </div>
        )}
      </div>

      {/* Time + type badge */}
      <div className="shrink-0 text-right">
        <span className="text-xs text-muted">{formatTime(event.timestamp)}</span>
        <div className="mt-1">
          <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${config.color}`}>
            <Circle size={6} fill="currentColor" />
            {config.label}
          </span>
        </div>
      </div>
    </div>
  );
}

// Live stats counters
function LiveStats({ events }: { events: ActivityEvent[] }) {
  const counts = events.reduce(
    (acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const stats = [
    { label: "Saves", value: counts.product_saved || 0, color: "text-rose-500" },
    { label: "Downloads", value: counts.spec_downloaded || 0, color: "text-blue-500" },
    { label: "Board Adds", value: counts.board_add || 0, color: "text-violet-500" },
    { label: "Visits", value: counts.website_visit || 0, color: "text-emerald-500" },
    { label: "Enquiries", value: counts.enquiry || 0, color: "text-amber-500" },
    { label: "Tags", value: counts.project_tagged || 0, color: "text-neutral-600" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl border border-border bg-white p-4 text-center">
          <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted">
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function ActivityPage() {
  const [filter, setFilter] = useState<ActivityType | "all">("all");
  const [events, setEvents] = useState(activityFeed);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  // Simulate live events arriving
  useEffect(() => {
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
        actor: {
          name: names[Math.floor(Math.random() * names.length)],
          role: Math.random() > 0.5 ? "architect" : "homeowner",
        },
        productName: prods[idx],
        brandName: brandNames[idx],
      };

      setNewIds((prev) => new Set([...prev, newEvent.id]));
      setEvents((prev) => [newEvent, ...prev.slice(0, 29)]);

      // Remove "new" highlight after 3s
      setTimeout(() => {
        setNewIds((prev) => {
          const next = new Set(prev);
          next.delete(newEvent.id);
          return next;
        });
      }, 3000);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filtered =
    filter === "all" ? events : events.filter((e) => e.type === filter);

  const filterOptions: { value: ActivityType | "all"; label: string }[] = [
    { value: "all", label: "All Activity" },
    { value: "product_saved", label: "Saves" },
    { value: "spec_downloaded", label: "Downloads" },
    { value: "board_add", label: "Board Adds" },
    { value: "website_visit", label: "Visits" },
    { value: "enquiry", label: "Enquiries" },
    { value: "project_tagged", label: "Tags" },
  ];

  return (
    <>
      <PageHeader
        title="Live Activity"
        subtitle="Real-time feed of product saves, spec downloads, board additions, website visits and enquiries across the platform."
      />
      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* Live indicator */}
        <div className="mb-8 flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500" />
          </span>
          <span className="text-sm font-medium">Live</span>
          <span className="text-xs text-muted">— updates every 5 seconds</span>
        </div>

        {/* Stats */}
        <LiveStats events={events} />

        {/* Filters */}
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <Filter size={14} className="text-muted" />
          {filterOptions.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filter === f.value
                  ? "bg-foreground text-white"
                  : "bg-card text-muted hover:bg-foreground/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Feed */}
        <div className="mt-6 space-y-3">
          {filtered.map((event) => (
            <ActivityRow key={event.id} event={event} isNew={newIds.has(event.id)} />
          ))}
        </div>
      </div>
    </>
  );
}
