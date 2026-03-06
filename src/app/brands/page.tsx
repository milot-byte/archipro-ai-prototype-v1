"use client";

import { useState } from "react";
import { brands, products } from "@/lib/mock-data";
import { Search, Package, ArrowRight, MessageCircle, ExternalLink } from "lucide-react";

export default function BrandsPage() {
  const [search, setSearch] = useState("");
  let filtered = brands;
  if (search) filtered = brands.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-surface/50">
      <div className="border-b border-border bg-white px-8 py-6">
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">Inbox</p>
        <h1 className="mt-1 text-[28px] font-semibold tracking-tight">Enquiries & Inbox</h1>
        <p className="mt-1 text-[13px] text-muted">Brands you&apos;ve enquired with and product communications.</p>
      </div>

      <div className="p-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="text-[24px] font-bold tracking-tight">4</p>
            <p className="text-[11px] text-muted">Active Enquiries</p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="text-[24px] font-bold tracking-tight">12</p>
            <p className="text-[11px] text-muted">Messages Sent</p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="text-[24px] font-bold tracking-tight">{brands.length}</p>
            <p className="text-[11px] text-muted">Brands Contacted</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium">{filtered.length} brands</span>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-lg border border-border bg-white pl-9 pr-3 py-2 text-[12px] w-48 placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-foreground" />
          </div>
        </div>

        {/* Brand list as enquiry threads */}
        <div className="rounded-2xl border border-border bg-white overflow-hidden">
          <div className="divide-y divide-border">
            {filtered.map((brand) => {
              const brandProducts = products.filter((p) => p.brandId === brand.id);
              return (
                <div key={brand.id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface/50 transition-colors cursor-pointer">
                  <div className="h-11 w-11 rounded-xl bg-foreground flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-white">{brand.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[14px] font-semibold">{brand.name}</h3>
                      <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-muted">{brand.category}</span>
                    </div>
                    <p className="mt-0.5 text-[12px] text-muted truncate">{brand.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-medium">{brand.productCount} products</p>
                    <p className="text-[11px] text-muted">{brandProducts.length} in your library</p>
                  </div>
                  <button className="rounded-lg border border-border px-3 py-1.5 text-[11px] font-medium text-muted hover:bg-foreground hover:text-white hover:border-foreground transition-colors shrink-0">
                    <MessageCircle size={12} className="inline mr-1" />Enquire
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
