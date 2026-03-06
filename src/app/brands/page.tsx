"use client";

import { useState } from "react";
import Link from "next/link";
import { brands, products } from "@/lib/mock-data";
import { activityFeed } from "@/lib/intelligence-data";
import {
  Search, Package, MessageCircle, Send, Clock, CheckCircle2,
  AlertCircle, ChevronRight, Paperclip, Star, Filter,
  Archive, Inbox, ArrowUpRight, MoreHorizontal, User, Building2,
  Eye, Download, Tag, Heart, ExternalLink, Reply
} from "lucide-react";

// Mock enquiry threads
const enquiryThreads = [
  {
    id: "enq-1",
    brandId: "brand-5",
    brandName: "CoverVault Roofing",
    productName: "Standing Seam Panel",
    productId: "prod-5",
    subject: "Bulk pricing for 120m² roof area",
    status: "awaiting_reply" as const,
    priority: "high" as const,
    lastMessage: "Hi, we're looking for Standing Seam Panel pricing for approximately 120m² for the Mountain House project in Arrowtown. Could you provide a bulk quote?",
    lastSender: "You",
    lastDate: "2024-12-22T10:00:00Z",
    messages: 3,
    unread: 1,
    projectName: "Mountain House",
  },
  {
    id: "enq-2",
    brandId: "brand-3",
    brandName: "DuraLux Surfaces",
    productName: "Engineered Oak Panel",
    productId: "prod-3",
    subject: "85m² bulk pricing — Coastal Retreat",
    status: "replied" as const,
    priority: "medium" as const,
    lastMessage: "Thank you for your enquiry. We can offer a 12% discount for orders over 60m². I've attached the updated quote below. Lead time is 4-6 weeks from order confirmation.",
    lastSender: "DuraLux Surfaces",
    lastDate: "2024-12-21T16:30:00Z",
    messages: 5,
    unread: 0,
    projectName: "Coastal Retreat",
  },
  {
    id: "enq-3",
    brandId: "brand-6",
    brandName: "TerraRange",
    productName: "Pergola Kit 4x3",
    productId: "prod-11",
    subject: "Custom 5x4 pergola modification",
    status: "awaiting_reply" as const,
    priority: "medium" as const,
    lastMessage: "Yes, we can accommodate a 5x4 modification. I'll need to confirm the pricing with our production team. Expected turnaround is 2 business days.",
    lastSender: "TerraRange",
    lastDate: "2024-12-20T14:15:00Z",
    messages: 4,
    unread: 1,
    projectName: null,
  },
  {
    id: "enq-4",
    brandId: "brand-2",
    brandName: "Flōra Lighting",
    productName: "Pendant Light — Arc",
    productId: "prod-2",
    subject: "Custom finish options for cluster installation",
    status: "resolved" as const,
    priority: "low" as const,
    lastMessage: "Order confirmed! Your 3x Arc pendants in brushed brass will ship on January 8th. Tracking number will be emailed upon dispatch.",
    lastSender: "Flōra Lighting",
    lastDate: "2024-12-19T11:00:00Z",
    messages: 8,
    unread: 0,
    projectName: "Coastal Retreat",
  },
  {
    id: "enq-5",
    brandId: "brand-1",
    brandName: "Akaroa Kitchens",
    productName: "Island Benchtop 3m",
    productId: "prod-7",
    subject: "Waterfall edge detail and colour samples",
    status: "replied" as const,
    priority: "medium" as const,
    lastMessage: "We've dispatched the colour samples to the site address you provided. Expected delivery is 2-3 business days. The waterfall edge is included at no additional cost for the 3m island.",
    lastSender: "Akaroa Kitchens",
    lastDate: "2024-12-18T09:45:00Z",
    messages: 6,
    unread: 0,
    projectName: "Coastal Retreat",
  },
  {
    id: "enq-6",
    brandId: "brand-4",
    brandName: "Southmade Furniture",
    productName: "Dining Table — Niko",
    productId: "prod-10",
    subject: "2.4m walnut variant availability",
    status: "new" as const,
    priority: "high" as const,
    lastMessage: "",
    lastSender: "",
    lastDate: "2024-12-22T14:00:00Z",
    messages: 0,
    unread: 0,
    projectName: "Mountain House",
  },
];

