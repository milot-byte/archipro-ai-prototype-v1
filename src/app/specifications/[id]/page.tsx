"use client";

import { use, useState } from "react";
import Link from "next/link";
import { specifications, designBoards } from "@/lib/intelligence-data";
import { products, projects } from "@/lib/mock-data";
import {
  ArrowLeft,
  Download,
  Printer,
  CheckCircle2,
  Circle,
  Truck,
  Package,
  Wrench,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  FolderKanban,
  Layers,
  MessageCircle,
  Plus,
  ExternalLink,
  Edit3,
  MoreHorizontal,
  AlertCircle,
} from "lucide-react";

const itemStatusConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; step: number }> = {
  specified: { label: "Specified", icon: Circle, color: "text-muted", bg: "bg-surface", step: 1 },
  ordered: { label: "Ordered", icon: Package, color: "text-blue", bg: "bg-blue-light", step: 2 },
  delivered: { label: "Delivered", icon: Truck, color: "text-amber", bg: "bg-amber-light", step: 3 },
  installed: { label: "Installed", icon: CheckCircle2, color: "text-emerald", bg: "bg-emerald-light", step: 4 },
};

const specStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "text-muted", bg: "bg-surface" },
  review: { label: "In Review", color: "text-amber", bg: "bg-amber-light" },
  approved: { label: "Approved", color: "text-emerald", bg: "bg-emerald-light" },
  final: { label: "Final", color: "text-blue", bg: "bg-blue-light" },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" });
}

function StatusStepper({ currentStatus }: { currentStatus: string }) {
  const steps = ["specified", "ordered", "delivered", "installed"];
  const currentStep = itemStatusConfig[currentStatus]?.step || 1;
  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => {
        const config = itemStatusConfig[step];
        const isComplete = config.step <= currentStep;
        const isCurrent = step === currentStatus;
        return (
          <div key={step} className="flex items-center gap-1">
            <div className={`h-1.5 w-6 rounded-full transition-all ${isComplete ? config.step === currentStep ? "bg-foreground" : "bg-foreground/40" : "bg-surface"}`} />
          </div>
        );
      })}
    </div>
  );
}

