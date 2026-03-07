"use client";

import { useState } from "react";
import Link from "next/link";
import { brands } from "@/lib/mock-data";
import {
  Search, MessageCircle, Send, Clock, CheckCircle2,
  Star, Archive, Inbox as InboxIcon, MoreHorizontal, User, Building2,
  Package, Tag, Paperclip, ExternalLink, Reply, Mail, Filter,
  ArrowUpRight, Pin, Bell, ChevronRight
} from "lucide-react";

// Full inbox messages (broader than just enquiries)
const inboxMessages = [
  {
    id: "msg-1",
    from: "Elena Vasquez",
    fromRole: "architect" as const,
    subject: "Coastal Retreat — Kitchen spec update",
    preview: "I've updated the kitchen specification with the new benchtop selection. Can you review and approve the changes before we submit to the supplier?",
    date: "2024-12-22T14:30:00Z",
    unread: true,
    starred: true,
    category: "project" as const,
    projectName: "Coastal Retreat",
    threadCount: 8,
  },
  {
    id: "msg-2",
    from: "CoverVault Roofing",
    fromRole: "brand" as const,
    subject: "Quote ready — Standing Seam Panel 120m²",
    preview: "Your quote for the Standing Seam Panel (120m² for Mountain House) is ready. Total: $11,400 incl. GST. Valid for 30 days.",
    date: "2024-12-22T10:15:00Z",
    unread: true,
    starred: false,
    category: "quote" as const,
    projectName: "Mountain House",
    threadCount: 4,
  },
  {
    id: "msg-3",
    from: "ArchiPro",
    fromRole: "brand" as const,
    subject: "Weekly Intelligence Report — Dec 16-22",
    preview: "Your projects received 2,840 views this week (+18% vs last week). Pendant Light — Arc continues to surge with 62% growth in saves.",
    date: "2024-12-22T08:00:00Z",
    unread: true,
    starred: false,
    category: "system" as const,
    projectName: null,
    threadCount: 1,
  },
  {
    id: "msg-4",
    from: "DuraLux Surfaces",
    fromRole: "brand" as const,
    subject: "RE: 85m² bulk pricing — Coastal Retreat",
    preview: "Thank you for your enquiry. We can offer a 12% discount for orders over 60m². I've attached the updated quote below.",
    date: "2024-12-21T16:30:00Z",
    unread: false,
    starred: false,
    category: "enquiry" as const,
    projectName: "Coastal Retreat",
    threadCount: 5,
  },
  {
    id: "msg-5",
    from: "Marcus Reid",
    fromRole: "architect" as const,
    subject: "Mountain House — Board shared with you",
    preview: "I've shared the Mountain House Interior board with you. Take a look at the furniture selections and let me know your thoughts.",
    date: "2024-12-21T11:00:00Z",
    unread: false,
    starred: true,
    category: "project" as const,
    projectName: "Mountain House",
    threadCount: 3,
  },
  {
    id: "msg-6",
    from: "Flōra Lighting",
    fromRole: "brand" as const,
    subject: "Order confirmed — 3x Arc Pendants",
    preview: "Order confirmed! Your 3x Arc pendants in brushed brass will ship on January 8th. Tracking number will be emailed upon dispatch.",
    date: "2024-12-19T11:00:00Z",
    unread: false,
    starred: false,
    category: "order" as const,
    projectName: "Coastal Retreat",
    threadCount: 8,
  },
  {
    id: "msg-7",
    from: "Akaroa Kitchens",
    fromRole: "brand" as const,
    subject: "Colour samples dispatched",
    preview: "We've dispatched the colour samples to the site address you provided. Expected delivery is 2-3 business days.",
    date: "2024-12-18T09:45:00Z",
    unread: false,
    starred: false,
    category: "enquiry" as const,
    projectName: "Coastal Retreat",
    threadCount: 6,
  },
  {
    id: "msg-8",
    from: "Sophie Müller",
    fromRole: "architect" as const,
    subject: "Garden Pavilion — Final spec approved",
    preview: "Great news! The Garden Pavilion specification has been approved by the client. All items are confirmed and ready for ordering.",
    date: "2024-12-17T15:20:00Z",
    unread: false,
    starred: false,
    category: "project" as const,
    projectName: "Garden Pavilion",
    threadCount: 12,
  },
];