export default function InboxPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedThread, setSelectedThread] = useState<string | null>("enq-1");
  const [replyText, setReplyText] = useState("");

  const statuses = [
    { key: "all", label: "All", count: enquiryThreads.length },
    { key: "awaiting_reply", label: "Awaiting Reply", count: enquiryThreads.filter(e => e.status === "awaiting_reply").length },
    { key: "replied", label: "Replied", count: enquiryThreads.filter(e => e.status === "replied").length },
    { key: "new", label: "New", count: enquiryThreads.filter(e => e.status === "new").length },
    { key: "resolved", label: "Resolved", count: enquiryThreads.filter(e => e.status === "resolved").length },
  ];

  let filtered = statusFilter === "all" ? enquiryThreads : enquiryThreads.filter(e => e.status === statusFilter);
  if (search) filtered = filtered.filter(e => e.brandName.toLowerCase().includes(search.toLowerCase()) || e.subject.toLowerCase().includes(search.toLowerCase()) || e.productName.toLowerCase().includes(search.toLowerCase()));

  const selected = enquiryThreads.find(e => e.id === selectedThread);
  const brand = selected ? brands.find(b => b.id === selected.brandId) : null;

  const statusConfig: Record<string, { color: string; icon: typeof Clock; label: string }> = {
    new: { color: "bg-blue-light text-blue", icon: Star, label: "New" },
    awaiting_reply: { color: "bg-amber-light text-amber", icon: Clock, label: "Awaiting Reply" },
    replied: { color: "bg-emerald-light text-emerald", icon: CheckCircle2, label: "Replied" },
    resolved: { color: "bg-surface text-muted", icon: Archive, label: "Resolved" },
  };

  const priorityColor: Record<string, string> = {
    high: "bg-rose-light text-rose",
    medium: "bg-amber-light text-amber",
    low: "bg-surface text-muted",
  };

  // Stats
  const activeCount = enquiryThreads.filter(e => e.status !== "resolved").length;
  const unreadCount = enquiryThreads.reduce((s, e) => s + e.unread, 0);
  const totalMessages = enquiryThreads.reduce((s, e) => s + e.messages, 0);

  return (
    <div className="min-h-screen bg-surface/50">
      <div className="border-b border-border bg-white px-8 py-6">
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">Inbox</p>
        <h1 className="mt-1 text-[28px] font-semibold tracking-tight">Enquiries & Messages</h1>
        <p className="mt-1 text-[13px] text-muted">Manage product enquiries, quotes, and brand communications.</p>
      </div>

      <div className="p-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Active Enquiries", value: activeCount.toString(), icon: Inbox, badge: unreadCount > 0 ? `${unreadCount} unread` : null },
            { label: "Total Messages", value: totalMessages.toString(), icon: MessageCircle },
            { label: "Brands Contacted", value: new Set(enquiryThreads.map(e => e.brandId)).size.toString(), icon: Building2 },
            { label: "Avg Response Time", value: "4.2h", icon: Clock },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="rounded-lg bg-surface p-1.5"><s.icon size={13} className="text-muted" /></div>
                {"badge" in s && s.badge && <span className="rounded-full bg-rose-light px-2 py-0.5 text-[10px] font-semibold text-rose">{s.badge}</span>}
              </div>
              <p className="text-[20px] font-semibold tracking-tight">{s.value}</p>
              <p className="text-[11px] text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Status filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-white p-1">
            {statuses.map((s) => (
              <button key={s.key} onClick={() => setStatusFilter(s.key)} className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${statusFilter === s.key ? "bg-foreground text-white" : "text-muted hover:bg-surface"}`}>
                {s.label} ({s.count})
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input type="text" placeholder="Search enquiries..." value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-lg border border-border bg-white pl-9 pr-3 py-2 text-[12px] w-48 placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-foreground" />
          </div>
        </div>

        {/* Inbox layout */}
        <div className="grid grid-cols-12 gap-0 rounded-2xl border border-border bg-white overflow-hidden min-h-[600px]">
          {/* Thread list */}
          <div className="col-span-5 border-r border-border overflow-y-auto">
            <div className="divide-y divide-border">
              {filtered.map((thread) => {
                const config = statusConfig[thread.status];
                const StatusIcon = config.icon;
                const isSelected = selectedThread === thread.id;
                return (
                  <button
                    key={thread.id}
                    onClick={() => setSelectedThread(thread.id)}
                    className={`w-full text-left px-5 py-4 transition-colors ${isSelected ? "bg-surface" : "hover:bg-surface/50"}`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center shrink-0">
                          <span className="text-[8px] font-bold text-white">{thread.brandName.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
                        </div>
                        <div>
                          <p className="text-[12px] font-semibold">{thread.brandName}</p>
                          <p className="text-[10px] text-muted">{thread.productName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {thread.unread > 0 && <span className="h-2 w-2 rounded-full bg-blue" />}
                        <span className="text-[10px] text-muted">{new Date(thread.lastDate).toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}</span>
                      </div>
                    </div>
                    <p className="text-[12px] font-medium mt-1 line-clamp-1">{thread.subject}</p>
                    {thread.lastMessage && (
                      <p className="text-[11px] text-muted mt-0.5 line-clamp-1">{thread.lastSender}: {thread.lastMessage}</p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${config.color}`}>
                        {config.label}
                      </span>
                      <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${priorityColor[thread.priority]}`}>
                        {thread.priority}
                      </span>
                      {thread.projectName && (
                        <span className="text-[9px] text-muted">{thread.projectName}</span>
                      )}
                      <span className="text-[9px] text-muted ml-auto">{thread.messages} msg{thread.messages !== 1 ? "s" : ""}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Thread detail */}
          <div className="col-span-7 flex flex-col">
            {selected ? (
              <>
                {/* Thread header */}
                <div className="px-6 py-4 border-b border-border">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-[15px] font-semibold">{selected.subject}</h3>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-muted">
                        <span className="flex items-center gap-1"><Building2 size={11} />{selected.brandName}</span>
                        <span className="flex items-center gap-1"><Package size={11} /><Link href={`/products/${selected.productId}`} className="hover:underline">{selected.productName}</Link></span>
                        {selected.projectName && <span className="flex items-center gap-1"><Tag size={11} />{selected.projectName}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(() => { const c = statusConfig[selected.status]; const I = c.icon; return (
                        <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.color}`}><I size={10} />{c.label}</span>
                      ); })()}
                      <button className="rounded-lg border border-border p-1.5 text-muted hover:bg-surface"><MoreHorizontal size={14} /></button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {/* Simulated message thread */}
                  {selected.status !== "new" ? (
                    <>
                      <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-surface flex items-center justify-center shrink-0">
                          <User size={12} className="text-muted" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-semibold">You</span>
                            <span className="text-[10px] text-muted">{new Date(selected.lastDate).toLocaleDateString("en-NZ", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                          <div className="mt-1 rounded-xl rounded-tl-sm bg-foreground text-white p-3">
                            <p className="text-[12px] leading-relaxed">Hi, I&apos;m interested in the {selected.productName}{selected.projectName ? ` for the ${selected.projectName} project` : ""}. {selected.subject}</p>
                          </div>
                        </div>
                      </div>

                      {selected.lastMessage && selected.lastSender !== "You" && (
                        <div className="flex gap-3">
                          <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center shrink-0">
                            <span className="text-[8px] font-bold text-white">{selected.brandName.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[12px] font-semibold">{selected.brandName}</span>
                              <span className="text-[10px] text-muted">{new Date(selected.lastDate).toLocaleDateString("en-NZ", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                            <div className="mt-1 rounded-xl rounded-tl-sm bg-surface p-3">
                              <p className="text-[12px] leading-relaxed text-foreground">{selected.lastMessage}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {selected.lastMessage && selected.lastSender === "You" && (
                        <div className="flex gap-3">
                          <div className="h-8 w-8 rounded-full bg-surface flex items-center justify-center shrink-0">
                            <User size={12} className="text-muted" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[12px] font-semibold">You</span>
                              <span className="text-[10px] text-muted">{new Date(selected.lastDate).toLocaleDateString("en-NZ", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                            <div className="mt-1 rounded-xl rounded-tl-sm bg-foreground text-white p-3">
                              <p className="text-[12px] leading-relaxed">{selected.lastMessage}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="rounded-full bg-blue-light p-3 mb-3"><Send size={18} className="text-blue" /></div>
                      <h4 className="text-[14px] font-semibold">Draft Enquiry</h4>
                      <p className="text-[12px] text-muted mt-1">Compose your message to {selected.brandName} about {selected.productName}.</p>
                    </div>
                  )}

                  {/* Product reference card */}
                  <div className="rounded-xl border border-border p-3 bg-surface/50">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted mb-2">Product Reference</p>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-surface flex items-center justify-center shrink-0">
                        <Package size={14} className="text-muted" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[12px] font-semibold">{selected.productName}</p>
                        <p className="text-[11px] text-muted">{selected.brandName}</p>
                      </div>
                      <Link href={`/products/${selected.productId}`} className="flex items-center gap-1 text-[11px] font-medium text-muted hover:text-foreground transition-colors">
                        View <ExternalLink size={10} />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Reply compose */}
                <div className="border-t border-border p-4">
                  <div className="rounded-xl border border-border bg-white p-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${selected.brandName}...`}
                      className="w-full resize-none text-[13px] placeholder:text-muted/50 focus:outline-none min-h-[60px]"
                      rows={2}
                    />
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                      <div className="flex items-center gap-2">
                        <button className="rounded-lg p-1.5 text-muted hover:bg-surface transition-colors"><Paperclip size={14} /></button>
                      </div>
                      <button className="flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-1.5 text-[12px] font-medium text-white hover:opacity-90 transition-opacity">
                        <Send size={12} /> Send Reply
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center">
                <Inbox size={32} className="text-muted mb-3" />
                <h3 className="text-[14px] font-semibold">Select a conversation</h3>
                <p className="text-[12px] text-muted mt-1">Choose an enquiry from the list to view details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