export default function SpecDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const spec = specifications.find((s) => s.id === id);
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set(spec?.rooms.map((r) => r.id) || []));

  if (!spec) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-[20px] font-semibold">Specification not found</h1>
          <Link href="/specifications" className="mt-3 inline-flex items-center gap-1 text-[13px] text-muted hover:text-foreground">
            <ArrowLeft size={14} /> Back to specifications
          </Link>
        </div>
      </div>
    );
  }

  const project = projects.find((p) => p.id === spec.projectId);
  const boards = designBoards.filter((b) => b.projectId === spec.projectId);
  const totalItems = spec.rooms.reduce((a, r) => a + r.items.length, 0);
  const statusCounts: Record<string, number> = {};
  spec.rooms.forEach((r) => r.items.forEach((i) => { statusCounts[i.status] = (statusCounts[i.status] || 0) + 1; }));
  const sc = specStatusConfig[spec.status];

  // Calculate unique brands
  const uniqueBrands = new Set(spec.rooms.flatMap((r) => r.items.map((i) => i.brand)));

  const toggleRoom = (roomId: string) => {
    const next = new Set(expandedRooms);
    if (next.has(roomId)) next.delete(roomId); else next.add(roomId);
    setExpandedRooms(next);
  };

  return (
    <div className="min-h-screen bg-surface/50">
      {/* Header */}
      <div className="border-b border-border bg-white px-8 py-5">
        <Link href="/specifications" className="inline-flex items-center gap-1 text-[12px] text-muted hover:text-foreground mb-4">
          <ArrowLeft size={13} /> Back to specifications
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[24px] font-semibold tracking-tight">{spec.projectName}</h1>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${sc.bg} ${sc.color}`}>{sc.label}</span>
            </div>
            <p className="mt-1 text-[13px] text-muted">
              Specification by {spec.architect} · {project?.location} · Updated {formatDate(spec.updatedAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-muted hover:bg-surface">
              <Edit3 size={13} className="inline mr-1.5" />Edit
            </button>
            <button className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-muted hover:bg-surface">
              <Printer size={13} className="inline mr-1.5" />Print
            </button>
            <button className="rounded-lg bg-foreground px-4 py-1.5 text-[12px] font-medium text-white hover:opacity-90">
              <Download size={13} className="inline mr-1.5" />Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Status Summary */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="text-[24px] font-bold tracking-tight">{totalItems}</p>
            <p className="text-[11px] text-muted">Total Items</p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="text-[24px] font-bold tracking-tight">{spec.rooms.length}</p>
            <p className="text-[11px] text-muted">Rooms</p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="text-[24px] font-bold tracking-tight">{uniqueBrands.size}</p>
            <p className="text-[11px] text-muted">Brands</p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="text-[24px] font-bold tracking-tight text-emerald">{statusCounts.installed || 0}</p>
            <p className="text-[11px] text-muted">Installed</p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="text-[24px] font-bold tracking-tight text-blue">{statusCounts.ordered || 0}</p>
            <p className="text-[11px] text-muted">On Order</p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="text-[24px] font-bold tracking-tight text-muted">{statusCounts.specified || 0}</p>
            <p className="text-[11px] text-muted">Awaiting Order</p>
          </div>
        </div>

        {/* Progress */}
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-semibold">Completion Progress</h3>
            <span className="text-[13px] font-semibold">{Math.round(((statusCounts.installed || 0) / totalItems) * 100)}%</span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden bg-surface">
            {(["installed", "delivered", "ordered", "specified"] as const).map((status) => {
              const count = statusCounts[status] || 0;
              const pct = (count / totalItems) * 100;
              const colors: Record<string, string> = { installed: "bg-emerald", delivered: "bg-amber", ordered: "bg-blue", specified: "bg-border" };
              return <div key={status} className={`${colors[status]} transition-all`} style={{ width: `${pct}%` }} />;
            })}
          </div>
          <div className="flex items-center gap-5 mt-3">
            {Object.entries(itemStatusConfig).map(([key, config]) => (
              <span key={key} className="flex items-center gap-1.5 text-[11px] text-muted">
                <span className={`h-2 w-2 rounded-full ${key === "installed" ? "bg-emerald" : key === "delivered" ? "bg-amber" : key === "ordered" ? "bg-blue" : "bg-border"}`} />
                {config.label} ({statusCounts[key] || 0})
              </span>
            ))}
          </div>
        </div>

        {/* Related Links */}
        <div className="grid grid-cols-3 gap-4">
          {project && (
            <Link href={`/projects/${project.id}`} className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4 hover:bg-surface/50 transition-colors">
              <div className="rounded-xl bg-surface p-2.5"><FolderKanban size={16} className="text-muted" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium">{project.title}</p>
                <p className="text-[10px] text-muted">{project.location} · {project.year}</p>
              </div>
              <ExternalLink size={13} className="text-muted" />
            </Link>
          )}
          {boards.slice(0, 2).map((board) => (
            <Link key={board.id} href={`/boards/${board.id}`} className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4 hover:bg-surface/50 transition-colors">
              <div className="rounded-xl bg-surface p-2.5"><Layers size={16} className="text-muted" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium truncate">{board.name}</p>
                <p className="text-[10px] text-muted">{board.productIds.length} products</p>
              </div>
              <ExternalLink size={13} className="text-muted" />
            </Link>
          ))}
        </div>

        {/* Room Sections */}
        <div className="space-y-4">
          {spec.rooms.map((room) => {
            const isExpanded = expandedRooms.has(room.id);
            const roomInstalled = room.items.filter((i) => i.status === "installed").length;
            const roomProgress = Math.round((roomInstalled / room.items.length) * 100);
            const allDone = roomInstalled === room.items.length && room.items.length > 0;

            return (
              <div key={room.id} className="rounded-2xl border border-border bg-white overflow-hidden">
                <button
                  onClick={() => toggleRoom(room.id)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-surface/30"
                >
                  <div className="flex items-center gap-3">
                    <Wrench size={16} className="text-muted" />
                    <h2 className="text-[14px] font-semibold">{room.name}</h2>
                    <span className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] text-muted">{room.items.length} items</span>
                    {allDone && <CheckCircle2 size={14} className="text-emerald" />}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-surface overflow-hidden">
                        <div className="h-full rounded-full bg-foreground" style={{ width: `${roomProgress}%` }} />
                      </div>
                      <span className="text-[11px] text-muted w-8">{roomProgress}%</span>
                    </div>
                    {isExpanded ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border">
                    <table className="w-full table-premium">
                      <thead>
                        <tr className="bg-surface/30">
                          <th>Product</th>
                          <th>Brand</th>
                          <th>Category</th>
                          <th className="text-right">Qty</th>
                          <th>Notes</th>
                          <th>Progress</th>
                          <th className="text-right">Status</th>
                          <th className="w-10" />
                        </tr>
                      </thead>
                      <tbody>
                        {room.items.map((item, i) => {
                          const isc = itemStatusConfig[item.status];
                          const StatusIcon = isc.icon;
                          return (
                            <tr key={i}>
                              <td>
                                <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 rounded-lg bg-surface shrink-0" />
                                  <span className="text-[13px] font-medium">{item.productName}</span>
                                </div>
                              </td>
                              <td><span className="text-[12px]">{item.brand}</span></td>
                              <td><span className="text-[12px] text-muted">{item.category}</span></td>
                              <td className="text-right"><span className="text-[13px] font-medium">{item.quantity} {item.unit}</span></td>
                              <td><span className="text-[11px] text-muted max-w-[200px] truncate block">{item.notes}</span></td>
                              <td><StatusStepper currentStatus={item.status} /></td>
                              <td className="text-right">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${isc.bg} ${isc.color}`}>
                                  <StatusIcon size={10} /> {isc.label}
                                </span>
                              </td>
                              <td>
                                <button className="rounded-lg p-1 text-muted hover:bg-surface"><MoreHorizontal size={14} /></button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <div className="flex items-center justify-between border-t border-border px-6 py-3">
                      <button className="flex items-center gap-1.5 text-[12px] text-muted hover:text-foreground">
                        <Plus size={13} /> Add item to {room.name}
                      </button>
                      <button className="flex items-center gap-1.5 text-[12px] text-muted hover:text-foreground">
                        <MessageCircle size={13} /> Add note
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Room */}
        <button className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-white/50 py-6 text-[13px] font-medium text-muted hover:border-foreground/30 hover:text-foreground transition-colors">
          <Plus size={16} /> Add New Room
        </button>
      </div>
    </div>
  );
}
