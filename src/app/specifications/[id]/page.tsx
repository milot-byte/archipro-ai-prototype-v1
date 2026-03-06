"use client";

import { use, useState } from "react";
import Link from "next/link";
import { specifications, designBoards, productMomentumData } from "@/lib/intelligence-data";
import { products, projects, brands } from "@/lib/mock-data";
import {
  ArrowLeft, Download, Printer, CheckCircle2, Circle, Truck, Package,
  Wrench, ChevronDown, ChevronUp, FileText, Clock, FolderKanban, Layers,
  MessageCircle, Plus, ExternalLink, Edit3, MoreHorizontal, AlertCircle,
  X, Save, Eye, Send, Users, Star, TrendingUp, History, FileCheck,
  ArrowRight, ChevronRight, Lock, Unlock, Sparkles
} from "lucide-react";

const itemStatusConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; step: number }> = {
  specified: { label: "Specified", icon: Circle, color: "text-muted", bg: "bg-surface", step: 1 },
  ordered: { label: "Ordered", icon: Package, color: "text-blue", bg: "bg-blue-light", step: 2 },
  delivered: { label: "Delivered", icon: Truck, color: "text-amber", bg: "bg-amber-light", step: 3 },
  installed: { label: "Installed", icon: CheckCircle2, color: "text-emerald", bg: "bg-emerald-light", step: 4 },
};

