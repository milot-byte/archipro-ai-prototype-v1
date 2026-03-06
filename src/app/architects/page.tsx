"use client";

import { useState } from "react";
import { architects } from "@/lib/mock-data";
import { architectInfluenceData } from "@/lib/intelligence-data";
import { Search, MapPin, FolderOpen, Crown, Heart, ExternalLink } from "lucide-react";

export default function ArchitectsPage() {
  const [search, setSearch] = useState("");
  let filtered = architects;
  if (search) filtered = architects.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.firm.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-surface/50">
      <div className="border-b border-border bg-white px-8 py-6">
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">Directory</p>
        <h1 className="mt-1 text-[28px] font-semibold tracking-tight">Saved Professionals</h1>
        <p className="mt-1 text-[13px] text-muted">Architecture studios and professionals you&apos;ve connected with.</p>
      </div>

      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium">{filtered.length} professionals</span>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-lg border border-border bg-white pl-9 pr-3 py-2 text-[12px] w-48 placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-foreground" />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((arch) => {
            const influence = architectInfluenceData.find((a) => a.architectId === arch.id);
            return (
              <div key={arch.id} className="group rounded-2xl border border-border bg-white overflow-hidden transition-all hover:shadow-md hover:border-foreground/10">
                <div className="h-32 bg-surface relative">
                  <button className="absolute top-3 right-3 rounded-full bg-white/90 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart size={14} className="text-muted" />
                  </button>
                </div>
                <div className="p-4 -mt-8 relative">
                  <div className="flex items-end gap-3">
                    <div className="h-14 w-14 rounded-full bg-white border-4 border-white shadow-sm flex items-center justify-center bg-surface shrink-0">
                      <span className="text-[11px] font-semibold text-muted">{arch.name.split(" ").map((n) => n[0]).join("")}</span>
                    </div>
                    {influence && (
                      <div className="mb-1 flex items-center gap-1.5">
                        <div className="flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold">
                          <Crown size={10} className={influence.tier === "Platinum" ? "text-foreground" : influence.tier === "Gold" ? "text-amber" : "text-muted"} />
                          {influence.influenceScore}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <h3 className="text-[15px] font-semibold">{arch.name}</h3>
                    <p className="text-[12px] text-muted">{arch.firm}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted"><MapPin size={10} />{arch.location}</p>
                  </div>
                  <p className="mt-2 text-[12px] text-muted line-clamp-2 leading-relaxed">{arch.bio}</p>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <div className="flex flex-wrap gap-1.5">
                      {arch.specialties.map((s) => (
                        <span key={s} className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-muted">{s}</span>
                      ))}
                    </div>
                    <span className="flex items-center gap-1 text-[11px] text-muted"><FolderOpen size={10} />{arch.projectCount}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
