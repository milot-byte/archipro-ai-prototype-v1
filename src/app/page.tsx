import Link from "next/link";
import { Section } from "@/components/ui/section";
import { Card, CardImage, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { projects, architects, brands } from "@/lib/mock-data";
import { ArrowRight, Sparkles, Search, Tag, BarChart3 } from "lucide-react";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-foreground text-white">
        <div className="mx-auto max-w-7xl px-6 py-32">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-neutral-400">
              AI-Powered Architecture Platform
            </p>
            <h1 className="text-5xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
              Design smarter.
              <br />
              Build better.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-neutral-300">
              Connect with top architects, discover curated products, and let AI
              guide your next build — from brief to completion.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/brief"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-foreground transition-opacity hover:opacity-90"
              >
                <Sparkles size={16} />
                Generate AI Brief
              </Link>
              <Link
                href="/discover"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:border-white"
              >
                Explore Projects
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
        {/* Abstract grid decoration */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </section>

      {/* Features strip */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-0 divide-y divide-border sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          {[
            { icon: Sparkles, label: "AI Brief Generator", desc: "Answer questions, get a design brief" },
            { icon: Search, label: "Smart Discovery", desc: "Find projects, architects & products" },
            { icon: Tag, label: "Product Tagging", desc: "Link products to real projects" },
            { icon: BarChart3, label: "Analytics", desc: "Track views & engagement" },
          ].map((f) => (
            <div key={f.label} className="px-6 py-8">
              <f.icon size={20} className="text-muted" />
              <h3 className="mt-3 text-sm font-semibold">{f.label}</h3>
              <p className="mt-1 text-xs text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Projects */}
      <Section
        title="Featured Projects"
        subtitle="Explore award-winning architecture from New Zealand's top studios."
        action={
          <Link href="/discover" className="text-sm text-muted hover:text-foreground transition-colors flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        }
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.slice(0, 3).map((project) => (
            <Card key={project.id} href={`/projects/${project.id}`}>
              <CardImage src={project.images[0]} alt={project.title} />
              <CardBody>
                <p className="text-xs text-muted">{project.architect}</p>
                <h3 className="mt-1 text-base font-semibold tracking-tight">
                  {project.title}
                </h3>
                <p className="mt-1 text-xs text-muted">{project.location}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </Section>

      {/* Architects */}
      <Section
        title="Top Architects"
        subtitle="Meet the studios shaping New Zealand's built environment."
        className="bg-card"
        action={
          <Link href="/architects" className="text-sm text-muted hover:text-foreground transition-colors flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        }
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {architects.slice(0, 3).map((arch) => (
            <Card key={arch.id}>
              <CardBody className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={arch.avatar}
                  alt={arch.name}
                  className="h-14 w-14 rounded-full bg-card object-cover"
                />
                <div>
                  <h3 className="text-sm font-semibold">{arch.name}</h3>
                  <p className="text-xs text-muted">{arch.firm}</p>
                  <p className="text-xs text-muted">{arch.location}</p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </Section>

      {/* Brands */}
      <Section
        title="Featured Brands"
        subtitle="Discover products from leading architecture suppliers."
        action={
          <Link href="/brands" className="text-sm text-muted hover:text-foreground transition-colors flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        }
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {brands.slice(0, 3).map((brand) => (
            <Card key={brand.id}>
              <CardImage src={brand.coverImage} alt={brand.name} aspect="wide" />
              <CardBody className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="h-10 w-10 rounded-lg bg-foreground object-cover"
                />
                <div>
                  <h3 className="text-sm font-semibold">{brand.name}</h3>
                  <p className="text-xs text-muted">
                    {brand.category} &middot; {brand.productCount} products
                  </p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="bg-foreground text-white">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Ready to start your project?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-neutral-400">
            Let our AI generate a personalised design brief in minutes — no
            architectural experience needed.
          </p>
          <Link
            href="/brief"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-medium text-foreground transition-opacity hover:opacity-90"
          >
            <Sparkles size={16} />
            Start your brief
          </Link>
        </div>
      </section>
    </>
  );
}
