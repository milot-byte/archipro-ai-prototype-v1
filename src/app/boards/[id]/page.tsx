"use client";

import { use } from "react";
import { useState } from "react";
import Link from "next/link";
import { designBoards } from "@/lib/intelligence-data";
import { products } from "@/lib/mock-data";
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
} from "lucide-react";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-NZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function BoardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const board = designBoards.find((b) => b.id === id);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [showConvert, setShowConvert] = useState(false);

  if (!board) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold">Board not found</h1>
        <Link href="/boards" className="mt-4 text-sm text-muted hover:text-foreground">
          Back to boards
        </Link>
      </div>
    );
  }

  const boardProducts = board.productIds
    .map((pid) => products.find((p) => p.id === pid))
    .filter(Boolean);

  const toggleProduct = (pid: string) => {
    const next = new Set(selectedProducts);
    if (next.has(pid)) next.delete(pid);
    else next.add(pid);
    setSelectedProducts(next);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {/* Back */}
      <Link
        href="/boards"
        className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft size={14} /> Back to boards
      </Link>

      {/* Header */}
      <div className="mt-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">{board.name}</h1>
            {board.isPublic ? (
              <span className="flex items-center gap-1 rounded-full bg-card px-2.5 py-1 text-xs text-muted">
                <Globe size={12} /> Public
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-card px-2.5 py-1 text-xs text-muted">
                <Lock size={12} /> Private
              </span>
            )}
          </div>
          <p className="mt-2 max-w-xl text-sm text-muted">{board.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-medium transition-colors hover:bg-card">
            <Share2 size={12} /> Share
          </button>
          <button className="flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-80">
            <Plus size={12} /> Add Product
          </button>
        </div>
      </div>

      {/* Meta bar */}
      <div className="mt-6 flex flex-wrap items-center gap-6 border-b border-border pb-6">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={board.owner.avatar}
            alt={board.owner.name}
            className="h-8 w-8 rounded-full bg-card object-cover"
          />
          <div>
            <p className="text-xs font-semibold">{board.owner.name}</p>
            <p className="text-[10px] text-muted capitalize">{board.owner.role}</p>
          </div>
        </div>
        {board.collaborators.length > 0 && (
          <div className="flex items-center gap-1">
            <Users size={14} className="text-muted" />
            <div className="flex -space-x-2">
              {board.collaborators.map((c, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={c.avatar}
                  alt={c.name}
                  className="h-6 w-6 rounded-full border-2 border-white bg-card object-cover"
                  title={c.name}
                />
              ))}
            </div>
            <span className="text-xs text-muted">{board.collaborators.length} collaborator{board.collaborators.length > 1 ? "s" : ""}</span>
          </div>
        )}
        <span className="flex items-center gap-1 text-xs text-muted">
          <Clock size={12} />
          Updated {formatDate(board.updatedAt)}
        </span>
      </div>

      {/* Actions bar when products selected */}
      {selectedProducts.size > 0 && (
        <div className="mt-6 flex items-center justify-between rounded-2xl bg-foreground px-5 py-3 text-white">
          <span className="text-sm font-medium">
            {selectedProducts.size} product{selectedProducts.size > 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConvert(true)}
              className="flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-medium text-foreground"
            >
              <Download size={12} /> Convert to Spec
            </button>
            <button
              onClick={() => setSelectedProducts(new Set())}
              className="flex items-center gap-1.5 rounded-full border border-neutral-600 px-4 py-1.5 text-xs font-medium text-white"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Convert to spec modal */}
      {showConvert && (
        <div className="mt-6 rounded-2xl border-2 border-foreground bg-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
              <Check size={18} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Convert to Specification</h3>
              <p className="text-xs text-muted">
                {selectedProducts.size} products will be added to a new specification sheet.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/specifications"
              className="rounded-full bg-foreground px-5 py-2 text-xs font-medium text-white"
            >
              Create Specification
            </Link>
            <button
              onClick={() => setShowConvert(false)}
              className="rounded-full border border-border px-5 py-2 text-xs font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Product grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {boardProducts.map((product) => {
          const isSelected = selectedProducts.has(product!.id);
          return (
            <div
              key={product!.id}
              className={`group relative rounded-2xl border bg-white overflow-hidden transition-all ${
                isSelected ? "border-foreground ring-2 ring-foreground/10" : "border-border hover:shadow-lg"
              }`}
            >
              {/* Select checkbox */}
              <button
                onClick={() => toggleProduct(product!.id)}
                className={`absolute top-3 left-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                  isSelected
                    ? "border-foreground bg-foreground text-white"
                    : "border-white/80 bg-white/80 text-transparent hover:border-foreground/50"
                }`}
              >
                <Check size={12} />
              </button>

              {/* Image */}
              <div className="aspect-square overflow-hidden bg-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product!.image}
                  alt={product!.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="p-4">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
                  {product!.brand}
                </p>
                <h3 className="mt-1 text-sm font-semibold">{product!.name}</h3>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-medium">{product!.price}</span>
                  <div className="flex gap-1">
                    {product!.specSheet && (
                      <button className="rounded-full bg-card p-1.5 text-muted transition-colors hover:bg-foreground hover:text-white">
                        <Download size={12} />
                      </button>
                    )}
                    <button className="rounded-full bg-card p-1.5 text-muted transition-colors hover:bg-foreground hover:text-white">
                      <MessageCircle size={12} />
                    </button>
                    <button className="rounded-full bg-card p-1.5 text-muted transition-colors hover:text-red-500">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add product placeholder */}
        <button className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/50 py-16 transition-colors hover:border-foreground/30">
          <Plus size={24} className="text-muted" />
          <span className="mt-2 text-sm text-muted">Add product</span>
        </button>
      </div>
    </div>
  );
}
