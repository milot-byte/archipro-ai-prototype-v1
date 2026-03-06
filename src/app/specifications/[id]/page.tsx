"use client";

import { use } from "react";
import { useState } from "react";
import Link from "next/link";
import { specifications } from "@/lib/intelligence-data";
import { products } from "@/lib/mock-data";
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
} from "lucide-react";

const itemStatusConfig: Record<string, { label: string; icon: typeof Circle; color: string; bg: string }> = {
  specified: { label: "Specified", icon: Circle, color: "text-neutral-400", bg: "bg-neutral-100" },
  ordered: { label: "Ordered", icon: Package, color: "text-blue-500", bg: "bg-blue-50" },
  delivered: { label: "Delivered", icon: Truck, color: "text-amber-500", bg: "bg-amber-50" },
  installed: { label: "Installed", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
};

const specStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "text-neutral-600", bg: "bg-neutral-100" },
  review: { label: "In Review", color: "text-amber-600", bg: "bg-amber-50" },
  approved: { label: "Approved", color: "text-emerald-600", bg: "bg-emerald-50" },
  final: { label: "Final", color: "text-blue-600", bg: "bg-blue-50" },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-NZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function SpecDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const spec = specifications.find((s) => s.id === id);
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(
    new Set(spec?.rooms.map((r) => r.id) || [])
  );

  if (!spec) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold">Specification not found</h1>
        <Link href="/specifications" className="mt-4 text-sm text-muted hover:text-foreground">
          Back to specifications
        </Link>
      </div>
    );
  }

  const totalItems = spec.rooms.reduce((a, r) => a + r.items.length, 0);
  const statusCounts = spec.rooms.reduce(
    (acc, r) => {
      r.items.forEach((item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
      });
      return acc;
    },
    {} as Record<string, number>
  );

  const sc = specStatusConfig[spec.status];

  const toggleRoom = (roomId: string) => {
    const next = new Set(expandedRooms);
    if (next.has(roomId)) next.delete(roomId);
    else next.add(roomId);
    setExpandedRooms(next);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {/* Back */}
      <Link
        href="/specifications"
        className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft size={14} /> Back to specifications
      </Link>

      {/* Header */}
      <div className="mt-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">{spec.projectName}</h1>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${sc.bg} ${sc.color}`}>
              {sc.label}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">
            Specification by {spec.architect} — Updated {formatDate(spec.updatedAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-medium transition-colors hover:bg-card">
            <Printer size={12} /> Print
          </button>
          <button className="flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-80">
            <Download size={12} /> Export PDF
          </button>
        </div>
      </div>

      {/* Status summary */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-xl border border-border bg-white p-4 text-center">
          <p className="text-2xl font-bold">{totalItems}</p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted">Total Items</p>
        </div>
        {Object.entries(itemStatusConfig).map(([status, config]) => {
          const Icon = config.icon;
          return (
            <div key={status} className="rounded-xl border border-border bg-white p-4 text-center">
              <Icon size={16} className={`mx-auto ${config.color}`} />
              <p className="mt-1 text-2xl font-bold">{statusCounts[status] || 0}</p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
                {config.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="flex h-3 overflow-hidden rounded-full bg-neutral-100">
          {["installed", "delivered", "ordered", "specified"].map((status) => {
            const count = statusCounts[status] || 0;
            const pct = totalItems > 0 ? (count / totalItems) * 100 : 0;
            const colors: Record<string, string> = {
              installed: "bg-emerald-500",
              delivered: "bg-amber-400",
              ordered: "bg-blue-400",
              specified: "bg-neutral-300",
            };
            return (
              <div
                key={status}
                className={`${colors[status]} transition-all`}
                style={{ width: `${pct}%` }}
              />
            );
          })}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-muted">
          <span>0%</span>
          <span>{Math.round(((statusCounts.installed || 0) / totalItems) * 100)}% installed</span>
          <span>100%</span>
        </div>
      </div>

      {/* Room sections */}
      <div className="mt-10 space-y-4">
        {spec.rooms.map((room) => {
          const isExpanded = expandedRooms.has(room.id);
          const roomInstalled = room.items.filter((i) => i.status === "installed").length;

          return (
            <div key={room.id} className="rounded-2xl border border-border bg-white overflow-hidden">
              {/* Room header */}
              <button
                onClick={() => toggleRoom(room.id)}
                className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-card/50"
              >
                <div className="flex items-center gap-3">
                  <Wrench size={16} className="text-muted" />
                  <h2 className="text-base font-semibold">{room.name}</h2>
                  <span className="rounded-full bg-card px-2 py-0.5 text-xs text-muted">
                    {room.items.length} items
                  </span>
                  {roomInstalled === room.items.length && room.items.length > 0 && (
                    <CheckCircle2 size={14} className="text-emerald-500" />
                  )}
                </div>
                {isExpanded ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
              </button>

              {/* Items table */}
              {isExpanded && (
                <div className="border-t border-border">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-card/50 text-left text-[10px] font-semibold uppercase tracking-wider text-muted">
                        <th className="px-6 py-3">Product</th>
                        <th className="px-6 py-3">Brand</th>
                        <th className="px-6 py-3">Qty</th>
                        <th className="px-6 py-3">Notes</th>
                        <th className="px-6 py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {room.items.map((item, i) => {
                        const isc = itemStatusConfig[item.status];
                        const StatusIcon = isc.icon;
                        const product = products.find((p) => p.id === item.productId);

                        return (
                          <tr
                            key={i}
                            className="border-t border-border last:border-0 hover:bg-card/30"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {product && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={product.image}
                                    alt={item.productName}
                                    className="h-10 w-10 rounded-lg bg-card object-cover"
                                  />
                                )}
                                <div>
                                  <p className="text-sm font-medium">{item.productName}</p>
                                  <p className="text-[10px] text-muted">{item.category}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-muted">{item.brand}</td>
                            <td className="px-6 py-4 text-sm font-medium">
                              {item.quantity} {item.unit}
                            </td>
                            <td className="px-6 py-4 text-xs text-muted max-w-xs truncate">
                              {item.notes}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${isc.bg} ${isc.color}`}>
                                <StatusIcon size={10} />
                                {isc.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