const specStatusConfig: Record<string, { label: string; color: string; bg: string; next?: string; nextLabel?: string }> = {
  draft: { label: "Draft", color: "text-muted", bg: "bg-surface", next: "review", nextLabel: "Submit for Review" },
  review: { label: "In Review", color: "text-amber", bg: "bg-amber-light", next: "approved", nextLabel: "Approve Specification" },
  approved: { label: "Approved", color: "text-emerald", bg: "bg-emerald-light", next: "final", nextLabel: "Mark as Final" },
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
      {steps.map((step) => {
        const config = itemStatusConfig[step];
        const isComplete = config.step <= currentStep;
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
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [showStatusChange, setShowStatusChange] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAddItem, setShowAddItem] = useState<string | null>(null);

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
  const uniqueBrands = new Set(spec.rooms.flatMap((r) => r.items.map((i) => i.brand)));

  // Brand cost breakdown mock
  const brandBreakdown = Array.from(uniqueBrands).map(brandName => {
    const brand = brands.find(b => b.name === brandName);
    const itemCount = spec.rooms.reduce((s, r) => s + r.items.filter(i => i.brand === brandName).length, 0);
    return { name: brandName, items: itemCount, category: brand?.category || "—" };
  });

  // Revision history mock
  const revisionHistory = [
    { date: "22 Dec 2024", user: spec.architect, action: "Updated item quantities in Kitchen", type: "edit" },
    { date: "20 Dec 2024", user: spec.architect, action: "Added 2 items to Living Room", type: "add" },
    { date: "18 Dec 2024", user: "Sarah Mitchell", action: "Left comment on Island Benchtop", type: "comment" },
    { date: "15 Dec 2024", user: spec.architect, action: "Changed status from Draft to Review", type: "status" },
    { date: "12 Dec 2024", user: spec.architect, action: "Created specification from board", type: "create" },
  ];

  const toggleRoom = (roomId: string) => {
    const next = new Set(expandedRooms);
    if (next.has(roomId)) next.delete(roomId); else next.add(roomId);
    setExpandedRooms(next);
  };

  return (
    <div className="min-h-screen bg-surface/50">
      {/* Header */}
      <div className="border-b border-border bg-white px-8 py-5">
        <div className="flex items-center gap-2 text-[12px] text-muted mb-4">
          <Link href="/specifications" className="hover:text-foreground transition-colors">Specifications</Link>
          <ChevronRight size={12} />
          <span className="text-foreground font-medium">{spec.projectName}</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[24px] font-semibold tracking-tight">{spec.projectName}</h1>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${sc.bg} ${sc.color}`}>{sc.label}</span>
              {isEditing && <span className="rounded-full bg-blue-light px-2.5 py-0.5 text-[10px] font-semibold text-blue flex items-center gap-1"><Edit3 size={10} />Editing</span>}
            </div>
            <p className="mt-1 text-[13px] text-muted">
              Specification by {spec.architect} · {project?.location} · Updated {formatDate(spec.updatedAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-muted hover:bg-surface">
                  <X size={13} className="inline mr-1.5" />Cancel
                </button>
                <button onClick={() => setIsEditing(false)} className="rounded-lg bg-emerald px-4 py-1.5 text-[12px] font-medium text-white hover:opacity-90">
                  <Save size={13} className="inline mr-1.5" />Save Changes
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setShowHistory(!showHistory)} className={`rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-muted hover:bg-surface ${showHistory ? "bg-surface" : ""}`}>
                  <History size={13} className="inline mr-1.5" />History
                </button>
                <button onClick={() => setIsEditing(true)} className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-muted hover:bg-surface">
                  <Edit3 size={13} className="inline mr-1.5" />Edit
                </button>
                <button className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-muted hover:bg-surface">
                  <Printer size={13} className="inline mr-1.5" />Print
                </button>
                <button className="rounded-lg bg-foreground px-4 py-1.5 text-[12px] font-medium text-white hover:opacity-90">
                  <Download size={13} className="inline mr-1.5" />Export PDF
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">
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
                <p className="text-[11px] text-muted">Awaiting</p>
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

            {/* Approval workflow */}
            {sc.next && !isEditing && (
              <div className="rounded-2xl border-2 border-dashed border-border bg-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {["draft", "review", "approved", "final"].map((step, i) => {
                      const isActive = step === spec.status;
                      const isPast = ["draft", "review", "approved", "final"].indexOf(step) < ["draft", "review", "approved", "final"].indexOf(spec.status);
                      return (
                        <div key={step} className="flex items-center gap-1">
                          <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[9px] font-bold ${isPast ? "bg-emerald text-white" : isActive ? "bg-foreground text-white" : "bg-surface text-muted"}`}>
                            {isPast ? <CheckCircle2 size={12} /> : i + 1}
                          </div>
                          {i < 3 && <div className={`w-8 h-0.5 ${isPast ? "bg-emerald" : "bg-border"}`} />}
                        </div>
                      );
                    })}
                  </div>
                  <div className="ml-3">
                    <p className="text-[12px] font-semibold">Current: {sc.label}</p>
                    <p className="text-[10px] text-muted">Ready to advance to next stage?</p>
                  </div>
                </div>
                <button onClick={() => setShowStatusChange(true)} className="flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-[12px] font-medium text-white hover:opacity-90">
                  <ArrowRight size={13} /> {sc.nextLabel}
                </button>
              </div>
            )}

            {/* Status change confirmation */}
            {showStatusChange && (
              <div className="rounded-2xl border-2 border-foreground bg-white p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-light"><CheckCircle2 size={18} className="text-emerald" /></div>
                  <div>
                    <h3 className="text-[14px] font-semibold">{sc.nextLabel}</h3>
                    <p className="text-[12px] text-muted">This will advance the specification to the next stage. All collaborators will be notified.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowStatusChange(false)} className="rounded-lg bg-foreground px-4 py-2 text-[12px] font-medium text-white">Confirm</button>
                  <button onClick={() => setShowStatusChange(false)} className="rounded-lg border border-border px-4 py-2 text-[12px] font-medium">Cancel</button>
                </div>
              </div>
            )}

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
                              const isItemEditing = editingItem === `${room.id}-${i}`;
                              const momentum = productMomentumData.find(m => m.productId === item.productId);

                              return (
                                <tr key={i} className={isItemEditing ? "bg-blue-light/30" : ""}>
                                  <td>
                                    <div className="flex items-center gap-3">
                                      <div className="h-9 w-9 rounded-lg bg-surface shrink-0 flex items-center justify-center">
                                        <Package size={12} className="text-muted" />
                                      </div>
                                      <div>
                                        <Link href={`/products/${item.productId}`} className="text-[13px] font-medium hover:underline">{item.productName}</Link>
                                        {momentum && <span className="ml-1.5 text-[9px] font-semibold text-emerald"><TrendingUp size={8} className="inline" /> {momentum.momentumScore}</span>}
                                      </div>
                                    </div>
                                  </td>
                                  <td><span className="text-[12px]">{item.brand}</span></td>
                                  <td><span className="text-[12px] text-muted">{item.category}</span></td>
                                  <td className="text-right">
                                    {isEditing ? (
                                      <input type="text" defaultValue={`${item.quantity} ${item.unit}`} className="w-16 rounded border border-border px-2 py-1 text-[12px] text-right focus:outline-none focus:ring-1 focus:ring-foreground" />
                                    ) : (
                                      <span className="text-[13px] font-medium">{item.quantity} {item.unit}</span>
                                    )}
                                  </td>
                                  <td>
                                    {isEditing ? (
                                      <input type="text" defaultValue={item.notes} className="w-full rounded border border-border px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-foreground" />
                                    ) : (
                                      <span className="text-[11px] text-muted max-w-[200px] truncate block">{item.notes}</span>
                                    )}
                                  </td>
                                  <td><StatusStepper currentStatus={item.status} /></td>
                                  <td className="text-right">
                                    {isEditing ? (
                                      <select defaultValue={item.status} className="rounded border border-border px-2 py-1 text-[10px] font-medium focus:outline-none focus:ring-1 focus:ring-foreground">
                                        {Object.entries(itemStatusConfig).map(([k, v]) => (
                                          <option key={k} value={k}>{v.label}</option>
                                        ))}
                                      </select>
                                    ) : (
                                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${isc.bg} ${isc.color}`}>
                                        <StatusIcon size={10} /> {isc.label}
                                      </span>
                                    )}
                                  </td>
                                  <td>
                                    <button className="rounded-lg p-1 text-muted hover:bg-surface"><MoreHorizontal size={14} /></button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>

                        {/* Add item row */}
                        {showAddItem === room.id ? (
                          <div className="border-t border-border px-6 py-3 bg-surface/30">
                            <div className="flex items-center gap-3">
                              <select className="rounded-lg border border-border bg-white px-3 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-foreground flex-1">
                                <option value="">Select a product...</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name} — {p.brand}</option>)}
                              </select>
                              <input type="number" placeholder="Qty" className="w-16 rounded-lg border border-border bg-white px-3 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-foreground" />
                              <input type="text" placeholder="Notes..." className="flex-1 rounded-lg border border-border bg-white px-3 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-foreground" />
                              <button className="rounded-lg bg-foreground px-3 py-1.5 text-[12px] font-medium text-white hover:opacity-90">Add</button>
                              <button onClick={() => setShowAddItem(null)} className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-muted hover:bg-surface">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between border-t border-border px-6 py-3">
                            <button onClick={() => setShowAddItem(room.id)} className="flex items-center gap-1.5 text-[12px] text-muted hover:text-foreground">
                              <Plus size={13} /> Add item to {room.name}
                            </button>
                            <button className="flex items-center gap-1.5 text-[12px] text-muted hover:text-foreground">
                              <MessageCircle size={13} /> Add note
                            </button>
                          </div>
                        )}
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

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Related Links */}
            {project && (
              <Link href={`/projects/${project.id}`} className="block rounded-2xl border border-border bg-white p-4 hover:bg-surface/50 transition-colors">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted mb-2">Project</p>
                <p className="text-[13px] font-semibold">{project.title}</p>
                <p className="text-[11px] text-muted">{project.location} · {project.year}</p>
              </Link>
            )}

            {boards.map((board) => (
              <Link key={board.id} href={`/boards/${board.id}`} className="block rounded-2xl border border-border bg-white p-4 hover:bg-surface/50 transition-colors">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted mb-2">Design Board</p>
                <p className="text-[12px] font-semibold">{board.name}</p>
                <p className="text-[10px] text-muted">{board.productIds.length} products</p>
              </Link>
            ))}

            {/* Brand breakdown */}
            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted mb-3">Brand Distribution</p>
              <div className="space-y-2">
                {brandBreakdown.sort((a, b) => b.items - a.items).map((brand) => (
                  <div key={brand.name}>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-medium">{brand.name}</span>
                      <span className="text-muted">{brand.items}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface overflow-hidden">
                      <div className="h-full rounded-full bg-foreground/60" style={{ width: `${(brand.items / totalItems) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Item status breakdown by room */}
            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted mb-3">Room Progress</p>
              <div className="space-y-3">
                {spec.rooms.map((room) => {
                  const installed = room.items.filter(i => i.status === "installed").length;
                  const pct = Math.round((installed / room.items.length) * 100);
                  return (
                    <div key={room.id}>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-medium">{room.name}</span>
                        <span className="text-muted">{installed}/{room.items.length}</span>
                      </div>
                      <div className="flex h-1.5 rounded-full overflow-hidden bg-surface">
                        {(["installed", "delivered", "ordered", "specified"] as const).map((s) => {
                          const count = room.items.filter(i => i.status === s).length;
                          const w = (count / room.items.length) * 100;
                          const colors: Record<string, string> = { installed: "bg-emerald", delivered: "bg-amber", ordered: "bg-blue", specified: "bg-border" };
                          return <div key={s} className={`${colors[s]}`} style={{ width: `${w}%` }} />;
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Revision history */}
            {showHistory && (
              <div className="rounded-2xl border border-border bg-white p-4">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted mb-3">Revision History</p>
                <div className="space-y-3">
                  {revisionHistory.map((rev, i) => (
                    <div key={i} className="flex gap-2.5">
                      <div className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
                        rev.type === "edit" ? "bg-blue-light" : rev.type === "add" ? "bg-emerald-light" :
                        rev.type === "comment" ? "bg-amber-light" : rev.type === "status" ? "bg-surface" : "bg-surface"
                      }`}>
                        {rev.type === "edit" ? <Edit3 size={9} className="text-blue" /> :
                         rev.type === "add" ? <Plus size={9} className="text-emerald" /> :
                         rev.type === "comment" ? <MessageCircle size={9} className="text-amber" /> :
                         rev.type === "status" ? <ArrowRight size={9} className="text-muted" /> :
                         <Star size={9} className="text-muted" />}
                      </div>
                      <div>
                        <p className="text-[11px]"><span className="font-semibold">{rev.user}</span> <span className="text-muted">{rev.action}</span></p>
                        <p className="text-[10px] text-muted">{rev.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Collaborators */}
            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted mb-3">Collaborators</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-surface flex items-center justify-center">
                    <span className="text-[8px] font-bold text-muted">{spec.architect.split(" ").map(n => n[0]).join("")}</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold">{spec.architect}</p>
                    <p className="text-[9px] text-muted">Architect · Owner</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-surface flex items-center justify-center">
                    <span className="text-[8px] font-bold text-muted">SM</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold">Sarah Mitchell</p>
                    <p className="text-[9px] text-muted">Homeowner · Viewer</p>
                  </div>
                </div>
              </div>
              <button className="mt-3 flex items-center gap-1.5 text-[11px] text-muted hover:text-foreground">
                <Plus size={11} /> Add collaborator
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
