"use client";

import Link from "next/link";
import { specifications, designBoards } from "@/lib/intelligence-data";
import { projects } from "@/lib/mock-data";
import {
  FileText,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Edit3,
  FileCheck,
  Plus,
  Download,
  Users,
  FolderKanban,
  Package,
  Truck,
  Wrench,
  Circle,
  Filter,
} from "lucide-react";
import { useState } from "react";

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  draft: { label: "Draft", icon: Edit3, color: "text-muted", bg: "bg-surface" },
  review: { label: "In Review", icon: AlertCircle, color: "text-amber", bg: "bg-amber-light" },
  approved: { label: "Approved", icon: CheckCircle2, color: "text-emerald", bg: "bg-emerald-light" },
  final: { label: "Final", icon: FileCheck, color: "text-blue", bg: "bg-blue-light" },
};

const itemStatusConfig: Record<string, { label: string; color: string }> = {
  specified: { label: "Specified", color: "bg-border" },
  ordered: { label: "Ordered", color: "bg-blue" },
  delivered: { label: "Delivered", color: "bg-amber" },
  installed: { label: "Installed", color: "bg-emerald" },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" });
}

export default function SpecificationsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = statusFilter === "all" ? specifications : specifications.filter((s) => s.status === statusFilter);

  const totalItems = specifications.reduce((a, s) => a + s.rooms.reduce((b, r) => b + r.items.length, 0), 0);
  const installedItems = specifications.reduce((a, s) => a + s.rooms.reduce((b, r) => b + r.items.filter((i) => i.status === "installed").length, 0), 0);
  const orderedItems = specifications.reduce((a, s) => a + s.rooms.reduce((b, r) => b + r.items.filter((i) => i.status === "ordered").length, 0), 0);
  const totalRooms = specifications.reduce((a, s) => a + s.rooms.length, 0);

  return (
    <div className="min-h-screen bg-surface/50">
      {/* Header */}
      <div className="border-b border-border bg-white px-8 py-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">Workspace</p>
            <h1 className="mt-1 text-[28px] font-semibold tracking-tight">Specifications</h1>
            <p className="mt-1 text-[13px] text-muted">Room-organised spec sheets for procurement and construction tracking.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-muted hover:bg-surface">
              <Download size={13} className="inline mr-1.5" />Export All
            </button>
            <button className="rounded-lg bg-foreground px-4 py-2 text-[13px] font-medium text-white hover:opacity-90">
              <Plus size={14} className="inline mr-1.5" />New Specification
            </button>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="text-[24px] font-bold tracking-tight">{specifications.length}</p>
            <p className="text-[11px] text-muted mt-0.5">Specifications</p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="text-[24px] font-bold tracking-tight">{totalItems}</p>
            <p className="text-[11px] text-muted mt-0.5">Total Items</p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="text-[24px] font-bold tracking-tight">{totalRooms}</p>
            <p className="text-[11px] text-muted mt-0.5">Rooms</p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="text-[24px] font-bold tracking-tight">{installedItems}</p>
            <p className="text-[11px] text-emerald mt-0.5">Installed</p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="text-[24px] font-bold tracking-tight">{orderedItems}</p>
            <p className="text-[11px] text-blue mt-0.5">On Order</p>
          </div>
        </div>

        {/* Overall progress */}
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-semibold">Overall Progress</h3>
            <span className="text-[12px] font-medium">{Math.round((installedItems / totalItems) * 100)}% complete</span>
          </div>
          <div className="flex h-2.5 rounded-full overflow-hidden bg-surface">
            {(["installed", "delivered", "ordered", "specified"] as const).map((status) => {
              const count = specifications.reduce((a, s) => a + s.rooms.reduce((b, r) => b + r.items.filter((i) => i.status === status).length, 0), 0);
              const pct = (count / totalItems) * 100;
              return <div key={status} className={`${itemStatusConfig[status].color} transition-all`} style={{ width: `${pct}%` }} />;
            })}
          </div>
          <div className="flex items-center gap-4 mt-3">
            {Object.entries(itemStatusConfig).map(([key, config]) => (
              <span key={key} className="flex items-center gap-1.5 text-[10px] text-muted">
                <span className={`h-2 w-2 rounded-full ${config.color}`} />
                {config.label}
              </span>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-white p-1">
            {["all", "draft", "review", "approved", "final"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-md px-3 py-1.5 text-[12px] font-medium capitalize transition-colors ${
                  statusFilter === s ? "bg-foreground text-white" : "text-muted hover:bg-surface"
                }`}
              >
                {s === "all" ? "All" : statusConfig[s]?.label || s}
              </button>
            ))}
          </div>
        </div>

        {/* Spec Cards */}
        <div className="space-y-4">
          {filtered.map((spec) => {
            const sc = statusConfig[spec.status];
            const StatusIcon = sc.icon;
            const totalItems = spec.rooms.reduce((a, r) => a + r.items.length, 0);
            const statusCounts: Record<string, number> = {};
            spec.rooms.forEach((r) => r.items.forEach((i) => { statusCounts[i.status] = (statusCounts[i.status] || 0) + 1; }));
            const project = projects.find((p) => p.id === spec.projectId);
            const boards = designBoards.filter((b) => b.projectId === spec.projectId);

            return (
              <Link
                key={spec.id}
                href={`/specifications/${spec.id}`}
                className="group block rounded-2xl border border-border bg-white overflow-hidden transition-all hover:shadow-md hover:border-foreground/10"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${sc.bg}`}>
                        <StatusIcon size={18} className={sc.color} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-[15px] font-semibold">{spec.projectName}</h3>
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${sc.bg} ${sc.color}`}>{sc.label}</span>
                        </div>
                        <p className="mt-0.5 text-[12px] text-muted">{spec.architect} · {project?.location}</p>
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {spec.rooms.map((room) => {
                            const roomInstalled = room.items.filter((i) => i.status === "installed").length;
                            const allDone = roomInstalled === room.items.length;
                            return (
                              <span key={room.id} className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium ${allDone ? "bg-emerald-light text-emerald" : "bg-surface text-muted"}`}>
                                {allDone && <CheckCircle2 size={10} />}
                                {room.name} <span className="text-[10px] opacity-60">({room.items.length})</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-[20px] font-bold">{totalItems}</p>
                      <p className="text-[11px] text-muted">items</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 flex h-2 rounded-full overflow-hidden bg-surface">
                      {(["installed", "delivered", "ordered", "specified"] as const).map((status) => {
                        const count = statusCounts[status] || 0;
                        const pct = (count / totalItems) * 100;
                        return <div key={status} className={`${itemStatusConfig[status].color} transition-all`} style={{ width: `${pct}%` }} />;
                      })}
                    </div>
                    <span className="text-[11px] font-medium text-muted w-10 text-right">
                      {Math.round(((statusCounts.installed || 0) / totalItems) * 100)}%
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-[11px] text-muted">
                      <span>{spec.rooms.length} rooms</span>
                      <span>{statusCounts.installed || 0} installed</span>
                      <span>{statusCounts.ordered || 0} on order</span>
                      {boards.length > 0 && <span>{boards.length} linked board{boards.length > 1 ? "s" : ""}</span>}
                      <span className="flex items-center gap-1"><Clock size={11} />{formatDate(spec.updatedAt)}</span>
                    </div>
                    <ArrowRight size={14} className="text-muted group-hover:text-foreground transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