const categoryConfig: Record<string, { color: string; label: string }> = {
  project: { color: "bg-blue-light text-blue", label: "Project" },
  enquiry: { color: "bg-amber-light text-amber", label: "Enquiry" },
  quote: { color: "bg-emerald-light text-emerald", label: "Quote" },
  order: { color: "bg-foreground text-white", label: "Order" },
  system: { color: "bg-surface text-muted", label: "System" },
};

export default function InboxPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedMsg, setSelectedMsg] = useState<string | null>("msg-1");
  const [replyText, setReplyText] = useState("");

  const filters = [
    { key: "all", label: "All", count: inboxMessages.length },
    { key: "unread", label: "Unread", count: inboxMessages.filter(m => m.unread).length },
    { key: "starred", label: "Starred", count: inboxMessages.filter(m => m.starred).length },
    { key: "project", label: "Projects", count: inboxMessages.filter(m => m.category === "project").length },
    { key: "enquiry", label: "Enquiries", count: inboxMessages.filter(m => m.category === "enquiry").length },
    { key: "quote", label: "Quotes", count: inboxMessages.filter(m => m.category === "quote" || m.category === "order").length },
  ];

  let filtered = filter === "all" ? inboxMessages :
    filter === "unread" ? inboxMessages.filter(m => m.unread) :
    filter === "starred" ? inboxMessages.filter(m => m.starred) :
    filter === "quote" ? inboxMessages.filter(m => m.category === "quote" || m.category === "order") :
    inboxMessages.filter(m => m.category === filter);
  if (search) filtered = filtered.filter(m => m.from.toLowerCase().includes(search.toLowerCase()) || m.subject.toLowerCase().includes(search.toLowerCase()));

  const selected = inboxMessages.find(m => m.id === selectedMsg);

  // Stats
  const unreadCount = inboxMessages.filter(m => m.unread).length;
  const totalThreads = inboxMessages.length;
  const projectMsgs = inboxMessages.filter(m => m.category === "project").length;
  const brandMsgs = inboxMessages.filter(m => m.category === "enquiry" || m.category === "quote" || m.category === "order").length;

  return (
    <div className="min-h-screen bg-surface/50">
      <div className="border-b border-border bg-white px-8 py-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">Communication</p>
            <h1 className="mt-1 text-[28px] font-semibold tracking-tight">Inbox</h1>
            <p className="mt-1 text-[13px] text-muted">All messages — project updates, brand communications, quotes, and system notifications.</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-[13px] font-medium text-white hover:opacity-90">
            <Send size={14} /> Compose
          </button>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Unread Messages", value: unreadCount.toString(), icon: Mail, badge: unreadCount > 0 ? "new" : null },
            { label: "Total Threads", value: totalThreads.toString(), icon: MessageCircle },
            { label: "Project Messages", value: projectMsgs.toString(), icon: Building2 },
            { label: "Brand Communications", value: brandMsgs.toString(), icon: Package },
          ].map(s => (
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

        {/* Filter bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-white p-1">
            {filters.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${filter === f.key ? "bg-foreground text-white" : "text-muted hover:bg-surface"}`}>
                {f.label} ({f.count})
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input type="text" placeholder="Search messages..." value={search} onChange={e => setSearch(e.target.value)} className="rounded-lg border border-border bg-white pl-9 pr-3 py-2 text-[12px] w-48 placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-foreground" />
          </div>
        </div>

        {/* Split inbox */}
        <div className="grid grid-cols-12 gap-0 rounded-2xl border border-border bg-white overflow-hidden min-h-[600px]">
          {/* Message list */}
          <div className="col-span-5 border-r border-border overflow-y-auto">
            <div className="divide-y divide-border">
              {filtered.map(msg => {
                const isSelected = selectedMsg === msg.id;
                const catConfig = categoryConfig[msg.category];
                return (
                  <button key={msg.id} onClick={() => setSelectedMsg(msg.id)} className={`w-full text-left px-5 py-4 transition-colors ${isSelected ? "bg-surface" : "hover:bg-surface/50"}`}>
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${msg.fromRole === "architect" ? "bg-foreground/80" : msg.fromRole === "brand" ? "bg-foreground" : "bg-surface"}`}>
                          <span className="text-[8px] font-bold text-white">{msg.from.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
                        </div>
                        <div>
                          <p className={`text-[12px] ${msg.unread ? "font-bold" : "font-medium"}`}>{msg.from}</p>
                          <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${catConfig.color}`}>{catConfig.label}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {msg.starred && <Star size={10} className="text-amber fill-amber" />}
                        {msg.unread && <span className="h-2 w-2 rounded-full bg-blue" />}
                        <span className="text-[10px] text-muted">{new Date(msg.date).toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}</span>
                      </div>
                    </div>
                    <p className={`text-[12px] mt-1 line-clamp-1 ${msg.unread ? "font-semibold" : "font-medium"}`}>{msg.subject}</p>
                    <p className="text-[11px] text-muted mt-0.5 line-clamp-1">{msg.preview}</p>
                    <div className="mt-2 flex items-center gap-2 text-[9px] text-muted">
                      {msg.projectName && <span className="flex items-center gap-0.5"><Tag size={8} />{msg.projectName}</span>}
                      <span className="flex items-center gap-0.5"><MessageCircle size={8} />{msg.threadCount}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message detail */}
          <div className="col-span-7 flex flex-col">
            {selected ? (
              <>
                <div className="px-6 py-4 border-b border-border">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-[15px] font-semibold">{selected.subject}</h3>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-muted">
                        <span className="flex items-center gap-1"><User size={11} />{selected.from}</span>
                        {selected.projectName && <span className="flex items-center gap-1"><Tag size={11} />{selected.projectName}</span>}
                        <span>{new Date(selected.date).toLocaleDateString("en-NZ", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button className={`rounded-lg p-1.5 transition-colors ${selected.starred ? "text-amber" : "text-muted hover:text-amber"}`}><Star size={14} /></button>
                      <button className="rounded-lg p-1.5 text-muted hover:bg-surface"><Pin size={14} /></button>
                      <button className="rounded-lg p-1.5 text-muted hover:bg-surface"><Archive size={14} /></button>
                      <button className="rounded-lg p-1.5 text-muted hover:bg-surface"><MoreHorizontal size={14} /></button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {/* Message content */}
                  <div className="flex gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${selected.fromRole === "architect" ? "bg-foreground/80" : "bg-foreground"}`}>
                      <span className="text-[8px] font-bold text-white">{selected.from.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-semibold">{selected.from}</span>
                        <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${categoryConfig[selected.category].color}`}>{categoryConfig[selected.category].label}</span>
                        <span className="text-[10px] text-muted">{new Date(selected.date).toLocaleDateString("en-NZ", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <div className="mt-2 rounded-xl bg-surface p-4">
                        <p className="text-[13px] leading-relaxed">{selected.preview}</p>
                      </div>
                    </div>
                  </div>

                  {/* Thread summary */}
                  {selected.threadCount > 1 && (
                    <div className="flex items-center justify-center py-2">
                      <span className="text-[11px] text-muted">{selected.threadCount - 1} earlier message{selected.threadCount > 2 ? "s" : ""} in this thread</span>
                    </div>
                  )}

                  {/* Context cards */}
                  {selected.projectName && (
                    <div className="rounded-xl border border-border p-3 bg-surface/50">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted mb-2">Related Project</p>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-surface flex items-center justify-center shrink-0">
                          <Building2 size={14} className="text-muted" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[12px] font-semibold">{selected.projectName}</p>
                          <p className="text-[11px] text-muted">Active project</p>
                        </div>
                        <ChevronRight size={14} className="text-muted" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Reply */}
                <div className="border-t border-border p-4">
                  <div className="rounded-xl border border-border bg-white p-3">
                    <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder={`Reply to ${selected.from}...`} className="w-full resize-none text-[13px] placeholder:text-muted/50 focus:outline-none min-h-[60px]" rows={2} />
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                      <button className="rounded-lg p-1.5 text-muted hover:bg-surface transition-colors"><Paperclip size={14} /></button>
                      <button className="flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-1.5 text-[12px] font-medium text-white hover:opacity-90 transition-opacity">
                        <Send size={12} /> Reply
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center">
                <InboxIcon size={32} className="text-muted mb-3" />
                <h3 className="text-[14px] font-semibold">Select a message</h3>
                <p className="text-[12px] text-muted mt-1">Choose a message from the list to view details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
