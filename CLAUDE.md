# CLAUDE.md

## Project Overview

**ArchiPro Intelligence** — Full-featured AI-powered architecture intelligence platform. A modern SaaS connecting homeowners, architects, and brands through real-time activity tracking, influence scoring, product momentum analytics, collaborative design boards, and specification management.

This is a frontend prototype with comprehensive mock data. Backend functionality is simulated.

## Repository Structure

```
src/
├── app/                                # Next.js App Router pages
│   ├── layout.tsx                      # Root layout (navbar + footer)
│   ├── page.tsx                        # Home page — Intelligence platform hero
│   │
│   │  ── Intelligence Modules ──
│   ├── activity/page.tsx               # Live Activity Dashboard (real-time feed)
│   ├── influence/page.tsx              # Architect Influence Score leaderboard
│   ├── momentum/page.tsx               # Product Momentum dashboard
│   ├── network/page.tsx                # Product Influence Network (SVG graph)
│   │
│   │  ── Workflow Modules ──
│   ├── boards/page.tsx                 # Design Boards listing
│   ├── boards/[id]/page.tsx            # Board detail — product grid + convert to spec
│   ├── specifications/page.tsx         # Specification Engine listing
│   ├── specifications/[id]/page.tsx    # Spec detail — room tables + status tracking
│   │
│   │  ── Core Platform ──
│   ├── discover/page.tsx               # Browse architecture projects
│   ├── architects/page.tsx             # Architect directory
│   ├── brands/page.tsx                 # Brand/supplier directory
│   ├── products/page.tsx               # Product library
│   ├── projects/[id]/page.tsx          # Project detail (SSG)
│   ├── dashboard/page.tsx              # Analytics dashboard
│   └── brief/page.tsx                  # AI design brief generator
│
├── components/
│   └── ui/                             # Reusable UI components
│       ├── navbar.tsx                  # Sticky nav with dropdown menus
│       ├── footer.tsx                  # Site footer
│       ├── card.tsx                    # Card, CardImage, CardBody
│       ├── badge.tsx                   # Tag/label badge
│       ├── section.tsx                 # Page section wrapper
│       ├── page-header.tsx             # Page title header
│       └── stat-card.tsx               # Analytics stat card with trend
│
├── lib/
│   ├── mock-data.ts                    # Core data: architects, brands, products, projects
│   └── intelligence-data.ts            # Intelligence data: activity feed, influence scores,
│                                       #   momentum, network graph, boards, specifications
│
├── emails/                             # Transactional email templates (HTML string output)
│   ├── onboarding.tsx                  # Welcome email
│   ├── engagement-alert.tsx            # Engagement notification
│   ├── milestone.tsx                   # Milestone achievement
│   ├── product-saved.tsx               # Product saved notification
│   ├── spec-downloaded.tsx             # Spec download notification
│   ├── product-trending.tsx            # Product trending alert
│   └── enquiry-submitted.tsx           # Enquiry received notification
│
└── styles/
    └── globals.css                     # Global styles + Tailwind theme tokens
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS 4
- **Icons**: Lucide React
- **Package Manager**: npm

## Development Setup

```bash
npm install          # Install dependencies
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint
```

## Key Commands

| Command         | Description                    |
|-----------------|--------------------------------|
| `npm run dev`   | Start dev server on port 3000  |
| `npm run build` | Create production build        |
| `npm run start` | Serve production build         |
| `npm run lint`  | Lint with ESLint               |

## Code Conventions

- **Components**: Functional components, exported as named exports
- **Styling**: TailwindCSS utility classes only — no CSS modules or styled-components
- **Color palette**: Black (#0a0a0a), white (#ffffff), greys (#737373, #e5e5e5, #fafafa) — Apple-style minimalism
- **Typography**: System font stack (Inter / -apple-system / BlinkMacSystemFont)
- **File naming**: Kebab-case for files (e.g., `page-header.tsx`, `intelligence-data.ts`)
- **Imports**: Use `@/*` path alias (maps to `src/*`)
- **Client components**: Mark with `"use client"` only when using hooks/interactivity
- **Images**: Using `placehold.co` placeholder images — replace with real assets in production
- Do not commit secrets, API keys, or credentials — use environment variables

## Design System

The UI follows a strict black/white/grey palette with an Apple-inspired minimalist aesthetic:

- **Theme tokens** defined in `src/styles/globals.css` under `@theme`
- **Rounded corners**: `rounded-2xl` (16px) for cards and containers
- **Cards**: `Card` / `CardImage` / `CardBody` composable pattern
- **Hover effects**: Subtle shadow (`hover:shadow-lg`) and scale (`group-hover:scale-105`)
- **Status colors**: Emerald (success), Amber (warning/review), Blue (info), Rose (alert)
- **Score visualizations**: SVG ring charts, segmented bar charts, sparklines

## Pages

### Intelligence Modules

| Route              | Description                                          | Type    |
|--------------------|------------------------------------------------------|---------|
| `/activity`        | Live activity feed — saves, downloads, enquiries, board adds, visits | Client  |
| `/influence`       | Architect Influence Score — leaderboard with expandable metrics | Client  |
| `/momentum`        | Product Momentum — trending products with growth metrics | Client  |
| `/network`         | Product Influence Network — interactive SVG graph with zoom/filter | Client  |

### Workflow Modules

| Route                  | Description                                       | Type    |
|------------------------|---------------------------------------------------|---------|
| `/boards`              | Design Boards listing — filter by role            | Client  |
| `/boards/[id]`         | Board detail — product grid, select, convert to spec | Dynamic |
| `/specifications`      | Specification Engine — project specs with progress bars | Client  |
| `/specifications/[id]` | Spec detail — room-by-room tables with item status tracking | Dynamic |

### Core Platform

| Route              | Description                                    | Type    |
|--------------------|------------------------------------------------|---------|
| `/`                | Home — Intelligence platform hero + features   | Static  |
| `/discover`        | Browse all projects with tag filters            | Static  |
| `/architects`      | Architect directory with bios and specialties   | Static  |
| `/brands`          | Brand directory with product counts             | Static  |
| `/products`        | Product library with spec download buttons      | Static  |
| `/projects/[id]`   | Project detail — gallery, tags, linked products | SSG     |
| `/dashboard`       | Analytics — views, downloads, engagement charts | Client  |
| `/brief`           | Multi-step AI brief generator wizard            | Client  |

## Navigation Structure

The navbar uses dropdown menus to organize pages:

- **Platform**: Discover, Boards, Specs, AI Brief
- **Intelligence** (dropdown): Live Activity, Architect Influence, Product Momentum, Influence Network, Analytics
- **Directory** (dropdown): Architects, Brands, Products

## Mock Data

### `src/lib/mock-data.ts` — Core Data
- `Architect` — 6 architects with specialties, bios, project counts
- `Brand` — 6 brands/suppliers with product libraries
- `Product` — 12 products with pricing, brand links, spec sheet flags
- `Project` — 6 projects with images, tags, linked products
- `AnalyticsData` — dashboard metrics, monthly charts, rankings
- `briefQuestions` — 6-step AI brief generator question flow

### `src/lib/intelligence-data.ts` — Intelligence Data
- `ActivityEvent` — 20 activity events (saves, downloads, board adds, visits, enquiries, tags)
- `ArchitectInfluence` — 6 architects with influence scores, monthly trends, influenced products/brands
- `ProductMomentum` — 8 products with momentum scores, growth metrics, weekly sparklines
- `NetworkNode` / `NetworkEdge` — 17 nodes + 23 edges for the influence network graph
- `DesignBoard` — 6 boards with products, collaborators, privacy settings
- `Specification` — 3 project specs with room-organized items and status tracking

## Email Templates

7 transactional email templates outputting HTML strings (Apple-style design):

| Template | Trigger | Badge Color |
|----------|---------|-------------|
| `onboarding.tsx` | New user signup | — |
| `engagement-alert.tsx` | Content reaches engagement threshold | — |
| `milestone.tsx` | User reaches platform milestone | — |
| `product-saved.tsx` | Product saved by architect/homeowner | Rose |
| `spec-downloaded.tsx` | Spec sheet downloaded | Blue |
| `product-trending.tsx` | Product enters surging/rising momentum | Rose/Amber |
| `enquiry-submitted.tsx` | Enquiry submitted about a product | Amber |

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Routing | Next.js App Router | File-based routing with layouts and dynamic segments |
| Styling | TailwindCSS 4 | Utility-first, no runtime CSS, fast iteration |
| Data | Mock data in TypeScript | Prototype — no backend needed yet |
| Visualizations | Custom SVG components | No chart library dependency, full control |
| Network Graph | SVG with interactive nodes | Lightweight, no D3/canvas dependency |
| Live Feed | `setInterval` simulation | Demonstrates real-time UX without WebSockets |
| Board → Spec | Selection + conversion flow | Shows full product workflow lifecycle |
| Emails | HTML string templates | Framework-agnostic, inline styles for email clients |

## Git Workflow

- Default branch: `master`
- Feature branches should be descriptive
- Write clear, descriptive commit messages

## Environment Variables

No environment variables required for the prototype.

## Future TODOs

- Connect live activity feed to WebSocket/SSE for real real-time events
- Integrate AI model for brief generation (currently static sample)
- Add authentication (NextAuth or Clerk)
- Connect to database for persistent data
- Replace placeholder images with real photography
- Add search with AI-powered project discovery
- Implement real product tagging and board saving
- Add PDF export for specification sheets
- Build API routes for data mutations
