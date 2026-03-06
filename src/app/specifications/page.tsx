"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { specifications } from "@/lib/intelligence-data";
import {
  FileText,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Edit3,
  FileCheck,
  Plus,
} from "lucide-react";

const statusConfig: Record<string, { label: string; icon: typeof FileText; color: string; bg: string }> = {
  draft: { label: "Draft", icon: Edit3, color: "text-neutral-500", bg: "bg-neutral-100" },
  review: { label: "In Review", icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
  approved: { label: "Approved", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  final: { label: "Final", icon: FileCheck, color: "text-blue-600", bg: "bg-blue-50" },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-NZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function SpecificationsPage() {
  return (
    <>
      <PageHeader
        title="Specification Engine"
        subtitle="Project-based specification lists organized by room. Convert design boards into detailed spec sheets for procurement and construction."
      />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <p className="text-sm text-muted">{specifications.length} specifications</p>
          <button className="flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-80">
            <Plus size={14} />
            New Specification
          </button>
        </div>

        <div className="space-y-4">
          {specifications.map((spec) => {
            const sc = statusConfig[spec.status];
            const StatusIcon = sc.icon;
            const totalItems = spec.rooms.reduce((a, r) => a + r.items.length, 0);
            const completedItems = spec.rooms.reduce(
              (a, r) => a + r.items.filter((item) => item.status === "installed").length,
              0
            );

            return (
              <Link
                key={spec.id}
                href={`/specifications/${spec.id}`}
                className="group flex items-center gap-6 rounded-2xl border border-border bg-white p-6 transition-all hover:shadow-lg hover:border-foreground/10"
              >
                {/* Icon */}
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${sc.bg}`}>
                  <StatusIcon size={20} className={sc.color} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold">{spec.projectName}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${sc.bg} ${sc.color}`}>
                      {sc.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted">{spec.architect}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {spec.rooms.map((room) => (
                      <span
                        key={room.id}
                        className="rounded-full bg-card px-2 py-0.5 text-[10px] text-muted"
                      >
                        {room.name} ({room.items.length})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Progress */}
                <div className="hidden shrink-0 text-right sm:block">
                  <p className="text-sm font-semibold">
                    {totalItems} items
                  </p>
                  <p className="text-xs text-muted">
                    {completedItems} installed
                  </p>
                  <div className="mt-2 h-1.5 w-24 rounded-full bg-border">
                    <div
                      className="h-1.5 rounded-full bg-foreground transition-all"
                      style={{
                        width: `${totalItems > 0 ? (completedItems / totalItems) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Meta */}
                <div className="hidden shrink-0 text-right sm:block">
                  <span className="flex items-center gap-1 text-xs text-muted">
                    <Clock size={12} />
                    {formatDate(spec.updatedAt)}
                  </span>
                </div>

                <ArrowRight
                  size={16}
                  className="shrink-0 text-muted transition-colors group-hover:text-foreground"
                />
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
