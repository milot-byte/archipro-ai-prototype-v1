"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  Crown,
  BarChart3,
  Package,
  Users,
  Building2,
  FolderKanban,
  Layers,
  ClipboardList,
  PenTool,
  MessageSquare,
  Mail,
  FileText,
  Settings,
  Bell,
  Search,
  PanelLeftClose,
  PanelLeft,
  ChevronDown,
  LogOut,
  HelpCircle,
  Plus,
  Sparkles,
  Target,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const intelligenceNav: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/intelligence/patterns", label: "Design Patterns", icon: Sparkles },
  { href: "/intelligence/matching", label: "AI Matching", icon: Target },
  { href: "/market-trends", label: "Market Trends", icon: BarChart3 },
  { href: "/momentum", label: "Product Momentum", icon: TrendingUp },
  { href: "/influence", label: "Architect Influence", icon: Crown },
];

const discoveryNav: NavItem[] = [
  { href: "/products", label: "Products", icon: Package, badge: "12" },
  { href: "/architects", label: "Architects", icon: Users },
  { href: "/brands", label: "Brands", icon: Building2 },
  { href: "/projects", label: "Projects", icon: FolderKanban },
];

const workspaceNav: NavItem[] = [
  { href: "/my-projects", label: "My Projects", icon: Layers, badge: "6" },
  { href: "/boards", label: "Design Boards", icon: Layers, badge: "6" },
  { href: "/specifications", label: "Specifications", icon: ClipboardList, badge: "3" },
  { href: "/brief", label: "Brief Builder", icon: PenTool },
];

const communicationNav: NavItem[] = [
  { href: "/inbox", label: "Inbox", icon: Mail, badge: "2" },
  { href: "/enquiries", label: "Enquiries", icon: MessageSquare, badge: "4" },
  { href: "/quotes", label: "Quotes", icon: FileText, badge: "3" },
];

function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all ${
        isActive
          ? "bg-foreground text-white"
          : "text-muted hover:bg-surface-hover hover:text-foreground"
      } ${collapsed ? "justify-center px-2" : ""}`}
      title={collapsed ? item.label : undefined}
    >
      <Icon size={16} strokeWidth={isActive ? 2 : 1.5} className="shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && (
            <span
              className={`min-w-[20px] rounded-full px-1.5 py-0.5 text-center text-[10px] font-medium leading-none ${
                isActive
                  ? "bg-white/20 text-white"
                  : "bg-surface text-muted"
              }`}
            >
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

function SectionLabel({ children, collapsed }: { children: React.ReactNode; collapsed: boolean }) {
  if (collapsed) return <div className="mx-auto my-3 h-px w-4 bg-border" />;
  return (
    <p className="mb-1 mt-6 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted/60">
      {children}
    </p>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-white transition-all duration-200 ${
        collapsed ? "w-[60px]" : "w-[240px]"
      }`}
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground">
              <span className="text-xs font-bold text-white">A</span>
            </div>
            <span className="text-[15px] font-semibold tracking-tight">ArchiPro</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg bg-foreground">
            <span className="text-xs font-bold text-white">A</span>
          </Link>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="rounded-md p-1 text-muted hover:bg-surface-hover hover:text-foreground"
          >
            <PanelLeftClose size={16} />
          </button>
        )}
      </div>

      {/* Search + Actions */}
      {!collapsed && (
        <div className="flex items-center gap-1.5 border-b border-border px-3 py-2.5">
          <button className="flex flex-1 items-center gap-2 rounded-lg bg-surface px-3 py-1.5 text-[12px] text-muted transition-colors hover:bg-surface-hover">
            <Search size={13} />
            <span>Search ArchiPro...</span>
            <kbd className="ml-auto rounded border border-border bg-white px-1 py-0.5 text-[9px] font-medium text-muted">⌘K</kbd>
          </button>
          <button className="rounded-lg p-1.5 text-muted hover:bg-surface-hover hover:text-foreground">
            <Bell size={16} />
          </button>
        </div>
      )}
      {collapsed && (
        <div className="flex flex-col items-center gap-1 border-b border-border py-2.5">
          <button className="rounded-lg p-2 text-muted hover:bg-surface-hover hover:text-foreground">
            <Search size={16} />
          </button>
          <button className="rounded-lg p-2 text-muted hover:bg-surface-hover hover:text-foreground">
            <Bell size={16} />
          </button>
        </div>
      )}

      {/* Quick action */}
      {!collapsed && (
        <div className="px-3 pt-3">
          <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2 text-[12px] font-medium text-muted transition-colors hover:border-foreground hover:text-foreground">
            <Plus size={14} />
            New Project
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <SectionLabel collapsed={collapsed}>Intelligence</SectionLabel>
        <div className="space-y-0.5">
          {intelligenceNav.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} />
          ))}
        </div>

        <SectionLabel collapsed={collapsed}>Discovery</SectionLabel>
        <div className="space-y-0.5">
          {discoveryNav.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} />
          ))}
        </div>

        <SectionLabel collapsed={collapsed}>Workspace</SectionLabel>
        <div className="space-y-0.5">
          {workspaceNav.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} />
          ))}
        </div>

        <SectionLabel collapsed={collapsed}>Communication</SectionLabel>
        <div className="space-y-0.5">
          {communicationNav.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} />
          ))}
        </div>
      </nav>

      {/* Collapse button when collapsed */}
      {collapsed && (
        <div className="border-t border-border p-2">
          <button
            onClick={() => setCollapsed(false)}
            className="mx-auto flex items-center justify-center rounded-md p-2 text-muted hover:bg-surface-hover hover:text-foreground"
          >
            <PanelLeft size={16} />
          </button>
        </div>
      )}

      {/* User */}
      {!collapsed && (
        <div className="relative border-t border-border p-3">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-hover"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-white">
              SM
            </div>
            <div className="flex-1 text-left">
              <p className="text-[13px] font-medium leading-tight">Sarah Mitchell</p>
              <p className="text-[11px] text-muted">Homeowner</p>
            </div>
            <ChevronDown size={14} className="text-muted" />
          </button>
          {userMenuOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-1 rounded-xl border border-border bg-white p-1.5 shadow-lg">
              <Link href="/dashboard" className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-muted hover:bg-surface-hover hover:text-foreground">
                <Settings size={14} />
                Account Settings
              </Link>
              <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-muted hover:bg-surface-hover hover:text-foreground">
                <HelpCircle size={14} />
                Help & Support
              </button>
              <div className="my-1 h-px bg-border" />
              <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-rose hover:bg-rose-light">
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
