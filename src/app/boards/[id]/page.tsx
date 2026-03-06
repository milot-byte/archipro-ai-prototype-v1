"use client";

import { use, useState } from "react";
import Link from "next/link";
import { designBoards } from "@/lib/intelligence-data";
import { products, projects, brands } from "@/lib/mock-data";
import {
  ArrowLeft,
  Globe,
  Lock,
  Users,
  Clock,
  Download,
  Plus,
  Trash2,
  MessageCircle,
  Share2,
  Check,
  FolderKanban,
  Heart,
  ExternalLink,
  MoreHorizontal,
  Grid3x3,
  List,
  Filter,
  SlidersHorizontal,
  Copy,
  Eye,
} from "lucide-react";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" });
}

export default function BoardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const board = designBoards.find((b) => b.id === id);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [showConvert, setShowConvert] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showNotes, setShowNotes] = useState<string | null>(null);

  if (!board) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-[20px] font-semibold">Board not found</h1>
          <Link href="/boards" className="mt-3 inline-flex items-center gap-1 text-[13px] text-muted hover:text-foreground">
            <ArrowLeft size={14} /> Back to boards
          </Link>
        </div>
      </div>
    );
  }

  const boardProducts = board.productIds.map((pid) => products.find((p) => p.id === pid)).filter(Boolean);
  const project = board.projectId ? projects.find((p) => p.id === board.projectId) : null;

  const toggleProduct = (pid: string) => {
    const next = new Set(selectedProducts);
    if (next.has(pid)) next.delete(pid); else next.add(pid);
    setSelectedProducts(next);
  };

  const selectAll = () => {
    if (selectedProducts.size === boardProducts.length) setSelectedProducts(new Set());
    else setSelectedProducts(new Set(boardProducts.map((p) => p!.id)));
  };

  return (
    <div className="min-h-screen bg-surface/50">
      {/* Header */}
      <div className="border-b border-border bg-white px-8 py-5">
        <Link href="/boards" className="inline-flex items-center gap-1 text-[12px] text-muted hover:text-foreground mb-4">
          <ArrowLeft size={13} /> Back to boards
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[24px] font-semibold tracking-tight">{board.name}</h1>
              {board.isPublic ? (
                <span className="flex items-center gap-1 rounded-full bg-emerald-light px-2.5 py-0.5 text-[10px] font-semibold text-emerald"><Globe size={10} />Public</span>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-surface px-2.5 py-0.5 text-[10px] font-semibold text-muted"><Lock size={10} />Private</span>
              )}
            </div>
            <p className="mt-1 text-[13px] text-muted max-w-xl">{board.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-muted hover:bg-surface">
              <Share2 size={13} className="inline mr-1.5" />Share
            </button>
            <button className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-muted hover:bg-surface">
              <Copy size={13} className="inline mr-1.5" />Duplicate
            </button>
            <button className="rounded-lg bg-foreground px-4 py-1.5 text-[12px] font-medium text-white hover:opacity-90">
              <Plus size={13} className="inline mr-1.5" />Add Product
            </button>
          </div>
        </div>

        {/* Meta */}
        <div className="mt-4 flex items-center gap-6 text-[12px] text-muted">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-surface" />
            <div>
              <span className="font-medium text-foreground">{board.owner.name}</span>
              <span className="ml-1 capitalize">({board.owner.role})</span>
            </div>
          </div>
          {board.collaborators.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Users size={13} />
              <div className="flex -space-x-1.5">
                {board.collaborators.map((c, i) => (
                  <div key={i} className="h-6 w-6 rounded-full bg-surface border-2 border-white" title={c.name} />
                ))}
              </div>
              <span>{board.collaborators.length + 1} members</span>
            </div>
          )}
          {project && (
            <div className="flex items-center gap-1.5">
              <FolderKanban size={13} />
              <span>{project.title}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Clock size={13} />
            Updated {formatDate(board.updatedAt)}
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-medium">{boardProducts.length} products</span>
            <button onClick={selectAll} className="text-[12px] text-muted hover:text-foreground">
              {selectedProducts.size === boardProducts.length ? "Deselect all" : "Select all"}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border bg-white p-0.5">
              <button onClick={() => setViewMode("grid")} className={`rounded-md p-1.5 ${viewMode === "grid" ? "bg-foreground text-white" : "text-muted"}`}><Grid3x3 size={14} /></button>
              <button onClick={() => setViewMode("list")} className={`rounded-md p-1.5 ${viewMode === "list" ? "bg-foreground text-white" : "text-muted"}`}><List size={14} /></button>
            </div>
          </div>
        </div>

        {/* Selection bar */}
        {selectedProducts.size > 0 && (
          <div className="mb-5 flex items-center justify-between rounded-xl bg-foreground px-5 py-3 text-white">
            <span className="text-[13px] font-medium">{selectedProducts.size} product{selectedProducts.size > 1 ? "s" : ""} selected</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowConvert(true)} className="rounded-lg bg-white px-4 py-1.5 text-[12px] font-medium text-foreground hover:bg-white/90">
                <Download size={12} className="inline mr-1.5" />Convert to Spec
              </button>
              <button className="rounded-lg border border-white/30 px-3 py-1.5 text-[12px] font-medium hover:bg-white/10">
                <Copy size={12} className="inline mr-1.5" />Copy to Board
              </button>
              <button onClick={() => setSelectedProducts(new Set())} className="rounded-lg border border-white/30 px-3 py-1.5 text-[12px] font-medium hover:bg-white/10">Clear</button>
            </div>
          </div>
        )}

        {/* Convert modal */}
        {showConvert && (
          <div className="mb-5 rounded-xl border-2 border-foreground bg-white p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-light"><Check size={18} className="text-emerald" /></div>
              <div>
                <h3 className="text-[14px] font-semibold">Convert to Specification</h3>
                <p className="text-[12px] text-muted">{selectedProducts.size} products will be added to a new specification sheet.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/specifications" className="rounded-lg bg-foreground px-4 py-2 text-[12px] font-medium text-white">Create Specification</Link>
              <button onClick={() => setShowConvert(false)} className="rounded-lg border border-border px-4 py-2 text-[12px] font-medium">Cancel</button>
            </div>
          </div>
        )}

        {/* Grid view */}
        {viewMode === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {boardProducts.map((product) => {
              const isSelected = selectedProducts.has(product!.id);
              const brand = brands.find((b) => b.id === product!.brandId);
              return (
                <div
                  key={product!.id}
                  className={`group relative rounded-2xl border bg-white overflow-hidden transition-all ${
                    isSelected ? "border-foreground ring-2 ring-foreground/10" : "border-border hover:shadow-md"
                  }`}
                >
                  <button
                    onClick={() => toggleProduct(product!.id)}
                    className={`absolute top-3 left-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                      isSelected ? "border-foreground bg-foreground text-white" : "border-white/80 bg-white/80 text-transparent hover:border-foreground/50"
                    }`}
                  >
                    <Check size={12} />
                  </button>
                  <button className="absolute top-3 right-3 z-10 rounded-full bg-white/80 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal size={14} className="text-muted" />
                  </button>

                  <div className="aspect-square bg-surface flex items-center justify-center">
                    <span className="text-[11px] text-muted">{product!.category}</span>
                  </div>

                  <div className="p-4">
                    <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-muted">{product!.brand}</p>
                    <h3 className="mt-0.5 text-[13px] font-semibold leading-tight">{product!.name}</h3>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[14px] font-semibold">{product!.price}</span>
                      <div className="flex gap-1">
                        {product!.specSheet && (
                          <button className="rounded-lg bg-surface p-1.5 text-muted hover:bg-foreground hover:text-white transition-colors">
                            <Download size={12} />
                          </button>
                        )}
                        <button className="rounded-lg bg-surface p-1.5 text-muted hover:bg-foreground hover:text-white transition-colors">
                          <MessageCircle size={12} />
                        </button>
                        <button className="rounded-lg bg-surface p-1.5 text-muted hover:text-rose transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <button className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-white/50 py-16 transition-colors hover:border-foreground/30 hover:bg-white">
              <Plus size={20} className="text-muted" />
              <span className="mt-2 text-[12px] font-medium text-muted">Add product</span>
            </button>
          </div>
        ) : (
          /* List view */
          <div className="rounded-2xl border border-border bg-white overflow-hidden">
            <table className="w-full table-premium">
              <thead>
                <tr className="bg-surface/50">
                  <th className="w-10"><input type="checkbox" className="rounded" checked={selectedProducts.size === boardProducts.length} onChange={selectAll} /></th>
                  <th>Product</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th className="text-right">Price</th>
                  <th className="text-center">Spec Sheet</th>
                  <th className="w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {boardProducts.map((product) => {
                  const isSelected = selectedProducts.has(product!.id);
                  return (
                    <tr key={product!.id} className={isSelected ? "bg-surface/50" : ""}>
                      <td><input type="checkbox" checked={isSelected} onChange={() => toggleProduct(product!.id)} className="rounded" /></td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-surface shrink-0" />
                          <span className="text-[13px] font-medium">{product!.name}</span>
                        </div>
                      </td>
                      <td><span className="text-[12px]">{product!.brand}</span></td>
                      <td><span className="text-[12px] text-muted">{product!.category}</span></td>
                      <td className="text-right"><span className="text-[13px] font-medium">{product!.price}</span></td>
                      <td className="text-center">
                        {product!.specSheet ? (
                          <span className="inline-flex rounded-full bg-emerald-light px-2 py-0.5 text-[10px] font-medium text-emerald">Available</span>
                        ) : (
                          <span className="text-[11px] text-muted">—</span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button className="rounded-lg p-1.5 text-muted hover:bg-surface"><Download size={13} /></button>
                          <button className="rounded-lg p-1.5 text-muted hover:bg-surface"><MessageCircle size={13} /></button>
                          <button className="rounded-lg p-1.5 text-muted hover:text-rose"><Trash2 size={13} /></button>
                        </div>
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
  );
}
