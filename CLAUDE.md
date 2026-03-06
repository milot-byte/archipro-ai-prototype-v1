# CLAUDE.md

## Project Overview

**ArchiPro AI** — AI-powered architecture platform prototype. A modern SaaS connecting homeowners, architects, and brands with AI-driven tools for design briefs, project discovery, and product tagging.

This is a frontend prototype with mock data. Backend functionality is simulated.

## Repository Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout (navbar + footer)
│   ├── page.tsx                # Home page
│   ├── discover/page.tsx       # Browse architecture projects
│   ├── architects/page.tsx     # Architect directory
│   ├── brands/page.tsx         # Brand/supplier directory
│   ├── products/page.tsx       # Product library with spec downloads
│   ├── projects/[id]/page.tsx  # Individual project page (dynamic route)
│   ├── dashboard/page.tsx      # Analytics dashboard
│   └── brief/page.tsx          # AI design brief generator
├── components/
│   └── ui/                     # Reusable UI components
│       ├── navbar.tsx           # Sticky navigation bar
│       ├── footer.tsx           # Site footer
│       ├── card.tsx             # Card, CardImage, CardBody
│       ├── badge.tsx            # Tag/label badge
│       ├── section.tsx          # Page section wrapper
│       ├── page-header.tsx      # Page title header
│       └── stat-card.tsx        # Analytics stat card
├── lib/
│   └── mock-data.ts            # All mock data + TypeScript interfaces
├── emails/                     # Transactional email templates (HTML)
│   ├── onboarding.tsx          # Welcome email
│   ├── engagement-alert.tsx    # Engagement notification
│   └── milestone.tsx           # Milestone achievement
└── styles/
    └── globals.css             # Global styles + Tailwind theme
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
- **File naming**: Kebab-case for files (e.g., `page-header.tsx`, `mock-data.ts`)
- **Imports**: Use `@/*` path alias (maps to `src/*`)
- **Client components**: Mark with `"use client"` only when using hooks/interactivity
- **Images**: Using `placehold.co` placeholder images — replace with real assets in production
- Do not commit secrets, API keys, or credentials — use environment variables

## Design System

The UI follows a strict black/white/grey palette with an Apple-inspired minimalist aesthetic:

- **Theme tokens** are defined in `src/styles/globals.css` under `@theme`
- **Rounded corners**: `rounded-2xl` (16px) for cards and containers
- **Spacing**: Consistent use of Tailwind spacing scale
- **Cards**: `Card` / `CardImage` / `CardBody` composable pattern in `components/ui/card.tsx`
- **Hover effects**: Subtle shadow (`hover:shadow-lg`) and scale (`group-hover:scale-105`) on cards

## Pages

| Route              | Description                                    | Type    |
|--------------------|------------------------------------------------|---------|
| `/`                | Home — hero, featured projects/architects/brands | Static  |
| `/discover`        | Browse all projects with tag filters            | Static  |
| `/architects`      | Architect directory with bios and specialties   | Static  |
| `/brands`          | Brand directory with product counts             | Static  |
| `/products`        | Product library with spec download buttons      | Static  |
| `/projects/[id]`   | Project detail — gallery, tags, linked products | SSG     |
| `/dashboard`       | Analytics — views, downloads, engagement charts | Client  |
| `/brief`           | Multi-step AI brief generator wizard            | Client  |

## Mock Data

All mock data lives in `src/lib/mock-data.ts` and includes TypeScript interfaces for:
- `Architect` — profiles with specialties, bio, project counts
- `Brand` — suppliers with product libraries
- `Product` — items with pricing, brand links, spec sheet flags
- `Project` — architecture projects with images, tags, linked products
- `AnalyticsData` — dashboard metrics and chart data
- `briefQuestions` — AI brief generator question flow

## Git Workflow

- Default branch: `master`
- Feature branches should be descriptive (e.g., `feature/chat-interface`, `fix/prompt-handling`)
- Write clear, descriptive commit messages

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Routing | Next.js App Router | Modern file-based routing with layouts |
| Styling | TailwindCSS 4 | Utility-first, no runtime CSS, fast iteration |
| Data | Mock data in TypeScript | Prototype — no backend needed yet |
| Images | placehold.co | Fast prototyping without asset management |
| Icons | Lucide React | Lightweight, tree-shakeable icon set |
| Emails | HTML string templates | Simple, no email framework dependency |

## Environment Variables

No environment variables required for the prototype. When integrating real AI/backend services, add:

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | For AI brief generation (future) | No |
| `DATABASE_URL` | Database connection (future) | No |

## Future TODOs

- Integrate real AI model for brief generation (currently uses a static sample)
- Add authentication (NextAuth or Clerk)
- Connect to a database for real data
- Replace placeholder images with real photography
- Add search functionality with AI-powered project discovery
- Implement product tagging system with real linking
- Build out API routes for data mutations
