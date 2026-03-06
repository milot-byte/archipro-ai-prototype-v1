"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { designBoards } from "@/lib/intelligence-data";
import { products } from "@/lib/mock-data";
import {
  LayoutGrid,
  Lock,
  Globe,
  Clock,
  Users,
  Plus,
  ArrowRight,
} from "lucide-react";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-NZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function BoardsPage() {
  const [filter, setFilter] = useState<"all" | "architect" | "homeowner">("all");

  const filtered =
    filter === "all"
      ? designBoards
      : designBoards.filter((b) => b.owner.role === filter);

  return (
    <>
      <PageHeader
        title="Design Boards"
        subtitle="Collaborative boards where architects and homeowners collect products, organise ideas, and convert selections into specifications."
      />
      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Actions */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            {[
              { value: "all" as const, label: "All Boards" },
              { value: "architect" as const, label: "Architect" },
              { value: "homeowner" as const, label: "Homeowner" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  filter === f.value
                    ? "bg-foreground text-white"
                    : "bg-card text-muted hover:bg-foreground/10"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-80">
            <Plus size={14} />
            New Board
          </button>
        </div>

        {/* Board cards */}
        <div className="grid gap-6 sm:grid-cols-2">
          {filtered.map((board) => {
            const boardProducts = board.productIds
              .map((id) => products.find((p) => p.id === id))
              .filter(Boolean);

            return (
              <Link
                key={board.id}
                href={`/boards/${board.id}`}
                className="group rounded-2xl border border-border bg-white overflow-hidden transition-all hover:shadow-lg hover:border-foreground/10"
              >
                {/* Product thumbnails strip */}
                <div className="flex h-32 overflow-hidden bg-card">
                  {boardProducts.slice(0, 4).map((prod, i) => (
                    <div key={prod!.id} className="flex-1 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={prod!.image}
                        alt={prod!.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ))}
                  {boardProducts.length === 0 && (
                    <div className="flex flex-1 items-center justify-center">
                      <LayoutGrid size={24} className="text-muted" />
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-semibold group-hover:text-foreground">
                        {board.name}
                      </h3>
                      <p className="mt-1 text-xs text-muted line-clamp-2">
                        {board.description}
                      </p>
                    </div>
                    {board.isPublic ? (
                      <Globe size={14} className="shrink-0 text-muted" />
                    ) : (
                      <Lock size={14} className="shrink-0 text-muted" />
                    )}
                  </div>

                  {/* Owner */}
                  <div className="mt-4 flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={board.owner.avatar}
                      alt={board.owner.name}
                      className="h-6 w-6 rounded-full bg-card object-cover"
                    />
                    <span className="text-xs font-medium">{board.owner.name}</span>
                    <Badge>{board.owner.role}</Badge>
                  </div>

                  {/* Footer meta */}
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    <div className="flex items-center gap-4 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <LayoutGrid size={12} />
                        {board.productIds.length} products
                      </span>
                      {board.collaborators.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {board.collaborators.length + 1}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDate(board.updatedAt)}
                      </span>
                    </div>
                    <ArrowRight size={14} className="text-muted group-hover:text-foreground transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
