"use client";

import { useState } from "react";
import Link from "next/link";
import { brands, products } from "@/lib/mock-data";
import {
  Search, Package, FileText, Clock, CheckCircle2, AlertCircle,
  ArrowUpRight, ArrowDownRight, Building2, BarChart3, TrendingUp,
  Calendar, Download, Eye, DollarSign, ChevronRight, MoreHorizontal,
  Filter, Grid3x3, List, Star, Send
} from "lucide-react";

// Quote data
const quotes = [
  {
    id: "quote-1",
    brandId: "brand-5",
    brandName: "CoverVault Roofing",
    productName: "Standing Seam Panel",
    productId: "prod-5",
    projectName: "Mountain House",
    status: "active" as const,
    value: 11400,
    quantity: "120m²",
    unitPrice: "$95/m²",
    validUntil: "2025-01-22",
    createdAt: "2024-12-22T10:00:00Z",
    updatedAt: "2024-12-22T10:00:00Z",
    revisions: 1,
    discount: 0,
    leadTime: "6-8 weeks",
    notes: "Includes delivery to site. Custom colour — Charcoal Matte.",
  },
  {
    id: "quote-2",
    brandId: "brand-3",
    brandName: "DuraLux Surfaces",
    productName: "Engineered Oak Panel",
    productId: "prod-3",
    projectName: "Coastal Retreat",
    status: "active" as const,
    value: 13838,
    quantity: "85m²",
    unitPrice: "$185/m²",
    validUntil: "2025-01-21",
    createdAt: "2024-12-14T11:00:00Z",
    updatedAt: "2024-12-21T16:30:00Z",
    revisions: 2,
    discount: 12,
    leadTime: "4-6 weeks",
    notes: "12% bulk discount applied. Herringbone pattern for kitchen + living.",
  },
  {
    id: "quote-3",
    brandId: "brand-2",
    brandName: "Flōra Lighting",
    productName: "Pendant Light — Arc",
    productId: "prod-2",
    projectName: "Coastal Retreat",
    status: "accepted" as const,
    value: 960,
    quantity: "3 pcs",
    unitPrice: "$320/pc",
    validUntil: "2025-01-19",
    createdAt: "2024-12-08T14:00:00Z",
    updatedAt: "2024-12-19T11:00:00Z",
    revisions: 3,
    discount: 0,
    leadTime: "2-3 weeks",
    notes: "Brushed brass finish. Cluster configuration above dining table.",
  },
  {
    id: "quote-4",
    brandId: "brand-6",
    brandName: "TerraRange",
    productName: "Pergola Kit 4x3",
    productId: "prod-11",
    projectName: null,
    status: "pending" as const,
    value: 6200,
    quantity: "1 pc",
    unitPrice: "$6,200",
    validUntil: "2025-01-20",
    createdAt: "2024-12-16T10:00:00Z",
    updatedAt: "2024-12-20T14:15:00Z",
    revisions: 0,
    discount: 0,
    leadTime: "8-10 weeks",
    notes: "Custom 5x4 modification requested. Awaiting production confirmation.",
  },
  {
    id: "quote-5",
    brandId: "brand-1",
    brandName: "Akaroa Kitchens",
    productName: "Island Benchtop 3m",
    productId: "prod-7",
    projectName: "Coastal Retreat",
    status: "active" as const,
    value: 2400,
    quantity: "1 pc",
    unitPrice: "$2,400",
    validUntil: "2025-01-18",
    createdAt: "2024-12-10T08:00:00Z",
    updatedAt: "2024-12-18T09:45:00Z",
    revisions: 1,
    discount: 0,
    leadTime: "6-8 weeks",
    notes: "3m island with waterfall edge. Colour samples dispatched.",
  },
  {
    id: "quote-6",
    brandId: "brand-4",
    brandName: "Southmade Furniture",
    productName: "Dining Table — Niko",
    productId: "prod-10",
    projectName: "Mountain House",
    status: "expired" as const,
    value: 2800,
    quantity: "1 pc",
    unitPrice: "$2,800",
    validUntil: "2024-12-15",
    createdAt: "2024-11-28T09:00:00Z",
    updatedAt: "2024-12-01T14:00:00Z",
    revisions: 1,
    discount: 0,
    leadTime: "10-12 weeks",
    notes: "2.4m walnut variant. Quote expired — request renewal.",
  },
];

const statusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: "bg-blue-light text-blue", label: "Pending" },
  active: { color: "bg-emerald-light text-emerald", label: "Active" },
  accepted: { color: "bg-foreground text-white", label: "Accepted" },
  expired: { color: "bg-rose-light text-rose", label: "Expired" },
  declined: { color: "bg-surface text-muted", label: "Declined" },
};

export default function QuotesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);

  const statuses = [
    { key: "all", label: "All", count: quotes.length },
    { key: "active", label: "Active", count: quotes.filter(q => q.status === "active").length },
    { key: "pending", label: "Pending", count: quotes.filter(q => q.status === "pending").length },
    { key: "accepted", label: "Accepted", count: quotes.filter(q => q.status === "accepted").length },
    { key: "expired", label: "Expired", count: quotes.filter(q => q.status === "expired").length },
  ];

  let filtered = statusFilter === "all" ? quotes : quotes.filter(q => q.status === statusFilter);
  if (search) filtered = filtered.filter(q => q.brandName.toLowerCase().includes(search.toLowerCase()) || q.productName.toLowerCase().includes(search.toLowerCase()) || (q.projectName?.toLowerCase().includes(search.toLowerCase())));

  const selected = selectedQuote ? quotes.find(q => q.id === selectedQuote) : null;

  // Stats
  const totalValue = quotes.reduce((s, q) => s + q.value, 0);
  const activeValue = quotes.filter(q => q.status === "active").reduce((s, q) => s + q.value, 0);
  const acceptedValue = quotes.filter(q => q.status === "accepted").reduce((s, q) => s + q.value, 0);
  const avgDiscount = Math.round(quotes.filter(q => q.discount > 0).reduce((s, q) => s + q.discount, 0) / (quotes.filter(q => q.discount > 0).length || 1));
  const expiringCount = quotes.filter(q => {
    const days = Math.ceil((new Date(q.validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return q.status === "active" && days <= 14 && days > 0;
  }).length;

  return (
    <div className="min-h-screen bg-surface/50">
      <div className="border-b border-border bg-white px-8 py-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">Communication</p>
            <h1 className="mt-1 text-[28px] font-semibold tracking-tight">Quotes</h1>
            <p className="mt-1 text-[13px] text-muted">Track and manage product quotes — compare pricing, monitor validity, and convert to orders.</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-[13px] font-medium text-white hover:opacity-90">
            <Send size={14} /> Request Quote
          </button>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {[
            { label: "Total Pipeline", value: `$${totalValue.toLocaleString()}`, icon: DollarSign },
            { label: "Active Quotes", value: `$${activeValue.toLocaleString()}`, icon: FileText, badge: expiringCount > 0 ? `${expiringCount} expiring` : null },
            { label: "Accepted", value: `$${acceptedValue.toLocaleString()}`, icon: CheckCircle2 },
            { label: "Avg Discount", value: `${avgDiscount}%`, icon: TrendingUp },
            { label: "Brands Quoted", value: new Set(quotes.map(q => q.brandId)).size.toString(), icon: Building2 },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-border bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="rounded-lg bg-surface p-1.5"><s.icon size={13} className="text-muted" /></div>
                {"badge" in s && s.badge && <span className="rounded-full bg-amber-light px-2 py-0.5 text-[10px] font-semibold text-amber">{s.badge}</span>}
              </div>
              <p className="text-[20px] font-semibold tracking-tight">{s.value}</p>
              <p className="text-[11px] text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Pipeline bar */}
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-semibold">Quote Pipeline</h3>
            <span className="text-[11px] text-muted">${totalValue.toLocaleString()} total</span>
          </div>
          <div className="flex h-4 rounded-full overflow-hidden bg-surface">
            {[
              { status: "accepted", color: "bg-foreground" },
              { status: "active", color: "bg-emerald" },
              { status: "pending", color: "bg-blue" },
              { status: "expired", color: "bg-rose/40" },
            ].map(seg => {
              const segValue = quotes.filter(q => q.status === seg.status).reduce((s, q) => s + q.value, 0);
              return <div key={seg.status} className={`${seg.color} transition-all`} style={{ width: `${(segValue / totalValue) * 100}%` }} />;
            })}
          </div>
          <div className="flex items-center gap-4 mt-2">
            {[
              { label: "Accepted", color: "bg-foreground", value: acceptedValue },
              { label: "Active", color: "bg-emerald", value: activeValue },
              { label: "Pending", color: "bg-blue", value: quotes.filter(q => q.status === "pending").reduce((s, q) => s + q.value, 0) },
              { label: "Expired", color: "bg-rose/40", value: quotes.filter(q => q.status === "expired").reduce((s, q) => s + q.value, 0) },
            ].map(seg => (
              <span key={seg.label} className="flex items-center gap-1.5 text-[10px] text-muted">
                <span className={`h-2 w-2 rounded-full ${seg.color}`} />
                {seg.label} (${seg.value.toLocaleString()})
              </span>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-white p-1">
            {statuses.map(s => (
              <button key={s.key} onClick={() => setStatusFilter(s.key)} className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${statusFilter === s.key ? "bg-foreground text-white" : "text-muted hover:bg-surface"}`}>
                {s.label} ({s.count})
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input type="text" placeholder="Search quotes..." value={search} onChange={e => setSearch(e.target.value)} className="rounded-lg border border-border bg-white pl-9 pr-3 py-2 text-[12px] w-48 placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-foreground" />
          </div>
        </div>

        {/* Quote table */}
        <div className="rounded-2xl border border-border bg-white overflow-hidden">
          <table className="w-full table-premium">
            <thead>
              <tr>
                <th>Product</th>
                <th>Brand</th>
                <th>Project</th>
                <th className="text-center">Status</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Unit Price</th>
                <th className="text-right">Discount</th>
                <th className="text-right">Total</th>
                <th className="text-right">Valid Until</th>
                <th>Lead Time</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(quote => {
                const config = statusConfig[quote.status];
                const daysUntilExpiry = Math.ceil((new Date(quote.validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const isExpiringSoon = quote.status === "active" && daysUntilExpiry <= 14 && daysUntilExpiry > 0;

                return (
                  <tr key={quote.id} className="group cursor-pointer" onClick={() => setSelectedQuote(selectedQuote === quote.id ? null : quote.id)}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-surface flex items-center justify-center shrink-0">
                          <Package size={11} className="text-muted" />
                        </div>
                        <div>
                          <span className="text-[12px] font-medium">{quote.productName}</span>
                          <p className="text-[10px] text-muted">Rev. {quote.revisions}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className="text-[12px] text-muted">{quote.brandName}</span></td>
                    <td><span className="text-[12px] text-muted">{quote.projectName || "—"}</span></td>
                    <td className="text-center"><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${config.color}`}>{config.label}</span></td>
                    <td className="text-right"><span className="text-[12px]">{quote.quantity}</span></td>
                    <td className="text-right"><span className="text-[12px]">{quote.unitPrice}</span></td>
                    <td className="text-right">
                      {quote.discount > 0 ? (
                        <span className="text-[12px] font-semibold text-emerald">-{quote.discount}%</span>
                      ) : (
                        <span className="text-[12px] text-muted">—</span>
                      )}
                    </td>
                    <td className="text-right"><span className="text-[12px] font-semibold">${quote.value.toLocaleString()}</span></td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {isExpiringSoon && <AlertCircle size={10} className="text-amber" />}
                        <span className={`text-[12px] ${isExpiringSoon ? "text-amber font-semibold" : daysUntilExpiry < 0 ? "text-rose" : "text-muted"}`}>
                          {new Date(quote.validUntil).toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    </td>
                    <td><span className="text-[12px] text-muted">{quote.leadTime}</span></td>
                    <td><button className="rounded-lg p-1 text-muted opacity-0 group-hover:opacity-100 hover:bg-surface transition-all"><MoreHorizontal size={14} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Quote detail panel */}
        {selected && (
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-[16px] font-semibold">{selected.productName}</h3>
                <p className="text-[12px] text-muted mt-0.5">{selected.brandName}{selected.projectName ? ` · ${selected.projectName}` : ""}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusConfig[selected.status].color}`}>{statusConfig[selected.status].label}</span>
                {selected.status === "active" && (
                  <button className="flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-[12px] font-medium text-white hover:opacity-90">
                    <CheckCircle2 size={12} /> Accept Quote
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-border p-3">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted">Total Value</p>
                <p className="text-[22px] font-semibold mt-1">${selected.value.toLocaleString()}</p>
                {selected.discount > 0 && <p className="text-[11px] text-emerald font-semibold">{selected.discount}% discount applied</p>}
              </div>
              <div className="rounded-xl border border-border p-3">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted">Quantity</p>
                <p className="text-[22px] font-semibold mt-1">{selected.quantity}</p>
                <p className="text-[11px] text-muted">at {selected.unitPrice}</p>
              </div>
              <div className="rounded-xl border border-border p-3">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted">Lead Time</p>
                <p className="text-[22px] font-semibold mt-1">{selected.leadTime.split("-")[0]}–{selected.leadTime.split("-")[1]?.replace(" weeks", "")}</p>
                <p className="text-[11px] text-muted">weeks</p>
              </div>
              <div className="rounded-xl border border-border p-3">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted">Valid Until</p>
                <p className="text-[22px] font-semibold mt-1">{new Date(selected.validUntil).toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}</p>
                <p className="text-[11px] text-muted">{selected.revisions} revision{selected.revisions !== 1 ? "s" : ""}</p>
              </div>
            </div>

            {selected.notes && (
              <div className="mt-4 rounded-xl bg-surface/50 p-4">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted mb-1">Notes</p>
                <p className="text-[13px] leading-relaxed">{selected.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Brand comparison */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-6">
            <h3 className="text-[14px] font-semibold mb-1">Quote Value by Brand</h3>
            <p className="text-[11px] text-muted mb-4">Distribution of quote pipeline across suppliers</p>
            <div className="space-y-3">
              {Array.from(new Set(quotes.map(q => q.brandName))).map(brandName => {
                const brandQuotes = quotes.filter(q => q.brandName === brandName);
                const brandValue = brandQuotes.reduce((s, q) => s + q.value, 0);
                return (
                  <div key={brandName}>
                    <div className="flex items-center justify-between text-[12px] mb-1">
                      <span className="font-medium">{brandName}</span>
                      <div className="flex items-center gap-2 text-muted">
                        <span>{brandQuotes.length} quote{brandQuotes.length !== 1 ? "s" : ""}</span>
                        <span className="font-semibold text-foreground">${brandValue.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-surface overflow-hidden">
                      <div className="h-full rounded-full bg-foreground/60" style={{ width: `${(brandValue / totalValue) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6">
            <h3 className="text-[14px] font-semibold mb-1">Quote Value by Project</h3>
            <p className="text-[11px] text-muted mb-4">Spend allocation across your projects</p>
            <div className="space-y-3">
              {Array.from(new Set(quotes.map(q => q.projectName || "Unassigned"))).map(projName => {
                const projQuotes = quotes.filter(q => (q.projectName || "Unassigned") === projName);
                const projValue = projQuotes.reduce((s, q) => s + q.value, 0);
                return (
                  <div key={projName}>
                    <div className="flex items-center justify-between text-[12px] mb-1">
                      <span className="font-medium">{projName}</span>
                      <div className="flex items-center gap-2 text-muted">
                        <span>{projQuotes.length} quote{projQuotes.length !== 1 ? "s" : ""}</span>
                        <span className="font-semibold text-foreground">${projValue.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-surface overflow-hidden">
                      <div className="h-full rounded-full bg-emerald/60" style={{ width: `${(projValue / totalValue) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
